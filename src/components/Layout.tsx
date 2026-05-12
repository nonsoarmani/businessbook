"use client";
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { MadeWithDyad } from './made-with-dyad';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from './ThemeToggle';
import { useBusiness } from '@/state/businessStore';
import { parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import logo from '@/assets/logo.png';

const Layout = () => {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(isMobile);
  const { state } = useBusiness();
  const { debts = [], inventory = [] } = state;

  React.useEffect(() => {
    setIsSidebarCollapsed(isMobile);
  }, [isMobile]);

  const notificationCount = React.useMemo(() => {
    let count = 0;
    debts.forEach(debt => {
      if (debt.status !== 'paid' && debt.dueDate) {
        try {
          const dueDate = parseISO(debt.dueDate);
          if (isToday(dueDate) || isTomorrow(dueDate) || isPast(dueDate)) count++;
        } catch (e) {}
      }
    });
    inventory.forEach(item => {
      if (item.quantity !== undefined && item.lowStockThreshold !== undefined && 
          item.quantity <= item.lowStockThreshold) count++;
    });
    return count;
  }, [debts, inventory]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

      {isMobile && !isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" 
          onClick={toggleSidebar}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn("h-9 w-9", !isMobile && "hidden")}>
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="Jotter Logo" className="h-8 w-auto object-contain" />
              <h1 className="font-bold text-lg md:text-xl text-primary truncate">My Business Jotter</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                <a href="/app/settings#notifications">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[8px] text-white flex items-center justify-center border-2 border-background">
                      {notificationCount}
                    </span>
                  )}
                </a>
              </Button>
            </div>
            {/* <ThemeToggle /> */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
          <MadeWithDyad />
        </main>
      </div>
    </div>
  );
};

export default Layout;