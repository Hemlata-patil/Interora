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
} from 'lucide-react';
import interoraLogo from '@/assets/interora_logo.png';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  group?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  role: 'student' | 'faculty' | 'company' | 'mentor' | 'admin';
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, onClose }) => {
  const location = useLocation();

  const getRoleNavItems = (): NavItem[] => {
    switch (role) {
      case 'student':
        return [
          {
            label: 'Dashboard',
            path: '/student',
            icon: LayoutDashboard,
            group: 'Overview',
          },
          {
            label: 'Explore Internships',
            path: '/student/marketplace',
            icon: Compass,
            group: 'Internships',
          },
          {
            label: 'My Applications',
            path: '/student/applications',
            icon: FileText,
            group: 'Internships',
          },
          {
            label: 'AI Career Coach',
            path: '/student/ai-career-prep',
            icon: Sparkles,
            badge: 'AI',
            group: 'Career & Growth',
          },
          {
            label: 'Attendance & Check-in',
            path: '/student/attendance',
            icon: CheckSquare,
            group: 'Daily Work',
          },
          {
            label: 'My Tasks & Submissions',
            path: '/student/tasks',
            icon: Target,
            group: 'Daily Work',
          },
          {
            label: 'Messages & Chat',
            path: '/student/chat',
            icon: MessageCircle,
            group: 'Communication',
          },
          {
            label: 'Evaluation & Feedback',
            path: '/student/evaluation',
            icon: FileCheck,
            group: 'Assessment',
          },
          {
            label: 'Certificates',
            path: '/student/certificates',
            icon: Award,
            group: 'Credentials',
          },
          {
            label: 'Profile',
            path: '/student/profile',
            icon: User,
            group: 'Career & Growth',
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
            icon: FileText,
            group: 'Approvals',
          },
          {
            label: 'Assigned Students',
            path: '/faculty/students',
            icon: Users,
            group: 'Students',
          },
          {
            label: 'Student Guidance',
            path: '/faculty/guidance',
            icon: BookOpen,
            group: 'Students',
          },
          {
            label: 'Evaluations & Grading',
            path: '/faculty/evaluations',
            icon: FileCheck,
            group: 'Assessment',
          },
          {
            label: 'Attendance & Logs',
            path: '/faculty/attendance',
            icon: CheckSquare,
            group: 'Monitoring',
          },
          {
            label: 'Cross-Verification',
            path: '/faculty/cross-verification',
            icon: FileCheck,
            group: 'Monitoring',
          },
          {
            label: 'Insights & Risk',
            path: '/faculty/insights',
            icon: TrendingUp,
            badge: 'AI',
            group: 'Analytics',
          },
          {
            label: 'Placement Analytics',
            path: '/faculty/placement-analytics',
            icon: BarChart3,
            group: 'Analytics',
          },
          {
            label: 'Profile',
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
            group: 'Overview',
          },
          {
            label: 'Post Internship',
            path: '/company/post-internship',
            icon: Briefcase,
            group: 'Recruitment',
          },
          {
            label: 'Applicants',
            path: '/company/applicants',
            icon: Users,
            group: 'Recruitment',
          },
          {
            label: 'Manage Interns',
            path: '/company/interns',
            icon: GraduationCap,
            group: 'Management',
          },
          {
            label: 'Industry Mentors',
            path: '/company/mentors',
            icon: Users,
            group: 'Management',
          },
          {
            label: 'Certificates',
            path: '/company/certificates',
            icon: Award,
            group: 'Credentials',
          },
          {
            label: 'Profile',
            path: '/company/profile',
            icon: User,
            group: 'Account',
          },
        ];

      case 'mentor':
        return [
          {
            label: 'Dashboard',
            path: '/mentor',
            icon: LayoutDashboard,
            group: 'Overview',
          },
          {
            label: 'My Interns',
            path: '/mentor/interns',
            icon: Users,
            group: 'Mentorship',
          },
          {
            label: 'Tasks & Milestones',
            path: '/mentor/tasks',
            icon: Target,
            group: 'Mentorship',
          },
          {
            label: 'Attendance & Proofs',
            path: '/mentor/attendance',
            icon: CheckSquare,
            group: 'Verification',
          },
          {
            label: 'Evaluations',
            path: '/mentor/evaluations',
            icon: FileCheck,
            group: 'Assessment',
          },
          {
            label: 'Chat with Interns',
            path: '/mentor/chat',
            icon: MessageCircle,
            group: 'Communication',
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

  const groupedItems = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.group || 'General';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={interoraLogo} alt="Interora Logo" className="h-8 w-auto object-contain" />
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">
              Interora
            </h1>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
              Learn â€¢ Intern â€¢ Grow
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {groupName}
            </div>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/student' || item.path === '/faculty' || item.path === '/company' || item.path === '/admin' || item.path === '/mentor'
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Alex Johnson</p>
              <p className="text-[10px] text-slate-500 truncate">alex.johnson@student.edu</p>
            </div>
          </div>
          <NavLink to="/login" className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
            <LogOut className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

