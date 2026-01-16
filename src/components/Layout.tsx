"use client";

import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { MadeWithDyad } from './made-with-dyad';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile'; // Assuming this hook exists and works

const Layout = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(!isMobile); // Open by default on desktop, closed on mobile

  React.useEffect(() => {
    setIsSidebarOpen(!isMobile); // Adjust sidebar state when mobile status changes
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <header className="flex items-center justify-between p-4 border-b bg-background lg:hidden">
          <h1 className="font-bold text-lg text-primary">ShotList Pro</h1>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex-shrink-0 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-[240px]" : "w-0",
        isMobile && isSidebarOpen && "absolute inset-y-0 left-0 z-50" // Full height, on top for mobile
      )}>
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
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Layout;