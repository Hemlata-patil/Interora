import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader, Card, Badge, StatCard } from '@/components';
import { 
  CheckCircle2, Clock, Filter, Activity, Flag, Calendar, AlertCircle, Loader2
} from 'lucide-react';
import { 
  fetchCompanyMilestonesBackend, 
  fetchInternshipPostingsBackend 
} from '@/services/api/backendService';
import { mockCompanyMilestones, mockCompanyInternships } from '../faculty/mockData';
import type { 
  CompanyMilestoneData,
  MilestoneStatus
} from '../faculty/mockData';

interface EnhancedMilestone extends CompanyMilestoneData {
  internshipTitle?: string;
  studentName?: string;
}

export const CompanyMilestones: React.FC = () => {
  const [milestones, setMilestones] = useState<EnhancedMilestone[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterInternship, setFilterInternship] = useState<string>('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [backendMilestones, backendPostings] = await Promise.all([
        fetchCompanyMilestonesBackend(),
        fetchInternshipPostingsBackend(),
      ]);

      if (backendMilestones && backendMilestones.length > 0) {
        const mapped: EnhancedMilestone[] = backendMilestones.map((m: any) => {
          let status: MilestoneStatus = 'Not Started';
          if (m.status === 'completed') status = 'Completed';
          else if (m.status === 'in_progress') status = 'In Progress';
          else if (m.status === 'at_risk') status = 'At Risk';
          else if (m.status === 'overdue') status = 'Overdue';

          let progress = 0;
          if (status === 'Completed') progress = 100;
          else if (status === 'In Progress') progress = 50;

          return {
            id: m.id,
            internshipId: m.assignment?.internshipId || '',
            internshipTitle: m.assignment?.internship?.title || 'Internship Program',
            internId: m.assignment?.studentId || '',
            studentName: m.assignment?.student?.profile?.fullName || 'Assigned Intern',
            title: m.title || m.template?.title || 'Operational Milestone',
            description: m.description || m.template?.description || 'Milestone deliverables and validation.',
            startDate: m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : '',
            dueDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : 'TBD',
            completedDate: m.completionDate ? new Date(m.completionDate).toISOString().split('T')[0] : undefined,
            status,
            progressPercentage: progress,
          };
        });
        setMilestones(mapped);
      } else {
        setMilestones(mockCompanyMilestones);
      }

      if (backendPostings && backendPostings.length > 0) {
        setInternships(backendPostings);
      } else {
        setInternships(mockCompanyInternships);
      }
    } catch (err: any) {
      console.error('[CompanyMilestones] Error loading data:', err);
      setError('Failed to load milestones.');
      setMilestones(mockCompanyMilestones);
      setInternships(mockCompanyInternships);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Determine unique internships for the filter
  const availableInternships = useMemo(() => {
    if (internships.length > 0) {
      return internships.map(i => ({ id: i.id, title: i.title }));
    }
    return mockCompanyInternships.map(i => ({ id: i.id, title: i.title }));
  }, [internships]);

  // Filter milestones based on selection
  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => filterInternship === 'All' || m.internshipId === filterInternship);
  }, [milestones, filterInternship]);

  // Overall metrics
  const totalMilestones = filteredMilestones.length;
  const completedMilestones = filteredMilestones.filter(m => m.status === 'Completed').length;
  const inProgressMilestones = filteredMilestones.filter(m => m.status === 'In Progress').length;
  const atRiskMilestones = filteredMilestones.filter(m => m.status === 'At Risk' || m.status === 'Overdue').length;

  const getMilestoneStatusBadge = (status: MilestoneStatus) => {
    switch(status) {
      case 'Completed': return <Badge variant="emerald" className="py-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'In Progress': return <Badge variant="indigo" className="py-0.5"><Activity className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case 'At Risk': return <Badge variant="amber" className="py-0.5"><AlertCircle className="w-3 h-3 mr-1" /> At Risk</Badge>;
      case 'Overdue': return <Badge variant="rose" className="py-0.5"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
      case 'Not Started': return <Badge variant="neutral" className="py-0.5"><Clock className="w-3 h-3 mr-1" /> Not Started</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Internship Milestones"
        description="High-level overview of milestone progress across your company's internship programs."
      />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-700 mr-2">Filter by Internship:</span>
          <select
            value={filterInternship}
            onChange={(e) => setFilterInternship(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-64"
          >
            <option value="All">All Internships</option>
            {availableInternships.map(i => (
              <option key={i.id} value={i.id}>{i.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Total Milestones" value={totalMilestones.toString()} icon={Flag} />
            <StatCard title="Completed" value={completedMilestones.toString()} icon={CheckCircle2} />
            <StatCard title="In Progress" value={inProgressMilestones.toString()} icon={Activity} />
            <StatCard title="At Risk / Overdue" value={atRiskMilestones.toString()} icon={AlertCircle} />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading milestones...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-rose-600 bg-white rounded-xl border border-slate-200">{error}</div>
            ) : filteredMilestones.length > 0 ? (
              filteredMilestones.map(milestone => {
                const programName = milestone.internshipTitle || 
                  internships.find(i => i.id === milestone.internshipId)?.title || 
                  mockCompanyInternships.find(i => i.id === milestone.internshipId)?.title || 
                  'Internship Program';

                return (
                  <Card key={milestone.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-lg font-bold text-slate-900">{milestone.title}</h3>
                            {getMilestoneStatusBadge(milestone.status)}
                          </div>
                          <p className="text-sm text-slate-500">
                            Program: <span className="font-semibold text-slate-700">{programName}</span>
                            {milestone.studentName && <span className="ml-2 text-xs text-indigo-600 font-medium">({milestone.studentName})</span>}
                          </p>
                        </div>
                        
                        <p className="text-sm text-slate-700 line-clamp-2">{milestone.description}</p>
                        
                        <div className="flex items-center gap-6 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Target Due: {milestone.dueDate}
                          </div>
                        </div>
                      </div>

                      <div className="md:w-48 flex flex-col justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-semibold text-slate-500">Overall Progress</span>
                          <span className="font-bold text-indigo-700">{milestone.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all" 
                            style={{ width: `${milestone.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Flag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">No milestones found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  No milestones have been defined for the selected internship program.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Timeline Overview" className="shadow-sm">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {filteredMilestones.slice(0, 5).map((m, idx) => (
                <div key={idx} className="relative flex items-start gap-3 group">
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-white shrink-0 mt-0.5 shadow-sm relative z-10 ${m.status === 'Completed' ? 'bg-emerald-500' : m.status === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                  <div className="pb-2">
                    <div className="text-xs font-bold text-slate-900 leading-tight">{m.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{m.status}</div>
                  </div>
                </div>
              ))}
              {filteredMilestones.length === 0 && (
                <div className="text-xs text-slate-400 italic">No timeline entries.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
