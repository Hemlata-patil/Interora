import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader, Card, Badge, EmptyState, Button } from '@/components';
import { deadlineService } from './services/internshipDeadlineService';
import type { InternshipDeadlineRecord, InternshipDeadlineSummary } from './types/deadline';
import { calculateDeadlineCountdown } from './utils/deadlineUtils';
import { InternshipOpportunityCard } from './components/InternshipOpportunityCard';
import { InternshipDetailsModal } from './components/InternshipDetailsModal';
import { Search, Flame, Clock, CheckCircle2, AlertCircle, Filter, RotateCcw } from 'lucide-react';

export const InternshipDeadlinesPage: React.FC = () => {
  const [records, setRecords] = useState<InternshipDeadlineRecord[]>([]);
  const [summary, setSummary] = useState<InternshipDeadlineSummary>({
    totalOpen: 0,
    closingSoon: 0,
    appliedCount: 0,
    expiredCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [workModeFilter, setWorkModeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'company' | 'recent'>('deadline');

  // Modal details state
  const [selectedRecord, setSelectedRecord] = useState<InternshipDeadlineRecord | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, sum] = await Promise.all([
        deadlineService.getInternshipDeadlines(),
        deadlineService.getSummaryMetrics(),
      ]);
      setRecords(list);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load deadline records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (id: string) => {
    const success = await deadlineService.applyForInternship(id);
    if (success) {
      await loadData();
    }
  };

  // Urgent top 3 deadlines (sorted by nearest remaining time, excluding expired)
  const urgentDeadlines = useMemo(() => {
    return records
      .map((rec) => ({
        rec,
        countdown: calculateDeadlineCountdown(rec.registrationStart, rec.registrationDeadline, rec.isApplied),
      }))
      .filter((item) => !item.rec.isApplied && item.countdown.status !== 'EXPIRED' && item.countdown.status !== 'UPCOMING')
      .sort((a, b) => a.countdown.totalMilliseconds - b.countdown.totalMilliseconds)
      .slice(0, 3);
  }, [records]);

  // Filtered & Sorted main grid list
  const filteredRecords = useMemo(() => {
    const list = records.filter((rec) => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRole = rec.role.toLowerCase().includes(q);
        const matchesCompany = rec.companyName.toLowerCase().includes(q);
        const matchesSkills = rec.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesRole && !matchesCompany && !matchesSkills) return false;
      }

      // Status Filter
      const countdown = calculateDeadlineCountdown(rec.registrationStart, rec.registrationDeadline, rec.isApplied);
      if (statusFilter === 'Open' && countdown.status !== 'OPEN' && countdown.status !== 'CLOSING_SOON') return false;
      if (statusFilter === 'Closing Soon' && countdown.status !== 'CLOSING_SOON') return false;
      if (statusFilter === 'Upcoming' && countdown.status !== 'UPCOMING') return false;
      if (statusFilter === 'Applied' && !rec.isApplied) return false;
      if (statusFilter === 'Expired' && countdown.status !== 'EXPIRED') return false;

      // Work Mode Filter
      if (workModeFilter !== 'All' && rec.workMode !== workModeFilter) return false;

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'deadline') {
        const countA = calculateDeadlineCountdown(a.registrationStart, a.registrationDeadline, a.isApplied);
        const countB = calculateDeadlineCountdown(b.registrationStart, b.registrationDeadline, b.isApplied);
        return countA.totalMilliseconds - countB.totalMilliseconds;
      }
      if (sortBy === 'company') {
        return a.companyName.localeCompare(b.companyName);
      }
      return 0;
    });
  }, [records, searchQuery, statusFilter, workModeFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Internship Opportunities"
        description="Track opportunities, deadlines, and application status in one place."
      />

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">OPEN INTERNSHIPS</span>
            <span className="text-sm font-bold text-slate-900">{summary.totalOpen} Active</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CLOSING SOON</span>
            <span className="text-sm font-bold text-amber-600">{summary.closingSoon} Urgent</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">APPLICATIONS SUBMITTED</span>
            <span className="text-sm font-bold text-emerald-600">{summary.appliedCount} Submitted</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">EXPIRED</span>
            <span className="text-sm font-bold text-slate-500">{summary.expiredCount} Closed</span>
          </div>
        </Card>
      </div>

      {/* 3. Urgent Deadlines Banner Section */}
      {urgentDeadlines.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Don't Miss These Deadlines</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urgentDeadlines.map(({ rec }) => (
              <InternshipOpportunityCard
                key={rec.id}
                internship={rec}
                onApply={handleApply}
                onViewDetails={setSelectedRecord}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Filters & Search Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search internships by company, role, or skills (e.g., React, Python, Microsoft)..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closing Soon">Closing Soon</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Applied">Applied</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Work Mode</label>
            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="deadline">Nearest Deadline First</option>
              <option value="company">Company Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Main Internship Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">All Internship Opportunities</h3>
          <Badge variant="neutral">{filteredRecords.length} Opportunities</Badge>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((rec) => (
              <InternshipOpportunityCard
                key={rec.id}
                internship={rec}
                onApply={handleApply}
                onViewDetails={setSelectedRecord}
              />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Search className="w-6 h-6 text-slate-400" />}
              title="No internship opportunities found"
              description="No opportunities match your active search query or status filter selections. Try adjusting parameters."
            />
          </Card>
        )}
      </div>

      {/* 6. Internship Details Modal */}
      {selectedRecord && (
        <InternshipDetailsModal
          internship={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onApply={handleApply}
        />
      )}
    </div>
  );
};