import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, Home as HomeIcon, List, LogOut, Plus, Loader2, Menu, X, ChevronRight, MessageSquare, Settings, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { to: "/admin", label: "Tableau de bord", icon: BarChart3, exact: true },
  { to: "/admin/listings", label: "Annonces", icon: List },
  { to: "/admin/listings/new", label: "Nouvelle annonce", icon: Plus },
  { to: "/admin/reviews", label: "Avis clients", icon: MessageSquare },
  { to: "/admin/settings", label: "Paramètres", icon: Settings },
  { to: "/admin/site", label: "Apparence", icon: Paintbrush },
];

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <HomeIcon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <Link to="/" className="text-gradient-gold font-display text-lg font-bold leading-none">
            Eden City
          </Link>
          <p className="text-[10px] text-muted-foreground mt-0.5">Administration</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3 pt-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        {sidebarLinks.map(({ to, label, icon: Icon, exact }) => {
          const active = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && to !== "/admin";
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <HomeIcon className="h-4 w-4 shrink-0" />
          Voir le site
        </Link>
        <button
          onClick={() => { signOut(); navigate("/admin/login"); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
        {/* User info */}
        <div className="mt-2 rounded-lg bg-secondary px-3 py-2">
          <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
          <p className="text-[10px] text-muted-foreground">Administrateur</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:flex lg:h-full lg:w-64 lg:flex-col border-r border-border bg-card">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile (drawer) */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-secondary lg:hidden"
          title="Fermer le menu"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
            title="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-base font-bold text-gradient-gold">Eden City Admin</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
