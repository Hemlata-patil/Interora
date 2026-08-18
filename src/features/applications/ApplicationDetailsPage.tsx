import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, Modal, Alert } from '@/components';
import { mockApplications, type ApplicationRecord, type ApplicationStatus } from './data/mockApplications';
import { ArrowLeft, MapPin, Clock, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<ApplicationRecord[]>(mockApplications);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawNotice, setWithdrawNotice] = useState(false);

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
            isEligibleForWithdrawal ? (
              <Button variant="danger" size="sm" onClick={() => setIsWithdrawModalOpen(true)}>
                <XCircle className="w-4 h-4 mr-1.5" /> Withdraw Application
              </Button>
            ) : null
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
    </div>
  );
};