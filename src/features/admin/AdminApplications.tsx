import React, { useState } from 'react';
import { PageHeader, Card, Badge, Input, Select, Button, Modal } from '@/components';
import { FileText, Search, Eye, ShieldCheck } from 'lucide-react';
import {
  mockCompanyApplications,
  mockFacultyStudents,
  mockCompanyInternships,
  type CompanyApplicationData,
} from '@/features/faculty/mockData';

export const AdminApplications: React.FC = () => {
  const [applications] = useState<CompanyApplicationData[]>(mockCompanyApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const fullAppList = applications.map((app) => {
    const student = mockFacultyStudents.find((s) => s.id === app.studentId);
    const internship = mockCompanyInternships.find((i) => i.id === app.internshipId);
    return {
      ...app,
      studentName: student?.studentName || 'Student Recipient',
      studentEmail: student?.email || 'student@university.edu',
      department: student?.department || 'CSE',
      internshipTitle: internship?.title || 'Software Engineer Intern',
      companyName: internship?.domain || 'TechCorp Solutions',
      duration: internship?.duration || '12 Weeks',
      stipend: internship?.stipend || '₹15,000 / mo',
    };
  });

  const filteredApps = fullAppList.filter((a) => {
    const matchesSearch =
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.applicationStatus === statusFilter;
    const matchesDept = deptFilter === 'ALL' || a.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Applications Control Panel"
        description="System-wide oversight of student internship applications and faculty/company approval stages."
      />

      <Card className="p-6 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search by student name, role title, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <div className="w-40">
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Departments' },
                  { value: 'CSE', label: 'CSE' },
                  { value: 'IT', label: 'IT' },
                  { value: 'AIML', label: 'AIML' },
                  { value: 'ECE', label: 'ECE' },
                ]}
              />
            </div>
            <div className="w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'Under Review', label: 'Under Review' },
                  { value: 'Shortlisted', label: 'Shortlisted' },
                  { value: 'Selected', label: 'Selected' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3 font-semibold">Student Name</th>
                <th className="p-3 font-semibold">Dept</th>
                <th className="p-3 font-semibold">Applied Internship</th>
                <th className="p-3 font-semibold">Faculty Stage</th>
                <th className="p-3 font-semibold">Company Status</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span>{app.studentName}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">{app.studentEmail}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="sky">{app.department}</Badge>
                  </td>
                  <td className="p-3 text-slate-700">
                    <span className="font-semibold block">{app.internshipTitle}</span>
                    <span className="text-[10px] text-slate-500">{app.companyName}</span>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        app.facultyApprovalStatus === 'approved'
                          ? 'emerald'
                          : app.facultyApprovalStatus === 'rejected'
                          ? 'rose'
                          : 'amber'
                      }
                    >
                      <ShieldCheck className="w-3 h-3 mr-1 inline" />
                      {app.facultyApprovalStatus === 'approved'
                        ? 'Faculty Approved'
                        : app.facultyApprovalStatus === 'rejected'
                        ? 'Faculty Rejected'
                        : 'Pending Faculty'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        app.applicationStatus === 'Selected'
                          ? 'emerald'
                          : app.applicationStatus === 'Rejected'
                          ? 'rose'
                          : 'sky'
                      }
                    >
                      {app.applicationStatus}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:bg-slate-100 text-[11px] p-1.5"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Application Details — ${selectedApp.studentName}`}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-semibold text-slate-800">{selectedApp.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Email:</span>
                <span className="font-semibold text-slate-800">{selectedApp.studentEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <Badge variant="sky">{selectedApp.department}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Internship Title:</span>
                <span className="font-semibold text-slate-800">{selectedApp.internshipTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company / Domain:</span>
                <span className="font-semibold text-slate-800">{selectedApp.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration & Stipend:</span>
                <span className="font-semibold text-slate-800">{selectedApp.duration} • {selectedApp.stipend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Faculty Review Stage:</span>
                <Badge variant={selectedApp.facultyApprovalStatus === 'approved' ? 'emerald' : 'amber'}>
                  {selectedApp.facultyApprovalStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company Decision:</span>
                <Badge variant={selectedApp.applicationStatus === 'Selected' ? 'emerald' : 'sky'}>
                  {selectedApp.applicationStatus}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
