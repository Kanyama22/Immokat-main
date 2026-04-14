import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Props {
  listingId: string;
}

type Review = {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user_id: string;
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          <Star
            size={20}
            className={
              star <= (hovered || value)
                ? "fill-primary text-primary"
                : "fill-muted text-muted-foreground"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ listingId }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  // Approved reviews visible to all
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["reviews", listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, author_name, content, rating, status, created_at, user_id")
        .eq("listing_id", listingId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
    retry: false,
  });

  // Current user's own review — single query covering all statuses
  const { data: userReview, isLoading: userReviewLoading } = useQuery<{
    id: string;
    status: "pending" | "approved" | "rejected";
  } | null>({
    queryKey: ["user-review", listingId, user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, status")
        .eq("listing_id", listingId)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.warn("reviews query error:", error.message);
        return null;
      }
      return data as { id: string; status: "pending" | "approved" | "rejected" } | null;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("reviews").insert({
        listing_id: listingId,
        user_id: user.id,
        author_name:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Utilisateur",
        content: content.trim(),
        rating,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Votre avis a été envoyé et sera publié après validation.");
      setContent("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", listingId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", listingId, user?.id] });
    },
    onError: (err: Error) => {
      console.error("[ReviewSection] submit error:", err);
      toast.error("Erreur : " + (err.message ?? "inconnue"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Votre avis a été retiré.");
      queryClient.invalidateQueries({ queryKey: ["reviews", listingId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", listingId, user?.id] });
    },
    onError: (err: Error) => toast.error("Erreur : " + err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Veuillez écrire un commentaire.");
      return;
    }
    submitMutation.mutate();
  };

  const showForm = user && !userReviewLoading && !userReview;
  const showPending = userReview?.status === "pending";
  const showApproved = userReview?.status === "approved";

  return (
    <div className="mt-10">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <MessageSquare size={18} className="text-primary" />
        Avis des clients
        {reviews.length > 0 && (
          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
            {reviews.length}
          </span>
        )}
      </h2>

      {/* Liste des avis approuvés */}
      {isLoading ? (
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Aucun avis pour le moment. Soyez le premier à donner votre avis !
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.author_name}</p>
                  <StarRating value={r.rating} />
                </div>
                <time className="whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("fr-FR")}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.content}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Bannière : avis en attente */}
      {showPending && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <Clock size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Votre avis est en attente de validation par un administrateur.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
              disabled={cancelMutation.isPending}
              onClick={() => userReview && cancelMutation.mutate(userReview.id)}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : null}
              Retirer mon avis
            </Button>
          </div>
        </div>
      )}

      {/* Bannière : avis approuvé */}
      {showApproved && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" />
          <p className="text-sm text-green-600 dark:text-green-400">
            Votre avis a été publié. Merci pour votre contribution !
          </p>
        </div>
      )}

      {/* Formulaire de soumission */}
      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-lg border border-border bg-card p-4"
        >
          <h3 className="text-sm font-semibold text-foreground">Laisser un avis</h3>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Note</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <Textarea
              placeholder="Partagez votre expérience avec cette annonce…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {content.length}/1000
            </p>
          </div>
          <Button type="submit" disabled={submitMutation.isPending} size="sm">
            {submitMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Envoyer mon avis
          </Button>
        </form>
      ) : !user ? (
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/connexion" className="text-primary underline underline-offset-2">
            Connectez-vous
          </Link>{" "}
          pour laisser un avis.
        </p>
      ) : null}
    </div>
  );
}

