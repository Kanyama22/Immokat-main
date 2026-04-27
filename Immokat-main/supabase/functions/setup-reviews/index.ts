declare const process: any;
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Full idempotent SQL applied via service-role exec_sql RPC
const SETUP_SQL = `
DO $$
BEGIN
  -- reviews table
  CREATE TABLE IF NOT EXISTS public.reviews (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id   UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
    author_name  TEXT        NOT NULL,
    content      TEXT        NOT NULL,
    rating       INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    status       TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

  GRANT SELECT ON public.reviews TO anon, authenticated;
  GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

  -- user_roles: allow each user to see their own role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_roles' AND policyname='Users can view own role'
  ) THEN
    CREATE POLICY "Users can view own role"
      ON public.user_roles FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Drop & re-create reviews policies for consistency
  DROP POLICY IF EXISTS "View approved reviews"       ON public.reviews;
  DROP POLICY IF EXISTS "Users can view own reviews"  ON public.reviews;
  DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Users can insert reviews"    ON public.reviews;
  DROP POLICY IF EXISTS "Admins can update reviews"   ON public.reviews;
  DROP POLICY IF EXISTS "Admins can delete reviews"   ON public.reviews;

  CREATE POLICY "View approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved');

  CREATE POLICY "Users can view own reviews"
    ON public.reviews FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Admins can view all reviews"
    ON public.reviews FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

  CREATE POLICY "Users can insert reviews"
    ON public.reviews FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

  CREATE POLICY "Admins can update reviews"
    ON public.reviews FOR UPDATE TO authenticated
    USING  (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

  CREATE POLICY "Admins can delete reviews"
    ON public.reviews FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

  DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
  CREATE POLICY "Users can delete own reviews"
    ON public.reviews FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
END
$$;
`;

// Remplacement de Deno.serve par une fonction exportée compatible Node.js
// Types génériques pour req/res Node.js
// @ts-expect-error: Node.js type import for API handler
import { IncomingMessage, ServerResponse } from 'http';
// Forcer l'import de process pour Node.js

import postgres from 'postgres';
export default async function handler(req: IncomingMessage & { method?: string; headers: Record<string, string | string[] | undefined>; }, res: ServerResponse) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    // Verify caller is an authenticated admin
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      res.writeHead(401, { ...corsHeaders, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Non autorisé" }));
      return;
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      res.writeHead(401, { ...corsHeaders, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Non autorisé" }));
      return;
    }

    // Use service-role client to bypass RLS for the admin check here
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleRow } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      res.writeHead(403, { ...corsHeaders, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Accès refusé : rôle admin requis" }));
      return;
    }

    // Try direct postgres first, fall back to exec_sql RPC
    const dbUrl = process.env.SUPABASE_DB_URL;
    if (dbUrl) {
      try {
        const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false }, max: 1 });
        await sql.unsafe(SETUP_SQL);
        await sql.end();
      } catch (pgErr) {
        if (pgErr && typeof pgErr === 'object' && 'message' in pgErr) {
          console.warn("postgres.js failed, trying exec_sql RPC:", (pgErr as Error).message);
        } else {
          console.warn("postgres.js failed, trying exec_sql RPC:", pgErr);
        }
        // Fallback: exec_sql RPC (must exist in the project)
        const { error: rpcErr } = await serviceClient.rpc("exec_sql", { query: SETUP_SQL });
        if (rpcErr) throw new Error("exec_sql: " + rpcErr.message);
      }
    } else {
      // No direct DB URL — try exec_sql RPC
      const { error: rpcErr } = await serviceClient.rpc("exec_sql" as never, { query: SETUP_SQL });
      if (rpcErr) throw new Error("exec_sql RPC non disponible. Appliquez la migration manuellement.");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Table reviews configurée avec succès." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("setup-reviews error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
