"use client";
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { MadeWithDyad } from './made-with-dyad';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from './ThemeToggle';
import { useBusiness } from '@/state/businessStore';
import { parseISO, isToday, isTomorrow, isPast } from 'date-fns';

const Layout = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(!isMobile);
  const { state } = useBusiness();
  const { debts = [], inventory = [] } = state;

  // Calculate notification count
  const notificationCount = React.useMemo(() => {
    let count = 0;
    
    // Debt notifications
    debts.forEach(debt => {
      if (debt.status !== 'paid' && debt.dueDate) {
        try {
          const dueDate = parseISO(debt.dueDate);
          if (isToday(dueDate) || isTomorrow(dueDate) || isPast(dueDate)) {
            count++;
          }
        } catch (e) {
          console.warn('Invalid date format for debt:', debt.dueDate);
        }
      }
    });
    
    // Inventory notifications
    inventory.forEach(item => {
      if (item.quantity !== undefined && item.lowStockThreshold !== undefined && 
          item.quantity <= item.lowStockThreshold) {
        count++;
      }
    });
    
    return count;
  }, [debts, inventory]);

  React.useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="font-bold text-lg text-primary">BusinessBook</h1>
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                <a href="/settings#notifications">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[8px] text-white flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </a>
              </Button>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </header>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-[240px]" : "w-0",
          isMobile && isSidebarOpen && "fixed inset-y-0 left-0 z-50"
        )}
      >
        <Sidebar isCollapsed={!isSidebarOpen} onToggle={toggleSidebar} />
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-auto">
        <header className="hidden lg:flex items-center justify-between p-4 border-b bg-background">
          <h1 className="font-bold text-xl text-primary">BusinessBook</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button variant="ghost" size="icon" asChild>
                <a href="/settings#notifications">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[8px] text-white flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </a>
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className={cn(
          "flex-1 p-4 md:p-6 lg:p-8",
          isMobile && "pt-16" // Add padding for fixed mobile header
        )}>
          <Outlet />
        </main>
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Layout;