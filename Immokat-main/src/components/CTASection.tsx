import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="container pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-10 text-center sm:p-16"
      >
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Prêt à trouver votre{" "}
            <span className="text-gradient-gold">bien idéal</span> ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Contactez nos agents dès maintenant et laissez-nous vous accompagner dans votre projet immobilier à Lubumbashi.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/annonces"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-eden-gold-dark hover:shadow-[var(--shadow-primary)]"
            >
              Voir les annonces <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:text-primary"
            >
              <Phone size={16} /> Nous contacter
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
