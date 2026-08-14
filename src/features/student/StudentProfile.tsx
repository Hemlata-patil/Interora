import React, { useState } from 'react';
import { PageHeader, Card, Button, Input, Select, Badge, Alert } from '@/components';
import { User, GraduationCap, Award, FileText, Briefcase, Check, Plus, Trash2, Save, X } from 'lucide-react';
import {
  initialStudentProfileData,
  type StudentProfileData,
  type StudentSkill,
} from './data/mockStudentData';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData>(initialStudentProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentProfileData>(initialStudentProfileData);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [saveNotification, setSaveNotification] = useState(false);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Profile and Career Preferences"
        description="Manage your academic records, technical skills, resume, and internship targets."
        action={
          !isEditing ? (
            <Button variant="primary" size="sm" onClick={handleEdit}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
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
        <Alert type="success" title="Profile Saved">
          Your profile details and career preferences have been updated locally. (Supabase persistence ready for Phase 2).
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Personal Information */}
        <Card title="Personal Information" subtitle="Basic contact details for mentors and companies">
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.phone}</span>
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
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          )}
        </Card>

        {/* 2. Academic / Education Information */}
        <Card title="Education and Institutional Metadata" subtitle="University enrollment and academic standing">
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
                <span className="text-slate-400 block text-[11px]">Department and Semester</span>
                <span className="font-semibold text-slate-800">{`${profile.department} (${profile.yearSemester})`}</span>
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