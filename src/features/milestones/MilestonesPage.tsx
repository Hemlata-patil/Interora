import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Badge, ProgressBar, StatCard, EmptyState } from '@/components';
import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import {
  initialMockMilestones,
  initialMockEvaluations,
  calculateMilestoneProgress,
  calculateOverallProgress,
  calculateOverallEvaluationScore,
  type MilestoneRecord,
  type EvaluationRecord,
} from './data/mockMilestones';
import { Compass, CheckCircle2, Clock, Calendar, Award, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MilestonesPage: React.FC = () => {
  const activeInternship = mockActiveInternshipData;
  const [milestones] = useState<MilestoneRecord[]>(initialMockMilestones);
  const [evaluations] = useState<EvaluationRecord[]>(initialMockEvaluations);

  const overallMetrics = useMemo(() => calculateOverallProgress(milestones), [milestones]);

  const currentMilestone = overallMetrics.currentMilestone;
  const upcomingMilestones = useMemo(() => milestones.filter((m) => m.status === 'upcoming'), [milestones]);

  if (!activeInternship) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Milestones & Evaluations"
          description="Track your internship progress, milestones, and performance evaluations."
        />
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Active Internship"
          description="You don't have an active internship enrolled. Browse verified opportunities to get started."
          action={
            <Link to="/student/internships">
              <span className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors">
                Browse Internships â†’
              </span>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Milestones & Evaluations"
        description="Track your internship progress, milestones, and performance evaluations."
      />

      {/* 2. Active Internship Context Banner Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">{activeInternship.internshipTitle}</h3>
              <Badge variant="emerald">Active Enrollment</Badge>
            </div>
            <p className="text-slate-600 font-semibold mt-0.5">
              {activeInternship.companyName} â€¢ <span className="text-slate-500 font-normal">{activeInternship.duration} ({activeInternship.workMode})</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">OVERALL INTERNSHIP COMPLETION</span>
              <span className="font-bold text-indigo-600 text-sm">{overallMetrics.overallPercentage}%</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">COMPLETED MILESTONES</span>
              <span className="font-bold text-slate-800 text-xs">{`${overallMetrics.completedCount} / ${overallMetrics.totalCount}`}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Stat Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Internship Completion"
          value={`${overallMetrics.overallPercentage}%`}
          icon={Award}
          description="Overall progress across all internship milestones."
        />
        <StatCard
          title="Current Milestone Progress"
          value={currentMilestone ? `${calculateMilestoneProgress(currentMilestone)}%` : 'Completed'}
          icon={Clock}
          description="Task completion within your current milestone."
        />
        <StatCard
          title="Milestones Completed"
          value={`${overallMetrics.completedCount} / ${overallMetrics.totalCount}`}
          icon={CheckCircle2}
          description="Verified completed program milestones."
        />
      </div>

      {/* 4. Current Milestone Highlight Card */}
      {currentMilestone && (
        <Card title="Current Active Milestone" subtitle={currentMilestone.phase}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">{currentMilestone.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{currentMilestone.description}</p>
              </div>
              <Badge variant="indigo">In Progress</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Current Milestone Progress</span>
                <span className="font-bold text-indigo-600 text-sm">{calculateMilestoneProgress(currentMilestone)}%</span>
              </div>
              <p className="text-[11px] text-slate-500">Task completion within your current milestone.</p>
              <ProgressBar progress={calculateMilestoneProgress(currentMilestone)} label="Task Completion" color="indigo" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">TASKS PROGRESS</span>
                <span className="font-bold text-slate-900">{`${currentMilestone.completedTasks} / ${currentMilestone.totalTasks} Tasks Completed`}</span>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
                <span className="text-amber-600 block text-[10px] uppercase font-semibold">DUE DATE</span>
                <span className="font-bold text-amber-800">{currentMilestone.dueDate}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">MENTOR</span>
                <span className="font-bold text-slate-900">{currentMilestone.mentorName}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 5. Milestone Journey Timeline */}
      <Card title="Milestone Journey Timeline" subtitle="Step-by-step progress through internship milestones">
        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {milestones.map((ms) => {
            const isCompleted = ms.status === 'completed';
            const isCurrent = ms.status === 'current';
            const progressVal = calculateMilestoneProgress(ms);

            return (
              <div key={ms.id} className="relative flex items-start space-x-4 pl-8">
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

                <div className="space-y-1 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-bold ${isCompleted ? 'text-slate-900' : isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {`${ms.phase}: ${ms.title}`}
                    </h4>
                    {isCompleted && <Badge variant="emerald">Completed ({ms.completedDate})</Badge>}
                    {isCurrent && <Badge variant="indigo">In Progress ({progressVal}%)</Badge>}
                    {ms.status === 'upcoming' && <Badge variant="neutral">Upcoming ({ms.startDate})</Badge>}
                  </div>
                  <p className="text-slate-500 text-[11px] leading-snug">{ms.description}</p>
                  <span className="text-[10px] text-slate-400 block">{`Tasks: ${ms.completedTasks} / ${ms.totalTasks} completed â€¢ Mentor: ${ms.mentorName}`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 6. Upcoming Milestones List */}
      <Card title="Upcoming Milestones" subtitle="Scheduled future project checkpoints">
        {upcomingMilestones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingMilestones.map((ms) => (
              <div key={ms.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{ms.title}</span>
                  <Badge variant="neutral">{ms.phase}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{ms.description}</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Start: {ms.startDate}</span>
                  <span>Target Due: {ms.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">All milestones completed!</p>
        )}
      </Card>

      {/* 7. Performance Evaluations Section */}
      <div className="space-y-4 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Performance Evaluations</h3>
            <p className="text-xs text-slate-500">Official mentor reviews and performance scores</p>
          </div>
          <Badge variant="indigo">Read-Only View</Badge>
        </div>

        <div className="space-y-6">
          {evaluations.map((evalRecord) => {
            const isDone = evalRecord.status === 'completed';
            const overallScore = calculateOverallEvaluationScore(evalRecord);

            return (
              <Card key={evalRecord.id} title={evalRecord.title} subtitle={evalRecord.type}>
                {isDone ? (
                  <div className="space-y-5 text-xs">
                    {/* Top Score Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                      <div>
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <span className="font-bold text-emerald-900 text-sm">Mentor Evaluation Score</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">{`Evaluated by ${evalRecord.evaluatorName} (${evalRecord.evaluatorRole}) on ${evalRecord.evaluationDate}`}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">MENTOR EVALUATION SCORE</span>
                        <span className="text-2xl font-extrabold text-emerald-700">{`${overallScore} / 10`}</span>
                        <span className="text-[10px] text-slate-500 block">Performance rating given by your mentor.</span>
                      </div>
                    </div>

                    {/* Criteria Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">TECHNICAL SKILLS</span>
                        <span className="text-base font-bold text-slate-800">{`${evalRecord.technicalSkills} / 10`}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">PROBLEM SOLVING</span>
                        <span className="text-base font-bold text-slate-800">{`${evalRecord.problemSolving} / 10`}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">COMMUNICATION</span>
                        <span className="text-base font-bold text-slate-800">{`${evalRecord.communication} / 10`}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">PROFESSIONALISM</span>
                        <span className="text-base font-bold text-slate-800">{`${evalRecord.professionalism} / 10`}</span>
                      </div>
                    </div>

                    {/* Feedback & Qualitative Notes */}
                    <div className="space-y-3 pt-2">
                      <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                        <span className="font-bold text-slate-900 block">Mentor Feedback Summary</span>
                        <p className="text-slate-700 leading-relaxed">{evalRecord.feedback}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-lg space-y-1.5">
                          <span className="font-bold text-emerald-900 block text-[11px] uppercase">Identified Strengths</span>
                          <ul className="space-y-1 text-[11px] text-emerald-800 list-disc list-inside">
                            {evalRecord.strengths?.map((str, idx) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-lg space-y-1.5">
                          <span className="font-bold text-amber-900 block text-[11px] uppercase">Areas for Improvement</span>
                          <ul className="space-y-1 text-[11px] text-amber-800 list-disc list-inside">
                            {evalRecord.areasForImprovement?.map((area, idx) => (
                              <li key={idx}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upcoming Evaluation State */
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">Evaluation Pending</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Your final internship evaluation will be conducted by your industry mentor at the conclusion of your internship program.
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};