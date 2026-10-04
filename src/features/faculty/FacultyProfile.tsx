import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, Card, Badge, Button, Input } from '@/components';
import { GraduationCap, Mail, Building, Phone, Edit3, Save, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import {
  getCurrentUserBackend,
  updateFacultyProfileBackend,
  fetchFacultyAssignedStudentsBackend,
} from '@/services/api/backendService';

export const FacultyProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: '',
    facultyId: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    officeLocation: '',
    assignedStudentsCount: 0,
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [user, assignedStudents] = await Promise.all([
        getCurrentUserBackend(),
        fetchFacultyAssignedStudentsBackend().catch(() => []),
      ]);

      if (user) {
        const fp = user.facultyProfile;
        const deptName = typeof fp?.department === 'object' && fp?.department?.name 
          ? fp.department.name 
          : (typeof fp?.department === 'string' ? fp.department : 'Computer Science & Engineering');

        setProfile({
          name: user.fullName || 'Faculty Mentor',
          facultyId: fp?.facultyId || `FAC-${user.id.substring(0, 6).toUpperCase()}`,
          designation: fp?.designation || 'Faculty Advisor & Mentor',
          department: deptName,
          email: user.email || '',
          phone: user.phone || fp?.officePhone || '+91 98765 00000',
          officeLocation: fp?.cabinLocation || 'Academic Block, Faculty Wing',
          assignedStudentsCount: (assignedStudents || []).length,
        });
      }
    } catch (err: any) {
      console.error('Failed to load faculty profile:', err);
      setError(err?.message || 'Failed to load faculty profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateFacultyProfileBackend({
        fullName: profile.name,
        phone: profile.phone,
        designation: profile.designation,
        cabinLocation: profile.officeLocation,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update faculty profile:', err);
      alert(err?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm">Loading faculty profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-rose-600 space-y-3">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={loadProfile}>
          Retry
        </Button>
      </div>
    );
  }

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
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Assigned Students: <span className="font-semibold text-slate-800">{profile.assignedStudentsCount}</span>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-200 md:col-span-2 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="font-bold text-slate-800 text-sm">Academic Profile Details</h4>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-indigo-600 text-xs">
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Profile
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="text-xs">
                <Save className="w-3.5 h-3.5 mr-1" /> {saving ? 'Saving...' : 'Save Changes'}
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
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" /> {profile.email}
              </span>
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
