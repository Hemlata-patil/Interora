import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  CheckCircle2, Clock, X, Filter, Activity, ArrowLeft, ArrowRight,
  AlertCircle, FileText, ClipboardList, PenTool, Save, Send
} from 'lucide-react';
import { 
  mockCompanyEvaluations, setMockCompanyEvaluations,
  mockFacultyStudents, mockCompanyInternships
} from '../faculty/mockData';
import type { 
  CompanyEvaluationData,
  EvaluationStatus,
  EvaluationType
} from '../faculty/mockData';

export const CompanyEvaluations: React.FC = () => {
  const { internId } = useParams<{ internId: string }>();
  const navigate = useNavigate();

  const [evaluations, setEvaluations] = useState<CompanyEvaluationData[]>(mockCompanyEvaluations);
  
  // UI State: 'LIST', 'VIEW', 'EDIT', 'CREATE'
  const [viewState, setViewState] = useState<'LIST' | 'VIEW' | 'EDIT' | 'CREATE'>('LIST');
  const [selectedEval, setSelectedEval] = useState<CompanyEvaluationData | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<CompanyEvaluationData>>({});

  const [filterIntern, setFilterIntern] = useState<string>(internId || 'All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const availableInterns = useMemo(() => {
    // Show only active/selected interns (based on mockFacultyStudents with active/completed status or similar)
    // For simplicity, any student in mockFacultyStudents is considered a selected intern here.
    return mockFacultyStudents.map(student => ({
      id: student.id,
      name: student.studentName
    }));
  }, []);

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
    // Default form for new evaluation
    const defaultInternId = filterIntern !== 'All' ? filterIntern : availableInterns[0].id;
    const intern = mockFacultyStudents.find(s => s.id === defaultInternId);
    
    setFormState({
      internId: defaultInternId,
      internshipId: 'int-1', // Mock default
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

  const handleEdit = (evalData: CompanyEvaluationData) => {
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

  const saveEvaluation = (targetStatus: EvaluationStatus) => {
    const updatedForm = { ...formState, status: targetStatus, overallRating: calculateOverall(formState) };
    const date = new Date().toISOString().split('T')[0];
    
    let updatedEvals;
    
    if (viewState === 'CREATE') {
      const newEval = {
        ...updatedForm,
        id: `eval-${Date.now()}`,
        updatedAt: date,
        ...(targetStatus === 'Pending Faculty Verification' ? { submittedAt: date } : {})
      } as CompanyEvaluationData;
      updatedEvals = [...evaluations, newEval];
    } else {
      updatedEvals = evaluations.map(e => {
        if (e.id === updatedForm.id) {
          return {
            ...updatedForm,
            updatedAt: date,
            crossVerified: false, // Reset on resubmit
            ...(targetStatus === 'Pending Faculty Verification' && !e.submittedAt ? { submittedAt: date } : {})
          } as CompanyEvaluationData;
        }
        return e;
      });
    }

    setEvaluations(updatedEvals);
    setMockCompanyEvaluations(updatedEvals);
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

  const renderRatingDisplay = (label: string, value: number) => {
    return (
      <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-600">{label}</span>
        <div className="flex items-center gap-1">
          <span className="font-bold text-slate-900">{value}</span>
          <span className="text-xs text-slate-400">/ 5</span>
        </div>
      </div>
    );
  };

  // Form View (Create / Edit)
  if (viewState === 'CREATE' || viewState === 'EDIT') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewState('LIST')} className="p-2 h-auto text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {viewState === 'CREATE' ? 'Create Evaluation' : 'Edit Evaluation'}
            </h1>
            <p className="text-sm text-slate-500">Provide feedback on intern performance.</p>
          </div>
          {formState.status === 'Correction Required' && (
            <div className="ml-auto">
              <Badge variant="rose" className="py-1 px-3"><AlertCircle className="w-4 h-4 mr-1.5" /> Correction Required</Badge>
            </div>
          )}
        </div>

        {formState.status === 'Correction Required' && formState.discrepancyNote && (
          <Card className="shadow-sm border-rose-200 bg-rose-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-rose-900 text-sm">Faculty Feedback / Discrepancy Flag</h3>
                <p className="text-sm text-rose-800 mt-1">{formState.discrepancyNote}</p>
                <p className="text-xs text-rose-600 mt-2 font-medium">Please review and resubmit this evaluation.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Intern</label>
                <select
                  value={formState.internId}
                  onChange={(e) => setFormState({ ...formState, internId: e.target.value })}
                  disabled={viewState === 'EDIT'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  {availableInterns.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evaluation Type</label>
                <select
                  value={formState.evaluationType}
                  onChange={(e) => setFormState({ ...formState, evaluationType: e.target.value as EvaluationType })}
                  disabled={viewState === 'EDIT'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  <option value="Mid-Term Evaluation">Mid-Term Evaluation</option>
                  <option value="Final Evaluation">Final Evaluation</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title="Performance Criteria" className="shadow-sm md:col-span-1">
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-4">Rate the intern from 1 (Poor) to 5 (Excellent).</p>
              {renderRatingInput('Technical Skills', 'technicalSkills')}
              {renderRatingInput('Quality of Work', 'qualityOfWork')}
              {renderRatingInput('Problem Solving', 'problemSolving')}
              {renderRatingInput('Communication', 'communication')}
              {renderRatingInput('Teamwork', 'teamwork')}
              {renderRatingInput('Professionalism', 'professionalism')}
              {renderRatingInput('Time Management', 'timeManagement')}
              {renderRatingInput('Initiative / Ownership', 'initiative')}
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-slate-100 mt-2">
              <span className="font-bold text-slate-900">Overall Rating (Calculated)</span>
              <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md font-black text-lg">
                {formState.overallRating} <span className="text-xs font-medium text-indigo-400">/ 5</span>
              </div>
            </div>
          </Card>

          <Card title="Written Feedback & Recommendation" className="shadow-sm md:col-span-1 flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Strengths</label>
              <textarea
                value={formState.strengths}
                onChange={(e) => setFormState({ ...formState, strengths: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                placeholder="What did the intern do well?"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Areas for Improvement</label>
              <textarea
                value={formState.areasForImprovement}
                onChange={(e) => setFormState({ ...formState, areasForImprovement: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                placeholder="Where can the intern improve?"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mentor Comments</label>
              <textarea
                value={formState.comments}
                onChange={(e) => setFormState({ ...formState, comments: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                placeholder="Additional notes for the faculty..."
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommendation</label>
              <select
                value={formState.recommendation}
                onChange={(e) => setFormState({ ...formState, recommendation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Strongly Recommend">Strongly Recommend</option>
                <option value="Recommend">Recommend</option>
                <option value="Recommend with Improvement">Recommend with Improvement</option>
                <option value="Not Recommended">Not Recommended</option>
              </select>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => setViewState('LIST')}>Cancel</Button>
          <Button variant="outline" onClick={handleSaveDraft} className="text-slate-600 border-slate-300 hover:bg-slate-50">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Send className="w-4 h-4 mr-2" /> {formState.status === 'Correction Required' ? 'Resubmit Evaluation' : 'Submit Evaluation'}
          </Button>
        </div>
      </div>
    );
  }

  // View Details Mode
  if (viewState === 'VIEW' && selectedEval) {
    const student = mockFacultyStudents.find(s => s.id === selectedEval.internId);
    
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setViewState('LIST')} className="p-2 h-auto text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{selectedEval.evaluationType}</h1>
              <p className="text-sm text-slate-500">{student?.studentName || 'Unknown Intern'} • {selectedEval.evaluationPeriod}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(selectedEval.status)}
            {(selectedEval.status === 'Draft' || selectedEval.status === 'Correction Required') && (
              <Button size="sm" onClick={() => handleEdit(selectedEval)}>
                <PenTool className="w-3.5 h-3.5 mr-2" /> Edit Evaluation
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {selectedEval.status === 'Correction Required' && selectedEval.discrepancyNote && (
              <Card className="shadow-sm border-rose-200 bg-rose-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-rose-900 text-sm">Faculty Feedback / Discrepancy Flag</h3>
                    <p className="text-sm text-rose-800 mt-1">{selectedEval.discrepancyNote}</p>
                    <p className="text-xs text-rose-600 mt-2 font-medium">Please edit and resubmit.</p>
                  </div>
                </div>
              </Card>
            )}

            <Card title="Written Feedback" className="shadow-sm">
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Strengths</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">{selectedEval.strengths || 'Not provided.'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Areas for Improvement</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">{selectedEval.areasForImprovement || 'Not provided.'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mentor Comments</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">{selectedEval.comments || 'Not provided.'}</p>
                </div>
              </div>
            </Card>

            <Card title="Performance Ratings" className="shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  {renderRatingDisplay('Technical Skills', selectedEval.technicalSkills)}
                  {renderRatingDisplay('Quality of Work', selectedEval.qualityOfWork)}
                  {renderRatingDisplay('Problem Solving', selectedEval.problemSolving)}
                  {renderRatingDisplay('Communication', selectedEval.communication)}
                </div>
                <div>
                  {renderRatingDisplay('Teamwork', selectedEval.teamwork)}
                  {renderRatingDisplay('Professionalism', selectedEval.professionalism)}
                  {renderRatingDisplay('Time Management', selectedEval.timeManagement)}
                  {renderRatingDisplay('Initiative / Ownership', selectedEval.initiative)}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-4 bg-indigo-50/50 p-4 rounded-lg">
                <span className="font-bold text-slate-900">Overall Rating</span>
                <div className="flex items-center gap-1 text-indigo-700 font-black text-xl">
                  {selectedEval.overallRating} <span className="text-sm font-semibold text-indigo-400">/ 5</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card title="Verification Info" className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                  <div className="text-sm font-medium text-slate-900">{selectedEval.status}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Submitted On</div>
                  <div className="text-sm font-medium text-slate-900">{selectedEval.submittedAt || 'Not submitted yet'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommendation</div>
                  <Badge variant="neutral" className="bg-slate-100 text-slate-700 mt-1">{selectedEval.recommendation}</Badge>
                </div>
                {selectedEval.crossVerified && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4" /> Verified by Faculty
                    </div>
                    <div className="text-xs text-slate-500">Verified by {selectedEval.crossVerifiedBy} on {selectedEval.crossVerifiedAt}</div>
                  </div>
                )}
                {selectedEval.status === 'Verified' && (
                  <div className="pt-3 border-t border-slate-100 mt-4">
                    <p className="text-xs italic text-slate-500">Verified evaluations cannot be edited.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Evaluations"
          description="Review and evaluate the performance of your interns."
        />
        <Button onClick={handleCreateNew} className="shadow-sm">
          <FileText className="w-4 h-4 mr-2" /> Create Evaluation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard title="Total Evaluations" value={totalEvals.toString()} icon={ClipboardList} />
        <StatCard title="Draft" value={draftEvals.toString()} icon={PenTool} />
        <StatCard title="Pending Verif." value={pendingEvals.toString()} icon={Clock} />
        <StatCard title="Verified" value={verifiedEvals.toString()} icon={CheckCircle2} />
        <StatCard title="Correction Required" value={correctionEvals.toString()} icon={AlertCircle} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-sm font-medium text-slate-700">Intern:</span>
            <select
              value={filterIntern}
              onChange={(e) => setFilterIntern(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
            >
              <option value="All">All Interns</option>
              {availableInterns.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
            >
              <option value="All">All Types</option>
              <option value="Mid-Term Evaluation">Mid-Term</option>
              <option value="Final Evaluation">Final</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending Faculty Verification">Pending Verification</option>
              <option value="Verified">Verified</option>
              <option value="Correction Required">Correction Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evaluation List */}
      <div className="space-y-4">
        {filteredEvals.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Intern</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Evaluation Type</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Period</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Overall Rating</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvals.map(ev => {
                    const student = mockFacultyStudents.find(s => s.id === ev.internId);
                    return (
                      <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{student?.studentName || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">Last updated: {ev.updatedAt}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{ev.evaluationType}</td>
                        <td className="px-4 py-3 text-slate-600">{ev.evaluationPeriod}</td>
                        <td className="px-4 py-3">
                          {ev.overallRating > 0 ? (
                            <span className="font-bold text-indigo-700">{ev.overallRating} <span className="text-xs font-normal text-slate-500">/ 5</span></span>
                          ) : (
                            <span className="text-slate-400 italic">Not rated</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(ev.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedEval(ev); setViewState('VIEW'); }}>
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No evaluations match your criteria</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {filterIntern === 'All' 
                ? 'No evaluations have been created yet. Click Create Evaluation to begin.' 
                : 'No evaluations have been created for this intern yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
