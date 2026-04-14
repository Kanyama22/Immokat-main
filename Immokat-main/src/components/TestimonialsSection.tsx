import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Patrick Kalubi",
    role: "Propriétaire à Kampemba",
    text: "Grâce à Eden City, j'ai vendu ma parcelle en moins de 2 semaines. Service professionnel et efficace !",
    rating: 5,
  },
  {
    name: "Marie Ngoy",
    role: "Locataire à Kenya",
    text: "J'ai trouvé un appartement magnifique à un prix raisonnable. L'équipe m'a accompagnée du début à la fin.",
    rating: 5,
  },
  {
    name: "Jean-Pierre Mukendi",
    role: "Investisseur immobilier",
    text: "Eden City est la référence à Lubumbashi. Leur estimation de biens m'a permis de faire d'excellents investissements.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="container pb-20">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl font-bold text-foreground sm:text-3xl"
        >
          Ce que disent nos <span className="text-gradient-gold">clients</span>
        </motion.h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La satisfaction de nos clients est notre priorité
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative rounded-xl border border-border bg-card p-6 transition-all hover:gold-border-glow"
          >
            <Quote size={28} className="text-primary/20 mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              "{t.text}"
            </p>
            <div className="mt-4 flex items-center gap-1">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={14} className="fill-primary text-primary" />
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
