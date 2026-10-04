import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Input, Button } from '@/components';
import { Award, Search, ExternalLink, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { fetchCertificatesBackend, type AdminCertificateRecord } from '@/services/api/backendService';
import { Link } from 'react-router-dom';

export const AdminCertificates: React.FC = () => {
  const [certs, setCerts] = useState<AdminCertificateRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCertificatesBackend();
      setCerts(data);
    } catch (err: any) {
      console.error('[AdminCertificates] Error loading certificates:', err);
      setError('Failed to load certificates from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const filteredCerts = certs.filter(
    (c) =>
      c.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Verification ID', 'Student Name', 'Internship Role', 'Issue Date', 'Status'];
    const rows = filteredCerts.map((c) => [
      c.certificateNumber || c.id,
      `"${c.recipientName}"`,
      `"${c.internshipTitle}"`,
      c.issuedDate,
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
              placeholder="Search by student name, certificate ID, or role..."
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

        {error ? (
          <div className="py-12 text-center text-rose-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-slate-400">
            <Award className="w-8 h-8 mx-auto mb-2 animate-pulse text-indigo-400" />
            <p>Loading credentials directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3 font-semibold">Verification ID</th>
                  <th className="p-3 font-semibold">Student Recipient</th>
                  <th className="p-3 font-semibold">Internship Role</th>
                  <th className="p-3 font-semibold">Issue Date</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Verification Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCerts.length > 0 ? (
                  filteredCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-800 flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{cert.certificateNumber || cert.id.slice(0, 8)}</span>
                      </td>
                      <td className="p-3 text-slate-700 font-semibold">{cert.recipientName}</td>
                      <td className="p-3 text-slate-600">{cert.internshipTitle}</td>
                      <td className="p-3 text-slate-500">{cert.issuedDate}</td>
                      <td className="p-3">
                        <Badge variant={cert.status.toLowerCase() === 'active' || cert.status.toLowerCase() === 'issued' ? 'emerald' : 'amber'}>
                          <ShieldCheck className="w-3 h-3 mr-1 inline" /> {cert.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Link to={`/verify/${cert.qrToken || cert.certificateNumber || cert.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <span>Verify Public URL</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No certificates or completion credentials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

