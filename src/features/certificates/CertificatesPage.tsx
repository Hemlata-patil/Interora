import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Button, EmptyState } from '@/components';
import { type CertificateRecord, type CertificateRequirement, type CertificateStatus } from './data/mockCertificates';
import { CertificateEligibility } from './components/CertificateEligibility';
import { CertificatePreview } from './components/CertificatePreview';
import { Compass, Download, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  fetchActiveStudentInternshipBackend,
  fetchStudentCertificatesBackend,
  fetchStudentActiveInternshipMetricsBackend,
  type ActiveStudentInternshipRecord,
} from '@/services/api/backendService';

export const CertificatesPage: React.FC = () => {
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadCertificate = async () => {
    try {
      const [act, certs] = await Promise.all([
        fetchActiveStudentInternshipBackend(),
        fetchStudentCertificatesBackend(),
      ]);

      if (!act) {
        setCertificate(null);
        return;
      }

      // If an issued certificate exists in PostgreSQL
      const issuedCert = certs.find((c: any) => c.status === 'issued') || certs[0];
      const metrics = await fetchStudentActiveInternshipMetricsBackend(act.assignmentId);

      const totalTasks = metrics.totalTasks;
      const completedTasks = metrics.completedTasks;
      const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const attendancePercentage = metrics.attendancePercentage;

      const requirements: CertificateRequirement[] = [
        {
          id: 'req_01',
          name: 'Attendance Requirement',
          currentValue: `${attendancePercentage}%`,
          requiredValue: '>= 75%',
          isMet: attendancePercentage >= 75,
        },
        {
          id: 'req_02',
          name: 'Required Tasks Completion',
          currentValue: `${completedTasks} / ${totalTasks} tasks (${taskCompletionPercentage}%)`,
          requiredValue: '100% Tasks',
          isMet: taskCompletionPercentage === 100 || (totalTasks === 0 && Boolean(issuedCert)),
        },
        {
          id: 'req_03',
          name: 'Milestone Progression',
          currentValue: issuedCert ? '100% Milestones' : 'In Progress',
          requiredValue: '100% Milestones',
          isMet: Boolean(issuedCert) || taskCompletionPercentage === 100,
        },
        {
          id: 'req_04',
          name: 'Final Mentor Evaluation',
          currentValue: issuedCert ? 'Completed' : 'Pending Mentor Review',
          requiredValue: 'Completed Evaluation',
          isMet: Boolean(issuedCert),
        },
      ];

      const isEligible = Boolean(issuedCert) || requirements.every((r) => r.isMet);
      const status: CertificateStatus = issuedCert ? 'Issued' : isEligible ? 'Eligible' : 'Not Eligible';

      const certRecord: CertificateRecord = {
        id: issuedCert?.id || 'cert_' + act.assignmentId,
        certificateNumber: issuedCert?.certificateNumber || 'CERT-PENDING',
        studentName: (issuedCert as any)?.student?.profile?.fullName || 'Student Intern',
        internshipId: act.internshipId || act.assignmentId,
        internshipTitle: act.title,
        companyName: act.companyName,
        startDate: act.startDate || '2026-08-01',
        endDate: act.endDate || '2026-11-30',
        issueDate: issuedCert?.issuedAt
          ? issuedCert.issuedAt.slice(0, 10)
          : isEligible
          ? new Date().toISOString().slice(0, 10)
          : undefined,
        status,
        isEligible,
        attendancePercentage,
        milestoneCompletionPercentage: issuedCert ? 100 : 75,
        taskCompletionPercentage,
        evaluationCompleted: Boolean(issuedCert),
        evaluationScore: 9.0,
        skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'REST API'],
        requirements,
      };

      setCertificate(certRecord);
    } catch (err) {
      console.error('[CertificatesPage] Error loading certificate:', err);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificate();

    const handleFocus = () => {
      loadCertificate();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    if (!certificate) return;
    const certHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Interora Certificate - ${certificate.studentName}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; background: #f8fafc; }
            .cert-box { border: 8px solid #e0e7ff; padding: 40px; background: white; max-width: 700px; margin: auto; border-radius: 16px; }
            h1 { color: #312e81; margin-bottom: 0; }
            h2 { color: #1e1b4b; margin-top: 10px; }
            .highlight { color: #4338ca; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <p style="color: #4338ca; font-weight: bold; letter-spacing: 2px;">INTERORA EXPERIENTIAL LEARNING PLATFORM</p>
            <h1>Certificate of Internship Completion</h1>
            <p style="color: #64748b;">This certificate is awarded to</p>
            <h2 class="highlight" style="font-size: 28px;">${certificate.studentName}</h2>
            <p>For successfully completing the internship program as <strong>${certificate.internshipTitle}</strong> at <strong>${certificate.companyName}</strong> (${certificate.startDate} to ${certificate.endDate}).</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #94a3b8;">Certificate Number: ${certificate.certificateNumber} | Issued: ${certificate.issueDate || 'Pending'}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([certHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Interora_Certificate_${certificate.studentName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Certificates & Graduation"
          description="View certificate eligibility, completion criteria, and verified credentials."
        />
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Checking certificate records & eligibility...</span>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Certificates & Graduation"
          description="View certificate eligibility, completion criteria, and verified credentials."
        />
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Internship Completion Record"
          description="No active or completed internship record is available for certificate issuance."
          action={
            <Link to="/student/internships">
              <Button variant="primary" size="sm">
                Browse Internships
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Certificates & Graduation"
        description="Verify completion criteria, track certificate eligibility, and print your official credential."
        action={
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!certificate.isEligible}
              title={!certificate.isEligible ? 'Complete all requirements to print' : 'Print Certificate'}
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Certificate
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadHTML}
              disabled={!certificate.isEligible}
              title={!certificate.isEligible ? 'Complete all requirements to download' : 'Download Printable Certificate'}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download Printable HTML
            </Button>
          </div>
        }
      />

      {/* 2. Active Internship Summary Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">{certificate.internshipTitle}</h3>
              <Badge variant={certificate.isEligible ? 'emerald' : 'amber'}>{certificate.status}</Badge>
            </div>
            <p className="text-slate-600 font-semibold mt-0.5">{certificate.companyName}</p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">ATTENDANCE</span>
              <span className="font-bold text-slate-800 text-xs">{certificate.attendancePercentage}%</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">MILESTONES</span>
              <span className="font-bold text-slate-800 text-xs">{certificate.milestoneCompletionPercentage}%</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">EVALUATION</span>
              <span className="font-bold text-indigo-600 text-xs">{certificate.evaluationCompleted ? 'Completed' : 'Pending'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Certificate Eligibility Verification Card */}
      <CertificateEligibility certificate={certificate} />

      {/* 4. Certificate Preview Component */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Official Certificate Preview</h3>
          {!certificate.isEligible && (
            <span className="text-xs text-amber-600 font-medium">Watermarked Preview â€” Complete requirements to unlock official download</span>
          )}
        </div>
        <CertificatePreview certificate={certificate} />
      </div>
    </div>
  );
};