import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Alert,
  ProfilePictureUploader,
} from '@/components';
import {
  User,
  GraduationCap,
  Sparkles,
  Briefcase,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import {
  getCurrentUserBackend,
  updateStudentProfileBackend,
  uploadStudentResumeBackend,
  fetchDepartmentsBackend,
  type DepartmentRecord,
  type AuthUser,
} from '@/services/api/backendService';
import {
  calculateProfileCompletion,
  type StudentProfileLike,
} from '@/utils/profileCompletion';

const LOCAL_STORAGE_KEY_PREFIX = 'interora_student_extended_profile_';

export const StudentOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Resume upload state
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadMsg, setResumeUploadMsg] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<StudentProfileLike | null>(null);

  // Form State
  const [formData, setFormData] = useState<StudentProfileLike>({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: null,
    department: '',
    course: '',
    degree: '',
    studentId: '',
    rollNo: '',
    currentSemester: '',
    batchYear: '',
    batchDivision: '',
    institution: '',
    cgpa: '',
    bio: '',
    resumeHeadline: '',
    skills: [],
    preferredRoles: [],
    preferredLocations: [],
    availability: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    projects: [],
    certifications: [],
    experiences: [],
    resumeUrl: null,
    resumeFileName: null,
  });

  // Skill temporary inputs
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newRoleInput, setNewRoleInput] = useState('');

  // Project temporary inputs
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projGithub, setProjGithub] = useState('');

  // Certification temporary inputs
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certYear, setCertYear] = useState('');

  // Initialize and load saved student state
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const [user, deptList] = await Promise.all([
          getCurrentUserBackend().catch(() => null),
          fetchDepartmentsBackend().catch(() => []),
        ]);

        if (!isMounted) return;

        if (deptList && deptList.length > 0) {
          setDepartments(deptList);
        }

        if (user) {
          setCurrentUser(user);

          // Restore extended local portfolio data if present
          let savedExtended: Partial<StudentProfileLike> = {};
          try {
            const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${user.id}`);
            if (raw) savedExtended = JSON.parse(raw);
          } catch {
            // Ignore parse errors
          }

          const sp = user.studentProfile;
          const initialDept =
            sp?.departmentId && deptList.length > 0
              ? deptList.find((d) => d.id === sp.departmentId)?.name || deptList[0]?.name
              : user.departmentName || deptList[0]?.name || '';

          const rawId = sp?.studentId;
          const cleanStudentId = rawId && !/^STU-[0-9a-fA-F]{8}$/i.test(rawId) ? rawId : '';

          const savedObj: StudentProfileLike = {
            fullName: user.fullName || null,
            email: user.email || null,
            phone: user.phone || null,
            avatarUrl: user.avatarUrl || null,
            department: initialDept || null,
            course: sp?.course || (savedExtended.degree as string) || null,
            degree: sp?.course || (savedExtended.degree as string) || null,
            studentId: cleanStudentId || (savedExtended.rollNo as string) || null,
            rollNo: cleanStudentId || (savedExtended.rollNo as string) || null,
            currentSemester: sp?.currentSemester ? `Semester ${sp.currentSemester}` : null,
            batchYear: sp?.batchYear ? String(sp.batchYear) : null,
            batchDivision: sp?.batchDivision || null,
            skills: Array.isArray(sp?.skills) && sp.skills.length > 0
              ? sp.skills.map((s) => ({ name: typeof s === 'string' ? s : (s as any).name || String(s) }))
              : (savedExtended.skills as any) || [],
            preferredRoles: savedExtended.preferredRoles || [],
            resumeUrl: sp?.resumeUrl || null,
            ...savedExtended,
          };
          setSavedProfile(savedObj);

          setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            avatarUrl: user.avatarUrl || null,
            department: initialDept || '',
            course: sp?.course || (savedExtended.degree as string) || '',
            degree: sp?.course || (savedExtended.degree as string) || '',
            studentId: cleanStudentId || (savedExtended.rollNo as string) || '',
            rollNo: cleanStudentId || (savedExtended.rollNo as string) || '',
            currentSemester: sp?.currentSemester ? `Semester ${sp.currentSemester}` : '',
            batchYear: sp?.batchYear ? String(sp.batchYear) : '',
            batchDivision: sp?.batchDivision || '',
            institution: (savedExtended.institution as string) || '',
            cgpa: sp?.cgpa ? String(sp.cgpa) : '',
            bio: (savedExtended.bio as string) || '',
            resumeHeadline: (savedExtended.resumeHeadline as string) || '',
            skills: Array.isArray(sp?.skills) && sp.skills.length > 0
              ? sp.skills.map((s) => ({ name: typeof s === 'string' ? s : (s as any).name || String(s) }))
              : (savedExtended.skills as any) || [],
            preferredRoles: savedExtended.preferredRoles || [],
            preferredLocations: savedExtended.preferredLocations || [],
            availability: (savedExtended.availability as string) || '',
            githubUrl: (savedExtended.githubUrl as string) || '',
            linkedinUrl: (savedExtended.linkedinUrl as string) || '',
            portfolioUrl: (savedExtended.portfolioUrl as string) || '',
            projects: savedExtended.projects || [],
            certifications: savedExtended.certifications || [],
            experiences: savedExtended.experiences || [],
            resumeUrl: sp?.resumeUrl || null,
            resumeFileName: sp?.resumeUrl ? sp.resumeUrl.split('/').pop() || null : null,
          });
        }
      } catch (err) {
        console.error('[StudentOnboarding] Init error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time Profile Completion calculation: distinguish draft preview from official saved status
  const draftCompletion = calculateProfileCompletion(formData);
  const savedCompletion = savedProfile
    ? calculateProfileCompletion(savedProfile)
    : calculateProfileCompletion({
        fullName: currentUser?.fullName || null,
        email: currentUser?.email || null,
        phone: currentUser?.phone || null,
      });

  // Skill management
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const exists = (formData.skills || []).some(
      (s) => (typeof s === 'string' ? s : s.name).toLowerCase() === newSkillInput.trim().toLowerCase()
    );
    if (!exists) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), { name: newSkillInput.trim() }],
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter(
        (s) => (typeof s === 'string' ? s : s.name).toLowerCase() !== skillName.toLowerCase()
      ),
    }));
  };

  // Role management
  const handleAddRole = () => {
    if (!newRoleInput.trim()) return;
    if (!(formData.preferredRoles || []).includes(newRoleInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        preferredRoles: [...(prev.preferredRoles || []), newRoleInput.trim()],
      }));
    }
    setNewRoleInput('');
  };

  const handleRemoveRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredRoles: (prev.preferredRoles || []).filter((r) => r !== role),
    }));
  };

  // Project management
  const handleAddProject = () => {
    if (!projTitle.trim()) return;
    const newProj = {
      id: `proj_${Date.now()}`,
      title: projTitle.trim(),
      description: projDesc.trim() || 'Software implementation and technical delivery.',
      techStack: projTech.split(',').map((s) => s.trim()).filter(Boolean),
      githubUrl: projGithub.trim() || undefined,
    };
    setFormData((prev) => ({
      ...prev,
      projects: [newProj, ...(prev.projects || [])],
    }));
    setProjTitle('');
    setProjDesc('');
    setProjTech('');
    setProjGithub('');
  };

  const handleRemoveProject = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p: any) => p.id !== id),
    }));
  };

  // Certification management
  const handleAddCert = () => {
    if (!certTitle.trim()) return;
    const newCert = {
      id: `cert_${Date.now()}`,
      title: certTitle.trim(),
      issuer: certIssuer.trim() || 'Verified Institution',
      issueDate: certYear.trim() || '2026',
    };
    setFormData((prev) => ({
      ...prev,
      certifications: [newCert, ...(prev.certifications || [])],
    }));
    setCertTitle('');
    setCertIssuer('');
    setCertYear('');
  };

  const handleRemoveCert = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((c: any) => c.id !== id),
    }));
  };

  // Resume file select & upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeUploadMsg('Please upload a PDF file (.pdf).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadMsg('Resume file size must be less than 5MB.');
      return;
    }

    setResumeUploading(true);
    setResumeUploadMsg(null);

    const res = await uploadStudentResumeBackend(file);
    setResumeUploading(false);

    if (res.success && res.resumeUrl) {
      setFormData((prev) => ({
        ...prev,
        resumeUrl: res.resumeUrl,
        resumeFileName: res.fileName || file.name,
      }));
      setResumeUploadMsg(`Resume "${res.fileName || file.name}" uploaded successfully.`);
    } else {
      setResumeUploadMsg(res.error || 'Failed to upload resume.');
    }
  };

  // Persist current state to backend and scoped local storage
  const persistProgress = async (showNotification = true): Promise<boolean> => {
    setSaving(true);
    setSaveFeedback(null);

    try {
      let semesterNum: number | undefined;
      const semMatch = String(formData.currentSemester || '').match(/(\d+)/);
      if (semMatch) {
        const parsed = parseInt(semMatch[1], 10);
        if (parsed >= 1 && parsed <= 12) semesterNum = parsed;
      }

      // 1. Authoritative Backend Update for Core Fields
      const res = await updateStudentProfileBackend({
        fullName: formData.fullName || undefined,
        phone: formData.phone || undefined,
        course: formData.course || formData.degree || undefined,
        currentSemester: semesterNum,
        batchDivision: formData.batchDivision || undefined,
        skills: (formData.skills || []).map((s) => (typeof s === 'string' ? s : s.name)),
        resumeUrl: formData.resumeUrl || undefined,
        avatarUrl: formData.avatarUrl || undefined,
      });

      if (!res.success) {
        if (showNotification) {
          setSaveFeedback({
            type: 'error',
            message: res.error || 'Failed to save progress to server.',
          });
        }
        setSaving(false);
        return false;
      }

      // 2. Persist Extended Fields under authenticated user's ID
      if (currentUser?.id) {
        const extendedPayload = {
          institution: formData.institution,
          degree: formData.degree,
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
          resumeFileName: formData.resumeFileName,
        };
        localStorage.setItem(
          `${LOCAL_STORAGE_KEY_PREFIX}${currentUser.id}`,
          JSON.stringify(extendedPayload)
        );
      }

      // Update official savedProfile state upon verified persistence
      setSavedProfile({ ...formData });

      // Notify Header, Sidebar and layout immediately
      window.dispatchEvent(
        new CustomEvent('interora:user-updated', {
          detail: {
            avatarUrl: formData.avatarUrl,
            fullName: formData.fullName,
            department: formData.department,
          },
        })
      );

      if (showNotification) {
        setSaveFeedback({
          type: 'success',
          message: 'Profile progress saved to your account successfully.',
        });
      }
      setSaving(false);
      return true;
    } catch (err: any) {
      setSaving(false);
      if (showNotification) {
        setSaveFeedback({
          type: 'error',
          message: err?.message || 'An unexpected error occurred while saving.',
        });
      }
      return false;
    }
  };

  const handleNextStep = async () => {
    // Save progress before advancing
    await persistProgress(false);
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Completed onboarding
      if (currentUser?.id) {
        localStorage.setItem(`interora_student_onboarding_done_${currentUser.id}`, 'true');
      }
      navigate('/student/dashboard');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkipForNow = async () => {
    await persistProgress(false);
    if (currentUser?.id) {
      localStorage.setItem(`interora_student_onboarding_skipped_${currentUser.id}`, 'true');
    }
    navigate('/student/dashboard');
  };

  const steps = [
    { number: 1, title: 'Personal & Avatar', icon: User },
    { number: 2, title: 'Academic Info', icon: GraduationCap },
    { number: 3, title: 'Skills & Roles', icon: Sparkles },
    { number: 4, title: 'Portfolio & Projects', icon: Briefcase },
    { number: 5, title: 'Resume & Review', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Preparing your onboarding workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* ── 1. Top Navigation Bar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <img src={APP_INFO.logo} alt={APP_INFO.name} className="h-8 w-auto object-contain" />
              <span className="font-bold text-slate-900 text-lg hidden sm:inline">{APP_INFO.name}</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Student Onboarding
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Official Saved Readiness Pill */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full text-xs">
              <span className="font-medium text-slate-600">Saved Readiness:</span>
              <span
                className={`font-bold ${
                  savedCompletion.percentage === 100 ? 'text-emerald-600' : 'text-indigo-600'
                }`}
              >
                {savedCompletion.percentage}%
              </span>
              <Badge variant={savedCompletion.isComplete ? 'emerald' : 'amber'}>
                {savedCompletion.statusLabel}
              </Badge>
            </div>

            {/* Draft Preview Pill when unsaved changes exist */}
            {draftCompletion.percentage !== savedCompletion.percentage && (
              <div className="hidden md:flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Draft: <strong>{draftCompletion.percentage}%</strong></span>
                <span className="text-[10px] text-amber-600">(Unsaved)</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSkipForNow}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Skip for Now
            </Button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-100 h-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </header>

      {/* ── 2. Main Content Body ── */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        {/* Step Indicator Wizard */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isPast = s.number < currentStep;
              const isCurrent = s.number === currentStep;

              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setCurrentStep(s.number)}
                  className={`flex flex-col items-center text-center p-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                      : isPast
                      ? 'text-emerald-700 hover:bg-slate-50'
                      : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[11px] font-semibold truncate w-full hidden sm:block">
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback alerts */}
        {saveFeedback && (
          <Alert
            type={saveFeedback.type}
            title={saveFeedback.type === 'success' ? 'Progress Saved' : 'Save Error'}
          >
            {saveFeedback.message}
          </Alert>
        )}

        {/* ── STEP 1: PERSONAL & AVATAR ── */}
        {currentStep === 1 && (
          <Card
            title="Step 1: Personal & Contact Information"
            subtitle="Essential details to identify you to campus TPO administrators and corporate recruiters"
          >
            <div className="space-y-6">
              {/* Optional Profile Picture Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <ProfilePictureUploader
                  currentAvatarUrl={formData.avatarUrl}
                  fullName={formData.fullName || 'Student'}
                  onAvatarChange={(newUrl) => {
                    setFormData((prev) => ({ ...prev, avatarUrl: newUrl }));
                    setSavedProfile((prev) => (prev ? { ...prev, avatarUrl: newUrl } : null));
                  }}
                  allowImmediateSave={true}
                />
              </div>

              {/* Required & Optional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Full Legal Name *"
                    required
                    placeholder="e.g. Rohan Mehta"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Official campus name</span>
                </div>

                <div>
                  <Input
                    label="Official Email Address *"
                    type="email"
                    required
                    disabled
                    value={formData.email || ''}
                    className="bg-slate-100 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Used for official communication</span>
                </div>

                <div>
                  <Input
                    label="Mobile Contact Number *"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Direct contact for interview schedules</span>
                </div>

                <div>
                  <Input
                    label="Target Internship Locations"
                    placeholder="e.g. Pune, Bangalore, Remote"
                    value={(formData.preferredLocations || []).join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredLocations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Preferred cities for placement</span>
                </div>
              </div>

              <div>
                <Input
                  label="Professional Bio / Elevator Pitch"
                  placeholder="e.g. Dedicated software engineering student enthusiastic about scalable distributed systems and modern web frameworks..."
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Short 2-3 line summary displayed to hiring teams</span>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 2: ACADEMIC INFORMATION ── */}
        {currentStep === 2 && (
          <Card
            title="Step 2: Academic Information"
            subtitle="Campus enrollment, department, degree program, and verified semester status"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Academic Department / Branch *"
                  required
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  options={
                    departments.length > 0
                      ? departments.map((d) => ({ value: d.name, label: `${d.name} (${d.code})` }))
                      : [
                          { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
                          { value: 'Information Technology', label: 'Information Technology (IT)' },
                          { value: 'Electronics & Telecommunication', label: 'Electronics & Telecommunication (E&TC)' },
                        ]
                  }
                />

                <Input
                  label="Degree Program *"
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  value={formData.course || formData.degree || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value, degree: e.target.value })
                  }
                />

                <Input
                  label="Roll Number / Student PRN *"
                  required
                  placeholder="e.g. CS2026-089"
                  value={formData.studentId || formData.rollNo || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value, rollNo: e.target.value })
                  }
                />

                <Input
                  label="Current Semester *"
                  required
                  placeholder="e.g. 6th Semester"
                  value={String(formData.currentSemester || '')}
                  onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                />

                <Input
                  label="College / Institution"
                  placeholder="e.g. Indian Institute of Information Technology"
                  value={formData.institution || ''}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />

                <Input
                  label="Current CGPA / Percentage"
                  placeholder="e.g. 8.5 / 10.0"
                  value={formData.cgpa || ''}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                />

                <Input
                  label="Batch Year"
                  placeholder="2026"
                  value={String(formData.batchYear || '2026')}
                  onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                />

                <Input
                  label="Batch Division"
                  placeholder="CS1"
                  value={formData.batchDivision || 'CS1'}
                  onChange={(e) => setFormData({ ...formData, batchDivision: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 3: SKILLS & CAREER INTERESTS ── */}
        {currentStep === 3 && (
          <Card
            title="Step 3: Technical Skills & Career Goals"
            subtitle="Competencies used by Interora AI matchmaking to align you with top internship listings"
          >
            <div className="space-y-6">
              {/* Technical Skills List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Technical & Soft Skills * <span className="font-normal text-slate-400">(Minimum 2 required)</span>
                  </label>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    {(formData.skills || []).length} Skills Added
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 min-h-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  {(formData.skills || []).map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s.name;
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-300 text-slate-800 shadow-2xs"
                      >
                        {skillName}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skillName)}
                          className="ml-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  {(formData.skills || []).length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills added yet. Type below to add.</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Add a skill (e.g. React, Python, Docker, SQL)"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddSkill}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Preferred Career Roles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Target Career Roles * <span className="font-normal text-slate-400">(At least 1 required)</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 min-h-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  {(formData.preferredRoles || []).map((role, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(role)}
                        className="ml-1.5 text-indigo-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(formData.preferredRoles || []).length === 0 && (
                    <span className="text-xs text-slate-400 italic">No target roles selected.</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="e.g. Frontend Developer, Machine Learning Intern"
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRole();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddRole}>
                    <Plus className="w-4 h-4 mr-1" /> Add Role
                  </Button>
                </div>
              </div>

              {/* Availability */}
              <div className="pt-2 border-t border-slate-100">
                <Input
                  label="Internship Availability Status"
                  placeholder="e.g. Immediate (Summer Internship 2026)"
                  value={formData.availability || ''}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 4: PORTFOLIO & PROJECTS (OPTIONAL) ── */}
        {currentStep === 4 && (
          <Card
            title="Step 4: Portfolio, Projects & Certifications"
            subtitle="Showcase tangible technical proof of work to prospective hiring managers (Optional)"
          >
            <div className="space-y-6">
              {/* Online Social Links */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Developer Profiles & Social Presence</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="GitHub Profile URL"
                    placeholder="https://github.com/your-username"
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  />
                  <Input
                    label="LinkedIn Profile URL"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={formData.linkedinUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  />
                  <Input
                    label="Portfolio Website"
                    placeholder="https://yourportfolio.dev"
                    value={formData.portfolioUrl || ''}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Featured Projects List */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Featured Projects</h4>
                  <span className="text-[11px] text-slate-500">{(formData.projects || []).length} Projects</span>
                </div>

                <div className="space-y-2">
                  {(formData.projects || []).map((proj: any) => (
                    <div
                      key={proj.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900">{proj.title}</span>
                        <p className="text-[11px] text-slate-600">{proj.description}</p>
                        {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
                          <p className="text-[10px] text-indigo-600 font-mono">Stack: {proj.techStack.join(', ')}</p>
                        )}
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
                <div className="p-3 bg-white border border-dashed border-indigo-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-indigo-900 block">+ Add Project</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Project Title"
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Technologies (comma-separated)"
                      value={projTech}
                      onChange={(e) => setProjTech(e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Short description of technical implementation"
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="GitHub Link (Optional)"
                      value={projGithub}
                      onChange={(e) => setProjGithub(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddProject}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                    </Button>
                  </div>
                </div>
              </div>

              {/* Certifications List */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">External Certifications</h4>
                  <span className="text-[11px] text-slate-500">{(formData.certifications || []).length} Added</span>
                </div>

                <div className="space-y-1.5">
                  {(formData.certifications || []).map((c: any) => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{c.title}</span>
                        <p className="text-[10px] text-slate-500">{c.issuer} • {c.issueDate}</p>
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
                    placeholder="Certification Name"
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Issuing Org"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    className="w-full sm:w-44"
                  />
                  <Input
                    placeholder="Year"
                    value={certYear}
                    onChange={(e) => setCertYear(e.target.value)}
                    className="w-full sm:w-28"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddCert}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Cert
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 5: RESUME & FINAL REVIEW ── */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {/* Resume Upload Card */}
            <Card
              title="Step 5: Resume Attachment & Final Verification"
              subtitle="Attach your primary PDF resume for AI parsing and recruiter ATS screening"
            >
              <div className="space-y-4">
                <div className="p-5 border-2 border-dashed border-indigo-200 rounded-xl text-center space-y-2 bg-indigo-50/20">
                  <FileText className="w-8 h-8 text-indigo-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">Upload Text-Based PDF Resume (Max 5MB)</p>
                  <p className="text-[11px] text-slate-500">
                    Active File: {formData.resumeFileName || formData.resumeUrl || 'None uploaded yet (Optional)'}
                  </p>

                  <label className="inline-block">
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleResumeUpload}
                      disabled={resumeUploading}
                      className="hidden"
                    />
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      {resumeUploading ? 'Uploading...' : 'Select PDF File'}
                    </span>
                  </label>

                  {resumeUploadMsg && (
                    <p className="text-xs font-medium text-indigo-700 pt-1">{resumeUploadMsg}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Profile Completion Readiness Summary */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-900/60 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Official Saved Readiness
                    </span>
                    {draftCompletion.percentage !== savedCompletion.percentage && (
                      <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Draft Preview: {draftCompletion.percentage}% (Unsaved)
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white pt-1">
                    Status: {savedCompletion.statusLabel} ({savedCompletion.percentage}%)
                  </h3>
                  <p className="text-xs text-slate-300">
                    {savedCompletion.completedCount} of {savedCompletion.totalCount} required fields verified & saved
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-emerald-300">
                    {savedCompletion.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-400 to-emerald-400 transition-all duration-700"
                  style={{ width: `${savedCompletion.percentage}%` }}
                />
              </div>

              {/* Required Fields Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                {savedCompletion.requiredCriteria.map((c) => (
                  <div
                    key={c.id}
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      c.isValid
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {c.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                      )}
                      <span className="truncate">{c.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase">
                      {c.isValid ? 'Saved & Verified' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Missing Requirements Guidance */}
              {savedCompletion.missingList.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1">
                  <span className="font-bold block">Remaining Required Information:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300">
                    {savedCompletion.missingList.map((m) => (
                      <li key={m.id}>
                        <span className="font-semibold">{m.label}:</span> {m.missingHint}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-400 pt-1">
                    You can still proceed to your dashboard now. Complete missing items later under "Student Profile".
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 3. Bottom Action Bar (Back, Save Progress, Continue) ── */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <Button type="button" variant="outline" size="sm" onClick={handlePrevStep}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={handleSkipForNow}>
                Skip for Now
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => persistProgress(true)}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-1.5 text-slate-500" />
              {saving ? 'Saving...' : 'Save Progress'}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-xs font-semibold"
            >
              <span>{currentStep === 5 ? 'Finish & Open Dashboard' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
