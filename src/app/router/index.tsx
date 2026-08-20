import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { VerifyCertificatePage } from '@/pages/VerifyCertificatePage';
import { StudentLayout, FacultyLayout, CompanyLayout, AdminLayout, MentorLayout } from '@/app/layouts/RoleLayouts';

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
import { CompanyProfile } from '@/features/company/CompanyProfile';
import { InternshipManagement } from '@/features/company/InternshipManagement';
import { ApplicantManagement } from '@/features/company/ApplicantManagement';
import { MyInterns } from '@/features/company/MyInterns';
import { InternDetails } from '@/features/company/InternDetails';
import { CompanyTasks } from '@/features/company/CompanyTasks';
import { CompanyMilestones } from '@/features/company/CompanyMilestones';
import { CompanyEvaluations } from '@/features/company/CompanyEvaluations';
import { CompanyPPO } from '@/features/company/CompanyPPO';
import { CompanyCertificates } from '@/features/company/CompanyCertificates';
import { CompanyNotifications } from '@/features/company/CompanyNotifications';
import { MentorManagement } from '@/features/company/MentorManagement';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { AdminUsers } from '@/features/admin/AdminUsers';
import { AdminInternships } from '@/features/admin/AdminInternships';
import { AdminCertificates } from '@/features/admin/AdminCertificates';
import { AdminAnalytics } from '@/features/admin/AdminAnalytics';
import { AdminApplications } from '@/features/admin/AdminApplications';
import { AdminProfile } from '@/features/admin/AdminProfile';
import { AdminPPOs } from '@/features/admin/AdminPPOs';
import { AdminCompanies } from '@/features/admin/AdminCompanies';
import { AdminFacultyMentors } from '@/features/admin/AdminFacultyMentors';
import { MentorDashboard } from '@/features/companyMentor/MentorDashboard';
import { MentorMyInterns } from '@/features/companyMentor/MentorMyInterns';
import { MentorTasks } from '@/features/companyMentor/MentorTasks';
import { MentorMilestones } from '@/features/companyMentor/MentorMilestones';
import { MentorEvaluations } from '@/features/companyMentor/MentorEvaluations';
import { MentorNotifications } from '@/features/companyMentor/MentorNotifications';
import { ApplicationApprovals } from '@/features/faculty/ApplicationApprovals';
import { AssignedStudents } from '@/features/faculty/AssignedStudents';
import { AttendanceMonitoring } from '@/features/faculty/AttendanceMonitoring';
import { InternshipInsights } from '@/features/faculty/InternshipInsights';
import { CrossVerification } from '@/features/faculty/CrossVerification';
import { StudentEvaluations } from '@/features/faculty/StudentEvaluations';
import { PlacementAnalytics } from '@/features/faculty/PlacementAnalytics';
import { StudentGuidance } from '@/features/faculty/StudentGuidance';
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
    element: <FacultyLayout><ApplicationApprovals /></FacultyLayout>,
  },
  {
    path: '/faculty/students',
    element: <FacultyLayout><AssignedStudents /></FacultyLayout>,
  },
  {
    path: '/faculty/insights',
    element: <FacultyLayout><InternshipInsights /></FacultyLayout>,
  },
  {
    path: '/faculty/attendance',
    element: <FacultyLayout><AttendanceMonitoring /></FacultyLayout>,
  },
  {
    path: '/faculty/cross-verification',
    element: <FacultyLayout><CrossVerification /></FacultyLayout>,
  },
  {
    path: '/faculty/guidance',
    element: <FacultyLayout><StudentGuidance /></FacultyLayout>,
  },
  {
    path: '/faculty/evaluations',
    element: <FacultyLayout><StudentEvaluations /></FacultyLayout>,
  },
  {
    path: '/faculty/placement-analytics',
    element: <FacultyLayout><PlacementAnalytics /></FacultyLayout>,
  },

  // Company Routes Group
  {
    path: '/company',
    element: <CompanyLayout><CompanyDashboard /></CompanyLayout>,
  },
  {
    path: '/company/profile',
    element: <CompanyLayout><CompanyProfile /></CompanyLayout>,
  },
  {
    path: '/company/listings',
    element: <CompanyLayout><InternshipManagement /></CompanyLayout>,
  },
  {
    path: '/company/applicants',
    element: <CompanyLayout><ApplicantManagement /></CompanyLayout>,
  },
  {
    path: '/company/interns',
    element: <CompanyLayout><MyInterns /></CompanyLayout>,
  },
  {
    path: '/company/my-interns/:internId',
    element: <CompanyLayout><InternDetails /></CompanyLayout>,
  },
  {
    path: '/company/tasks',
    element: <CompanyLayout><CompanyTasks /></CompanyLayout>,
  },
  {
    path: '/company/my-interns/:internId/tasks',
    element: <CompanyLayout><CompanyTasks /></CompanyLayout>,
  },
  {
    path: '/company/milestones',
    element: <CompanyLayout><CompanyMilestones /></CompanyLayout>,
  },
  {
    path: '/company/my-interns/:internId/milestones',
    element: <CompanyLayout><CompanyMilestones /></CompanyLayout>,
  },
  {
    path: '/company/evaluations',
    element: <CompanyLayout><CompanyEvaluations /></CompanyLayout>,
  },
  {
    path: '/company/my-interns/:internId/evaluations',
    element: <CompanyLayout><CompanyEvaluations /></CompanyLayout>,
  },
  {
    path: '/company/ppo',
    element: <CompanyLayout><CompanyPPO /></CompanyLayout>,
  },
  {
    path: '/company/certificates',
    element: <CompanyLayout><CompanyCertificates /></CompanyLayout>,
  },
  {
    path: '/company/notifications',
    element: <CompanyLayout><CompanyNotifications /></CompanyLayout>,
  },
  {
    path: '/company/mentors',
    element: <CompanyLayout><MentorManagement /></CompanyLayout>,
  },

  // Mentor Routes Group
  {
    path: '/mentor',
    element: <MentorLayout><MentorDashboard /></MentorLayout>,
  },
  {
    path: '/mentor/interns',
    element: <MentorLayout><MentorMyInterns /></MentorLayout>,
  },
  {
    path: '/mentor/tasks',
    element: <MentorLayout><MentorTasks /></MentorLayout>,
  },
  {
    path: '/mentor/milestones',
    element: <MentorLayout><MentorMilestones /></MentorLayout>,
  },
  {
    path: '/mentor/evaluations',
    element: <MentorLayout><MentorEvaluations /></MentorLayout>,
  },
  {
    path: '/mentor/notifications',
    element: <MentorLayout><MentorNotifications /></MentorLayout>,
  },

  // Admin Routes Group
  {
    path: '/admin',
    element: <AdminLayout><AdminDashboard /></AdminLayout>,
  },
  {
    path: '/admin/applications',
    element: <AdminLayout><AdminApplications /></AdminLayout>,
  },
  {
    path: '/admin/ppos',
    element: <AdminLayout><AdminPPOs /></AdminLayout>,
  },
  {
    path: '/admin/users',
    element: <AdminLayout><AdminUsers /></AdminLayout>,
  },
  {
    path: '/admin/internships',
    element: <AdminLayout><AdminInternships /></AdminLayout>,
  },
  {
    path: '/admin/companies',
    element: <AdminLayout><AdminCompanies /></AdminLayout>,
  },
  {
    path: '/admin/faculty-mentors',
    element: <AdminLayout><AdminFacultyMentors /></AdminLayout>,
  },
  {
    path: '/admin/certificates',
    element: <AdminLayout><AdminCertificates /></AdminLayout>,
  },
  {
    path: '/admin/analytics',
    element: <AdminLayout><AdminAnalytics /></AdminLayout>,
  },
  {
    path: '/admin/profile',
    element: <AdminLayout><AdminProfile /></AdminLayout>,
  },

  // Fallback Route
  { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};