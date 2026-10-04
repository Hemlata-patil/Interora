import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader, Card, Button, Alert } from '@/components';
import { FileCheck, Star, X, CheckCircle2, Loader2 } from 'lucide-react';
import {
  fetchCompanyMentorInternsBackend,
  fetchMentorEvaluationsBackend,
  createMentorEvaluationBackend,
  updateMentorEvaluationBackend,
  type CompanyMentorInternRecord,
} from '@/services/api/backendService';

export interface MentorEvaluationItem {
  id: string;
  assignmentId: string;
  studentId: string;
  evaluationType: string;
  evaluationPeriod: string;
  technicalSkills: number;
  qualityOfWork?: number;
  problemSolving: number;
  communication: number;
  teamwork?: number;
  professionalism: number;
  timeManagement?: number;
  overallRating: number;
  comments: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const MentorEvaluations: React.FC = () => {
  const [assignedStudents, setAssignedStudents] = useState<CompanyMentorInternRecord[]>([]);
  const [evaluations, setEvaluations] = useState<MentorEvaluationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<CompanyMentorInternRecord | null>(null);
  const [evalType, setEvalType] = useState<'Mid-Term Evaluation' | 'Final Evaluation'>('Mid-Term Evaluation');
  const [ratings, setRatings] = useState({
    technicalSkills: 0,
    communication: 0,
    professionalism: 0,
    problemSolving: 0,
    overallRating: 0,
  });
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [interns, evals] = await Promise.all([
        fetchCompanyMentorInternsBackend(),
        fetchMentorEvaluationsBackend(),
      ]);

      setAssignedStudents(interns || []);

      if (evals && evals.length > 0) {
        const mapped: MentorEvaluationItem[] = evals.map((e: any) => ({
          id: e.id,
          assignmentId: e.assignmentId || e.assignment?.id || '',
          studentId: e.assignment?.studentId || '',
          evaluationType: e.evaluationType === 'final' ? 'Final Evaluation' : 'Mid-Term Evaluation',
          evaluationPeriod: e.evaluationPeriod || 'Current',
          technicalSkills: Number(e.technicalSkills || 0),
          qualityOfWork: Number(e.qualityOfWork || 0),
          problemSolving: Number(e.problemSolving || 0),
          communication: Number(e.communication || 0),
          teamwork: Number(e.teamwork || 0),
          professionalism: Number(e.professionalism || 0),
          timeManagement: Number(e.timeManagement || 0),
          overallRating: Number(e.overallRating || 0),
          comments: e.comments || '',
          status: e.status || 'draft',
          createdAt: e.createdAt || '',
          updatedAt: e.updatedAt || '',
        }));
        setEvaluations(mapped);
      } else {
        setEvaluations([]);
      }
    } catch (err: any) {
      console.error('[MentorEvaluations] Failed to load evaluations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStudentEval = useCallback((studentId: string, assignmentId: string) => {
    return evaluations.find(
      (e) => (assignmentId && e.assignmentId === assignmentId) || (studentId && e.studentId === studentId)
    );
  }, [evaluations]);

  const handleOpenEval = (student: CompanyMentorInternRecord) => {
    setSelectedStudent(student);
    const existingEval = getStudentEval(student.studentId, student.assignmentId);

    if (existingEval) {
      setRatings({
        technicalSkills: existingEval.technicalSkills,
        communication: existingEval.communication,
        professionalism: existingEval.professionalism,
        problemSolving: existingEval.problemSolving,
        overallRating: existingEval.overallRating,
      });
      setFeedback(existingEval.comments || '');
      setEvalType(existingEval.evaluationType as 'Mid-Term Evaluation' | 'Final Evaluation');
    } else {
      setRatings({
        technicalSkills: 0,
        communication: 0,
        professionalism: 0,
        problemSolving: 0,
        overallRating: 0,
      });
      setFeedback('');
      setEvalType('Mid-Term Evaluation');
    }
    setErrorMsg('');
    setIsEvaluating(true);
  };

  const handleCloseEval = () => {
    setIsEvaluating(false);
    setSelectedStudent(null);
  };

  const handleSaveEval = async () => {
    if (!selectedStudent) return;

    // Validation
    const missingRatings = [
      ratings.technicalSkills,
      ratings.communication,
      ratings.professionalism,
      ratings.problemSolving,
    ].some((val) => val === 0);

    if (missingRatings) {
      setErrorMsg('Please select a rating (1-5) for all criteria.');
      return;
    }
    if (!feedback.trim()) {
      setErrorMsg('Please provide detailed feedback.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const existingEval = getStudentEval(selectedStudent.studentId, selectedStudent.assignmentId);
      const computedOverall = Math.round(
        ((ratings.technicalSkills + ratings.communication + ratings.professionalism + ratings.problemSolving) / 4) * 10
      ) / 10;

      if (existingEval) {
        // Update existing evaluation
        const res = await updateMentorEvaluationBackend(existingEval.id, {
          evaluationPeriod: 'Current',
          technicalSkills: ratings.technicalSkills,
          qualityOfWork: ratings.technicalSkills,
          problemSolving: ratings.problemSolving,
          communication: ratings.communication,
          teamwork: ratings.communication,
          professionalism: ratings.professionalism,
          timeManagement: ratings.professionalism,
          initiative: ratings.problemSolving,
          overallRating: computedOverall,
          comments: feedback.trim(),
        });

        if (!res.success) {
          throw new Error(res.error || 'Failed to update evaluation.');
        }
      } else {
        // Create new evaluation
        const res = await createMentorEvaluationBackend({
          assignmentId: selectedStudent.assignmentId,
          evaluationType: evalType === 'Final Evaluation' ? 'final' : 'mid_term',
          evaluationPeriod: 'Current',
          technicalSkills: ratings.technicalSkills,
          qualityOfWork: ratings.technicalSkills,
          problemSolving: ratings.problemSolving,
          communication: ratings.communication,
          teamwork: ratings.communication,
          professionalism: ratings.professionalism,
          timeManagement: ratings.professionalism,
          initiative: ratings.problemSolving,
          overallRating: computedOverall,
          comments: feedback.trim(),
          status: 'submitted',
        });

        if (!res.success) {
          throw new Error(res.error || 'Failed to submit evaluation.');
        }
      }

      await loadData();
      handleCloseEval();
    } catch (err: any) {
      console.error('[MentorEvaluations] Save error:', err);
      setErrorMsg(err.message || 'Failed to save evaluation.');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = useMemo(() => {
    return assignedStudents.filter((s) => !getStudentEval(s.studentId, s.assignmentId)).length;
  }, [assignedStudents, getStudentEval]);

  const completedCount = useMemo(() => {
    return assignedStudents.filter((s) => !!getStudentEval(s.studentId, s.assignmentId)).length;
  }, [assignedStudents, getStudentEval]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading intern evaluations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Student Evaluations"
        description="Provide structured performance feedback for your assigned interns."
      />

      <div className="flex gap-4 mb-6">
        <Card className="flex-1 p-4 flex items-center justify-between bg-indigo-50 border-indigo-100 shadow-sm">
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Pending Evaluations</p>
            <p className="text-2xl font-bold text-indigo-700">{pendingCount}</p>
          </div>
          <FileCheck className="w-8 h-8 text-indigo-200" />
        </Card>
        <Card className="flex-1 p-4 flex items-center justify-between bg-emerald-50 border-emerald-100 shadow-sm">
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Completed Evaluations</p>
            <p className="text-2xl font-bold text-emerald-700">{completedCount}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-200" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedStudents.map((student) => {
          const evalData = getStudentEval(student.studentId, student.assignmentId);
          return (
            <Card key={student.assignmentId || student.studentId} className="shadow-sm flex flex-col h-full">
              <div className="mb-4 pb-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {student.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{student.studentName}</h3>
                  <p className="text-xs text-slate-500">{student.internshipTitle} • {student.companyName}</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {evalData ? (
                  <>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Technical Skills</p>
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {evalData.technicalSkills}/5
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Communication</p>
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {evalData.communication}/5
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Professionalism</p>
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {evalData.professionalism}/5
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Problem Solving</p>
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {evalData.problemSolving}/5
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Mentor Feedback</p>
                      <p className="text-sm text-slate-700 italic">"{evalData.comments}"</p>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                    <FileCheck className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700">No evaluation recorded yet</p>
                    <p className="text-xs mt-1">Submit a mid-term or final evaluation.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Button className="w-full justify-center" onClick={() => handleOpenEval(student)}>
                  {evalData ? 'Update Evaluation' : 'Evaluate Student'}
                </Button>
              </div>
            </Card>
          );
        })}
        {assignedStudents.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500">
            No interns currently assigned.
          </div>
        )}
      </div>

      {isEvaluating && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {getStudentEval(selectedStudent.studentId, selectedStudent.assignmentId)
                    ? 'Update Evaluation'
                    : 'Give Evaluation'}
                </h2>
                <p className="text-sm text-slate-500">For {selectedStudent.studentName} ({selectedStudent.companyName})</p>
              </div>
              <Button variant="ghost" className="p-2 -mr-2 text-slate-400 hover:text-slate-600" onClick={handleCloseEval}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {errorMsg && (
              <Alert type="error" className="mb-6">
                {errorMsg}
              </Alert>
            )}

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Evaluation Type *</label>
                <select
                  value={evalType}
                  onChange={(e) => setEvalType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Mid-Term Evaluation">Mid-Term Evaluation</option>
                  <option value="Final Evaluation">Final Evaluation</option>
                </select>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Performance Ratings (1-5) *</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['technicalSkills', 'communication', 'professionalism', 'problemSolving'] as const).map((key) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div key={key} className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">{label}</label>
                        <select
                          value={ratings[key]}
                          onChange={(e) => setRatings((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={0}>Select Rating...</option>
                          <option value={1}>1 - Needs Improvement</option>
                          <option value={2}>2 - Below Expectations</option>
                          <option value={3}>3 - Meets Expectations</option>
                          <option value={4}>4 - Exceeds Expectations</option>
                          <option value={5}>5 - Outstanding</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Detailed Feedback *</label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide specific feedback on the intern's performance, strengths, and areas for improvement..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={handleCloseEval} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEval} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : getStudentEval(selectedStudent.studentId, selectedStudent.assignmentId) ? (
                    'Update Evaluation'
                  ) : (
                    'Save Evaluation'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
