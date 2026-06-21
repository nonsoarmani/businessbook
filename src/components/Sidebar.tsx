"use client";
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  Handshake, 
  ReceiptText, 
  BarChart, 
  Banknote, 
  Settings, 
  Users, 
  Box,
  X,
  LogOut,
  ListTodo,
  Zap,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/app' },
  { name: 'Sales', icon: ShoppingCart, path: '/app/sales' },
  { name: 'Expenses', icon: Wallet, path: '/app/expenses' },
  { name: 'Inventory', icon: Box, path: '/app/inventory' },
  { name: 'Debts', icon: Handshake, path: '/app/debts' },
  { name: 'Receipts', icon: ReceiptText, path: '/app/receipts' },
  { name: 'Customers', icon: Users, path: '/app/customers' },
  { name: 'Tasks', icon: ListTodo, path: '/app/tasks' },
  { name: 'Reports', icon: BarChart, path: '/app/reports' },
  { name: 'Cash Flow', icon: Banknote, path: '/app/cash-flow' },
  { name: 'Subscription', icon: Zap, path: '/app/subscription' },
  { name: 'Settings', icon: Settings, path: '/app/settings' },
];

const adminNavItems = [
  { name: 'Admin Dashboard', icon: ShieldCheck, path: '/admin' },
  { name: 'All Users', icon: Users, path: '/admin/users' },
  { name: 'All Sales', icon: ShoppingCart, path: '/admin/sales' },
  { name: 'All Expenses', icon: Wallet, path: '/admin/expenses' },
  { name: 'Payment Records', icon: CreditCard, path: '/admin/payments' },
  { name: 'Subscriptions', icon: Zap, path: '/admin/subscriptions' },
  // { name: 'System Settings', icon: Settings, path: '/admin/settings' },
];

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const isMobile = useIsMobile();
  const { signOut, profile, isAdmin } = useAuth();

  const currentNavItems = isAdmin ? adminNavItems : navItems;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-sidebar transition-all duration-300 z-50",
        !isMobile && (isCollapsed ? "w-[70px]" : "w-[240px]"),
        isMobile && "fixed inset-y-0 left-0 w-[280px] shadow-xl",
        isMobile && isCollapsed && "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={cn("flex flex-col items-start", isCollapsed && !isMobile && "items-center")}>
            <img 
              src={logo} 
              alt="Jotter Logo" 
              className={cn("h-8 w-auto object-contain mb-1", isCollapsed && !isMobile && "h-6")} 
            />
          </div>
          {(!isCollapsed || isMobile) && profile?.subscription_status === 'pro' && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
              PRO
            </Badge>
          )}
        </div>
        
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X className="h-5 w-5 text-sidebar-foreground" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="grid items-start gap-1 px-2">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/app' || item.path === '/admin'}
              onClick={isMobile ? onToggle : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  !isMobile && isCollapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "transition-opacity duration-300",
                  !isMobile && isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}
              >
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className={cn("mb-4", !isMobile && isCollapsed ? "hidden" : "block")}>
          <p className="text-xs font-semibold text-muted-foreground truncate">{profile?.first_name || 'User'}</p>
          <p className="text-[10px] text-muted-foreground truncate opacity-70">
            {profile?.subscription_status === 'pro' ? 'Pro Plan' : 'Free Plan'}
          </p>
        </div>
        <Button
          variant="ghost"
          className={cn("w-full justify-start", !isMobile && isCollapsed && "justify-center px-2")}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span
            className={cn(
              "ml-3 transition-opacity duration-300",
              !isMobile && isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}
          >
            Logout
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;