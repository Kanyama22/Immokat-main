import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { omsupabase as supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Star, Trash2, CheckCircle, XCircle, Loader2, MessageSquare, Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Review = {
  id: string;
  listing_id: string;
  user_id: string;
  author_name: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  listings?: { title: string } | null;
};

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= value ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}
        />
      ))}
    </div>
  );
}

const statusBadge = {
  pending:  { label: "En attente",  variant: "secondary"    as const },
  approved: { label: "Approuvé",    variant: "default"      as const },
  rejected: { label: "Rejeté",      variant: "destructive"  as const },
};

export default function ReviewsManage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: reviews = [], isLoading, error: reviewsError, refetch } = useQuery<Review[]>({
    queryKey: ["admin-reviews", filter],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*, listings(title)")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
  });

  const tableNotFound =
    reviewsError instanceof Error &&
    (reviewsError.message.includes("PGRST200") ||
      reviewsError.message.includes("PGRST205") ||
      reviewsError.message.includes("reviews") ||
      reviewsError.message.includes("relation"));

  const updateStatus = useMutation<void, Error, { id: string; status: "approved" | "rejected" }>({
    mutationFn: async ({ id, status }) => {
      setProcessingId(id);
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.status === "approved" ? "Avis approuvé." : "Avis rejeté.");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err) => toast.error("Erreur : " + err.message),
    onSettled: () => setProcessingId(null),
  });

  const deleteReview = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      setProcessingId(id);
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Avis supprimé.");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err) => toast.error("Erreur : " + err.message),
    onSettled: () => setProcessingId(null),
  });

  const deleteRejected = useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").delete().eq("status", "rejected");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Avis rejetés supprimés.");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err) => toast.error("Erreur : " + err.message),
  });

  const setupTable = useMutation<void, Error, void>({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("setup-reviews", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      toast.success("Table reviews créée ! Rechargement…");
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: (err) => toast.error("Erreur setup : " + err.message),
  });

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

  // --- TABLE NOT FOUND STATE ---
  if (tableNotFound) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Avis clients</h1>
        <div className="mt-8 rounded-lg border border-amber-500/40 bg-amber-500/10 p-6">
          <div className="flex items-start gap-3">
            <Database size={20} className="mt-0.5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">La table des avis n'existe pas encore</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cliquez sur le bouton ci-dessous pour créer automatiquement la table reviews dans
                votre base de données Supabase.
              </p>
              <Button
                className="mt-4"
                onClick={() => setupTable.mutate()}
                disabled={setupTable.isPending}
              >
                {setupTable.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer la table reviews
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl font-bold text-foreground">Avis clients</h1>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-600">
              {pendingCount} en attente
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            title="Actualiser"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>

          {rejectedCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={deleteRejected.isPending}
                >
                  {deleteRejected.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  <Trash2 size={14} className="mr-1" />
                  Supprimer les rejetés ({rejectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer tous les avis rejetés ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Les <strong>{rejectedCount}</strong> avis rejetés seront supprimés définitivement.
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteRejected.mutate()}
                  >
                    Supprimer tous
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les avis</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvés</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-muted-foreground">
          <MessageSquare size={40} strokeWidth={1.5} />
          <p className="text-sm">Aucun avis trouvé.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => {
            const busy = processingId === review.id;

            return (
              <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Contenu */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{review.author_name}</span>
                      <StarDisplay value={review.rating} />
                      <Badge variant={statusBadge[review.status].variant} className="text-xs">
                        {statusBadge[review.status].label}
                      </Badge>
                    </div>
                    {review.listings?.title && (
                      <Link
                        to={`/annonces/${review.listing_id}`}
                        target="_blank"
                        className="mt-0.5 block truncate text-xs text-primary hover:underline"
                      >
                        {review.listings.title}
                      </Link>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.content}</p>
                    <time className="mt-1 block text-xs text-muted-foreground/60">
                      {new Date(review.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric", month: "long", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </time>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {review.status !== "approved" && (
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={busy}
                        onClick={() => updateStatus.mutate({ id: review.id, status: "approved" })}
                        title="Approuver"
                        className="h-8 w-8 text-green-600 border-green-600/30 hover:bg-green-600/10"
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={busy}
                        onClick={() => updateStatus.mutate({ id: review.id, status: "rejected" })}
                        title="Rejeter"
                        className="h-8 w-8 text-amber-600 border-amber-600/30 hover:bg-amber-600/10"
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      </Button>
                    )}

                    {/* Suppression avec confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={busy}
                          title="Supprimer"
                          className="h-8 w-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cet avis ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            L'avis de <strong>{review.author_name}</strong> sera supprimé définitivement.
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteReview.mutate(review.id)}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
