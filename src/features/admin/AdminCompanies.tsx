import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Input, Button, Modal } from '@/components';
import { Building2, Search, CheckCircle2, XCircle, Mail, Eye, ShieldCheck, Trash2, ShieldAlert } from 'lucide-react';
import {
  fetchCompanyApplicationsBackend,
  approveCompanyBackend,
  rejectCompanyBackend,
  sendCompanyInvitationBackend,
} from '@/services/api/backendService';

export interface CompanyApplication {
  id: string;
  companyName: string;
  industryDomain: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  invitationSent: boolean;
  internshipCount: number;
  mentorCount: number;
}

export const initialCompanyApplications: CompanyApplication[] = [
  {
    id: 'comp-app-1',
    companyName: 'TechCorp Solutions',
    industryDomain: 'Software & Cloud Services',
    contactPerson: 'Robert Chen',
    email: 'contact@techcorp.com',
    phone: '+91 98765 43210',
    website: 'https://techcorp.com',
    appliedDate: '2026-08-01',
    status: 'Approved',
    invitationSent: false,
    internshipCount: 3,
    mentorCount: 2,
  },
  {
    id: 'comp-app-2',
    companyName: 'DataCorp Analytics',
    industryDomain: 'Data Science & AI Solutions',
    contactPerson: 'Amanda Vance',
    email: 'recruitment@datacorp.io',
    phone: '+91 98765 12345',
    website: 'https://datacorp.io',
    appliedDate: '2026-08-05',
    status: 'Approved',
    invitationSent: false,
    internshipCount: 2,
    mentorCount: 1,
  },
  {
    id: 'comp-app-3',
    companyName: 'NextGen Robotics Labs',
    industryDomain: 'Automation & Hardware Engineering',
    contactPerson: 'Dr. Vikrum Patel',
    email: 'partnerships@nextgenlabs.org',
    phone: '+91 98123 45678',
    website: 'https://nextgenlabs.org',
    appliedDate: '2026-08-15',
    status: 'Pending',
    invitationSent: false,
    internshipCount: 0,
    mentorCount: 0,
  },
];

export const AdminCompanies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'APPROVED'>('APPLICATIONS');
  const [companyApps, setCompanyApps] = useState<CompanyApplication[]>(initialCompanyApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<CompanyApplication | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadBackendData = async () => {
      const backendCompanies = await fetchCompanyApplicationsBackend();
      if (backendCompanies && backendCompanies.length > 0) {
        setCompanyApps(backendCompanies);
      }
    };
    loadBackendData();
  }, []);

  const filteredApps = companyApps.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industryDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'APPLICATIONS') {
      return matchesSearch && (c.status === 'Pending' || c.status === 'Rejected');
    } else {
      return matchesSearch && c.status === 'Approved';
    }
  });

  const handleApproveCompany = async (comp: CompanyApplication) => {
    setActionError(null);
    setLoadingId(comp.id);
    const res = await approveCompanyBackend(comp.id, comp.companyName, comp.email);
    setLoadingId(null);

    if (!res.success) {
      setActionError(res.error || 'Failed to approve company.');
      return;
    }

    setCompanyApps((prev) =>
      prev.map((c) => (c.id === comp.id ? { ...c, status: 'Approved' } : c))
    );
  };

  const handleRejectCompany = async (comp: CompanyApplication) => {
    setActionError(null);
    setLoadingId(comp.id);
    const res = await rejectCompanyBackend(comp.id, 'Criteria not met', comp.companyName, comp.email);
    setLoadingId(null);

    if (!res.success) {
      setActionError(res.error || 'Failed to reject company.');
      return;
    }

    setCompanyApps((prev) =>
      prev.map((c) => (c.id === comp.id ? { ...c, status: 'Rejected' } : c))
    );
  };

  const handleSendInvite = async (comp: CompanyApplication) => {
    if (comp.status !== 'Approved') return;
    setActionError(null);
    setLoadingId(comp.id);

    const res = await sendCompanyInvitationBackend(comp.id, comp.companyName, comp.email);
    setLoadingId(null);

    if (!res.success) {
      setActionError(res.error || 'Failed to send company invitation email.');
      return;
    }

    setCompanyApps((prev) =>
      prev.map((c) => (c.id === comp.id ? { ...c, invitationSent: true } : c))
    );
  };

  const handleDeleteCompany = (id: string) => {
    setCompanyApps((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industry & Company Management"
        description="Review company registrations, approve corporate partnerships, and manage onboarding credentials."
      />

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
        <button
          className={`py-3 px-6 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'APPLICATIONS'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => {
            setActiveTab('APPLICATIONS');
            setActionError(null);
          }}
        >
          <Building2 className="w-4 h-4" />
          Company Applications
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">
            {companyApps.filter((c) => c.status === 'Pending').length} Pending
          </span>
        </button>

        <button
          className={`py-3 px-6 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => {
            setActiveTab('APPROVED');
            setActionError(null);
          }}
        >
          <ShieldCheck className="w-4 h-4" />
          Approved Partners & Onboarding
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700">
            {companyApps.filter((c) => c.status === 'Approved').length} Active
          </span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by company name, contact, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Applications Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Company Name</th>
                <th className="p-3.5">Domain</th>
                <th className="p-3.5">Contact Person</th>
                <th className="p-3.5">Official Email</th>
                <th className="p-3.5">Applied Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {comp.companyName.charAt(0)}
                    </div>
                    <div>
                      <div>{comp.companyName}</div>
                      <a href={comp.website} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 hover:underline">
                        {comp.website}
                      </a>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">{comp.industryDomain}</td>
                  <td className="p-3.5 text-slate-700 font-medium">{comp.contactPerson}</td>
                  <td className="p-3.5 text-slate-600">{comp.email}</td>
                  <td className="p-3.5 text-slate-500">{comp.appliedDate}</td>
                  <td className="p-3.5">
                    {comp.status === 'Approved' && <Badge variant="emerald">Approved</Badge>}
                    {comp.status === 'Pending' && <Badge variant="amber">Pending TPO Review</Badge>}
                    {comp.status === 'Rejected' && <Badge variant="rose">Rejected</Badge>}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:bg-slate-100 text-[11px] p-1.5"
                        onClick={() => setSelectedApp(comp)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                      </Button>

                      {activeTab === 'APPLICATIONS' && comp.status !== 'Approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:bg-emerald-50 text-[11px] p-1.5"
                          disabled={loadingId === comp.id}
                          onClick={() => handleApproveCompany(comp)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          {loadingId === comp.id ? 'Approving...' : 'Approve'}
                        </Button>
                      )}

                      {activeTab === 'APPLICATIONS' && comp.status !== 'Rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 text-[11px] p-1.5"
                          disabled={loadingId === comp.id}
                          onClick={() => handleRejectCompany(comp)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          {loadingId === comp.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      )}

                      {activeTab === 'APPROVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loadingId === comp.id || comp.invitationSent}
                          className={`${
                            comp.invitationSent
                              ? 'text-slate-400 bg-slate-50 cursor-default'
                              : 'text-indigo-600 hover:bg-indigo-50'
                          } text-[11px] p-1.5`}
                          onClick={() => !comp.invitationSent && handleSendInvite(comp)}
                        >
                          <Mail className="w-3.5 h-3.5 mr-1" />
                          {loadingId === comp.id
                            ? 'Sending...'
                            : comp.invitationSent
                            ? 'Invite Sent'
                            : 'Send Invite'}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:bg-rose-50 text-[11px] p-1.5"
                        onClick={() => handleDeleteCompany(comp.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No companies found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Company Details: ${selectedApp.companyName}`}
        >
          <div className="space-y-4 text-xs p-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Company Name</span>
                <span className="font-bold text-slate-800">{selectedApp.companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Industry Domain</span>
                <span className="font-semibold text-slate-700">{selectedApp.industryDomain}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact Person</span>
                <span className="font-semibold text-slate-700">{selectedApp.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Official Email</span>
                <span className="font-semibold text-indigo-600">{selectedApp.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
                <span className="font-semibold text-slate-700">{selectedApp.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Website</span>
                <a href={selectedApp.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                  {selectedApp.website}
                </a>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              {selectedApp.status !== 'Approved' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleApproveCompany(selectedApp);
                    setSelectedApp(null);
                  }}
                >
                  Approve Registration
                </Button>
              )}
              {selectedApp.status !== 'Rejected' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-rose-600"
                  onClick={() => {
                    handleRejectCompany(selectedApp);
                    setSelectedApp(null);
                  }}
                >
                  Reject Registration
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
