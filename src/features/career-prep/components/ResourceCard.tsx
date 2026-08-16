import React from 'react';
import { Card, Badge, Button } from '@/components';
import { Video, FileText, Globe, Bookmark, CheckCircle2, ExternalLink, Clock } from 'lucide-react';
import type { CareerResource } from '../types/careerPrep';

export interface ResourceCardProps {
  resource: CareerResource;
  onToggleSave: (id: string) => void;
  onToggleComplete: (id: string) => void;
  recommendationReason?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onToggleSave,
  onToggleComplete,
  recommendationReason,
}) => {
  const getTypeBadge = () => {
    switch (resource.type) {
      case 'VIDEO':
        return (
          <Badge variant="indigo" className="text-[10px] flex items-center space-x-1">
            <Video className="w-3 h-3 inline mr-1" /> Video
          </Badge>
        );
      case 'DOCUMENT':
        return (
          <Badge variant="emerald" className="text-[10px] flex items-center space-x-1">
            <FileText className="w-3 h-3 inline mr-1" /> Document
          </Badge>
        );
      case 'ARTICLE':
        return (
          <Badge variant="neutral" className="text-[10px] flex items-center space-x-1">
            <Globe className="w-3 h-3 inline mr-1" /> Article
          </Badge>
        );
    }
  };

  const getActionLabel = () => {
    switch (resource.type) {
      case 'VIDEO':
        return 'Watch Now â†’';
      case 'DOCUMENT':
        return 'Open Document â†’';
      case 'ARTICLE':
        return 'Read Article â†’';
    }
  };

  return (
    <Card className="hover:border-slate-300 transition-all flex flex-col justify-between h-full">
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeBadge()}
            <Badge variant={resource.difficulty === 'Beginner' ? 'emerald' : resource.difficulty === 'Intermediate' ? 'indigo' : 'amber'} className="text-[10px]">
              {resource.difficulty}
            </Badge>
          </div>
          <button
            onClick={() => onToggleSave(resource.id)}
            className={`p-1.5 rounded-md transition-colors ${
              resource.isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={resource.isSaved ? 'Unsave Resource' : 'Save Resource'}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">{resource.title}</h4>
          <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{resource.description}</p>
        </div>

        {/* Reason Banner if recommended */}
        {recommendationReason && (
          <div className="p-2 bg-indigo-50/60 border border-indigo-100 rounded-lg text-[10px] text-indigo-900 font-medium">
            ðŸ’¡ {recommendationReason}
          </div>
        )}

        {/* Meta Info */}
        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>{resource.provider}</span>
          {resource.duration && (
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 inline" /> {resource.duration}
            </span>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => onToggleComplete(resource.id)}
          className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center space-x-1 ${
            resource.completed
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{resource.completed ? 'Completed' : 'Mark Complete'}</span>
        </button>

        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="text-xs">
            {getActionLabel()}
          </Button>
        </a>
      </div>
    </Card>
  );
};