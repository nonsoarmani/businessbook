"use client";

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, X } from 'lucide-react'; // Added X icon for close button
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void; // Add onToggle prop for closing on mobile
}

const navItems = [
  { name: 'Script Converter', icon: LayoutDashboard, path: '/' },
];

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-sidebar transition-all duration-300",
      isCollapsed ? "w-[60px]" : "w-[240px]",
      isMobile && !isCollapsed ? "w-[240px]" : "w-0 lg:w-[240px]" // Ensure it's hidden on mobile when collapsed
    )}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h1 className={cn(
          "font-bold text-lg text-sidebar-primary transition-opacity duration-300",
          isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
        )}>
          ShotList Pro
        </h1>
        <LayoutDashboard className={cn(
          "text-sidebar-primary transition-opacity duration-300",
          isCollapsed ? "opacity-100 w-6 h-6" : "opacity-0 w-0 h-0"
        )} />
        {isMobile && !isCollapsed && ( // Show close button only on mobile when sidebar is open
          <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
            <X className="h-5 w-5 text-sidebar-foreground" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid items-start gap-2 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={isMobile && !isCollapsed ? onToggle : undefined} // Close sidebar on mobile after navigation
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  isCollapsed && "justify-center"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className={cn(
                "transition-opacity duration-300",
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-2 border-t text-center text-xs text-muted-foreground">
        <p className={cn(isCollapsed ? "hidden" : "block")}>Built for creators</p>
      </div>
    </div>
  );
};

export default Sidebar;