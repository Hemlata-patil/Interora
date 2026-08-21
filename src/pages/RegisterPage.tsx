import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import { Button, Input, Select, Card, Badge } from '@/components';
import { User, Building2, CheckCircle2, ShieldAlert, Clock, Mail, ArrowRight } from 'lucide-react';
import { initialCompanyApplications, type CompanyApplication } from '@/features/admin/AdminCompanies';
import { registerStudentBackend, registerCompanyBackend } from '@/services/api/backendService';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [roleTab, setRoleTab] = useState<'student' | 'company'>('student');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedCompany, setSubmittedCompany] = useState<CompanyApplication | null>(null);
  const [loading, setLoading] = useState(false);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    department: 'CSE',
    course: 'B.Tech Computer Science',
    yearSemester: '3rd Year / 6th Sem',
    password: '',
    confirmPassword: '',
  });

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    officialEmail: '',
    contactPerson: '',
    phone: '',
    industryDomain: 'Software & Cloud Services',
    website: '',
    companyAddress: '',
    password: '',
    confirmPassword: '',
  });

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (studentForm.password !== studentForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (studentForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await registerStudentBackend(studentForm);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Student registration failed.');
      return;
    }

    navigate('/login');
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (companyForm.password !== companyForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await registerCompanyBackend(companyForm);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Company registration failed.');
      return;
    }

    const newCompany: CompanyApplication = {
      id: `comp-app-${Date.now()}`,
      companyName: companyForm.companyName,
      industryDomain: companyForm.industryDomain,
      contactPerson: companyForm.contactPerson,
      email: companyForm.officialEmail,
      phone: companyForm.phone,
      website: companyForm.website || 'https://company.com',
      appliedDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      invitationSent: false,
      internshipCount: 0,
      mentorCount: 0,
    };

    initialCompanyApplications.push(newCompany);
    setSubmittedCompany(newCompany);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-3">
            <img src={APP_INFO.logo} alt={APP_INFO.name} className="h-10 w-auto object-contain" />
            <span className="text-2xl font-bold text-slate-900">{APP_INFO.name}</span>
          </Link>
          <p className="text-xs text-slate-500">{APP_INFO.tagline}</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              roleTab === 'student' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              setRoleTab('student');
              setErrorMsg(null);
              setSubmittedCompany(null);
            }}
          >
            <User className="w-4 h-4" /> Student Registration
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              roleTab === 'company' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              setRoleTab('company');
              setErrorMsg(null);
            }}
          >
            <Building2 className="w-4 h-4" /> Company / Industry Registration
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {roleTab === 'company' && submittedCompany ? (
          <Card className="p-6 bg-white border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{submittedCompany.companyName}</h3>
                  <p className="text-[11px] text-slate-500">{submittedCompany.industryDomain}</p>
                </div>
              </div>
              <Badge variant="amber">STATUS: PENDING TPO APPROVAL</Badge>
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                Registration Submitted Successfully!
              </p>
              <p className="text-[11px] text-amber-700">
                Your company profile and registration details are currently undergoing verification by the Training & Placement Officer (TPO). Access to the Company Portal will be enabled once approved.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">CONTACT PERSON</span>
                <span className="font-bold text-slate-800">{submittedCompany.contactPerson}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">OFFICIAL EMAIL</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {submittedCompany.email}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                onClick={() => setSubmittedCompany(null)}
              >
                Register Another Company
              </button>

              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-1.5 hover:bg-indigo-700 transition-all shadow-xs"
              >
                Go to Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        ) : (
          <Card title={roleTab === 'student' ? 'Create Student Account' : 'Register Your Company'}>
            {roleTab === 'student' ? (
              <form onSubmit={handleStudentRegister} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    placeholder="e.g. Sarah Smith"
                    value={studentForm.fullName}
                    onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  />
                  <Input
                    label="Student / Enrollment ID"
                    required
                    placeholder="e.g. STU-2026-001"
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    placeholder="sarah@student.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Department"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    options={[
                      { value: 'CSE', label: 'Computer Science (CSE)' },
                      { value: 'IT', label: 'Information Tech (IT)' },
                      { value: 'AIML', label: 'AI & Machine Learning' },
                      { value: 'ECE', label: 'Electronics (ECE)' },
                    ]}
                  />
                  <Input
                    label="Course / Program"
                    placeholder="e.g. B.Tech Computer Science"
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={studentForm.confirmPassword}
                    onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register as Student'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCompanyRegister} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    required
                    placeholder="e.g. NextGen Tech Solutions"
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  />
                  <Input
                    label="Official Company Email"
                    type="email"
                    required
                    placeholder="contact@nextgen.com"
                    value={companyForm.officialEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, officialEmail: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Person"
                    required
                    placeholder="e.g. Robert Chen"
                    value={companyForm.contactPerson}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactPerson: e.target.value })}
                  />
                  <Input
                    label="Contact Phone"
                    required
                    placeholder="+91 98765 11223"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Industry Domain"
                    required
                    placeholder="e.g. Software & Cloud Services"
                    value={companyForm.industryDomain}
                    onChange={(e) => setCompanyForm({ ...companyForm, industryDomain: e.target.value })}
                  />
                  <Input
                    label="Company Website"
                    placeholder="https://company.com"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={companyForm.confirmPassword}
                    onChange={(e) => setCompanyForm({ ...companyForm, confirmPassword: e.target.value })}
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Submitting Application...' : 'Submit Company Application for Approval'}
                </Button>
              </form>
            )}

            <div className="text-center pt-4 text-xs text-slate-500 border-t mt-4">
              Already registered?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
