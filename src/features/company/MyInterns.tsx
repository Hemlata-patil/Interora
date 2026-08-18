import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  Users, CheckCircle2, Clock, X, Search, Filter, 
  Briefcase, Activity, AlertCircle, ChevronRight, User, ExternalLink
} from 'lucide-react';
import { 
  mockCompanyApplications, 
  mockFacultyStudents, 
  mockCompanyInternships,
  mockCompanyMentors
} from '../faculty/mockData';
import type { 
  CompanyApplicationData, 
  SharedStudentData,
  InternshipData,
  CompanyMentorData
} from '../faculty/mockData';

import { useNavigate } from 'react-router-dom';

interface InternData {
  app: CompanyApplicationData;
  student: SharedStudentData;
  internship: InternshipData;
  mentor: CompanyMentorData | undefined;
}

export const MyInterns: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterInternship, setFilterInternship] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterHealth, setFilterHealth] = useState<string>('All');

  // Compute joined selected interns
  const interns = useMemo(() => {
    const selectedApps = mockCompanyApplications.filter(a => a.applicationStatus === 'Selected');
    
    return selectedApps.map(app => {
      const student = mockFacultyStudents.find(s => s.id === app.studentId);
      const internship = mockCompanyInternships.find(i => i.id === app.internshipId);
      const mentor = internship?.mentorId ? mockCompanyMentors.find(m => m.id === internship.mentorId) : undefined;
      
      if (student && internship) {
        return { app, student, internship, mentor };
      }
      return null;
    }).filter(Boolean) as InternData[];
  }, []);

  // Filtered list
  const filteredInterns = useMemo(() => {
    return interns.filter(({ student, internship }) => {
      const matchesSearch = 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesInternship = filterInternship === 'All' || internship.id === filterInternship;
      const matchesStatus = filterStatus === 'All' || student.internshipStatus.toLowerCase() === filterStatus.toLowerCase();
      
      let matchesHealth = true;
      if (filterHealth === 'Needs Attention' || filterHealth === 'At Risk') {
        matchesHealth = student.riskIndicator !== 'None';
      } else if (filterHealth === 'On Track') {
        matchesHealth = student.riskIndicator === 'None';
      }

      return matchesSearch && matchesInternship && matchesStatus && matchesHealth;
    });
  }, [interns, searchTerm, filterInternship, filterStatus, filterHealth]);

  // Metrics
  const totalCount = interns.length;
  const activeCount = interns.filter(i => i.student.internshipStatus === 'Active').length;
  const completedCount = interns.filter(i => i.student.internshipStatus === 'Completed').length;
  const needsAttentionCount = interns.filter(i => i.student.riskIndicator !== 'None').length;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Active': return <Badge variant="emerald" className="py-0.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active</Badge>;
      case 'Completed': return <Badge variant="neutral" className="py-0.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Completed</Badge>;
      case 'At Risk': return <Badge variant="rose" className="py-0.5"><AlertCircle className="w-3.5 h-3.5 mr-1" /> At Risk</Badge>;
      case 'Not Started': return <Badge variant="neutral" className="py-0.5"><Clock className="w-3.5 h-3.5 mr-1" /> Upcoming</Badge>;
      default: return null;
    }
  };

  const getHealthBadge = (indicator: string) => {
    if (indicator === 'None') {
      return <Badge variant="emerald" className="bg-emerald-50 text-[10px] py-0 px-2">On Track</Badge>;
    }
    return <Badge variant="amber" className="bg-amber-50 text-[10px] py-0 px-2">Needs Attention</Badge>;
  };



  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="My Interns"
        description="Monitor your selected interns and track their internship progress."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Interns" value={totalCount.toString()} icon={Users} />
        <StatCard title="Active" value={activeCount.toString()} icon={Activity} />
        <StatCard title="Completed" value={completedCount.toString()} icon={CheckCircle2} />
        <StatCard title="Needs Attention" value={needsAttentionCount.toString()} icon={AlertCircle} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 gap-4 w-full flex-col sm:flex-row">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search interns, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterInternship}
              onChange={(e) => setFilterInternship(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[150px] truncate"
            >
              <option value="All">All Internships</option>
              {mockCompanyInternships.map(i => (
                <option key={i.id} value={i.id}>{i.title}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[120px]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[120px]"
            >
              <option value="All">All Health</option>
              <option value="On Track">On Track</option>
              <option value="Needs Attention">Needs Attention</option>
            </select>
          </div>
        </div>
      </div>

      {/* Intern List */}
      <div className="space-y-4">
        {filteredInterns.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredInterns.map((item) => (
              <Card key={item.app.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                    {item.student.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Col 1: Identity */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 truncate">{item.student.studentName}</h3>
                      <p className="text-sm font-medium text-indigo-600 truncate">{item.internship.title}</p>
                      <p className="text-xs text-slate-500 truncate">{item.student.department} • University Institute (Mock)</p>
                    </div>
                    {/* Col 2: Details & Health */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600">
                          Mentor: <span className="font-medium text-slate-900">{item.mentor?.name || 'Unassigned'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600">{item.student.startDate} - {item.student.endDate}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getStatusBadge(item.student.internshipStatus)}
                        {getHealthBadge(item.student.riskIndicator)}
                      </div>
                    </div>
                    {/* Col 3: Progress */}
                    <div className="flex flex-col justify-center">
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-indigo-600">{item.student.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${item.student.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end mt-4 md:mt-0 pt-4 border-t border-slate-100 md:border-0 md:pt-0 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/company/my-interns/${item.student.id}`)}>
                      View Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No interns yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Selected candidates will appear here once you make a final selection from your Applicants pipeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
