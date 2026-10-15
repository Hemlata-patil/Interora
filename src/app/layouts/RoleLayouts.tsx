import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AICareerAssistant } from '@/features/ai/components/AICareerAssistant';

export const StudentLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AppLayout role="student">
    {children || <Outlet />}
    <AICareerAssistant />
  </AppLayout>
);

export const FacultyLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AppLayout role="faculty">{children || <Outlet />}</AppLayout>
);

export const CompanyLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AppLayout role="company">{children || <Outlet />}</AppLayout>
);

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AppLayout role="admin">{children || <Outlet />}</AppLayout>
);

export const MentorLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AppLayout role="mentor">{children || <Outlet />}</AppLayout>
);

export const HodLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AppLayout role="hod">{children || <Outlet />}</AppLayout>
);
