import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader, Card, Button, Badge, StatCard, Input } from '@/components';
import { 
  FileText, CheckCircle2, Clock, Star, Search, Filter, 
  MessageSquare, Loader2, X 
} from 'lucide-react';
import { 
  fetchCompanyWeeklyReportsBackend,
  reviewCompanyWeeklyReportBackend 
} from '@/services/api/backendService';

export interface CompanyWeeklyReportItem {
  id: string;
  assignmentId: string;
  studentName: string;
  internshipTitle: string;
  weekNumber?: number;
  startDate: string;
  endDate: string;
  tasksCompleted: string;
  challengesFaced?: string;
  learningsSummary?: string;
  plannedTasksNextWeek?: string;
  hoursWorked?: number;
  status: 'submitted' | 'reviewed';
  mentorFeedback?: string;
  rating?: number;
  submittedAt: string;
}

export const CompanyReports: React.FC = () => {
  const [reports, setReports] = useState<CompanyWeeklyReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedReport, setSelectedReport] = useState<CompanyWeeklyReportItem | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const backendReports = await fetchCompanyWeeklyReportsBackend();
      if (backendReports && backendReports.length > 0) {
        const mapped: CompanyWeeklyReportItem[] = backendReports.map((r: any) => ({
          id: r.id,
          assignmentId: r.assignmentId,
          studentName: r.assignment?.student?.profile?.fullName || 'Assigned Intern',
          internshipTitle: r.assignment?.internship?.title || 'Internship Program',
          weekNumber: r.weekNumber,
          startDate: r.weekStartDate ? new Date(r.weekStartDate).toISOString().split('T')[0] : '',
          endDate: r.weekEndDate ? new Date(r.weekEndDate).toISOString().split('T')[0] : '',
          tasksCompleted: r.summary || r.tasksCompleted || 'Summary of week activities.',
          challengesFaced: r.challengesFaced,
          learningsSummary: r.learningsSummary,
          plannedTasksNextWeek: r.nextWeekPlan || r.plannedTasksNextWeek,
          hoursWorked: r.hoursWorked ? Number(r.hoursWorked) : undefined,
          status: r.status,
          mentorFeedback: r.mentorFeedback,
          rating: r.rating ? Number(r.rating) : undefined,
          submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString().split('T')[0] : '',
        }));
        setReports(mapped);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      console.error('[CompanyReports] Error loading reports:', err);
      setError('Failed to load weekly reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = 
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tasksCompleted.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  // Metrics
  const totalCount = reports.length;
  const pendingCount = reports.filter(r => r.status === 'submitted').length;
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length;
  const avgRating = useMemo(() => {
    const rated = reports.filter(r => r.rating !== undefined);
    if (rated.length === 0) return '—';
    const sum = rated.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / rated.length).toFixed(1);
  }, [reports]);

  const handleOpenReview = (report: CompanyWeeklyReportItem) => {
    setSelectedReport(report);
    setFeedbackInput(report.mentorFeedback || '');
    setRatingInput(report.rating || 5);
  };

  const handleSaveReview = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await reviewCompanyWeeklyReportBackend(selectedReport.id, {
        feedback: feedbackInput.trim() || 'Good weekly progress.',
        rating: ratingInput,
      });
      await loadData();
      setSelectedReport(null);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Weekly Performance Reports"
        description="Review student weekly progress logs, learnings, challenges, and provide constructive mentor feedback."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={totalCount.toString()} icon={FileText} />
        <StatCard title="Awaiting Review" value={pendingCount.toString()} icon={Clock} />
        <StatCard title="Reviewed" value={reviewedCount.toString()} icon={CheckCircle2} />
        <StatCard title="Average Rating" value={avgRating !== '—' ? `★ ${avgRating}` : '—'} icon={Star} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by intern or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-700 mr-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="submitted">Pending Review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading weekly reports...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Intern Name</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Week Period</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length > 0 ? (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {r.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {r.internshipTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                        {r.startDate} to {r.endDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {r.hoursWorked ? `${r.hoursWorked} hrs` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {r.rating ? (
                          <span className="font-bold text-emerald-700">★ {r.rating}/5</span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {r.status === 'reviewed' ? (
                          <Badge variant="emerald"><CheckCircle2 className="w-3 h-3 mr-1" /> Reviewed</Badge>
                        ) : (
                          <Badge variant="indigo"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenReview(r)}
                        >
                          {r.status === 'reviewed' ? 'View Details' : 'Review & Rate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No weekly reports found for this company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-xl shadow-xl border-0 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Weekly Performance Report</h3>
                <p className="text-xs text-slate-500">{selectedReport.studentName} • {selectedReport.startDate} to {selectedReport.endDate}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tasks Completed</h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  {selectedReport.tasksCompleted}
                </div>
              </div>

              {selectedReport.challengesFaced && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Challenges & Obstacles</h4>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed">
                    {selectedReport.challengesFaced}
                  </div>
                </div>
              )}

              {selectedReport.plannedTasksNextWeek && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Planned For Next Week</h4>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed">
                    {selectedReport.plannedTasksNextWeek}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mentor Rating (1 - 5 Stars)</label>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className={`px-3 py-1.5 rounded text-sm font-semibold border transition-colors ${
                        ratingInput === star 
                          ? 'bg-amber-500 text-white border-amber-500' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-semibold text-slate-700 mb-1">Mentor Constructive Feedback</label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Provide feedback on the intern's deliverables and direction..."
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>Close</Button>
              <Button onClick={handleSaveReview} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                Submit Review & Feedback
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
