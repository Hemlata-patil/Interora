import React, { useState } from 'react';
import { PageHeader, Card, Badge, ProgressBar, Button, EmptyState } from '@/components';
import { mockActiveInternshipData, type ActiveInternshipDetails } from './data/mockActiveInternship';
import { Compass, Calendar, Clock, MapPin, UserCheck, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActiveInternshipPage: React.FC = () => {
  const [activeData] = useState<ActiveInternshipDetails | null>(mockActiveInternshipData);

  if (!activeData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Internship"
          description="Track your current internship and stay updated on your progress."
        />
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Active Internship Yet"
          description="You are currently not enrolled in an active internship. Browse open opportunities and apply."
          action={
            <Link to="/student/internships">
              <Button variant="primary" size="sm">
                Browse Internships
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="My Internship"
        description="Track your current active internship, mentor details, and progression journey."
        action={<Badge variant="emerald" className="px-3 py-1 text-xs font-semibold">Active Enrollment</Badge>}
      />

      {/* 2. Overview Banner Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">{activeData.internshipTitle}</h2>
                <Badge variant="emerald">Active</Badge>
              </div>
              <p className="text-sm font-semibold text-indigo-600 mt-0.5">{activeData.companyName}</p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <Badge variant={activeData.workMode === 'Remote' ? 'emerald' : activeData.workMode === 'Hybrid' ? 'indigo' : 'neutral'}>
                {activeData.workMode}
              </Badge>
              <Badge variant="neutral">{activeData.internshipType}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">LOCATION</span>
              <span className="font-semibold text-slate-800">{activeData.location}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">DURATION</span>
              <span className="font-semibold text-slate-800">{activeData.duration}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">START DATE</span>
              <span className="font-semibold text-slate-800">{activeData.startDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">END DATE</span>
              <span className="font-semibold text-slate-800">{activeData.endDate}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Progress & Journey) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Section */}
          <Card title="Internship Completion Progress">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Overall Progress</span>
                <span className="font-bold text-indigo-600 text-sm">{activeData.progressPercentage}%</span>
              </div>
              <ProgressBar progress={activeData.progressPercentage} label="Milestone Progression" color="indigo" />

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Current Phase</span>
                  <span className="font-bold text-slate-800 leading-tight block mt-0.5">{activeData.currentPhase}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Completed Milestones</span>
                  <span className="font-bold text-slate-800 text-sm block mt-0.5">{`${activeData.completedMilestones} / ${activeData.totalMilestones} Milestones`}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Journey Section */}
          <Card title="Internship Journey & Phases" subtitle="Structured phases for host internship program">
            <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activeData.journeyPhases.map((phase, idx) => {
                const isCompleted = phase.status === 'completed';
                const isCurrent = phase.status === 'current';

                return (
                  <div key={idx} className="relative flex items-start space-x-4 pl-8">
                    <div
                      className={`absolute left-1.5 top-0.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        isCompleted
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : isCurrent
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold ${isCompleted ? 'text-slate-900' : isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {phase.title}
                        </h4>
                        {isCurrent && <Badge variant="indigo" className="text-[10px] py-0 px-1.5">Current Phase</Badge>}
                      </div>
                      <p className="text-slate-500 text-[11px] leading-snug">{phase.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column (Current Focus & Mentor Contact) */}
        <div className="space-y-6">
          {/* Current Focus Card */}
          <Card title="Current Focus">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Target Milestone</span>
                <p className="font-bold text-slate-800 leading-snug">{activeData.nextMilestone}</p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg text-amber-800 flex items-center justify-between">
                <span className="text-[11px] font-medium">Target Due Date</span>
                <span className="font-bold text-xs">{activeData.nextMilestoneDate}</span>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full text-slate-400 border-slate-200 cursor-not-allowed" disabled>
                  View Milestones <span className="text-[10px] font-normal ml-1">(Coming in Phase 5)</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Mentor Information Card */}
          <Card title="Host Mentor Details">
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center shrink-0 text-sm">
                  {activeData.mentorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{activeData.mentorName}</h4>
                  <p className="text-[11px] text-slate-500">{activeData.mentorRole}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium truncate">{activeData.mentorEmail}</span>
              </div>

              <a href={`mailto:${activeData.mentorEmail}`} className="block w-full">
                <Button variant="secondary" className="w-full">
                  <Mail className="w-4 h-4 mr-1.5" /> Contact Mentor
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};