import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader, Card, Badge, Button, Input, Select, EmptyState } from '@/components';
import { Search, Compass, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  fetchStudentApplicationsBackend,
  type StudentApplicationRecord,
} from '@/services/api/backendService';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<StudentApplicationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadApps = async () => {
      const remoteApps = await fetchStudentApplicationsBackend();
      setApplications(remoteApps);
    };
    loadApps();
  }, []);

  const counts = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'Submitted').length,
      approvedSelected: applications.filter((a) => a.status === 'Shortlisted' || a.status === 'Selected').length,
      rejectedWithdrawn: applications.filter((a) => a.status === 'Rejected').length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchTitle = (app.internshipTitle || '').toLowerCase().includes(q);
        const matchCompany = (app.companyName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCompany) return false;
      }

      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selected':
        return <Badge variant="emerald">Selected</Badge>;
      case 'Shortlisted':
        return <Badge variant="indigo">Shortlisted</Badge>;
      case 'Rejected':
        return <Badge variant="rose">Rejected</Badge>;
      default:
        return <Badge variant="amber">Submitted</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Monitor submitted internship applications, review status updates, and track hiring decisions."
      />

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">TOTAL APPLICATIONS</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.total}</span>
        </div>
        <div className="p-4 bg-white border border-amber-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">SUBMITTED</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{counts.pending}</span>
        </div>
        <div className="p-4 bg-white border border-emerald-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">SHORTLISTED / SELECTED</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{counts.approvedSelected}</span>
        </div>
        <div className="p-4 bg-white border border-rose-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">REJECTED</span>
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
            placeholder="Search applications by position or company..."
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
            { value: 'Submitted', label: 'Submitted' },
            { value: 'Shortlisted', label: 'Shortlisted' },
            { value: 'Selected', label: 'Selected' },
            { value: 'Rejected', label: 'Rejected' },
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
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {app.internshipTitle || 'Internship Position'}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>

                  <p className="text-xs font-semibold text-slate-600">
                    {app.companyName || 'Corporate Partner'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>Applied on: <strong className="text-slate-700 font-medium">{new Date(app.appliedAt).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Applications Found"
          description="You have not submitted any internship applications yet."
          action={
            <Link to="/student/opportunities">
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
