import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Button, Input, Select, Modal, Alert } from '@/components';
import { Search, CheckCircle2, XCircle, Eye, Award } from 'lucide-react';
import {
  fetchCompanyApplicantsBackend,
  updateApplicationStatusBackend,
  type StudentApplicationRecord,
} from '@/services/api/backendService';
import { supabase } from '@/services/supabase/supabaseClient';

export const ApplicantManagement: React.FC = () => {
  const [applicants, setApplicants] = useState<StudentApplicationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<StudentApplicationRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadApplicants = async () => {
    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error('[ApplicantManagement] Auth user error:', userError);
      setLoading(false);
      return;
    }

    const companyId = userData.user.id;
    console.log('[ApplicantManagement] Authenticated company ID:', companyId);

    const remoteApps = await fetchCompanyApplicantsBackend(companyId);
    console.log('[ApplicantManagement] Mapped applicants:', remoteApps);

    setApplicants(remoteApps);
    setLoading(false);
  };

  useEffect(() => {
    loadApplicants();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadApplicants();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setActionError(null);
    setLoadingId(appId);
    const res = await updateApplicationStatusBackend(appId, newStatus);
    setLoadingId(null);

    if (!res.success) {
      setActionError(res.error || 'Failed to update application status.');
      return;
    }

    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    if (selectedApp?.id === appId) {
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filteredApplicants = applicants.filter((a) => {
    const matchesSearch =
      (a.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.internshipTitle || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return matchesSearch;
  });

  console.log('[ApplicantManagement] Filtered applicants for render:', filteredApplicants);

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
        title="Applicant & Candidate Management"
        description="Review student applications, evaluate cover letters, and update candidate hiring status."
      />

      {actionError && (
        <Alert type="error" title="Action Error">
          {actionError}
        </Alert>
      )}

      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search candidate name or internship title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
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
          className="text-xs"
        />
      </div>

      {/* Applicants List Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Applied Position</th>
                <th className="p-3.5">Applied Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {(app.studentName || 'S').charAt(0)}
                    </div>
                    <span>{app.studentName || 'Student Candidate'}</span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-medium">{app.internshipTitle || 'Internship Position'}</td>
                  <td className="p-3.5 text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td className="p-3.5">{getStatusBadge(app.status)}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:bg-slate-100 text-[11px] p-1.5"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Cover Letter
                      </Button>

                      {app.status !== 'Shortlisted' && app.status !== 'Selected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loadingId === app.id}
                          className="text-indigo-600 hover:bg-indigo-50 text-[11px] p-1.5"
                          onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Shortlist
                        </Button>
                      )}

                      {app.status !== 'Selected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loadingId === app.id}
                          className="text-emerald-600 hover:bg-emerald-50 text-[11px] p-1.5"
                          onClick={() => handleUpdateStatus(app.id, 'Selected')}
                        >
                          <Award className="w-3.5 h-3.5 mr-1" /> Select
                        </Button>
                      )}

                      {app.status !== 'Rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loadingId === app.id}
                          className="text-rose-600 hover:bg-rose-50 text-[11px] p-1.5"
                          onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                    {loading ? 'Loading applications from database...' : 'No student applications found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: View Cover Letter */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Candidate Application: ${selectedApp.studentName}`}
        >
          <div className="space-y-4 text-xs p-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Position</span>
              <span className="font-bold text-slate-800 text-sm">{selectedApp.internshipTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cover Letter</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap mt-1">
                {selectedApp.coverLetter || 'No cover letter provided.'}
              </p>
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(selectedApp.id, 'Shortlisted')}>
                Shortlist Candidate
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(selectedApp.id, 'Selected')}>
                Select Candidate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
