import React from 'react';
import { PageHeader, StatCard, Card, Badge, Button, ProgressBar } from '@/components';
import {
  Users,
  Briefcase,
  FileText,
  Building2,
  GraduationCap,
  Award,
  CheckSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  mockFacultyStudents,
  mockCompanyInternships,
  mockCompanyApplications,
  mockCompanyCertificates,
  mockCompanyMentors,
  mockCompanyPPOs,
} from '@/features/faculty/mockData';
import { initialCompanyApplications } from './AdminCompanies';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  // 1. Dynamic Calculations from Canonical Data
  const totalStudents = mockFacultyStudents.length;
  const activeInternships = mockCompanyInternships.filter((i) => i.status === 'published').length || mockCompanyInternships.length;
  const pendingApplications = mockCompanyApplications.filter((a) => a.applicationStatus === 'Under Review' || a.applicationStatus === 'Shortlisted').length;
  const pendingCompanies = initialCompanyApplications.filter((c) => c.status === 'Pending').length;
  const facultyMentorsCount = 3; // Faculty mentors count
  const activeInternsCount = mockFacultyStudents.filter((s) => s.internshipStatus === 'Active').length;
  const pposPendingCount = mockCompanyPPOs.filter((p) => p.status !== 'Offered' && p.status !== 'Accepted').length || 1;
  const certsPendingCount = mockCompanyCertificates.filter((c) => c.status !== 'Issued').length || 0;

  // Analytics Ratios
  const completedInternsCount = mockFacultyStudents.filter((s) => s.internshipStatus === 'Completed').length;
  const placementRate = Math.round(((activeInternsCount + completedInternsCount) / (totalStudents || 1)) * 100);
  const selectedAppsCount = mockCompanyApplications.filter((a) => a.applicationStatus === 'Selected').length;
  const conversionRate = Math.round((selectedAppsCount / (mockCompanyApplications.length || 1)) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Placement Dashboard"
        description="Centralized oversight of students, internships, applications, placements, companies, faculty mentors and certificates."
      />

      {/* 8 Dynamic Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={`${totalStudents} Registered`}
          icon={Users}
          description="Enrolled student accounts"
        />
        <StatCard
          title="Active Internships"
          value={`${activeInternships} Approved`}
          icon={Briefcase}
          description="Verified partner postings"
        />
        <StatCard
          title="Pending Applications"
          value={`${pendingApplications} For Review`}
          icon={FileText}
          description="Student submissions"
        />
        <StatCard
          title="Pending Companies"
          value={`${pendingCompanies} Applications`}
          icon={Building2}
          description="Industry partner requests"
        />
        <StatCard
          title="Faculty Mentors"
          value={`${facultyMentorsCount} Active`}
          icon={GraduationCap}
          description="Academic advisors"
        />
        <StatCard
          title="Active Interns"
          value={`${activeInternsCount} Students`}
          icon={Users}
          description="On-site / Remote"
        />
        <StatCard
          title="PPO Pending Verification"
          value={`${pposPendingCount} Reviews`}
          icon={CheckSquare}
          description="Pre-placement offers"
        />
        <StatCard
          title="Certificates Pending"
          value={`${certsPendingCount} Verification`}
          icon={Award}
          description="Completion credentials"
        />
      </div>

      {/* Pending Actions Section */}
      <Card title="Pending TPO Actions & Oversight" className="border-indigo-100 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 text-sm">Student Applications</span>
                <Badge variant="amber">{pendingApplications} Pending</Badge>
              </div>
              <p className="text-slate-500">Student internship applications require TPO verification and referral.</p>
            </div>
            <Link to="/admin/applications">
              <Button variant="primary" size="sm" className="w-full flex items-center justify-center gap-1.5 text-xs">
                Review Applications <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 text-sm">Company Applications</span>
                <Badge variant="sky">{pendingCompanies} Pending</Badge>
              </div>
              <p className="text-slate-500">Corporate registration applications awaiting TPO account approval.</p>
            </div>
            <Link to="/admin/companies">
              <Button variant="primary" size="sm" className="w-full flex items-center justify-center gap-1.5 text-xs">
                Review Companies <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 text-sm">PPO Approvals</span>
                <Badge variant="emerald">{pposPendingCount} Pending</Badge>
              </div>
              <p className="text-slate-500">Pre-placement offers awaiting TPO verification before faculty release.</p>
            </div>
            <Link to="/admin/ppos">
              <Button variant="primary" size="sm" className="w-full flex items-center justify-center gap-1.5 text-xs">
                Review PPOs <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Analytics Preview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Recruitment Analytics Preview" className="md:col-span-2">
          <div className="space-y-4 pt-1 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Overall Student Placement Rate</span>
                <span className="text-indigo-600 font-bold">{placementRate}%</span>
              </div>
              <ProgressBar progress={placementRate} />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Application Conversion Ratio</span>
                <span className="text-emerald-600 font-bold">{conversionRate}%</span>
              </div>
              <ProgressBar progress={conversionRate} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Total Applications</span>
                <span className="font-bold text-slate-800 text-sm">{mockCompanyApplications.length}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Selected Interns</span>
                <span className="font-bold text-emerald-600 text-sm">{selectedAppsCount}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Industry Mentors</span>
                <span className="font-bold text-sky-600 text-sm">{mockCompanyMentors.length}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">PPOs Issued</span>
                <span className="font-bold text-indigo-600 text-sm">{mockCompanyPPOs.length}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Link to="/admin/analytics">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> View Full System Analytics
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Recent Activity Section */}
        <Card title="Recent TPO Activity">
          <div className="space-y-3 text-xs pt-1">
            <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <Activity className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Student Application Submitted</span>
                <span className="text-slate-500 text-[11px]">Sarah Smith applied for Data Science Intern at DataCorp</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Company Account Approved</span>
                <span className="text-slate-500 text-[11px]">TechCorp Solutions verified by TPO</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <GraduationCap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Faculty Advisor Account Created</span>
                <span className="text-slate-500 text-[11px]">Dr. Rajesh Sharma assigned to CSE department</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">PPO Offer Verified</span>
                <span className="text-slate-500 text-[11px]">Junior Frontend Developer offer for Sarah Smith</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
