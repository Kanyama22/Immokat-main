import { useQuery } from "@tanstack/react-query";
import { omsupabase as supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, MapPin, TrendingUp, Users, Building, LandPlot, Star, DollarSign } from "lucide-react";

export default function StatsPage() {
  const { data: listings = [] } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data } = await supabase.from("listings").select("*");
      return data || [];
    },
  });

  const totalListings = listings.length;
  const ventCount = listings.filter((l) => l.type === "vente").length;
  const locationCount = listings.filter((l) => l.type === "location").length;
  const maisonCount = listings.filter((l) => l.property_type === "maison").length;
  const terrainCount = listings.filter((l) => l.property_type === "terrain").length;
  const appartCount = listings.filter((l) => l.property_type === "appartement").length;
  const villaCount = listings.filter((l) => l.property_type === "villa").length;
  const featuredCount = listings.filter((l) => l.featured).length;

  const communes = [...new Set(listings.map((l) => l.commune))];
  const cities = [...new Set(listings.map((l) => l.city))];

  const avgPrice = totalListings > 0
    ? Math.round(listings.reduce((sum, l) => sum + l.price, 0) / totalListings)
    : 0;

  const formatPrice = (p: number) => {
    if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1)}M $`;
    if (p >= 1_000) return `${(p / 1_000).toFixed(0)}k $`;
    return `${p} $`;
  };

  const mainStats = [
    { label: "Total annonces", value: totalListings, icon: Home, bg: "bg-primary/10", color: "text-primary" },
    { label: "En vente", value: ventCount, icon: TrendingUp, bg: "bg-green-500/10", color: "text-green-500" },
    { label: "En location", value: locationCount, icon: Users, bg: "bg-blue-500/10", color: "text-blue-500" },
    { label: "En vedette", value: featuredCount, icon: Star, bg: "bg-yellow-500/10", color: "text-yellow-500" },
  ];

  const typeStats = [
    { label: "Maisons", value: maisonCount, icon: Home, total: totalListings },
    { label: "Appartements", value: appartCount, icon: Building, total: totalListings },
    { label: "Terrains", value: terrainCount, icon: LandPlot, total: totalListings },
    { label: "Villas", value: villaCount, icon: Star, total: totalListings },
  ];


  return (
    <div>
      {/* Stats principales */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
              {totalListings > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${color.replace("text-", "bg-")}`}
                      className="bar-width"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {totalListings > 0 ? Math.round((value / totalListings) * 100) : 0}% du total
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prix moyen */}
      <Card className="mt-4">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Prix moyen des annonces</p>
            <p className="text-2xl font-bold text-foreground">{formatPrice(avgPrice)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par type de bien */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Répartition par type de bien
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {typeStats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Villes et communes */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Villes couvertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cities.length > 0 ? cities.map((c) => (
                <span key={c} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {c}
                </span>
              )) : <p className="text-sm text-muted-foreground">Aucune ville</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Communes ({communes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {communes.length > 0 ? communes.map((c) => (
                <span key={c} className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                  {c}
                </span>
              )) : <p className="text-sm text-muted-foreground">Aucune commune</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
