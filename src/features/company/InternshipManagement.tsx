import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader, Card, Button, Input, Badge, Alert, StatCard } from '@/components';
import { Briefcase, Users, CheckCircle2, Clock, X, Save, Edit3, Eye, Search, Filter, Plus, ArrowLeft, Power, User, Trash2 } from 'lucide-react';
import { mockCompanyInternships, setMockCompanyInternships, mockCompanyProfile } from '../faculty/mockData';
import type { InternshipData, InternshipTaskPlan, InternshipMilestone } from '../faculty/mockData';

type ViewState = 'LIST' | 'CREATE' | 'EDIT' | 'VIEW';

export const InternshipManagement: React.FC = () => {
  const [internships, setInternships] = useState<InternshipData[]>(mockCompanyInternships);
  const [viewState, setViewState] = useState<ViewState>('LIST');
  const [currentInternship, setCurrentInternship] = useState<InternshipData | null>(null);
  
  const [formData, setFormData] = useState<Partial<InternshipData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Update parent mock when state changes
  useEffect(() => {
    setMockCompanyInternships(internships);
  }, [internships]);

  // View state handlers
  const handleStartCreate = () => {
    setFormData({
      title: '',
      domain: '',
      description: '',
      requiredSkills: '',
      duration: '',
      stipend: '',
      eligibility: '',
      positions: '',
      applicationDeadline: '',
      taskPlan: [],
    });
    setErrors({});
    setViewState('CREATE');
    setSuccessMessage('');
  };

  const handleStartEdit = (internship: InternshipData) => {
    setCurrentInternship(internship);
    setFormData(internship);
    setErrors({});
    setViewState('EDIT');
    setSuccessMessage('');
  };

  const handleView = (internship: InternshipData) => {
    setCurrentInternship(internship);
    setViewState('VIEW');
    setSuccessMessage('');
  };

  const handleBackToList = () => {
    setViewState('LIST');
    setCurrentInternship(null);
    setSuccessMessage('');
  };

  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTask = () => {
    setFormData(prev => ({
      ...prev,
      taskPlan: [...(prev.taskPlan || []), { id: `TP-${Math.random().toString(36).substr(2, 9)}`, title: '', description: '' }]
    }));
  };

  const handleUpdateTask = (index: number, field: keyof InternshipTaskPlan, value: string) => {
    setFormData(prev => {
      const newTaskPlan = [...(prev.taskPlan || [])];
      newTaskPlan[index] = { ...newTaskPlan[index], [field]: value };
      return { ...prev, taskPlan: newTaskPlan };
    });
  };

  const handleRemoveTask = (index: number) => {
    setFormData(prev => {
      const newTaskPlan = [...(prev.taskPlan || [])];
      newTaskPlan.splice(index, 1);
      return { ...prev, taskPlan: newTaskPlan };
    });
  };

  const handleAddMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), { id: `MS-${Math.random().toString(36).substr(2, 9)}`, title: '', description: '' }]
    }));
  };

  const handleUpdateMilestone = (index: number, field: keyof InternshipMilestone, value: string) => {
    setFormData(prev => {
      const newMilestones = [...(prev.milestones || [])];
      newMilestones[index] = { ...newMilestones[index], [field]: value };
      return { ...prev, milestones: newMilestones };
    });
  };

  const handleRemoveMilestone = (index: number) => {
    const milestoneId = formData.milestones?.[index]?.id;
    if (milestoneId) {
      const isReferenced = formData.taskPlan?.some(task => task.milestoneId === milestoneId);
      if (isReferenced) {
        if (!window.confirm('This milestone is linked to existing tasks. Deleting it will remove the relationship from those tasks. Continue?')) {
          return;
        }
      }
    }

    setFormData(prev => {
      const newMilestones = [...(prev.milestones || [])];
      newMilestones.splice(index, 1);
      
      // Remove references in task plan
      const newTaskPlan = (prev.taskPlan || []).map(task => {
        if (task.milestoneId === milestoneId) {
          const { milestoneId: _, ...rest } = task;
          return rest;
        }
        return task;
      });

      return { ...prev, milestones: newMilestones, taskPlan: newTaskPlan };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = 'Internship Title is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.requiredSkills?.trim()) newErrors.requiredSkills = 'Required Skills are required';
    if (!formData.duration?.trim()) newErrors.duration = 'Duration is required';
    if (!formData.eligibility?.trim()) newErrors.eligibility = 'Eligibility is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (status: 'draft' | 'published') => {
    if (!validateForm()) return;
    
    // Check verification status if trying to publish
    if (status === 'published' && mockCompanyProfile?.verificationStatus !== 'verified') {
      setErrors({ publishError: 'Your company must be verified before you can publish an internship.' });
      return;
    }

    const newInternship: InternshipData = {
      ...(formData as InternshipData),
      id: currentInternship?.id || `int-${Math.random().toString(36).substr(2, 9)}`,
      companyId: mockCompanyProfile?.id || 'company-1',
      status: status,
      applicationCount: currentInternship?.applicationCount || 0,
      createdAt: currentInternship?.createdAt || new Date().toISOString().split('T')[0]
    };
    
    if (viewState === 'CREATE') {
      setInternships(prev => [newInternship, ...prev]);
      setSuccessMessage(`Internship ${status === 'published' ? 'published' : 'saved as draft'} successfully.`);
    } else {
      setInternships(prev => prev.map(i => i.id === newInternship.id ? newInternship : i));
      setSuccessMessage('Internship updated successfully.');
      setCurrentInternship(newInternship);
    }
    
    if (viewState === 'CREATE') {
      setViewState('LIST');
    } else if (viewState === 'EDIT') {
      setViewState('VIEW');
    }
    
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCloseInternship = () => {
    if (window.confirm('Are you sure you want to close this internship?')) {
      if (currentInternship) {
        const updated = { ...currentInternship, status: 'closed' as const };
        setInternships(prev => prev.map(i => i.id === updated.id ? updated : i));
        setCurrentInternship(updated);
        setSuccessMessage('Internship closed successfully.');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    }
  };

  // Filter and sort logic
  const filteredInternships = useMemo(() => {
    return internships.filter(int => {
      const matchesSearch = (int.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            int.domain.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'All' || int.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [internships, searchTerm, filterStatus]);

  // Metrics
  const activeCount = internships.filter(i => i.status === 'published').length;
  const draftCount = internships.filter(i => i.status === 'draft').length;
  const totalApplicants = internships.reduce((sum, i) => sum + i.applicationCount, 0);
  const closingSoonCount = internships.filter(i => i.status === 'published' && i.applicationDeadline).length; // Mock metric logic

  // Renderer - LIST VIEW
  if (viewState === 'LIST') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            title="Internship Management"
            description="Create, manage, and track your internship opportunities."
          />
          <Button onClick={handleStartCreate} className="shrink-0 shadow-sm gap-2">
            <Plus className="w-4 h-4" /> Create Internship
          </Button>
        </div>

        {successMessage && (
          <Alert type="success" title="Success" className="animate-in fade-in slide-in-from-top-2">
            {successMessage}
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Internships" value={activeCount.toString()} icon={Briefcase} />
          <StatCard title="Drafts" value={draftCount.toString()} icon={Edit3} />
          <StatCard title="Total Applicants" value={totalApplicants.toString()} icon={Users} />
          <StatCard title="Closing Soon" value={closingSoonCount.toString()} icon={Clock} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search internships by title or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredInternships.length > 0 ? (
            filteredInternships.map(internship => (
              <Card key={internship.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{internship.title}</h3>
                      {internship.status === 'published' && <Badge variant="emerald" className="text-xs py-0.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Published</Badge>}
                      {internship.status === 'draft' && <Badge variant="amber" className="text-xs py-0.5"><Clock className="w-3.5 h-3.5 mr-1" /> Draft</Badge>}
                      {internship.status === 'closed' && <Badge variant="neutral" className="text-xs py-0.5"><X className="w-3.5 h-3.5 mr-1" /> Closed</Badge>}
                    </div>
                    <p className="text-sm font-medium text-indigo-600">{internship.domain}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 mt-2">
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {internship.duration}</div>
                      <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {internship.positions || 'Not specified'} Positions</div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold"><User className="w-4 h-4" /> {internship.applicationCount} Applicants</div>
                      {internship.applicationDeadline && <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-rose-500" /> Deadline: {internship.applicationDeadline}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end shrink-0 border-t border-slate-100 md:border-0 pt-4 md:pt-0">
                    <Button variant="outline" size="sm" onClick={() => handleView(internship)}>View</Button>
                    {(internship.status === 'draft' || internship.status === 'published') && (
                      <Button variant="secondary" size="sm" onClick={() => handleStartEdit(internship)}>Edit</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No internships found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or create a new internship.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderer - FORM (Create or Edit)
  if (viewState === 'CREATE' || viewState === 'EDIT') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToList} className="p-2 h-auto text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PageHeader
            title={viewState === 'CREATE' ? 'Create Internship' : 'Edit Internship'}
            description={viewState === 'CREATE' ? 'Create an internship opportunity for students.' : 'Update internship details.'}
          />
        </div>

        {errors.publishError && (
          <Alert type="error" title="Action Blocked" className="animate-in fade-in slide-in-from-top-2">
            {errors.publishError}
          </Alert>
        )}

        <Card title="Internship Details" className="shadow-sm">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Internship Title *" name="title" value={formData.title || ''} onChange={handleInputChange} error={errors.title} placeholder="e.g. Data Science Intern" />
              <Input label="Role / Domain" name="domain" value={formData.domain || ''} onChange={handleInputChange} placeholder="e.g. Data Science & Analytics" />
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Description *</label>
                <textarea name="description" rows={4} value={formData.description || ''} onChange={handleInputChange} placeholder="Describe the day-to-day responsibilities and projects..." className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`} />
                {errors.description && <p className="text-xs text-red-600 font-medium">{errors.description}</p>}
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Required Skills *</label>
                <textarea name="requiredSkills" rows={2} value={formData.requiredSkills || ''} onChange={handleInputChange} placeholder="e.g. Python, SQL, Power BI, Data Analysis" className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.requiredSkills ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`} />
                {errors.requiredSkills && <p className="text-xs text-red-600 font-medium">{errors.requiredSkills}</p>}
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Eligibility *</label>
                <textarea name="eligibility" rows={2} value={formData.eligibility || ''} onChange={handleInputChange} placeholder="e.g. B.Tech / BCA / MCA students with basic Python knowledge." className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.eligibility ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`} />
                {errors.eligibility && <p className="text-xs text-red-600 font-medium">{errors.eligibility}</p>}
              </div>
              <Input label="Duration *" name="duration" value={formData.duration || ''} onChange={handleInputChange} error={errors.duration} placeholder="e.g. 3 Months" />
              <Input label="Stipend" name="stipend" value={formData.stipend || ''} onChange={handleInputChange} placeholder="e.g. ₹15,000 / month" />
              <Input label="Number of Positions" name="positions" type="number" value={formData.positions || ''} onChange={handleInputChange} placeholder="e.g. 5" />
              <Input label="Application Deadline" name="applicationDeadline" type="date" value={formData.applicationDeadline || ''} onChange={handleInputChange} />
            </div>
          </div>
        </Card>

        <Card title="Internship Milestones" className="shadow-sm mb-6">
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Define the major phases or milestones for this internship. Mentors and students will track progress against these phases.</p>
            
            <div className="space-y-4">
              {(formData.milestones || []).map((milestone, index) => (
                <div key={milestone.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative group">
                  <div className="absolute top-4 right-4">
                    <button onClick={() => handleRemoveMilestone(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="pr-8 space-y-4">
                    <Input 
                      label={`Milestone ${index + 1} Title *`}
                      name={`milestone-${index}-title`}
                      value={milestone.title}
                      onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)}
                      placeholder="e.g. Research & Discovery"
                    />
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Milestone Description *</label>
                      <textarea
                        rows={2}
                        value={milestone.description}
                        onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                        placeholder="Describe what needs to be achieved..."
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={handleAddMilestone} className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
              <Plus className="w-5 h-5 mr-2" /> Add Milestone
            </Button>
          </div>
        </Card>

        <Card title="Internship Task Plan" className="shadow-sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Define the core tasks that students will execute during this internship. Mentors will assign these tasks to their students.</p>
            
            <div className="space-y-4">
              {(formData.taskPlan || []).map((task, index) => (
                <div key={task.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative group">
                  <div className="absolute top-4 right-4">
                    <button onClick={() => handleRemoveTask(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="pr-8 space-y-4">
                    <Input 
                      label={`Task ${index + 1} Title *`}
                      name={`task-${index}-title`}
                      value={task.title}
                      onChange={(e) => handleUpdateTask(index, 'title', e.target.value)}
                      placeholder="e.g. User Research"
                    />
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Task Description *</label>
                      <textarea
                        rows={2}
                        value={task.description}
                        onChange={(e) => handleUpdateTask(index, 'description', e.target.value)}
                        placeholder="Describe what needs to be done..."
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    {(formData.milestones && formData.milestones.length > 0) && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">Link to Milestone</label>
                        <select
                          value={task.milestoneId || ''}
                          onChange={(e) => handleUpdateTask(index, 'milestoneId', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                          <option value="">No Milestone</option>
                          {formData.milestones.map(ms => (
                            <option key={ms.id} value={ms.id}>{ms.title || 'Untitled Milestone'}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={handleAddTask} className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
              <Plus className="w-5 h-5 mr-2" /> Add Task to Plan
            </Button>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2 pb-2">
          <Button variant="outline" onClick={handleBackToList} className="text-slate-600 border-slate-300 hover:bg-slate-50 px-6">
            Cancel
          </Button>
          {(viewState === 'CREATE' || currentInternship?.status === 'draft') && (
            <Button variant="secondary" onClick={() => handleSave('draft')} className="shadow-sm px-6 bg-slate-800 hover:bg-slate-900 text-white border-transparent">
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
          )}
          <Button onClick={() => handleSave('published')} className="shadow-md px-8 bg-indigo-600 hover:bg-indigo-700 text-white">
            <CheckCircle2 className="w-4 h-4 mr-2" /> {viewState === 'EDIT' && currentInternship?.status === 'published' ? 'Save Changes' : 'Publish Internship'}
          </Button>
        </div>
      </div>
    );
  }

  // Renderer - DETAILS VIEW
  if (viewState === 'VIEW' && currentInternship) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToList} className="p-2 h-auto text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PageHeader
            title={currentInternship.title}
            description="Internship Details"
          />
        </div>

        {successMessage && (
          <Alert type="success" title="Success" className="animate-in fade-in slide-in-from-top-2">
            {successMessage}
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3 space-y-6">
            <Card title="Description" className="shadow-sm">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{currentInternship.description}</p>
            </Card>
            <Card title="Required Skills" className="shadow-sm">
              <div className="flex flex-wrap gap-2">
                {currentInternship.requiredSkills.split(',').map((skill, idx) => (
                  <Badge key={idx} variant="indigo" className="px-3 py-1 font-medium">{skill.trim()}</Badge>
                ))}
              </div>
            </Card>
            <Card title="Eligibility" className="shadow-sm">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{currentInternship.eligibility}</p>
            </Card>
            
            {currentInternship.taskPlan && currentInternship.taskPlan.length > 0 && (
              <Card title="Internship Task Plan" className="shadow-sm">
                <p className="text-sm text-slate-500 mb-4">Standard tasks defined for this internship role.</p>
                <div className="space-y-3">
                  {currentInternship.taskPlan.map((task, idx) => (
                    <div key={task.id} className="p-4 border border-slate-100 bg-slate-50 rounded-lg">
                      <h4 className="text-sm font-bold text-slate-900 mb-1">Task {idx + 1}: {task.title}</h4>
                      <p className="text-sm text-slate-600">{task.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
          
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="shadow-sm p-5 space-y-5">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</h4>
                {currentInternship.status === 'published' && <Badge variant="emerald" className="font-semibold"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Published</Badge>}
                {currentInternship.status === 'draft' && <Badge variant="amber" className="font-semibold"><Clock className="w-3.5 h-3.5 mr-1" /> Draft</Badge>}
                {currentInternship.status === 'closed' && <Badge variant="neutral" className="font-semibold"><X className="w-3.5 h-3.5 mr-1" /> Closed</Badge>}
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Domain</h4>
                <p className="text-sm font-medium text-slate-900">{currentInternship.domain || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</h4>
                <p className="text-sm font-medium text-slate-900">{currentInternship.duration}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stipend</h4>
                <p className="text-sm font-medium text-slate-900">{currentInternship.stipend || 'Unpaid / Not specified'}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Positions</h4>
                <p className="text-sm font-medium text-slate-900">{currentInternship.positions || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Application Deadline</h4>
                <p className="text-sm font-medium text-slate-900">{currentInternship.applicationDeadline ? new Date(currentInternship.applicationDeadline).toLocaleDateString() : 'Not specified'}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Applications</h4>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-xl font-bold text-slate-900">{currentInternship.applicationCount}</span>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm p-4 bg-slate-50/50">
              <div className="flex flex-col gap-3">
                {currentInternship.status === 'draft' && (
                  <>
                    <Button onClick={() => handleStartEdit(currentInternship)} className="w-full justify-center shadow-sm">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Draft
                    </Button>
                    <Button variant="secondary" onClick={() => handleSave('published')} className="w-full justify-center shadow-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Publish Now
                    </Button>
                  </>
                )}
                {currentInternship.status === 'published' && (
                  <>
                    <Button onClick={() => handleStartEdit(currentInternship)} className="w-full justify-center shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Details
                    </Button>
                    <Button variant="outline" onClick={handleCloseInternship} className="w-full justify-center shadow-sm text-rose-600 hover:bg-rose-50 border-rose-200">
                      <Power className="w-4 h-4 mr-2" /> Close Internship
                    </Button>
                  </>
                )}
                {currentInternship.status === 'closed' && (
                  <div className="text-center p-3 text-sm text-slate-500 font-medium">
                    This internship is permanently closed and cannot be edited.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
