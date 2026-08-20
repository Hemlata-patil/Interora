import React, { useState } from 'react';
import { PageHeader, Card, Badge, Input, Button, Modal } from '@/components';
import { Building2, Search, CheckCircle2, XCircle, Mail, Send, Eye, ShieldCheck, Trash2 } from 'lucide-react';
import { mockCompanyProfile } from '@/features/faculty/mockData';

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
    invitationSent: true,
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
    invitationSent: true,
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
  {
    id: 'comp-app-4',
    companyName: 'CyberShield Systems',
    industryDomain: 'Information Security & Auditing',
    contactPerson: 'Sarah Jenkins',
    email: 'hr@cybershield.net',
    phone: '+91 97890 12345',
    website: 'https://cybershield.net',
    appliedDate: '2026-08-18',
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

  const handleApproveCompany = (id: string) => {
    setCompanyApps((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Approved' } : c))
    );
  };

  const handleRejectCompany = (id: string) => {
    setCompanyApps((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Rejected' } : c))
    );
  };

  const handleDeleteCompany = (id: string) => {
    setCompanyApps((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSendInvite = (id: string) => {
    setCompanyApps((prev) =>
      prev.map((c) => (c.id === id ? { ...c, invitationSent: true } : c))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industry & Company Management"
        description="Review corporate registration applications, manage approved industry partners, and send onboarding credentials."
      />

      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          className={`pb-3 transition-all cursor-pointer ${
            activeTab === 'APPLICATIONS'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('APPLICATIONS')}
        >
          Company Applications ({companyApps.filter((c) => c.status !== 'Approved').length})
        </button>
        <button
          className={`pb-3 transition-all cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('APPROVED')}
        >
          Approved Companies & Credentials ({companyApps.filter((c) => c.status === 'Approved').length})
        </button>
      </div>

      <Card className="p-6 bg-white border border-slate-200">
        <div className="mb-6 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="Search company name, domain, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3 font-semibold">Company Name</th>
                <th className="p-3 font-semibold">Industry Domain</th>
                <th className="p-3 font-semibold">Contact Person</th>
                <th className="p-3 font-semibold">Official Email</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">TPO Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{comp.companyName}</span>
                  </td>
                  <td className="p-3 text-slate-600">{comp.industryDomain}</td>
                  <td className="p-3 text-slate-700 font-medium">{comp.contactPerson}</td>
                  <td className="p-3 text-slate-500">{comp.email}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        comp.status === 'Approved'
                          ? 'emerald'
                          : comp.status === 'Rejected'
                          ? 'rose'
                          : 'amber'
                      }
                    >
                      {comp.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
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
                          onClick={() => handleApproveCompany(comp.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}

                      {activeTab === 'APPLICATIONS' && comp.status !== 'Rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 text-[11px] p-1.5"
                          onClick={() => handleRejectCompany(comp.id)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      )}

                      {activeTab === 'APPROVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${
                            comp.invitationSent
                              ? 'text-slate-400 bg-slate-50 cursor-default'
                              : 'text-indigo-600 hover:bg-indigo-50'
                          } text-[11px] p-1.5`}
                          onClick={() => !comp.invitationSent && handleSendInvite(comp.id)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          {comp.invitationSent ? 'Invite Sent' : 'Send Invite'}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5"
                        onClick={() => handleDeleteCompany(comp.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Company Details — ${selectedApp.companyName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Industry Domain:</span>
                <span className="font-semibold text-slate-800">{selectedApp.industryDomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Person:</span>
                <span className="font-semibold text-slate-800">{selectedApp.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Official Email:</span>
                <span className="font-semibold text-slate-800">{selectedApp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-800">{selectedApp.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Website:</span>
                <a href={selectedApp.website} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">
                  {selectedApp.website}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Application Date:</span>
                <span className="font-semibold text-slate-800">{selectedApp.appliedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Approval Status:</span>
                <Badge variant={selectedApp.status === 'Approved' ? 'emerald' : 'amber'}>{selectedApp.status}</Badge>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Account Provisioning Workflow
              </p>
              <p className="mt-1 text-[11px]">
                Upon TPO Approval, an encrypted invitation token is dispatched to <strong>{selectedApp.email}</strong> allowing the company to configure secure portal credentials.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
