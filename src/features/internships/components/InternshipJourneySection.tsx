import React, { useState } from 'react';
import { Card, Badge, ProgressBar } from '@/components';
import { calculateJourneyMetrics, generateWeeklyTimeline } from '../utils/journeyUtils';
import { mockActiveInternshipsList, type ActiveInternshipDetails } from '../data/mockActiveInternship';
import { Calendar, CheckCircle2, Clock, User, Award, ShieldCheck, Flag, Sparkles, ChevronDown } from 'lucide-react';

export interface InternshipJourneySectionProps {
  onExploreClick?: () => void;
}

export const InternshipJourneySection: React.FC<InternshipJourneySectionProps> = ({ onExploreClick }) => {
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>(mockActiveInternshipsList[0].id || 'int_01');

  const active: ActiveInternshipDetails =
    mockActiveInternshipsList.find((i) => i.id === selectedInternshipId) || mockActiveInternshipsList[0];

  // Calculate dynamic metrics
  const metrics = calculateJourneyMetrics(active.startDate, active.endDate);
  const weeklyTimeline = generateWeeklyTimeline(active.startDate, active.endDate);

  return (
    <div className="space-y-6">
      {/* 1. Header & Selector Banner */}
      <div className="p-4 bg-indigo-900 text-white rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <h3 className="font-extrabold text-base">My Internship Journey</h3>
          </div>

          {/* Internship Selector for Multiple Active Enrollments */}
          {mockActiveInternshipsList.length > 1 && (
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <span className="text-indigo-200 text-[10px] font-bold uppercase">Active Internship:</span>
              <select
                value={selectedInternshipId}
                onChange={(e) => setSelectedInternshipId(e.target.value)}
                className="bg-transparent text-white font-bold outline-hidden cursor-pointer"
              >
                {mockActiveInternshipsList.map((item) => (
                  <option key={item.id} value={item.id} className="text-slate-900 font-normal">
                    {item.companyName} ({item.workMode})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <p className="text-xs text-indigo-100 leading-relaxed max-w-2xl">
          Track your live enrollment timeline, progress percentages, milestone achievements, and key evaluation dates.
        </p>
      </div>

      {/* 2. Top Stats Overview & Mentor Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <Card title={active.internshipTitle} subtitle={active.companyName} className="lg:col-span-2">
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-2">
              <Badge variant="indigo">{active.workMode}</Badge>
              <Badge variant="neutral">{active.duration}</Badge>
              <Badge variant="emerald">{active.stipend}</Badge>
              <Badge variant="emerald">Active Status</Badge>
            </div>

            {/* Dynamic Progress Box */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>{metrics.statusText}</span>
                <span className="text-indigo-600 font-extrabold text-sm">{metrics.progressPercentage}%</span>
              </div>
              <ProgressBar progress={metrics.progressPercentage} color="indigo" />
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>{metrics.daysCompleted} days completed</span>
                <span>{metrics.daysRemaining} days remaining</span>
              </div>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Start Date</span>
                <span className="font-bold text-slate-800">{active.startDate}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">End Date</span>
                <span className="font-bold text-slate-800">{active.endDate}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Assigned Mentor Card */}
        <Card title="Assigned Industry Mentor" subtitle="Guidance & performance review">
          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {active.companyInitials || 'IM'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{active.mentorName || active.industryMentor}</h4>
                <p className="text-[11px] text-slate-500">{active.mentorRole || 'Technical Mentor'}</p>
                <span className="text-[10px] text-emerald-600 font-semibold inline-block mt-0.5">â— Available for guidance</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-900 block uppercase">Faculty Academic Supervisor</span>
              <span className="font-bold text-slate-800 block text-xs">{active.facultyMentor}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Internship Calendar & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Timeline */}
        <Card title="Weekly Internship Timeline" subtitle="Milestones derived from internship duration">
          <div className="space-y-3 text-xs max-h-[380px] overflow-y-auto pr-1">
            {weeklyTimeline.map((step) => (
              <div
                key={step.weekNumber}
                className={`p-3 border rounded-xl flex items-center justify-between gap-3 ${
                  step.status === 'COMPLETED'
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : step.status === 'CURRENT'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-950 font-semibold'
                    : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                      step.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : step.status === 'CURRENT'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step.weekNumber}
                  </div>
                  <div>
                    <span className="block text-xs font-bold">{`Week ${step.weekNumber}: ${step.title}`}</span>
                  </div>
                </div>

                {step.status === 'COMPLETED' && <Badge variant="emerald">âœ“ Completed</Badge>}
                {step.status === 'CURRENT' && <Badge variant="indigo">Current Phase</Badge>}
                {step.status === 'UPCOMING' && <Badge variant="neutral">Upcoming</Badge>}
              </div>
            ))}
          </div>
        </Card>

        {/* Important Dates & Key Milestones */}
        <Card title="Important Evaluation Dates" subtitle="Scheduled internship milestones and reviews">
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-800">
                <span>ðŸ“Œ Project Assignment & Architecture Setup</span>
                <Badge variant="emerald">Aug 10, 2026</Badge>
              </div>
              <p className="text-slate-500 text-[11px]">Initial codebase setup and sprint planning with mentor.</p>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-900">
                <span>ðŸ‘¨â€ðŸ« Mid-Internship Review & Feedback</span>
                <Badge variant="indigo">Sep 30, 2026</Badge>
              </div>
              <p className="text-slate-600 text-[11px]">Faculty & Industry evaluation of sprint deliverables.</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-800">
                <span>ðŸŽ¯ Final Technical Project Demonstration</span>
                <Badge variant="neutral">Oct 25, 2026</Badge>
              </div>
              <p className="text-slate-500 text-[11px]">Final code submission and presentation to host company.</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-800">
                <span>ðŸŽ“ Internship Completion & Certificate</span>
                <Badge variant="neutral">Oct 31, 2026</Badge>
              </div>
              <p className="text-slate-500 text-[11px]">Issuance of verified certificate of completion.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};