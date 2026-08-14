import React from 'react';
import { Input } from '@/components';
import { Search } from 'lucide-react';

export interface InternshipSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const InternshipSearch: React.FC<InternshipSearchProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <Input
        placeholder="Search by internship title, company name, or required skill (e.g. React, Node, TechCorp)..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};