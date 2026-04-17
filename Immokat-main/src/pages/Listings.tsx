import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { omsupabase as supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import SearchFilters from "@/components/SearchFilters";
import { Loader2 } from "lucide-react";

export default function Listings() {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    propertyType: searchParams.get("propertyType") || "",
    commune: searchParams.get("commune") || "",
    query: searchParams.get("q") || "",
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (filters.type && l.type !== filters.type) return false;
      if (filters.propertyType && l.property_type !== filters.propertyType) return false;
      if (filters.commune && l.commune !== filters.commune) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        if (
          !l.title.toLowerCase().includes(q) &&
          !l.commune.toLowerCase().includes(q) &&
          !l.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [filters, listings]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Annonces immobilières
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-6">
          <SearchFilters filters={filters} onChange={setFilters} />
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Aucune annonce ne correspond à vos critères.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
