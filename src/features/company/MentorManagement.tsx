import React, { useState } from 'react';
import { PageHeader, Card, Button, Badge, Input } from '@/components';
import { Users, Mail, Phone, Briefcase, Plus, Search, Edit, X } from 'lucide-react';
import { 
  mockCompanyMentors, 
  setMockCompanyMentors,
  mockCompanyInternships,
  setMockCompanyInternships
} from '../faculty/mockData';
import type { CompanyMentorData } from '../faculty/mockData';

export const MentorManagement: React.FC = () => {
  const [mentors, setMentors] = useState<CompanyMentorData[]>(mockCompanyMentors);
  const [internships, setInternships] = useState(mockCompanyInternships);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddMentorOpen, setIsAddMentorOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<CompanyMentorData | null>(null);

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

  const assignedMentorsCount = mentors.filter(m => internships.some(i => i.mentorId === m.id)).length;
  const unassignedMentorsCount = mentors.length - assignedMentorsCount;

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMentor = () => {
    const nextId = `MNT-00${mentors.length + 1}`;
    const mentorToAdd: CompanyMentorData = {
      id: nextId,
      name: newMentor.name,
      email: newMentor.email,
      phone: newMentor.phone,
      department: newMentor.department,
      designation: newMentor.designation,
      status: 'Active'
    };

    const updatedMentors = [...mentors, mentorToAdd];
    setMentors(updatedMentors);
    setMockCompanyMentors(updatedMentors);
    setIsAddMentorOpen(false);
    setNewMentor({ name: '', email: '', phone: '', department: '', designation: '' });
  };

  const openAssignModal = (mentor: CompanyMentorData) => {
    setSelectedMentor(mentor);
    // Find if already assigned
    const currentAssignment = internships.find(i => i.mentorId === mentor.id);
    setSelectedInternshipId(currentAssignment ? currentAssignment.id : '');
    setIsAssignOpen(true);
  };

  const handleAssignInternship = () => {
    if (!selectedMentor) return;

    const updatedInternships = internships.map(i => {
      // If this internship is the newly selected one, assign the mentor
      if (i.id === selectedInternshipId) {
        return { ...i, mentorId: selectedMentor.id };
      }
      // If this internship was previously assigned to this mentor but isn't anymore, clear it
      if (i.mentorId === selectedMentor.id && i.id !== selectedInternshipId) {
        return { ...i, mentorId: undefined };
      }
      return i;
    });

    setInternships(updatedInternships);
    setMockCompanyInternships(updatedInternships);
    setIsAssignOpen(false);
    setSelectedMentor(null);
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
                const assignedInternship = internships.find(i => i.mentorId === mentor.id);
                
                return (
                  <tr key={mentor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {mentor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{mentor.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{mentor.id}</p>
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
                      {assignedInternship ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-indigo-700">{assignedInternship.title}</span>
                          <span className="text-xs text-slate-500">Selected Interns: {assignedInternship.applicationCount > 0 ? Math.floor(assignedInternship.applicationCount / 3) : 0}</span>
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
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <Input 
                  placeholder="e.g. Neha Sharma" 
                  value={newMentor.name}
                  onChange={(e) => setNewMentor({...newMentor, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
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
                  <label className="text-sm font-medium text-slate-700">Designation</label>
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
              <Button onClick={handleAddMentor} disabled={!newMentor.name || !newMentor.email}>Save Mentor</Button>
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
                <p className="font-semibold text-indigo-900">{selectedMentor.name} <span className="font-normal text-indigo-700">({selectedMentor.id})</span></p>
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
              <Button onClick={handleAssignInternship}>Save Assignment</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
