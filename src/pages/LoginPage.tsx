import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import type { UserRole } from '@/types';
import { Button, Input, Select, Card, Alert } from '@/components';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [batch, setBatch] = useState('E1');
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

        <Card title={isLogin ? "Sign in to your account" : "Create a Student Account"}>
          <form onSubmit={handleLogin} className="space-y-4">


            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="University / Institution"
                  type="text"
                  placeholder="University of Technology"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                />
                <Select
                  label="Choose Batch"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  options={[
                    { value: 'E1', label: 'E1' },
                    { value: 'E2', label: 'E2' },
                    { value: 'E3', label: 'E3' },
                    { value: 'E4', label: 'E4' },
                  ]}
                />
                <Input
                  label="Student ID Card Image"
                  type="file"
                  accept="image/*"
                  required
                />
              </>
            )}

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
              {isLogin ? `Sign In to ${role.charAt(0).toUpperCase() + role.slice(1)} Portal` : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-slate-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Need assistance? Contact your institutional administrator.
        </p>
      </div>
    </div>
  );
};
