import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge } from '@/components';
import { Compass, GraduationCap, Building2, ShieldCheck, ArrowRight, Sparkles, Lock, Mail } from 'lucide-react';
import interoraLogo from '@/assets/interora_logo.png';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'faculty' | 'company' | 'admin'>('student');
  const [email, setEmail] = useState('alex.johnson@student.edu');
  const [password, setPassword] = useState('password123');

  const handleRoleSelect = (selectedRole: 'student' | 'faculty' | 'company' | 'admin') => {
    setRole(selectedRole);
    switch (selectedRole) {
      case 'student':
        setEmail('alex.johnson@student.edu');
        break;
      case 'faculty':
        setEmail('dr.sharma@university.edu');
        break;
      case 'company':
        setEmail('recruiter@techcorp.com');
        break;
      case 'admin':
        setEmail('admin@interora.edu');
        break;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switch (role) {
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'faculty':
        navigate('/faculty');
        break;
      case 'company':
        navigate('/company');
        break;
      case 'admin':
        navigate('/admin');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src={interoraLogo} alt="Interora Logo" className="h-10 w-auto object-contain mx-auto" />
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Welcome to Interora</h2>
          <p className="text-xs text-slate-500">Sign in to access your role-based portal workspace</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          <button
            onClick={() => handleRoleSelect('student')}
            className={`py-2 rounded-lg transition-all flex flex-col items-center ${
              role === 'student' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span>Student</span>
          </button>
          <button
            onClick={() => handleRoleSelect('faculty')}
            className={`py-2 rounded-lg transition-all flex flex-col items-center ${
              role === 'faculty' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 mb-0.5" />
            <span>Faculty</span>
          </button>
          <button
            onClick={() => handleRoleSelect('company')}
            className={`py-2 rounded-lg transition-all flex flex-col items-center ${
              role === 'company' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 mb-0.5" />
            <span>Company</span>
          </button>
          <button
            onClick={() => handleRoleSelect('admin')}
            className={`py-2 rounded-lg transition-all flex flex-col items-center ${
              role === 'admin' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-0.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Login Form Card */}
        <Card>
          <form onSubmit={handleLogin} className="space-y-4 text-xs p-1">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 text-[11px] block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 text-[11px] block">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <Button variant="primary" size="md" type="submit" className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
              <span>Sign In as {role.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </Card>

        {/* Registration CTA for Students */}
        {role === 'student' && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-center text-xs space-y-1">
            <span className="text-slate-600">New student to Interora?</span>{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline inline-flex items-center">
              Register Student Account â†’
            </Link>
          </div>
        )}

        <div className="text-center text-xs text-slate-400">
          Interora Platform â€¢ Developer 1 Workspace
        </div>
      </div>
    </div>
  );
};