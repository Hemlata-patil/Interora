import React, { useState, useMemo } from 'react';
import { PageHeader, EmptyState } from '@/components';
import { InternshipCard } from './components/InternshipCard';
import { InternshipSearch } from './components/InternshipSearch';
import { InternshipFilters, type InternshipFilterState } from './components/InternshipFilters';
import { mockInternships } from './data/mockInternships';
import { Compass } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<InternshipFilterState>({
    location: 'all',
    workMode: 'all',
    internshipType: 'all',
    duration: 'all',
    stipendOnly: 'all',
  });

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
    return mockInternships.filter((item) => {
      // 1. Text Search (Title, Company, Skills)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCompany = item.companyName.toLowerCase().includes(q);
        const matchesSkills = item.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesSkills) {
          return false;
        }
      }

      // 2. Location Filter
      if (filters.location !== 'all') {
        const locLower = filters.location.toLowerCase();
        const itemLocLower = item.location.toLowerCase();
        if (!itemLocLower.includes(locLower)) {
          return false;
        }
      }

      // 3. Work Mode Filter
      if (filters.workMode !== 'all' && item.workMode !== filters.workMode) {
        return false;
      }

      // 4. Internship Type Filter
      if (filters.internshipType !== 'all' && item.internshipType !== filters.internshipType) {
        return false;
      }

      // 5. Duration Filter
      if (filters.duration !== 'all' && item.duration !== filters.duration) {
        return false;
      }

      // 6. Stipend Filter
      if (filters.stipendOnly === 'paid' && item.stipend.toLowerCase().includes('unpaid')) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    filters.location !== 'all' ||
    filters.workMode !== 'all' ||
    filters.internshipType !== 'all' ||
    filters.duration !== 'all' ||
    filters.stipendOnly !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Your Internship"
        description="Discover verified internship opportunities, filter by location, work mode, or skills, and apply directly."
      />

      {/* Search & Filters Controls */}
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
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-indigo-600 hover:text-indigo-700 font-medium underline cursor-pointer"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* Internship Listings Grid */}
      {filteredInternships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInternships.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Internships Found"
          description="No internship listings match your current search query or filter settings. Try clearing active filters."
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