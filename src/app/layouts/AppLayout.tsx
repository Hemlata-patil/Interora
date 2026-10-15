import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import type { UserRole } from '@/types';
import { getCurrentUserBackend, getCachedCurrentUser } from '@/services/api/backendService';
import { AlertCircle, RotateCw, LogIn } from 'lucide-react';
import { Button } from '@/components';

export interface AppLayoutProps {
  role: UserRole;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ role, children }) => {
  const navigate = useNavigate();
  const cachedUser = getCachedCurrentUser();
  const hasValidCachedSession = Boolean(cachedUser && cachedUser.role === role);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>(cachedUser?.email || '');
  const [userName, setUserName] = useState<string>(
    cachedUser?.fullName ||
      (role === 'company'
        ? 'Company Account'
        : role === 'student'
        ? 'Student Account'
        : role.toUpperCase())
  );
  const [userAvatar, setUserAvatar] = useState<string | null>(cachedUser?.avatarUrl || null);
  const [loading, setLoading] = useState(!hasValidCachedSession);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      setSessionError(null);
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
        setUserAvatar(user.avatarUrl || null);
        setUserName(
          user.fullName ||
            (role === 'company'
              ? 'Company Account'
              : role === 'student'
              ? 'Student Account'
              : role.toUpperCase())
        );
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        if (!hasValidCachedSession) {
          setSessionError(err?.message || 'Unable to connect to the session server.');
          setLoading(false);
        }
      }
    };

    resolveSession();

    const handleUserUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.avatarUrl !== undefined) {
        setUserAvatar(detail.avatarUrl);
      }
      if (detail.fullName) {
        setUserName(detail.fullName);
      }
    };

    window.addEventListener('interora:user-updated', handleUserUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('interora:user-updated', handleUserUpdated);
    };
  }, [role, navigate, hasValidCachedSession]);

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

  if (sessionError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Session Verification Error</h3>
            <p className="text-xs text-slate-500 mt-1">{sessionError}</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/login', { replace: true })}>
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Go to Login
            </Button>
          </div>
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
        avatarUrl={userAvatar}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          role={role}
          avatarUrl={userAvatar}
          userName={userName}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
