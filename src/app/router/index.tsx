import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { VerifyCertificatePage } from '@/pages/VerifyCertificatePage';
import { StudentLayout, FacultyLayout, CompanyLayout, AdminLayout, MentorLayout, HodLayout } from '@/app/layouts/RoleLayouts';

import { StudentDashboard } from '@/features/student/StudentDashboard';
import { StudentProfile } from '@/features/student/StudentProfile';
import { StudentOnboarding } from '@/features/student/StudentOnboarding';
import { StudentChat } from '@/features/student/StudentChat';
import { StudentCareerPrep } from '@/features/student/StudentCareerPrep';
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
import { CompanyAttendance } from '@/features/company/CompanyAttendance';
import { CompanyReports } from '@/features/company/CompanyReports';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { AdminUsers } from '@/features/admin/AdminUsers';
import { AdminInternships } from '@/features/admin/AdminInternships';
import { AdminCertificates } from '@/features/admin/AdminCertificates';
import { AdminAnalytics } from '@/features/admin/AdminAnalytics';
import { AdminApplications } from '@/features/admin/AdminApplications';
import { AdminProfile } from '@/features/admin/AdminProfile';
import { AdminPPOs } from '@/features/admin/AdminPPOs';
import { AdminCompanies } from '@/features/admin/AdminCompanies';
import { AdminHODs } from '@/features/admin/AdminHODs';
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
import { FacultyProfile } from '@/features/faculty/FacultyProfile';
import { StudentGuidance } from '@/features/faculty/StudentGuidance';
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';
import { HodDashboard } from '@/features/hod/HodDashboard';
import { HodFaculty } from '@/features/hod/HodFaculty';
import { HodStudents } from '@/features/hod/HodStudents';
import { HodAssignments } from '@/features/hod/HodAssignments';
import { HodProgress } from '@/features/hod/HodProgress';
import { HodInternships } from '@/features/hod/HodInternships';
import { HodProfile } from '@/features/hod/HodProfile';

const router = createBrowserRouter([
  // Public Routes
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/onboarding', element: <StudentOnboarding /> },
  { path: '/student/onboarding', element: <StudentOnboarding /> },
  { path: '/verify/:token', element: <VerifyCertificatePage /> },

  // Student Routes Group (Persistent Layout Route)
  {
    path: '/student',
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'internships', element: <MarketplacePage /> },
      { path: 'internships/:id', element: <InternshipDetailsPage /> },
      { path: 'internships/:id/apply', element: <ApplyInternshipPage /> },
      { path: 'internship', element: <ActiveInternshipPage /> },
      { path: 'applications', element: <ApplicationsPage /> },
      { path: 'applications/:id', element: <ApplicationDetailsPage /> },
      { path: 'chat', element: <StudentChat /> },
      { path: 'career-prep', element: <StudentCareerPrep /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'tasks/:id', element: <TaskDetailsPage /> },
      { path: 'work-logs', element: <WorkLogsPage /> },
      { path: 'milestones', element: <MilestonesPage /> },
      { path: 'certificates', element: <CertificatesPage /> },
      { path: 'certificate', element: <CertificatesPage /> },
      { path: 'ai-career', element: <AICareerPage /> },
      { path: 'profile', element: <StudentProfile /> },
    ],
  },

  // Faculty Routes Group (Persistent Layout Route)
  {
    path: '/faculty',
    element: <FacultyLayout />,
    children: [
      { index: true, element: <FacultyDashboard /> },
      { path: 'approvals', element: <ApplicationApprovals /> },
      { path: 'students', element: <AssignedStudents /> },
      { path: 'insights', element: <InternshipInsights /> },
      { path: 'attendance', element: <AttendanceMonitoring /> },
      { path: 'cross-verification', element: <CrossVerification /> },
      { path: 'guidance', element: <StudentGuidance /> },
      { path: 'evaluations', element: <StudentEvaluations /> },
      { path: 'placement-analytics', element: <PlacementAnalytics /> },
      { path: 'profile', element: <FacultyProfile /> },
    ],
  },

  // Company Routes Group (Persistent Layout Route)
  {
    path: '/company',
    element: <CompanyLayout />,
    children: [
      { index: true, element: <CompanyDashboard /> },
      { path: 'profile', element: <CompanyProfile /> },
      { path: 'listings', element: <InternshipManagement /> },
      { path: 'applicants', element: <ApplicantManagement /> },
      { path: 'interns', element: <MyInterns /> },
      { path: 'my-interns/:internId', element: <InternDetails /> },
      { path: 'tasks', element: <CompanyTasks /> },
      { path: 'my-interns/:internId/tasks', element: <CompanyTasks /> },
      { path: 'milestones', element: <CompanyMilestones /> },
      { path: 'my-interns/:internId/milestones', element: <CompanyMilestones /> },
      { path: 'evaluations', element: <CompanyEvaluations /> },
      { path: 'my-interns/:internId/evaluations', element: <CompanyEvaluations /> },
      { path: 'ppo', element: <CompanyPPO /> },
      { path: 'certificates', element: <CompanyCertificates /> },
      { path: 'notifications', element: <CompanyNotifications /> },
      { path: 'mentors', element: <MentorManagement /> },
      { path: 'attendance', element: <CompanyAttendance /> },
      { path: 'reports', element: <CompanyReports /> },
    ],
  },

  // Mentor Routes Group (Persistent Layout Route)
  {
    path: '/mentor',
    element: <MentorLayout />,
    children: [
      { index: true, element: <MentorDashboard /> },
      { path: 'interns', element: <MentorMyInterns /> },
      { path: 'tasks', element: <MentorTasks /> },
      { path: 'milestones', element: <MentorMilestones /> },
      { path: 'evaluations', element: <MentorEvaluations /> },
      { path: 'notifications', element: <MentorNotifications /> },
    ],
  },

  // Admin Routes Group (Persistent Layout Route)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'applications', element: <AdminApplications /> },
      { path: 'ppos', element: <AdminPPOs /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'internships', element: <AdminInternships /> },
      { path: 'companies', element: <AdminCompanies /> },
      { path: 'hods', element: <AdminHODs /> },
      { path: 'certificates', element: <AdminCertificates /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'profile', element: <AdminProfile /> },
    ],
  },

  // HOD Routes Group (Persistent Layout Route)
  {
    path: '/hod',
    element: <HodLayout />,
    children: [
      { index: true, element: <HodDashboard /> },
      { path: 'faculty', element: <HodFaculty /> },
      { path: 'students', element: <HodStudents /> },
      { path: 'assignments', element: <HodAssignments /> },
      { path: 'progress', element: <HodProgress /> },
      { path: 'internships', element: <HodInternships /> },
      { path: 'profile', element: <HodProfile /> },
    ],
  },

  // Fallback Route
  { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};