import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { VerifyCertificatePage } from '@/pages/VerifyCertificatePage';
import { StudentLayout, FacultyLayout, CompanyLayout, AdminLayout } from '@/app/layouts/RoleLayouts';

import { StudentDashboard } from '@/features/student/StudentDashboard';
import { StudentProfile } from '@/features/student/StudentProfile';
import { MarketplacePage } from '@/features/internships/MarketplacePage';
import { InternshipDetailsPage } from '@/features/internships/InternshipDetailsPage';
import { ActiveInternshipPage } from '@/features/internships/ActiveInternshipPage';
import { ApplyInternshipPage } from '@/features/applications/ApplyInternshipPage';
import { ApplicationsPage } from '@/features/applications/ApplicationsPage';
import { ApplicationDetailsPage } from '@/features/applications/ApplicationDetailsPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { TasksPage } from '@/features/tasks/TasksPage';
import { TaskDetailsPage } from '@/features/tasks/TaskDetailsPage';
import { WorkLogsPage } from '@/features/tasks/WorkLogsPage';
import { MilestonesPage } from '@/features/milestones/MilestonesPage';
import { CertificatesPage } from '@/features/certificates/CertificatesPage';
import { AICareerPage } from '@/features/ai/AICareerPage';

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
    element: <StudentLayout><MarketplacePage /></StudentLayout>,
  },
  {
    path: '/student/internships/:id',
    element: <StudentLayout><InternshipDetailsPage /></StudentLayout>,
  },
  {
    path: '/student/internships/:id/apply',
    element: <StudentLayout><ApplyInternshipPage /></StudentLayout>,
  },
  {
    path: '/student/internship',
    element: <StudentLayout><ActiveInternshipPage /></StudentLayout>,
  },
  {
    path: '/student/applications',
    element: <StudentLayout><ApplicationsPage /></StudentLayout>,
  },
  {
    path: '/student/applications/:id',
    element: <StudentLayout><ApplicationDetailsPage /></StudentLayout>,
  },
  {
    path: '/student/attendance',
    element: <StudentLayout><AttendancePage /></StudentLayout>,
  },
  {
    path: '/student/tasks',
    element: <StudentLayout><TasksPage /></StudentLayout>,
  },
  {
    path: '/student/tasks/:id',
    element: <StudentLayout><TaskDetailsPage /></StudentLayout>,
  },
  {
    path: '/student/work-logs',
    element: <StudentLayout><WorkLogsPage /></StudentLayout>,
  },
  {
    path: '/student/milestones',
    element: <StudentLayout><MilestonesPage /></StudentLayout>,
  },
  {
    path: '/student/certificates',
    element: <StudentLayout><CertificatesPage /></StudentLayout>,
  },
  {
    path: '/student/ai-career',
    element: <StudentLayout><AICareerPage /></StudentLayout>,
  },
  {
    path: '/student/certificate',
    element: <StudentLayout><CertificatesPage /></StudentLayout>,
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