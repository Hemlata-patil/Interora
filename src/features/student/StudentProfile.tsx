import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, Input, Select, Alert, ProgressBar, ProfilePictureUploader } from '@/components';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
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
  Info,
  Briefcase,
  Globe,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  FolderGit2,
  MapPin,
  Calendar,
  Check,
  ShieldCheck,
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);
import {
  getCurrentUserBackend,
  uploadStudentResumeBackend,
  updateStudentProfileBackend,
  analyzeStudentResumeBackend,
  fetchStudentResumeAnalysisBackend,
  fetchActiveStudentInternshipBackend,
  type ResumeAnalysisResult,
  type ActiveStudentInternshipRecord,
} from '@/services/api/backendService';

export interface StudentSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface StudentProject {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface StudentCertification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface StudentExperience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface StudentProfileData {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  rollNo: string;
  department: string;
  institution: string;
  degree: string;
  yearSemester: string;
  batchDivision?: string;
  batchYear?: string;
  cgpa: string;
  bio?: string;
  resumeHeadline: string;
  resumeFileName: string;
  skills: StudentSkill[];
  interests: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  availability: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  projects: StudentProject[];
  certifications: StudentCertification[];
  experiences: StudentExperience[];
}

export function formatDisplayResumeName(rawUrlOrFilename?: string | null): string {
  if (!rawUrlOrFilename) return 'Resume_Uploaded.pdf';
  const base = rawUrlOrFilename.split('/').pop() || rawUrlOrFilename;
  return base.replace(/^[0-9a-fA-F-]{36}_\d+_/, '') || base;
}

const LOCAL_STORAGE_KEY_PREFIX = 'interora_student_extended_profile_';

export const defaultStudentProfile: StudentProfileData = {
  fullName: 'Rohan Mehta',
  email: 'rohan.mehta@college.edu',
  phone: '+91 98765 43210',
  avatarUrl: '',
  rollNo: 'CS2026-089',
  department: 'Computer Science & Engineering',
  institution: 'Indian Institute of Information Technology',
  degree: 'B.Tech in Computer Science',
  yearSemester: '3rd Year / 6th Semester',
  batchDivision: 'CS1',
  batchYear: '2026',
  cgpa: '8.5 / 10.0',
  bio: 'Passionate computer science student specializing in scalable web architectures, full stack TypeScript systems, and distributed cloud applications.',
  resumeHeadline: 'Motivated Full Stack Developer seeking summer internship opportunities.',
  resumeFileName: 'Resume_Verified.pdf',
  skills: [
    { id: 'sk_1', name: 'React', level: 'advanced' },
    { id: 'sk_2', name: 'TypeScript', level: 'intermediate' },
    { id: 'sk_3', name: 'Node.js', level: 'intermediate' },
    { id: 'sk_4', name: 'Python', level: 'advanced' },
    { id: 'sk_5', name: 'PostgreSQL', level: 'intermediate' },
    { id: 'sk_6', name: 'Docker', level: 'beginner' },
  ],
  interests: ['Cloud Architecture', 'Full Stack Development', 'AI & Machine Learning'],
  preferredRoles: ['Software Engineering Intern', 'Full Stack Developer', 'Frontend Engineer'],
  preferredLocations: ['Pune', 'Bangalore', 'Remote'],
  availability: 'Immediate (Summer 2026)',
  githubUrl: 'https://github.com/student-demo',
  linkedinUrl: 'https://linkedin.com/in/student-demo',
  portfolioUrl: 'https://portfolio.student.dev',
  projects: [
    {
      id: 'proj_1',
      title: 'Distributed Task Queue Engine',
      description: 'High-throughput async job orchestrator with Redis and Node.js worker pools.',
      techStack: ['Node.js', 'Redis', 'TypeScript', 'Docker'],
      githubUrl: 'https://github.com/student-demo/task-queue',
      liveUrl: 'https://demo-queue.student.dev',
    },
    {
      id: 'proj_2',
      title: 'Campus Internship Portal UI',
      description: 'Responsive enterprise career portal with real-time application tracking and ATS analysis.',
      techStack: ['React', 'Tailwind CSS', 'Vite', 'REST API'],
      githubUrl: 'https://github.com/student-demo/internship-portal',
    },
  ],
  certifications: [
    {
      id: 'cert_1',
      title: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      issueDate: 'Jan 2026',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert_2',
      title: 'Meta Frontend Developer Professional Certificate',
      issuer: 'Meta / Coursera',
      issueDate: 'Dec 2025',
    },
  ],
  experiences: [
    {
      id: 'exp_1',
      role: 'Software Engineering Intern',
      company: 'TechCorp Solutions',
      duration: 'June 2026 - Aug 2026 (Active)',
      description: 'Building micro-frontend dashboards and optimizing API response caching.',
    },
  ],
};

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData>(defaultStudentProfile);
  const [formData, setFormData] = useState<StudentProfileData>(defaultStudentProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

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

  // Active Live Internship Assignment
  const [activeInternship, setActiveInternship] = useState<ActiveStudentInternshipRecord | null>(null);

  // Skill Builder State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // Project Builder State
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectGithub, setNewProjectGithub] = useState('');

  // Certification Builder State
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [user, active, analysis] = await Promise.all([
        getCurrentUserBackend().catch(() => null),
        fetchActiveStudentInternshipBackend().catch(() => null),
        fetchStudentResumeAnalysisBackend().catch(() => null),
      ]);

      setActiveInternship(active);
      if (analysis) {
        setResumeAnalysis(analysis);
      }

      if (!user) {
        setLoading(false);
        return;
      }

      // Load extended local portfolio details if available
      let extendedDetails: Partial<StudentProfileData> = {};
      try {
        const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${user.id}`);
        if (saved) {
          extendedDetails = JSON.parse(saved);
        }
      } catch {
        // Ignore
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
        avatarUrl: user.avatarUrl || defaultStudentProfile.avatarUrl,
        rollNo: sp?.studentId || defaultStudentProfile.rollNo,
        department: defaultStudentProfile.department,
        institution: extendedDetails.institution || defaultStudentProfile.institution,
        degree: sp?.course || defaultStudentProfile.degree,
        yearSemester: sp?.currentSemester ? `Semester ${sp.currentSemester}` : defaultStudentProfile.yearSemester,
        batchDivision: sp?.batchDivision || defaultStudentProfile.batchDivision,
        batchYear: sp?.batchYear ? String(sp.batchYear) : defaultStudentProfile.batchYear,
        cgpa: sp?.cgpa ? `${sp.cgpa} / 10.0` : defaultStudentProfile.cgpa,
        bio: extendedDetails.bio || defaultStudentProfile.bio,
        resumeHeadline: extendedDetails.resumeHeadline || defaultStudentProfile.resumeHeadline,
        resumeFileName: sp?.resumeUrl ? formatDisplayResumeName(sp.resumeUrl) : defaultStudentProfile.resumeFileName,
        skills: mappedSkills,
        interests: extendedDetails.interests || defaultStudentProfile.interests,
        preferredRoles: extendedDetails.preferredRoles || defaultStudentProfile.preferredRoles,
        preferredLocations: extendedDetails.preferredLocations || defaultStudentProfile.preferredLocations,
        availability: extendedDetails.availability || defaultStudentProfile.availability,
        githubUrl: extendedDetails.githubUrl || defaultStudentProfile.githubUrl,
        linkedinUrl: extendedDetails.linkedinUrl || defaultStudentProfile.linkedinUrl,
        portfolioUrl: extendedDetails.portfolioUrl || defaultStudentProfile.portfolioUrl,
        projects: extendedDetails.projects || defaultStudentProfile.projects,
        certifications: extendedDetails.certifications || defaultStudentProfile.certifications,
        experiences: active
          ? [
              {
                id: active.assignmentId,
                role: active.title || 'Intern',
                company: active.companyName || 'Host Company',
                duration: `${active.duration || '3 Months'} (Active)`,
                description: `Supervised by ${active.mentorName || 'Company Mentor'} (${active.workMode || 'Remote'}).`,
              },
              ...(extendedDetails.experiences || []),
            ]
          : extendedDetails.experiences || defaultStudentProfile.experiences,
      };

      setProfile(mergedProfile);
      setFormData(mergedProfile);
      if (mergedProfile.preferredRoles && mergedProfile.preferredRoles.length > 0) {
        setTargetRole(mergedProfile.preferredRoles[0]);
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
    setSaveSuccess(null);
    setSaveError(null);
    setResumeUploadSuccess(null);
    setResumeUploadError(null);
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
    setSaveError(null);
  };

  // Skill management
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

  // Project management
  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return;
    const project: StudentProject = {
      id: `proj_${Date.now()}`,
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim() || 'Software implementation and technical delivery.',
      techStack: newProjectTech
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl: newProjectGithub.trim() || undefined,
    };
    setFormData({
      ...formData,
      projects: [project, ...(formData.projects || [])],
    });
    setNewProjectTitle('');
    setNewProjectDesc('');
    setNewProjectTech('');
    setNewProjectGithub('');
  };

  const handleRemoveProject = (id: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((p) => p.id !== id),
    });
  };

  // Certification management
  const handleAddCert = () => {
    if (!newCertTitle.trim()) return;
    const cert: StudentCertification = {
      id: `cert_${Date.now()}`,
      title: newCertTitle.trim(),
      issuer: newCertIssuer.trim() || 'Verified Institution',
      issueDate: newCertDate.trim() || '2026',
    };
    setFormData({
      ...formData,
      certifications: [cert, ...(formData.certifications || [])],
    });
    setNewCertTitle('');
    setNewCertIssuer('');
    setNewCertDate('');
  };

  const handleRemoveCert = (id: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c.id !== id),
    });
  };

  // Resume Upload Handler
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
      setResumeAnalysis(null);
      setResumeAnalysisError(null);
      setResumeUploadSuccess(`Resume "${displayName}" uploaded successfully. Click "Analyze Resume with AI" to evaluate it.`);
    } else {
      setResumeUploadError(res.error || 'Failed to upload resume.');
    }
  };

  // AI Resume Analyzer
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

  // Save Profile Handler
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveSuccess(null);
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

      // 1. Authoritative Backend Update
      const res = await updateStudentProfileBackend({
        fullName: formData.fullName,
        phone: formData.phone,
        course: formData.degree,
        currentSemester: semesterNum,
        skills: formData.skills.map((s) => s.name),
      });

      // 2. Persist Extended Fields (Projects, Certifications, Links)
      const user = await getCurrentUserBackend().catch(() => null);
      if (user?.id) {
        const extendedData = {
          institution: formData.institution,
          bio: formData.bio,
          resumeHeadline: formData.resumeHeadline,
          interests: formData.interests,
          preferredRoles: formData.preferredRoles,
          preferredLocations: formData.preferredLocations,
          availability: formData.availability,
          githubUrl: formData.githubUrl,
          linkedinUrl: formData.linkedinUrl,
          portfolioUrl: formData.portfolioUrl,
          projects: formData.projects,
          certifications: formData.certifications,
          experiences: formData.experiences,
        };
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(extendedData));
      }

      if (res.success) {
        setProfile(formData);
        setIsEditing(false);
        setSaveSuccess('Student profile and portfolio updated successfully.');
      } else {
        setSaveError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving profile.');
    }
  };

  const completion = calculateProfileCompletion(isEditing ? formData : profile);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading verified student profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── 1. PROFILE HEADER CARD (Hero Section) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner Top Gradient */}
        <div className="h-28 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute right-4 top-4 flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-300" />
              Verified Student Account
            </span>
          </div>
        </div>

        {/* Profile Identity Details */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-5 -mt-12">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-800 text-white flex items-center justify-center font-bold text-3xl shadow-xl ring-4 ring-white border border-indigo-200 shrink-0 overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  (profile.fullName || 'Student')
                    .trim()
                    .split(/\s+/)
                    .map((n) => n[0] || '')
                    .join('')
                    .substring(0, 2)
                    .toUpperCase() || 'ST'
                )}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-500/20"></span>
            </div>

            {/* Title & Program Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {profile.fullName}
                </h1>
                <Badge variant="indigo">{profile.rollNo}</Badge>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-indigo-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>{profile.degree}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-normal">{profile.yearSemester}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile.phone}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {profile.department}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2 md:pt-0 shrink-0">
            {!isEditing ? (
              <Button variant="primary" size="md" onClick={handleStartEdit} className="shadow-xs">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="md" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button variant="primary" size="md" onClick={() => handleSaveProfile()}>
                  <Save className="w-4 h-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. PROFILE COMPLETION WRAPPER CARD ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-300" /> Profile Completion Status
              </span>
              <span className="text-xs text-slate-300">
                {completion.completedCount} of {completion.totalCount} Sections Completed
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Student Profile Readiness</span>
              {completion.percentage === 100 ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 100% Complete
                </span>
              ) : (
                <span className="text-xs text-indigo-300 font-normal">
                  (Complete all sections to unlock top recruiter matches)
                </span>
              )}
            </h3>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 via-violet-400 to-emerald-400"
                  style={{ width: `${completion.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Section Breakdown Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              {completion.completedList.map((sec) => (
                <span
                  key={sec.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                >
                  <Check className="w-3 h-3 mr-1" />
                  {sec.label}
                </span>
              ))}

              {completion.missingList.map((sec) => (
                <span
                  key={sec.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  title={sec.missingHint}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
                  {sec.label} (Required)
                </span>
              ))}
            </div>
          </div>

          {/* Percentage Score Dial & CTA */}
          <div className="flex flex-col items-center justify-center sm:items-end shrink-0 gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div className="text-center md:text-right">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-emerald-300">
                {completion.percentage}%
              </span>
              <span className="block text-[11px] text-slate-300 font-medium">{completion.statusLabel}</span>
            </div>

            {!isEditing && completion.percentage < 100 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartEdit}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs font-semibold text-xs"
              >
                <span>Continue Profile</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <Alert type="success" title="Changes Saved">
          {saveSuccess}
        </Alert>
      )}

      {saveError && (
        <Alert type="error" title="Update Notice">
          {saveError}
        </Alert>
      )}

      {/* ── 3. FOUR INFORMATION CARDS (VIEW MODE) ── */}
      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: PERSONAL INFORMATION */}
          <Card
            title="Personal Information"
            subtitle="Verified student contact details and official campus identification"
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-semibold text-slate-800 text-sm">{profile.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Email</span>
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <span>{profile.email}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="font-semibold text-slate-800">{profile.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Locations</span>
                  <span className="font-semibold text-slate-800">
                    {(profile.preferredLocations && profile.preferredLocations.length > 0)
                      ? profile.preferredLocations.join(', ')
                      : 'Pune, Bangalore, Remote'}
                  </span>
                </div>
              </div>

              {profile.bio && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1">About & Bio</span>
                  <p className="text-slate-700 leading-relaxed font-normal">{profile.bio}</p>
                </div>
              )}

              {/* Online Social & Code Profiles */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2.5">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors text-xs"
                  >
                    <GithubIcon className="w-3.5 h-3.5 mr-1.5 text-slate-700" /> GitHub Profile
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors text-xs"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> LinkedIn Network
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors text-xs"
                  >
                    <Globe className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Portfolio Site
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* CARD 2: ACADEMIC INFORMATION */}
          <Card
            title="Academic Information"
            subtitle="Department enrollment, graduation year, batch, and verified performance"
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Degree Program</span>
                  <span className="font-semibold text-slate-800 text-sm">{profile.degree}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">University / Institution</span>
                  <span className="font-semibold text-slate-800">{profile.institution}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department</span>
                  <span className="font-semibold text-slate-800">{profile.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Student Roll / ID</span>
                  <span className="font-semibold text-slate-800">{profile.rollNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Year & Semester</span>
                  <span className="font-semibold text-slate-800">{profile.yearSemester}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Batch & Division</span>
                  <span className="font-semibold text-slate-800">
                    Class {profile.batchYear} • Division {profile.batchDivision}
                  </span>
                </div>
              </div>

              {/* CGPA Card Callout */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wide">
                    Cumulative CGPA / GPA
                  </span>
                  <p className="text-[11px] text-slate-600">Official academic standing on campus records</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-indigo-700">{profile.cgpa}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* CARD 3: SKILLS & CAREER INTERESTS */}
          <Card
            title="Skills & Career Interests"
            subtitle="Technical competencies, proficiency tiers, and career domain preferences"
          >
            <div className="space-y-4 text-xs">
              {/* Technical Skills List */}
              <div>
                <span className="text-slate-400 block text-[11px] mb-2 font-medium">Verified Skills Portfolio</span>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map((skill) => (
                    <div
                      key={skill.id}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 text-slate-800 shadow-2xs"
                    >
                      <span>{skill.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          skill.level === 'advanced'
                            ? 'bg-indigo-100 text-indigo-700'
                            : skill.level === 'intermediate'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred Roles */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-1 font-medium">Target Job Roles</span>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.preferredRoles || []).map((role, i) => (
                    <Badge key={i} variant="neutral">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Career Interests & Availability */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">Domain Interests</span>
                  <div className="flex flex-wrap gap-1">
                    {(profile.interests || []).map((int, i) => (
                      <span key={i} className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">Availability</span>
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 mr-1" /> {profile.availability}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* CARD 4: PORTFOLIO & EXPERIENCE */}
          <Card
            title="Portfolio & Experience"
            subtitle="Active internship engagements, developer projects, and external certifications"
          >
            <div className="space-y-4 text-xs">
              {/* Active Internship Engagement */}
              {profile.experiences && profile.experiences.length > 0 && (
                <div className="space-y-2">
                  <span className="text-slate-400 block text-[11px] font-medium">Internship Experience</span>
                  {profile.experiences.map((exp) => (
                    <div key={exp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{exp.role}</span>
                        <Badge variant="indigo">{exp.duration}</Badge>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600">{exp.company}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Projects */}
              {profile.projects && profile.projects.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-slate-400 block text-[11px] font-medium">Featured Projects</span>
                  <div className="space-y-2">
                    {profile.projects.map((proj) => (
                      <div key={proj.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{proj.title}</span>
                          <div className="flex items-center space-x-2">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-800"
                                title="View Code"
                              >
                                <GithubIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {proj.liveUrl && (
                              <a
                                href={proj.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                                title="Live Demo"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal">{proj.description}</p>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {proj.techStack.map((tech, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profile.certifications && profile.certifications.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-slate-400 block text-[11px] font-medium">Certifications</span>
                  <div className="space-y-1.5">
                    {profile.certifications.map((cert) => (
                      <div key={cert.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{cert.title}</span>
                          <p className="text-[10px] text-slate-500">
                            {cert.issuer} • Issued {cert.issueDate}
                          </p>
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium"
                          >
                            Verify →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        /* ── 4. PROFILE EDITING INTERFACE (ORGANIZED FORMS) ── */
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Action Bar Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Editing Student Profile</h3>
              <p className="text-xs text-slate-500">Update academic, skill, and portfolio parameters</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit} type="button">
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                <Save className="w-4 h-4 mr-1.5" /> Save All Changes
              </Button>
            </div>
          </div>

          {/* Section 1: Personal Information */}
          <Card title="1. Personal Information" subtitle="Official contact details for campus TPO and company recruiters">
            <div className="space-y-4">
              {/* Optional Profile Picture Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <ProfilePictureUploader
                  currentAvatarUrl={formData.avatarUrl}
                  fullName={formData.fullName}
                  onAvatarChange={(newUrl) => {
                    setFormData((prev) => ({ ...prev, avatarUrl: newUrl }));
                    setProfile((prev) => ({ ...prev, avatarUrl: newUrl }));
                  }}
                  allowImmediateSave={true}
                />
              </div>

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

              <div>
                <Input
                  label="Professional Bio / Elevator Pitch"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="e.g. Passionate software engineer specializing in full stack React & Node architectures..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <Input
                  label="GitHub Profile URL"
                  value={formData.githubUrl || ''}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/your-username"
                />
                <Input
                  label="LinkedIn Profile URL"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/your-profile"
                />
                <Input
                  label="Portfolio / Personal Site"
                  value={formData.portfolioUrl || ''}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.dev"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Academic Information */}
          <Card title="2. Academic Information" subtitle="Degree program, institution, and official grades">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Institution / University"
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
              <Input
                label="Year & Semester"
                value={formData.yearSemester}
                onChange={(e) => setFormData({ ...formData, yearSemester: e.target.value })}
              />
              <Input
                label="Batch Year"
                value={formData.batchYear || '2026'}
                onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
              />
              <Input
                label="Batch Division"
                value={formData.batchDivision || 'CS1'}
                onChange={(e) => setFormData({ ...formData, batchDivision: e.target.value })}
              />
              <Input
                label="Student ID / Roll No"
                value={formData.rollNo}
                disabled
                className="bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </Card>

          {/* Section 3: Technical & Soft Skills */}
          <Card title="3. Technical & Soft Skills" subtitle="Skills used for AI matchmaking and internship matching">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium flex items-center space-x-2 text-slate-800"
                  >
                    <span>{skill.name}</span>
                    <Badge variant={skill.level === 'advanced' ? 'indigo' : skill.level === 'intermediate' ? 'emerald' : 'neutral'}>
                      {skill.level}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-slate-400 hover:text-red-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <div className="flex-1">
                  <Input
                    placeholder="Add a new skill (e.g. Next.js, Docker, Kubernetes)"
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
            </div>
          </Card>

          {/* Section 4: Projects, Certifications & Experience */}
          <Card
            title="4. Projects, Certifications & Experience"
            subtitle="Showcase technical projects and external certifications to prospective recruiters"
          >
            <div className="space-y-5">
              {/* Projects List & Adder */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Personal & Academic Projects</span>
                <div className="space-y-2">
                  {formData.projects.map((proj) => (
                    <div key={proj.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 text-xs">{proj.title}</span>
                        <p className="text-[11px] text-slate-600">{proj.description}</p>
                        <p className="text-[10px] text-indigo-600 font-mono">Stack: {proj.techStack.join(', ')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(proj.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Project Form */}
                <div className="p-3 bg-white border border-dashed border-indigo-200 rounded-xl space-y-2.5">
                  <span className="text-[11px] font-bold text-indigo-900 block">+ Add Project Entry</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Project Title (e.g. AI Workflow Builder)"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Technologies (comma-separated, e.g. React, Node, Tailwind)"
                      value={newProjectTech}
                      onChange={(e) => setNewProjectTech(e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Short description of technical implementation"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      placeholder="GitHub Repository URL (Optional)"
                      value={newProjectGithub}
                      onChange={(e) => setNewProjectGithub(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddProject} className="shrink-0">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                    </Button>
                  </div>
                </div>
              </div>

              {/* Certifications List & Adder */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">External Certifications</span>
                <div className="space-y-2">
                  {formData.certifications.map((c) => (
                    <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{c.title}</span>
                        <span className="text-slate-500 text-[11px] block">{c.issuer} • {c.issueDate}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Certification Name (e.g. AWS Solutions Architect)"
                    value={newCertTitle}
                    onChange={(e) => setNewCertTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Issuing Org (e.g. Amazon)"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    className="w-full sm:w-44"
                  />
                  <Input
                    placeholder="Year (e.g. 2026)"
                    value={newCertDate}
                    onChange={(e) => setNewCertDate(e.target.value)}
                    className="w-full sm:w-28"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddCert} className="shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> Add Cert
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 5: Career Goals & Interests */}
          <Card title="5. Career Goals & Interests" subtitle="Parameters used by recommendation algorithms">
            <div className="space-y-3">
              <Input
                label="Professional Headline"
                value={formData.resumeHeadline}
                onChange={(e) => setFormData({ ...formData, resumeHeadline: e.target.value })}
                placeholder="e.g. Motivated Full Stack Developer seeking summer internship opportunities"
              />
              <Input
                label="Target Roles (comma-separated)"
                value={(formData.preferredRoles || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredRoles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <Input
                label="Preferred Locations (comma-separated)"
                value={(formData.preferredLocations || []).join(', ')}
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
                placeholder="e.g. Immediate (Summer Internship 2026)"
              />
            </div>
          </Card>

          {/* Section 6: Resume & PDF Upload */}
          <Card title="6. Resume & Portfolio Document" subtitle="Upload your primary PDF resume for recruiter screening and ATS evaluation">
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="application/pdf,.pdf"
                className="hidden"
              />

              <div className="p-5 border-2 border-dashed border-indigo-200 rounded-xl text-center space-y-2 bg-indigo-50/30">
                <FileText className="w-8 h-8 text-indigo-600 mx-auto" />
                <p className="text-xs text-slate-800 font-bold">Upload PDF Resume (Max 5MB)</p>
                <p className="text-[11px] text-slate-500">Active File: {formData.resumeFileName}</p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  disabled={resumeUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {resumeUploading ? 'Uploading Resume...' : 'Choose New PDF File'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="md" onClick={handleCancelEdit} type="button">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              <Save className="w-4 h-4 mr-1.5" /> Save All Changes
            </Button>
          </div>
        </form>
      )}

      {/* ── 5. RESUME AND AI ATS ANALYZER (FULL SUITE PRESERVED) ── */}
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

            {/* Target Role Selector for Analysis */}
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
                  className="w-full px-2.5 py-1 text-xs border border-indigo-200 rounded bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
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
                    Extracting PDF text, evaluating ATS compatibility heuristics, verifying technical skills, and generating tailored recommendations with model{' '}
                    <code className="text-indigo-600 font-mono">openai/gpt-oss-120b</code>...
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
                {/* ATS Score Banner */}
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
                      <p className="text-xs text-slate-300 leading-relaxed">{resumeAnalysis.summary}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center px-6 py-4 bg-white/10 rounded-xl border border-white/10 text-center shrink-0 min-w-[140px]">
                      <div
                        className={`text-4xl font-black ${
                          resumeAnalysis.atsScore >= 75
                            ? 'text-emerald-400'
                            : resumeAnalysis.atsScore >= 55
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {resumeAnalysis.atsScore}
                        <span className="text-lg font-normal text-slate-300">/100</span>
                      </div>
                      <span
                        className={`text-xs font-semibold mt-1 ${
                          resumeAnalysis.atsScore >= 75
                            ? 'text-emerald-300'
                            : resumeAnalysis.atsScore >= 55
                            ? 'text-amber-300'
                            : 'text-rose-300'
                        }`}
                      >
                        {resumeAnalysis.atsScore >= 75
                          ? 'Strong Match'
                          : resumeAnalysis.atsScore >= 55
                          ? 'Moderate Match'
                          : 'Needs Optimization'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] text-slate-300">
                    <Info className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <span className="font-semibold text-white">Note: </span>
                      {resumeAnalysis.atsScoreDisclaimer}
                    </p>
                  </div>
                </div>

                {/* Strengths & Actionable Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Extracted Skills Breakdown */}
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
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                            sk.category === 'technical'
                              ? 'bg-indigo-100 text-indigo-700'
                              : sk.category === 'tool'
                              ? 'bg-cyan-100 text-cyan-700'
                              : sk.category === 'soft'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {sk.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing / Recommended Skills */}
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

                {/* Section Breakdown Audit */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white">
                  <div className="flex items-center space-x-2">
                    <ListChecks className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800">Resume Section & Formatting Audit</h4>
                  </div>

                  <div className="space-y-2">
                    {resumeAnalysis.sectionFeedback.map((sec, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-800">{sec.sectionName}</span>
                            <Badge
                              variant={
                                sec.status === 'Good'
                                  ? 'emerald'
                                  : sec.status === 'Needs Improvement'
                                  ? 'amber'
                                  : 'rose'
                              }
                            >
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
        </div>
      </Card>
    </div>
  );
};

export default StudentProfile;
