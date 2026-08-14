import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { VerifyCertificatePage } from '@/pages/VerifyCertificatePage';
import { StudentLayout, FacultyLayout, CompanyLayout, AdminLayout } from '@/app/layouts/RoleLayouts';

import { StudentDashboard } from '@/features/student/StudentDashboard';
import { StudentProfile } from '@/features/student/StudentProfile';
import { FacultyDashboard } from '@/features/faculty/FacultyDashboard';
import { CompanyDashboard } from '@/features/company/CompanyDashboard';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

const router = createBrowserRouter([
  // Public Routes
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/verify/:token', element: <VerifyCertificatePage /> },

  // Student Routes Group
  {
    path: '/student',
    element: <StudentLayout><StudentDashboard /></StudentLayout>,
  },
  {
    path: '/student/dashboard',
    element: <StudentLayout><StudentDashboard /></StudentLayout>,
  },
  {
    path: '/student/internships',
    element: <StudentLayout><FeaturePlaceholder title="Internship Discovery" category="Student Journey" /></StudentLayout>,
  },
  {
    path: '/student/applications',
    element: <StudentLayout><FeaturePlaceholder title="My Applications" category="Student Journey" /></StudentLayout>,
  },
  {
    path: '/student/attendance',
    element: <StudentLayout><FeaturePlaceholder title="Attendance & Work Logs" category="My Work" /></StudentLayout>,
  },
  {
    path: '/student/ai-career',
    element: <StudentLayout><FeaturePlaceholder title="AI Recommendations & Career Readiness" category="AI & Career" /></StudentLayout>,
  },
  {
    path: '/student/certificate',
    element: <StudentLayout><FeaturePlaceholder title="Certificate & Graduation" category="Completion" /></StudentLayout>,
  },
  {
    path: '/student/profile',
    element: <StudentLayout><StudentProfile /></StudentLayout>,
  },

  // Faculty Routes Group
  {
    path: '/faculty',
    element: <FacultyLayout><FacultyDashboard /></FacultyLayout>,
  },
  {
    path: '/faculty/approvals',
    element: <FacultyLayout><FeaturePlaceholder title="Application Approvals" category="Faculty Workflows" /></FacultyLayout>,
  },
  {
    path: '/faculty/students',
    element: <FacultyLayout><FeaturePlaceholder title="Assigned Students" category="Monitoring" /></FacultyLayout>,
  },
  {
    path: '/faculty/insights',
    element: <FacultyLayout><FeaturePlaceholder title="Risk Alerts & AI Insights" category="Analytics" /></FacultyLayout>,
  },

  // Company Routes Group
  {
    path: '/company',
    element: <CompanyLayout><CompanyDashboard /></CompanyLayout>,
  },
  {
    path: '/company/listings',
    element: <CompanyLayout><FeaturePlaceholder title="Internship Listings" category="Company Operations" /></CompanyLayout>,
  },
  {
    path: '/company/applicants',
    element: <CompanyLayout><FeaturePlaceholder title="Applicant Selection Pipeline" category="Company Operations" /></CompanyLayout>,
  },
  {
    path: '/company/interns',
    element: <CompanyLayout><FeaturePlaceholder title="Active Interns & Tasks" category="Monitoring" /></CompanyLayout>,
  },
  {
    path: '/company/evaluations',
    element: <CompanyLayout><FeaturePlaceholder title="Performance Evaluations" category="Completion" /></CompanyLayout>,
  },

  // Admin Routes Group
  {
    path: '/admin',
    element: <AdminLayout><AdminDashboard /></AdminLayout>,
  },
  {
    path: '/admin/users',
    element: <AdminLayout><FeaturePlaceholder title="User Management" category="Admin Operations" /></AdminLayout>,
  },
  {
    path: '/admin/internships',
    element: <AdminLayout><FeaturePlaceholder title="Platform Internships" category="Admin Operations" /></AdminLayout>,
  },
  {
    path: '/admin/certificates',
    element: <AdminLayout><FeaturePlaceholder title="Certificates Oversight" category="Admin Operations" /></AdminLayout>,
  },
  {
    path: '/admin/analytics',
    element: <AdminLayout><FeaturePlaceholder title="Analytics & AI Services" category="System Oversight" /></AdminLayout>,
  },

  // Fallback Route
  { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};