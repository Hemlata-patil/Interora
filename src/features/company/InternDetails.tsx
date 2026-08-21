import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge } from '@/components';
import { 
  CheckCircle2, Clock, X, AlertCircle, ArrowLeft
} from 'lucide-react';
import { 
  mockCompanyApplications, 
  mockFacultyStudents, 
  mockCompanyInternships
} from '../faculty/mockData';

export const InternDetails: React.FC = () => {
  const { internId } = useParams<{ internId: string }>();
  const navigate = useNavigate();

  // Find the selected intern
  const selectedIntern = useMemo(() => {
    // We expect internId to be the student ID or app ID, but let's check app first
    // If not found, check studentId
    const app = mockCompanyApplications.find(a => 
      a.applicationStatus === 'Selected' && (a.id === internId || a.studentId === internId)
    );
    
    if (!app) return null;

    const student = mockFacultyStudents.find(s => s.id === app.studentId);
    const internship = mockCompanyInternships.find(i => i.id === app.internshipId);

    if (student && internship) {
      return { app, student, internship };
    }
    return null;
  }, [internId]);

  if (!selectedIntern) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-8">
        <PageHeader title="Intern Not Found" />
        <Card className="text-center py-16 shadow-sm border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">Intern Not Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto mb-6">
            The selected internship record could not be found or you do not have access to it.
          </p>
          <Button onClick={() => navigate('/company/interns')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Interns
          </Button>
        </Card>
      </div>
    );
  }

  const { student, internship } = selectedIntern;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Active': return <Badge variant="emerald" className="py-0.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active</Badge>;
      case 'Completed': return <Badge variant="neutral" className="py-0.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Completed</Badge>;
      case 'At Risk': return <Badge variant="rose" className="py-0.5"><AlertCircle className="w-3.5 h-3.5 mr-1" /> At Risk</Badge>;
      case 'Not Started': return <Badge variant="neutral" className="py-0.5"><Clock className="w-3.5 h-3.5 mr-1" /> Upcoming</Badge>;
      default: return null;
    }
  };

  const getHealthBadge = (indicator: string) => {
    if (indicator === 'None') {
      return <Badge variant="emerald" className="bg-emerald-50 text-[10px] py-0 px-2">On Track</Badge>;
    }
    return <Badge variant="amber" className="bg-amber-50 text-[10px] py-0 px-2">Needs Attention</Badge>;
  };

  const getHealthText = (indicator: string) => {
    if (indicator === 'None') {
      return "Progress is currently aligned with the internship timeline.";
    }
    return "This internship requires attention due to recent inactivity or missed logs.";
  };

  const getHealthColor = (indicator: string) => {
    return indicator === 'None' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/company/interns')} className="p-2 h-auto text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PageHeader
            title={student.studentName}
            description={`${internship.title} • ${internship.companyId === 'company-1' ? 'TechCorp' : 'Interora'}`}
          />
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(student.internshipStatus)}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end gap-3 mb-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/company/my-interns/${student.id}/tasks`)}>View Tasks</Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/company/my-interns/${student.id}/milestones`)}>View Milestones</Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/company/my-interns/${student.id}/evaluations`)}>View Evaluations</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Student & Internship Information" className="shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Student</h4>
                <p className="font-semibold text-slate-900">{student.studentName}</p>
                <p className="text-sm text-slate-500">{student.email}</p>
                <p className="text-sm text-slate-500 mt-1">{student.department} • Batch of {student.batchYear}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {student.skills.map((skill, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Internship</h4>
                <p className="font-semibold text-slate-900">{internship.title}</p>
                <p className="text-sm text-slate-500">{internship.domain}</p>
                <p className="text-sm text-slate-500 mt-1">{internship.duration} • {student.workMode}</p>
                <p className="text-sm text-slate-500">{student.startDate} - {student.endDate}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Faculty Mentor</h4>
                <p className="font-medium text-slate-900">Dr. Mehta (Mock)</p>
                <p className="text-xs text-slate-500">Computer Science Dept</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Industry Mentor</h4>
                <p className="font-medium text-slate-900">Amit Sharma (Mock)</p>
                <p className="text-xs text-slate-500">Senior Engineering Manager</p>
              </div>
            </div>
          </Card>

          <Card title="Overall Progress" className="shadow-sm">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-slate-700">Internship Completion</span>
              <span className="font-bold text-indigo-600">{student.progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${student.progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-4 mb-4">
              <div className="text-slate-600">
                <span className="font-semibold text-slate-900">12</span> of 18 tasks completed
              </div>
              <div className="text-slate-600">
                <span className="font-semibold text-slate-900">{student.milestones.filter(m => m.completed).length}</span> of {student.milestones.length} milestones completed
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 font-medium mb-1">Progress</div>
                <div className="text-lg font-bold text-indigo-700">{student.progressPercentage}%</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 font-medium mb-1">Tasks</div>
                <div className="text-lg font-bold text-slate-900">12 / 18</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 font-medium mb-1">Milestones</div>
                <div className="text-lg font-bold text-slate-900">{student.milestones.filter(m => m.completed).length} / {student.milestones.length}</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 font-medium mb-1">Evaluations</div>
                <div className="text-lg font-bold text-slate-900">{student.companyEvaluation ? 1 : 0} / 2</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-900">Tasks & Proofs</h3>
              </div>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tasks</h4>
                  <div className="flex justify-between border-b border-slate-100 pb-2 mb-2"><span>Completed</span><span className="font-bold text-emerald-600">12</span></div>
                  <div className="flex justify-between"><span>Pending</span><span className="font-bold text-amber-600">6</span></div>
                </div>
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Proof Submission</h4>
                  <div className="flex justify-between border-b border-slate-100 pb-2 mb-2"><span>Submitted</span><span className="font-bold text-indigo-600">9</span></div>
                  <div className="flex justify-between"><span>Pending Review</span><span className="font-bold text-amber-600">3</span></div>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-900">Milestone Progress</h3>
              </div>
              <div className="space-y-3">
                {student.milestones.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-slate-900">{m.title}</span>
                      {m.completed ? (
                        <Badge variant="emerald" className="text-[10px] py-0 px-1.5 bg-emerald-100 text-emerald-700">Completed</Badge>
                      ) : (
                        <Badge variant="amber" className="text-[10px] py-0 px-1.5 bg-amber-100 text-amber-700">In Progress</Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">Due: {student.endDate}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card title="Internship Health" className="shadow-sm">
            <div className={`p-4 rounded-xl border ${getHealthColor(student.riskIndicator)} text-center`}>
              <div className="text-lg font-bold mb-1">
                {student.riskIndicator === 'None' ? 'On Track' : 'Needs Attention'}
              </div>
              <p className="text-xs opacity-90">
                {getHealthText(student.riskIndicator)}
              </p>
            </div>
          </Card>

          <Card title="Attendance Summary" className="shadow-sm bg-indigo-50/30 border-indigo-100">
            <div className="mb-4 text-center">
              <span className="text-3xl font-black text-indigo-600">
                {Math.round((student.attendance.present / student.attendance.workingDays) * 100) || 0}%
              </span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Attendance Rate</p>
            </div>
            <div className="flex justify-between text-sm border-t border-indigo-100 pt-3">
              <div className="text-center">
                <span className="block font-bold text-emerald-600">{student.attendance.present}</span>
                <span className="text-[10px] text-slate-500">Present</span>
              </div>
              <div className="text-center border-l border-indigo-100 pl-4">
                <span className="block font-bold text-rose-600">{student.attendance.absent}</span>
                <span className="text-[10px] text-slate-500">Absent</span>
              </div>
            </div>
          </Card>

          <Card title="Evaluation Status" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Mid-Term Evaluation</h4>
                {student.companyEvaluation ? (
                  <Badge variant="emerald" className="bg-emerald-50 px-2 py-0.5 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>
                ) : (
                  <Badge variant="amber" className="bg-amber-50 px-2 py-0.5 text-xs"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Final Evaluation</h4>
                <Badge variant="neutral" className="bg-slate-50 px-2 py-0.5 text-xs">Pending</Badge>
              </div>
            </div>
          </Card>

          <Card title="Recent Activity" className="shadow-sm">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {student.timeline.slice(0, 4).map((event, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-slate-100 bg-white shadow-sm">
                    <time className="text-[10px] font-medium text-slate-400">{event.date}</time>
                    <div className="text-xs font-medium text-slate-700 mt-0.5">{event.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
