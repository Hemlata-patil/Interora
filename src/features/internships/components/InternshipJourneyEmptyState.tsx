import React from 'react';
import { Card, Button, EmptyState } from '@/components';
import { Briefcase, Compass, ArrowRight } from 'lucide-react';

export interface InternshipJourneyEmptyStateProps {
  onExploreClick: () => void;
}

export const InternshipJourneyEmptyState: React.FC<InternshipJourneyEmptyStateProps> = ({ onExploreClick }) => {
  return (
    <Card className="p-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <Briefcase className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">No Active Internship Selected Yet</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your live internship journey timeline, weekly progress tracker, and mentor feedback view will appear here once your application is accepted.
        </p>
        <Button variant="primary" size="md" onClick={onExploreClick} className="bg-indigo-600 text-white">
          <span>Explore Verified Internships</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </Card>
  );
};