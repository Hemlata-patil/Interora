import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Input } from '@/components';
import { Briefcase, Search, Building, AlertCircle } from 'lucide-react';
import { fetchPostingsBackend } from '@/services/api/backendService';

export const AdminInternships: React.FC = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPostingsBackend();
      setInternships(data);
    } catch (err: any) {
      console.error('[AdminInternships] Error loading postings:', err);
      setError('Failed to load internship postings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const filteredInternships = internships.filter((i) => {
    const title = (i.title || '').toLowerCase();
    const domain = (i.industryDomain || i.companyName || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return title.includes(query) || domain.includes(query);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internship Postings Oversight"
        description="System-wide administrative directory of approved company internships and recruitment drives."
      />

      <Card className="p-6 bg-white border border-slate-200">
        <div className="mb-6 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="Search by role title or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {error ? (
          <div className="py-12 text-center text-rose-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-slate-400">
            <Briefcase className="w-8 h-8 mx-auto mb-2 animate-pulse text-indigo-400" />
            <p>Loading internship postings directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3 font-semibold">Internship Title</th>
                  <th className="p-3 font-semibold">Domain / Company</th>
                  <th className="p-3 font-semibold">Duration & Stipend</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInternships.length > 0 ? (
                  filteredInternships.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{item.title}</span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.industryDomain || item.companyName || 'General Domain'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.duration || 'Flexible'} • <span className="font-semibold text-emerald-600">{item.stipend || 'Unpaid'}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={item.status === 'open' || item.status === 'published' ? 'emerald' : 'amber'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No internship postings found.
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