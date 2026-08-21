import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader, EmptyState, Alert } from '@/components';
import { InternshipCard } from './components/InternshipCard';
import { InternshipSearch } from './components/InternshipSearch';
import { InternshipFilters, type InternshipFilterState } from './components/InternshipFilters';
import { Compass } from 'lucide-react';
import {
  fetchInternshipPostingsBackend,
  createStudentApplicationBackend,
  fetchStudentApplicationsBackend,
  type InternshipPostingRecord,
} from '@/services/api/backendService';

export const MarketplacePage: React.FC = () => {
  const [internships, setInternships] = useState<InternshipPostingRecord[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filters, setFilters] = useState<InternshipFilterState>({
    location: 'all',
    workMode: 'all',
    internshipType: 'all',
    duration: 'all',
    stipendOnly: 'all',
  });

  const loadData = async () => {
    const remoteListings = await fetchInternshipPostingsBackend();
    setInternships(remoteListings);

    const studentApps = await fetchStudentApplicationsBackend();
    const appliedSet = new Set(studentApps.map((a) => a.internshipId));
    setAppliedIds(appliedSet);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (internshipId: string, coverLetter?: string) => {
    setAlertMsg(null);
    const res = await createStudentApplicationBackend(internshipId, coverLetter);
    if (!res.success) {
      setAlertMsg({ type: 'error', text: res.error || 'Failed to submit application.' });
      return;
    }
    setAlertMsg({ type: 'success', text: 'Application submitted successfully!' });
    setAppliedIds((prev) => new Set(prev).add(internshipId));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      location: 'all',
      workMode: 'all',
      internshipType: 'all',
      duration: 'all',
      stipendOnly: 'all',
    });
  };

  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCompany = (item.companyName || '').toLowerCase().includes(q);
        const matchesSkills = (item.skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesSkills) return false;
      }
      return true;
    });
  }, [searchQuery, filters, internships]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Your Internship"
        description="Discover verified internship opportunities, filter by location, work mode, or skills, and apply directly."
      />

      {alertMsg && (
        <Alert type={alertMsg.type} title={alertMsg.type === 'success' ? 'Success' : 'Notice'}>
          {alertMsg.text}
        </Alert>
      )}

      {/* Controls Bar */}
      <div className="space-y-4">
        <InternshipSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <InternshipFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span>Showing <strong className="text-slate-800 font-semibold">{filteredInternships.length}</strong> available opportunities</span>
      </div>

      {/* Internship Grid */}
      {filteredInternships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInternships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={{
                id: internship.id,
                title: internship.title,
                companyName: internship.companyName || 'Company Partner',
                location: internship.location,
                workMode: 'Remote',
                internshipType: (internship.internshipType === 'Part-time' ? 'Part-time' : 'Full-time'),
                duration: internship.duration,
                stipend: internship.stipend,
                postedDate: new Date(internship.createdAt).toISOString().slice(0, 10),
                deadline: internship.applicationDeadline ? internship.applicationDeadline.slice(0, 10) : 'Open',
                skills: internship.skills || [],
                description: internship.description,
                responsibilities: [internship.description],
                requirements: [internship.eligibility || 'Standard Eligibility'],
                learningOutcomes: ['Practical Industry Knowledge'],
                status: 'Open',
              }}
              hasApplied={appliedIds.has(internship.id)}
              onApply={() => handleApply(internship.id, 'Interested in this role')}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Internships Found"
          description="No live internship postings match your search query."
          action={
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Reset Search & Filters
            </button>
          }
        />
      )}
    </div>
  );
};
