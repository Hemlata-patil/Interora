import React from 'react';
import { Card, Button } from '@/components';
import { Briefcase, MessageCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface RestrictedFeatureGuardProps {
  title: string;
  description?: string;
}

export const RestrictedFeatureGuard: React.FC<RestrictedFeatureGuardProps> = ({
  title,
  description = 'This feature becomes available after you are selected for an active internship program.',
}) => {
  return (
    <Card className="p-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/student/chat">
            <Button variant="outline" size="sm">
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Talk to Faculty Mentor
            </Button>
          </Link>
          <Link to="/student/internships">
            <Button variant="primary" size="sm" className="bg-indigo-600 text-white">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              Explore Internships
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};