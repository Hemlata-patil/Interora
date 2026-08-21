import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/components';
import { initialMockInternships } from '@/features/internships/data/mockInternships';
import { calculateInternshipCountdown } from '@/features/internships/utils/internshipCountdown';
import { Clock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const InternshipDeadlinesDashboardCard: React.FC = () => {
  // Filter active (non-expired) internships sorted by nearest deadline first
  const activeOpportunities = useMemo(() => {
    return initialMockInternships
      .map((item) => ({
        ...item,
        countdown: calculateInternshipCountdown(item.deadline),
      }))
      .filter((item) => item.countdown.status !== 'EXPIRED' && item.countdown.status !== 'UNAVAILABLE')
      .sort((a, b) => a.countdown.totalMilliseconds - b.countdown.totalMilliseconds)
      .slice(0, 3);
  }, []);

  return (
    <Card
      title="Internship Application Deadlines"
      subtitle="Priority countdown for opportunities closing soon"
      action={
        <Link to="/student/internships">
          <Button variant="outline" size="sm">
            View All â†’
          </Button>
        </Link>
      }
    >
      <div className="space-y-3 text-xs">
        {activeOpportunities.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {activeOpportunities.map((op) => (
              <div key={op.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 truncate">{op.title}</h4>
                    <Badge variant={op.countdown.badgeVariant} className="text-[9px]">
                      {op.countdown.statusLabel}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-semibold">{op.companyName} â€¢ {op.location}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="font-bold text-slate-800 text-[11px] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 inline mr-1" />
                    {op.countdown.formattedCountdown}
                  </span>
                  <Link to={`/student/internships/${op.id}`}>
                    <Button variant="primary" size="sm" className="text-[11px] px-2.5 py-1">
                      Apply
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-800">No urgent deadlines closing soon</p>
            <p className="text-[11px] text-slate-400">Check back regularly for newly posted internship opportunities.</p>
          </div>
        )}
      </div>
    </Card>
  );
};