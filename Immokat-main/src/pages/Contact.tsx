import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const contactInfo = [
  {
    icon: Phone,
    title: "Téléphone",
    value: "+243 XXX XXX XXX",
    href: "tel:+243000000000",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+243 XXX XXX XXX",
    href: "https://wa.me/243000000000",
  },
  {
    icon: Mail,
    title: "Email",
    value: "contact@edencity.cd",
    href: "mailto:contact@edencity.cd",
  },
  {
    icon: MapPin,
    title: "Adresse",
    value: "Lubumbashi, Haut-Katanga, RDC",
    href: null,
  },
];

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast({ title: "Message envoyé !", description: "Nous vous répondrons dans les plus brefs délais." });
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Contactez <span className="text-primary">Eden City</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Nos agents sont disponibles pour vous accompagner dans votre projet immobilier à Lubumbashi.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 flex flex-col gap-4"
          >
            {contactInfo.map(({ icon: Icon, title, value, href }) => (
              <Card key={title} className="border-border/50 bg-card/80">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{title}</p>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-3"
          >
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input id="name" name="name" placeholder="Votre nom" value={form.name} onChange={handleChange} maxLength={100} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" placeholder="votre@email.com" value={form.email} onChange={handleChange} maxLength={255} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+243 ..." value={form.phone} onChange={handleChange} maxLength={20} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject">Sujet</Label>
                      <Input id="subject" name="subject" placeholder="Objet du message" value={form.subject} onChange={handleChange} maxLength={150} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" name="message" placeholder="Décrivez votre projet ou posez votre question..." rows={5} value={form.message} onChange={handleChange} maxLength={1000} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Send size={16} />
                    {loading ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
