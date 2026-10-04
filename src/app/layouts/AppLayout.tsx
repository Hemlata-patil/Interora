import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import type { UserRole } from '@/types';
import { getCurrentUserBackend } from '@/services/api/backendService';

export interface AppLayoutProps {
  role: UserRole;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ role, children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      try {
        const user = await getCurrentUserBackend();
        if (!isMounted) return;

        if (!user) {
          // No active session — redirect to login
          navigate('/login', { replace: true });
          return;
        }

        // Authoritative role guard: Ensure user has access to this role layout
        if (user.role !== role) {
          // If role doesn't match layout, redirect to their authoritative dashboard
          navigate(`/${user.role}`, { replace: true });
          return;
        }

        setUserEmail(user.email);
        setUserName(
          user.fullName ||
            (role === 'company'
              ? 'Company Account'
              : role === 'student'
              ? 'Student Account'
              : role.toUpperCase())
        );
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        navigate('/login', { replace: true });
      }
    };

    resolveSession();

    return () => {
      isMounted = false;
    };
  }, [role, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium tracking-wide">
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar
        role={role}
        userName={
          userName ||
          (role === 'company'
            ? 'Company Account'
            : role === 'student'
            ? 'Student Account'
            : role.toUpperCase())
        }
        userEmail={userEmail || `${role}@interora.app`}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header role={role} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
