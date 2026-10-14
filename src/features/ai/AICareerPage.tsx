import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Card, Badge, Button } from '@/components';
import {
  getCurrentUserBackend,
  fetchActiveStudentInternshipBackend,
  fetchStudentActiveInternshipMetricsBackend,
  fetchStudentEvaluationsBackend,
  fetchStudentMilestonesBackend,
  type AuthUser,
  type ActiveStudentInternshipRecord,
  type ActiveInternshipMetrics,
} from '@/services/api/backendService';
import {
  buildStudentCareerAnalysisInput,
  calculateCareerReadiness,
  type CareerReadinessResult,
} from './utils/careerMetrics';
import { requestAICareerAnalysis } from './services/aiCareerService';
import type { AICareerAnalysisResult, CareerAnalysisInput } from './types/aiCareer';
import { CareerReadinessCard } from './components/CareerReadinessCard';
import { AICareerAssistant } from './components/AICareerAssistant';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Brain,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Target,
  Edit3,
} from 'lucide-react';

/**
 * Sanitizes the AI summary text to ensure it renders as clean plain text
 * without raw JSON strings, brackets, or Markdown code fences.
 */
function cleanSummaryText(summary: string): string {
  if (!summary) return '';
  let text = summary.trim();

  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const inside = codeBlockMatch[1].trim();
    if (inside.startsWith('{') && inside.endsWith('}')) {
      try {
        const parsed = JSON.parse(inside);
        if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
          return cleanSummaryText(parsed.summary.trim());
        }
      } catch {
        // Not JSON
      }
    }
    text = inside;
  }

  // 2. If summary is a raw JSON string e.g. {"summary": "..."}
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
        return cleanSummaryText(parsed.summary.trim());
      }
    } catch {
      // Continue
    }
  }

  // 3. Clean any remaining code fence artifacts and markdown markers
  return text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
}

export const AICareerPage: React.FC = () => {
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activeInternship, setActiveInternship] = useState<ActiveStudentInternshipRecord | null>(null);
  const [studentInput, setStudentInput] = useState<CareerAnalysisInput | null>(null);
  const [readiness, setReadiness] = useState<CareerReadinessResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [targetCareer, setTargetCareer] = useState<string>('Full Stack Software Engineer');
  const [isEditingCareer, setIsEditingCareer] = useState<boolean>(false);
  const [customCareerInput, setCustomCareerInput] = useState<string>('Full Stack Software Engineer');

  const [analysis, setAnalysis] = useState<AICareerAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStudentData = useCallback(async () => {
    setLoadingProfile(true);
    setValidationMessage(null);

    try {
      const [user, active, evaluations, milestones] = await Promise.all([
        getCurrentUserBackend().catch(() => null),
        fetchActiveStudentInternshipBackend().catch(() => null),
        fetchStudentEvaluationsBackend().catch(() => []),
        fetchStudentMilestonesBackend().catch(() => []),
      ]);

      setAuthUser(user);
      setActiveInternship(active);

      if (!user) {
        setValidationMessage('Authentication Required: Please sign in with an authenticated student account.');
        setStudentInput(null);
        setReadiness(null);
        return;
      }

      if (user.role !== 'student') {
        setValidationMessage('Access Restricted: AI Career Intelligence is tailored exclusively for enrolled student accounts.');
        setStudentInput(null);
        setReadiness(null);
        return;
      }

      if (!active) {
        setValidationMessage(
          'Active Internship Required: You are currently not enrolled in an active internship assignment. AI Career Intelligence requires verified internship performance data (such as attendance, task progression, and mentor evaluations) to generate your performance assessment and career readiness score.'
        );
        setStudentInput(null);
        setReadiness(null);
        return;
      }

      // Concurrently fetch real metrics for the active assignment
      let metrics: ActiveInternshipMetrics = {
        totalTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        totalHoursLogged: 0,
        currentWeekHours: 0,
        attendancePercentage: 0,
        attendanceHealthStatus: 'Good',
      };

      if (active.assignmentId) {
        try {
          metrics = await fetchStudentActiveInternshipMetricsBackend(active.assignmentId);
        } catch (e) {
          console.warn('[AICareerPage] Could not load live metrics:', e);
        }
      }

      const input = buildStudentCareerAnalysisInput({
        user: {
          fullName: user.fullName,
          studentProfile: user.studentProfile,
        },
        internship: {
          title: active.title,
          companyName: active.companyName,
          workMode: active.workMode,
          duration: active.duration,
        },
        metrics,
        evaluations,
        milestones,
        targetCareer,
      });

      setStudentInput(input);
      setReadiness(calculateCareerReadiness(input));
    } catch (err: any) {
      setValidationMessage(err?.message || 'Failed to load verified student profile data.');
      setStudentInput(null);
      setReadiness(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [targetCareer]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  const handleSaveCareer = () => {
    if (customCareerInput.trim()) {
      setTargetCareer(customCareerInput.trim());
      setIsEditingCareer(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!studentInput) {
      setErrorMessage(validationMessage || 'Student profile and internship data are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await requestAICareerAnalysis(studentInput);
      setAnalysis(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'AI analysis could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="AI & Career Intelligence"
        description="Understand your verified internship performance and get personalized career guidance."
        action={
          <div className="flex items-center space-x-2">
            <Badge variant="indigo" className="px-3 py-1 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> AI Intelligence Mode
            </Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunAnalysis}
              disabled={isLoading || !studentInput}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Run AI Analysis
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Loading Profile Skeleton */}
      {loadingProfile && (
        <Card>
          <div className="p-6 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading verified student profile & internship metrics...</p>
          </div>
        </Card>
      )}

      {/* Student Profile & Form Values Context Card */}
      {!loadingProfile && authUser && (
        <Card title="Student Performance & Career Profile" subtitle="Authoritative profile data used for AI Career Analysis">
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              {/* Authenticated Student Identity */}
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-medium text-[11px]">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Student Identity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{authUser.fullName}</span>
                  <Badge variant="emerald" className="text-[10px] py-0 px-1.5 font-bold">
                    <CheckCircle2 className="w-3 h-3 mr-0.5 inline" /> Verified
                  </Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {authUser.studentProfile?.course || 'Enrolled Student'} {authUser.studentProfile?.currentSemester ? `• ${authUser.studentProfile.currentSemester}` : ''}
                </p>
              </div>

              {/* Host Internship Assignment */}
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-medium text-[11px]">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Host Internship</span>
                </div>
                {activeInternship ? (
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{activeInternship.title}</span>
                    <p className="text-slate-600 font-medium text-[11px]">
                      {activeInternship.companyName} ({activeInternship.workMode || 'Remote'})
                    </p>
                  </div>
                ) : (
                  <Badge variant="rose" className="text-[10px]">
                    No Active Assignment
                  </Badge>
                )}
              </div>

              {/* Target Career Goal Form Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-slate-500 font-medium text-[11px]">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Target Career Goal</span>
                  </div>
                  {!isEditingCareer && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCareerInput(targetCareer);
                        setIsEditingCareer(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center"
                    >
                      <Edit3 className="w-3 h-3 mr-0.5" /> Edit
                    </button>
                  )}
                </div>

                {isEditingCareer ? (
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-900"
                      value={customCareerInput}
                      onChange={(e) => setCustomCareerInput(e.target.value)}
                      placeholder="e.g. Cloud Solutions Architect"
                    />
                    <Button variant="primary" size="sm" onClick={handleSaveCareer} className="py-1 px-2.5 text-xs">
                      Save
                    </Button>
                  </div>
                ) : (
                  <span className="font-bold text-indigo-950 text-sm block">{targetCareer}</span>
                )}
              </div>
            </div>

            {/* Verified Technical Skills */}
            {Array.isArray(authUser.studentProfile?.skills) && authUser.studentProfile.skills.length > 0 && (
              <div className="flex items-center flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Verified Technical Competencies:</span>
                {authUser.studentProfile.skills.map((skill: any, idx: number) => {
                  const label = typeof skill === 'string' ? skill : skill.name || String(skill);
                  return (
                    <Badge key={idx} variant="neutral" className="text-[10px]">
                      {label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Validation Warning Alert Card */}
      {!loadingProfile && validationMessage && (
        <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950 text-sm">Active Internship & Performance Data Required</h4>
              <p className="text-slate-700 leading-relaxed text-xs">{validationMessage}</p>
            </div>
          </div>
          <div className="pl-8 pt-1 flex items-center space-x-3">
            <Link to="/student/internships">
              <Button variant="primary" size="sm">
                Browse Available Internships
              </Button>
            </Link>
            <Link to="/student/profile">
              <Button variant="outline" size="sm">
                View My Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 2. Deterministic Career Readiness Card */}
      {readiness && <CareerReadinessCard readiness={readiness} />}

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
          <div className="pt-1">
            <Button variant="outline" size="sm" onClick={handleRunAnalysis}>
              Retry Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Loading State Skeleton */}
      {isLoading && (
        <Card>
          <div className="p-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Analyzing your internship performance...</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Evaluating student skills, attendance metrics, task progression, and mentor evaluations with Groq AI...
            </p>
          </div>
        </Card>
      )}

      {/* Initial State / CTA Banner */}
      {!analysis && !isLoading && !errorMessage && studentInput && (
        <Card>
          <div className="p-8 text-center space-y-3">
            <Brain className="w-10 h-10 text-indigo-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-base">Generate Personalized AI Career Insights</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Click <strong>"Start AI Career Analysis"</strong> to evaluate your verified internship milestones, attendance metrics, and mentor evaluations for <strong>{authUser?.fullName}</strong>.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleRunAnalysis}>
                <Sparkles className="w-4 h-4 mr-2" /> Start AI Career Analysis
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3. AI Analysis Results Section */}
      {analysis && !isLoading && (
        <div className="space-y-6">
          {/* AI Overview Summary Card */}
          <Card
            title="AI Career Summary"
            subtitle={`Generated from verified performance data ${analysis.timestamp ? `• Generated at ${analysis.timestamp}` : ''}`}
          >
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-sm">Executive Performance Assessment</span>
                  <Badge variant="indigo">Verified AI Analysis</Badge>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {cleanSummaryText(analysis.summary)}
                </p>
              </div>
            </div>
          </Card>

          {/* Strengths & Improvement Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <Card title="Identified Core Strengths" subtitle="Key competencies highlighted by verified performance data">
              <div className="space-y-2 text-xs">
                {Array.isArray(analysis.strengths) && analysis.strengths.map((str, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-emerald-950">{str}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Improvement Areas Card */}
            <Card title="Areas for Technical Growth" subtitle="Recommended focus areas to accelerate readiness">
              <div className="space-y-2 text-xs">
                {Array.isArray(analysis.improvementAreas) && analysis.improvementAreas.map((area, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg flex items-start space-x-2.5">
                    <TrendingUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-amber-950">{area}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Skill Gap Analysis Card */}
          <Card title="Skill Gap Analysis" subtitle="Targeted proficiencies for role advancement">
            <div className="space-y-3 text-xs">
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {Array.isArray(analysis.skillGaps) && analysis.skillGaps.map((sg, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{sg.skill}</span>
                        <Badge variant={sg.importance === 'High' ? 'rose' : sg.importance === 'Medium' ? 'amber' : 'neutral'}>
                          {sg.importance} Priority
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">{sg.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Career & Learning Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Career Recommendations */}
            <Card title="Career Path Matches" subtitle="Role recommendations based on skill profile">
              <div className="space-y-3 text-xs">
                {Array.isArray(analysis.careerRecommendations) && analysis.careerRecommendations.map((cr, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{cr.career}</span>
                      <Badge variant={cr.fit === 'High Fit' ? 'emerald' : 'indigo'}>{cr.fit}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">{cr.reason}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Learning Plan Recommendations */}
            <Card title="Targeted Learning Plan" subtitle="Key topics to study for milestone progression">
              <div className="space-y-3 text-xs">
                {Array.isArray(analysis.learningRecommendations) && analysis.learningRecommendations.map((lr, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{lr.topic}</span>
                      <Badge variant={lr.priority === 'High' ? 'indigo' : 'neutral'}>{lr.priority} Priority</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">{lr.reason}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Suggested Next Steps Card */}
          <Card title="Suggested Actionable Next Steps" subtitle="Recommended immediate sprint targets">
            <div className="space-y-2 text-xs">
              {Array.isArray(analysis.nextSteps) && analysis.nextSteps.map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-slate-800">{step}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 4. Interactive AI Career Assistant Component */}
      {studentInput && <AICareerAssistant input={studentInput} />}
    </div>
  );
};