import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  Briefcase,
  FileText,
  User,
  GraduationCap,
  Award,
  Users,
  Building2,
  BarChart3,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  ChevronRight,
  LogOut,
  X,
  Target,
  BookOpen,
} from 'lucide-react';
import interoraLogo from '@/assets/interora_logo.png';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  group?: string;
}

export interface SidebarProps {
  role?: 'student' | 'faculty' | 'company' | 'admin';
  userEmail?: string;
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role = 'student',
  userEmail = 'alex.johnson@student.edu',
  userName = 'Alex Johnson',
  isOpen = true,
  onClose,
}) => {
  const location = useLocation();

  const getRoleNavItems = (): NavItem[] => {
    switch (role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/student/dashboard', icon: Compass, group: 'Overview' },
          { label: 'Internship Discovery', path: '/student/internships', icon: Briefcase, group: 'Student Journey' },
          { label: 'My Applications', path: '/student/applications', icon: FileText, group: 'Student Journey' },
          { label: 'Productivity', path: '/student/attendance', icon: CheckSquare, group: 'My Work' },
          { label: 'Milestones & Evaluations', path: '/student/milestones', icon: Target, group: 'My Work' },
          { label: 'Certificates', path: '/student/certificates', icon: Award, group: 'Completion' },
          { label: 'AI & Career', path: '/student/ai-career', icon: Sparkles, badge: 'AI', group: 'AI & Career' },
          { label: 'Career Prep', path: '/student/career-prep', icon: BookOpen, group: 'AI & Career' },
          { label: 'Profile', path: '/student/profile', icon: User, group: 'Account' },
        ];

      case 'faculty':
        return [
          { label: 'Overview', path: '/faculty', icon: Compass, group: 'Overview' },
          { label: 'Approvals', path: '/faculty/approvals', icon: CheckSquare, badge: '3', group: 'Workflows' },
          { label: 'Students', path: '/faculty/students', icon: Users, group: 'Monitoring' },
          { label: 'Insights & Risk', path: '/faculty/insights', icon: BarChart3, badge: 'AI', group: 'Analytics' },
          { label: 'Profile', path: '/student/profile', icon: User, group: 'Account' },
        ];

      case 'company':
        return [
          { label: 'Overview', path: '/company', icon: Compass, group: 'Overview' },
          { label: 'Listings', path: '/company/listings', icon: Briefcase, group: 'Operations' },
          { label: 'Applicants', path: '/company/applicants', icon: Users, group: 'Operations' },
          { label: 'Active Interns', path: '/company/interns', icon: GraduationCap, group: 'Monitoring' },
          { label: 'Evaluations', path: '/company/evaluations', icon: ShieldCheck, group: 'Completion' },
          { label: 'Profile', path: '/student/profile', icon: User, group: 'Account' },
        ];

      case 'admin':
        return [
          { label: 'Overview', path: '/admin', icon: Compass, group: 'Overview' },
          { label: 'User Management', path: '/admin/users', icon: Users, group: 'Administration' },
          { label: 'Internships', path: '/admin/internships', icon: Briefcase, group: 'Administration' },
          { label: 'Certificates', path: '/admin/certificates', icon: Award, group: 'Oversight' },
          { label: 'System Analytics', path: '/admin/analytics', icon: BarChart3, group: 'Oversight' },
          { label: 'Profile', path: '/student/profile', icon: User, group: 'Account' },
        ];

      default:
        return [];
    }
  };

  const navItems = getRoleNavItems();

  return (
    <aside
      className={`w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between shrink-0 shadow-xs transition-all ${
        isOpen ? 'block' : 'hidden md:block'
      }`}
    >
      <div>
        {/* Brand Logo & Platform Title */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={interoraLogo} alt="Interora Logo" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">Interora</h1>
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                Learn â€¢ Intern â€¢ Grow
              </span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Identity Banner */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Role</span>
            <span className="font-bold text-slate-800 capitalize">{role} Portal</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded uppercase">
            AlphaStack
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive: linkActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    linkActive || isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {userName.charAt(0)}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 block truncate">{userName}</span>
              <span className="text-[10px] text-slate-400 block truncate">{userEmail}</span>
            </div>
          </div>
          <NavLink to="/login" className="text-slate-400 hover:text-rose-600 p-1 transition-colors" title="Log Out">
            <LogOut className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};