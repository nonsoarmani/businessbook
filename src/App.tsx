import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SalesPage from "./pages/SalesPage";
import ExpensesPage from "./pages/ExpensesPage";
import DebtsPage from "./pages/DebtsPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import ReportsPage from "./pages/ReportsPage";
import CashFlowPage from "./pages/CashFlowPage";
import SettingsPage from "./pages/SettingsPage";
import CustomersPage from "./pages/CustomersPage";
import InventoryPage from "./pages/InventoryPage";
import TasksPage from "./pages/TasksPage";
import Subscription from "./pages/Subscription"; // Import Subscription page
import { BusinessProvider } from "./state/businessStore";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/receipts" element={<ReceiptsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/cash-flow" element={<CashFlowPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/subscription" element={<Subscription />} /> {/* Add Subscription route */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;