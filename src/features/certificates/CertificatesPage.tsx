import React, { useState } from 'react';
import { PageHeader, Card, Badge } from '@/components';
import { calculateCertificateData } from './data/mockCertificates';
import type { StudentInternshipStatus } from '@/features/student/types/studentJourneyTypes';
import { getStudentFeatureAvailability } from '@/features/student/utils/studentJourneyUtils';
import { RestrictedFeatureGuard } from '@/features/student/components/RestrictedFeatureGuard';

export const CertificatesPage: React.FC = () => {
  const [studentStatus] = useState<StudentInternshipStatus>('ACTIVE');
  const permissions = getStudentFeatureAvailability(studentStatus);
  const cert = calculateCertificateData();

  if (!permissions.canAccessCertificates) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Verified Certificates & Graduation"
          description="Access tamper-proof cryptographic certificates upon successful internship completion."
        />
        <RestrictedFeatureGuard title="Internship Completion Certificates Unavailable" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verified Certificates & Graduation"
        description="Access tamper-proof cryptographic certificates upon successful internship completion."
      />

      {cert ? (
        <Card title="Certificate of Internship Completion" subtitle={`Issued by ${cert.companyName}`}>
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">{cert.internshipTitle}</h4>
              <p className="text-indigo-600 font-semibold">{cert.studentName} â€¢ {cert.startDate} to {cert.endDate}</p>
              <Badge variant="emerald">Cryptographically Verified</Badge>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Certificate Requirements in Progress">
          <p className="text-xs text-slate-500">Your certificate will be issued automatically upon milestone completion.</p>
        </Card>
      )}
    </div>
  );
};