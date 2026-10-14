import React, { useState, useEffect, useRef } from 'react';
import { PageHeader, Card, Badge, Button, Input, Select, Alert, ProgressBar } from '@/components';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Award,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  Upload,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Target,
  ListChecks,
  Lightbulb,
  TrendingUp,
  Info
} from 'lucide-react';
import {
  getCurrentUserBackend,
  uploadStudentResumeBackend,
  updateStudentProfileBackend,
  analyzeStudentResumeBackend,
  fetchStudentResumeAnalysisBackend,
  type ResumeAnalysisResult,
} from '@/services/api/backendService';

export interface StudentSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface StudentProfileData {
  fullName: string;
  email: string;
  phone: string;
  rollNo: string;
  department: string;
  institution: string;
  degree: string;
  yearSemester: string;
  cgpa: string;
  resumeHeadline: string;
  resumeFileName: string;
  skills: StudentSkill[];
  interests: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  availability: string;
}

export function formatDisplayResumeName(rawUrlOrFilename?: string | null): string {
  if (!rawUrlOrFilename) return 'Resume_Uploaded.pdf';
  const base = rawUrlOrFilename.split('/').pop() || rawUrlOrFilename;
  return base.replace(/^[0-9a-fA-F-]{36}_\d+_/, '') || base;
}

export const defaultStudentProfile: StudentProfileData = {
  fullName: 'Rohan Mehta',
  email: 'rohan.mehta@college.edu',
  phone: '+91 98765 43210',
  rollNo: 'CS2026-089',
  department: 'Computer Science & Engineering',
  institution: 'Indian Institute of Information Technology',
  degree: 'B.Tech in Computer Science',
  yearSemester: '3rd Year / 6th Semester',
  cgpa: '8.5 / 10.0',
  resumeHeadline: 'Motivated Full Stack Developer seeking internship opportunities.',
  resumeFileName: 'Resume_Verified.pdf',
  skills: [
    { id: 'sk_1', name: 'React', level: 'advanced' },
    { id: 'sk_2', name: 'TypeScript', level: 'intermediate' },
    { id: 'sk_3', name: 'Node.js', level: 'intermediate' },
    { id: 'sk_4', name: 'Python', level: 'advanced' },
    { id: 'sk_5', name: 'SQL', level: 'intermediate' },
  ],
  interests: ['Cloud Computing', 'Full Stack Development', 'AI / ML Solutions'],
  preferredRoles: ['Software Engineer', 'Full Stack Developer', 'Cloud Engineer'],
  preferredLocations: ['Pune', 'Bangalore', 'Remote'],
  availability: 'Immediate (Full-Time)',
};

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData>(defaultStudentProfile);
  const [formData, setFormData] = useState<StudentProfileData>(defaultStudentProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Resume Upload State
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Resume Analyzer State
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeAnalysisError, setResumeAnalysisError] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');

  // Skill state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUserBackend();
      if (!user) {
        setLoading(false);
        return;
      }

      const sp = user.studentProfile;
      let mappedSkills: StudentSkill[] = defaultStudentProfile.skills;
      if (Array.isArray(sp?.skills) && sp.skills.length > 0) {
        mappedSkills = sp.skills.map((s: any, idx: number) => {
          if (typeof s === 'string') {
            return { id: `sk_${idx}`, name: s, level: 'intermediate' as const };
          }
          return {
            id: s.id || `sk_${idx}`,
            name: s.name || String(s),
            level: s.level || 'intermediate',
          };
        });
      }

      const mergedProfile: StudentProfileData = {
        fullName: user.fullName || defaultStudentProfile.fullName,
        email: user.email || defaultStudentProfile.email,
        phone: user.phone || defaultStudentProfile.phone,
        rollNo: sp?.studentId || defaultStudentProfile.rollNo,
        department: defaultStudentProfile.department,
        institution: defaultStudentProfile.institution,
        degree: sp?.course || defaultStudentProfile.degree,
        yearSemester: sp?.currentSemester ? `Semester ${sp.currentSemester}` : defaultStudentProfile.yearSemester,
        cgpa: sp?.cgpa ? `${sp.cgpa} / 10.0` : defaultStudentProfile.cgpa,
        resumeHeadline: defaultStudentProfile.resumeHeadline,
        resumeFileName: sp?.resumeUrl ? formatDisplayResumeName(sp.resumeUrl) : defaultStudentProfile.resumeFileName,
        skills: mappedSkills,
        interests: defaultStudentProfile.interests,
        preferredRoles: defaultStudentProfile.preferredRoles,
        preferredLocations: defaultStudentProfile.preferredLocations,
        availability: defaultStudentProfile.availability,
      };

      setProfile(mergedProfile);
      setFormData(mergedProfile);
      if (mergedProfile.preferredRoles && mergedProfile.preferredRoles.length > 0) {
        setTargetRole(mergedProfile.preferredRoles[0]);
      }

      // Load saved AI resume analysis if already completed
      try {
        const analysis = await fetchStudentResumeAnalysisBackend();
        if (analysis) {
          setResumeAnalysis(analysis);
        }
      } catch (err) {
        console.warn('[StudentProfile] Could not load saved resume analysis:', err);
      }
    } catch (err: any) {
      console.warn('[StudentProfile] Note loading profile:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleStartEdit = () => {
    setFormData(profile);
    setIsEditing(true);
    setSaveSuccess(false);
    setSaveError(null);
    setResumeUploadSuccess(null);
    setResumeUploadError(null);
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
    setSaveError(null);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: StudentSkill = {
      id: 'sk_' + Date.now(),
      name: newSkillName.trim(),
      level: newSkillLevel,
    };
    setFormData({
      ...formData,
      skills: [...formData.skills, newSkill],
    });
    setNewSkillName('');
  };

  const handleRemoveSkill = (id: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s: StudentSkill) => s.id !== id),
    });
  };

  const handleAnalyzeResume = async (force: boolean = false) => {
    if (isAnalyzingResume) return;
    setIsAnalyzingResume(true);
    setResumeAnalysisError(null);

    try {
      const res = await analyzeStudentResumeBackend({
        forceReanalyze: force,
        targetRole: targetRole.trim() || (profile.preferredRoles?.[0] ?? undefined),
      });

      if (res.success && res.data) {
        setResumeAnalysis(res.data);
      } else {
        setResumeAnalysisError(res.error || 'Unable to complete resume analysis at this time. Please try again.');
      }
    } catch (err: any) {
      setResumeAnalysisError(err?.message || 'An unexpected error occurred during resume analysis.');
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeUploadError('Please select a valid PDF file (.pdf).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadError('Resume file size must be less than 5MB.');
      return;
    }

    setResumeUploadError(null);
    setResumeUploading(true);

    const res = await uploadStudentResumeBackend(file);
    setResumeUploading(false);

    if (res.success) {
      if (res.resumeUrl) {
        await updateStudentProfileBackend({ resumeUrl: res.resumeUrl });
      }
      const displayName = res.fileName || formatDisplayResumeName(res.resumeUrl) || file.name;
      setFormData((prev: StudentProfileData) => ({
        ...prev,
        resumeFileName: displayName,
      }));
      setProfile((prev: StudentProfileData) => ({
        ...prev,
        resumeFileName: displayName,
      }));
      // Invalidate previous analysis for the replaced file
      setResumeAnalysis(null);
      setResumeAnalysisError(null);
      setResumeUploadSuccess('Resume ' + displayName + ' uploaded successfully. Click "Analyze Resume with AI" to evaluate it.');
    } else {
      setResumeUploadError(res.error || 'Failed to upload resume.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    try {
      let semesterNum: number | undefined;
      const semMatch = formData.yearSemester.match(/(\d+)/);
      if (semMatch) {
        const parsed = parseInt(semMatch[1], 10);
        if (parsed >= 1 && parsed <= 12) {
          semesterNum = parsed;
        }
      }

      const res = await updateStudentProfileBackend({
        fullName: formData.fullName,
        phone: formData.phone,
        course: formData.degree,
        currentSemester: semesterNum,
        skills: formData.skills.map((s) => s.name),
      });

      if (res.success) {
        setProfile(formData);
        setIsEditing(false);
        setSaveSuccess(true);
      } else {
        setSaveError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving profile.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Academic & Career Profile"
        description="Manage your verified student records, skills portfolio, uploaded PDF resume, and internship preferences."
        action={
          !isEditing ? (
            <Button variant="primary" size="md" onClick={handleStartEdit}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="md" onClick={handleCancelEdit} type="button">
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveProfile} type="button">
                <Save className="w-4 h-4 mr-1" /> Save All Changes
              </Button>
            </div>
          )
        }
      />

      {saveSuccess && (
        <Alert type="success" title="Profile Saved">
          Your student profile and academic records have been saved.
        </Alert>
      )}

      {saveError && (
        <Alert type="error" title="Profile Update Notice">
          {saveError}
        </Alert>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Basic Information Section */}
        <Card title="Personal Information" subtitle="Official contact details for campus TPO and company recruiters">
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Official Email</span>
                <span className="font-semibold text-slate-800">{profile.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                <span className="font-semibold text-slate-800">{profile.phone}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Official Email"
                value={formData.email}
                disabled
                className="bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <Input
                label="Contact Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          )}
        </Card>

        {/* 2. Academic Enrollment Section */}
        <Card title="Academic Details" subtitle="Verified university department, degree program, and CGPA">
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-semibold text-slate-800">{profile.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Degree Program</span>
                <span className="font-semibold text-slate-800">{profile.degree}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Year & Semester</span>
                <span className="font-semibold text-slate-800">{profile.yearSemester}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">CGPA / Percentage</span>
                <span className="font-semibold text-indigo-600">{profile.cgpa}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
              <Input
                label="Degree Program"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              />
              <Input
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              <Input
                label="Current CGPA"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
              />
            </div>
          )}
        </Card>

        {/* 3. Technical Skills Section */}
        <Card title="Skills Portfolio" subtitle="Skills used for AI internship recommendations and gap analysis">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(isEditing ? formData.skills : profile.skills).map((skill: StudentSkill) => (
                <div
                  key={skill.id}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium flex items-center space-x-2 text-slate-800"
                >
                  <span>{skill.name}</span>
                  <Badge variant={skill.level === 'advanced' ? 'indigo' : skill.level === 'intermediate' ? 'emerald' : 'neutral'}>
                    {skill.level}
                  </Badge>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-slate-400 hover:text-red-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <div className="flex-1">
                  <Input
                    placeholder="Add a new skill (e.g. Docker, Python, Figma)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as any)}
                    options={[
                      { value: 'beginner', label: 'Beginner' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'advanced', label: 'Advanced' },
                    ]}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleAddSkill}>
                  <Plus className="w-4 h-4 mr-1" /> Add Skill
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* 4. Resume Section */}
        <Card
          title="Resume and AI Analysis"
          subtitle="Primary PDF attachment evaluated by Groq AI for ATS compatibility and skill alignment"
        >
          <div className="space-y-5">
            {resumeUploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resumeUploadSuccess}</span>
              </div>
            )}

            {resumeUploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{resumeUploadError}</span>
              </div>
            )}

            {!isEditing ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {profile.resumeHeadline}
                </p>

                {/* PDF File Card & AI Action Bar */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800 text-sm">{profile.resumeFileName}</span>
                        <Badge variant="indigo">PDF Verified</Badge>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Securely stored on server • Ready for AI screening
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleAnalyzeResume(Boolean(resumeAnalysis))}
                      disabled={isAnalyzingResume || !profile.resumeFileName}
                      className="shadow-sm"
                    >
                      {isAnalyzingResume ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1.5" />
                          {resumeAnalysis ? 'Re-Analyze Resume' : 'Analyze Resume with AI'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Optional Target Role Selector for Analysis */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-indigo-50/40 border border-indigo-100 rounded-lg text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-semibold shrink-0">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Target Role for Skill Evaluation:</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Full Stack Developer, Frontend Engineer, Data Analyst"
                      className="w-full px-2.5 py-1 text-xs border border-indigo-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] text-slate-400 shrink-0">(Optional)</span>
                  </div>
                </div>

                {/* Loading State */}
                {isAnalyzingResume && (
                  <div className="p-6 bg-indigo-50/60 border border-indigo-100 rounded-xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center mx-auto shadow-sm border border-indigo-100">
                      <Sparkles className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Groq AI is Evaluating Your Resume</h4>
                      <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                        Extracting PDF text, evaluating ATS compatibility heuristics, verifying technical skills, and generating tailored recommendations with model <code className="text-indigo-600 font-mono">openai/gpt-oss-120b</code>...
                      </p>
                    </div>
                    <div className="w-48 mx-auto">
                      <div className="h-1.5 w-full bg-indigo-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {resumeAnalysisError && !isAnalyzingResume && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-start space-x-2.5 text-rose-800">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold">Resume Analysis Notice</h4>
                        <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{resumeAnalysisError}</p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyzeResume(true)}
                        className="text-xs bg-white text-rose-700 border-rose-300 hover:bg-rose-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Analysis
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI Analysis Results State */}
                {resumeAnalysis && !isAnalyzingResume && (
                  <div className="space-y-5 pt-2">
                    {/* ATS Score & Overview Banner */}
                    <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl shadow-sm border border-indigo-900/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded border border-indigo-400/30">
                              Groq AI Screening
                            </span>
                            <span className="text-xs text-slate-300">
                              Analyzed on {new Date(resumeAnalysis.analyzedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white">AI ATS Compatibility Score</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {resumeAnalysis.summary}
                          </p>
                        </div>

                        <div className="flex flex-col items-center justify-center px-6 py-4 bg-white/10 rounded-xl border border-white/10 text-center shrink-0 min-w-[140px]">
                          <div className={`text-4xl font-black ${
                            resumeAnalysis.atsScore >= 75 ? 'text-emerald-400' :
                            resumeAnalysis.atsScore >= 55 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {resumeAnalysis.atsScore}
                            <span className="text-lg font-normal text-slate-300">/100</span>
                          </div>
                          <span className={`text-xs font-semibold mt-1 ${
                            resumeAnalysis.atsScore >= 75 ? 'text-emerald-300' :
                            resumeAnalysis.atsScore >= 55 ? 'text-amber-300' : 'text-rose-300'
                          }`}>
                            {resumeAnalysis.atsScore >= 75 ? 'Strong Match' :
                             resumeAnalysis.atsScore >= 55 ? 'Moderate Match' : 'Needs Optimization'}
                          </span>
                        </div>
                      </div>

                      {/* Disclaimer Callout */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] text-slate-300">
                        <Info className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <span className="font-semibold text-white">Note: </span>
                          {resumeAnalysis.atsScoreDisclaimer}
                        </p>
                      </div>
                    </div>

                    {/* Strengths & Actionable Improvements Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2.5">
                        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Detected Strengths & Highlights</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {resumeAnalysis.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actionable Improvements */}
                      <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2.5">
                        <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                          <Lightbulb className="w-4 h-4 text-indigo-600" />
                          <span>Actionable Recommendations</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {resumeAnalysis.actionableImprovements.map((tip, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Detected Skills Breakdown */}
                    <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-bold text-slate-800">
                            Extracted Skills from Resume ({resumeAnalysis.detectedSkills.length})
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500">Grouped by category</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {resumeAnalysis.detectedSkills.map((sk, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1.5 bg-slate-50 border-slate-200 text-slate-700"
                            title={sk.context || undefined}
                          >
                            <span>{sk.skill}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                              sk.category === 'technical' ? 'bg-indigo-100 text-indigo-700' :
                              sk.category === 'tool' ? 'bg-cyan-100 text-cyan-700' :
                              sk.category === 'soft' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {sk.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing / Recommended Skills (if any) */}
                    {resumeAnalysis.missingSkills && resumeAnalysis.missingSkills.length > 0 && (
                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                        <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                          <span>Recommended Skills for Target Opportunities</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {resumeAnalysis.missingSkills.map((ms, i) => (
                            <div key={i} className="p-2.5 bg-white border border-amber-200/70 rounded-lg text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{ms.skill}</span>
                                <Badge variant={ms.importance === 'High' ? 'rose' : ms.importance === 'Medium' ? 'amber' : 'neutral'}>
                                  {ms.importance} Priority
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal">{ms.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section Breakdown & Formatting Issues */}
                    <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white">
                      <div className="flex items-center space-x-2">
                        <ListChecks className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-800">Resume Section & Formatting Audit</h4>
                      </div>

                      <div className="space-y-2">
                        {resumeAnalysis.sectionFeedback.map((sec, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-800">{sec.sectionName}</span>
                                <Badge variant={
                                  sec.status === 'Good' ? 'emerald' :
                                  sec.status === 'Needs Improvement' ? 'amber' : 'rose'
                                }>
                                  {sec.status}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal">{sec.feedback}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {resumeAnalysis.formattingIssues && resumeAnalysis.formattingIssues.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                          <span className="text-[11px] font-bold text-amber-800 block">Formatting & Readability Notes:</span>
                          <ul className="space-y-1 text-[11px] text-slate-600">
                            {resumeAnalysis.formattingIssues.map((issue, idx) => (
                              <li key={idx} className="flex items-center space-x-1.5">
                                <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty State when no analysis yet */}
                {!resumeAnalysis && !isAnalyzingResume && !resumeAnalysisError && (
                  <div className="p-4 bg-indigo-50/40 border border-dashed border-indigo-200 rounded-xl text-center space-y-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-800">
                      AI Analysis Pending for {profile.resumeFileName}
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Click "Analyze Resume with AI" above to extract resume text, calculate ATS compatibility, identify missing skills, and receive recruiter-style feedback.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  label="Professional Headline"
                  value={formData.resumeHeadline}
                  onChange={(e) => setFormData({ ...formData, resumeHeadline: e.target.value })}
                />
                
                {/* Hidden File Input for PDF */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="application/pdf,.pdf"
                  className="hidden"
                />

                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center space-y-2 bg-slate-50/50">
                  <FileText className="w-7 h-7 text-indigo-600 mx-auto" />
                  <p className="text-xs text-slate-700 font-semibold">Upload new PDF Resume (Max 5MB)</p>
                  <p className="text-[11px] text-slate-500">Current Active File: {formData.resumeFileName}</p>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    disabled={resumeUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {resumeUploading ? 'Uploading Resume...' : 'Choose PDF File'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 5. Career Preferences */}
        <Card title="Career Goals and Preferred Domains" subtitle="Matching parameters for recruiters and AI recommendations">
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Preferred Roles</span>
                <div className="flex flex-wrap gap-1">
                  {profile.preferredRoles.map((role: string, i: number) => (
                    <Badge key={i} variant="neutral">{role}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Target Locations</span>
                <div className="flex flex-wrap gap-1">
                  {profile.preferredLocations.map((loc: string, i: number) => (
                    <Badge key={i} variant="sky">{loc}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Availability</span>
                <span className="font-semibold text-emerald-600">{profile.availability}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="Target Roles (comma separated)"
                value={formData.preferredRoles.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredRoles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <Input
                label="Preferred Locations (comma separated)"
                value={formData.preferredLocations.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredLocations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <Input
                label="Availability Status"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              />
            </div>
          )}
        </Card>
      </form>
    </div>
  );
};
