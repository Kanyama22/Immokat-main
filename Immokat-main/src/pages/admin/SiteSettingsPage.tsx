import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Image as ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import heroDefault from "@/assets/Arrière plan.jpg";

export default function SiteSettingsPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: heroUrl, isLoading } = useQuery<string>({
    queryKey: ["site-settings", "hero_image_url"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image_url")
        .maybeSingle();
      return data?.value || "";
    },
  });

  const updateHero = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "hero_image_url", value: url });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["hero-image"] });
      toast.success("Arrière-plan mis à jour !");
    },
    onError: (err) => toast.error("Erreur : " + (err as Error).message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `hero/hero-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("listing-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erreur upload : " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
    await updateHero.mutateAsync(urlData.publicUrl);
    setUploading(false);
    e.target.value = "";
  };

  const handleReset = () => {
    updateHero.mutate("");
  };

  const displayImage = heroUrl || heroDefault;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Apparence du site</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon size={16} className="text-primary" />
            Arrière-plan de la page d'accueil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aperçu */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            {isLoading ? (
              <div className="flex h-full items-center justify-center bg-muted">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <img
                  src={displayImage}
                  alt="Arrière-plan actuel"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-xs text-white">
                  {heroUrl ? "Image personnalisée" : "Image par défaut"}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button
                type="button"
                disabled={uploading}
                onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement).click()}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Envoi en cours…" : "Changer l'image"}
              </Button>
            </label>

            {heroUrl && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={updateHero.isPending}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remettre l'image par défaut
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["site-settings"] })}
            >
              <RefreshCw size={14} />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Formats acceptés : JPG, PNG, WEBP. Taille recommandée : 1920×1080 px ou plus.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
