import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ComponentsProvider } from "@/contexts/ComponentsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigurationProvider } from "@/contexts/ConfigurationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AIChatbot } from "@/components/ai/AIChatbot";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminQuotes from "./pages/AdminQuotes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyQuotes from "./pages/MyQuotes";
import ProductInfo from "./pages/ProductInfo";
import MarketIntel from "./pages/MarketIntel";
import SalesPlaybook from "./pages/SalesPlaybook";
import LeadGenerator from "./pages/LeadGenerator";
import SocialMedia from "./pages/SocialMedia";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ComponentsProvider>
        <ConfigurationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AIChatbot />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product-info" element={<ProductInfo />} />
                <Route path="/market-intel" element={<MarketIntel />} />
                <Route path="/sales-playbook" element={<SalesPlaybook />} />
                <Route path="/lead-generator" element={<LeadGenerator />} />
                <Route path="/social-media" element={<SocialMedia />} />
                <Route
                  path="/my-quotes"
                  element={
                    <ProtectedRoute>
                      <MyQuotes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/quotes"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminQuotes />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ConfigurationProvider>
      </ComponentsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
