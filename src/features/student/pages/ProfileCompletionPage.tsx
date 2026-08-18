import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '@/components';
import type { StudentProfileData } from '../../auth/types/auth';
import { calculateProfileCompletion, initialStudentProfileState } from '../utils/profileCompletionUtils';
import { ProfilePhotoUploader } from '../components/ProfilePhotoUploader';
import { CheckCircle2, User, GraduationCap, Target, Globe, FileText, ArrowRight, Save, Upload, Trash2 } from 'lucide-react';

export const ProfileCompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfileData>(() => {
    const saved = localStorage.getItem('interora_student_profile_completion');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialStudentProfileState;
      }
    }
    return initialStudentProfileState;
  });

  const [activeTab, setActiveTab] = useState<'info' | 'education' | 'career' | 'links' | 'resume' | 'review'>('info');

  const metrics = useMemo(() => calculateProfileCompletion(profile), [profile]);

  const handleChange = (field: keyof StudentProfileData, value: any) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    localStorage.setItem('interora_student_profile_completion', JSON.stringify(updated));
  };

  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      alert('Please upload a PDF or Word document (.doc, .docx).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Resume file size exceeds 10 MB limit.');
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const lastModifiedFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    handleChange('resumeName', file.name);
    handleChange('resumeSizeFormatted', sizeFormatted);
    handleChange('resumeLastModified', lastModifiedFormatted);
  };

  const handleRemoveResume = () => {
    handleChange('resumeName', '');
    handleChange('resumeSizeFormatted', '');
    handleChange('resumeLastModified', '');
  };

  const handleFinish = () => {
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Title & Completion Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">Student Profile Completion</h1>
                <Badge variant="indigo">Step-by-Step Onboarding</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Complete your profile to get personalized internship, career, and mentor recommendations.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {metrics.percentage}%
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Profile Strength</span>
                <span className="text-[10px] text-slate-400">{metrics.completedWeight} / 100 Points</span>
              </div>
            </div>
          </div>

          <ProgressBar progress={metrics.percentage} color="indigo" />
        </div>

        {/* Tab Navigation Steps */}
        <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-2 rounded-lg transition-all shrink-0 ${
              activeTab === 'info' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Personal Info
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 py-2 rounded-lg transition-all shrink-0 ${
              activeTab === 'education' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Education
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`px-3 py-2 rounded-lg transition-all shrink-0 ${
              activeTab === 'career' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. Career Direction
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-3 py-2 rounded-lg transition-all shrink-0 ${
              activeTab === 'links' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Links & Socials
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-2 rounded-lg transition-all shrink-0 ${
              activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            5. Resume Upload
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-2 rounded-lg transition-all shrink-0 ${
              activeTab === 'review' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            6. Final Review
          </button>
        </div>

        {/* Tab Content Panels */}
        <Card>
          {activeTab === 'info' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Step 1: Personal Information</h3>

              <ProfilePhotoUploader
                photoUrl={profile.profilePhotoUrl}
                onPhotoChange={(url) => handleChange('profilePhotoUrl', url)}
                onPhotoRemove={() => handleChange('profilePhotoUrl', '')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Student Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-800 text-[11px] block">Mobile Number</label>
                  <input
                    type="tel"
                    value={profile.mobileNumber}
                    onChange={(e) => handleChange('mobileNumber', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => setActiveTab('education')}>
                  Next: Education â†’
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Step 2: Educational Background</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-800 text-[11px] block">College / University Name</label>
                  <input
                    type="text"
                    value={profile.collegeName}
                    onChange={(e) => handleChange('collegeName', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Degree</label>
                  <input
                    type="text"
                    value={profile.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Branch / Specialization</label>
                  <input
                    type="text"
                    value={profile.branch}
                    onChange={(e) => handleChange('branch', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Current Year</label>
                  <select
                    value={profile.currentYear}
                    onChange={(e) => handleChange('currentYear', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Graduation Year</label>
                  <input
                    type="text"
                    value={profile.graduationYear}
                    onChange={(e) => handleChange('graduationYear', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('info')}>
                  â† Back
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveTab('career')}>
                  Next: Career Direction â†’
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Step 3: Career Direction & Skills</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Target Career Role</label>
                  <input
                    type="text"
                    value={profile.targetRole}
                    onChange={(e) => handleChange('targetRole', e.target.value)}
                    placeholder="e.g. Full Stack Software Developer, AI Engineer"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Technical Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={profile.skills.join(', ')}
                    onChange={(e) =>
                      handleChange(
                        'skills',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="React.js, TypeScript, SQL, Python"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Preferred Internship Domain</label>
                  <input
                    type="text"
                    value={profile.preferredDomain}
                    onChange={(e) => handleChange('preferredDomain', e.target.value)}
                    placeholder="e.g. Web Product Development, Data Analytics"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('education')}>
                  â† Back
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveTab('links')}>
                  Next: Links & Socials â†’
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Step 4: Professional Presence</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={profile.githubUrl}
                    onChange={(e) => handleChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px] block">Portfolio / Personal Website</label>
                  <input
                    type="url"
                    value={profile.portfolioUrl}
                    onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('career')}>
                  â† Back
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveTab('resume')}>
                  Next: Resume Upload â†’
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Step 5: Resume Upload</h3>
              
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-3 bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Upload Student Resume</h4>
                  <p className="text-[10px] text-slate-400">PDF, DOC, or DOCX formats supported (Max 10 MB)</p>
                </div>

                {profile.resumeName ? (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg max-w-sm mx-auto flex items-center justify-between">
                    <div className="text-left">
                      <span className="font-bold text-slate-800 block truncate">{profile.resumeName}</span>
                      <span className="text-[10px] text-slate-400">{profile.resumeSizeFormatted} â€¢ {profile.resumeLastModified}</span>
                    </div>
                    <button onClick={handleRemoveResume} className="text-rose-500 hover:text-rose-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer inline-flex items-center space-x-1.5 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select Resume File</span>
                      <input type="file" onChange={handleResumeFileSelect} accept=".pdf,.doc,.docx" className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('links')}>
                  â† Back
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveTab('review')} className="bg-emerald-600 hover:bg-emerald-700">
                  Proceed to Final Review â†’
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Step 6: Profile Summary & Final Review</h3>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center overflow-hidden shrink-0">
                      {profile.profilePhotoUrl ? (
                        <img src={profile.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile.fullName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{profile.fullName}</h4>
                      <p className="text-slate-500 text-[11px]">{profile.degree} â€¢ {profile.branch}</p>
                    </div>
                  </div>
                  <Badge variant="emerald" className="px-3 py-1">
                    {metrics.percentage}% Complete
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div><strong>Email:</strong> {profile.email}</div>
                  <div><strong>Mobile:</strong> {profile.mobileNumber}</div>
                  <div><strong>College:</strong> {profile.collegeName}</div>
                  <div><strong>Target Role:</strong> {profile.targetRole}</div>
                  <div><strong>LinkedIn:</strong> {profile.linkedinUrl || 'Not provided'}</div>
                  <div><strong>GitHub:</strong> {profile.githubUrl || 'Not provided'}</div>
                  <div><strong>Resume:</strong> {profile.resumeName || 'Not uploaded'}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('resume')}>
                  â† Back to Resume
                </Button>
                <Button variant="primary" size="md" onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <span>Complete Profile & Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};