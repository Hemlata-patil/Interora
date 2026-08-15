import React, { useState, useMemo } from 'react';
import { 
  PageHeader, 
  StatCard, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Input,
  Select,
  EmptyState
} from '@/components';
import { mockFacultyStudents } from './mockData';
import type { SharedStudentData, FacultyEvaluation } from './mockData';
import { FileCheck, Star, Clock, CheckCircle2, FileSignature } from 'lucide-react';
import type { Column } from '@/components/ui/Table';

export const StudentEvaluations: React.FC = () => {
  const [students, setStudents] = useState<SharedStudentData[]>(mockFacultyStudents);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Stats
  const totalCount = students.length;
  const completedCount = students.filter(s => s.facultyEvaluation?.status === 'Completed').length;
  const pendingCount = totalCount - completedCount;

  const averageRating = useMemo(() => {
    const rated = students.filter(s => s.facultyEvaluation?.status === 'Completed');
    if (rated.length === 0) return 0;
    const total = rated.reduce((acc, curr) => acc + (curr.facultyEvaluation?.overallRating || 0), 0);
    return (total / rated.length).toFixed(1);
  }, [students]);

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        student.studentName.toLowerCase().includes(searchLower) ||
        student.company.toLowerCase().includes(searchLower) ||
        student.role.toLowerCase().includes(searchLower);
      
      const evalStatus = student.facultyEvaluation?.status || 'Pending';
      const matchesStatus = statusFilter === 'All' || evalStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SharedStudentData | null>(null);
  const [evalForm, setEvalForm] = useState<FacultyEvaluation>({
    technicalSkills: 0,
    communication: 0,
    professionalism: 0,
    problemSolving: 0,
    overallRating: 0,
    writtenFeedback: '',
    status: 'Pending'
  });

  const handleEvaluate = (student: SharedStudentData) => {
    setSelectedStudent(student);
    if (student.facultyEvaluation) {
      setEvalForm(student.facultyEvaluation);
    } else {
      setEvalForm({
        technicalSkills: 0,
        communication: 0,
        professionalism: 0,
        problemSolving: 0,
        overallRating: 0,
        writtenFeedback: '',
        status: 'Pending'
      });
    }
    setIsModalOpen(true);
  };

  const handleRatingChange = (field: keyof FacultyEvaluation, value: number) => {
    setEvalForm(prev => {
      const next = { ...prev, [field]: value };
      const avg = (next.technicalSkills + next.communication + next.professionalism + next.problemSolving) / 4;
      next.overallRating = avg || 0;
      return next;
    });
  };

  const handleSave = (isSubmit: boolean = false) => {
    if (!selectedStudent) return;

    const finalEval = {
      ...evalForm,
      status: isSubmit ? ('Completed' as const) : evalForm.status,
      lastEvaluated: new Date().toLocaleDateString()
    };

    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          facultyEvaluation: finalEval,
          evaluationStatus: isSubmit ? 'Completed' : 'In Progress'
        };
      }
      return s;
    }));

    setIsModalOpen(false);
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'Completed') {
      return <Badge variant="emerald">Completed</Badge>;
    }
    return <Badge variant="amber">Pending</Badge>;
  };

  const columns: Column<SharedStudentData>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.studentName}</div>
          <div className="text-xs text-slate-500">{row.studentId}</div>
        </div>
      ),
    },
    {
      header: 'Internship',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.role}</div>
          <div className="text-xs text-slate-500">{row.company}</div>
        </div>
      ),
    },
    {
      header: 'Overall Rating',
      cell: (row) => {
        const rating = row.facultyEvaluation?.overallRating;
        if (!rating) return <span className="text-slate-400 text-xs">Not rated</span>;
        return (
          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            {rating.toFixed(1)}
          </div>
        );
      },
    },
    {
      header: 'Status',
      cell: (row) => getStatusBadge(row.facultyEvaluation?.status),
    },
    {
      header: 'Last Evaluated',
      cell: (row) => (
        <span className="text-xs text-slate-500">
          {row.facultyEvaluation?.lastEvaluated || 'Never'}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleEvaluate(row)}
        >
          {row.facultyEvaluation?.status === 'Completed' ? 'View Evaluation' : 'Evaluate'}
        </Button>
      ),
    },
  ];

  const StarRatingInput = ({ label, field, value }: { label: string, field: keyof FacultyEvaluation, value: number }) => (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRatingChange(field, star)}
            className="p-1 focus:outline-none transition-transform hover:scale-110"
            disabled={evalForm.status === 'Completed'}
          >
            <Star 
              className={`w-6 h-6 ${star <= value ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} 
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-bold text-slate-600">{value > 0 ? value : '-'}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Student Evaluations"
        description="Review and evaluate the performance of your assigned internship students."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={totalCount} icon={FileSignature} />
        <StatCard title="Pending Evaluations" value={pendingCount} icon={Clock} trend={{ value: 'Needs action', isPositive: false }} />
        <StatCard title="Completed Evaluations" value={completedCount} icon={CheckCircle2} />
        <StatCard title="Average Rating" value={`${averageRating} / 5.0`} icon={Star} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:max-w-xs">
            <Input 
              placeholder="Search student or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              label="Search"
            />
          </div>
          <div className="w-full sm:max-w-xs">
            <Select 
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Evaluations', value: 'All' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Completed', value: 'Completed' },
              ]}
            />
          </div>
        </div>

        <div className="p-4">
          {filteredStudents.length > 0 ? (
            <Table 
              columns={columns} 
              data={filteredStudents} 
              keyExtractor={(row) => row.id} 
            />
          ) : (
            <EmptyState 
              title="No students found" 
              description="Try adjusting your search or filter criteria."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={evalForm.status === 'Completed' ? 'View Evaluation' : 'Student Evaluation'}
        description="Provide performance feedback for the student."
        className="max-w-2xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {selectedStudent.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{selectedStudent.studentName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedStudent.studentId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{selectedStudent.company}</p>
                <p className="text-xs text-slate-500">{selectedStudent.role}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Evaluation Criteria</h4>
                {getStatusBadge(evalForm.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <StarRatingInput label="Technical Skills" field="technicalSkills" value={evalForm.technicalSkills} />
                <StarRatingInput label="Communication" field="communication" value={evalForm.communication} />
                <StarRatingInput label="Professionalism" field="professionalism" value={evalForm.professionalism} />
                <StarRatingInput label="Problem Solving" field="problemSolving" value={evalForm.problemSolving} />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
                <span className="font-semibold text-slate-800">Overall Rating</span>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-xl font-bold text-slate-900">{evalForm.overallRating.toFixed(1)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Written Feedback</label>
                <textarea
                  value={evalForm.writtenFeedback}
                  onChange={(e) => setEvalForm(prev => ({ ...prev, writtenFeedback: e.target.value }))}
                  disabled={evalForm.status === 'Completed'}
                  placeholder="Provide detailed feedback on the student's performance..."
                  className="w-full min-h-[100px] p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-600 outline-none"
                />
              </div>
            </div>

            {evalForm.status !== 'Completed' && (
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => handleSave(false)}>
                  Save Draft
                </Button>
                <Button variant="primary" onClick={() => handleSave(true)} disabled={evalForm.overallRating === 0 || !evalForm.writtenFeedback.trim()}>
                  Submit Evaluation
                </Button>
              </div>
            )}
            
            {evalForm.status === 'Completed' && (
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
