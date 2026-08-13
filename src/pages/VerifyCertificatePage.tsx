import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import { Card, Badge, Alert, Button } from '@/components';
import { ShieldCheck, Award, CheckCircle2, ArrowLeft } from 'lucide-react';

export const VerifyCertificatePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-3">
            <img src={APP_INFO.logo} alt={APP_INFO.name} className="h-10 w-auto object-contain" />
            <span className="text-2xl font-bold text-slate-900">{APP_INFO.name}</span>
          </Link>
          <p className="text-xs text-slate-500">Official Certificate Verification Portal</p>
        </div>

        <Card>
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <Badge variant="emerald" className="px-3 py-1 text-xs">
                Authentic & Verified Certificate
              </Badge>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Internship Completion Certificate</h2>
              <p className="text-xs text-slate-500 mt-1">Verification Token: {token || 'DEMO-8923-VERIFIED'}</p>
            </div>

            <div className="border-t border-b border-slate-100 py-4 space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-semibold text-slate-900">Verified Student</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Internship Domain:</span>
                <span className="font-semibold text-slate-900">Software Engineering</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Host Organization:</span>
                <span className="font-semibold text-slate-900">TechCorp Solutions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Completion Status:</span>
                <span className="font-semibold text-emerald-600">Successfully Completed</span>
              </div>
            </div>

            <Alert type="info">
              Private student personal records are protected under institutional privacy guidelines. Only essential verification details are rendered.
            </Alert>

            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
