import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const formatPrice = (price: number): string => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M $`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}k $`;
  return `${price} $`;
};

const buildEmailHtml = (name: string, listing: Record<string, unknown>, siteUrl: string): string => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: linear-gradient(135deg, #c8952e, #dbb455); padding: 24px; text-align: center;">
      <h1 style="color: #111; margin: 0; font-size: 24px;">🏠 Nouvelle annonce sur Eden City</h1>
    </div>
    <div style="padding: 24px;">
      <p style="color: #333; font-size: 16px;">Bonjour ${name},</p>
      <p style="color: #555; font-size: 14px;">Une nouvelle annonce vient d'être publiée sur Eden City :</p>
      <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #c8952e;">
        <h2 style="color: #111; margin: 0 0 8px; font-size: 18px;">${listing.title}</h2>
        <p style="color: #555; margin: 4px 0; font-size: 14px;">📍 ${listing.commune}, ${listing.city}</p>
        <p style="color: #555; margin: 4px 0; font-size: 14px;">🏷️ ${listing.property_type} — ${listing.type}</p>
        <p style="color: #555; margin: 4px 0; font-size: 14px;">📐 ${listing.area} m²</p>
        <p style="color: #c8952e; font-weight: bold; font-size: 20px; margin: 12px 0 0;">${formatPrice(listing.price as number)}</p>
      </div>
      <a href="${siteUrl}/annonces/${listing.id}" style="display: inline-block; background: linear-gradient(135deg, #c8952e, #dbb455); color: #111; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 8px;">
        Voir l'annonce
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        Vous recevez cet email car vous avez un compte Eden City.<br>
        Pour ne plus recevoir ces notifications, contactez-nous.
      </p>
    </div>
  </div>
</body>
</html>
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { listing } = await req.json();

    if (!listing) {
      return new Response(JSON.stringify({ error: "No listing provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all Eden City users with an email address
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email, full_name");

    if (profilesError) {
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No registered users found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipients = profiles.filter((p) => !!p.email);

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No valid recipient emails found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://maison-cle-en-main.lovable.app";

    if (!resendApiKey) {
      // No email service configured — log for debugging
      console.warn("RESEND_API_KEY not set. Emails not sent. Recipients:", recipients.map((p) => p.email));
      return new Response(
        JSON.stringify({ message: `RESEND_API_KEY not configured. ${recipients.length} user(s) would have been notified.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = await Promise.allSettled(
      recipients.map(async (profile) => {
        const name = profile.full_name || "Cher utilisateur";
        const html = buildEmailHtml(name, listing, siteUrl);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Eden City <notifications@eden-city.immo>",
            to: [profile.email],
            subject: `🏠 Nouvelle annonce : ${listing.title}`,
            html,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Resend error for ${profile.email}: ${body}`);
        }

        return { email: profile.email, sent: true };
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      console.error("Some emails failed:", results.filter((r) => r.status === "rejected"));
    }

    return new Response(
      JSON.stringify({ message: `Emails envoyés : ${sent}, échecs : ${failed}`, sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
