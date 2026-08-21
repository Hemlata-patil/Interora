import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  CheckCircle2, Clock, X, ArrowLeft, ArrowRight,
  AlertCircle, Briefcase, FileText, Send, UserX, UserCheck
} from 'lucide-react';
import { 
  mockFacultyStudents,
  mockCompanyTasks,
  mockCompanyMilestones,
  mockCompanyEvaluations,
  mockCompanyPPOs,
  setMockCompanyPPOs,
  mockCompanyApplications
} from '../faculty/mockData';
import type { 
  SharedStudentData,
  CompanyPPOData,
  ConversionStatus
} from '../faculty/mockData';

export const CompanyPPO: React.FC = () => {
  const [ppos, setPpos] = useState<CompanyPPOData[]>(mockCompanyPPOs);
  
  // UI State: 'LIST', 'REVIEW'
  const [viewState, setViewState] = useState<'LIST' | 'REVIEW'>('LIST');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Form State for PPO Decision
  const [decisionMode, setDecisionMode] = useState<'NONE' | 'OFFER' | 'CONSIDERATION' | 'NO_CONVERT'>('NONE');
  const [formState, setFormState] = useState<Partial<CompanyPPOData>>({});

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
        companyId: 'company-1', // Mock
        evaluationId: data.finalEval?.id,
        facultyMentorId: data.finalEval?.facultyMentorId
      });
      setDecisionMode('NONE');
    }

    setSelectedStudentId(internId);
    setViewState('REVIEW');
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

  const savePPO = (targetStatus: ConversionStatus) => {
    let updatedForm = { ...formState, status: targetStatus };
    
    if (targetStatus === 'Offered' && !updatedForm.offerDate) {
      updatedForm.offerDate = new Date().toISOString().split('T')[0];
      updatedForm.studentResponse = 'Pending';
    }

    let updatedPpos;
    if (updatedForm.id) {
      updatedPpos = ppos.map(p => p.id === updatedForm.id ? (updatedForm as CompanyPPOData) : p);
    } else {
      updatedForm.id = `ppo-${Date.now()}`;
      updatedPpos = [...ppos, (updatedForm as CompanyPPOData)];
    }

    setPpos(updatedPpos);
    setMockCompanyPPOs(updatedPpos);
    setViewState('LIST');
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
    
    // Explicit override if student responded
    let currentResponseStr = "Awaiting Student Response";
    if (data.existingPpo?.studentResponse === 'Accepted') currentResponseStr = "Accepted";
    if (data.existingPpo?.studentResponse === 'Declined') currentResponseStr = "Declined";

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewState('LIST')} className="p-2 h-auto text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Conversion Review: {data.student.studentName}</h1>
            <p className="text-sm text-slate-500">{data.student.role} • {data.student.department}</p>
          </div>
          <div className="ml-auto">
            {getStatusBadge(data.derivedStatus, data.existingPpo?.studentResponse)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Performance Summary */}
            <Card title="Performance Summary" className="shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600">Tasks Completed</span>
                    <span className="font-bold text-slate-900">{Math.round(data.tasksCompleted)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${data.tasksCompleted}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600">Milestones Achieved</span>
                    <span className="font-bold text-slate-900">{Math.round(data.milestonesCompleted)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${data.milestonesCompleted}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Evaluation Rating</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-700">{data.finalEval?.overallRating || 'N/A'}</span>
                    {data.finalEval?.overallRating && <span className="text-sm font-semibold text-slate-400">/ 5</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Faculty Verification</h4>
                  {data.finalEval?.crossVerified ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm mt-2">
                      <CheckCircle2 className="w-4 h-4" /> Verified
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 mt-2 block">{data.finalEval ? data.finalEval.status : 'No Final Evaluation'}</span>
                  )}
                </div>
              </div>
            </Card>

            {/* Conversion Decision Area */}
            <Card title="Conversion Decision" className="shadow-sm border-indigo-100">
              
              {!isReadOnly && data.derivedStatus === 'Eligible' && decisionMode === 'NONE' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50" onClick={() => setDecisionMode('OFFER')}>
                    <Briefcase className="w-6 h-6 text-emerald-600" />
                    <span>Offer PPO</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50" onClick={() => setDecisionMode('CONSIDERATION')}>
                    <Clock className="w-6 h-6 text-amber-600" />
                    <span>Under Consideration</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50" onClick={() => setDecisionMode('NO_CONVERT')}>
                    <UserX className="w-6 h-6 text-rose-600" />
                    <span>Do Not Convert</span>
                  </Button>
                </div>
              )}

              {/* Offer PPO Form */}
              {(decisionMode === 'OFFER' || isReadOnly || data.existingPpo?.status === 'Draft') && (
                <div className="space-y-5 animate-in fade-in">
                  {!isReadOnly && (
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 text-lg">PPO Details</h3>
                      <Button variant="ghost" size="sm" onClick={() => setDecisionMode('NONE')}>Change Decision</Button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Job Role</label>
                      <input 
                        type="text" 
                        value={formState.jobRole || ''}
                        onChange={(e) => setFormState({...formState, jobRole: e.target.value})}
                        disabled={isReadOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-700" 
                        placeholder="e.g. Junior Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                      <input 
                        type="text" 
                        value={formState.department || ''}
                        onChange={(e) => setFormState({...formState, department: e.target.value})}
                        disabled={isReadOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-700" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Employment Type</label>
                      <select 
                        value={formState.employmentType || ''}
                        onChange={(e) => setFormState({...formState, employmentType: e.target.value})}
                        disabled={isReadOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-700"
                      >
                        <option value="">Select...</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CTC / Salary</label>
                      <input 
                        type="text" 
                        value={formState.ctc || ''}
                        onChange={(e) => setFormState({...formState, ctc: e.target.value})}
                        disabled={isReadOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-700" 
                        placeholder="e.g. ₹8,00,000 LPA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Joining Date</label>
                      <input 
                        type="date" 
                        value={formState.joiningDate || ''}
                        onChange={(e) => setFormState({...formState, joiningDate: e.target.value})}
                        disabled={isReadOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-700" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                      <input 
                        type="text" 
                        value={formState.location || ''}
                        onChange={(e) => setFormState({...formState, location: e.target.value})}
                        disabled={isReadOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-700" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Offer Valid Until</label>
                      <input 
                        type="date" 
                        value={formState.offerValidUntil || ''}
                        onChange={(e) => setFormState({...formState, offerValidUntil: e.target.value})}
                        disabled={isReadOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-700" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks</label>
                    <textarea 
                      value={formState.remarks || ''}
                      onChange={(e) => setFormState({...formState, remarks: e.target.value})}
                      disabled={isReadOnly}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-700 min-h-[80px]" 
                      placeholder="Congratulations messages or conditions..."
                    />
                  </div>

                  {!isReadOnly && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
                      <Button onClick={handleSendOffer} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Send className="w-4 h-4 mr-2" /> Send PPO
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Consideration Form */}
              {decisionMode === 'CONSIDERATION' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-900 text-lg">Under Consideration Note</h3>
                    <Button variant="ghost" size="sm" onClick={() => setDecisionMode('NONE')}>Change Decision</Button>
                  </div>
                  <textarea 
                    value={formState.internalNote || ''}
                    onChange={(e) => setFormState({...formState, internalNote: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[100px]" 
                    placeholder="e.g. Strong performance, but final headcount confirmation is pending."
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={handleSaveConsideration} className="bg-amber-600 hover:bg-amber-700 text-white">Save Decision</Button>
                  </div>
                </div>
              )}

              {/* Do Not Convert Form */}
              {decisionMode === 'NO_CONVERT' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-rose-900 text-lg">Do Not Convert</h3>
                    <Button variant="ghost" size="sm" onClick={() => setDecisionMode('NONE')}>Change Decision</Button>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                    <p className="text-sm text-rose-800 font-medium">Are you sure you do not want to convert this intern?</p>
                    <p className="text-xs text-rose-600 mt-1">This will mark their profile as Not Converted and no PPO offer will be created.</p>
                  </div>
                  <textarea 
                    value={formState.internalNote || ''}
                    onChange={(e) => setFormState({...formState, internalNote: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" 
                    placeholder="Internal reason (optional)..."
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={handleSaveNotConverted} className="bg-rose-600 hover:bg-rose-700 text-white">Confirm Decision</Button>
                  </div>
                </div>
              )}

            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {data.derivedStatus === 'Not Eligible' && (
              <Card className="shadow-sm border-rose-200 bg-rose-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-rose-900">Not Eligible</h3>
                </div>
                <p className="text-sm text-rose-800">{data.eligibilityReason}</p>
              </Card>
            )}

            {isReadOnly && (
              <Card title="Student Response" className="shadow-sm bg-slate-50">
                <div className="text-center py-4">
                  {data.existingPpo?.studentResponse === 'Pending' ? (
                    <div>
                      <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="font-bold text-slate-900">Awaiting Student Response</p>
                      <p className="text-xs text-slate-500 mt-1">Offer sent on {data.existingPpo?.offerDate}</p>
                    </div>
                  ) : data.existingPpo?.studentResponse === 'Accepted' ? (
                    <div>
                      <UserCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-emerald-700 text-lg">PPO Accepted</p>
                      <p className="text-xs text-slate-500 mt-1">Student has accepted the offer.</p>
                    </div>
                  ) : (
                    <div>
                      <X className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                      <p className="font-bold text-rose-700 text-lg">PPO Declined</p>
                      <p className="text-xs text-slate-500 mt-1">Student has declined the offer.</p>
                    </div>
                  )}
                </div>
                {isReadOnly && data.existingPpo?.status === 'Offered' && (
                  <div className="pt-4 mt-4 border-t border-slate-200">
                     <p className="text-xs italic text-slate-500 text-center">Sent offers cannot be edited.</p>
                  </div>
                )}
              </Card>
            )}

            <Card title="Internship Overview" className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                  <div className="text-sm font-medium text-slate-900">{data.student.internshipStatus}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</div>
                  <div className="text-sm font-medium text-slate-900">{data.student.startDate} — {data.student.endDate}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Work Mode</div>
                  <div className="text-sm font-medium text-slate-900">{data.student.workMode}</div>
                </div>
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
      <PageHeader
        title="PPO & Conversion"
        description="Manage full-time conversion decisions for your interns."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard title="Eligible" value={eligibleCount.toString()} icon={UserCheck} />
        <StatCard title="Draft Offers" value={draftCount.toString()} icon={FileText} />
        <StatCard title="Offers Sent" value={offeredCount.toString()} icon={Send} />
        <StatCard title="Accepted" value={acceptedCount.toString()} icon={CheckCircle2} />
        <StatCard title="Declined" value={declinedCount.toString()} icon={X} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Intern Conversion Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Intern</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Final Evaluation</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Verification</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Conversion Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {internList.map(data => (
                <tr key={data.student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{data.student.studentName}</div>
                    <div className="text-xs text-slate-500">{data.student.studentId}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{data.student.role}</td>
                  <td className="px-4 py-3">
                    {data.finalEval ? (
                      <span className="font-bold text-slate-700">{data.finalEval.overallRating.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 5</span></span>
                    ) : (
                      <span className="text-slate-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {data.finalEval?.crossVerified ? (
                      <span className="text-emerald-600 font-medium text-xs flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Verified</span>
                    ) : data.finalEval ? (
                      <span className="text-amber-600 font-medium text-xs">Pending</span>
                    ) : (
                      <span className="text-slate-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(data.derivedStatus, data.existingPpo?.studentResponse)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant={data.derivedStatus === 'Eligible' ? 'primary' : 'outline'} size="sm" onClick={() => handleReview(data.student.id)}>
                      {data.derivedStatus === 'Not Eligible' ? 'View Reason' : data.derivedStatus === 'Draft' ? 'Edit Draft' : 'Review'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
