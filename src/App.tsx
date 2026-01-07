import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Debts from "./pages/Debts";
import Receipts from "./pages/Receipts";
import Reports from "./pages/Reports";
import CashFlow from "./pages/CashFlow";
import Settings from "./pages/Settings"; // Import the new Settings page
import { BusinessProvider } from "./state/businessStore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BusinessProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="sales" element={<Sales />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="debts" element={<Debts />} />
              <Route path="receipts" element={<Receipts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="cash-flow" element={<CashFlow />} />
              <Route path="settings" element={<Settings />} /> {/* Add the new settings route */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BusinessProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;