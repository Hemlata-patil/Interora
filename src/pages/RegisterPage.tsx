import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { APP_INFO } from '@/constants';
import { Button, Input, Select, Card } from '@/components';
import { ShieldAlert } from 'lucide-react';
import { registerStudentBackend, fetchDepartmentsBackend, type DepartmentRecord } from '@/services/api/backendService';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    studentId: 'CS1',
    email: '',
    phone: '',
    department: '',
    course: 'B.Tech Computer Science',
    yearSemester: '3rd Year / 6th Sem',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let isMounted = true;
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await fetchDepartmentsBackend();
        if (isMounted) {
          setDepartments(data);
          if (data.length > 0) {
            setStudentForm((prev) => {
              const currentValid = data.some((d) => d.code === prev.department);
              return currentValid ? prev : { ...prev, department: data[0].code };
            });
          }
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        if (isMounted) {
          setLoadingDepartments(false);
        }
      }
    };

    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, []);


  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (studentForm.password !== studentForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (studentForm.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!studentForm.department) {
      setErrorMsg('Please select a department.');
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

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Card title="Create Student Account">
          <form onSubmit={handleStudentRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Sarah Smith"
                value={studentForm.fullName}
                onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
              />
              <Select
                label="Choose Batch"
                value={studentForm.studentId}
                onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                options={[
                  { value: 'CS1', label: 'CS1' },
                  { value: 'CS2', label: 'CS2' },
                  { value: 'CS3', label: 'CS3' },
                  { value: 'CS4', label: 'CS4' },
                ]}
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
                disabled={loadingDepartments || departments.length === 0}
                onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                options={
                  loadingDepartments
                    ? [{ value: '', label: 'Loading departments...' }]
                    : departments.length === 0
                    ? [{ value: '', label: 'No departments available' }]
                    : departments.map((d) => ({
                        value: d.code,
                        label: d.name ? `${d.name} (${d.code})` : d.code,
                      }))
                }
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

          <div className="text-center pt-4 text-xs text-slate-500 border-t mt-4">
            Already have a student account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
