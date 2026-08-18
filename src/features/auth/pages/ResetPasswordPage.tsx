import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '@/components';
import { authService } from '../services/authService';
import interoraLogo from '@/assets/interora_logo.png';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ newPassword });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src={interoraLogo} alt="Interora Logo" className="h-10 w-auto object-contain mx-auto" />
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Reset Student Password</h2>
          <p className="text-xs text-slate-500">Set a new password for your account</p>
        </div>

        <Card>
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs p-1">
              {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{error}</div>}

              <div className="space-y-1">
                <label className="font-bold text-slate-800 text-[11px] block">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
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
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 text-[11px] block">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? 'Updating Password...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <div className="p-4 text-center space-y-3 text-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Password Reset Complete!</h3>
              <p className="text-slate-500 text-[11px]">Redirecting to Login page...</p>
            </div>
          )}
        </Card>

        <div className="text-center text-xs">
          <Link to="/login" className="text-slate-500 hover:text-slate-800 inline-flex items-center space-x-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};