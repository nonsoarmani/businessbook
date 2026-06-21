import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import Subscription from "./pages/Subscription";
import LandingPage from "./pages/LandingPage";
import { BusinessProvider } from "./state/businessStore";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPayment from "./pages/AdminPayment";
import AdminUsersPage from "./pages/AdminCustomersPage";
import AdminSalesPage from "./pages/AdminSalesPage";
import AdminExpensesPage from "./pages/AdminExpensesPage";
import AdminSubscriptionsPage from "./pages/AdminSubscriptionsPage";
import AdminLogin from "./pages/AdminLogin";
import SubscriptionGuard from "./components/notifications/SubscriptionGuard";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isSubscriptionActive } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Temporary: Disable mandatory subscription redirect for testing
  /*
  if (!isSubscriptionActive && location.pathname !== '/app/subscription') {
    return <Navigate to="/app/subscription" replace />;
  }
  */

  return <>{children}</>;
};

// Admin Protected route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionGuard />
        <BusinessProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="debts" element={<DebtsPage />} />
              <Route path="receipts" element={<ReceiptsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="cash-flow" element={<CashFlowPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="subscription" element={<Subscription />} />
            </Route>

            {/* Admin App Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <Layout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="sales" element={<AdminSalesPage />} />
              <Route path="expenses" element={<AdminExpensesPage />} />
              <Route path="payments" element={<AdminPayment />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;