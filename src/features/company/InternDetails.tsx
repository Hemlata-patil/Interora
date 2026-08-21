import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge } from '@/components';
import { CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/services/supabase/supabaseClient';
import {
  fetchCompanyInternAttendanceBackend,
  fetchCompanyInternMilestonesBackend,
  fetchCompanyInternEvaluationsBackend,
  createCompanyInternEvaluationBackend,
  type CompanyInternAttendanceSummary,
  type CompanyInternMilestoneRecord,
  type CompanyInternEvaluationRecord,
} from '@/services/api/backendService';

export const InternDetails: React.FC = () => {
  const { internId } = useParams<{ internId: string }>();
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState<string>('Student Candidate');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [internshipTitle, setInternshipTitle] = useState<string>('Internship Role');
  const [internshipId, setInternshipId] = useState<string>('');
  const [attendance, setAttendance] = useState<CompanyInternAttendanceSummary | null>(null);
  const [milestones, setMilestones] = useState<CompanyInternMilestoneRecord[]>([]);
  const [evaluations, setEvaluations] = useState<CompanyInternEvaluationRecord[]>([]);
  const [evalScore, setEvalScore] = useState<number>(85);
  const [evalRemarks, setEvalRemarks] = useState<string>('Excellent performance, strong technical skills and attendance.');
  const [submittingEval, setSubmittingEval] = useState<boolean>(false);

  const loadDetails = async () => {
    if (!internId) return;

    const targetId = internId;

    const { data: prof } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', targetId)
      .maybeSingle();

    if (prof) {
      setStudentName(prof.full_name || 'Student Candidate');
      setStudentEmail(prof.email || '');
    }

    const { data: apps } = await supabase
      .from('student_applications')
      .select('*, internship_postings(id, title)')
      .eq('student_id', targetId)
      .eq('status', 'Selected')
      .maybeSingle();

    if (apps) {
      setInternshipTitle(apps.internship_postings?.title || 'Active Internship Role');
      setInternshipId(apps.internship_id);
    }

    const att = await fetchCompanyInternAttendanceBackend(targetId);
    setAttendance(att);

    const ms = await fetchCompanyInternMilestonesBackend(targetId);
    setMilestones(ms);

    const evs = await fetchCompanyInternEvaluationsBackend(targetId);
    setEvaluations(evs);
  };

  useEffect(() => {
    loadDetails();

    if (!internId) return;

    // Subscribe to Realtime postgres changes on attendance, milestones, evaluations for this intern
    const channel = supabase
      .channel(`intern_details_realtime_${internId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${internId}` },
        () => loadDetails()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_milestones', filter: `student_id=eq.${internId}` },
        () => loadDetails()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_evaluations', filter: `student_id=eq.${internId}` },
        () => loadDetails()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [internId]);

  const handleAddEvaluation = async () => {
    if (!internId || !internshipId) return;
    setSubmittingEval(true);
    await createCompanyInternEvaluationBackend(internId, internshipId, evalScore, evalRemarks);
    await loadDetails();
    setSubmittingEval(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/company/my-interns')} className="mb-2 text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Interns
        </Button>
        <PageHeader
          title={studentName}
          description={`Active Intern for ${internshipTitle}`}
          action={
            <Badge variant="emerald" className="py-1 px-3 text-xs">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Active Selected Intern
            </Badge>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Intern Information & Progress Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">STUDENT EMAIL</span>
                <span className="font-bold text-slate-800 text-sm truncate block">{studentEmail || 'student@interora.app'}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">POSITION ROLE</span>
                <span className="font-bold text-indigo-700 text-sm truncate block">{internshipTitle}</span>
              </div>
            </div>
          </Card>

          <Card title="Milestones & Deliverables">
            {milestones.length > 0 ? (
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{m.title}</h4>
                      <p className="text-slate-500 text-[11px]">{m.description}</p>
                    </div>
                    <Badge variant={m.status === 'Completed' ? 'emerald' : 'amber'}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No custom milestones assigned yet.</p>
            )}
          </Card>

          <Card title="Performance Evaluations & Review Score">
            {evaluations.length > 0 ? (
              <div className="space-y-3 mb-4">
                {evaluations.map((ev) => (
                  <div key={ev.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>Evaluator Score: {ev.score}%</span>
                      <span className="text-slate-400 font-normal">{new Date(ev.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 italic">"{ev.remarks}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic mb-4">No evaluations logged yet.</p>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 pt-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Log New Internship Evaluation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Score (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evalScore}
                    onChange={(e) => setEvalScore(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Remarks & Performance Notes</label>
                  <input
                    type="text"
                    value={evalRemarks}
                    onChange={(e) => setEvalRemarks(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button variant="primary" size="sm" onClick={handleAddEvaluation} disabled={submittingEval}>
                  {submittingEval ? 'Submitting...' : 'Save Evaluation'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Attendance Summary" className="shadow-sm bg-indigo-50/30 border-indigo-100">
            <div className="mb-4 text-center">
              <span className="text-3xl font-black text-indigo-600">
                {attendance?.attendancePercentage ?? 100}%
              </span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Compliance Rate</p>
            </div>
            <div className="flex justify-between text-sm border-t border-indigo-100 pt-3">
              <div className="text-center">
                <span className="block font-bold text-emerald-600">{attendance?.presentCount ?? 0}</span>
                <span className="text-[10px] text-slate-500">Present</span>
              </div>
              <div className="text-center border-l border-indigo-100 pl-4">
                <span className="block font-bold text-slate-800">{attendance?.totalRecords ?? 0}</span>
                <span className="text-[10px] text-slate-500">Total Check-ins</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
