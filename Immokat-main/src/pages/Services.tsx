import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import imgVente from "@/assets/vente immobilier.jpg";
import imgLocation from "@/assets/location immobilière.jpg";
import imgGestion from "@/assets/gestion locative.jpg";
import imgConseil from "@/assets/conseil immo.jpg";
import imgJuridique from "@/assets/services juridique.jpg";

const services = [
  {
    image: imgVente,
    title: "Vente immobilière",
    description:
      "Accompagnement complet dans l'achat et la vente de propriétés à Lubumbashi. Nous vous guidons de la recherche du bien idéal jusqu'à la signature de l'acte de vente.",
    details: [
      "Recherche personnalisée de biens",
      "Négociation et conseil juridique",
      "Accompagnement jusqu'à la signature",
      "Suivi post-vente",
    ],
  },
  {
    image: imgLocation,
    title: "Location immobilière",
    description:
      "Trouvez la maison, l'appartement ou le bureau idéal à louer. Nous proposons une large gamme de biens en location dans toutes les communes de Lubumbashi.",
    details: [
      "Maisons, appartements et bureaux",
      "Visites organisées et accompagnées",
      "Rédaction des contrats de bail",
      "Médiation propriétaire-locataire",
    ],
  },
  {
    image: imgGestion,
    title: "Gestion locative",
    description:
      "Nous gérons vos biens immobiliers de A à Z : perception des loyers, entretien, recherche de locataires et gestion administrative.",
    details: [
      "Perception et suivi des loyers",
      "Entretien et réparations",
      "Recherche et sélection de locataires",
      "Rapports mensuels au propriétaire",
    ],
  },
  {
    image: imgConseil,
    title: "Conseil immobilier",
    description:
      "Bénéficiez de l'expertise de nos agents pour tous vos projets immobiliers. Investissement, construction ou rénovation, nous vous orientons.",
    details: [
      "Conseils en investissement",
      "Étude de faisabilité",
      "Orientation sur les quartiers",
      "Accompagnement de projets",
    ],
  },
  {
    image: imgJuridique,
    title: "Services juridiques",
    description:
      "Assistance dans les démarches administratives et juridiques liées à l'immobilier : titres fonciers, certificats d'enregistrement et plus.",
    details: [
      "Vérification des titres de propriété",
      "Constitution de dossiers fonciers",
      "Assistance aux démarches cadastrales",
      "Rédaction de contrats",
    ],
  },
];

export default function Services() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    preferredService: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitPreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.preferredService) return;

    setSubmitted(true);
    setForm({
      fullName: "",
      email: "",
      preferredService: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            Nos Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-3 max-w-2xl text-muted-foreground"
          >
            Eden City vous accompagne dans tous vos projets immobiliers à
            Lubumbashi avec une gamme complète de services professionnels.
          </motion.p>
        </div>
      </section>

      {/* Services grid */}
      <section className="container pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ image, title, description, details }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-[0_8px_30px_-10px_hsl(var(--primary)/0.25)]"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <ul className="mt-4 space-y-2">
                  {details.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Service preference form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-xl border border-border bg-card p-6 sm:p-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            Quel service vous plaît le plus ?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dites-nous le service qui vous intéresse afin que notre équipe vous accompagne rapidement.
          </p>

          <form onSubmit={handleSubmitPreference} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Votre nom"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Service préféré *</Label>
              <Select
                value={form.preferredService}
                onValueChange={(value) => setForm((prev) => ({ ...prev, preferredService: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.title} value={service.title}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="message">Votre besoin (optionnel)</Label>
              <Textarea
                id="message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Ex: Je cherche un accompagnement pour un investissement locatif..."
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">
                Envoyer ma préférence
              </Button>
            </div>
          </form>

          {submitted && (
            <p className="mt-4 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              Merci ! Votre préférence a bien été enregistrée.
            </p>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12"
        >
          <h2 className="font-display text-2xl font-bold text-foreground">
            Besoin d'un service sur mesure ?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Contactez notre équipe pour discuter de votre projet immobilier.
            Nous sommes à votre écoute.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            Nous contacter
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
