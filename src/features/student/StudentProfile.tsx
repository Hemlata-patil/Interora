import React, { useState, useEffect, useRef } from 'react';
import { PageHeader, Card, Badge, Button, Input, Select, Alert } from '@/components';
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
  AlertCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/services/supabase/supabaseClient';
import { uploadStudentResumeBackend } from '@/services/api/backendService';

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

  // Skill state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const loadProfile = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setLoading(false);
        return;
      }

      const userId = userData.user.id;
      const userMeta = userData.user.user_metadata || {};

      // 1. Fetch Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // 2. Fetch Student Profile
      const { data: studentProf } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const mergedProfile: StudentProfileData = {
        fullName: prof?.full_name || userMeta.full_name || defaultStudentProfile.fullName,
        email: prof?.email || userData.user.email || defaultStudentProfile.email,
        phone: prof?.phone || userMeta.phone || defaultStudentProfile.phone,
        rollNo: userMeta.student_id || defaultStudentProfile.rollNo,
        department: prof?.department || userMeta.department || defaultStudentProfile.department,
        institution: defaultStudentProfile.institution,
        degree: userMeta.course || defaultStudentProfile.degree,
        yearSemester: userMeta.year_semester || defaultStudentProfile.yearSemester,
        cgpa: studentProf?.cgpa || defaultStudentProfile.cgpa,
        resumeHeadline: studentProf?.bio || defaultStudentProfile.resumeHeadline,
        resumeFileName: defaultStudentProfile.resumeFileName,
        skills: defaultStudentProfile.skills,
        interests: defaultStudentProfile.interests,
        preferredRoles: defaultStudentProfile.preferredRoles,
        preferredLocations: defaultStudentProfile.preferredLocations,
        availability: defaultStudentProfile.availability,
      };

      setProfile(mergedProfile);
      setFormData(mergedProfile);
    } catch (err: any) {
      console.warn('[StudentProfile] Note loading profile:', err.message);
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
      setFormData((prev: StudentProfileData) => ({
        ...prev,
        resumeFileName: res.fileName || file.name,
      }));
      setProfile((prev: StudentProfileData) => ({
        ...prev,
        resumeFileName: res.fileName || file.name,
      }));
      setResumeUploadSuccess('Resume ' + file.name + ' uploaded and saved to Supabase Storage.');
    } else {
      setResumeUploadError(res.error || 'Failed to upload resume to Supabase Storage.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const userId = userData.user.id;

        // 1. Update Profiles table
        await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            phone: formData.phone,
            department: formData.department,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // 2. Update Student Profiles table
        await supabase
          .from('student_profiles')
          .update({
            cgpa: formData.cgpa,
            bio: formData.resumeHeadline,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }

      setProfile(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      console.error('[StudentProfile] Save Error:', err);
      setSaveError(err.message || 'Failed to save student profile.');
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
          Your student profile and academic records have been persisted to the Supabase database.
        </Alert>
      )}

      {saveError && (
        <Alert type="error" title="Save Failed">
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
        <Card title="Resume and Professional Summary" subtitle="Primary PDF attachment for internship applications (persisted in Supabase Storage)">
          <div className="space-y-4">
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
              <div className="space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{profile.resumeHeadline}</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs max-w-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{profile.resumeFileName}</span>
                      <span className="text-[10px] text-slate-400">PDF Verified & Active</span>
                    </div>
                  </div>
                  <Badge variant="indigo">PDF Verified</Badge>
                </div>
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
                    {resumeUploading ? 'Uploading to Supabase...' : 'Choose PDF File'}
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
