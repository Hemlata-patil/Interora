import React, { useState } from 'react';
import { PageHeader, Card, Badge, Input, Button } from '@/components';
import { Award, Search, ExternalLink, ShieldCheck, Download } from 'lucide-react';
import { mockCompanyCertificates, mockFacultyStudents } from '@/features/faculty/mockData';
import { Link } from 'react-router-dom';

export const AdminCertificates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const certRows = mockCompanyCertificates.map((c) => {
    const student = mockFacultyStudents.find((s) => s.id === c.internId);
    return {
      id: c.id,
      certificateId: c.certificateId || `CERT-${c.id}`,
      studentName: student?.studentName || 'Sarah Jenkins',
      department: student?.department || 'CSE',
      companyName: 'TechCorp Solutions',
      issueDate: c.issueDate || '2026-08-01',
      status: c.status,
    };
  });

  const filteredCerts = certRows.filter(
    (c) =>
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Verification ID', 'Student Name', 'Department', 'Issuing Company', 'Issue Date', 'Status'];
    const rows = filteredCerts.map((c) => [
      c.certificateId,
      `"${c.studentName}"`,
      c.department,
      `"${c.companyName}"`,
      c.issueDate,
      c.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Interora_Certificates_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates & Credentials Oversight"
        description="Verify system-generated internship completion credentials and QR verification records."
      />

      <Card className="p-6 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search by student name, certificate ID, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1.5 text-xs">
            <Download className="w-4 h-4 text-indigo-600" />
            Export CSV / Excel
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3 font-semibold">Verification ID</th>
                <th className="p-3 font-semibold">Student Recipient</th>
                <th className="p-3 font-semibold">Issuing Company</th>
                <th className="p-3 font-semibold">Issue Date</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Verification Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{cert.certificateId}</span>
                  </td>
                  <td className="p-3 text-slate-700 font-semibold">{cert.studentName}</td>
                  <td className="p-3 text-slate-600">{cert.companyName}</td>
                  <td className="p-3 text-slate-500">{cert.issueDate}</td>
                  <td className="p-3">
                    <Badge variant={cert.status === 'Issued' ? 'emerald' : 'amber'}>
                      <ShieldCheck className="w-3 h-3 mr-1 inline" /> {cert.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/verify/${cert.certificateId}`} target="_blank">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <span>Verify Public URL</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
