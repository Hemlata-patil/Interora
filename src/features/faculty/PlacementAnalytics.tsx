import React, { useState, useMemo } from 'react';
import { 
  PageHeader, 
  StatCard, 
  Table, 
  Badge, 
  Select
} from '@/components';
import { mockFacultyStudents } from './mockData';
import type { SharedStudentData } from './mockData';
import { Users, Briefcase, GraduationCap, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { Column } from '@/components/ui/Table';

export const PlacementAnalytics: React.FC = () => {
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');

  // Derive unique departments and batches for filters
  const departments = useMemo(() => {
    const deps = new Set(mockFacultyStudents.map(s => s.department));
    return ['All', ...Array.from(deps)];
  }, []);

  const batches = useMemo(() => {
    const bts = new Set(mockFacultyStudents.map(s => s.batchYear));
    return ['All', ...Array.from(bts)];
  }, []);

  // Filter students based on selection
  const filteredStudents = useMemo(() => {
    return mockFacultyStudents.filter(student => {
      const matchDept = departmentFilter === 'All' || student.department === departmentFilter;
      const matchBatch = batchFilter === 'All' || student.batchYear === batchFilter;
      return matchDept && matchBatch;
    });
  }, [departmentFilter, batchFilter]);

  // Calculate statistics dynamically
  const totalStudents = filteredStudents.length;
  const activeInternships = filteredStudents.filter(s => s.internshipStatus === 'Active').length;
  const completedInternships = filteredStudents.filter(s => s.internshipStatus === 'Completed').length;
  const placedStudents = filteredStudents.filter(s => s.placementStatus === 'Placed').length;
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  const atRiskInternships = filteredStudents.filter(s => s.internshipStatus === 'At Risk').length;
  const notStartedInternships = filteredStudents.filter(s => s.internshipStatus === 'Not Started').length;

  // Company distribution
  const companyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredStudents.forEach(s => {
      counts[s.company] = (counts[s.company] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredStudents]);

  const getInternshipStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="indigo">Active</Badge>;
      case 'Completed': return <Badge variant="emerald">Completed</Badge>;
      case 'At Risk': return <Badge variant="rose">At Risk</Badge>;
      default: return <Badge variant="neutral">Not Started</Badge>;
    }
  };

  const getPlacementStatusBadge = (status?: string) => {
    switch (status) {
      case 'Placed': return <Badge variant="emerald">Placed</Badge>;
      case 'In Progress': return <Badge variant="amber">In Progress</Badge>;
      default: return <Badge variant="neutral">Not Placed</Badge>;
    }
  };

  const columns: Column<SharedStudentData>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.studentName}</div>
          <div className="text-xs text-slate-500">{row.studentId} • {row.department} {row.batchYear}</div>
        </div>
      ),
    },
    {
      header: 'Company & Role',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.company}</div>
          <div className="text-xs text-slate-500">{row.role}</div>
        </div>
      ),
    },
    {
      header: 'Internship Status',
      cell: (row) => getInternshipStatusBadge(row.internshipStatus),
    },
    {
      header: 'Placement Status',
      cell: (row) => getPlacementStatusBadge(row.placementStatus),
    },
    {
      header: 'Action',
      cell: () => (
        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
          View Profile
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Placement Analytics"
        description="Track internship and placement performance across your students."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-48">
          <Select 
            label="Department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={departments.map(d => ({ label: d, value: d }))}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            label="Batch / Year"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            options={batches.map(b => ({ label: b, value: b }))}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Students" value={totalStudents} icon={Users} />
        <StatCard title="Active Internships" value={activeInternships} icon={Briefcase} />
        <StatCard title="Completed Internships" value={completedInternships} icon={CheckCircle2} />
        <StatCard title="Placed Students" value={placedStudents} icon={Award} />
        <StatCard title="Placement Rate" value={`${placementRate}%`} icon={TrendingUp} trend={{ value: 'Overall', isPositive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Internship Status Overview */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-900 mb-4">Internship Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                Active
              </span>
              <span className="font-bold text-slate-900">{activeInternships}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                Completed
              </span>
              <span className="font-bold text-slate-900">{completedInternships}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                At Risk
              </span>
              <span className="font-bold text-slate-900">{atRiskInternships}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                Not Started
              </span>
              <span className="font-bold text-slate-900">{notStartedInternships}</span>
            </div>
          </div>
          
          {/* Simple Visual Bar */}
          <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
            {totalStudents > 0 && (
              <>
                <div style={{ width: `${(activeInternships / totalStudents) * 100}%` }} className="bg-indigo-500"></div>
                <div style={{ width: `${(completedInternships / totalStudents) * 100}%` }} className="bg-emerald-500"></div>
                <div style={{ width: `${(atRiskInternships / totalStudents) * 100}%` }} className="bg-rose-500"></div>
                <div style={{ width: `${(notStartedInternships / totalStudents) * 100}%` }} className="bg-slate-300"></div>
              </>
            )}
          </div>
        </div>

        {/* Placement Overview (Prominent) */}
        <div className="bg-indigo-600 border border-indigo-700 rounded-xl shadow-sm p-6 lg:col-span-1 text-white flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-indigo-100 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Placement Pipeline
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-indigo-500/50 pb-2">
                <span className="text-sm text-indigo-100">Eligible Pool (Total)</span>
                <span className="font-bold">{totalStudents}</span>
              </div>
              <div className="flex justify-between items-center border-b border-indigo-500/50 pb-2">
                <span className="text-sm text-indigo-100">Completed Internships</span>
                <span className="font-bold">{completedInternships}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-indigo-100">Successfully Placed</span>
                <span className="font-bold text-emerald-300">{placedStudents}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-indigo-500/50 flex items-end justify-between">
            <span className="text-indigo-200 font-medium">Placement Rate</span>
            <div className="text-4xl font-black text-white">{placementRate}<span className="text-2xl text-indigo-300">%</span></div>
          </div>
        </div>

        {/* Company Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-900 mb-4">Company Distribution</h3>
          {companyDistribution.length > 0 ? (
            <div className="space-y-4">
              {companyDistribution.map(([company, count], idx) => (
                <div key={company} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">{company}</span>
                      <span className="text-xs font-bold text-slate-900">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(count / totalStudents) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-10">
              <Briefcase className="w-8 h-8 mb-2 opacity-50" />
              <p>No companies found</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Student Placement Details</h3>
        </div>
        <div className="p-4">
          <Table 
            columns={columns} 
            data={filteredStudents} 
            keyExtractor={(row) => row.id} 
          />
        </div>
      </div>
    </div>
  );
};

// CheckCircle2 needs to be imported, added it to lucide-react imports
