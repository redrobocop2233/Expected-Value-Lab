import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Roulette from "./pages/Roulette";
import Blackjack from "./pages/Blackjack";
import Slots from "./pages/Slots";
import Poker from "./pages/Poker";
import BettingStrategies from "./pages/BettingStrategies";
import ExpectedValue from "./pages/ExpectedValue";
import GamblersRuin from "./pages/GamblersRuin";
import KellyCriterion from "./pages/KellyCriterion";
import Psychology from "./pages/Psychology";
import MonteCarlo from "./pages/MonteCarlo";
import Finance from "./pages/Finance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/roulette" element={<Roulette />} />
          <Route path="/blackjack" element={<Blackjack />} />
          <Route path="/slots" element={<Slots />} />
          <Route path="/poker" element={<Poker />} />
          <Route path="/strategies" element={<BettingStrategies />} />
          <Route path="/expected-value" element={<ExpectedValue />} />
          <Route path="/gamblers-ruin" element={<GamblersRuin />} />
          <Route path="/kelly-criterion" element={<KellyCriterion />} />
          <Route path="/psychology" element={<Psychology />} />
          <Route path="/monte-carlo" element={<MonteCarlo />} />
          <Route path="/finance" element={<Finance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
