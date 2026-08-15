import React from 'react';
import { Badge } from '@/components';
import interoraLogo from '@/assets/interora_logo.png';
import type { CertificateRecord } from '../data/mockCertificates';

export interface CertificatePreviewProps {
  certificate: CertificateRecord;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ certificate }) => {
  return (
    <div className="p-8 sm:p-12 bg-white border-8 border-indigo-50/80 rounded-2xl shadow-md text-center space-y-6 max-w-3xl mx-auto relative overflow-hidden print:border-4 print:shadow-none">
      {/* Background Watermark Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/20 via-transparent to-emerald-50/20 pointer-events-none"></div>

      {/* Header Brand */}
      <div className="flex flex-col items-center justify-center space-y-2">
        <img src={interoraLogo} alt="Interora Logo" className="h-12 w-auto object-contain mx-auto" />
        <span className="text-xs font-extrabold text-indigo-700 tracking-widest uppercase">
          INTERORA EXPERIENTIAL LEARNING PLATFORM
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Certificate of Internship Completion
        </h2>
        <p className="text-xs text-slate-500 font-medium">Verified Institutional Credential</p>
      </div>

      <div className="py-2">
        <span className="text-xs text-slate-500 italic block">This official certificate is awarded to</span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 mt-1 underline decoration-indigo-300 underline-offset-8">
          {certificate.studentName}
        </h3>
      </div>

      <div className="max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          For successfully completing the industry internship program as a{' '}
          <strong className="text-slate-900 font-bold">{certificate.internshipTitle}</strong> at{' '}
          <strong className="text-indigo-700 font-bold">{certificate.companyName}</strong> from{' '}
          <span className="font-semibold text-slate-800">{certificate.startDate}</span> to{' '}
          <span className="font-semibold text-slate-800">{certificate.endDate}</span>.
        </p>
      </div>

      {/* Skills Badges */}
      <div className="pt-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">VERIFIED PROFICIENCIES</span>
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto">
          {certificate.skills.map((skill, idx) => (
            <Badge key={idx} variant="indigo" className="text-[11px]">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Footer Signatures & Certificate Metadata */}
      <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs text-slate-600 max-w-lg mx-auto">
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 block">{certificate.companyName}</span>
          <span className="text-[10px] text-slate-400 block">Host Mentor Approval</span>
        </div>
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 block">AlphaStack Institutional Board</span>
          <span className="text-[10px] text-slate-400 block">Academic Operations</span>
        </div>
      </div>

      <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 max-w-xl mx-auto">
        <span>Certificate Number: <strong className="font-mono text-slate-600">{certificate.certificateNumber}</strong></span>
        <span>Issue Date: <strong className="font-mono text-slate-600">{certificate.issueDate || 'Pending'}</strong></span>
      </div>
    </div>
  );
};