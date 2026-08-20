import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, Modal, Alert } from '@/components';
import { mockApplications, type ApplicationRecord, type ApplicationStatus } from './data/mockApplications';
import { mockOfferLetters, setMockOfferLetters, type OfferLetterData } from '../faculty/mockData';
import { ArrowLeft, MapPin, Clock, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, XCircle, X, Download } from 'lucide-react';

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<ApplicationRecord[]>(mockApplications);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawNotice, setWithdrawNotice] = useState(false);

  const [localOffers, setLocalOffers] = React.useState<OfferLetterData[]>(mockOfferLetters);
  const [showOfferModal, setShowOfferModal] = React.useState(false);
  const [selectedOffer, setSelectedOffer] = React.useState<OfferLetterData | null>(null);

  React.useEffect(() => {
    setMockOfferLetters(localOffers);
  }, [localOffers]);

  const application = applications.find((item) => item.id === id);

  if (!application) {
    return (
      <div className="space-y-6">
        <PageHeader title="Application Not Found" description="The requested application record could not be found." />
        <Card>
          <div className="p-8 text-center space-y-4">
            <p className="text-xs text-slate-500">The application may have been removed or the ID is invalid.</p>
            <Link to="/student/applications">
              <Button variant="primary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Selected':
        return <Badge variant="emerald">Selected</Badge>;
      case 'Faculty Approved':
        return <Badge variant="emerald">Faculty Approved</Badge>;
      case 'Company Review':
        return <Badge variant="indigo">Company Review</Badge>;
      case 'Pending Faculty Review':
        return <Badge variant="amber">Pending Faculty Review</Badge>;
      case 'Rejected':
        return <Badge variant="rose">Rejected</Badge>;
      case 'Withdrawn':
        return <Badge variant="neutral">Withdrawn</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const isEligibleForWithdrawal =
    application.status !== 'Selected' &&
    application.status !== 'Rejected' &&
    application.status !== 'Withdrawn';

  const handleConfirmWithdraw = () => {
    const updated = applications.map((item) => {
      if (item.id === application.id) {
        return {
          ...item,
          status: 'Withdrawn' as ApplicationStatus,
          lastUpdated: 'Today',
        };
      }
      return item;
    });
    setApplications(updated);
    setIsWithdrawModalOpen(false);
    setWithdrawNotice(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div>
        <button
          onClick={() => navigate('/student/applications')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Applications
        </button>
        <PageHeader
          title={application.title}
          description={`Application ID: ${application.id} â€¢ Submitted on ${application.appliedAt}`}
          action={
            <div className="flex gap-2">
              {(() => {
                const offer = localOffers.find(o => 
                  o.applicationId === application.id || 
                  o.applicationId.replace(/[^0-9]/g, '') === application.id.replace(/[^0-9]/g, '') ||
                  o.internshipId.replace(/[^0-9]/g, '') === application.internshipId?.replace(/[^0-9]/g, '') ||
                  o.companyName === application.companyName
                ) || (localOffers.length > 0 ? localOffers[localOffers.length - 1] : {
                  id: `off-demo-${Date.now()}`,
                  applicationId: application.id,
                  studentId: 'demo-student',
                  internshipId: application.internshipId || 'demo-int',
                  companyId: 'demo-company',
                  studentName: application.applicantName,
                  companyName: application.companyName,
                  internshipTitle: application.title,
                  role: application.title,
                  startDate: new Date().toISOString(),
                  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                  workMode: application.workMode,
                  stipend: application.stipend,
                  offerDate: new Date().toISOString(),
                  additionalTerms: 'Standard internship terms apply.',
                  status: 'pending_response',
                  studentResponse: 'pending',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } as OfferLetterData);

                if (application.status === 'Selected') {
                  return (
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
                      size="sm"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setShowOfferModal(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1.5" /> View Offer Letter
                    </Button>
                  );
                }
                return null;
              })()}
              {isEligibleForWithdrawal ? (
                <Button variant="danger" size="sm" onClick={() => setIsWithdrawModalOpen(true)}>
                  <XCircle className="w-4 h-4 mr-1.5" /> Withdraw Application
                </Button>
              ) : null}
            </div>
          }
        />
      </div>

      {withdrawNotice && (
        <Alert type="warning" title="Application Withdrawn">
          Your application status has been updated to Withdrawn locally. (Supabase status persistence ready for Phase 4).
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Details & Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Internship Metadata Card */}
          <Card title="Target Internship Details">
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{application.title}</h3>
                  <span className="font-semibold text-indigo-600">{application.companyName}</span>
                </div>
                {getStatusBadge(application.status)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">LOCATION</span>
                  <span className="font-semibold text-slate-800">{application.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">WORK MODE</span>
                  <span className="font-semibold text-slate-800">{application.workMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">DURATION</span>
                  <span className="font-semibold text-slate-800">{application.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">STIPEND</span>
                  <span className="font-semibold text-emerald-600">{application.stipend}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Submitted Application Form Information */}
          <Card title="Submitted Application Form" subtitle="Information submitted during application entry">
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Applicant Name</span>
                  <span className="font-semibold text-slate-800 text-sm">{application.applicantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Email</span>
                  <span className="font-semibold text-slate-800 text-sm">{application.applicantEmail}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-1">Attached Resume</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between max-w-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-slate-800">{application.resumeFileName}</span>
                  </div>
                  <Badge variant="indigo">PDF Document</Badge>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-1">Cover Statement</span>
                <p className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 leading-relaxed font-medium">
                  {application.coverLetter}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-1.5">Submitted Skills Highlight</span>
                <div className="flex flex-wrap gap-1.5">
                  {application.submittedSkills.map((sk, idx) => (
                    <Badge key={idx} variant="neutral">
                      {sk}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Application Journey Timeline) */}
        <div className="space-y-6">
          <Card title="Application Journey Timeline" subtitle="Step-by-step approval progression">
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {application.timeline.map((item, idx) => {
                const isCompleted = item.status === 'completed';
                const isCurrent = item.status === 'current';

                return (
                  <div key={idx} className="relative flex items-start space-x-4 pl-8">
                    <div
                      className={`absolute left-1.5 top-0.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        isCompleted
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : isCurrent
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${isCompleted ? 'text-slate-900' : isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{item.date}</span>
                      <p className="text-slate-500 text-[11px] leading-snug">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal for Withdrawal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Application"
        description="Are you sure you want to withdraw this application?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmWithdraw}>
              Confirm Withdrawal
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Withdrawing your application for <strong>{application.title}</strong> at <strong>{application.companyName}</strong> will notify the faculty advisor and remove your profile from the candidate review pipeline.
          </p>
          <Alert type="warning" title="Action Cannot Be Undone">
            Once withdrawn, this application state cannot be reversed. You will need to submit a new application if the internship is still open.
          </Alert>
        </div>
      </Modal>

      {/* Offer Letter Modal */}
      {showOfferModal && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Internship Offer
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowOfferModal(false)} className="h-8 w-8 p-0 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50">
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm font-sans max-w-3xl mx-auto overflow-hidden">
                <div className="bg-indigo-50/80 border-b border-indigo-100 p-8 pb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm">
                      LOGO
                    </div>
                    <div className="text-right text-sm text-indigo-900/80">
                      <p className="font-bold text-indigo-950 text-base">{selectedOffer.companyName}</p>
                      <p>{selectedOffer.internshipAddress || 'Company Address'}</p>
                      <p>www.company.com</p>
                    </div>
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-widest text-indigo-900 text-center mt-6">INTERNSHIP OFFER LETTER</h1>
                </div>
                
                <div className="px-10 pb-10 space-y-6 pt-8">
                  <div className="flex justify-between text-sm text-slate-500">
                    <p><strong>Date:</strong> {new Date(selectedOffer.offerDate).toLocaleDateString()}</p>
                    <p><strong>Ref:</strong> <span className="font-mono text-indigo-600">{selectedOffer.id}</span></p>
                  </div>
                  
                  <div className="space-y-3 mt-6 text-slate-700">
                    <p>Dear <strong className="text-slate-900">{selectedOffer.studentName}</strong>,</p>
                    <p>We are pleased to offer you the position of <strong className="text-indigo-700">{selectedOffer.internshipTitle}</strong> at <strong className="text-slate-900">{selectedOffer.companyName}</strong>.</p>
                    <p>We are excited to have you join our internship program and look forward to your contribution and learning during the internship period.</p>
                  </div>
                  
                  <div className="mt-8 bg-indigo-50/50 p-6 rounded-xl border border-indigo-50/80">
                    <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wider mb-4 border-b border-indigo-100/80 pb-2">Internship Details</h3>
                    <div className="grid grid-cols-3 gap-y-4 text-sm">
                      <span className="text-slate-500 font-medium">Role:</span><span className="col-span-2 font-semibold text-slate-900">{selectedOffer.role}</span>
                      <span className="text-slate-500 font-medium">Duration:</span><span className="col-span-2 font-medium text-slate-800">{new Date(selectedOffer.startDate).toLocaleDateString()} – {new Date(selectedOffer.endDate).toLocaleDateString()}</span>
                      <span className="text-slate-500 font-medium">Work Mode:</span><span className="col-span-2 font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block w-fit">{selectedOffer.workMode}</span>
                      {selectedOffer.workMode !== 'Remote' && (
                        <><span className="text-slate-500 font-medium">Location:</span><span className="col-span-2 font-medium text-slate-800">{selectedOffer.internshipAddress || 'TBD'}</span></>
                      )}
                      <span className="text-slate-500 font-medium mt-1">Stipend:</span><span className="col-span-2 font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-md inline-block w-fit text-base">{selectedOffer.stipend}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Terms and Conditions</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                      <li>This internship is for the specified duration and is subject to your academic clearance.</li>
                      <li>During your internship, you will be expected to adhere to all company policies and work expectations.</li>
                      <li>This offer is contingent upon successful completion of your ongoing coursework and the onboarding process.</li>
                      {selectedOffer.additionalTerms && (
                        <li className="whitespace-pre-wrap text-slate-700">{selectedOffer.additionalTerms}</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="pt-10 mt-10 border-t border-slate-200">
                    <p className="mb-8 text-slate-700">Sincerely,</p>
                    <div className="space-y-1">
                      <p className="font-bold text-indigo-950">For {selectedOffer.companyName}</p>
                      <p className="text-sm text-slate-500 pt-6 border-t border-slate-200 inline-block mt-4 uppercase tracking-wider font-semibold">Authorized Company Representative</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm font-medium">
                Status: <Badge variant={selectedOffer.status === 'accepted' ? 'emerald' : selectedOffer.status === 'rejected' ? 'rose' : 'amber'} className="ml-2">
                  {selectedOffer.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => alert('Offer letter download started')} 
                  className="w-full sm:w-auto text-slate-600 border-slate-200 hover:bg-slate-50"
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                {selectedOffer.status === 'pending_response' && (
                  <>
                    <Button 
                      className="w-full sm:w-auto text-rose-600 border-rose-200 hover:bg-rose-50" 
                      variant="outline"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reject this internship offer?')) {
                          const updated = localOffers.map(o => 
                            o.id === selectedOffer.id 
                              ? { ...o, status: 'rejected' as const, studentResponse: 'rejected' as const, respondedAt: new Date().toISOString() } 
                              : o
                          );
                          setLocalOffers(updated);
                          setSelectedOffer(updated.find(o => o.id === selectedOffer.id) || null);
                        }
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject Offer
                    </Button>
                    <Button 
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        const updated = localOffers.map(o => 
                          o.id === selectedOffer.id 
                            ? { ...o, status: 'accepted' as const, studentResponse: 'accepted' as const, respondedAt: new Date().toISOString() } 
                            : o
                        );
                        setLocalOffers(updated);
                        setSelectedOffer(updated.find(o => o.id === selectedOffer.id) || null);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Offer
                    </Button>
                  </>
                )}
                {selectedOffer.status !== 'pending_response' && (
                  <Button variant="outline" onClick={() => setShowOfferModal(false)}>Close</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};