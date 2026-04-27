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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Sales', icon: ShoppingCart, path: '/sales' },
  { name: 'Expenses', icon: Wallet, path: '/expenses' },
  { name: 'Inventory', icon: Box, path: '/inventory' },
  { name: 'Debts', icon: Handshake, path: '/debts' },
  { name: 'Receipts', icon: ReceiptText, path: '/receipts' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Tasks', icon: ListTodo, path: '/tasks' },
  { name: 'Reports', icon: BarChart, path: '/reports' },
  { name: 'Cash Flow', icon: Banknote, path: '/cash-flow' },
  { name: 'Subscription', icon: Zap, path: '/subscription' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const isMobile = useIsMobile();
  const { signOut, profile } = useAuth();
  const logoUrl = 'https://kugxbisasbylnnzpvrzw.supabase.co/storage/v1/object/public/user_uploads/Jotter%20Logo%203_2.png';

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
      <div className="flex h-20 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={cn("flex flex-col items-start", isCollapsed && !isMobile && "items-center")}>
            <img 
              src={logoUrl} 
              alt="Jotter Logo" 
              className={cn("h-8 w-auto object-contain mb-1", isCollapsed && !isMobile && "h-6")} 
            />
            <h1
              className={cn(
                "font-bold text-sm text-sidebar-primary transition-opacity duration-300 whitespace-nowrap",
                !isMobile && isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}
            >
              My Business Jotter
            </h1>
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
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={isMobile ? onToggle : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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