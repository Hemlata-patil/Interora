import React from 'react';
import { AppLayout } from './AppLayout';

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout role="student">{children}</AppLayout>
);

export const FacultyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout role="faculty">{children}</AppLayout>
);

export const CompanyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout role="company">{children}</AppLayout>
);

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout role="admin">{children}</AppLayout>
);

export const MentorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout role="mentor">{children}</AppLayout>
);
