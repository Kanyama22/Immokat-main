import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

import imgMaison from "@/assets/Maison.jpg";
import imgTerrain from "@/assets/Terrain.jpg";
import imgAppart from "@/assets/Appartement.jpg";

const fallbackByType: Record<string, string> = {
  maison: imgMaison,
  terrain: imgTerrain,
  appartement: imgAppart,
};

type DbListing = Tables<"listings">;

interface Props {
  listing: DbListing;
  index?: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price) + " $";
}

const ListingCard = forwardRef<HTMLDivElement, Props>(({ listing, index = 0 }, ref) => {
  const img =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : (fallbackByType[listing.property_type] ?? imgMaison);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/annonces/${listing.id}`}
        className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-[var(--shadow-primary)] hover:border-primary/30"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={img}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              {listing.type === "vente" ? "Vente" : "Location"}
            </span>
            <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium text-white capitalize backdrop-blur-sm">
              {listing.property_type}
            </span>
          </div>
          <button
            className="absolute top-3 right-3 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-primary/20"
            onClick={(e) => {
              e.preventDefault();
            }}
            title="Ajouter aux favoris"
          >
            <Heart size={16} className="text-white" />
          </button>
          <div className="absolute bottom-3 left-3">
            <span className="font-display text-lg font-bold text-primary">
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} />
            <span>{listing.commune}, {listing.city}</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            {listing.bedrooms != null && listing.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed size={12} /> {listing.bedrooms} ch.
              </span>
            )}
            {listing.bathrooms != null && listing.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath size={12} /> {listing.bathrooms} sdb.
              </span>
            )}
            <span className="flex items-center gap-1">
              <Maximize size={12} /> {listing.area} m²
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

ListingCard.displayName = "ListingCard";

export default ListingCard;
