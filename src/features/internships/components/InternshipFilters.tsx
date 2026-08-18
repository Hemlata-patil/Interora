import React from 'react';
import { Select, Button } from '@/components';

export interface InternshipFilterState {
  searchQuery?: string;
  location: string;
  workMode: string;
  internshipType: string;
  duration: string;
  stipendOnly: string;
}

export interface InternshipFiltersProps {
  filters: InternshipFilterState;
  onFilterChange: (filters: InternshipFilterState) => void;
  onReset: () => void;
}

export const InternshipFilters: React.FC<InternshipFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Location Filter */}
        <Select
          label="Location"
          value={filters.location}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          options={[
            { value: 'all', label: 'All Locations' },
            { value: 'Bangalore', label: 'Bangalore' },
            { value: 'Pune', label: 'Pune' },
            { value: 'Hyderabad', label: 'Hyderabad' },
            { value: 'Mumbai', label: 'Mumbai' },
            { value: 'Remote', label: 'Remote' },
          ]}
        />

        {/* 2. Work Mode Filter */}
        <Select
          label="Work Mode"
          value={filters.workMode}
          onChange={(e) => onFilterChange({ ...filters, workMode: e.target.value })}
          options={[
            { value: 'all', label: 'All Work Modes' },
            { value: 'Remote', label: 'Remote Only' },
            { value: 'Hybrid', label: 'Hybrid' },
            { value: 'On-site', label: 'On-site' },
          ]}
        />

        {/* 3. Internship Type Filter */}
        <Select
          label="Internship Type"
          value={filters.internshipType}
          onChange={(e) => onFilterChange({ ...filters, internshipType: e.target.value })}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'Full-time', label: 'Full-time' },
            { value: 'Part-time', label: 'Part-time' },
          ]}
        />

        {/* 4. Duration Filter */}
        <Select
          label="Duration"
          value={filters.duration}
          onChange={(e) => onFilterChange({ ...filters, duration: e.target.value })}
          options={[
            { value: 'all', label: 'All Durations' },
            { value: '3 Months', label: '3 Months' },
            { value: '4 Months', label: '4 Months' },
            { value: '6 Months', label: '6 Months' },
          ]}
        />

        {/* 5. Stipend Filter */}
        <Select
          label="Stipend Filter"
          value={filters.stipendOnly}
          onChange={(e) => onFilterChange({ ...filters, stipendOnly: e.target.value })}
          options={[
            { value: 'all', label: 'All Listings' },
            { value: 'paid', label: 'Paid Stipend Only' },
          ]}
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500 hover:text-slate-700">
          Reset Filters
        </Button>
      </div>
    </div>
  );
};