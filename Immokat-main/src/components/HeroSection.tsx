import { motion } from "framer-motion";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroDefault from "@/assets/Arrière plan.jpg";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: heroUrl } = useQuery<string>({
    queryKey: ["hero-image"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image_url")
        .maybeSingle();
      return data?.value || "";
    },
    staleTime: 1000 * 60 * 5,
  });

  const heroImg = heroUrl || heroDefault;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/annonces?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      <img
        src={heroImg}
        alt="Villa luxueuse à Lubumbashi"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background" />

      {/* Subtle gold particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-1 w-1 rounded-full bg-primary/40 animate-pulse" />
        <div className="absolute top-1/3 right-1/3 h-1.5 w-1.5 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 left-1/2 h-1 w-1 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm mb-6">
            <MapPin size={12} />
            N°1 de l'immobilier à Lubumbashi
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-7xl">
            Votre cité de
            <br />
            <span className="text-gradient-gold">rêve</span> vous attend
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Découvrez les meilleures propriétés à Lubumbashi.
            Maisons, terrains et appartements sélectionnés avec soin.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mt-8 flex max-w-lg overflow-hidden rounded-xl border border-border/50 glass shadow-lg"
        >
          <input
            type="text"
            placeholder="Rechercher par commune, type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-eden-gold-dark"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Rechercher</span>
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-10 text-sm text-muted-foreground"
        >
          {[
            { value: "20+", label: "Annonces" },
            { value: "7", label: "Communes" },
            { value: "100%", label: "Vérifié" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-center"
            >
              <span className="block font-display text-3xl font-bold text-primary">{stat.value}</span>
              <span className="text-xs uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown size={24} className="text-primary/60 animate-bounce" />
      </motion.div>
    </section>
  );
}
