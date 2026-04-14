import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart } from "lucide-react";

export default function Favorites() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex min-h-[60vh] items-center justify-center pt-20">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart size={28} className="text-primary" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Vos favoris</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous pour sauvegarder vos annonces préférées.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
