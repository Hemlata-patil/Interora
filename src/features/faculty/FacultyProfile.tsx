import React, { useState } from 'react';
import { PageHeader, Card, Badge, Button, Input } from '@/components';
import { GraduationCap, Mail, Building, Phone, Edit3, Save, Users, BookOpen } from 'lucide-react';

export const FacultyProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Dr. Rajesh Sharma',
    facultyId: 'FAC-801',
    designation: 'Professor & Head of Department',
    department: 'Computer Science & Engineering',
    email: 'rajesh.sharma@college.edu',
    phone: '+91 98765 11223',
    officeLocation: 'Tech Block, Room 302',
    assignedStudentsCount: 3,
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Advisor Profile"
        description="Manage your academic mentor account credentials, departmental information, and contact details."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-slate-200 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-700 font-bold text-2xl">
            <GraduationCap className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">{profile.name}</h3>
          <p className="text-xs text-slate-500 mb-1">{profile.designation}</p>
          <p className="text-[11px] text-slate-400 font-mono mb-3">{profile.facultyId}</p>
          <Badge variant="indigo">FACULTY MENTOR</Badge>
        </Card>

        <Card className="p-6 bg-white border border-slate-200 md:col-span-2 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="font-bold text-slate-800 text-sm">Academic Profile Details</h4>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-indigo-600 text-xs">
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Profile
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block mb-1">Full Name</span>
              {isEditing ? (
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              ) : (
                <span className="font-semibold text-slate-700">{profile.name}</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Official Email</span>
              {isEditing ? (
                <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              ) : (
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" /> {profile.email}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Academic Department</span>
              {isEditing ? (
                <Input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
              ) : (
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> {profile.department}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Designation</span>
              {isEditing ? (
                <Input value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} />
              ) : (
                <span className="font-semibold text-slate-700">{profile.designation}</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Contact Phone</span>
              {isEditing ? (
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              ) : (
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" /> {profile.phone}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Office Location</span>
              {isEditing ? (
                <Input value={profile.officeLocation} onChange={(e) => setProfile({ ...profile, officeLocation: e.target.value })} />
              ) : (
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-600" /> {profile.officeLocation}
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
