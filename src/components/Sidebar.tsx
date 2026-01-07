"use client";

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, HandCoins, Wallet, Scale, ReceiptText, LineChart, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Sales', icon: HandCoins, path: '/sales' },
  { name: 'Expenses', icon: Wallet, path: '/expenses' },
  { name: 'Debts', icon: Scale, path: '/debts' },
  { name: 'Receipts', icon: ReceiptText, path: '/receipts' },
  { name: 'Reports', icon: LineChart, path: '/reports' },
  { name: 'Cash Flow', icon: Landmark, path: '/cash-flow' },
];

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-sidebar transition-all duration-300",
      isCollapsed ? "w-[60px]" : "w-[240px]"
    )}>
      <div className="flex h-16 items-center justify-center border-b px-4">
        <h1 className={cn(
          "font-bold text-lg text-sidebar-primary transition-opacity duration-300",
          isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
        )}>
          BusinessBook
        </h1>
        <LayoutDashboard className={cn(
          "text-sidebar-primary transition-opacity duration-300",
          isCollapsed ? "opacity-100 w-6 h-6" : "opacity-0 w-0 h-0"
        )} />
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid items-start gap-2 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
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
    </div>
  );
};

export default Sidebar;