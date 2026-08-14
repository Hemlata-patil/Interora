import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import type { UserRole } from '@/types';
import {
  LayoutDashboard,
  Compass,
  FileCheck,
  Award,
  User,
  CheckSquare,
  Users,
  Briefcase,
  TrendingUp,
  X,
  Sparkles,
  BarChart3,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  group?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/student', icon: LayoutDashboard, group: 'Home' },
          { label: 'Internships', path: '/student/internships', icon: Compass, group: 'Journey' },
          { label: 'Applications', path: '/student/applications', icon: FileCheck, group: 'Journey' },
          { label: 'Attendance & Logs', path: '/student/attendance', icon: CheckSquare, group: 'My Work' },
          { label: 'AI & Career', path: '/student/ai-career', icon: Sparkles, group: 'AI & Career' },
          { label: 'Certificate', path: '/student/certificate', icon: Award, group: 'Completion' },
          { label: 'Profile', path: '/student/profile', icon: User, group: 'Account' },
        ];
      case 'faculty':
        return [
          { label: 'Dashboard', path: '/faculty', icon: LayoutDashboard, group: 'Home' },
          { label: 'Approvals', path: '/faculty/approvals', icon: FileCheck, group: 'Workflows' },
          { label: 'Students', path: '/faculty/students', icon: Users, group: 'Monitoring' },
          { label: 'Insights & Risk', path: '/faculty/insights', icon: TrendingUp, group: 'Analytics' },
        ];
      case 'company':
        return [
          { label: 'Dashboard', path: '/company', icon: LayoutDashboard, group: 'Home' },
          { label: 'Listings', path: '/company/listings', icon: Briefcase, group: 'Operations' },
          { label: 'Applicants', path: '/company/applicants', icon: Users, group: 'Operations' },
          { label: 'Active Interns', path: '/company/interns', icon: Users, group: 'Monitoring' },
          { label: 'Evaluations', path: '/company/evaluations', icon: FileCheck, group: 'Completion' },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, group: 'Home' },
          { label: 'User Management', path: '/admin/users', icon: Users, group: 'Management' },
          { label: 'Organizations', path: '/admin/organizations', icon: Building2, group: 'Management' },
          { label: 'Internships', path: '/admin/internships', icon: Briefcase, group: 'Management' },
          { label: 'Certificates', path: '/admin/certificates', icon: Award, group: 'Management' },
          { label: 'Analytics & AI', path: '/admin/analytics', icon: BarChart3, group: 'System' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={APP_INFO.logo} alt={APP_INFO.name} className="h-8 w-auto object-contain" />
            <div>
              <span className="text-base font-bold text-slate-900 leading-none block">{APP_INFO.name}</span>
              <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">{role} portal</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/${role}`}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] text-slate-500 text-center">
            <p className="font-semibold text-slate-700">{APP_INFO.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{APP_INFO.tagline}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
