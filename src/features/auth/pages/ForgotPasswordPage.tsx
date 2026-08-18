import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '@/components';
import { authService } from '../services/authService';
import interoraLogo from '@/assets/interora_logo.png';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await authService.requestPasswordReset({ email });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
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
          <h2 className="text-2xl font-bold text-slate-900">Forgot Password</h2>
          <p className="text-xs text-slate-500">Recover access to your Interora student workspace</p>
        </div>

        <Card>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs p-1">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-slate-700 leading-relaxed text-[11px]">
                â„¹ï¸ Enter your registered college/student email address. A password recovery request will be prepared.
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 text-[11px] block">Student Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.johnson@student.edu"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? 'Preparing Reset Request...' : 'Continue to Password Reset'}
              </Button>
            </form>
          ) : (
            <div className="p-4 text-center space-y-3 text-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Password Recovery Request Prepared</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed max-w-xs mx-auto">
                Password recovery request prepared for <strong className="text-slate-800">{email}</strong>. In production mode, an email reset token will be dispatched.
              </p>
              <div className="pt-2">
                <Link to="/reset-password">
                  <Button variant="primary" size="sm" className="w-full justify-center bg-indigo-600">
                    Proceed to Reset Password Page â†’
                  </Button>
                </Link>
              </div>
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