import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ListingCard from "@/components/ListingCard";
import TestimonialsSection from "@/components/TestimonialsSection";
import WhyUsSection from "@/components/WhyUsSection";
import CTASection from "@/components/CTASection";
import { Link } from "react-router-dom";
import { ArrowRight, Home, MapPin, Building, Loader2 } from "lucide-react";
import imgMaison from "@/assets/Maison.jpg";
import imgTerrain from "@/assets/Terrain.jpg";
import imgAppart from "@/assets/Appartement.jpg";
import imgSvcVente from "@/assets/vente immobilier.jpg";
import imgSvcLocation from "@/assets/location immobilière.jpg";
import imgSvcGestion from "@/assets/gestion locative.jpg";
import imgSvcConseil from "@/assets/conseil immo.jpg";

import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const categories = [
  {
    icon: Home,
    label: "Maisons",
    type: "maison",
    image: imgMaison,
  },
  {
    icon: MapPin,
    label: "Terrains",
    type: "terrain",
    image: imgTerrain,
  },
  {
    icon: Building,
    label: "Appartements",
    type: "appartement",
    image: imgAppart,
  },
];

export default function Index() {
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

  const featured = listings.filter((l) => l.featured);
  const enVente = listings.filter((l) => l.type === "vente");

  const counts = categories.map((c) => ({
    ...c,
    count: listings.filter((l) => l.property_type === c.type).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* Categories */}
      <section className="container py-16">
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Explorez par catégorie
        </h2>
        <div
          className="mt-8 flex gap-4 overflow-x-auto sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 scrollbar-hide"
        >
          {counts.map(({ icon: Icon, label, type, count, image }, i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[220px] max-w-[80vw] sm:min-w-0 sm:max-w-none"
            >
              <Link
                to={`/annonces?propertyType=${type}`}
                className="group relative flex h-36 w-[220px] sm:h-52 sm:w-auto overflow-hidden rounded-2xl shadow-md transition-all hover:shadow-[var(--shadow-primary)] hover:scale-[1.02]"
              >
                {/* Image de fond */}
                <img
                  src={image}
                  alt={label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay dégradé */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                {/* Contenu */}
                <div className="relative flex w-full flex-col justify-end p-3 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        <Icon size={16} className="text-white sm:size-[18px]" />
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-white">{label}</h3>
                      <p className="text-xs text-white/80">{count} annonce{count !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:translate-x-1">
                      <ArrowRight size={12} className="text-white sm:size-[14px]" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container pb-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Annonces en <span className="text-gradient-gold">vedette</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Nos meilleures propriétés sélectionnées
              </p>
            </div>
            <Link
              to="/annonces"
              className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-eden-gold-light sm:flex"
            >
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
            className="mt-8"
          >
            <CarouselContent className="-ml-4">
              {featured.map((listing, i) => (
                <CarouselItem key={listing.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <ListingCard listing={listing} index={i} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="-left-4 border-border bg-card text-foreground hover:bg-primary/10" />
              <CarouselNext className="-right-4 border-border bg-card text-foreground hover:bg-primary/10" />
            </div>
          </Carousel>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/annonces" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Voir toutes les annonces <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="container pb-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Nos <span className="text-gradient-gold">Services</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Des solutions complètes pour vos projets immobiliers
            </p>
          </div>
          <Link
            to="/services"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-eden-gold-light sm:flex"
          >
            Tous les services <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { image: imgSvcVente, title: "Vente immobilière", desc: "Accompagnement dans l'achat et la vente de propriétés" },
            { image: imgSvcLocation, title: "Location immobilière", desc: "Maisons, appartements et bureaux à louer" },
            { image: imgSvcGestion, title: "Gestion locative", desc: "Gestion complète de vos biens immobiliers" },
            { image: imgSvcConseil, title: "Conseil immobilier", desc: "Accompagnement stratégique pour vos investissements immobiliers" },
          ].map(({ image, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to="/services"
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-[var(--shadow-primary)]"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Voir tous les services <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* En vente */}
      <section className="container pb-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Propriétés en <span className="text-gradient-gold">vente</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Trouvez votre prochaine acquisition
            </p>
          </div>
          <Link
            to="/annonces?type=vente"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-eden-gold-light sm:flex"
          >
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enVente.slice(0, 6).map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/annonces?type=vente"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Voir les ventes <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Why Us */}
      {/* Testimonials */}
      <TestimonialsSection />

      {/* Why Us */}
      <WhyUsSection />

      {/* CTA */}
      <CTASection />

      <Footer />
    </div>
  );
}
