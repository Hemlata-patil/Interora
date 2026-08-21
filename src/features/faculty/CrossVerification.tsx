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
import { 
  mockFacultyStudents, 
  mockCompanyEvaluations, 
  setMockCompanyEvaluations 
} from './mockData';
import type { 
  SharedStudentData, 
  CompanyEvaluationData 
} from './mockData';
import { CheckCircle2, ShieldAlert, FileSearch, Star } from 'lucide-react';
import type { Column } from '@/components/ui/Table';

const MOCK_LOGGED_IN_FACULTY_ID = 'fac-1';

export const CrossVerification: React.FC = () => {
  // Using a local state copy so we can simulate updates
  const [evaluations, setEvaluations] = useState<CompanyEvaluationData[]>(mockCompanyEvaluations);

  const facultyEvaluations = useMemo(() => {
    // Show only evaluations assigned to this faculty mentor that are NOT drafts
    return evaluations.filter(e => 
      e.facultyMentorId === MOCK_LOGGED_IN_FACULTY_ID && 
      e.status !== 'Draft'
    );
  }, [evaluations]);

  const pendingCount = facultyEvaluations.filter(e => e.status === 'Pending Faculty Verification').length;
  const verifiedCount = facultyEvaluations.filter(e => e.status === 'Verified').length;
  const discrepancyCount = facultyEvaluations.filter(e => e.status === 'Correction Required').length;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<CompanyEvaluationData | null>(null);
  
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [discrepancyNote, setDiscrepancyNote] = useState('');

  const handleReview = (evaluation: CompanyEvaluationData) => {
    setSelectedEval(evaluation);
    setIsModalOpen(true);
  };

  const handleCrossVerify = () => {
    if (!selectedEval) return;
    
    const updatedEvals = evaluations.map(e => {
      if (e.id === selectedEval.id) {
        return {
          ...e,
          status: 'Verified' as const,
          crossVerified: true,
          crossVerifiedBy: 'Dr. Mehta (You)', // Mock name for fac-1
          crossVerifiedAt: new Date().toLocaleDateString(),
          discrepancyNote: undefined
        };
      }
      return e;
    });

    setEvaluations(updatedEvals);
    setMockCompanyEvaluations(updatedEvals);
    
    setIsModalOpen(false);
  };

  const openDiscrepancyFlag = () => {
    setIsDiscrepancyModalOpen(true);
  };

  const handleFlagDiscrepancy = () => {
    if (!selectedEval || !discrepancyNote.trim()) return;
    
    const updatedEvals = evaluations.map(e => {
      if (e.id === selectedEval.id) {
        return {
          ...e,
          status: 'Correction Required' as const,
          crossVerified: false,
          discrepancyNote: discrepancyNote
        };
      }
      return e;
    });

    setEvaluations(updatedEvals);
    setMockCompanyEvaluations(updatedEvals);
    
    setIsDiscrepancyModalOpen(false);
    setIsModalOpen(false);
    setDiscrepancyNote('');
  };

  const getStatusBadge = (evalData: CompanyEvaluationData) => {
    if (evalData.status === 'Verified') {
      return <Badge variant="emerald">Verified</Badge>;
    }
    if (evalData.status === 'Correction Required') {
      return <Badge variant="rose">Correction Required</Badge>;
    }
    return <Badge variant="amber">Pending Verification</Badge>;
  };

  const columns: Column<CompanyEvaluationData>[] = [
    {
      header: 'Student',
      cell: (row) => {
        const student = mockFacultyStudents.find(s => s.id === row.internId);
        return (
          <div>
            <div className="font-medium text-slate-900">{student?.studentName || 'Unknown'}</div>
            <div className="text-xs text-slate-500">{student?.studentId || row.internId}</div>
          </div>
        );
      },
    },
    {
      header: 'Evaluation Type',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.evaluationType}</div>
          <div className="text-xs text-slate-500">{row.evaluationPeriod}</div>
        </div>
      ),
    },
    {
      header: 'Overall Rating',
      cell: (row) => (
        <div className="flex items-center gap-1 text-slate-700 font-semibold">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          {row.overallRating.toFixed(1)}
        </div>
      ),
    },
    {
      header: 'Submitted',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.submittedAt || 'N/A'}</div>
          <div className="text-xs text-slate-500">Updated: {row.updatedAt}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => getStatusBadge(row),
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
            data={facultyEvaluations} 
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
        {selectedEval && (() => {
          const student = mockFacultyStudents.find(s => s.id === selectedEval.internId);
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {student?.studentName.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{student?.studentName || 'Unknown Intern'}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{student?.studentId || selectedEval.internId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{selectedEval.evaluationType}</p>
                  <p className="text-xs text-slate-500">{selectedEval.evaluationPeriod}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wider mb-1">Evaluation Details</h4>
                    <p className="text-xs text-slate-500">Submitted on: <span className="font-medium text-slate-700">{selectedEval.submittedAt || 'N/A'}</span></p>
                  </div>
                  {getStatusBadge(selectedEval)}
                </div>

                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Technical Skills</p>
                    {renderStars(selectedEval.technicalSkills)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Quality of Work</p>
                    {renderStars(selectedEval.qualityOfWork)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Communication</p>
                    {renderStars(selectedEval.communication)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Problem Solving</p>
                    {renderStars(selectedEval.problemSolving)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Teamwork</p>
                    {renderStars(selectedEval.teamwork)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Professionalism</p>
                    {renderStars(selectedEval.professionalism)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Time Management</p>
                    {renderStars(selectedEval.timeManagement)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Initiative</p>
                    {renderStars(selectedEval.initiative)}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-slate-700 uppercase">Overall Rating</p>
                    <div className="flex items-center gap-1 text-lg font-bold text-amber-500">
                      <Star className="w-5 h-5 fill-amber-500" />
                      {selectedEval.overallRating.toFixed(1)}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Strengths</p>
                    <p className="text-sm text-slate-800 bg-white p-2 border border-slate-200 rounded">{selectedEval.strengths || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Areas for Improvement</p>
                    <p className="text-sm text-slate-800 bg-white p-2 border border-slate-200 rounded">{selectedEval.areasForImprovement || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Mentor Comments</p>
                    <p className="text-sm text-slate-800 bg-white p-2 border border-slate-200 rounded italic">"{selectedEval.comments || 'No comments provided'}"</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Recommendation</p>
                    <Badge variant="neutral" className="bg-white border border-slate-200">{selectedEval.recommendation}</Badge>
                  </div>
                </div>
                
                {selectedEval.status === 'Correction Required' && selectedEval.discrepancyNote && (
                  <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 mt-4">
                    <p className="text-xs font-semibold text-rose-700 uppercase mb-1">Discrepancy Note Flagged</p>
                    <p className="text-sm text-rose-800">{selectedEval.discrepancyNote}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {selectedEval.status === 'Pending Faculty Verification' && (
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
          );
        })()}
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
