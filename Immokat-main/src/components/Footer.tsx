import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";
import logoEdenCity from "@/assets/logo-eden-city.jpg";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <img src={logoEdenCity} alt="Eden City" className="h-14 w-auto rounded" />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              La plateforme immobilière de référence à Lubumbashi.
              Trouvez votre bien idéal dans la capitale du cuivre.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-primary mb-4">Navigation</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/", label: "Accueil" },
                { to: "/annonces", label: "Annonces" },
                { to: "/services", label: "Services" },
                { to: "/favoris", label: "Favoris" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight size={12} className="opacity-0 -ml-4 transition-all group-hover:opacity-100 group-hover:ml-0" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-primary mb-4">Services</h4>
            <div className="flex flex-col gap-2.5">
              {["Vente immobilière", "Location", "Gestion locative"].map((s) => (
                <Link key={s} to="/services" className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight size={12} className="opacity-0 -ml-4 transition-all group-hover:opacity-100 group-hover:ml-0" />
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-primary mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                Lubumbashi, Haut-Katanga, RDC
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} className="text-primary shrink-0" />
                contact@edencity.cd
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} className="text-primary shrink-0" />
                +243 XXX XXX XXX
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Eden City — Cité de rêve. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Fait avec ❤️ à Lubumbashi
          </p>
        </div>
      </div>
    </footer>
  );
}
