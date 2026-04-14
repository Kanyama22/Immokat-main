import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Favorites from "./pages/Favorites";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StatsPage from "./pages/admin/StatsPage";
import ListingsManage from "./pages/admin/ListingsManage";
import ListingForm from "./pages/admin/ListingForm";
import ReviewsManage from "./pages/admin/ReviewsManage";
import SettingsPage from "./pages/admin/SettingsPage";
import SiteSettingsPage from "./pages/admin/SiteSettingsPage";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/annonces" element={<Listings />} />
            <Route path="/annonces/:id" element={<ListingDetail />} />
            <Route path="/favoris" element={<Favorites />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/connexion" element={<Auth />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<StatsPage />} />
              <Route path="listings" element={<ListingsManage />} />
              <Route path="listings/new" element={<ListingForm />} />
              <Route path="listings/:id/edit" element={<ListingForm />} />
              <Route path="reviews" element={<ReviewsManage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="site" element={<SiteSettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
