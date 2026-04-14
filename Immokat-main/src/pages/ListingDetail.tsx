import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewSection from "@/components/ReviewSection";
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Calendar, Phone, MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import imgMaison from "@/assets/Maison.jpg";
import imgTerrain from "@/assets/Terrain.jpg";
import imgAppart from "@/assets/Appartement.jpg";

const fallbackByType: Record<string, string> = {
  maison: imgMaison,
  terrain: imgTerrain,
  appartement: imgAppart,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price) + " $";
}

export default function ListingDetail() {
  const { id } = useParams();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex min-h-[60vh] items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex min-h-[60vh] items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Annonce introuvable</h1>
            <Link to="/annonces" className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
              <ArrowLeft size={14} /> Retour aux annonces
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const mainImage =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : (fallbackByType[listing.property_type] ?? imgMaison);

  const allImages =
    listing.images && listing.images.length > 0
      ? listing.images
      : [mainImage];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-20 pb-20">
        <Link
          to="/annonces"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Retour aux annonces
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden rounded-lg"
            >
              <img
                src={mainImage}
                alt={listing.title}
                className="aspect-video w-full object-cover"
              />
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {allImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${listing.title} - ${i + 1}`}
                    className="aspect-video w-full rounded-md object-cover border border-border"
                  />
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {listing.type === "vente" ? "Vente" : "Location"}
                </span>
                <span className="rounded bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground capitalize">
                  {listing.property_type}
                </span>
              </div>

              <h1 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {listing.title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} />
                <span>{listing.commune}, {listing.city}</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
                {listing.bedrooms != null && listing.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bed size={16} className="text-primary" />
                    <span>{listing.bedrooms} chambre{listing.bedrooms > 1 ? "s" : ""}</span>
                  </div>
                )}
                {listing.bathrooms != null && listing.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath size={16} className="text-primary" />
                    <span>{listing.bathrooms} salle{listing.bathrooms > 1 ? "s" : ""} de bain</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Maximize size={16} className="text-primary" />
                  <span>{listing.area} m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span>Publié le {new Date(listing.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="font-display text-lg font-semibold text-foreground">Description</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              <ReviewSection listingId={listing.id} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-20 rounded-lg border border-border bg-card p-6">
              <div className="text-center">
                <span className="font-display text-3xl font-bold text-gradient-gold">
                  {formatPrice(listing.price)}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {listing.contact_phone && (
                  <a
                    href={`tel:${listing.contact_phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                  >
                    <Phone size={16} />
                    {listing.contact_name ? `Appeler ${listing.contact_name}` : "Appeler le vendeur"}
                  </a>
                )}
                <a
                  href={`https://wa.me/${listing.contact_phone?.replace(/[^0-9]/g, "") || "243818416419"}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par l'annonce "${listing.title}" sur Immolu.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-surface-hover"
                >
                  <MessageCircle size={16} />
                  Envoyer un message WhatsApp
                </a>
              </div>

              <div className="mt-6 rounded-md bg-secondary/50 p-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Détails</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium text-foreground capitalize">{listing.property_type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Transaction</dt>
                    <dd className="font-medium text-foreground capitalize">{listing.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Surface</dt>
                    <dd className="font-medium text-foreground">{listing.area} m²</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Commune</dt>
                    <dd className="font-medium text-foreground">{listing.commune}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Ville</dt>
                    <dd className="font-medium text-foreground">{listing.city}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
