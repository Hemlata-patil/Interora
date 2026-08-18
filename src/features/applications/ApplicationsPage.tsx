import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, EmptyState } from '@/components';
import { mockApplications, type ApplicationRecord, type ApplicationStatus } from './data/mockApplications';
import { calculateInternshipCountdown } from '@/features/internships/utils/internshipCountdown';
import { FileText, Search, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const [applications] = useState<ApplicationRecord[]>(mockApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = app.title.toLowerCase().includes(q);
        const matchesCompany = app.companyName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany) return false;
      }

      if (statusFilter !== 'All' && app.status !== statusFilter) return false;
      return true;
    });
  }, [applications, searchQuery, statusFilter]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Selected':
        return <Badge variant="emerald">Selected</Badge>;
      case 'Faculty Approved':
      case 'Company Review':
        return <Badge variant="indigo">{status}</Badge>;
      case 'Pending Faculty Review':
        return <Badge variant="neutral">Submitted</Badge>;
      case 'Rejected':
        return <Badge variant="rose">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="My Applications"
        description="Track your submitted internship applications, status updates, and application window deadlines."
      />

      {/* 2. Applications Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL APPLICATIONS</span>
            <span className="text-sm font-bold text-slate-900">{applications.length} Submitted</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SHORTLISTED / SELECTED</span>
            <span className="text-sm font-bold text-slate-900">
              {applications.filter((a) => a.status === 'Selected' || a.status === 'Faculty Approved').length} Active
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">UNDER REVIEW</span>
            <span className="text-sm font-bold text-slate-900">
              {applications.filter((a) => a.status === 'Company Review' || a.status === 'Pending Faculty Review').length} Pending
            </span>
          </div>
        </Card>
      </div>

      {/* 3. List of Applications */}
      <div className="space-y-3">
        {filteredApplications.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((app) => {
              const countdown = calculateInternshipCountdown();

              return (
                <Card key={app.id} className="p-4 hover:border-slate-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm">{app.title}</h4>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-indigo-600 font-semibold">{app.companyName} â€¢ Applied on {app.appliedAt}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Application Status</span>
                        <span className="text-[11px] font-bold text-slate-700">{app.status}</span>
                      </div>

                      <Link to={`/student/applications/${app.id}`}>
                        <Button variant="outline" size="sm">
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Search className="w-6 h-6 text-slate-400" />}
              title="No applications found"
              description="No submitted applications match your current search parameter."
            />
          </Card>
        )}
      </div>
    </div>
  );
};