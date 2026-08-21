import React from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';

import { mockCompanyNotifications } from '@/features/faculty/mockData';

export interface HeaderProps {
  role: UserRole;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ role, onMenuToggle }) => {
  const navigate = useNavigate();
  
  const unreadCount = role === 'company' 
    ? mockCompanyNotifications.filter(n => !n.read).length
    : 0;

  const handleNotificationClick = () => {
    if (role === 'company') {
      navigate('/company/notifications');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Interora <span className="text-slate-200 mx-1">|</span> {role} Workspace
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={handleNotificationClick}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white box-content" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs border border-indigo-200">
            {role.substring(0, 2).toUpperCase()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-slate-500 hover:text-slate-700"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
