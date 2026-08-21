import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  CheckCircle2, Clock, X, Filter, Activity, Map, ArrowRight,
  AlertCircle, LayoutList, Calendar, Flag
} from 'lucide-react';
import { 
  mockCompanyMilestones,
  mockFacultyStudents, 
  mockCompanyInternships,
  mockCompanyTasks
} from '../faculty/mockData';
import type { 
  CompanyMilestoneData,
  MilestoneStatus,
  StudentTaskExecution
} from '../faculty/mockData';

export const CompanyMilestones: React.FC = () => {
  const [filterInternship, setFilterInternship] = useState<string>('All');

  // Determine unique internships for the filter
  const availableInternships = useMemo(() => {
    return mockCompanyInternships.map(i => ({ id: i.id, title: i.title }));
  }, []);

  // Filter milestones based on selection
  const filteredMilestones = useMemo(() => {
    return mockCompanyMilestones.filter(m => filterInternship === 'All' || m.internshipId === filterInternship);
  }, [filterInternship]);

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
            {filteredMilestones.length > 0 ? (
              filteredMilestones.map(milestone => {
                const internship = mockCompanyInternships.find(i => i.id === milestone.internshipId);
                const definition = internship?.milestones?.find(m => m.id === milestone.id);

                return (
                  <Card key={milestone.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-lg font-bold text-slate-900">{definition?.title || milestone.title}</h3>
                            {getMilestoneStatusBadge(milestone.status)}
                          </div>
                          <p className="text-sm text-slate-500">Program: <span className="font-semibold text-slate-700">{internship?.title || 'Unknown Internship'}</span></p>
                        </div>
                        
                        <p className="text-sm text-slate-700 line-clamp-2">{definition?.description || milestone.description}</p>
                        
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
                            className="bg-indigo-500 h-2 rounded-full" 
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
              {filteredMilestones.slice(0, 5).map((m, idx) => {
                const internship = mockCompanyInternships.find(i => i.id === m.internshipId);
                const definition = internship?.milestones?.find(ms => ms.id === m.id);
                return (
                  <div key={idx} className="relative flex items-start gap-3 group">
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-white shrink-0 mt-0.5 shadow-sm relative z-10 ${m.status === 'Completed' ? 'bg-emerald-500' : m.status === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                    <div className="pb-2">
                      <div className="text-xs font-bold text-slate-900 leading-tight">{definition?.title || m.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
