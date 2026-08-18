import React, { useState } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components';
import { mockApplications } from '@/features/applications/data/mockApplications';
import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import { mockAttendanceHistory, calculateAttendanceMetrics } from '@/features/attendance/data/mockAttendance';
import { initialMockTasks } from '@/features/tasks/data/mockTasks';
import { InternshipDeadlinesDashboardCard } from './components/InternshipDeadlinesDashboardCard';
import { Briefcase, FileText, Award, ArrowRight, Clock, CheckSquare, Sparkles, MessageCircle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const [isIntern] = useState<boolean>(true); // Dynamic student state indicator
  const activeInternship = mockActiveInternshipData;
  const attendance = calculateAttendanceMetrics(mockAttendanceHistory);
  const openTasks = initialMockTasks.filter((t) => t.status !== 'Completed').length;
  const applicationCount = mockApplications.length;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Student Workspace Dashboard"
        description="Monitor your active internship, application pipelines, daily productivity, and career roadmaps."
      />

      {/* Non-Intern Student Onboarding Card */}
      {!isIntern && (
        <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base">You haven't started an internship yet</h3>
          </div>
          <p className="text-xs text-indigo-100 max-w-2xl leading-relaxed">
            Follow your personalized preparation checklist to complete your profile, discuss skill gaps with your Faculty Mentor, and explore verified opportunities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">1. Complete Profile</div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">2. Review Skill Gaps</div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">3. Target Open Roles</div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">4. Interview Prep</div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/student/chat">
              <Button size="sm" variant="primary" className="bg-indigo-600 text-white hover:bg-indigo-700">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Talk to Faculty Mentor
              </Button>
            </Link>
            <Link to="/student/internships">
              <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                Explore Internships
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 2. Key Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">ACTIVE INTERNSHIP</span>
            <span className="text-sm font-bold text-slate-900 truncate block max-w-[140px]">
              {isIntern && activeInternship ? activeInternship.companyName : 'None Active'}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">APPLICATIONS</span>
            <span className="text-sm font-bold text-slate-900">{applicationCount} Submitted</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">ATTENDANCE</span>
            <span className="text-sm font-bold text-slate-900">{isIntern ? `${attendance.attendancePercentage}%` : 'N/A'}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">OPEN TASKS</span>
            <span className="text-sm font-bold text-slate-900">{isIntern ? `${openTasks} Open` : '0 Open'}</span>
          </div>
        </Card>
      </div>

      {/* 3. Priority Internship Deadlines Section */}
      <InternshipDeadlinesDashboardCard />

      {/* 4. Active Internship Journey */}
      {isIntern && activeInternship && (
        <Card title="Active Internship Journey" subtitle="Current active enrollment details and milestones">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{activeInternship.internshipTitle}</h4>
                <p className="text-indigo-600 font-semibold">{activeInternship.companyName} â€¢ {activeInternship.workMode}</p>
              </div>
              <Link to="/student/internships">
                <Badge variant="indigo" className="hover:bg-indigo-700 cursor-pointer">
                  Go to Internship Journey â†’
                </Badge>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};