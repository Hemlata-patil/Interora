import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Badge, EmptyState, Button } from '@/components';
import { initialMockResources, mockStudentProfile, mockInterviewQuestions, mockRoadmapSteps } from './data/mockCareerResources';
import type { CareerResource } from './types/careerPrep';
import { calculatePreparationProgress, getRecommendedResources, getWhatShouldIPrepareNext } from './utils/careerPrepMetrics';
import { PreparationProgressCard } from './components/PreparationProgressCard';
import { ResourceCard } from './components/ResourceCard';
import { ResourceFilters } from './components/ResourceFilters';
import { WhatShouldIPrepareNext } from './components/WhatShouldIPrepareNext';
import { InterviewQuestionsPreview } from './components/InterviewQuestionsPreview';
import { PreparationRoadmap } from './components/PreparationRoadmap';
import { InternshipStory } from './components/InternshipStory';
import { InternshipSnapshot } from './components/InternshipSnapshot';
import { SkillsPreparationIndicators } from './components/SkillsPreparationIndicators';
import { Bookmark, Search, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CareerPrepPage: React.FC = () => {
  const [resources, setResources] = useState<CareerResource[]>(initialMockResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCareerRole, setSelectedCareerRole] = useState('All');

  // Derived unique topics and roles for filter dropdowns
  const availableTopics = useMemo(() => Array.from(new Set(resources.map((r) => r.topic))), [resources]);
  const availableCareerRoles = useMemo(
    () => Array.from(new Set(resources.flatMap((r) => r.careerRoles))),
    [resources]
  );

  // Deterministic Preparation Progress calculation
  const progressMetrics = useMemo(() => calculatePreparationProgress(resources), [resources]);

  // Deterministic Recommendations
  const recommendedItems = useMemo(
    () => getRecommendedResources(resources, mockStudentProfile).slice(0, 3),
    [resources]
  );

  // Deterministic "What Should I Prepare Next?" steps
  const nextSteps = useMemo(() => getWhatShouldIPrepareNext(resources, mockStudentProfile), [resources]);

  // Partially completed resources ("Continue Preparing")
  const continuePreparingResources = useMemo(
    () => resources.filter((r) => !r.completed && (r.progressPercent || 0) > 0),
    [resources]
  );

  // Saved resources list
  const savedResources = useMemo(() => resources.filter((r) => r.isSaved), [resources]);

  // Filtered resources list for browse section
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      // Search term filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesTopic = r.topic.toLowerCase().includes(q);
        const matchesSkill = r.skill.toLowerCase().includes(q);
        const matchesProvider = r.provider.toLowerCase().includes(q);
        const matchesTags = r.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesDesc && !matchesTopic && !matchesSkill && !matchesProvider && !matchesTags) {
          return false;
        }
      }

      if (selectedTopic !== 'All' && r.topic !== selectedTopic) return false;
      if (selectedType !== 'All' && r.type !== selectedType) return false;
      if (selectedDifficulty !== 'All' && r.difficulty !== selectedDifficulty) return false;
      if (selectedCareerRole !== 'All' && !r.careerRoles.includes(selectedCareerRole)) return false;

      return true;
    });
  }, [resources, searchQuery, selectedTopic, selectedType, selectedDifficulty, selectedCareerRole]);

  const handleToggleSave = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSaved: !r.isSaved } : r))
    );
  };

  const handleToggleComplete = (id: string) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              completed: !r.completed,
              progressPercent: !r.completed ? 100 : 0,
            }
          : r
      )
    );
  };

  const handleSelectCategoryFilter = (category: string) => {
    setSelectedTopic('All');
    setSearchQuery(category);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Career Prep"
        description="Turn your internship experience into interview confidence with personalized preparation resources and practice tools."
        action={
          <Badge variant="indigo" className="px-3 py-1 text-xs font-semibold">
            Target Role: {mockStudentProfile.targetCareerRole}
          </Badge>
        }
      />

      {/* 2. Top Banner: Turn Internship into Interview Confidence */}
      <div className="p-4 bg-indigo-900 text-white rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-300" />
          <h3 className="font-extrabold text-base">Turn Your Internship Experience Into Interview Confidence</h3>
        </div>
        <p className="text-xs text-indigo-100 leading-relaxed max-w-2xl">
          Based on your verified internship tasks, attendance consistency, and work log submissions, Interora structures your personalized interview preparation path.
        </p>
      </div>

      {/* 3. Internship Snapshot & Skills Preparation Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InternshipSnapshot />
        <SkillsPreparationIndicators profile={mockStudentProfile} />
      </div>

      {/* 4. Preparation Progress Card */}
      <PreparationProgressCard progress={progressMetrics} />

      {/* 5. Continue Preparing Section (if partial progress exists) */}
      {continuePreparingResources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Continue Preparing</h3>
            <Badge variant="amber">{continuePreparingResources.length} In Progress</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {continuePreparingResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onToggleSave={handleToggleSave}
                onToggleComplete={handleToggleComplete}
                recommendationReason={`${resource.progressPercent}% completed â€” Pick up where you left off`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. What Should I Prepare Next? Section */}
      <WhatShouldIPrepareNext steps={nextSteps} onSelectCategory={handleSelectCategoryFilter} />

      {/* 7. Recommended for You Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recommended for You</h3>
            <p className="text-xs text-slate-500">Resources selected based on your current skills, interests, and internship role.</p>
          </div>
          <Badge variant="indigo">Deterministic Recommendations</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedItems.map((item) => (
            <ResourceCard
              key={item.resource.id}
              resource={item.resource}
              onToggleSave={handleToggleSave}
              onToggleComplete={handleToggleComplete}
              recommendationReason={item.reason}
            />
          ))}
        </div>
      </div>

      {/* 8. Build Your Internship Story Component */}
      <InternshipStory />

      {/* 9. Interview Questions & Roadmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InterviewQuestionsPreview questions={mockInterviewQuestions} />
        <PreparationRoadmap steps={mockRoadmapSteps} />
      </div>

      {/* 10. Saved Resources Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Saved Resources</h3>
          <Badge variant="neutral">{savedResources.length} Saved</Badge>
        </div>

        {savedResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onToggleSave={handleToggleSave}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-6 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No saved resources yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Save resources here while browsing so you can quickly return to them later.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 11. Browse Resources Section with Search & Filters */}
      <div className="space-y-4 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Browse All Resources</h3>
            <p className="text-xs text-slate-500">Filter and search across all available preparation materials</p>
          </div>
          <Badge variant="neutral">{filteredResources.length} Found</Badge>
        </div>

        {/* Filters Panel */}
        <ResourceFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedCareerRole={selectedCareerRole}
          onCareerRoleChange={setSelectedCareerRole}
          topics={availableTopics}
          careerRoles={availableCareerRoles}
        />

        {/* Filtered Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onToggleSave={handleToggleSave}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Search className="w-6 h-6 text-slate-400" />}
              title="No resources found"
              description="No preparation resources match your current search query or active filter selections. Try adjusting your parameters."
            />
          </Card>
        )}
      </div>

      {/* 12. Bottom Navigation CTA to AI Career Analysis */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-sm sm:text-base">Want deeper career insights?</h4>
          <p className="text-xs text-slate-300">
            Use Interora's AI Career Analysis to explore your strengths, skill gaps, career paths, and AI readiness.
          </p>
        </div>
        <Link to="/student/ai-career" className="shrink-0">
          <Button variant="primary" size="md" className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <span>Open AI Career Analysis</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};