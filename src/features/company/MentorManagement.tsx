import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader, Card, Button, Badge, Input } from '@/components';
import { Users, Mail, Phone, Briefcase, Plus, Search, Edit, X, Loader2 } from 'lucide-react';
import { 
  fetchCompanyMentorsBackend, 
  createCompanyMentorBackend, 
  assignCompanyMentorBackend,
  fetchInternshipPostingsBackend,
  type CompanyMentorBackendRecord 
} from '@/services/api/backendService';
import { mockCompanyMentors, mockCompanyInternships } from '../faculty/mockData';

export const MentorManagement: React.FC = () => {
  const [mentors, setMentors] = useState<CompanyMentorBackendRecord[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddMentorOpen, setIsAddMentorOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<CompanyMentorBackendRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New mentor form state
  const [newMentor, setNewMentor] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: ''
  });

  // Assign state
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mentorList, postingList] = await Promise.all([
        fetchCompanyMentorsBackend(),
        fetchInternshipPostingsBackend(),
      ]);

      if (mentorList && mentorList.length > 0) {
        setMentors(mentorList);
      } else {
        // Fallback to mock data if empty initially
        const mappedMock = mockCompanyMentors.map(m => ({
          ...m,
          expertiseAreas: [],
          assignedInternships: []
        }));
        setMentors(mappedMock as any);
      }

      if (postingList && postingList.length > 0) {
        setInternships(postingList);
      } else {
        setInternships(mockCompanyInternships);
      }
    } catch (err: any) {
      console.error('[MentorManagement] Error loading data:', err);
      setError('Failed to load mentors.');
      setMentors(mockCompanyMentors as any);
      setInternships(mockCompanyInternships);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assignedMentorsCount = useMemo(() => {
    return mentors.filter(m => {
      if (m.assignedInternships && m.assignedInternships.length > 0) return true;
      if (m.assignedInternship) return true;
      return internships.some(i => i.mentorId === m.id);
    }).length;
  }, [mentors, internships]);

  const unassignedMentorsCount = mentors.length - assignedMentorsCount;

  const filteredMentors = useMemo(() => {
    return mentors.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [mentors, searchTerm]);

  const handleAddMentor = async () => {
    if (!newMentor.name || !newMentor.email || !newMentor.designation) return;
    setActionLoading(true);
    try {
      const res = await createCompanyMentorBackend({
        name: newMentor.name,
        email: newMentor.email,
        phone: newMentor.phone || undefined,
        department: newMentor.department || undefined,
        designation: newMentor.designation,
      });

      if (res.success && res.data) {
        setMentors(prev => [res.data!, ...prev]);
        setIsAddMentorOpen(false);
        setNewMentor({ name: '', email: '', phone: '', department: '', designation: '' });
      } else {
        alert(res.error || 'Failed to add mentor.');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding mentor.');
    } finally {
      setActionLoading(false);
    }
  };

  const openAssignModal = (mentor: CompanyMentorBackendRecord) => {
    setSelectedMentor(mentor);
    // Find current assigned internship
    let currId = '';
    if (mentor.assignedInternships && mentor.assignedInternships.length > 0) {
      currId = mentor.assignedInternships[0].internshipId;
    } else if (mentor.assignedInternship) {
      currId = mentor.assignedInternship.id;
    } else {
      const current = internships.find(i => i.mentorId === mentor.id);
      currId = current ? current.id : '';
    }
    setSelectedInternshipId(currId);
    setIsAssignOpen(true);
  };

  const handleAssignInternship = async () => {
    if (!selectedMentor) return;
    setActionLoading(true);
    try {
      const res = await assignCompanyMentorBackend(
        selectedMentor.id,
        selectedInternshipId || null
      );
      if (res.success) {
        await loadData();
        setIsAssignOpen(false);
        setSelectedMentor(null);
      } else {
        alert(res.error || 'Failed to assign mentor.');
      }
    } catch (err: any) {
      alert(err.message || 'Error assigning mentor.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Mentor Management"
          description="Manage industry mentors and assign them to internship programs."
        />
        <Button onClick={() => setIsAddMentorOpen(true)} className="whitespace-nowrap shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Mentor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-white shadow-sm border border-slate-200">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{mentors.length}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Mentors</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white shadow-sm border border-slate-200">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <Briefcase className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{assignedMentorsCount}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Mentors</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white shadow-sm border border-slate-200">
          <div className="p-3 bg-amber-50 rounded-lg">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{unassignedMentorsCount}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unassigned</p>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              className="pl-9 bg-white" 
              placeholder="Search mentors by name, email, or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading mentors...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Mentor</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Contact</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Department</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Assigned Internship</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMentors.map(mentor => {
                  const assignedTitle = mentor.assignedInternships && mentor.assignedInternships.length > 0
                    ? mentor.assignedInternships[0].title
                    : mentor.assignedInternship?.title || 
                      internships.find(i => i.mentorId === mentor.id)?.title;
                  
                  const internsCount = mentor.assignedInternships?.length ?? (mentor.assignedInternsCount || 0);

                  return (
                    <tr key={mentor.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {mentor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{mentor.name}</p>
                            <p className="text-xs text-slate-500 font-mono truncate max-w-[140px]">{mentor.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 text-slate-600">
                          <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {mentor.email}</div>
                          {mentor.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {mentor.phone}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-900">{mentor.designation}</p>
                        <p className="text-xs text-slate-500">{mentor.department}</p>
                      </td>
                      <td className="px-4 py-3">
                        {assignedTitle ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-indigo-700">{assignedTitle}</span>
                            <span className="text-xs text-slate-500">Assigned Interns: {internsCount}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No internship assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={mentor.status === 'Active' ? 'emerald' : 'neutral'}>{mentor.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openAssignModal(mentor)}>Assign</Button>
                          <Button variant="ghost" size="sm" className="px-2"><Edit className="w-4 h-4 text-slate-400" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredMentors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No mentors found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Mentor Modal */}
      {isAddMentorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-xl border-0 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Add Industry Mentor</h3>
              <button onClick={() => setIsAddMentorOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Full Name *</label>
                <Input 
                  placeholder="e.g. Neha Sharma" 
                  value={newMentor.name}
                  onChange={(e) => setNewMentor({...newMentor, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address *</label>
                <Input 
                  placeholder="e.g. neha@company.com" 
                  type="email"
                  value={newMentor.email}
                  onChange={(e) => setNewMentor({...newMentor, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <Input 
                  placeholder="e.g. +91 9876543210" 
                  value={newMentor.phone}
                  onChange={(e) => setNewMentor({...newMentor, phone: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <Input 
                    placeholder="e.g. Design" 
                    value={newMentor.department}
                    onChange={(e) => setNewMentor({...newMentor, department: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Designation *</label>
                  <Input 
                    placeholder="e.g. UX Lead" 
                    value={newMentor.designation}
                    onChange={(e) => setNewMentor({...newMentor, designation: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setIsAddMentorOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMentor} disabled={!newMentor.name || !newMentor.email || !newMentor.designation || actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Mentor
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Assign Internship Modal */}
      {isAssignOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Assign Internship</h3>
              <button onClick={() => setIsAssignOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                <p className="text-xs text-indigo-600 uppercase tracking-wider mb-1">Mentor</p>
                <p className="font-semibold text-indigo-900">{selectedMentor.name} <span className="font-normal text-indigo-700 font-mono text-xs">({selectedMentor.id.slice(0, 8)}...)</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Select Internship to Assign</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  value={selectedInternshipId}
                  onChange={(e) => setSelectedInternshipId(e.target.value)}
                >
                  <option value="">-- No Internship (Unassign) --</option>
                  {internships.map(i => (
                    <option key={i.id} value={i.id}>{i.title}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Assigning this internship will grant the mentor access to manage its selected interns.</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignInternship} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Assignment
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
