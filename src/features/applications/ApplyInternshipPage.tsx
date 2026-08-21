import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Input, Button, Badge, Alert } from '@/components';
import { mockInternships } from '@/features/internships/data/mockInternships';
import { initialStudentProfileData } from '@/features/student/data/mockStudentData';
import { ArrowLeft, CheckCircle2, FileText, Send, Building2 } from 'lucide-react';

export const ApplyInternshipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const internship = mockInternships.find((item) => item.id === id);

  const [formData, setFormData] = useState({
    fullName: initialStudentProfileData.fullName,
    email: initialStudentProfileData.email,
    phone: initialStudentProfileData.phone,
    resumeFileName: initialStudentProfileData.resumeFileName,
    coverLetter: 'I am highly interested in applying for this internship role. My background in React.js, TypeScript, and modern web application design aligns well with your team requirements.',
    relevantSkills: initialStudentProfileData.skills.map((s) => s.name).slice(0, 4).join(', '),
    availability: initialStudentProfileData.availability,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!internship) {
    return (
      <div className="space-y-6">
        <PageHeader title="Internship Not Found" description="The target internship is invalid or unavailable." />
        <Link to="/student/internships">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <button
          onClick={() => navigate(`/student/internships/${internship.id}`)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Internship Details
        </button>
        <PageHeader
          title={`Apply for ${internship.title}`}
          description={`Submitting application to ${internship.companyName}`}
        />
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Opportunity Banner */}
          <Card className="bg-indigo-50/40 border-indigo-100">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Applying To</span>
                <span className="font-bold text-slate-900 text-sm">{internship.title}</span>
                <span className="text-indigo-600 block font-medium">{internship.companyName} â€¢ {internship.location}</span>
              </div>
              <Badge variant="indigo">{internship.workMode}</Badge>
            </div>
          </Card>

          {/* Contact Details */}
          <Card title="1. Applicant Profile Information" subtitle="Pre-filled from your student profile">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </Card>

          {/* Resume & Cover Statement */}
          <Card title="2. Application Materials" subtitle="Attached resume & introductory cover statement">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Attached Resume</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{formData.resumeFileName}</span>
                      <span className="text-[10px] text-slate-400">PDF Document</span>
                    </div>
                  </div>
                  <Badge variant="emerald">Attached</Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="coverLetter" className="block text-xs font-semibold text-slate-700">
                  Cover Statement / Short Introduction
                </label>
                <textarea
                  id="coverLetter"
                  rows={4}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Relevant Highlighted Skills"
                value={formData.relevantSkills}
                onChange={(e) => setFormData({ ...formData, relevantSkills: e.target.value })}
              />

              <Input
                label="Availability Status"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Link to={`/student/internships/${internship.id}`}>
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              <Send className="w-4 h-4 mr-2" /> Submit Application
            </Button>
          </div>
        </form>
      ) : (
        /* Application Success View */
        <Card className="text-center py-8 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="emerald" className="px-3 py-1 text-xs">
              Application Submitted Successfully
            </Badge>
            <h2 className="text-2xl font-bold text-slate-900">Application Received</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your application for <strong>{internship.title}</strong> at <strong>{internship.companyName}</strong> has been logged in the internship pipeline.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-left">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-semibold text-slate-900">{formData.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Initial Status:</span>
              <Badge variant="amber">Submitted (Pending Faculty Review)</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted On:</span>
              <span className="font-semibold text-slate-900">Today, 2026-08-14</span>
            </div>
          </div>

          <Alert type="info" className="max-w-md mx-auto text-left">
            You can track the progress of your application through the Faculty review and Company selection stages in your Student Dashboard.
          </Alert>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/student/applications">
              <Button variant="primary" size="sm">
                View My Applications
              </Button>
            </Link>
            <Link to="/student/internships">
              <Button variant="outline" size="sm">
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};