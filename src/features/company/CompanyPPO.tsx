import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  CheckCircle2, Clock, X, ArrowLeft, ArrowRight,
  AlertCircle, Briefcase, FileText, Send, UserX, UserCheck, Loader2
} from 'lucide-react';
import { 
  fetchCompanyPPOsBackend,
  createCompanyPPOBackend,
  updateCompanyPPOBackend 
} from '@/services/api/backendService';
import { 
  mockFacultyStudents,
  mockCompanyTasks,
  mockCompanyMilestones,
  mockCompanyEvaluations,
  mockCompanyPPOs,
  mockCompanyApplications
} from '../faculty/mockData';
import type { 
  SharedStudentData,
  CompanyPPOData,
  ConversionStatus
} from '../faculty/mockData';

export const CompanyPPO: React.FC = () => {
  const [ppos, setPpos] = useState<CompanyPPOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // UI State: 'LIST', 'REVIEW'
  const [viewState, setViewState] = useState<'LIST' | 'REVIEW'>('LIST');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Form State for PPO Decision
  const [decisionMode, setDecisionMode] = useState<'NONE' | 'OFFER' | 'CONSIDERATION' | 'NO_CONVERT'>('NONE');
  const [formState, setFormState] = useState<Partial<CompanyPPOData>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const backendPPOs = await fetchCompanyPPOsBackend();
      if (backendPPOs && backendPPOs.length > 0) {
        const mapped: CompanyPPOData[] = backendPPOs.map((p: any) => {
          let status: ConversionStatus = 'Draft';
          if (p.status === 'offered') status = 'Offered';
          else if (p.status === 'under_consideration') status = 'Under Consideration';
          else if (p.status === 'not_converted') status = 'Not Converted';

          let studentResponse: 'Pending' | 'Accepted' | 'Declined' = 'Pending';
          if (p.studentResponse === 'accepted') studentResponse = 'Accepted';
          else if (p.studentResponse === 'declined') studentResponse = 'Declined';

          const comp = (p.compensationDetails as any) || {};

          return {
            id: p.id,
            internId: p.assignment?.studentId || '',
            internshipId: p.assignment?.internshipId || '',
            companyId: p.companyId,
            status,
            jobRole: comp.jobRole || 'Full-Time Engineer',
            department: comp.department || 'Engineering',
            employmentType: comp.employmentType || 'Full-time',
            ctc: p.ctcAnnualLpa ? `₹${p.ctcAnnualLpa} LPA` : comp.ctc || '₹8,50,000 LPA',
            joiningDate: comp.joiningDate || '',
            location: comp.location || 'Bangalore, India',
            offerValidUntil: p.offerValidUntil ? new Date(p.offerValidUntil).toISOString().split('T')[0] : '',
            remarks: p.remarks || '',
            internalNote: comp.internalNote || '',
            studentResponse,
            offerDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
          };
        });
        setPpos(mapped);
      } else {
        setPpos(mockCompanyPPOs);
      }
    } catch (err: any) {
      console.error('[CompanyPPO] Error loading PPOs:', err);
      setError('Failed to load PPO data.');
      setPpos(mockCompanyPPOs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compile full intern eligibility list
  const internList = useMemo(() => {
    return mockFacultyStudents.map(student => {
      // Find internship ID from accepted applications
      const application = mockCompanyApplications?.find(a => a.studentId === student.id && a.applicationStatus === 'Selected');
      const internshipId = application?.internshipId || 'int-1';
      
      const tasks = mockCompanyTasks.filter(t => t.internId === student.id && t.internshipId === internshipId);
      const approvedTasks = tasks.filter(t => t.taskStatus === 'Approved').length;
      const tasksCompleted = tasks.length > 0 ? (approvedTasks / tasks.length) * 100 : 0;
      
      const milestones = mockCompanyMilestones.filter(m => m.internId === student.id && m.internshipId === internshipId);
      const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
      const milestonesCompleted = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

      const finalEval = mockCompanyEvaluations.find(e => e.internId === student.id && e.evaluationType === 'Final Evaluation');
      
      const existingPpo = ppos.find(p => p.internId === student.id);

      let derivedStatus: ConversionStatus = 'Not Evaluated';
      let eligibilityReason = 'Awaiting Final Evaluation';

      if (existingPpo) {
        derivedStatus = existingPpo.status;
        eligibilityReason = 'PPO Decision Made';
      } else if (finalEval) {
        if (finalEval.status === 'Verified') {
          derivedStatus = 'Eligible';
          eligibilityReason = 'All requirements met';
        } else if (finalEval.status === 'Pending Faculty Verification') {
          derivedStatus = 'Not Eligible';
          eligibilityReason = 'Final evaluation is awaiting Faculty verification.';
        } else if (finalEval.status === 'Correction Required') {
          derivedStatus = 'Not Eligible';
          eligibilityReason = 'Final evaluation requires correction and re-verification.';
        }
      }

      return {
        student,
        internshipId,
        tasksCompleted,
        milestonesCompleted,
        finalEval,
        existingPpo,
        derivedStatus,
        eligibilityReason
      };
    });
  }, [ppos]);

  // Metrics
  const eligibleCount = internList.filter(i => i.derivedStatus === 'Eligible').length;
  const draftCount = internList.filter(i => i.derivedStatus === 'Draft').length;
  const offeredCount = internList.filter(i => i.derivedStatus === 'Offered').length;
  const acceptedCount = internList.filter(i => i.derivedStatus === 'Accepted' || i.existingPpo?.studentResponse === 'Accepted').length;
  const declinedCount = internList.filter(i => i.derivedStatus === 'Declined' || i.existingPpo?.studentResponse === 'Declined').length;

  const handleReview = (internId: string) => {
    const data = internList.find(i => i.student.id === internId);
    if (!data) return;

    if (data.existingPpo) {
      setFormState({ ...data.existingPpo });
      if (data.existingPpo.status === 'Under Consideration') setDecisionMode('CONSIDERATION');
      else if (data.existingPpo.status === 'Not Converted') setDecisionMode('NO_CONVERT');
      else setDecisionMode('OFFER');
    } else {
      setFormState({
        internId: data.student.id,
        internshipId: data.internshipId,
        companyId: 'company-1',
        evaluationId: data.finalEval?.id,
        facultyMentorId: data.finalEval?.facultyMentorId
      });
      setDecisionMode('NONE');
    }

    setSelectedStudentId(internId);
    setViewState('REVIEW');
  };

  const savePPO = async (targetStatus: ConversionStatus) => {
    let updatedForm = { ...formState, status: targetStatus };
    
    if (targetStatus === 'Offered' && !updatedForm.offerDate) {
      updatedForm.offerDate = new Date().toISOString().split('T')[0];
      updatedForm.studentResponse = 'Pending';
    }

    setActionLoading(true);
    try {
      let backendStatus = 'draft';
      if (targetStatus === 'Offered') backendStatus = 'offered';
      else if (targetStatus === 'Under Consideration') backendStatus = 'under_consideration';
      else if (targetStatus === 'Not Converted') backendStatus = 'not_converted';

      if (updatedForm.id && !updatedForm.id.startsWith('ppo-')) {
        await updateCompanyPPOBackend(updatedForm.id, {
          positionTitle: updatedForm.jobRole || 'Full-Time Engineer',
          salaryPackage: updatedForm.ctc || '10 LPA',
          location: updatedForm.location || 'Bangalore, India',
          status: backendStatus,
        });
      } else if (updatedForm.internshipId) {
        const createRes = await createCompanyPPOBackend({
          assignmentId: updatedForm.internshipId,
          positionTitle: updatedForm.jobRole || 'Full-Time Engineer',
          salaryPackage: updatedForm.ctc || '10 LPA',
          location: updatedForm.location || 'Bangalore, India',
          status: backendStatus,
        });
        if (createRes.success && createRes.data?.id) {
          updatedForm.id = createRes.data.id;
        }
      }
    } catch (err: any) {
      console.warn('[savePPO] Backend update notice:', err);
    } finally {
      setActionLoading(false);
    }

    let updatedPpos;
    if (updatedForm.id) {
      updatedPpos = ppos.map(p => p.id === updatedForm.id ? (updatedForm as CompanyPPOData) : p);
    } else {
      updatedForm.id = `ppo-${Date.now()}`;
      updatedPpos = [...ppos, (updatedForm as CompanyPPOData)];
    }

    setPpos(updatedPpos);
    setViewState('LIST');
  };

  const handleSaveDraft = () => {
    savePPO('Draft');
  };

  const handleSendOffer = () => {
    if (window.confirm("Send PPO Offer?\n\nOnce sent, the offer will become visible to the student and they will be able to respond.")) {
      savePPO('Offered');
    }
  };

  const handleSaveConsideration = () => {
    savePPO('Under Consideration');
  };

  const handleSaveNotConverted = () => {
    if (window.confirm("Are you sure you do not want to convert this intern?")) {
      savePPO('Not Converted');
    }
  };

  const getStatusBadge = (status: ConversionStatus, response?: string) => {
    if (response === 'Accepted') return <Badge variant="emerald"><CheckCircle2 className="w-3 h-3 mr-1" /> PPO Accepted</Badge>;
    if (response === 'Declined') return <Badge variant="rose"><X className="w-3 h-3 mr-1" /> PPO Declined</Badge>;

    switch(status) {
      case 'Eligible': return <Badge variant="emerald">Eligible</Badge>;
      case 'Offered': return <Badge variant="indigo"><Briefcase className="w-3 h-3 mr-1" /> Offered</Badge>;
      case 'Draft': return <Badge variant="neutral">Draft</Badge>;
      case 'Under Consideration': return <Badge variant="amber"><Clock className="w-3 h-3 mr-1" /> Under Consideration</Badge>;
      case 'Not Converted': return <Badge variant="rose">Not Converted</Badge>;
      case 'Not Eligible': return <Badge variant="rose">Not Eligible</Badge>;
      case 'Not Evaluated': return <Badge variant="neutral">Not Evaluated</Badge>;
      default: return null;
    }
  };

  if (viewState === 'REVIEW' && selectedStudentId) {
    const data = internList.find(i => i.student.id === selectedStudentId);
    if (!data) return null;

    const isReadOnly = data.existingPpo?.status === 'Offered' || data.existingPpo?.status === 'Accepted' || data.existingPpo?.status === 'Declined';
    
    let currentResponseStr = "Awaiting Student Response";
    if (data.existingPpo?.studentResponse === 'Accepted') currentResponseStr = "Accepted";
    if (data.existingPpo?.studentResponse === 'Declined') currentResponseStr = "Declined";

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setViewState('LIST')} className="p-2 h-auto text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">PPO Conversion Decision</h1>
              <p className="text-sm text-slate-500">{data.student.studentName} • {data.student.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(data.derivedStatus, data.existingPpo?.studentResponse)}
          </div>
        </div>

        {/* Intern Performance Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-50 border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Final Evaluation</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {data.finalEval ? `★ ${data.finalEval.overallRating}` : 'N/A'}
              </span>
              <Badge variant={data.finalEval?.status === 'Verified' ? 'emerald' : 'neutral'}>
                {data.finalEval?.status || 'No Eval'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">
              "{data.finalEval?.recommendation || 'No recommendation submitted'}"
            </p>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Tasks Completed</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">{Math.round(data.tasksCompleted)}%</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${data.tasksCompleted}%` }}></div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Milestones Completed</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">{Math.round(data.milestonesCompleted)}%</span>
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${data.milestonesCompleted}%` }}></div>
            </div>
          </Card>
        </div>

        {/* Read-Only State for Already Offered/Responded */}
        {isReadOnly ? (
          <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-lg">Official Offer Record</h3>
              <p className="text-sm text-slate-500">Offer issued on {data.existingPpo?.offerDate || 'Recently'}. Status: <span className="font-semibold text-indigo-700">{currentResponseStr}</span></p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Job Role</span>
                <span className="font-semibold text-slate-800">{data.existingPpo?.jobRole}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Department</span>
                <span className="font-semibold text-slate-800">{data.existingPpo?.department}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Annual CTC</span>
                <span className="font-bold text-emerald-700">{data.existingPpo?.ctc}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Joining Date</span>
                <span className="font-semibold text-slate-800">{data.existingPpo?.joiningDate}</span>
              </div>
            </div>

            {data.existingPpo?.remarks && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                <span className="text-xs text-slate-400 font-semibold block mb-1 uppercase tracking-wider">Remarks to Candidate</span>
                <p className="text-slate-700 italic">"{data.existingPpo.remarks}"</p>
              </div>
            )}
          </Card>
        ) : (
          /* Decision Action Modes */
          <div className="space-y-6">
            <div className="flex gap-3">
              <Button 
                variant={decisionMode === 'OFFER' ? 'primary' : 'outline'}
                className="flex-1 py-3"
                onClick={() => setDecisionMode('OFFER')}
              >
                <Briefcase className="w-4 h-4 mr-2" /> Make Job Offer
              </Button>
              <Button 
                variant={decisionMode === 'CONSIDERATION' ? 'primary' : 'outline'}
                className="flex-1 py-3"
                onClick={() => setDecisionMode('CONSIDERATION')}
              >
                <Clock className="w-4 h-4 mr-2" /> Under Consideration
              </Button>
              <Button 
                variant={decisionMode === 'NO_CONVERT' ? 'primary' : 'outline'}
                className="flex-1 py-3 border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => setDecisionMode('NO_CONVERT')}
              >
                <UserX className="w-4 h-4 mr-2" /> Do Not Convert
              </Button>
            </div>

            {decisionMode === 'OFFER' && (
              <Card title="PPO Offer Form" className="shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role / Designation</label>
                    <input 
                      type="text" 
                      value={formState.jobRole || ''} 
                      onChange={e => setFormState({ ...formState, jobRole: e.target.value })}
                      placeholder="e.g. Associate Software Engineer"
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <input 
                      type="text" 
                      value={formState.department || ''} 
                      onChange={e => setFormState({ ...formState, department: e.target.value })}
                      placeholder="e.g. Engineering"
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                    <select 
                      value={formState.employmentType || 'Full-time'}
                      onChange={e => setFormState({ ...formState, employmentType: e.target.value })}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract to Hire">Contract to Hire</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Annual CTC</label>
                    <input 
                      type="text" 
                      value={formState.ctc || ''} 
                      onChange={e => setFormState({ ...formState, ctc: e.target.value })}
                      placeholder="e.g. ₹9,00,000 LPA"
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Joining Date</label>
                    <input 
                      type="date" 
                      value={formState.joiningDate || ''} 
                      onChange={e => setFormState({ ...formState, joiningDate: e.target.value })}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      value={formState.location || ''} 
                      onChange={e => setFormState({ ...formState, location: e.target.value })}
                      placeholder="e.g. Bangalore, India (Hybrid)"
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks & Welcome Note</label>
                  <textarea 
                    value={formState.remarks || ''} 
                    onChange={e => setFormState({ ...formState, remarks: e.target.value })}
                    rows={3}
                    placeholder="Provide praise for their internship performance and next steps..."
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" onClick={handleSaveDraft} disabled={actionLoading}>Save as Draft</Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={handleSendOffer}
                    disabled={actionLoading || !formState.jobRole || !formState.ctc}
                  >
                    <Send className="w-4 h-4 mr-2" /> Send Official PPO Offer
                  </Button>
                </div>
              </Card>
            )}

            {decisionMode === 'CONSIDERATION' && (
              <Card title="Internal Consideration Details" className="shadow-sm space-y-4">
                <p className="text-sm text-slate-600">
                  Mark this intern as Under Consideration if hiring headcount is pending or additional reviews are needed.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Note (Private to Company)</label>
                  <textarea 
                    value={formState.internalNote || ''} 
                    onChange={e => setFormState({ ...formState, internalNote: e.target.value })}
                    rows={3}
                    placeholder="e.g. Awaiting Q4 engineering budget confirmation..."
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setDecisionMode('NONE')}>Cancel</Button>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSaveConsideration} disabled={actionLoading}>
                    Save Consideration Status
                  </Button>
                </div>
              </Card>
            )}

            {decisionMode === 'NO_CONVERT' && (
              <Card title="No Conversion Notice" className="shadow-sm space-y-4 border-rose-200 bg-rose-50/20">
                <p className="text-sm text-rose-800">
                  Document the rationale for not extending a full-time offer at this time.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Feedback</label>
                  <textarea 
                    value={formState.remarks || ''} 
                    onChange={e => setFormState({ ...formState, remarks: e.target.value })}
                    rows={3}
                    placeholder="e.g. Limited full-time openings in the domain..."
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setDecisionMode('NONE')}>Cancel</Button>
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleSaveNotConverted} disabled={actionLoading}>
                    Confirm No Conversion
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="PPO & Conversion"
        description="Review eligible graduating interns and issue Pre-Placement Offers (PPO) for full-time employment."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard title="Eligible Interns" value={eligibleCount.toString()} icon={UserCheck} />
        <StatCard title="Draft Decisions" value={draftCount.toString()} icon={FileText} />
        <StatCard title="Offers Extended" value={offeredCount.toString()} icon={Briefcase} />
        <StatCard title="Offers Accepted" value={acceptedCount.toString()} icon={CheckCircle2} />
        <StatCard title="Offers Declined" value={declinedCount.toString()} icon={X} />
      </div>

      {/* Interns Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading PPO records...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Intern Name</th>
                  <th className="py-3 px-4">Program Role</th>
                  <th className="py-3 px-4">Final Eval</th>
                  <th className="py-3 px-4">Tasks Done</th>
                  <th className="py-3 px-4">Milestones Done</th>
                  <th className="py-3 px-4">PPO Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {internList.map(item => (
                  <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.student.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.student.role}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.finalEval ? (
                        <span className="font-semibold text-emerald-700">★ {item.finalEval.overallRating}</span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {Math.round(item.tasksCompleted)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {Math.round(item.milestonesCompleted)}%
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.derivedStatus, item.existingPpo?.studentResponse)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReview(item.student.id)}
                      >
                        {item.existingPpo ? 'View Decision' : 'Review & Decide'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
