import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Button, Badge } from '@/components';
import { 
  Users, CheckCircle2, Clock, Search, Filter, 
  Briefcase, AlertCircle, User, Activity, ExternalLink
} from 'lucide-react';
import { 
  mockCompanyApplications, 
  mockFacultyStudents, 
  mockCompanyInternships,
  MOCK_CURRENT_MENTOR_ID
} from '../faculty/mockData';
import type { 
  CompanyApplicationData, 
  SharedStudentData,
  InternshipData
} from '../faculty/mockData';

interface InternData {
  app: CompanyApplicationData;
  student: SharedStudentData;
  internship: InternshipData;
}

export const MentorMyInterns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInternship, setFilterInternship] = useState<string>('All');
  const [filterHealth, setFilterHealth] = useState<string>('All');

  // Compute joined selected interns for this mentor
  const interns = useMemo(() => {
    const selectedApps = mockCompanyApplications.filter(a => a.applicationStatus === 'Selected');
    
    return selectedApps.map(app => {
      const student = mockFacultyStudents.find(s => s.id === app.studentId);
      const internship = mockCompanyInternships.find(i => i.id === app.internshipId);
      
      // Filter strictly to MOCK_CURRENT_MENTOR_ID
      if (student && internship && internship.mentorId === MOCK_CURRENT_MENTOR_ID) {
        return { app, student, internship };
      }
      return null;
    }).filter(Boolean) as InternData[];
  }, []);

  const uniqueInternships = useMemo(() => {
    const ids = new Set(interns.map(i => i.internship.id));
    return Array.from(ids).map(id => mockCompanyInternships.find(i => i.id === id)).filter(Boolean) as InternshipData[];
  }, [interns]);

  // Filtered list
  const filteredInterns = useMemo(() => {
    return interns.filter(({ student, internship }) => {
      const matchesSearch = 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        internship.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesInternship = filterInternship === 'All' || internship.id === filterInternship;
      
      let matchesHealth = true;
      if (filterHealth === 'Needs Attention' || filterHealth === 'At Risk') {
        matchesHealth = student.riskIndicator !== 'None';
      } else if (filterHealth === 'On Track') {
        matchesHealth = student.riskIndicator === 'None';
      }

      return matchesSearch && matchesInternship && matchesHealth;
    });
  }, [interns, searchTerm, filterInternship, filterHealth]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="My Assigned Interns"
          description="Detailed view of the interns currently under your supervision."
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assigned interns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterInternship}
              onChange={(e) => setFilterInternship(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Internships</option>
              {uniqueInternships.map(i => (
                <option key={i.id} value={i.id}>{i.title}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">Health: All</option>
              <option value="On Track">On Track</option>
              <option value="Needs Attention">Needs Attention</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInterns.length > 0 ? (
          filteredInterns.map(({ app, student, internship }) => (
            <Card key={student.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {student.studentName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{student.studentName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Briefcase className="w-3 h-3" /> {internship.title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm border-y border-slate-100 py-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <Badge variant={student.internshipStatus === 'Active' ? 'emerald' : student.internshipStatus === 'Completed' ? 'indigo' : 'neutral'}>
                      {student.internshipStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Health</p>
                    {student.riskIndicator !== 'None' ? (
                      <Badge variant="amber" className="text-[10px] py-0 leading-tight"><AlertCircle className="w-3 h-3 mr-1" /> Needs Attention</Badge>
                    ) : (
                      <Badge variant="emerald" className="text-[10px] py-0 leading-tight"><CheckCircle2 className="w-3 h-3 mr-1" /> On Track</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">Overall Progress</span>
                    <span className="font-bold text-indigo-600">{student.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${student.progressPercentage > 75 ? 'bg-emerald-500' : student.progressPercentage > 40 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                      style={{ width: `${student.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center justify-between">
                 <div className="flex items-center text-xs text-slate-500 gap-1.5">
                   <Clock className="w-3.5 h-3.5" />
                   Last active: {student.lastActivity}
                 </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No interns found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
