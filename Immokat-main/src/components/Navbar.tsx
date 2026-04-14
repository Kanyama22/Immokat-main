import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, Menu, X, ShieldCheck, LogIn, LogOut, User, MessageCircle, Briefcase } from "lucide-react";
import logoEdenCity from "@/assets/logo-eden-city.jpg";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/annonces", label: "Annonces", icon: Search },
  { to: "/favoris", label: "Favoris", icon: Heart },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/contact", label: "Contact", icon: MessageCircle },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoEdenCity} alt="Eden City" className="h-10 w-auto rounded" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === to
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname.startsWith("/admin")
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin
            </Link>
          )}

          {user ? (
            <div className="ml-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/connexion"
              className="ml-4 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-eden-gold-dark"
            >
              Se connecter
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-card md:hidden"
          >
            <div className="container flex flex-col gap-2 py-4">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ShieldCheck size={18} />
                  Admin
                </Link>
              )}

              {user ? (
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              ) : (
                <Link
                  to="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
