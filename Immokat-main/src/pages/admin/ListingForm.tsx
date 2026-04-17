import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { omsupabase as supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";

const communes = [
  "Lubumbashi", "Kampemba", "Kamalondo", "Kenya", "Katuba", "Annexe", "Ruashi",
  "Dilala", "Manika", "Kanina",
  "Panda", "Kikula", "Likasi-Centre",
];

const cities = ["Lubumbashi", "Kolwezi", "Likasi"];

export default function ListingForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    type: "vente",
    property_type: "maison",
    commune: "",
    city: "Lubumbashi",
    bedrooms: "0",
    bathrooms: "0",
    area: "",
    address: "",
    featured: false,
    contact_phone: "",
    contact_name: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Load existing listing for edit
  const { data: existing } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description,
        price: String(existing.price),
        type: existing.type,
        property_type: existing.property_type,
        commune: existing.commune,
        city: existing.city,
        bedrooms: String(existing.bedrooms || 0),
        bathrooms: String(existing.bathrooms || 0),
        area: String(existing.area),
        address: existing.address || "",
        featured: existing.featured || false,
        contact_phone: existing.contact_phone || "",
        contact_name: existing.contact_name || "",
      });
      setImages(existing.images || []);
    }
  }, [existing]);

  const MAX_IMAGES = 4;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error("Maximum 4 photos par annonce");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.info(`Seules ${remaining} photo(s) seront ajoutées (max ${MAX_IMAGES})`);
    }

    setUploading(true);
    const newImages: string[] = [];

    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from("listing-images").upload(path, file);
      if (error) {
        toast.error(`Erreur upload: ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
      newImages.push(urlData.publicUrl);
    }

    setImages((prev) => [...prev, ...newImages]);
    setUploading(false);
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((i) => i !== url));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseInt(form.price),
        type: form.type,
        property_type: form.property_type,
        commune: form.commune || "",
        city: form.city,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        area: parseInt(form.area) || 0,
        address: form.address.trim() || null,
        featured: form.featured,
        images,
        contact_phone: form.contact_phone.trim() || null,
        contact_name: form.contact_name.trim() || null,
      };

      if (isEditing) {
        const { error } = await supabase.from("listings").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("listings").insert(payload).select().single();
        if (error) throw error;
        
        // Notify all subscribers about the new listing
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          await supabase.functions.invoke("notify-new-listing", {
            body: { listing: data },
            headers: session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : undefined,
          });
        } catch (e) {
          console.error("Notification error:", e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success(isEditing ? "Annonce modifiée" : "Annonce créée");
      navigate("/admin/listings");
    },
    onError: (err) => {
      toast.error("Erreur: " + (err as Error).message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    if (!form.price) {
      toast.error("Le prix est obligatoire");
      return;
    }
    saveMutation.mutate();
  };

  const updateField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-foreground">
        {isEditing ? "Modifier l'annonce" : "Nouvelle annonce"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Villa moderne à Lubumbashi" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5} placeholder="Description détaillée du bien..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type de transaction</Label>
                <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vente">Vente</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type de bien</Label>
                <Select value={form.property_type} onValueChange={(v) => updateField("property_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maison">Maison</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="appartement">Appartement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Prix ($) *</Label>
                <Input type="number" value={form.price} onChange={(e) => updateField("price", e.target.value)} placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label>Surface (m²)</Label>
                <Input type="number" value={form.area} onChange={(e) => updateField("area", e.target.value)} placeholder="250" />
              </div>
              <div className="space-y-2">
                <Label>Chambres</Label>
                <Input type="number" value={form.bedrooms} onChange={(e) => updateField("bedrooms", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Salles de bain</Label>
                <Input type="number" value={form.bathrooms} onChange={(e) => updateField("bathrooms", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Select value={form.city} onValueChange={(v) => updateField("city", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commune</Label>
                <Select value={form.commune} onValueChange={(v) => updateField("commune", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {communes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Avenue Kasavubu, n°42" />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Photos</span>
              <span className="text-sm font-normal text-muted-foreground">{images.length}/{MAX_IMAGES}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Ajoutez jusqu'à 4 photos du bien (optionnel)</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {images.map((url) => (
                <div key={url} className="group relative aspect-video overflow-hidden rounded-md border border-border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Supprimer l'image"
                  >
                    <X className="h-3 w-3 text-destructive-foreground" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="mt-1 text-xs text-muted-foreground">Ajouter ({MAX_IMAGES - images.length} restante{MAX_IMAGES - images.length > 1 ? "s" : ""})</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact & options */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom du contact</Label>
                <Input value={form.contact_name} onChange={(e) => updateField("contact_name", e.target.value)} placeholder="Jean Mukendi" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={form.contact_phone} onChange={(e) => updateField("contact_phone", e.target.value)} placeholder="+243 XXX XXX XXX" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.featured} onCheckedChange={(v) => updateField("featured", v)} />
              <Label>Mettre en vedette</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
            ) : (
              isEditing ? "Modifier l'annonce" : "Créer l'annonce"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/listings")}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
