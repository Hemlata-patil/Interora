import React from 'react';
import { Link } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import { Button, Card, Badge } from '@/components';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  Award,
  Users,
  Building2,
  GraduationCap,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={APP_INFO.logo} alt={APP_INFO.name} className="h-9 w-auto object-contain" />
            <div>
              <span className="text-lg font-bold text-slate-900 leading-none block">{APP_INFO.name}</span>
              <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">{APP_INFO.tagline}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <Badge variant="indigo" className="px-3 py-1 text-xs">
            ✨ AI-Powered Internship Intelligence & Management Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Connecting Students, Faculty, and Companies in One Unified Ecosystem
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Interora replaces scattered spreadsheets and manual approvals with a transparent, AI-assisted platform for tracking progress, evaluations, and QR-verifiable certificate issuance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Explore Portals <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Stakeholders Overview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tailored for Every Stakeholder</h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Providing transparent insights, automated approval workflows, and continuous performance tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Students">
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p>Discover internships, submit daily attendance and work logs, track placement readiness, and earn QR-verifiable certificates.</p>
            </div>
          </Card>

          <Card title="Faculty Mentors">
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                <Users className="w-5 h-5" />
              </div>
              <p>Review student applications, monitor assigned interns, review work logs, identify at-risk students, and complete evaluations.</p>
            </div>
          </Card>

          <Card title="Company Mentors">
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                <Building2 className="w-5 h-5" />
              </div>
              <p>Post internship listings, select applicants, assign tasks and milestones, provide feedback, and evaluate intern performance.</p>
            </div>
          </Card>

          <Card title="Administrators">
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p>Platform-wide oversight of users, departments, company verifications, certificate issuance, and analytics.</p>
            </div>
          </Card>
        </div>
      </section>

      {/* High-Level Lifecycle Section */}
      <section className="bg-white border-t border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">The Complete Internship Lifecycle</h2>
            <p className="text-sm text-slate-500">From discovery to verifiable graduation credit</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
            {[
              { step: '01', title: 'Discovery', desc: 'Students search & filter matched opportunities' },
              { step: '02', title: 'Approval', desc: 'Faculty & Company mentor review pipeline' },
              { step: '03', title: 'Execution', desc: 'Daily work logs, attendance & task tracking' },
              { step: '04', title: 'Evaluation', desc: 'Transparent health score & performance rating' },
              { step: '05', title: 'Certification', desc: 'Tamper-proof QR verifiable certificate' },
            ].map((item) => (
              <div key={item.step} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{item.step}</span>
                <h4 className="text-sm font-semibold text-slate-900 mt-1">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-sm">{APP_INFO.name}</span>
            <span>•</span>
            <span>Developed by Team {APP_INFO.team}</span>
          </div>
          <p>© 2026 Interora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
