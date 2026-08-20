import React, { useState } from 'react';
import { PageHeader, Card, Badge, Input } from '@/components';
import { Briefcase, Search, Building } from 'lucide-react';
import { mockCompanyInternships } from '@/features/faculty/mockData';

export const AdminInternships: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInternships = mockCompanyInternships.filter((i) =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3 font-semibold">Internship Title</th>
                <th className="p-3 font-semibold">Domain</th>
                <th className="p-3 font-semibold">Duration & Stipend</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInternships.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{item.title}</span>
                  </td>
                  <td className="p-3 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.domain}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">
                    {item.duration} â€¢ <span className="font-semibold text-emerald-600">{item.stipend || 'Unpaid'}</span>
                  </td>
                  <td className="p-3">
                    <Badge variant={item.status === 'published' ? 'emerald' : 'amber'}>{item.status}</Badge>
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