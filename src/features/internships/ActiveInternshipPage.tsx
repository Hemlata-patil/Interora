import React, { useState } from 'react';
import { PageHeader, Card, Badge, ProgressBar } from '@/components';
import { mockActiveInternshipData } from './data/mockActiveInternship';
import { CheckCircle2, Clock, User, Building2, ShieldCheck, MapPin, Calendar, Award } from 'lucide-react';

export const ActiveInternshipPage: React.FC = () => {
  const active = mockActiveInternshipData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Internship Workspace"
        description="Track your daily work progress, task milestones, and mentor feedback for your current enrollment."
        action={
          <Badge variant="emerald" className="px-3 py-1 text-xs font-semibold">
            Active Status
          </Badge>
        }
      />

      {/* Overview Card */}
      <Card title={active.internshipTitle} subtitle={active.companyName}>
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap gap-2">
            <Badge variant="indigo">{active.workMode}</Badge>
            <Badge variant="neutral">{active.duration}</Badge>
            <Badge variant="emerald">{active.stipend}</Badge>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Overall Program Completion</span>
              <span className="text-indigo-600">{active.progressPercentage}%</span>
            </div>
            <ProgressBar progress={active.progressPercentage} color="indigo" />
          </div>

          {/* Mentors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Faculty Mentor</span>
              <span className="font-bold text-slate-800 text-xs">{active.facultyMentor}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Industry Mentor</span>
              <span className="font-bold text-slate-800 text-xs">{active.industryMentor}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};