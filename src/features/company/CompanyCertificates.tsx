import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader, Card, Button, Badge, StatCard, Input } from '@/components';
import { 
  Award, CheckCircle2, Search, Filter, FileText, Download, X, Loader2
} from 'lucide-react';
import { 
  fetchCompanyCertificatesBackend,
  issueCompanyCertificateBackend,
  fetchCompanyInternsBackend
} from '@/services/api/backendService';
import { 
  mockFacultyStudents,
  mockCompanyApplications,
  mockCompanyEvaluations,
  mockCompanyPPOs,
  mockCompanyCertificates
} from '../faculty/mockData';
import type { 
  CompanyCertificateData,
  CertificateStatus
} from '../faculty/mockData';
import { APP_INFO } from '@/constants';

export const CompanyCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<CompanyCertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // UI State: 'LIST', 'PREVIEW'
  const [viewState, setViewState] = useState<'LIST' | 'PREVIEW'>('LIST');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isConfirmingIssue, setIsConfirmingIssue] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [backendCerts, interns] = await Promise.all([
        fetchCompanyCertificatesBackend(),
        fetchCompanyInternsBackend(),
      ]);

      if (backendCerts && backendCerts.length > 0) {
        const mapped: CompanyCertificateData[] = backendCerts.map((c: any) => ({
          id: c.id,
          internId: c.assignment?.studentId || c.studentId || '',
          internshipId: c.assignment?.internshipId || '',
          companyId: c.assignment?.companyId || '',
          applicationId: c.assignment?.applicationId,
          status: c.status === 'active' ? 'Issued' : 'Generated',
          certificateId: c.certificateNumber,
          issueDate: c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
        }));
        setCertificates(mapped);
      } else {
        setCertificates(mockCompanyCertificates);
      }
    } catch (err: any) {
      console.error('[CompanyCertificates] Error loading certificates:', err);
      setError('Failed to load certificates from backend.');
      setCertificates(mockCompanyCertificates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compile full certificate eligibility list
  const certList = useMemo(() => {
    return mockFacultyStudents.map(student => {
      // Find internship ID from accepted applications
      const application = mockCompanyApplications?.find(a => a.studentId === student.id && a.applicationStatus === 'Selected');
      const internshipId = application?.internshipId || 'int-1';
      
      const finalEval = mockCompanyEvaluations.find(e => e.internId === student.id && e.evaluationType === 'Final Evaluation');
      const ppo = mockCompanyPPOs.find(p => p.internId === student.id);
      const existingCert = certificates.find(c => c.internId === student.id);

      const isInternshipCompleted = student.internshipStatus === 'Completed' || finalEval?.status === 'Verified';
      const isEvalCompleted = finalEval && (finalEval.status === 'Verified' || finalEval.crossVerified);

      let derivedStatus: CertificateStatus | 'Not Eligible' = 'Not Eligible';
      
      if (existingCert) {
        derivedStatus = existingCert.status;
      } else if (isInternshipCompleted && isEvalCompleted) {
        derivedStatus = 'Eligible';
      }

      return {
        student,
        internshipId,
        finalEval,
        ppo,
        existingCert,
        derivedStatus,
        assignmentId: existingCert?.applicationId || 'mock-assign-id'
      };
    }).filter(item => item.derivedStatus !== 'Not Eligible');
  }, [certificates]);

  // Apply Search and Filters
  const filteredList = useMemo(() => {
    return certList.filter(item => {
      const matchesSearch = item.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.student.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.derivedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [certList, searchTerm, statusFilter]);

  // Metrics
  const eligibleCount = certList.filter(i => i.derivedStatus === 'Eligible').length;
  const generatedCount = certList.filter(i => i.derivedStatus === 'Generated').length;
  const issuedCount = certList.filter(i => i.derivedStatus === 'Issued').length;
  const totalCount = certList.length;

  const handlePreview = (internId: string) => {
    setSelectedStudentId(internId);
    setViewState('PREVIEW');
    setIsConfirmingIssue(false);
  };

  const generateUniqueId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `INT-CERT-${year}-${randomNum}`;
  };

  const handleGenerate = () => {
    const data = certList.find(i => i.student.id === selectedStudentId);
    if (!data) return;

    const newCert: CompanyCertificateData = {
      id: `cert-${Date.now()}`,
      internId: data.student.id,
      internshipId: data.internshipId,
      companyId: 'company-1',
      status: 'Generated',
      certificateId: generateUniqueId()
    };

    const updatedCerts = [...certificates, newCert];
    setCertificates(updatedCerts);
  };

  const handleIssue = async () => {
    const data = certList.find(i => i.student.id === selectedStudentId);
    if (!data || !data.existingCert) return;

    setActionLoading(true);
    try {
      const updatedCert: CompanyCertificateData = { 
        ...data.existingCert, 
        status: 'Issued' as const,
        issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };

      const updatedCerts = certificates.map(c => c.id === updatedCert.id ? updatedCert : c);
      setCertificates(updatedCerts);
      setIsConfirmingIssue(false);
    } catch (err: any) {
      console.error('[handleIssue] Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Eligible': return <Badge variant="neutral">Eligible</Badge>;
      case 'Generated': return <Badge variant="amber">Generated</Badge>;
      case 'Issued': return <Badge variant="emerald"><CheckCircle2 className="w-3 h-3 mr-1" /> Issued</Badge>;
      default: return null;
    }
  };

  if (viewState === 'PREVIEW' && selectedStudentId) {
    const data = certList.find(i => i.student.id === selectedStudentId);
    if (!data) return null;

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Certificate Preview</h1>
              <p className="text-sm text-slate-500">{data.student.studentName} • {data.student.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setViewState('LIST')}>Close</Button>
            
            {data.derivedStatus === 'Eligible' && (
              <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Generate Certificate
              </Button>
            )}

            {data.derivedStatus === 'Generated' && (
              <Button onClick={() => setIsConfirmingIssue(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Issue Certificate
              </Button>
            )}

            {(data.derivedStatus === 'Generated' || data.derivedStatus === 'Issued') && (
              <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            )}
          </div>
        </div>

        {isConfirmingIssue && (
          <Card className="bg-emerald-50 border-emerald-200 shadow-sm animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-emerald-900 text-lg">Confirm Issuance</h3>
                <p className="text-emerald-800 text-sm mt-1">Once issued, the certificate will be permanently recorded and visible to the student.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="bg-white" onClick={() => setIsConfirmingIssue(false)}>Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleIssue} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Issue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Certificate Mock Sheet */}
        <div className="bg-white border-8 border-indigo-900/10 p-12 rounded-xl shadow-xl relative overflow-hidden flex flex-col items-center text-center max-w-4xl mx-auto my-6 aspect-[1.414/1] justify-between">
          <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-indigo-700 m-4 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-indigo-700 m-4 pointer-events-none" />
          
          <div className="space-y-4 pt-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-700 font-bold border border-indigo-200">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-serif font-black tracking-widest text-slate-900 uppercase">Certificate of Completion</h2>
            <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">This is proudly presented to</p>
          </div>

          <div className="my-8">
            <h3 className="text-4xl font-serif font-bold text-indigo-950 underline decoration-indigo-200 underline-offset-8">
              {data.student.studentName}
            </h3>
            <p className="text-sm text-slate-600 max-w-lg mx-auto mt-4 leading-relaxed">
              for successfully completing the full duration of the <span className="font-semibold text-slate-900">{data.student.role}</span> internship program with demonstrated excellence and professional integrity.
            </p>
          </div>

          <div className="w-full flex items-end justify-between px-12 pb-6 border-t border-slate-100 pt-8">
            <div className="text-left">
              <div className="font-serif font-bold text-slate-900">TechCorp Industry Lead</div>
              <div className="text-xs text-slate-500">Authorized Signatory</div>
              <div className="text-xs text-slate-400 mt-1">Issued: {data.existingCert?.issueDate || 'Pending'}</div>
            </div>
            <div className="text-center font-mono text-xs text-slate-400 border border-dashed border-slate-300 p-2 rounded">
              ID: {data.existingCert?.certificateId || 'PENDING-GEN'}
            </div>
            <div className="text-right">
              <div className="font-serif font-bold text-slate-900">{APP_INFO.name} Platform</div>
              <div className="text-xs text-slate-500">Verified Credential</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Certificates"
        description="Issue verified completion certificates to interns who successfully finished their programs."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Eligible Interns" value={eligibleCount.toString()} icon={Award} />
        <StatCard title="Generated" value={generatedCount.toString()} icon={FileText} />
        <StatCard title="Issued & Recorded" value={issuedCount.toString()} icon={CheckCircle2} />
        <StatCard title="Total Candidates" value={totalCount.toString()} icon={Award} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by intern name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-700 mr-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Eligible">Eligible</option>
            <option value="Generated">Generated</option>
            <option value="Issued">Issued</option>
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading certificates...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Intern Name</th>
                  <th className="py-3 px-4">Program Role</th>
                  <th className="py-3 px-4">Final Eval Rating</th>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length > 0 ? (
                  filteredList.map(item => (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {item.student.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.student.role}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.finalEval ? (
                          <span className="font-semibold text-emerald-700">★ {item.finalEval.overallRating}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">Awaiting</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {item.existingCert?.certificateId || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {item.existingCert?.issueDate || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.derivedStatus)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePreview(item.student.id)}
                        >
                          {item.derivedStatus === 'Eligible' ? 'Review & Generate' : 'View Preview'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No interns match the certificate criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
