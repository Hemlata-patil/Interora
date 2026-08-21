import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Input, Select, Button, Modal } from '@/components';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  Eye,
  ShieldCheck,
  Trash2,
  ShieldAlert,
  Plus,
  Globe,
  Phone,
  UserCheck,
  Check
} from 'lucide-react';
import {
  fetchCompanyApplicationsBackend,
  approveCompanyBackend,
  rejectCompanyBackend,
  sendCompanyInvitationBackend,
  createCompanyDirectBackend,
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
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'APPROVED'>('APPROVED');
  const [companyApps, setCompanyApps] = useState<CompanyApplication[]>(initialCompanyApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<CompanyApplication | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Add Industry Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [newCompany, setNewCompany] = useState({
    companyName: '',
    industryDomain: 'Software & Cloud Services',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    status: 'Approved' as 'Approved' | 'Pending',
  });

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
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

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
    setSuccessMsg(`${comp.companyName} has been approved as an active partner.`);
    setTimeout(() => setSuccessMsg(null), 4000);
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
    setSuccessMsg(`Onboarding invitation sent successfully to ${comp.email}`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteCompany = (id: string) => {
    setCompanyApps((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!newCompany.companyName.trim() || !newCompany.email.trim() || !newCompany.contactPerson.trim()) {
      setActionError('Company Name, Official Email, and Contact Person are required.');
      return;
    }

    setIsSubmittingNew(true);

    const createdRecord: CompanyApplication = {
      id: `comp-direct-${Date.now()}`,
      companyName: newCompany.companyName.trim(),
      industryDomain: newCompany.industryDomain,
      contactPerson: newCompany.contactPerson.trim(),
      email: newCompany.email.trim().toLowerCase(),
      phone: newCompany.phone.trim() || '+91 98765 00000',
      website: newCompany.website.trim().startsWith('http')
        ? newCompany.website.trim()
        : newCompany.website.trim()
        ? `https://${newCompany.website.trim()}`
        : 'https://company.com',
      appliedDate: new Date().toISOString().slice(0, 10),
      status: newCompany.status,
      invitationSent: false,
      internshipCount: 0,
      mentorCount: 0,
    };

    try {
      await createCompanyDirectBackend(newCompany);
    } catch (err) {
      console.warn('Backend call notice:', err);
    }

    setCompanyApps((prev) => [createdRecord, ...prev]);
    initialCompanyApplications.unshift(createdRecord);

    setIsSubmittingNew(false);
    setIsAddModalOpen(false);
    setSuccessMsg(`Industry partner "${createdRecord.companyName}" added successfully!`);
    setTimeout(() => setSuccessMsg(null), 4500);

    if (createdRecord.status === 'Approved') {
      setActiveTab('APPROVED');
    } else {
      setActiveTab('APPLICATIONS');
    }

    // Reset form
    setNewCompany({
      companyName: '',
      industryDomain: 'Software & Cloud Services',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      status: 'Approved',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industry & Company Management"
        description="Directly register industry partners, manage corporate collaborations, approve registrations, and issue onboarding credentials."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setActionError(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Industry Partner</span>
          </Button>
        }
      />

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
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
          Approved Partners & Industries
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700">
            {companyApps.filter((c) => c.status === 'Approved').length} Active
          </span>
        </button>

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
          Pending Applications
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">
            {companyApps.filter((c) => c.status === 'Pending').length} Pending
          </span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by company name, domain, email, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setActionError(null);
            setIsAddModalOpen(true);
          }}
          className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add New Company
        </Button>
      </div>

      {/* Applications / Companies Table */}
      <Card className="p-0 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Company / Industry Name</th>
                <th className="p-3.5">Domain</th>
                <th className="p-3.5">Contact Person</th>
                <th className="p-3.5">Official Email</th>
                <th className="p-3.5">Registered Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {comp.companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{comp.companyName}</div>
                      {comp.website && (
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          {comp.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {comp.industryDomain}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-medium">{comp.contactPerson}</td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">{comp.email}</td>
                  <td className="p-3.5 text-slate-500">{comp.appliedDate}</td>
                  <td className="p-3.5">
                    {comp.status === 'Approved' && <Badge variant="emerald">Active Partner</Badge>}
                    {comp.status === 'Pending' && <Badge variant="amber">Pending Review</Badge>}
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
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
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
                        title="Delete Company"
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
                    No companies found matching your query.{' '}
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="text-indigo-600 font-bold hover:underline ml-1"
                    >
                      Add an industry partner now
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add New Industry / Company Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            if (!isSubmittingNew) setIsAddModalOpen(false);
          }}
          title="Add New Industry / Partner Company"
        >
          <form onSubmit={handleCreateCompany} className="space-y-4 text-xs p-1">
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-indigo-900 text-[11px] flex items-start gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                As an Administrator / TPO, adding an industry partner registers them directly onto the platform. Approved partners can immediately list internship opportunities and collaborate with faculty and students.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Company / Organization Name"
                required
                placeholder="e.g. Google India, TCS, Infosys"
                value={newCompany.companyName}
                onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })}
              />

              <Select
                label="Industry Domain"
                value={newCompany.industryDomain}
                onChange={(e) => setNewCompany({ ...newCompany, industryDomain: e.target.value })}
                options={[
                  { value: 'Software & Cloud Services', label: 'Software & Cloud Services' },
                  { value: 'Data Science & AI Solutions', label: 'Data Science & AI Solutions' },
                  { value: 'FinTech & Banking', label: 'FinTech & Banking' },
                  { value: 'Automation & Hardware Engineering', label: 'Automation & Hardware Engineering' },
                  { value: 'Cybersecurity & Defense', label: 'Cybersecurity & Defense' },
                  { value: 'Healthcare & Biotechnology', label: 'Healthcare & Biotechnology' },
                  { value: 'Electronics & Embedded Systems', label: 'Electronics & Embedded Systems' },
                  { value: 'E-Commerce & Digital Media', label: 'E-Commerce & Digital Media' },
                  { value: 'Manufacturing & Supply Chain', label: 'Manufacturing & Supply Chain' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Contact Person / Representative"
                required
                placeholder="e.g. Rahul Sharma (HR / Campus Lead)"
                value={newCompany.contactPerson}
                onChange={(e) => setNewCompany({ ...newCompany, contactPerson: e.target.value })}
              />

              <Input
                label="Official Email Address"
                type="email"
                required
                placeholder="careers@company.com"
                value={newCompany.email}
                onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Contact Phone"
                placeholder="+91 98765 43210"
                value={newCompany.phone}
                onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
              />

              <Input
                label="Company Website"
                placeholder="https://company.com"
                value={newCompany.website}
                onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
              />
            </div>

            <Select
              label="Initial Partnership Status"
              value={newCompany.status}
              onChange={(e) => setNewCompany({ ...newCompany, status: e.target.value as 'Approved' | 'Pending' })}
              options={[
                { value: 'Approved', label: 'Approved (Active Partner - Ready for Postings)' },
                { value: 'Pending', label: 'Pending (Requires Subsequent TPO Review)' },
              ]}
            />

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmittingNew}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingNew}
                className="flex items-center gap-1.5"
              >
                {isSubmittingNew ? 'Saving Partner...' : 'Add Industry Partner'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

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
                <span className="font-bold text-slate-800 text-sm">{selectedApp.companyName}</span>
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
