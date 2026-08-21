import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Badge } from '@/components';
import { CheckSquare, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import {
  fetchCompanyMentorTasksBackend,
  updateCompanyMentorTaskReviewBackend,
  type CompanyMentorTaskRecord,
} from '@/services/api/backendService';

export const MentorTasks: React.FC = () => {
  const [tasks, setTasks] = useState<CompanyMentorTaskRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const loadTasks = async () => {
    const remote = await fetchCompanyMentorTasksBackend();
    setTasks(remote);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadTasks();
      setLoading(false);
    };

    init();
  }, []);

  const handleVerify = async (taskId: string, status: 'Verified' | 'Correction Required') => {
    setReviewingId(taskId);
    await updateCompanyMentorTaskReviewBackend(taskId, status);
    await loadTasks();
    setReviewingId(null);
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Tasks & Deliverables Verification"
        description="Review submitted intern daily tasks, verify work proof, and log mentor approvals."
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by task title or intern name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => (
            <Card key={t.id} className="hover:border-slate-300 transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
                    <Badge variant={t.reviewStatus === 'Verified' ? 'emerald' : 'amber'}>
                      {t.reviewStatus}
                    </Badge>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{t.description}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span>Intern: <strong className="text-indigo-600 font-semibold">{t.studentName}</strong></span>
                    <span>•</span>
                    <span>Due: {t.dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {t.reviewStatus !== 'Verified' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerify(t.id, 'Verified')}
                      disabled={reviewingId === t.id}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Verify
                    </Button>
                  )}

                  {t.reviewStatus === 'Verified' && (
                    <div className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Task</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 italic">
              {loading ? 'Loading intern tasks...' : 'No intern tasks found for review.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
