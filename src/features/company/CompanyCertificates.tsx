import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Button, Badge, StatCard, Input } from '@/components';
import { 
  Award, CheckCircle2, Search, Filter, FileText, Download, X
} from 'lucide-react';
import { 
  mockFacultyStudents,
  mockCompanyApplications,
  mockCompanyEvaluations,
  mockCompanyPPOs,
  mockCompanyCertificates,
  setMockCompanyCertificates
} from '../faculty/mockData';
import type { 
  CompanyCertificateData,
  CertificateStatus
} from '../faculty/mockData';
import { APP_INFO } from '@/constants';

export const CompanyCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<CompanyCertificateData[]>(mockCompanyCertificates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // UI State: 'LIST', 'PREVIEW'
  const [viewState, setViewState] = useState<'LIST' | 'PREVIEW'>('LIST');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isConfirmingIssue, setIsConfirmingIssue] = useState(false);

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
        derivedStatus
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
      companyId: 'company-1', // Mock
      status: 'Generated',
      certificateId: generateUniqueId()
    };

    const updatedCerts = [...certificates, newCert];
    setCertificates(updatedCerts);
    setMockCompanyCertificates(updatedCerts);
  };

  const handleIssue = () => {
    const data = certList.find(i => i.student.id === selectedStudentId);
    if (!data || !data.existingCert) return;

    const updatedCert = { 
      ...data.existingCert, 
      status: 'Issued' as const,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const updatedCerts = certificates.map(c => c.id === updatedCert.id ? updatedCert : c);
    setCertificates(updatedCerts);
    setMockCompanyCertificates(updatedCerts);
    setIsConfirmingIssue(false);
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
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleIssue}>Confirm Issue</Button>
              </div>
            </div>
          </Card>
        )}

        {/* The Visual Certificate Rendering */}
        <div className="relative w-full max-w-4xl mx-auto bg-white border border-slate-300 shadow-xl rounded-sm p-12 overflow-hidden my-8 min-h-[600px] flex flex-col items-center text-center">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-4 bg-indigo-900" />
          <div className="absolute top-4 left-0 w-full h-1 bg-amber-500" />
          <div className="absolute bottom-4 left-0 w-full h-1 bg-amber-500" />
          <div className="absolute bottom-0 left-0 w-full h-4 bg-indigo-900" />
          
          {/* Watermark Logo Mock */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Award className="w-96 h-96 text-indigo-900" />
          </div>

          <div className="z-10 w-full max-w-3xl flex flex-col items-center mt-8">
            <h1 className="text-4xl font-serif text-slate-800 uppercase tracking-widest mb-10">Internship Completion Certificate</h1>
            
            <p className="text-lg text-slate-600 italic mb-4">This certificate is proudly presented to</p>
            
            <h2 className="text-5xl font-serif font-bold text-indigo-900 mb-8 border-b-2 border-slate-200 pb-2 w-full max-w-lg text-center">
              {data.student.studentName}
            </h2>
            
            <p className="text-lg text-slate-600 italic mb-4">for successfully completing the internship program as</p>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{data.student.role}</h3>
            <p className="text-lg text-slate-600 mb-12">at <span className="font-bold">{data.student.company}</span></p>

            <p className="text-md text-slate-600 mb-16">
              Internship Period: <span className="font-semibold">{data.student.startDate}</span> to <span className="font-semibold">{data.student.endDate}</span>
            </p>

            <div className="flex justify-between w-full mt-auto pt-10 px-8">
              <div className="text-left flex flex-col">
                {data.existingCert?.certificateId ? (
                  <>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Certificate ID</span>
                    <span className="font-mono text-sm font-semibold text-slate-700">{data.existingCert.certificateId}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Certificate ID</span>
                    <span className="font-mono text-sm font-semibold text-slate-300 italic">Pending Generation</span>
                  </>
                )}
                <div className="mt-4">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Issue Date</span>
                  <span className="text-sm font-semibold text-slate-700">{data.existingCert?.issueDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              
              <div className="text-center flex flex-col items-center">
                <div className="w-48 border-b border-slate-800 mb-2 h-12 flex items-end justify-center">
                  <span className="font-handwriting text-2xl text-slate-800 -mb-1 opacity-80">Company Rep</span>
                </div>
                <span className="text-sm font-bold text-slate-800">Authorized Signatory</span>
                <span className="text-xs text-slate-500">{data.student.company}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Completion Summary" className="shadow-sm">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Internship Status</span>
                  <span className="text-sm font-semibold text-slate-900">{data.student.internshipStatus}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Final Evaluation</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-semibold text-indigo-700">{data.finalEval?.overallRating.toFixed(1)} / 5</span>
                    <Badge variant="emerald" className="px-1.5 py-0 text-[10px]">Verified</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card title="PPO Reference" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">PPO Status</span>
                {data.ppo ? (
                  <Badge variant={data.ppo.status === 'Offered' || data.ppo.status === 'Accepted' ? 'indigo' : 'neutral'}>
                    {data.ppo.status}
                  </Badge>
                ) : (
                  <span className="text-sm text-slate-500 italic">No PPO Decision Made</span>
                )}
              </div>
              <p className="text-xs text-slate-400">Note: PPO status is informational and does not affect certificate eligibility.</p>
            </div>
          </Card>
        </div>

      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Certificates"
        description="Generate and manage internship completion certificates for eligible interns."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Eligible" value={totalCount.toString()} icon={Award} />
        <StatCard title="Pending Generation" value={eligibleCount.toString()} icon={FileText} />
        <StatCard title="Generated" value={generatedCount.toString()} icon={FileText} />
        <StatCard title="Issued" value={issuedCount.toString()} icon={CheckCircle2} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              className="pl-9 bg-white" 
              placeholder="Search by intern name or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Eligible">Eligible</option>
              <option value="Generated">Generated</option>
              <option value="Issued">Issued</option>
            </select>
          </div>
        </div>

        {filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Student</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Internship / Role</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Internship Period</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">PPO Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Certificate Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map(data => (
                  <tr key={data.student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{data.student.studentName}</div>
                      <div className="text-xs text-slate-500">{data.student.studentId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{data.student.role}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700">{data.student.startDate}</div>
                      <div className="text-xs text-slate-400">to {data.student.endDate}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {data.ppo?.status || 'No Offer'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(data.derivedStatus)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {data.derivedStatus === 'Eligible' ? (
                        <Button variant="primary" size="sm" onClick={() => handlePreview(data.student.id)}>
                          Generate
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handlePreview(data.student.id)}>
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No interns eligible for certificates</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              Certificates become available after an intern successfully completes their internship and their final evaluation is verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
