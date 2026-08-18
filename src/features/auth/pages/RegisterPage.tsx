import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '@/components';
import { authService } from '../services/authService';
import interoraLogo from '@/assets/interora_logo.png';
import { Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: 'None', score: 0, color: 'bg-slate-200' };
    if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'bg-rose-500' };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { label: 'Strong', score: 100, color: 'bg-emerald-500' };
    }
    return { label: 'Medium', score: 66, color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.registerStudent({
        fullName,
        email,
        password,
        mobileNumber,
      });

      // Redirect to Profile Completion wizard
      navigate('/student/profile-completion');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src={interoraLogo} alt="Interora Logo" className="h-10 w-auto object-contain mx-auto" />
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Student Account Registration</h2>
          <p className="text-xs text-slate-500">Create your student profile to start exploring internships & career roadmaps</p>
        </div>

        {/* Prototype Banner */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium flex items-center justify-between">
          <span>âš¡ <strong>Frontend Prototype Mode:</strong> No backend server required.</span>
          <Badge variant="amber" className="text-[9px]">Demo Auth</Badge>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs p-1">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 text-[11px] block">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 text-[11px] block">
                College/Student Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex.johnson@student.edu"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Mobile Number (Optional) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 text-[11px] block">
                Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 text-[11px] block">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Strength:</span>
                    <span className="font-bold text-slate-700">{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 text-[11px] block">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading}
              className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account & Complete Profile'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </Card>

        {/* Footer Login Link */}
        <div className="text-center text-xs text-slate-500">
          Already have a student account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};