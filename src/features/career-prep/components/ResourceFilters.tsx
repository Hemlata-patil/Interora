import React from 'react';
import { Search } from 'lucide-react';

export interface ResourceFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTopic: string;
  onTopicChange: (t: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (d: string) => void;
  selectedCareerRole: string;
  onCareerRoleChange: (r: string) => void;
  topics: string[];
  careerRoles: string[];
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedTopic,
  onTopicChange,
  selectedType,
  onTypeChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedCareerRole,
  onCareerRoleChange,
  topics,
  careerRoles,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search interview resources by title, description, skill, topic, or tag..."
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Select Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resource Type</label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            <option value="VIDEO">Video</option>
            <option value="DOCUMENT">Document</option>
            <option value="ARTICLE">Article</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Career Role</label>
          <select
            value={selectedCareerRole}
            onChange={(e) => onCareerRoleChange(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Career Roles</option>
            {careerRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};