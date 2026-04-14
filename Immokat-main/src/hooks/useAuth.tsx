import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const adminCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) {
        console.warn("[checkAdmin] error:", error.message);
        setIsAdmin(false);
      } else {
        console.log("[checkAdmin] result for", userId, ":", data);
        setIsAdmin(!!data);
      }
    } catch (e) {
      console.error("[checkAdmin] exception:", e);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Mettre à jour user/session de façon synchrone (sans appeler Supabase)
        setSession(session);
        setUser(session?.user ?? null);

        // Annuler un éventuel check précédent
        if (adminCheckTimeout.current) clearTimeout(adminCheckTimeout.current);

        if (session?.user) {
          setLoading(true);
          // Différer l'appel Supabase hors du verrou interne d'onAuthStateChange
          adminCheckTimeout.current = setTimeout(() => {
            checkAdmin(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (adminCheckTimeout.current) clearTimeout(adminCheckTimeout.current);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
