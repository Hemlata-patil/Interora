import React, { useState } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components';
import { getNormalizedStudentInput, calculateCareerReadiness } from './utils/careerMetrics';
import { requestAICareerAnalysis } from './services/aiCareerService';
import type { AICareerAnalysisResult } from './types/aiCareer';
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
} from 'lucide-react';

export const AICareerPage: React.FC = () => {
  const studentInput = getNormalizedStudentInput();
  const readiness = calculateCareerReadiness(studentInput);

  const [analysis, setAnalysis] = useState<AICareerAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
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
        description="Understand your internship performance and get personalized career guidance."
        action={
          <div className="flex items-center space-x-2">
            <Badge variant="indigo" className="px-3 py-1 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> AI Preview Mode
            </Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunAnalysis}
              disabled={isLoading}
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

      {/* 2. Deterministic Career Readiness Card */}
      <CareerReadinessCard readiness={readiness} />

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
              Evaluating student skills, attendance metrics, task progression, and mentor evaluations with AI...
            </p>
          </div>
        </Card>
      )}

      {/* Initial State / CTA Banner */}
      {!analysis && !isLoading && !errorMessage && (
        <Card>
          <div className="p-8 text-center space-y-3">
            <Brain className="w-10 h-10 text-indigo-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-base">Generate Personalized AI Career Insights</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Click <strong>"Run AI Analysis"</strong> to analyze your performance metrics, milestone achievements, and mentor evaluation scores.
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
            subtitle={`Generated from your current internship data ${analysis.timestamp ? `â€¢ Generated at ${analysis.timestamp}` : ''}`}
          >
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-sm">Executive Performance Assessment</span>
                  <Badge variant="indigo">AI Preview</Badge>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">{analysis.summary}</p>
              </div>
            </div>
          </Card>

          {/* Strengths & Improvement Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <Card title="Identified Core Strengths" subtitle="Key competencies highlighted by performance data">
              <div className="space-y-2 text-xs">
                {analysis.strengths.map((str, idx) => (
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
                {analysis.improvementAreas.map((area, idx) => (
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
                {analysis.skillGaps.map((sg, idx) => (
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
                {analysis.careerRecommendations.map((cr, idx) => (
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
                {analysis.learningRecommendations.map((lr, idx) => (
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
              {analysis.nextSteps.map((step, idx) => (
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
      <AICareerAssistant input={studentInput} />
    </div>
  );
};