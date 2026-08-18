import React, { useMemo } from 'react';
import { PageHeader, Card, StatCard, Badge, Button } from '@/components';
import { Users, CheckCircle2, Clock, AlertCircle, Activity, Briefcase } from 'lucide-react';
import { 
  mockCompanyApplications, 
  mockFacultyStudents, 
  mockCompanyInternships,
  MOCK_CURRENT_MENTOR_ID
} from '../faculty/mockData';
import { useNavigate } from 'react-router-dom';

export const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Compute joined selected interns for this mentor
  const mentorInterns = useMemo(() => {
    const selectedApps = mockCompanyApplications.filter(a => a.applicationStatus === 'Selected');
    
    return selectedApps.map(app => {
      const student = mockFacultyStudents.find(s => s.id === app.studentId);
      const internship = mockCompanyInternships.find(i => i.id === app.internshipId);
      
      // Filter strictly to MOCK_CURRENT_MENTOR_ID
      if (student && internship && internship.mentorId === MOCK_CURRENT_MENTOR_ID) {
        return { app, student, internship };
      }
      return null;
    }).filter(Boolean) as { app: any, student: any, internship: any }[];
  }, []);

  // Compute metrics
  const totalInterns = mentorInterns.length;
  const activeInterns = mentorInterns.filter(i => i.student.internshipStatus === 'Active').length;
  const atRiskInterns = mentorInterns.filter(i => i.student.riskIndicator !== 'None').length;
  const completedInterns = mentorInterns.filter(i => i.student.internshipStatus === 'Completed').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Industry Mentor Dashboard"
        description="Monitor and supervise your assigned interns and their day-to-day progress."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Interns" value={totalInterns.toString()} icon={Users} trend={{ value: "+2 this month", isPositive: true }} />
        <StatCard title="Active Interns" value={activeInterns.toString()} icon={Activity} />
        <StatCard title="At Risk" value={atRiskInterns.toString()} icon={AlertCircle} trend={{ value: "Needs attention", isPositive: false }} />
        <StatCard title="Completed" value={completedInterns.toString()} icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="My Assigned Interns" className="lg:col-span-2 shadow-sm flex flex-col h-full">
          {mentorInterns.length > 0 ? (
            <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Internship</th>
                    <th className="px-4 py-3 text-center">Progress</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mentorInterns.map(({ student, internship }) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate('/mentor/interns')}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{student.studentName}</div>
                        <div className="text-xs text-slate-500">{student.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{internship.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${student.progressPercentage > 75 ? 'bg-emerald-500' : student.progressPercentage > 40 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                              style={{ width: `${student.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 w-8">{student.progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {student.riskIndicator !== 'None' ? (
                          <Badge variant="amber" className="text-xs px-2"><AlertCircle className="w-3 h-3 mr-1" /> At Risk</Badge>
                        ) : (
                          <Badge variant="emerald" className="text-xs px-2"><CheckCircle2 className="w-3 h-3 mr-1" /> On Track</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 border-t border-slate-100 flex-1 flex items-center justify-center">
              You have no assigned interns currently.
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Attention Required" className="shadow-sm">
            <div className="space-y-3">
              {atRiskInterns > 0 ? mentorInterns.filter(i => i.student.riskIndicator !== 'None').map(({student}) => (
                <div key={student.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{student.studentName} is behind schedule.</h4>
                    <p className="text-xs text-slate-600 mt-1">Review their tasks and provide assistance.</p>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-lg">No critical alerts for your interns.</div>
              )}
            </div>
          </Card>

          <Card title="Milestone Monitoring" className="shadow-sm flex flex-col">
            <div className="space-y-4">
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-900">Current Phase</span>
                  <span className="text-xs font-bold text-indigo-700">75% Overall</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                {mentorInterns.slice(0, 3).map(({student}) => {
                  const isComplete = student.progressPercentage > 80;
                  const isRisk = student.progressPercentage < 50;
                  return (
                    <div key={student.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{student.studentName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-900">{student.progressPercentage}%</span>
                        {isComplete ? (
                          <Badge variant="emerald" className="text-[10px] px-1.5 py-0.5"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>
                        ) : isRisk ? (
                          <Badge variant="amber" className="text-[10px] px-1.5 py-0.5">At Risk</Badge>
                        ) : (
                          <Badge variant="indigo" className="text-[10px] px-1.5 py-0.5">In Progress</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 text-sm"
                onClick={() => navigate('/mentor/milestones')}
              >
                View Milestones
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
