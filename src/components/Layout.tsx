"use client";

import React from 'react';
import { Outlet } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import Sidebar from './Sidebar';
import { MadeWithDyad } from './made-with-dyad';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={15}
          minSize={4}
          maxSize={20}
          collapsible={true}
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
          className="min-w-[60px]"
        >
          <Sidebar isCollapsed={isCollapsed} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={85}>
          <div className="flex flex-col h-full">
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
              <Outlet />
            </main>
            <MadeWithDyad />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;