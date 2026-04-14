import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Loader2, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const getFriendlyAuthError = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials")) {
      return "Identifiants incorrects. Vérifiez votre email et mot de passe.";
    }
    if (lower.includes("email not confirmed")) {
      return "Votre email n'est pas encore confirmé. Vérifiez votre boîte mail.";
    }
    return message;
  };

  useEffect(() => {
    const hash = window.location.hash;
    const search = new URLSearchParams(window.location.search);
    const hasRecoveryInUrl = hash.includes("type=recovery") || search.get("type") === "recovery";

    if (hasRecoveryInUrl) {
      setRecoveryMode(true);
      setInfo("Définissez votre nouveau mot de passe.");
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        setInfo("Définissez votre nouveau mot de passe.");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(getFriendlyAuthError(error.message));
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Saisissez votre email pour recevoir le lien de réinitialisation.");
      return;
    }

    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/admin/login`,
    });

    if (error) {
      setError(getFriendlyAuthError(error.message));
    } else {
      setInfo("Lien de réinitialisation envoyé. Vérifiez votre boîte mail.");
    }
    setResetLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError("Impossible de mettre à jour le mot de passe.");
    } else {
      setInfo("Mot de passe mis à jour. Vous pouvez vous connecter.");
      setRecoveryMode(false);
      setNewPassword("");
      setConfirmPassword("");
      window.history.replaceState({}, document.title, "/admin/login");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Home size={14} />
            Retour au site
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
            Administration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connectez-vous pour accéder au panel admin
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              {recoveryMode ? "Nouveau mot de passe" : "Connexion Admin"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recoveryMode ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-9"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                {info && (
                  <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                    {info}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer le nouveau mot de passe
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs text-primary hover:underline disabled:opacity-60"
                >
                  {resetLoading ? "Envoi en cours..." : "Mot de passe oublié ?"}
                </button>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {info && (
                <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                  {info}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Se connecter
              </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
