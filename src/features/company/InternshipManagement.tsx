import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Button, Input, Select, EmptyState, Alert } from '@/components';
import { Plus, Building2, Search, Calendar, MapPin, DollarSign, Clock, Users, Edit3, Power, Eye, ArrowLeft, CheckCircle2, Save, X } from 'lucide-react';
import {
  createInternshipPostingBackend,
  fetchInternshipPostingsBackend,
  type InternshipPostingRecord,
} from '@/services/api/backendService';
import { supabase } from '@/services/supabase/supabaseClient';

export interface InternshipItem {
  id: string;
  title: string;
  domain: string;
  duration: string;
  stipend: string;
  requiredSkills: string;
  description: string;
  eligibility: string;
  status: 'draft' | 'published' | 'closed';
  applicationDeadline: string;
  applicationCount: number;
  location?: string;
  internshipType?: string;
  positions?: string;
  taskPlan?: { id: string; title: string; description: string }[];
}

export const initialCompanyInternships: InternshipItem[] = [
  {
    id: 'int-comp-1',
    title: 'Frontend React Developer Intern',
    domain: 'Software & Cloud Services',
    duration: '3 Months',
    stipend: '₹15,000 / month',
    requiredSkills: 'React, TypeScript, Tailwind CSS',
    description: 'We are seeking a passionate Frontend Intern to help build responsive web apps.',
    eligibility: 'B.Tech/BE Computer Science students in 3rd/4th year.',
    status: 'published',
    applicationDeadline: '2026-09-15',
    applicationCount: 14,
    location: 'Bangalore / Remote',
    internshipType: 'Full-time',
    positions: '2 Positions',
  },
];

type ViewState = 'LIST' | 'CREATE' | 'EDIT' | 'VIEW';

export const InternshipManagement: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('LIST');
  const [internships, setInternships] = useState<InternshipItem[]>(initialCompanyInternships);
  const [currentInternship, setCurrentInternship] = useState<InternshipItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    domain: 'Software & Cloud Services',
    duration: '3 Months',
    stipend: '₹15,000 / month',
    requiredSkills: '',
    description: '',
    eligibility: 'B.Tech / BE Computer Science (3rd or 4th Year)',
    applicationDeadline: '',
    positions: '2',
    location: 'Remote / On-site',
    internshipType: 'Full-time',
  });

  useEffect(() => {
    const initCompanyAndFetch = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentCompanyId(data.user.id);
        const remotePostings = await fetchInternshipPostingsBackend(data.user.id);
        if (remotePostings && remotePostings.length > 0) {
          const mapped: InternshipItem[] = remotePostings.map((p) => ({
            id: p.id,
            title: p.title,
            domain: p.industryDomain,
            duration: p.duration,
            stipend: p.stipend,
            requiredSkills: p.skills ? p.skills.join(', ') : '',
            description: p.description,
            eligibility: p.eligibility,
            status: p.status === 'open' ? 'published' : 'closed',
            applicationDeadline: p.applicationDeadline ? p.applicationDeadline.slice(0, 10) : '',
            applicationCount: 0,
            location: p.location,
            internshipType: p.internshipType,
          }));
          setInternships(mapped);
        }
      }
    };
    initCompanyAndFetch();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      domain: 'Software & Cloud Services',
      duration: '3 Months',
      stipend: '₹15,000 / month',
      requiredSkills: '',
      description: '',
      eligibility: 'B.Tech / BE Computer Science (3rd or 4th Year)',
      applicationDeadline: '',
      positions: '2',
      location: 'Remote / On-site',
      internshipType: 'Full-time',
    });
  };

  const handleStartCreate = () => {
    resetForm();
    setCurrentInternship(null);
    setViewState('CREATE');
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSave = async (targetStatus: 'published' | 'draft') => {
    if (!formData.title || !formData.description) {
      setErrorMessage('Please fill in required fields (Title and Description).');
      return;
    }

    setErrorMessage(null);
    const skillArray = formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);

    const res = await createInternshipPostingBackend({
      title: formData.title,
      description: formData.description,
      industryDomain: formData.domain,
      location: formData.location,
      internshipType: formData.internshipType,
      duration: formData.duration,
      stipend: formData.stipend,
      eligibility: formData.eligibility,
      skills: skillArray,
      applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : undefined,
    });

    if (!res.success || !res.data) {
      setErrorMessage(res.error || 'Failed to create internship posting.');
      return;
    }

    const newItem: InternshipItem = {
      id: res.data.id,
      title: res.data.title,
      domain: res.data.industryDomain,
      duration: res.data.duration,
      stipend: res.data.stipend,
      requiredSkills: res.data.skills.join(', '),
      description: res.data.description,
      eligibility: res.data.eligibility,
      status: targetStatus,
      applicationDeadline: formData.applicationDeadline,
      applicationCount: 0,
      location: res.data.location,
      internshipType: res.data.internshipType,
      positions: formData.positions + ' Positions',
    };

    setInternships((prev) => [newItem, ...prev]);
    setSuccessMessage(`Internship posting created successfully!`);
    setViewState('LIST');
  };

  const handleBackToList = () => {
    setViewState('LIST');
    setCurrentInternship(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internship & Job Postings"
        description="Manage active internship listings, post new opportunities, and monitor candidate response rates."
      />

      {errorMessage && (
        <Alert type="error" title="Error">
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by title, domain, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Drafts' },
              { value: 'closed', label: 'Closed' },
            ]}
            className="w-36 text-xs"
          />
        </div>

        <Button onClick={handleStartCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Post New Internship
        </Button>
      </div>

      {/* Postings Grid / List */}
      {viewState === 'LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {internships.map((item) => (
            <Card key={item.id} className="p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{item.domain}</p>
                  </div>
                  {item.status === 'published' && <Badge variant="emerald">Published</Badge>}
                  {item.status === 'draft' && <Badge variant="amber">Draft</Badge>}
                  {item.status === 'closed' && <Badge variant="neutral">Closed</Badge>}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                  <span>Duration: <strong className="text-slate-700 font-semibold">{item.duration}</strong></span>
                  <span>•</span>
                  <span>Stipend: <strong className="text-emerald-600 font-semibold">{item.stipend}</strong></span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-xs text-slate-500">
                  <strong className="text-indigo-600 font-bold">{item.applicationCount}</strong> Applications
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setCurrentInternship(item);
                    setViewState('VIEW');
                  }}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form State CREATE / EDIT */}
      {(viewState === 'CREATE' || viewState === 'EDIT') && (
        <Card title={viewState === 'CREATE' ? 'Create New Internship Posting' : 'Edit Internship Posting'}>
          <form onSubmit={(e) => { e.preventDefault(); handleSave('published'); }} className="space-y-4 text-xs">
            <Input
              label="Internship Position Title"
              required
              placeholder="e.g. Full-Stack Developer Intern"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Industry Domain"
                required
                placeholder="Software & Cloud Services"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
              <Input
                label="Location"
                placeholder="e.g. Bangalore / Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Duration"
                placeholder="e.g. 3 Months"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
              <Input
                label="Stipend"
                placeholder="e.g. ₹15,000 / month"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
              />
            </div>

            <Input
              label="Required Skills (comma separated)"
              placeholder="e.g. React, TypeScript, Node.js"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
            />

            <div>
              <label className="block text-slate-700 font-medium mb-1">Description</label>
              <textarea
                rows={4}
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                placeholder="Detailed internship responsibilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleBackToList}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Publish Internship Posting
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* VIEW Details */}
      {viewState === 'VIEW' && currentInternship && (
        <Card title={currentInternship.title} className="space-y-4">
          <p className="text-xs text-slate-700 whitespace-pre-wrap">{currentInternship.description}</p>
          <div className="text-xs text-slate-500 space-y-1">
            <div>Domain: <strong className="text-slate-800">{currentInternship.domain}</strong></div>
            <div>Location: <strong className="text-slate-800">{currentInternship.location}</strong></div>
            <div>Stipend: <strong className="text-emerald-600">{currentInternship.stipend}</strong></div>
            <div>Duration: <strong className="text-slate-800">{currentInternship.duration}</strong></div>
          </div>
          <Button variant="outline" onClick={handleBackToList}>Back to Postings</Button>
        </Card>
      )}
    </div>
  );
};
