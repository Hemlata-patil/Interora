import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  PageHeader, 
  StatCard, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Input,
  EmptyState
} from '@/components';
import { CheckCircle2, ShieldAlert, FileSearch, Star, Loader2, AlertCircle } from 'lucide-react';
import type { Column } from '@/components/ui/Table';
import {
  fetchEvaluationsBackend,
  updateEvaluationStatusBackend,
  type EvaluationRecord,
} from '@/services/api/backendService';

export interface DisplayEvaluation {
  id: string;
  internId: string;
  studentName: string;
  studentRoll: string;
  evaluationType: string;
  evaluationPeriod: string;
  status: 'Pending Faculty Verification' | 'Verified' | 'Correction Required';
  rawStatus: string;
  submittedAt?: string;
  updatedAt: string;
  technicalSkills: number;
  qualityOfWork: number;
  problemSolving: number;
  communication: number;
  teamwork: number;
  professionalism: number;
  timeManagement: number;
  initiative: number;
  overallRating: number;
  strengths: string;
  areasForImprovement: string;
  comments: string;
  recommendation: string;
  crossVerified: boolean;
  crossVerifiedBy?: string;
  crossVerifiedAt?: string;
  discrepancyNote?: string;
}

export const CrossVerification: React.FC = () => {
  const [evaluations, setEvaluations] = useState<DisplayEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<DisplayEvaluation | null>(null);
  
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [discrepancyNote, setDiscrepancyNote] = useState('');

  const loadEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const raw = await fetchEvaluationsBackend();
      
      // Filter out drafts and map to display items
      const mapped: DisplayEvaluation[] = (raw || [])
        .filter(e => e.status !== 'draft')
        .map(e => {
          const rawScore = Number(e.overallScore) || 0;
          const overallRating = rawScore > 5 ? Number((rawScore / 20).toFixed(1)) : (rawScore || 4.0);
          const criteria = (e.criteriaScores || {}) as Record<string, any>;
          
          let displayStatus: 'Pending Faculty Verification' | 'Verified' | 'Correction Required' = 'Pending Faculty Verification';
          if (e.status === 'verified') displayStatus = 'Verified';
          else if (e.status === 'correction_required') displayStatus = 'Correction Required';

          const student = e.assignment?.student;
          const studentName = student?.fullName || 'Assigned Student';
          const studentRoll = student?.enrollmentNumber || student?.id || e.assignment?.studentId || 'ID-STUDENT';
          
          const getScore = (key: string, fallback: number = overallRating) => {
            const val = Number(criteria[key]);
            if (!isNaN(val) && val > 0) {
              return val > 5 ? Number((val / 20).toFixed(1)) : val;
            }
            return fallback;
          };

          return {
            id: e.id,
            internId: e.assignment?.studentId || '',
            studentName,
            studentRoll,
            evaluationType: e.evaluationType === 'midterm' ? 'Mid-Term Evaluation' : e.evaluationType === 'final' ? 'Final Evaluation' : 'Performance Evaluation',
            evaluationPeriod: e.evaluationPeriod || (e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Current Period'),
            status: displayStatus,
            rawStatus: e.status,
            submittedAt: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : undefined,
            updatedAt: e.updatedAt ? new Date(e.updatedAt).toLocaleDateString() : 'Recent',
            technicalSkills: getScore('technicalSkills'),
            qualityOfWork: getScore('qualityOfWork'),
            problemSolving: getScore('problemSolving'),
            communication: getScore('communication'),
            teamwork: getScore('teamwork'),
            professionalism: getScore('professionalism'),
            timeManagement: getScore('timeManagement'),
            initiative: getScore('initiative'),
            overallRating,
            strengths: e.strengths || 'Consistent performance and active engagement.',
            areasForImprovement: e.improvementAreas || 'Continue deepening domain-specific knowledge.',
            comments: e.comments || e.notes || 'Good performance observed across internship deliverables.',
            recommendation: e.recommendation || 'Satisfactory Performance',
            crossVerified: e.status === 'verified',
            crossVerifiedBy: e.status === 'verified' ? 'Faculty Mentor' : undefined,
            crossVerifiedAt: e.status === 'verified' && e.updatedAt ? new Date(e.updatedAt).toLocaleDateString() : undefined,
            discrepancyNote: e.discrepancyNotes || undefined,
          };
        });

      setEvaluations(mapped);
    } catch (err: any) {
      console.error('Failed to load evaluations for cross-verification:', err);
      setError(err?.message || 'Failed to load evaluations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  const pendingCount = evaluations.filter(e => e.status === 'Pending Faculty Verification').length;
  const verifiedCount = evaluations.filter(e => e.status === 'Verified').length;
  const discrepancyCount = evaluations.filter(e => e.status === 'Correction Required').length;

  const handleReview = (evaluation: DisplayEvaluation) => {
    setSelectedEval(evaluation);
    setIsModalOpen(true);
  };

  const handleCrossVerify = async () => {
    if (!selectedEval) return;
    try {
      setActionLoading(true);
      await updateEvaluationStatusBackend(selectedEval.id, { status: 'verified' });

      setEvaluations(prev => prev.map(e => {
        if (e.id === selectedEval.id) {
          return {
            ...e,
            status: 'Verified',
            rawStatus: 'verified',
            crossVerified: true,
            crossVerifiedBy: 'Faculty Mentor (You)',
            crossVerifiedAt: new Date().toLocaleDateString(),
            discrepancyNote: undefined
          };
        }
        return e;
      }));
      
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error verifying evaluation:', err);
      alert(err?.message || 'Failed to verify evaluation.');
    } finally {
      setActionLoading(false);
    }
  };

  const openDiscrepancyFlag = () => {
    setIsDiscrepancyModalOpen(true);
  };

  const handleFlagDiscrepancy = async () => {
    if (!selectedEval || !discrepancyNote.trim()) return;
    try {
      setActionLoading(true);
      await updateEvaluationStatusBackend(selectedEval.id, { 
        status: 'correction_required', 
        discrepancyNotes: discrepancyNote.trim() 
      });

      setEvaluations(prev => prev.map(e => {
        if (e.id === selectedEval.id) {
          return {
            ...e,
            status: 'Correction Required',
            rawStatus: 'correction_required',
            crossVerified: false,
            discrepancyNote: discrepancyNote.trim()
          };
        }
        return e;
      }));

      setIsDiscrepancyModalOpen(false);
      setIsModalOpen(false);
      setDiscrepancyNote('');
    } catch (err: any) {
      console.error('Error flagging discrepancy:', err);
      alert(err?.message || 'Failed to flag discrepancy.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (evalData: DisplayEvaluation) => {
    if (evalData.status === 'Verified') {
      return <Badge variant="emerald">Verified</Badge>;
    }
    if (evalData.status === 'Correction Required') {
      return <Badge variant="rose">Correction Required</Badge>;
    }
    return <Badge variant="amber">Pending Verification</Badge>;
  };

  const columns: Column<DisplayEvaluation>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.studentName}</div>
          <div className="text-xs text-slate-500">{row.studentRoll}</div>
        </div>
      ),
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading evaluations...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-rose-600">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={loadEvaluations} className="mt-4">
                Retry
              </Button>
            </div>
          ) : evaluations.length > 0 ? (
            <Table 
              columns={columns} 
              data={evaluations} 
              keyExtractor={(row) => row.id} 
            />
          ) : (
            <EmptyState
              title="No evaluations pending verification"
              description="Evaluations submitted by mentors will appear here for your review and sign-off."
            />
          )}
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
        {selectedEval && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {selectedEval.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{selectedEval.studentName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedEval.studentRoll}</p>
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
                  <Button variant="outline" onClick={openDiscrepancyFlag} disabled={actionLoading}>
                    Flag Discrepancy
                  </Button>
                  <Button variant="primary" onClick={handleCrossVerify} disabled={actionLoading}>
                    {actionLoading ? 'Verifying...' : 'Cross-Verify'}
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
            <Button variant="primary" onClick={handleFlagDiscrepancy} disabled={!discrepancyNote.trim() || actionLoading}>
              {actionLoading ? 'Submitting...' : 'Submit Flag'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
