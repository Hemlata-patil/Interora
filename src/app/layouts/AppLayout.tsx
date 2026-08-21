import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import type { UserRole } from '@/types';
import { supabase } from '@/services/supabase/supabaseClient';

export interface AppLayoutProps {
  role: UserRole;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ role, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchSessionUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email || '');
        const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.company_name;
        if (metaName) {
          setUserName(metaName);
        } else {
          // Query profiles if metadata absent
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role === 'company') {
            const { data: comp } = await supabase
              .from('company_profiles')
              .select('company_name')
              .eq('id', data.user.id)
              .single();
            if (comp) setUserName(comp.company_name);
          } else {
            setUserName(data.user.email?.split('@')[0] || role.toUpperCase());
          }
        }
      }
    };
    fetchSessionUser();
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar
        role={role}
        userName={userName || (role === 'company' ? 'Company Account' : role === 'student' ? 'Student Account' : role.toUpperCase())}
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
