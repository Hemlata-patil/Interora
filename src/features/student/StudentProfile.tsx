import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Input, Select, Badge, Alert } from '@/components';
import { User, FileText, Plus, Trash2, Save, X } from 'lucide-react';
import {
  initialStudentProfileData,
  type StudentProfileData,
  type StudentSkill,
} from './data/mockStudentData';
import { supabase } from '@/services/supabase/supabaseClient';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData>(initialStudentProfileData);
  const [studentRollNo, setStudentRollNo] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentProfileData>(initialStudentProfileData);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [saveNotification, setSaveNotification] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const userEmail = userData.user.email || '';
      const metaName = userData.user.user_metadata?.full_name || '';

      const { data: studentData, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (studentData && !error) {
        setStudentRollNo(studentData.student_id || '');
        const loaded: StudentProfileData = {
          fullName: studentData.full_name || metaName || 'Student',
          email: userEmail,
          phone: studentData.phone || '',
          institution: 'Raisoni Institute of Engineering & Technology',
          degree: studentData.course || 'B.Tech',
          department: studentData.department || 'Computer Science & Engineering',
          yearSemester: '3rd Year / 6th Semester',
          cgpa: studentData.cgpa || '8.5 / 10.0',
          resumeHeadline: studentData.bio || 'Motivated student seeking internship opportunities.',
          resumeFileName: 'Resume_Verified.pdf',
          skills: initialStudentProfileData.skills,
          interests: initialStudentProfileData.interests,
          preferredRoles: ['Software Engineer', 'Web Developer'],
          preferredLocations: ['Remote', 'Pune', 'Mumbai'],
          availability: 'Immediate (Full-Time)',
        };
        setProfile(loaded);
        setFormData(loaded);
      } else {
        setProfile((prev) => ({
          ...prev,
          fullName: metaName || prev.fullName,
          email: userEmail || prev.email,
        }));
        setFormData((prev) => ({
          ...prev,
          fullName: metaName || prev.fullName,
          email: userEmail || prev.email,
        }));
      }
    };

    fetchStudentProfile();
  }, []);

  const handleEdit = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { error } = await supabase
        .from('student_profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          department: formData.department,
          course: formData.degree,
          student_id: studentRollNo,
          cgpa: formData.cgpa,
          bio: formData.resumeHeadline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.user.id);

      if (error) {
        console.error('[StudentProfile] Update error:', error);
        setSaveError(error.message);
        return;
      }
    }

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Student Profile & Verification"
        description="Manage your academic credentials, verified skills, and internship preferences."
      />

      {saveNotification && (
        <Alert type="success" title="Profile Saved Successfully">
          Your student profile and career parameters have been updated.
        </Alert>
      )}

      {saveError && (
        <Alert type="error" title="Profile Save Error">
          {saveError}
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Header Action Card */}
        <Card className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 rounded-2xl border-none">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center border-2 border-indigo-400/50 shadow-md">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile.fullName}</h2>
                <p className="text-xs text-indigo-200">{profile.email} • {studentRollNo || 'Student Roll No'}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="indigo">Verified Student</Badge>
                  <Badge variant="emerald">{profile.department}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              {!isEditing ? (
                <Button type="button" variant="secondary" onClick={handleEdit}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="button" variant="ghost" className="text-white hover:bg-white/10" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-500">
                    <Save className="w-4 h-4 mr-1" /> Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* 1. Basic Information */}
        <Card title="Basic Personal Information" subtitle="Official contact parameters">
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-slate-800">{profile.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-semibold text-slate-800">{profile.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                <span className="font-semibold text-slate-800">{profile.phone || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Student Roll No.</span>
                <span className="font-semibold text-slate-800">{studentRollNo || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <Input label="Email" value={formData.email} disabled />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Student ID"
                value={studentRollNo}
                onChange={(e) => setStudentRollNo(e.target.value)}
              />
            </div>
          )}
        </Card>

        {/* 2. Academic Background */}
        <Card title="Academic Background" subtitle="Enrolled program and academic performance">
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Institution</span>
                <span className="font-semibold text-slate-800">{profile.institution}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Degree Program</span>
                <span className="font-semibold text-slate-800">{profile.degree}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department / Branch</span>
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
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs max-w-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{profile.resumeFileName}</span>
                      <span className="text-[10px] text-slate-400">Uploaded on 2026-08-01</span>
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
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center space-y-1 bg-slate-50/50">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">Upload new resume file (.pdf, max 5MB)</p>
                  <p className="text-[10px] text-slate-400">{`Current file: ${formData.resumeFileName}`}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2">
                    Choose PDF File
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
