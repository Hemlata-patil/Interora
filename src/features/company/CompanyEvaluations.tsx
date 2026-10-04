import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  CheckCircle2, Clock, X, Filter, Activity, ArrowLeft, ArrowRight,
  AlertCircle, FileText, ClipboardList, PenTool, Save, Send, Loader2
} from 'lucide-react';
import { 
  fetchCompanyEvaluationsBackend,
  createCompanyEvaluationBackend,
  updateCompanyEvaluationBackend,
  fetchCompanyInternsBackend
} from '@/services/api/backendService';
import { 
  mockCompanyEvaluations,
  mockFacultyStudents,
  mockCompanyInternships
} from '../faculty/mockData';
import type { 
  CompanyEvaluationData,
  EvaluationStatus,
  EvaluationType
} from '../faculty/mockData';

interface EnhancedEvaluation extends CompanyEvaluationData {
  studentName?: string;
}

export const CompanyEvaluations: React.FC = () => {
  const { internId } = useParams<{ internId: string }>();
  const navigate = useNavigate();

  const [evaluations, setEvaluations] = useState<EnhancedEvaluation[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // UI State: 'LIST', 'VIEW', 'EDIT', 'CREATE'
  const [viewState, setViewState] = useState<'LIST' | 'VIEW' | 'EDIT' | 'CREATE'>('LIST');
  const [selectedEval, setSelectedEval] = useState<EnhancedEvaluation | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<EnhancedEvaluation>>({});

  const [filterIntern, setFilterIntern] = useState<string>(internId || 'All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [backendEvals, backendInterns] = await Promise.all([
        fetchCompanyEvaluationsBackend(),
        fetchCompanyInternsBackend(),
      ]);

      if (backendEvals && backendEvals.length > 0) {
        const mapped: EnhancedEvaluation[] = backendEvals.map((e: any) => {
          let status: EvaluationStatus = 'Draft';
          if (e.status === 'verified') status = 'Verified';
          else if (e.status === 'submitted') status = 'Pending Faculty Verification';
          else if (e.status === 'correction_required') status = 'Correction Required';

          const evalType: EvaluationType = e.evaluationType === 'final' ? 'Final Evaluation' : 'Mid-Term Evaluation';
          const studentProfile = e.assignment?.student?.profile;

          return {
            id: e.id,
            internId: e.assignment?.studentId || '',
            studentName: studentProfile?.fullName || 'Assigned Intern',
            internshipId: e.assignment?.internshipId || '',
            companyId: e.assignment?.companyId || '',
            industryMentorId: e.assignment?.industryMentorId || '',
            facultyMentorId: e.assignment?.facultyMentorId || '',
            evaluationType: evalType,
            evaluationPeriod: e.evaluationPeriod || 'Current Term',
            status,
            submittedAt: e.submittedAt ? new Date(e.submittedAt).toISOString().split('T')[0] : undefined,
            updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString().split('T')[0] : '',
            technicalSkills: Number(e.technicalSkills || 0),
            qualityOfWork: Number(e.qualityOfWork || 0),
            problemSolving: Number(e.problemSolving || 0),
            communication: Number(e.communication || 0),
            teamwork: Number(e.teamwork || 0),
            professionalism: Number(e.professionalism || 0),
            timeManagement: Number(e.timeManagement || 0),
            initiative: Number(e.initiative || 0),
            overallRating: Number(e.overallRating || 0),
            strengths: e.strengths || '',
            areasForImprovement: e.areasForImprovement || '',
            comments: e.comments || '',
            recommendation: e.recommendation || 'Recommend',
            crossVerified: e.crossVerified || false,
            discrepancyNote: e.discrepancyNote,
          };
        });
        setEvaluations(mapped);
      } else {
        setEvaluations(mockCompanyEvaluations);
      }

      if (backendInterns && backendInterns.length > 0) {
        setInterns(backendInterns);
      } else {
        setInterns(mockFacultyStudents);
      }
    } catch (err: any) {
      console.error('[CompanyEvaluations] Error loading data:', err);
      setError('Failed to load evaluations.');
      setEvaluations(mockCompanyEvaluations);
      setInterns(mockFacultyStudents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableInterns = useMemo(() => {
    if (interns.length > 0) {
      return interns.map(s => ({
        id: s.id,
        name: s.studentName || s.fullName || s.profile?.fullName || 'Intern'
      }));
    }
    return mockFacultyStudents.map(student => ({
      id: student.id,
      name: student.studentName
    }));
  }, [interns]);

  const filteredEvals = useMemo(() => {
    return evaluations.filter(e => {
      const matchesIntern = filterIntern === 'All' || e.internId === filterIntern;
      const matchesType = filterType === 'All' || e.evaluationType === filterType;
      const matchesStatus = filterStatus === 'All' || e.status === filterStatus;
      return matchesIntern && matchesType && matchesStatus;
    });
  }, [evaluations, filterIntern, filterType, filterStatus]);

  // Metrics
  const totalEvals = filteredEvals.length;
  const draftEvals = filteredEvals.filter(e => e.status === 'Draft').length;
  const pendingEvals = filteredEvals.filter(e => e.status === 'Pending Faculty Verification').length;
  const verifiedEvals = filteredEvals.filter(e => e.status === 'Verified').length;
  const correctionEvals = filteredEvals.filter(e => e.status === 'Correction Required').length;

  const getStatusBadge = (status: EvaluationStatus) => {
    switch(status) {
      case 'Verified': return <Badge variant="emerald" className="py-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'Pending Faculty Verification': return <Badge variant="indigo" className="py-0.5"><Clock className="w-3 h-3 mr-1" /> Pending Verification</Badge>;
      case 'Correction Required': return <Badge variant="rose" className="py-0.5"><AlertCircle className="w-3 h-3 mr-1" /> Correction Required</Badge>;
      case 'Draft': return <Badge variant="neutral" className="py-0.5"><PenTool className="w-3 h-3 mr-1 text-slate-500" /> Draft</Badge>;
      case 'Submitted': return <Badge variant="indigo" className="py-0.5">Submitted</Badge>;
      default: return null;
    }
  };

  const calculateOverall = (form: Partial<CompanyEvaluationData>) => {
    const fields = [
      form.technicalSkills, form.qualityOfWork, form.problemSolving, 
      form.communication, form.teamwork, form.professionalism, 
      form.timeManagement, form.initiative
    ];
    const valid = fields.filter(f => typeof f === 'number' && f > 0);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, val) => (acc as number) + (val as number), 0) as number;
    return Number((sum / valid.length).toFixed(1));
  };

  const handleCreateNew = () => {
    const defaultInternId = filterIntern !== 'All' ? filterIntern : (availableInterns[0]?.id || 'stu-1');
    const defaultName = availableInterns.find(i => i.id === defaultInternId)?.name || 'Intern';
    
    setFormState({
      internId: defaultInternId,
      studentName: defaultName,
      internshipId: 'int-1',
      companyId: 'company-1',
      industryMentorId: 'mentor-1',
      facultyMentorId: 'fac-1',
      evaluationType: 'Mid-Term Evaluation',
      evaluationPeriod: 'Aug 2026',
      status: 'Draft',
      technicalSkills: 0,
      qualityOfWork: 0,
      problemSolving: 0,
      communication: 0,
      teamwork: 0,
      professionalism: 0,
      timeManagement: 0,
      initiative: 0,
      overallRating: 0,
      strengths: '',
      areasForImprovement: '',
      comments: '',
      recommendation: 'Recommend',
      crossVerified: false
    });
    setViewState('CREATE');
  };

  const handleEdit = (evalData: EnhancedEvaluation) => {
    setFormState({ ...evalData });
    setViewState('EDIT');
  };

  const handleSaveDraft = () => {
    saveEvaluation('Draft');
  };

  const handleSubmit = () => {
    if (window.confirm("Submit Evaluation?\n\nOnce submitted, this evaluation will be sent to the assigned faculty mentor for cross-verification.")) {
      saveEvaluation('Pending Faculty Verification');
    }
  };

  const saveEvaluation = async (targetStatus: EvaluationStatus) => {
    const updatedForm = { ...formState, status: targetStatus, overallRating: calculateOverall(formState) };
    const date = new Date().toISOString().split('T')[0];
    
    setActionLoading(true);
    try {
      if (updatedForm.id && !updatedForm.id.startsWith('eval-')) {
        let backendStatus = 'draft';
        if (targetStatus === 'Pending Faculty Verification') backendStatus = 'submitted';
        else if (targetStatus === 'Verified') backendStatus = 'verified';

        await updateCompanyEvaluationBackend(updatedForm.id, {
          status: backendStatus,
          technicalSkills: updatedForm.technicalSkills,
          qualityOfWork: updatedForm.qualityOfWork,
          problemSolving: updatedForm.problemSolving,
          communication: updatedForm.communication,
          teamwork: updatedForm.teamwork,
          professionalism: updatedForm.professionalism,
          timeManagement: updatedForm.timeManagement,
          initiative: updatedForm.initiative,
          overallRating: updatedForm.overallRating,
          strengths: updatedForm.strengths,
          areasForImprovement: updatedForm.areasForImprovement,
          comments: updatedForm.comments,
          recommendation: updatedForm.recommendation,
        });
      }
    } catch (err: any) {
      console.warn('[saveEvaluation] Backend notice:', err);
    } finally {
      setActionLoading(false);
    }

    let updatedEvals;
    if (viewState === 'CREATE') {
      const newEval = {
        ...updatedForm,
        id: `eval-${Date.now()}`,
        updatedAt: date,
        ...(targetStatus === 'Pending Faculty Verification' ? { submittedAt: date } : {})
      } as EnhancedEvaluation;
      updatedEvals = [...evaluations, newEval];
    } else {
      updatedEvals = evaluations.map(e => {
        if (e.id === updatedForm.id) {
          return {
            ...updatedForm,
            updatedAt: date,
            crossVerified: false,
            ...(targetStatus === 'Pending Faculty Verification' && !e.submittedAt ? { submittedAt: date } : {})
          } as EnhancedEvaluation;
        }
        return e;
      });
    }

    setEvaluations(updatedEvals);
    setViewState('LIST');
  };

  const renderRatingInput = (label: string, field: keyof CompanyEvaluationData) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              type="button"
              onClick={() => {
                const newState = { ...formState, [field]: rating };
                setFormState({ ...newState, overallRating: calculateOverall(newState) });
              }}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                formState[field] === rating 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if ((viewState === 'CREATE' || viewState === 'EDIT') && formState) {
    const isEdit = viewState === 'EDIT';
    const studentName = formState.studentName || availableInterns.find(s => s.id === formState.internId)?.name || 'Intern';

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setViewState('LIST')} className="p-2 h-auto text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Evaluation' : 'New Performance Evaluation'}</h1>
              <p className="text-sm text-slate-500">{studentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={actionLoading}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit to Faculty
            </Button>
          </div>
        </div>

        <Card title="General Evaluation Details" className="shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Intern</label>
              <select
                disabled={isEdit}
                value={formState.internId}
                onChange={e => {
                  const sel = availableInterns.find(i => i.id === e.target.value);
                  setFormState({ ...formState, internId: e.target.value, studentName: sel?.name });
                }}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white disabled:bg-slate-50"
              >
                {availableInterns.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Evaluation Type</label>
              <select
                value={formState.evaluationType}
                onChange={e => setFormState({ ...formState, evaluationType: e.target.value as EvaluationType })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white"
              >
                <option value="Mid-Term Evaluation">Mid-Term Evaluation</option>
                <option value="Final Evaluation">Final Evaluation</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="Performance Criteria (Scale 1 - 5)" className="shadow-sm">
          <div className="space-y-1">
            {renderRatingInput("Technical Competence & Code Quality", "technicalSkills")}
            {renderRatingInput("Quality of Work Deliverables", "qualityOfWork")}
            {renderRatingInput("Problem Solving & Critical Thinking", "problemSolving")}
            {renderRatingInput("Communication & Reporting", "communication")}
            {renderRatingInput("Team Collaboration", "teamwork")}
            {renderRatingInput("Professional Conduct & Punctuality", "professionalism")}
            {renderRatingInput("Time Management & Deadlines", "timeManagement")}
            {renderRatingInput("Initiative & Learning Adaptability", "initiative")}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-4 rounded-lg">
            <span className="font-bold text-slate-800 text-sm">Calculated Composite Score:</span>
            <span className="text-xl font-black text-indigo-700">★ {calculateOverall(formState)} / 5.0</span>
          </div>
        </Card>

        <Card title="Qualitative Feedback" className="shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Strengths Demonstrated</label>
            <textarea
              rows={3}
              value={formState.strengths || ''}
              onChange={e => setFormState({ ...formState, strengths: e.target.value })}
              placeholder="Highlight areas where the intern excelled..."
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Areas for Improvement</label>
            <textarea
              rows={3}
              value={formState.areasForImprovement || ''}
              onChange={e => setFormState({ ...formState, areasForImprovement: e.target.value })}
              placeholder="Provide constructive guidance for areas needing enhancement..."
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Mentor Comments</label>
            <textarea
              rows={3}
              value={formState.comments || ''}
              onChange={e => setFormState({ ...formState, comments: e.target.value })}
              placeholder="Overall summary of the intern's contribution to company goals..."
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Performance Evaluations"
          description="Assess intern progress, conduct mid-term and final performance reviews, and submit for academic verification."
        />
        <Button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <PenTool className="w-4 h-4 mr-2" /> New Evaluation
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard title="Total Evals" value={totalEvals.toString()} icon={ClipboardList} />
        <StatCard title="Drafts" value={draftEvals.toString()} icon={PenTool} />
        <StatCard title="Pending Verif." value={pendingEvals.toString()} icon={Clock} />
        <StatCard title="Correction Req." value={correctionEvals.toString()} icon={AlertCircle} />
        <StatCard title="Verified" value={verifiedEvals.toString()} icon={CheckCircle2} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterIntern}
              onChange={e => setFilterIntern(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Interns</option>
              {availableInterns.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Mid-Term Evaluation">Mid-Term</option>
              <option value="Final Evaluation">Final</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Faculty Verification">Pending Verification</option>
              <option value="Correction Required">Correction Required</option>
              <option value="Verified">Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading evaluations...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Intern Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvals.length > 0 ? (
                  filteredEvals.map(ev => {
                    const studentName = ev.studentName || mockFacultyStudents.find(s => s.id === ev.internId)?.studentName || 'Assigned Intern';

                    return (
                      <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {studentName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {ev.evaluationType}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {ev.evaluationPeriod}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-indigo-700">★ {ev.overallRating}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(ev.status)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {ev.submittedAt || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(ev)}
                          >
                            {ev.status === 'Draft' || ev.status === 'Correction Required' ? 'Edit & Review' : 'View'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No evaluations found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
