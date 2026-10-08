import React, { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { Building2, Users, GraduationCap, Link } from 'lucide-react';

interface HodDashboardMetrics {
  totalFaculty: number;
  totalStudents: number;
  unassignedStudents: number;
  assignedStudents: number;
  totalInterns: number;
  activeInternships: number;
  departmentName: string;
}

export const HodDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HodDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient.get('/hod/dashboard');
        setMetrics(response.data || null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="p-8">Loading HOD Dashboard...</div>;
  if (error) return <div className="p-8 text-rose-600">{error}</div>;
  if (!metrics) return <div className="p-8">No data found.</div>;

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">HOD Dashboard</h1>
        <p className="text-slate-500">Department of {metrics.departmentName}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Building2 /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Faculty</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.totalFaculty}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><GraduationCap /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Link /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Interns</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.totalInterns}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Link /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Internships</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.activeInternships}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Users /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unassigned Students</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.unassignedStudents}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Link /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Assigned Students</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.assignedStudents}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
