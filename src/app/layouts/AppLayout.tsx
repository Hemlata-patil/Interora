import React, { useState } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import type { UserRole } from '@/types';

export interface AppLayoutProps {
  role: UserRole;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ role, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header role={role} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
