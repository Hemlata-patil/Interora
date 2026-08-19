import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader, Card, Button, Badge, Alert, StatCard, Input } from '@/components';
import { 
  Users, CheckCircle2, Clock, X, Search, Filter, 
  Sparkles, User, BrainCircuit, ExternalLink, ChevronRight 
} from 'lucide-react';
import { 
  mockCompanyApplications, setMockCompanyApplications,
  mockFacultyStudents, mockCompanyInternships,
  mockOfferLetters, setMockOfferLetters
} from '../faculty/mockData';
import type { 
  InternshipData, 
  CompanyApplicationData, 
  CompanyApplicationStatus, 
  SharedStudentData,
  OfferLetterData
} from '../faculty/mockData';

type ViewState = 'LIST' | 'VIEW_PROFILE';

export const ApplicantManagement: React.FC = () => {
  const [applications, setApplications] = useState<CompanyApplicationData[]>(mockCompanyApplications);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('');
  
  const [viewState, setViewState] = useState<ViewState>('LIST');
  const [currentApp, setCurrentApp] = useState<{ app: CompanyApplicationData, student: SharedStudentData } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState<string>('approved'); // Default to approved
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRunComplete, setAiRunComplete] = useState(false);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPreviewMode, setOfferPreviewMode] = useState(false);
  const [rejectModalState, setRejectModalState] = useState<{isOpen: boolean, appId: string | null}>({isOpen: false, appId: null});
  const [selectModalState, setSelectModalState] = useState<{isOpen: boolean, appId: string | null}>({isOpen: false, appId: null});
  const [offerFormData, setOfferFormData] = useState({
    startDate: '',
    endDate: '',
    workMode: 'Hybrid',
    internshipAddress: '',
    stipend: '',
    additionalTerms: ''
  });
  const [localOfferLetters, setLocalOfferLetters] = useState<OfferLetterData[]>(mockOfferLetters);

  useEffect(() => {
    setMockOfferLetters(localOfferLetters);
  }, [localOfferLetters]);
  
  // Sync mock data
  useEffect(() => {
    setMockCompanyApplications(applications);
  }, [applications]);

  // Set initial selected internship if available
  useEffect(() => {
    if (mockCompanyInternships.length > 0 && !selectedInternshipId) {
      setSelectedInternshipId(mockCompanyInternships[0].id);
    }
  }, []);

  // Compute joined data for the currently selected internship
  const currentInternshipData = useMemo(() => {
    const apps = applications.filter(a => a.internshipId === selectedInternshipId);
    
    // Join with student data
    const joined = apps.map(app => {
      const student = mockFacultyStudents.find(s => s.id === app.studentId);
      return { app, student };
    }).filter(item => item.student !== undefined) as { app: CompanyApplicationData, student: SharedStudentData }[];
    
    return joined;
  }, [applications, selectedInternshipId]);

  // Filtering
  const filteredApplicants = useMemo(() => {
    return currentInternshipData.filter(({ app, student }) => {
      // 1. Must match search
      const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 2. Match Faculty Filter
      const matchesFaculty = filterFaculty === 'All' || app.facultyApprovalStatus === filterFaculty;
      
      // 3. Match App Status Filter
      const matchesStatus = filterStatus === 'All' || app.applicationStatus === filterStatus;

      return matchesSearch && matchesFaculty && matchesStatus;
    });
  }, [currentInternshipData, searchTerm, filterFaculty, filterStatus]);

  // Metrics
  const totalAppsCount = currentInternshipData.length;
  const facultyApprovedCount = currentInternshipData.filter(i => i.app.facultyApprovalStatus === 'approved').length;
  const aiShortlistedCount = currentInternshipData.filter(i => i.app.applicationStatus === 'Shortlisted' || i.app.applicationStatus === 'Selected').length;
  const selectedCount = currentInternshipData.filter(i => i.app.applicationStatus === 'Selected').length;

  const handleRunAi = () => {
    setIsAiLoading(true);
    // Simulate AI loading
    setTimeout(() => {
      setIsAiLoading(false);
      setAiRunComplete(true);
    }, 2000);
  };

  const updateAppStatus = (appId: string, status: CompanyApplicationStatus) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, applicationStatus: status } : a));
    
    // Update local current app if viewing profile
    if (currentApp && currentApp.app.id === appId) {
      setCurrentApp({ ...currentApp, app: { ...currentApp.app, applicationStatus: status } });
    }
  };

  const getFacultyBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge variant="emerald" className="text-[10px] py-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'pending': return <Badge variant="amber" className="text-[10px] py-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'rejected': return <Badge variant="rose" className="text-[10px] py-0"><X className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default: return null;
    }
  };

  const getAppStatusBadge = (status: string) => {
    switch(status) {
      case 'Under Review': return <Badge variant="neutral" className="text-[10px] py-0">Under Review</Badge>;
      case 'Shortlisted': return <Badge variant="indigo" className="text-[10px] py-0"><Sparkles className="w-3 h-3 mr-1" /> Shortlisted</Badge>;
      case 'Selected': return <Badge variant="emerald" className="text-[10px] py-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Selected</Badge>;
      case 'Rejected': return <Badge variant="rose" className="text-[10px] py-0">Rejected</Badge>;
      default: return null;
    }
  };

  const rejectModalJSX = rejectModalState.isOpen && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Candidate?</h3>
        <p className="text-slate-600 mb-6">Are you sure you want to reject this applicant? They will no longer be eligible for an Offer Letter.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setRejectModalState({ isOpen: false, appId: null })}>Cancel</Button>
          <Button 
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={() => {
              if (rejectModalState.appId) {
                updateAppStatus(rejectModalState.appId, 'Rejected');
                setRejectModalState({ isOpen: false, appId: null });
              }
            }}
          >
            Reject Candidate
          </Button>
        </div>
      </div>
    </div>
  );

  const selectModalJSX = selectModalState.isOpen && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Select Candidate?</h3>
        <p className="text-slate-600 mb-6">Are you sure you want to officially select this candidate for the internship? You will be able to create an Offer Letter immediately.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setSelectModalState({ isOpen: false, appId: null })}>Cancel</Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              if (selectModalState.appId) {
                updateAppStatus(selectModalState.appId, 'Selected');
                setSelectModalState({ isOpen: false, appId: null });
              }
            }}
          >
            Select Candidate
          </Button>
        </div>
      </div>
    </div>
  );

  const offerModalJSX = showOfferModal && currentApp ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {offerPreviewMode ? 'Internship Offer Letter' : 'Create Offer Letter'}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setShowOfferModal(false)} className="h-8 w-8 p-0 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {!offerPreviewMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Student Name</label>
                  <Input value={currentApp.student.studentName} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Internship Role</label>
                  <Input value={currentApp.app.internshipId ? mockCompanyInternships.find(i => i.id === currentApp.app.internshipId)?.title || '' : ''} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <Input type="date" value={offerFormData.startDate} onChange={e => setOfferFormData({...offerFormData, startDate: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <Input type="date" value={offerFormData.endDate} onChange={e => setOfferFormData({...offerFormData, endDate: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Work Mode</label>
                  <select 
                    value={offerFormData.workMode} 
                    onChange={e => setOfferFormData({...offerFormData, workMode: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Stipend (Monthly)</label>
                  <Input placeholder="e.g. ₹15,000" value={offerFormData.stipend} onChange={e => setOfferFormData({...offerFormData, stipend: e.target.value})} />
                </div>
                {offerFormData.workMode !== 'Remote' && (
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-sm font-medium text-slate-700">Internship Address</label>
                    <Input placeholder="e.g. ABC Technologies, Hinjewadi Phase 1, Pune, Maharashtra" value={offerFormData.internshipAddress} onChange={e => setOfferFormData({...offerFormData, internshipAddress: e.target.value})} />
                  </div>
                )}
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="text-sm font-medium text-slate-700">Additional Terms & Information</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add any specific terms, conditions, or welcome message..."
                  value={offerFormData.additionalTerms}
                  onChange={e => setOfferFormData({...offerFormData, additionalTerms: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl bg-white shadow-sm font-sans max-w-3xl mx-auto overflow-hidden">
              <div className="bg-indigo-50/80 border-b border-indigo-100 p-8 pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm">
                    LOGO
                  </div>
                  <div className="text-right text-sm text-indigo-900/80">
                    <p className="font-bold text-indigo-950 text-base">{currentApp.student.company}</p>
                    <p>{offerFormData.internshipAddress || 'Company Address'}</p>
                    <p>www.company.com</p>
                  </div>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-widest text-indigo-900 text-center mt-6">INTERNSHIP OFFER LETTER</h1>
              </div>
              
              <div className="px-10 pb-10 space-y-6 pt-8">
                <div className="flex justify-between text-sm text-slate-500">
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Ref:</strong> <span className="font-mono text-indigo-600">{`OFF-${Math.floor(Math.random() * 10000)}`}</span></p>
                </div>
                
                <div className="space-y-3 mt-6 text-slate-700">
                  <p>Dear <strong className="text-slate-900">{currentApp.student.studentName}</strong>,</p>
                  <p>We are pleased to offer you the position of <strong className="text-indigo-700">{mockCompanyInternships.find(i => i.id === currentApp.app.internshipId)?.title}</strong> at <strong className="text-slate-900">{currentApp.student.company}</strong>.</p>
                  <p>We are excited to have you join our internship program and look forward to your contribution and learning during the internship period.</p>
                </div>
                
                <div className="mt-8 bg-indigo-50/50 p-6 rounded-xl border border-indigo-50/80">
                  <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wider mb-4 border-b border-indigo-100/80 pb-2">Internship Details</h3>
                  <div className="grid grid-cols-3 gap-y-4 text-sm">
                    <span className="text-slate-500 font-medium">Role:</span><span className="col-span-2 font-semibold text-slate-900">{mockCompanyInternships.find(i => i.id === currentApp.app.internshipId)?.title}</span>
                    <span className="text-slate-500 font-medium">Department:</span><span className="col-span-2 font-medium text-slate-800">{currentApp.student.department || 'Engineering'}</span>
                    <span className="text-slate-500 font-medium">Duration:</span><span className="col-span-2 font-medium text-slate-800">{new Date(offerFormData.startDate).toLocaleDateString()} – {new Date(offerFormData.endDate).toLocaleDateString()}</span>
                    <span className="text-slate-500 font-medium">Work Mode:</span><span className="col-span-2 font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block w-fit">{offerFormData.workMode}</span>
                    {offerFormData.workMode !== 'Remote' && (
                      <><span className="text-slate-500 font-medium">Location:</span><span className="col-span-2 font-medium text-slate-800">{offerFormData.internshipAddress || 'TBD'}</span></>
                    )}
                    <span className="text-slate-500 font-medium mt-1">Stipend:</span><span className="col-span-2 font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-md inline-block w-fit text-base">{offerFormData.stipend}</span>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Terms and Conditions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                    <li>This internship is for the specified duration and is subject to your academic clearance.</li>
                    <li>During your internship, you will be expected to adhere to all company policies and work expectations.</li>
                    <li>This offer is contingent upon successful completion of your ongoing coursework and the onboarding process.</li>
                    {offerFormData.additionalTerms && (
                      <li className="whitespace-pre-wrap text-slate-700">{offerFormData.additionalTerms}</li>
                    )}
                  </ul>
                </div>
                
                <div className="pt-10 mt-10 border-t border-slate-200">
                  <p className="mb-8 text-slate-700">Sincerely,</p>
                  <div className="space-y-1">
                    <p className="font-bold text-indigo-950">For {currentApp.student.company}</p>
                    <p className="text-sm text-slate-500 pt-6 border-t border-slate-200 inline-block mt-4 uppercase tracking-wider font-semibold">Authorized Company Representative</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          {!offerPreviewMode ? (
            <>
              <Button variant="outline" onClick={() => setShowOfferModal(false)}>Cancel</Button>
              <Button 
                className="bg-indigo-600 text-white"
                disabled={!offerFormData.startDate || !offerFormData.endDate || !offerFormData.stipend}
                onClick={() => setOfferPreviewMode(true)}
              >
                Preview Offer Letter
              </Button>
            </>
          ) : (
            <>
              {localOfferLetters.find(o => o.applicationId === currentApp.app.id) ? (
                <Button variant="outline" onClick={() => setShowOfferModal(false)}>Close</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setOfferPreviewMode(false)}>Edit</Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      const newOffer: OfferLetterData = {
                        id: `off-${Date.now()}`,
                        applicationId: currentApp.app.id,
                        studentId: currentApp.student.id,
                        internshipId: currentApp.app.internshipId,
                        companyId: currentApp.app.companyId,
                        studentName: currentApp.student.studentName,
                        companyName: currentApp.student.company,
                        internshipTitle: mockCompanyInternships.find(i => i.id === currentApp.app.internshipId)?.title || 'Internship',
                        role: mockCompanyInternships.find(i => i.id === currentApp.app.internshipId)?.title || 'Intern',
                        startDate: offerFormData.startDate,
                        endDate: offerFormData.endDate,
                        workMode: offerFormData.workMode,
                        internshipAddress: offerFormData.workMode !== 'Remote' ? offerFormData.internshipAddress : undefined,
                        stipend: offerFormData.stipend,
                        offerDate: new Date().toISOString(),
                        additionalTerms: offerFormData.additionalTerms,
                        status: 'pending_response',
                        studentResponse: 'pending',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      setLocalOfferLetters([...localOfferLetters, newOffer]);
                      setShowOfferModal(false);
                      
                      if (currentApp.app.applicationStatus !== 'Selected') {
                        updateAppStatus(currentApp.app.id, 'Selected');
                      }
                    }}
                  >
                    Send Offer Letter
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;

  if (viewState === 'VIEW_PROFILE' && currentApp) {
    const { app, student } = currentApp;
    const internship = mockCompanyInternships.find(i => i.id === app.internshipId);

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setViewState('LIST')} className="p-2 h-auto text-slate-500">
            <X className="w-5 h-5" />
          </Button>
          <PageHeader
            title="Applicant Profile"
            description={`Viewing application for ${internship?.title || 'Internship'}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
                  {student.studentName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{student.studentName}</h2>
                  <p className="text-sm font-medium text-slate-600">{student.email}</p>
                  <p className="text-sm text-slate-500 mt-1">{student.department} • Batch of {student.batchYear}</p>
                  <div className="flex gap-2 mt-3">
                    {getFacultyBadge(app.facultyApprovalStatus)}
                    {getAppStatusBadge(app.applicationStatus)}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Skills & Expertise" className="shadow-sm">
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill, idx) => (
                  <Badge key={idx} variant="neutral" className="px-3 py-1 bg-slate-50">{skill}</Badge>
                ))}
              </div>
            </Card>

            <Card title="Academic & Experience Summary" className="shadow-sm">
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Academic Performance</h4>
                  <p>Consistently strong academic record. Relevant coursework matches internship requirements.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Projects</h4>
                  <p>{student.coverMessage}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-indigo-100 bg-indigo-50/30">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">AI Insights</h3>
              </div>
              
              {app.allocatorMatchScore ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Match Score</span>
                    <span className="text-2xl font-black text-indigo-600">{app.allocatorMatchScore}%</span>
                  </div>
                  
                  {app.allocatorScoreBreakdown && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Skills Match</span>
                        <span className="font-semibold text-slate-700">{app.allocatorScoreBreakdown.skillsMatch}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Academic</span>
                        <span className="font-semibold text-slate-700">{app.allocatorScoreBreakdown.academicPerformance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Experience</span>
                        <span className="font-semibold text-slate-700">{app.allocatorScoreBreakdown.relevantExperience}%</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-indigo-100/50">
                    <p className="text-sm text-slate-700 italic">"{app.allocatorExplanation}"</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Run AI Allocator to generate match insights.</p>
              )}
            </Card>

            <Card title="Company Decision" className="shadow-sm">
              <div className="space-y-3">
                {app.applicationStatus === 'Rejected' && (
                  <div className="flex flex-col items-center justify-center p-4 bg-rose-50 rounded-lg border border-rose-100 mb-4">
                    <X className="w-8 h-8 text-rose-500 mb-2" />
                    <p className="font-bold text-rose-700">Candidate Rejected</p>
                  </div>
                )}

                {app.applicationStatus === 'Selected' && (
                  <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="font-bold text-emerald-700">Candidate Selected</p>
                  </div>
                )}

                {app.applicationStatus !== 'Selected' && app.applicationStatus !== 'Rejected' && (
                  <>
                    <Button 
                      className="w-full justify-center" 
                      variant={app.applicationStatus === 'Shortlisted' ? 'secondary' : 'outline'}
                      onClick={() => updateAppStatus(app.id, app.applicationStatus === 'Shortlisted' ? 'Under Review' : 'Shortlisted')}
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> 
                      {app.applicationStatus === 'Shortlisted' ? 'Remove from Shortlist' : 'Mark as Shortlisted'}
                    </Button>
                    
                    <Button 
                      className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white" 
                      onClick={() => setSelectModalState({ isOpen: true, appId: app.id })}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> 
                      Select Candidate
                    </Button>
                  </>
                )}

                {app.applicationStatus === 'Selected' && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Offer Status</h4>
                    {(() => {
                      const existingOffer = localOfferLetters.find(o => o.applicationId === app.id);
                      if (existingOffer) {
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600">Status:</span>
                              <Badge variant={
                                existingOffer.status === 'accepted' ? 'emerald' : 
                                existingOffer.status === 'rejected' ? 'rose' : 'amber'
                              }>
                                {existingOffer.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full mt-2"
                              onClick={() => {
                                setOfferFormData({
                                  startDate: existingOffer.startDate,
                                  endDate: existingOffer.endDate,
                                  workMode: existingOffer.workMode,
                                  internshipAddress: existingOffer.internshipAddress || '',
                                  stipend: existingOffer.stipend,
                                  additionalTerms: existingOffer.additionalTerms
                                });
                                setOfferPreviewMode(true);
                                setShowOfferModal(true);
                              }}
                            >
                              View Offer Details
                            </Button>
                          </div>
                        );
                      }
                      return (
                        <Button 
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => {
                            setOfferFormData({
                              startDate: '',
                              endDate: '',
                              workMode: 'Hybrid',
                              internshipAddress: '',
                              stipend: '',
                              additionalTerms: ''
                            });
                            setOfferPreviewMode(false);
                            setShowOfferModal(true);
                          }}
                        >
                          Create Offer Letter
                        </Button>
                      );
                    })()}
                  </div>
                )}
                
                {app.applicationStatus !== 'Rejected' && (
                  <Button 
                    className="w-full justify-center text-rose-600 border-rose-200 hover:bg-rose-50 mt-4" 
                    variant="outline"
                    onClick={() => setRejectModalState({ isOpen: true, appId: app.id })}
                  >
                    {app.applicationStatus === 'Selected' ? 'Withdraw Selection / Reject' : 'Reject Candidate'}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      {offerModalJSX}
      {rejectModalJSX}
      {selectModalJSX}
      </div>
    );
  }

  // AI Shortlist Section (Visible only when AI run completes)
  const aiShortlist = aiRunComplete ? filteredApplicants
    .filter(i => i.app.allocatorMatchScore)
    .sort((a, b) => (b.app.allocatorMatchScore || 0) - (a.app.allocatorMatchScore || 0))
    .slice(0, 3) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Applicants"
        description="Review faculty-approved candidates and select the best fit for your internship opportunities."
      />

      {/* Select Internship */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Select Internship:</label>
          <select
            value={selectedInternshipId}
            onChange={(e) => {
              setSelectedInternshipId(e.target.value);
              setAiRunComplete(false);
            }}
            className="w-full sm:w-96 bg-white border border-slate-300 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 shadow-sm"
          >
            {mockCompanyInternships.map(internship => (
              <option key={internship.id} value={internship.id}>
                {internship.title} ({internship.status})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applicants" value={totalAppsCount.toString()} icon={Users} />
        <StatCard title="Faculty Approved" value={facultyApprovedCount.toString()} icon={CheckCircle2} />
        <StatCard title="Shortlisted" value={aiShortlistedCount.toString()} icon={Sparkles} />
        <StatCard title="Selected" value={selectedCount.toString()} icon={User} />
      </div>

      {/* Toolbar & AI Action */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 gap-4 w-full flex-col sm:flex-row">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[140px]"
            >
              <option value="All">All Approvals</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[140px]"
            >
              <option value="All">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <Button 
          onClick={handleRunAi} 
          disabled={isAiLoading || facultyApprovedCount === 0}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
        >
          <BrainCircuit className="w-4 h-4 mr-2" /> 
          {isAiLoading ? 'Analyzing approved applicants...' : 'Run AI Allocator'}
        </Button>
      </div>

      {/* AI Recommended Shortlist */}
      {aiRunComplete && aiShortlist.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">AI Recommended Shortlist</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiShortlist.map((item, index) => (
              <Card key={item.app.id} className="p-4 shadow-sm border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                  RANK #{index + 1}
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{item.student.studentName}</h3>
                    <p className="text-xs font-medium text-slate-500">{item.student.department}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-indigo-600 leading-none">{item.app.allocatorMatchScore}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                  "{item.app.allocatorExplanation}"
                </p>
                <Button variant="outline" size="sm" className="w-full justify-center text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => {
                  setCurrentApp(item);
                  setViewState('VIEW_PROFILE');
                }}>
                  View Profile
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Applicant List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">All Candidates</h2>
        {filteredApplicants.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredApplicants.map(({ app, student }) => (
              <Card key={app.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                    {student.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900 truncate">{student.studentName}</h3>
                      <div className="flex gap-1.5 flex-wrap">
                        {getFacultyBadge(app.facultyApprovalStatus)}
                        {getAppStatusBadge(app.applicationStatus)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>University Institute of Technology (Mock)</span>
                      <span>•</span>
                      <span>{student.department}</span>
                      <span>•</span>
                      <span>Applied: {app.appliedDate}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {student.skills.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="neutral" className="bg-slate-50 text-[10px] px-2 py-0">{skill}</Badge>
                      ))}
                      {student.skills.length > 4 && <Badge variant="neutral" className="bg-slate-50 text-[10px] px-2 py-0">+{student.skills.length - 4}</Badge>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0 pt-4 border-t border-slate-100 md:border-0 md:pt-0 shrink-0">
                    {app.allocatorMatchScore && (
                      <div className="text-center md:text-right hidden sm:block">
                        <span className="block text-lg font-bold text-indigo-600">{app.allocatorMatchScore}%</span>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Match</span>
                      </div>
                    )}
                    
                    {app.facultyApprovalStatus !== 'approved' ? (
                      <div className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                        Pending Faculty Approval
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => {
                        setCurrentApp({ app, student });
                        setViewState('VIEW_PROFILE');
                      }}>
                        View Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No applicants found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or selecting a different internship.</p>
          </div>
        )}
      </div>

      {/* Offer Letter Modal */}
      {offerModalJSX}

      {/* Reject Confirmation Modal */}
      {rejectModalJSX}

      {/* Select Confirmation Modal */}
      {selectModalJSX}
    </div>
  );
};
