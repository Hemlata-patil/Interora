import React, { useState, useMemo } from 'react';
import { 
  PageHeader, 
  StatCard, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Input
} from '@/components';
import { mockFacultyStudents } from './mockData';
import type { SharedStudentData, CompanyEvaluation } from './mockData';
import { CheckCircle2, ShieldAlert, FileSearch, Star } from 'lucide-react';
import type { Column } from '@/components/ui/Table';

export const CrossVerification: React.FC = () => {
  // Using a local state copy so we can simulate updates
  const [students, setStudents] = useState<SharedStudentData[]>(mockFacultyStudents);

  const evaluationStudents = useMemo(() => {
    return students.filter(s => s.companyEvaluation !== undefined);
  }, [students]);

  const totalEvaluations = evaluationStudents.length;
  const pendingCount = evaluationStudents.filter(s => s.companyEvaluation?.cross_verified === false && !s.companyEvaluation?.cross_verification_note).length;
  const verifiedCount = evaluationStudents.filter(s => s.companyEvaluation?.cross_verified === true).length;
  const discrepancyCount = evaluationStudents.filter(s => s.companyEvaluation?.cross_verified === false && s.companyEvaluation?.cross_verification_note).length;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SharedStudentData | null>(null);
  
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [discrepancyNote, setDiscrepancyNote] = useState('');

  const handleReview = (student: SharedStudentData) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCrossVerify = () => {
    if (!selectedStudent) return;
    
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudent.id && s.companyEvaluation) {
        return {
          ...s,
          companyEvaluation: {
            ...s.companyEvaluation,
            cross_verified: true,
            cross_verified_by: 'Faculty Mentor',
            cross_verified_at: new Date().toLocaleDateString(),
            cross_verification_note: undefined
          }
        };
      }
      return s;
    }));
    
    setIsModalOpen(false);
  };

  const openDiscrepancyFlag = () => {
    setIsDiscrepancyModalOpen(true);
  };

  const handleFlagDiscrepancy = () => {
    if (!selectedStudent || !discrepancyNote.trim()) return;
    
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudent.id && s.companyEvaluation) {
        return {
          ...s,
          companyEvaluation: {
            ...s.companyEvaluation,
            cross_verified: false,
            cross_verification_note: discrepancyNote
          }
        };
      }
      return s;
    }));
    
    setIsDiscrepancyModalOpen(false);
    setIsModalOpen(false);
    setDiscrepancyNote('');
  };

  const getStatusBadge = (evalData: CompanyEvaluation) => {
    if (evalData.cross_verified) {
      return <Badge variant="emerald">Verified</Badge>;
    }
    if (evalData.cross_verification_note) {
      return <Badge variant="rose">Discrepancy</Badge>;
    }
    return <Badge variant="amber">Pending Verification</Badge>;
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
      header: 'Company / Role',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.company}</div>
          <div className="text-xs text-slate-500">{row.role}</div>
        </div>
      ),
    },
    {
      header: 'Overall Rating',
      cell: (row) => (
        <div className="flex items-center gap-1 text-slate-700 font-semibold">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          {row.companyEvaluation?.overallRating.toFixed(1)}
        </div>
      ),
    },
    {
      header: 'Submitted By',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.companyEvaluation?.submittedBy}</div>
          <div className="text-xs text-slate-500">{row.companyEvaluation?.submittedDate}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => row.companyEvaluation ? getStatusBadge(row.companyEvaluation) : null,
    },
    {
      header: 'Action',
      cell: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleReview(row)}
        >
          Review
        </Button>
      ),
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} 
          />
        ))}
        <span className="ml-2 font-semibold text-slate-700 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Cross-Verification"
        description="Review and cross-verify performance evaluations submitted by Company Mentors."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending Verification" value={pendingCount} icon={FileSearch} />
        <StatCard title="Verified" value={verifiedCount} icon={CheckCircle2} />
        <StatCard title="Discrepancies" value={discrepancyCount} icon={ShieldAlert} trend={{ value: 'Requires follow-up', isPositive: false }} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Company Evaluations</h3>
        </div>
        <div className="p-4">
          <Table 
            columns={columns} 
            data={evaluationStudents} 
            keyExtractor={(row) => row.id} 
          />
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review Evaluation"
        description="Cross-verify the evaluation submitted by the company mentor."
        className="max-w-2xl"
      >
        {selectedStudent && selectedStudent.companyEvaluation && (
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

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wider mb-1">Evaluation Details</h4>
                  <p className="text-xs text-slate-500">Submitted by: <span className="font-medium text-slate-700">{selectedStudent.companyEvaluation.submittedBy}</span> on {selectedStudent.companyEvaluation.submittedDate}</p>
                </div>
                {getStatusBadge(selectedStudent.companyEvaluation)}
              </div>

              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Technical Skills</p>
                  {renderStars(selectedStudent.companyEvaluation.technicalSkills)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Communication</p>
                  {renderStars(selectedStudent.companyEvaluation.communication)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Professionalism</p>
                  {renderStars(selectedStudent.companyEvaluation.professionalism)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Problem Solving</p>
                  {renderStars(selectedStudent.companyEvaluation.problemSolving)}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase">Overall Rating</p>
                  <div className="flex items-center gap-1 text-lg font-bold text-amber-500">
                    <Star className="w-5 h-5 fill-amber-500" />
                    {selectedStudent.companyEvaluation.overallRating.toFixed(1)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Written Feedback</p>
                  <p className="text-sm text-slate-800 italic">"{selectedStudent.companyEvaluation.writtenFeedback}"</p>
                </div>
              </div>
              
              {selectedStudent.companyEvaluation.cross_verification_note && (
                <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 mt-4">
                  <p className="text-xs font-semibold text-rose-700 uppercase mb-1">Discrepancy Note</p>
                  <p className="text-sm text-rose-800">{selectedStudent.companyEvaluation.cross_verification_note}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {!selectedStudent.companyEvaluation.cross_verified && (
                <>
                  <Button variant="outline" onClick={openDiscrepancyFlag}>
                    Flag Discrepancy
                  </Button>
                  <Button variant="primary" onClick={handleCrossVerify}>
                    Cross-Verify
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Discrepancy Modal */}
      <Modal
        isOpen={isDiscrepancyModalOpen}
        onClose={() => setIsDiscrepancyModalOpen(false)}
        title="Flag Discrepancy"
        description="Please provide a reason or note regarding the discrepancy in this evaluation."
        className="max-w-md"
      >
        <div className="space-y-4">
          <Input 
            label="Discrepancy Note" 
            placeholder="E.g., The student's actual tasks differ from the feedback provided..."
            value={discrepancyNote}
            onChange={(e) => setDiscrepancyNote(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsDiscrepancyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFlagDiscrepancy} disabled={!discrepancyNote.trim()}>
              Submit Flag
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
