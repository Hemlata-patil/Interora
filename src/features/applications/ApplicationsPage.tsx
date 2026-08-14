import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Badge, Button, Input, Select, EmptyState } from '@/components';
import { mockApplications, type ApplicationRecord, type ApplicationStatus } from './data/mockApplications';
import { Search, MapPin, Clock, DollarSign, Calendar, Compass, Eye, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ApplicationsPage: React.FC = () => {
  const [applications] = useState<ApplicationRecord[]>(mockApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const counts = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(
        (a) => a.status === 'Pending Faculty Review' || a.status === 'Company Review'
      ).length,
      approvedSelected: applications.filter(
        (a) => a.status === 'Faculty Approved' || a.status === 'Selected'
      ).length,
      rejectedWithdrawn: applications.filter(
        (a) => a.status === 'Rejected' || a.status === 'Withdrawn'
      ).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Text Search (Title or Company)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchTitle = app.title.toLowerCase().includes(q);
        const matchCompany = app.companyName.toLowerCase().includes(q);
        if (!matchTitle && !matchCompany) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, statusFilter]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Applications"
        description="Monitor submitted internship applications, review faculty approvals, and track hiring decisions."
      />

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">TOTAL APPLICATIONS</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.total}</span>
        </div>
        <div className="p-4 bg-white border border-amber-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">PENDING REVIEW</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{counts.pending}</span>
        </div>
        <div className="p-4 bg-white border border-emerald-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">APPROVED / SELECTED</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{counts.approvedSelected}</span>
        </div>
        <div className="p-4 bg-white border border-rose-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">REJECTED / WITHDRAWN</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{counts.rejectedWithdrawn}</span>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <Input
            placeholder="Search applications by internship title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          label="Filter Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'Pending Faculty Review', label: 'Pending Faculty Review' },
            { value: 'Faculty Approved', label: 'Faculty Approved' },
            { value: 'Company Review', label: 'Company Review' },
            { value: 'Selected', label: 'Selected' },
            { value: 'Rejected', label: 'Rejected' },
            { value: 'Withdrawn', label: 'Withdrawn' },
          ]}
        />
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-3">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors">
                      <Link to={`/student/applications/${app.id}`}>{app.title}</Link>
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>

                  <p className="text-xs font-semibold text-slate-600">
                    {app.companyName} â€¢ <span className="font-normal text-slate-500">{app.location} ({app.workMode})</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>Applied on: <strong className="text-slate-700 font-medium">{app.appliedAt}</strong></span>
                    <span>â€¢</span>
                    <span>Stipend: <strong className="text-emerald-600 font-medium">{app.stipend}</strong></span>
                    <span>â€¢</span>
                    <span>Duration: <strong className="text-slate-700 font-medium">{app.duration}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 sm:pt-0 shrink-0">
                  <Link to={`/student/applications/${app.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Applications Found"
          description="No application records match your current search query or filter selection."
          action={
            <Link to="/student/internships">
              <Button variant="primary" size="sm">
                Browse Internships
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
};