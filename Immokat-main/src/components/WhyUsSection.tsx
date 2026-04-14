import { motion } from "framer-motion";
import imgVerifies from "@/assets/v.jpg";
import imgRapidite from "@/assets/R.jpg";
import imgAccompagnement from "@/assets/A.jpg";
import imgPrix from "@/assets/f.jpg";
import imgExperience from "@/assets/experience.jpg";
import imgSupport from "@/assets/support.jpg";

const reasons = [
  {
    image: imgVerifies,
    title: "Biens vérifiés",
    desc: "Chaque propriété est inspectée et vérifiée par notre équipe avant publication.",
  },
  {
    image: imgRapidite,
    title: "Rapidité",
    desc: "Trouvez votre bien en quelques jours grâce à notre réseau étendu à Lubumbashi.",
  },
  {
    image: imgAccompagnement,
    title: "Accompagnement",
    desc: "Un agent dédié vous accompagne à chaque étape de votre projet immobilier.",
  },
  {
    image: imgPrix,
    title: "Meilleurs prix",
    desc: "Estimations justes et prix compétitifs pour maximiser votre investissement.",
  },
  {
    image: imgExperience,
    title: "Expérience",
    desc: "Des années d'expertise sur le marché immobilier de Lubumbashi.",
  },
  {
    image: imgSupport,
    title: "Support 24/7",
    desc: "Notre équipe est disponible à tout moment pour répondre à vos questions.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="relative overflow-hidden pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="container relative">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-bold text-foreground sm:text-3xl"
          >
            Pourquoi choisir <span className="text-gradient-gold">Eden City</span> ?
          </motion.h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Le partenaire immobilier de confiance à Lubumbashi
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-[var(--shadow-primary)]"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={r.image}
                  alt={r.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-sm font-semibold text-foreground">{r.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
