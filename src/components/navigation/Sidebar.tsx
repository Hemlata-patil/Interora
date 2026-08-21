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
  BarChart3,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  LogOut,
  X,
  Target,
  MessageCircle,
  BookOpen,
  LayoutDashboard,
  FileCheck,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2,
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
  role?: 'student' | 'faculty' | 'company' | 'mentor' | 'admin';
  userEmail?: string;
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role = 'student',
  userEmail = 'user@interora.app',
  userName = 'User',
  isOpen = true,
  onClose,
}) => {
  const location = useLocation();

  const getRoleNavItems = (): NavItem[] => {
    switch (role) {
      case 'student':
        return [
          {
            label: 'Dashboard',
            path: '/student/dashboard',
            icon: LayoutDashboard,
          },
          {
            label: 'Discover Internships',
            path: '/student/internships',
            icon: Compass,
          },
          {
            label: 'My Applications',
            path: '/student/applications',
            icon: FileText,
          },
          {
            label: 'Attendance',
            path: '/student/attendance',
            icon: Clock,
          },
          {
            label: 'Chat',
            path: '/student/chat',
            icon: MessageCircle,
            badge: '1',
          },
          {
            label: 'Career Prep',
            path: '/student/career-prep',
            icon: Target,
          },
          {
            label: 'AI & Career',
            path: '/student/ai-career',
            icon: Sparkles,
            badge: 'AI',
          },
          {
            label: 'Profile',
            path: '/student/profile',
            icon: User,
          },
          {
            label: 'Productivity',
            path: '/student/tasks',
            icon: CheckSquare,
          },
          {
            label: 'Milestones & Evaluations',
            path: '/student/milestones',
            icon: FileCheck,
          },
          {
            label: 'Certificates & Graduation',
            path: '/student/certificates',
            icon: Award,
          },
        ];

      case 'faculty':
        return [
          {
            label: 'Dashboard',
            path: '/faculty',
            icon: LayoutDashboard,
            group: 'Overview',
          },
          {
            label: 'Application Approvals',
            path: '/faculty/approvals',
            icon: CheckSquare,
            group: 'Approval',
          },
          {
            label: 'Assigned Students',
            path: '/faculty/students',
            icon: Users,
            group: 'Monitoring',
          },
          {
            label: 'Internship Insights',
            path: '/faculty/insights',
            icon: TrendingUp,
            group: 'Monitoring',
          },
          {
            label: 'Attendance',
            path: '/faculty/attendance',
            icon: Clock,
            group: 'Monitoring',
          },
          {
            label: 'Cross-Verification',
            path: '/faculty/cross-verification',
            icon: ShieldCheck,
            group: 'Verification',
          },
          {
            label: 'Student Guidance',
            path: '/faculty/guidance',
            icon: BookOpen,
            group: 'Support',
          },
          {
            label: 'Evaluations',
            path: '/faculty/evaluations',
            icon: FileCheck,
            group: 'Evaluation',
          },
          {
            label: 'Placement Analytics',
            path: '/faculty/placement-analytics',
            icon: BarChart3,
            group: 'Analytics',
          },
          {
            label: 'Faculty Profile',
            path: '/faculty/profile',
            icon: User,
            group: 'Account',
          },
        ];

      case 'company':
        return [
          {
            label: 'Dashboard',
            path: '/company',
            icon: LayoutDashboard,
            group: 'Home',
          },
          {
            label: 'Company Profile',
            path: '/company/profile',
            icon: Building2,
            group: 'Home',
          },
          {
            label: 'Internship Postings',
            path: '/company/listings',
            icon: Briefcase,
            group: 'Hiring',
          },
          {
            label: 'Applicants & Candidates',
            path: '/company/applicants',
            icon: Users,
            group: 'Hiring',
          },
          {
            label: 'Mentor Management',
            path: '/company/mentors',
            icon: User,
            group: 'Mentorship',
          },
          {
            label: 'Active Interns',
            path: '/company/interns',
            icon: Users,
            group: 'Management',
          },
          {
            label: 'Tasks & Projects',
            path: '/company/tasks',
            icon: CheckSquare,
            group: 'Management',
          },
          {
            label: 'Milestone Tracking',
            path: '/company/milestones',
            icon: FileCheck,
            group: 'Management',
          },
          {
            label: 'Evaluations',
            path: '/company/evaluations',
            icon: FileCheck,
            group: 'Completion',
          },
          {
            label: 'PPO & Offers',
            path: '/company/ppo',
            icon: Award,
            group: 'Completion',
          },
          {
            label: 'Certificates',
            path: '/company/certificates',
            icon: Award,
            group: 'Completion',
          },
          {
            label: 'Notifications',
            path: '/company/notifications',
            icon: Sparkles,
            group: 'Home',
          },
        ];

      case 'mentor':
        return [
          {
            label: 'Dashboard',
            path: '/mentor',
            icon: LayoutDashboard,
            group: 'Home',
          },
          {
            label: 'My Interns',
            path: '/mentor/interns',
            icon: Users,
            group: 'Monitoring',
          },
          {
            label: 'Tasks & Proof',
            path: '/mentor/tasks',
            icon: CheckSquare,
            group: 'Monitoring',
          },
          {
            label: 'Milestones',
            path: '/mentor/milestones',
            icon: FileCheck,
            group: 'Monitoring',
          },
          {
            label: 'Evaluations',
            path: '/mentor/evaluations',
            icon: FileCheck,
            group: 'Completion',
          },
          {
            label: 'Notifications',
            path: '/mentor/notifications',
            icon: Sparkles,
            group: 'Home',
          },
          {
            label: 'Profile',
            path: '/student/profile',
            icon: User,
            group: 'Account',
          },
        ];

      case 'admin':
        return [
          {
            label: 'Dashboard',
            path: '/admin',
            icon: LayoutDashboard,
            group: 'Overview',
          },
          {
            label: 'Student Applications',
            path: '/admin/applications',
            icon: FileText,
            group: 'Administration',
          },
          {
            label: 'User Management',
            path: '/admin/users',
            icon: Users,
            group: 'Administration',
          },
          {
            label: 'Internships',
            path: '/admin/internships',
            icon: Briefcase,
            group: 'Administration',
          },
          {
            label: 'Industry & Company Management',
            path: '/admin/companies',
            icon: Building2,
            group: 'Administration',
          },
          {
            label: 'Faculty Mentor Management',
            path: '/admin/faculty-mentors',
            icon: GraduationCap,
            group: 'Administration',
          },
          {
            label: 'PPO Approvals',
            path: '/admin/ppos',
            icon: CheckSquare,
            group: 'Oversight',
          },
          {
            label: 'Certificates',
            path: '/admin/certificates',
            icon: Award,
            group: 'Oversight',
          },
          {
            label: 'System Analytics',
            path: '/admin/analytics',
            icon: BarChart3,
            group: 'Oversight',
          },
          {
            label: 'Profile',
            path: '/admin/profile',
            icon: User,
            group: 'Account',
          },
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
            <img
              src={interoraLogo}
              alt="Interora Logo"
              className="h-9 w-auto object-contain"
            />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                Interora
              </h1>
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block mt-1">
                Learn | Intern | Grow
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Identity Banner */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Active Role
            </span>
            <span className="font-bold text-slate-800 capitalize">
              {role} Portal
            </span>
          </div>

          <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded uppercase">
            AlphaStack
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' &&
                item.path !== '/student/dashboard' &&
                item.path !== '/faculty' &&
                item.path !== '/company' &&
                item.path !== '/mentor' &&
                item.path !== '/admin' &&
                location.pathname.startsWith(`${item.path}/`));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={() =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
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
                      isActive
                        ? 'bg-white text-indigo-700'
                        : 'bg-indigo-100 text-indigo-700'
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
              {(userName || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {userEmail}
              </span>
            </div>
          </div>

          <NavLink
            to="/login"
            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
