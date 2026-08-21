import React, { useState, useMemo } from 'react';
import { PageHeader, Card, EmptyState, Badge } from '@/components';
import { initialMockInternships, type Internship } from './data/mockInternships';
import { mockActiveInternshipData } from './data/mockActiveInternship';
import { InternshipCard } from './components/InternshipCard';
import { InternshipFilters, type InternshipFilterState } from './components/InternshipFilters';
import { InternshipSearch } from './components/InternshipSearch';
import { InternshipJourneySection } from './components/InternshipJourneySection';
import { InternshipJourneyEmptyState } from './components/InternshipJourneyEmptyState';
import { Search, Compass, Sparkles, Briefcase } from 'lucide-react';

const initialFilterState: InternshipFilterState = {
  searchQuery: '',
  location: 'all',
  workMode: 'all',
  internshipType: 'all',
  duration: 'all',
  stipendOnly: 'all',
};

export const MarketplacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'journey'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<InternshipFilterState>(initialFilterState);

  // Student has active enrollment status
  const hasActiveInternship = Boolean(mockActiveInternshipData);

  const filteredInternships = useMemo(() => {
    return initialMockInternships.filter((item: Internship) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCompany = item.companyName.toLowerCase().includes(q);
        const matchesSkills = item.skillsRequired.some((s: string) => s.toLowerCase().includes(q));

        if (!matchesTitle && !matchesCompany && !matchesSkills) return false;
      }

      if (filters.location !== 'all' && !item.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      if (filters.workMode !== 'all' && item.workMode !== filters.workMode) {
        return false;
      }

      if (filters.internshipType !== 'all' && item.type !== filters.internshipType) {
        return false;
      }

      if (filters.duration !== 'all' && item.duration !== filters.duration) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  const handleReset = () => {
    setSearchQuery('');
    setFilters(initialFilterState);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Student Internship Marketplace"
        description="Discover verified internship opportunities with live application deadlines or track your active internship journey."
        action={
          <Badge variant="indigo" className="px-3 py-1 font-semibold">
            {filteredInternships.length} Opportunities Available
          </Badge>
        }
      />

      {/* 2. Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'marketplace'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover Internships</span>
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'journey'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>My Internship Journey</span>
          {hasActiveInternship && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'marketplace' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Column */}
          <div className="lg:col-span-1 space-y-4">
            <InternshipSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <InternshipFilters
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleReset}
            />
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {filteredInternships.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredInternships.map((internship: Internship) => (
                  <InternshipCard key={internship.id} internship={internship} />
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={<Search className="w-6 h-6 text-slate-400" />}
                  title="No internships found"
                  description="No active internship opportunities match your current filter selections. Try resetting your search parameters."
                />
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div>
          {hasActiveInternship ? (
            <InternshipJourneySection onExploreClick={() => setActiveTab('marketplace')} />
          ) : (
            <InternshipJourneyEmptyState onExploreClick={() => setActiveTab('marketplace')} />
          )}
        </div>
      )}
    </div>
  );
};
