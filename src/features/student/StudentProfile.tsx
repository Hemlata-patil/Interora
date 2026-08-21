import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Input, Select, Badge } from '@/components';
import { User, GraduationCap, Award, FileText, Briefcase, Check, Plus, Trash2, Save, X, Upload, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import {
  initialStudentProfileData,
  type StudentProfileData,
  type StudentSkill,
} from './data/mockStudentData';
import { supabase } from '@/services/supabase/supabaseClient';
import { uploadStudentResumeBackend } from '@/services/api/backendService';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData>(initialStudentProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentProfileData>(initialStudentProfileData);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [saveNotification, setSaveNotification] = useState(false);

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(null);

  // Fetch initial student profile data from Supabase
  useEffect(() => {
    const loadStudentProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data: sp } = await supabase
        .from('student_profiles')
        .select('resume_url, resume_filename, department, course, year_semester')
        .eq('id', authData.user.id)
        .single();

      if (sp) {
        setProfile((prev) => ({
          ...prev,
          department: sp.department || prev.department,
          resumeUrl: sp.resume_url || undefined,
          resumeFileName: sp.resume_filename || prev.resumeFileName,
        }));
        setFormData((prev) => ({
          ...prev,
          department: sp.department || prev.department,
          resumeUrl: sp.resume_url || undefined,
          resumeFileName: sp.resume_filename || prev.resumeFileName,
        }));
      }
    };

    loadStudentProfile();
  }, []);

  const handleEdit = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...formData });
    setIsEditing(false);
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 4000);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: StudentSkill = {
      id: `s_${Date.now()}`,
      name: newSkillName.trim(),
      category: 'technical',
      level: newSkillLevel,
    };
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
    setNewSkillName('');
  };

  const handleRemoveSkill = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  // Resume PDF File Selection & Upload Handler
  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeUploadError(null);
    setResumeUploadSuccess(null);

    // Validate PDF type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeUploadError('Only PDF files (.pdf) are allowed for resume upload.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadError('Resume file size must be less than 5MB.');
      return;
    }

    setUploadingResume(true);
    const res = await uploadStudentResumeBackend(file);
    setUploadingResume(false);

    if (!res.success) {
      setResumeUploadError(res.error || 'Failed to upload resume PDF to Supabase Storage.');
    } else {
      setResumeUploadSuccess('Resume PDF uploaded successfully and persisted to profile!');
      const updatedUrl = res.url;
      const updatedName = res.fileName || file.name;

      setProfile((prev) => ({
        ...prev,
        resumeUrl: updatedUrl,
        resumeFileName: updatedName,
      }));
      setFormData((prev) => ({
        ...prev,
        resumeUrl: updatedUrl,
        resumeFileName: updatedName,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Profile & Qualifications"
        description="Manage your academic portfolio, skills, resume PDF, and career preferences."
        action={
          !isEditing ? (
            <Button variant="primary" size="sm" onClick={handleEdit}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" /> Save Changes
              </Button>
            </div>
          )
        }
      />

      {saveNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile saved successfully.</span>
        </div>
      )}

      {resumeUploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{resumeUploadSuccess}</span>
        </div>
      )}

      {resumeUploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{resumeUploadError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Basic Info & Avatar */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0">
              AJ
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3 w-full">
              {!isEditing ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
                      <p className="text-xs text-indigo-600 font-semibold">CS-2026-0842</p>
                    </div>
                    <Badge variant="emerald">Verified Student</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>Email: <span className="font-semibold text-slate-800">{profile.email}</span></div>
                    <div>Phone: <span className="font-semibold text-slate-800">{profile.phone}</span></div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 2. Academic Background */}
        <Card title="Academic Background" subtitle="Verified university enrollment and department metrics">
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Institution</span>
                <span className="font-semibold text-slate-800">{profile.institution}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Program & Year</span>
                <span className="font-semibold text-slate-800">{profile.degree} &bull; {profile.yearSemester}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-semibold text-slate-800">{profile.department}</span>
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
              {(isEditing ? formData.skills : profile.skills).map((skill) => (
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
        <Card title="Resume and Professional Summary" subtitle="Primary attachment for internship applications">
          <div className="space-y-4">
            {!isEditing ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{profile.resumeHeadline}</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">{profile.resumeFileName}</span>
                      <span className="text-[10px] text-slate-400">PDF Document &bull; Verified Attachment</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.resumeUrl ? (
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <span>View Resume</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    ) : (
                      <Badge variant="indigo">Attachment Ready</Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Professional Headline"
                  value={formData.resumeHeadline}
                  onChange={(e) => setFormData({ ...formData, resumeHeadline: e.target.value })}
                />
                <div className="p-5 border-2 border-dashed border-slate-300 hover:border-indigo-500 transition-colors rounded-xl text-center space-y-2 bg-slate-50/50">
                  <FileText className="w-8 h-8 text-indigo-600 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Upload New Resume PDF (.pdf, max 5MB)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{`Current file: ${formData.resumeFileName}`}</p>
                  </div>

                  <div className="pt-2">
                    <label className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors space-x-2">
                      {uploadingResume ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                          <span>Uploading PDF to Supabase Storage...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1.5" />
                          <span>Choose PDF File to Replace</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleResumeFileChange}
                        disabled={uploadingResume}
                        className="hidden"
                      />
                    </label>
                  </div>
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
                  {profile.preferredRoles.map((role, i) => (
                    <Badge key={i} variant="neutral">{role}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Target Locations</span>
                <div className="flex flex-wrap gap-1">
                  {profile.preferredLocations.map((loc, i) => (
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
