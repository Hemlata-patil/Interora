import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  Users, CheckCircle2, Clock, Search, Filter, 
  Activity, User, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/supabaseClient';
import { fetchCompanyActiveInternsBackend, type CompanyActiveInternRecord } from '@/services/api/backendService';

export const MyInterns: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [interns, setInterns] = useState<CompanyActiveInternRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadActiveInterns = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const remoteInterns = await fetchCompanyActiveInternsBackend(userData.user.id);
      setInterns(remoteInterns);
    }
  };

  useEffect(() => {
    const initMyInterns = async () => {
      setLoading(true);
      await loadActiveInterns();
      setLoading(false);
    };

    initMyInterns();

    // Subscribe to Realtime changes on student_applications table
    const channel = supabase
      .channel('company_my_interns_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_applications' },
        () => {
          loadActiveInterns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalCount = interns.length;
  const activeCount = interns.filter((i) => i.status === 'Selected' || i.status === 'Active').length;
  const completedCount = interns.filter((i) => i.status === 'Completed').length;

  const filteredInterns = useMemo(() => {
    return interns.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = item.studentName.toLowerCase().includes(q) || item.internshipTitle.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || item.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [interns, searchTerm, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selected':
      case 'Active':
        return <Badge variant="indigo" className="py-0.5"><Activity className="w-3.5 h-3.5 mr-1" /> Active Intern</Badge>;
      case 'Completed':
        return <Badge variant="neutral" className="py-0.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Completed</Badge>;
      default:
        return <Badge variant="amber" className="py-0.5"><Clock className="w-3.5 h-3.5 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="My Interns"
        description="Monitor your selected interns and track their internship progress."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Selected Interns" value={totalCount.toString()} icon={Users} />
        <StatCard title="Active Enrolled" value={activeCount.toString()} icon={Activity} />
        <StatCard title="Completed Internships" value={completedCount.toString()} icon={CheckCircle2} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 gap-4 w-full flex-col sm:flex-row">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search interns or internship title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Selected">Selected / Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Intern List */}
      <div className="space-y-4">
        {filteredInterns.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredInterns.map((item) => (
              <Card key={item.applicationId} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                    {item.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Col 1: Identity */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 truncate">{item.studentName}</h3>
                      <p className="text-sm font-medium text-indigo-600 truncate">{item.internshipTitle}</p>
                      <p className="text-xs text-slate-500 truncate">{item.studentEmail}</p>
                    </div>
                    {/* Col 2: Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600">Selected Date: {new Date(item.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                    {/* Col 3: Status */}
                    <div className="flex flex-col justify-center">
                      <span className="text-xs text-emerald-600 font-bold">Selected & Active</span>
                      <span className="text-[11px] text-slate-400">Enrollment Verified</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end mt-4 md:mt-0 pt-4 border-t border-slate-100 md:border-0 md:pt-0 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/company/my-interns/${item.studentId}`)}>
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
            <h3 className="text-lg font-medium text-slate-900">
              {loading ? 'Loading active interns...' : 'No active interns yet'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Selected candidates will appear here once you make a final selection from your Applicants pipeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
