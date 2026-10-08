import React, { useEffect, useState } from 'react';
import { getCurrentUserBackend } from '@/services/api/backendService';
import { apiClient } from '@/services/api/apiClient';

export const HodProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const authUser = await getCurrentUserBackend();
    if (authUser) {
      setUser(authUser);
      setEditName(authUser.fullName || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    setSaveLoading(true);
    
    try {
      await apiClient.patch('/auth/me', { fullName: editName });
      await fetchUser(); // reload the user with the new name
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading Profile...</div>;
  if (!user) return <div className="p-8">No profile found.</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">HOD Profile</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg max-w-2xl text-sm mb-4">
          Profile updated successfully!
        </div>
      )}

      {saveError && (
        <div className="bg-rose-50 text-rose-600 p-3 rounded-lg max-w-2xl text-sm mb-4">
          {saveError}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs max-w-2xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
            <span className="text-slate-500 font-medium text-sm flex items-center">Full Name</span>
            <div className="md:col-span-2">
              {isEditing ? (
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                <span className="text-slate-900 font-semibold text-lg">{user.fullName}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
            <span className="text-slate-500 font-medium text-sm">Role</span>
            <span className="md:col-span-2 text-slate-900 font-medium capitalize">{user.role}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
            <span className="text-slate-500 font-medium text-sm">Department</span>
            <span className="md:col-span-2 text-slate-900 font-medium">
              {user.departmentName || 'Not Assigned'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
            <span className="text-slate-500 font-medium text-sm">Email Address</span>
            <span className="md:col-span-2 text-slate-900 font-medium text-slate-500">{user.email}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pb-2">
            <span className="text-slate-500 font-medium text-sm">Account Status</span>
            <span className="md:col-span-2 text-slate-900 font-medium capitalize">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">
                {user.accountStatus}
              </span>
            </span>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditName(user.fullName || '');
                setSaveError(null);
              }}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold"
              disabled={saveLoading}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saveLoading || !editName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
