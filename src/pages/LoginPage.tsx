import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import type { UserRole } from '@/types';
import { Button, Input, Select, Card } from '@/components';
import { initialCompanyApplications } from '@/features/admin/AdminCompanies';
import { loginUserBackend } from '@/services/api/backendService';
import { ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    setLoading(true);
    const res = await loginUserBackend(email, password, role);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed.');
      return;
    }

    const activeRole = res.role || role;
    navigate(`/${activeRole}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-3">
            <img src={APP_INFO.logo} alt={APP_INFO.name} className="h-10 w-auto object-contain" />
            <span className="text-2xl font-bold text-slate-900">{APP_INFO.name}</span>
          </Link>
          <p className="text-xs text-slate-500">{APP_INFO.tagline}</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Card title="Sign in to your account">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <Select
              label="Select Role Workspace"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                setErrorMsg(null);
              }}
              options={[
                { value: 'student', label: 'Student Workspace' },
                { value: 'faculty', label: 'Faculty Mentor Workspace' },
                { value: 'company', label: 'Company Workspace' },
                { value: 'mentor', label: 'Industry Mentor Workspace' },
                { value: 'admin', label: 'Training & Placement Officer (TPO)' },
              ]}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : `Sign In to ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`}
            </Button>
          </form>

          <div className="text-center pt-4 text-xs text-slate-500 border-t mt-4 space-y-2">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                Create Account / Register Company
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
