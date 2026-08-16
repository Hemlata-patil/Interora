import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components';
import { BookOpen, Save, Trash2, CheckCircle2 } from 'lucide-react';

export interface InternshipStoryData {
  problemSolved: string;
  roleDescription: string;
  technologiesUsed: string;
  biggestChallenge: string;
  howSolved: string;
  keyLearnings: string;
  topAchievement: string;
  futureImprovements: string;
}

const STORAGE_KEY = 'interora_student_internship_story';

const initialStory: InternshipStoryData = {
  problemSolved: 'Streamlined frontend user interface rendering and dynamic task state transitions for interns.',
  roleDescription: 'Frontend React Development Intern responsible for component architecture and TypeScript contracts.',
  technologiesUsed: 'React.js, TypeScript, Tailwind CSS, Vite, Git, REST APIs',
  biggestChallenge: 'Managing complex asynchronous state updates without re-rendering parent container layouts.',
  howSolved: 'Implemented local component state encapsulation, custom memo hooks, and clean TypeScript interfaces.',
  keyLearnings: 'Gained hands-on experience in component design systems, modular state patterns, and team Git workflows.',
  topAchievement: 'Built and verified 100% type-safe student workflow modules with 0 build errors.',
  futureImprovements: 'Incorporate automated component integration testing with React Testing Library.',
};

export const InternshipStory: React.FC = () => {
  const [story, setStory] = useState<InternshipStoryData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialStory;
      }
    }
    return initialStory;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof InternshipStoryData, value: string) => {
    setStory((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(story));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStory({
      problemSolved: '',
      roleDescription: '',
      technologiesUsed: '',
      biggestChallenge: '',
      howSolved: '',
      keyLearnings: '',
      topAchievement: '',
      futureImprovements: '',
    });
  };

  return (
    <Card
      title="Build Your Internship Story"
      subtitle="Craft structured responses for interview questions about your internship experience"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
          <p className="text-slate-700 leading-relaxed text-[11px]">
            ðŸ’¡ <strong>Interview Tip:</strong> Practice articulating these key prompts. Recruiters and technical managers ask these exact questions to evaluate your problem-solving process.
          </p>
          {savedSuccess && (
            <Badge variant="emerald" className="shrink-0 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Saved Locally
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-800 text-[11px] block">1. What problem did you work on?</label>
            <textarea
              rows={2}
              value={story.problemSolved}
              onChange={(e) => handleChange('problemSolved', e.target.value)}
              placeholder="Describe the main business or technical problem..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 text-[11px] block">2. What was your specific role?</label>
            <textarea
              rows={2}
              value={story.roleDescription}
              onChange={(e) => handleChange('roleDescription', e.target.value)}
              placeholder="Detail your personal responsibilities..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 text-[11px] block">3. Which technologies did you use?</label>
            <textarea
              rows={2}
              value={story.technologiesUsed}
              onChange={(e) => handleChange('technologiesUsed', e.target.value)}
              placeholder="List languages, frameworks, tools..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 text-[11px] block">4. What was your biggest challenge?</label>
            <textarea
              rows={2}
              value={story.biggestChallenge}
              onChange={(e) => handleChange('biggestChallenge', e.target.value)}
              placeholder="Explain the hardest technical obstacle..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 text-[11px] block">5. How did you solve it?</label>
            <textarea
              rows={2}
              value={story.howSolved}
              onChange={(e) => handleChange('howSolved', e.target.value)}
              placeholder="Step-by-step technical resolution..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 text-[11px] block">6. What was your top achievement?</label>
            <textarea
              rows={2}
              value={story.topAchievement}
              onChange={(e) => handleChange('topAchievement', e.target.value)}
              placeholder="Measurable result or milestone delivered..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleClear} className="text-slate-500">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Answers
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5 mr-1" /> Save My Answers
          </Button>
        </div>
      </div>
    </Card>
  );
};