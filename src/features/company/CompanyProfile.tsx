import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Input, Badge, Alert } from '@/components';
import { Building2, Mail, Phone, Globe, UploadCloud, CheckCircle2, AlertCircle, Clock, X, Save, Edit3, User } from 'lucide-react';
import { mockCompanyProfile, setMockCompanyProfile } from '../faculty/mockData';
import type { CompanyProfileData } from '../faculty/mockData';

// Export a getter so dashboard can access the current mock state
export const getMockCompanyProfile = () => mockCompanyProfile;

export const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfileData | null>(mockCompanyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CompanyProfileData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Sync state on mount just in case
  useEffect(() => {
    setProfile(mockCompanyProfile);
  }, []);

  const handleStartCreate = () => {
    setIsCreating(true);
    setFormData({
      companyName: '',
      industry: '',
      description: '',
      logo: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
    });
    setErrors({});
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setFormData(profile || {});
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName?.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.industry?.trim()) newErrors.industry = 'Industry is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.contactPerson?.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const newProfile: CompanyProfileData = {
      ...(formData as CompanyProfileData),
      id: profile?.id || `company-${Math.random().toString(36).substr(2, 9)}`,
      verificationStatus: profile?.verificationStatus || 'pending'
    };
    
    setMockCompanyProfile(newProfile); // update global mock
    setProfile(newProfile);
    setIsCreating(false);
    setIsEditing(false);
    setSuccessMessage(profile ? 'Company profile updated successfully.' : 'Company profile created successfully. Your profile has been submitted for verification.');
    
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // State 1: NO PROFILE
  if (!profile && !isCreating) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-8">
        <PageHeader
          title="Company Profile"
          description="Manage your company information and verification details."
        />
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Building2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Create Your Company Profile</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Complete your company profile to start managing internships and applicants.
          </p>
          <Button onClick={handleStartCreate} size="lg" className="px-8 shadow-md">
            Create Company Profile
          </Button>
        </div>
      </div>
    );
  }

  const isFormActive = isCreating || isEditing;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <PageHeader
        title={isCreating ? "Create Your Company Profile" : "Company Profile"}
        description={isCreating ? "Fill in the details below to submit your profile for verification." : "Manage your company information and verification details."}
      />

      {successMessage && (
        <Alert type="success" title="Success" className="animate-in fade-in slide-in-from-top-2">
          {successMessage}
        </Alert>
      )}

      {!isFormActive && profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Top Overview Card */}
            <Card className="overflow-hidden p-0 border-0 shadow-sm">
              <div className="p-6 bg-white border border-slate-200 rounded-xl">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    {profile.logo ? (
                      <img src={profile.logo} alt={profile.companyName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building2 className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.companyName}</h2>
                        <p className="text-slate-600 font-medium mt-1">{profile.industry}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleStartEdit} className="shrink-0 gap-2 border-slate-200 hover:bg-slate-50 text-slate-700">
                        <Edit3 className="w-4 h-4" /> Edit Profile
                      </Button>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2">
                      {profile.verificationStatus === 'verified' && <Badge variant="emerald" className="px-3 py-1 text-sm font-medium"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Verified</Badge>}
                      {profile.verificationStatus === 'pending' && <Badge variant="amber" className="px-3 py-1 text-sm font-medium"><Clock className="w-4 h-4 mr-1.5" /> Pending Verification</Badge>}
                      {profile.verificationStatus === 'rejected' && <Badge variant="rose" className="px-3 py-1 text-sm font-medium"><AlertCircle className="w-4 h-4 mr-1.5" /> Rejected</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Company Info Card */}
            <Card title="Company Information" className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-slate-700 leading-relaxed text-sm bg-slate-50/50 p-4 rounded-lg border border-slate-100">{profile.description}</p>
                </div>
              </div>
            </Card>

            {/* Contact Info Card */}
            <Card title="Contact Information" className="shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Contact Person</h4>
                    <p className="text-slate-900 font-medium text-sm">{profile.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email Address</h4>
                    <p className="text-slate-900 font-medium text-sm">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Phone Number</h4>
                    <p className="text-slate-900 font-medium text-sm">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Website</h4>
                    <p className="text-indigo-600 font-medium text-sm">{profile.website ? <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline">{profile.website}</a> : 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
             {/* Verification Status Card */}
            <Card title="Company Verification" className="h-fit shadow-sm border-t-4 border-t-indigo-600">
              <div className="flex flex-col items-center text-center py-2">
                {profile.verificationStatus === 'verified' && (
                  <>
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Verified</h3>
                    <p className="text-sm text-slate-600">Your company is verified and can publish internship listings.</p>
                  </>
                )}
                {profile.verificationStatus === 'pending' && (
                  <>
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
                      <Clock className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Pending Verification</h3>
                    <p className="text-sm text-slate-600">Your company profile is currently under administrator review.</p>
                    <div className="mt-4 p-3 bg-amber-50/50 rounded-lg text-xs text-amber-800 text-left w-full border border-amber-100/50 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Your company must be verified before you can publish internship listings.</span>
                    </div>
                  </>
                )}
                {profile.verificationStatus === 'rejected' && (
                  <>
                    <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-3">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Verification Rejected</h3>
                    <p className="text-sm text-slate-600">Your company profile requires changes before it can be verified.</p>
                    <div className="mt-4 p-3 bg-rose-50/50 rounded-lg text-xs text-rose-800 text-left w-full border border-rose-100/50 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>Your company must be verified before you can publish internship listings.</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

             {/* Profile Completion Indicator */}
            <Card title="Profile Completion" className="h-fit shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Completion</span>
                  <span className="font-bold text-indigo-600">100%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="pt-2 text-xs text-slate-500 space-y-2 font-medium">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Company Name</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Industry</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Description</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Contact Info</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Form State (Create or Edit) */}
      {isFormActive && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <Card title="Section 1 — Company Information" className="shadow-sm">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-24 h-24 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center shrink-0 text-slate-400 hover:bg-slate-100 hover:border-indigo-300 hover:text-indigo-500 transition-colors cursor-pointer">
                  <UploadCloud className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Logo</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-slate-800">Company Logo</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Upload your company logo. Recommended size: 400x400px. PNG or JPG.</p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs font-semibold text-slate-700 border-slate-300">Choose File</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <Input 
                  label="Company Name *"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleInputChange}
                  error={errors.companyName}
                  placeholder="e.g. TechData Solutions"
                />
                <Input 
                  label="Industry *"
                  name="industry"
                  value={formData.industry || ''}
                  onChange={handleInputChange}
                  error={errors.industry}
                  placeholder="e.g. Technology & Data Analytics"
                />
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Company Description *</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Briefly describe what your company does and your core business..."
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`}
                  />
                  {errors.description && <p className="text-xs text-red-600 font-medium">{errors.description}</p>}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Section 2 — Contact Information" className="shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Contact Person *"
                name="contactPerson"
                value={formData.contactPerson || ''}
                onChange={handleInputChange}
                error={errors.contactPerson}
                placeholder="e.g. Anita Sharma"
              />
              <Input 
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="e.g. hr@techdata.example"
              />
              <Input 
                label="Phone Number"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                placeholder="e.g. +91 90000 00000"
              />
              <Input 
                label="Website"
                name="website"
                value={formData.website || ''}
                onChange={handleInputChange}
                placeholder="e.g. https://techdata.example"
              />
            </div>
          </Card>

          <Card title="Section 3 — Verification Information" className="shadow-sm bg-slate-50/50">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-800 text-sm">Verification Status</span>
                <Badge variant={isCreating ? 'amber' : (profile?.verificationStatus === 'verified' ? 'emerald' : profile?.verificationStatus === 'rejected' ? 'rose' : 'amber')} className="px-3 py-1 font-semibold text-xs">
                  {isCreating ? 'PENDING' : (profile?.verificationStatus || 'Pending').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {isCreating 
                  ? "After you create your profile, an administrator will review your company information. Your company must be verified before you can publish internship listings."
                  : "Verification status can only be updated by administrators. Note that any major changes to your profile may require re-verification."}
              </p>
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-6 pb-2">
            <Button variant="outline" onClick={handleCancel} className="text-slate-600 border-slate-300 hover:bg-slate-50 px-6">
              Cancel
            </Button>
            <Button onClick={handleSave} className="shadow-md px-8 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Save className="w-4 h-4 mr-2" /> {isCreating ? 'Save & Continue' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
