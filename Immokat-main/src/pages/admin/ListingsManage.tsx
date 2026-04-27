import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { omsupabase as supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ListingsManage() {
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Annonce supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase.from("listings").update({ featured: !featured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Mis à jour");
    },
  });

  const formatPrice = (p: number) => {
    if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1)}M $`;
    if (p >= 1_000) return `${(p / 1_000).toFixed(0)}k $`;
    return `${p} $`;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Gestion des annonces</h1>
          <p className="mt-1 text-sm text-muted-foreground">{listings.length} annonce(s)</p>
        </div>
        <Button asChild>
          <Link to="/admin/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Commune</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Vedette</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">{l.title}</TableCell>
                  <TableCell>
                    <Badge variant={l.type === "vente" ? "default" : "secondary"}>
                      {l.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{l.commune}</TableCell>
                  <TableCell>{formatPrice(l.price)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleFeatured.mutate({ id: l.id, featured: !!l.featured })}
                      className="transition-colors"
                      title={l.featured ? "Retirer des favoris" : "Mettre en avant"}
                      aria-label={l.featured ? "Retirer des favoris" : "Mettre en avant"}
                    >
                      <Star
                        className={`h-4 w-4 ${l.featured ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        title={l.featured ? "Retirer des favoris" : "Mettre en avant"}
                        aria-label={l.featured ? "Retirer des favoris" : "Mettre en avant"}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/admin/listings/${l.id}/edit`}>
                          <Edit className="h-4 w-4" title="Modifier" aria-label="Modifier" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Supprimer cette annonce ?")) {
                            deleteMutation.mutate(l.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" title="Supprimer" aria-label="Supprimer" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {listings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Aucune annonce. Créez votre première annonce !
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
