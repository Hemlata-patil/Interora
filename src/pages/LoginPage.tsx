import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import type { UserRole } from '@/types';
import { Button, Input, Select, Card, Alert } from '@/components';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporary UI navigation based on role selection until Supabase Auth phase
    navigate(`/${role}`);
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

        <Alert type="info" title="Frontend Auth Foundation">
          Select a demo role below to test portal layouts and routing. Real authentication via Supabase Auth will be wired up in the Supabase phase.
        </Alert>

        <Card title="Sign in to your account">
          <form onSubmit={handleLogin} className="space-y-4">
            <Select
              label="Select Role Workspace"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'student', label: 'Student Workspace' },
                { value: 'faculty', label: 'Faculty Mentor Workspace' },
                { value: 'company', label: 'Company Workspace' },
                { value: 'mentor', label: 'Industry Mentor Workspace' },
                { value: 'admin', label: 'System Admin Workspace' },
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

            <Button type="submit" variant="primary" className="w-full">
              Sign In to {role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Need assistance? Contact your institutional administrator.
        </p>
      </div>
    </div>
  );
};
