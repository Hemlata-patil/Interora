import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Button, Input, Alert } from '@/components';
import { FileCheck, Star, X, CheckCircle2 } from 'lucide-react';
import { 
  mockCompanyApplications, 
  mockFacultyStudents, 
  mockCompanyInternships,
  mockCompanyEvaluations,
  setMockCompanyEvaluations,
  MOCK_CURRENT_MENTOR_ID
} from '../faculty/mockData';
import type { SharedStudentData, CompanyEvaluationData } from '../faculty/mockData';

export const MentorEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<CompanyEvaluationData[]>(mockCompanyEvaluations);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SharedStudentData | null>(null);
  const [evalType, setEvalType] = useState('Mid-Term Evaluation');
  const [ratings, setRatings] = useState({
    technicalSkills: 0,
    communication: 0,
    professionalism: 0,
    problemSolving: 0,
    overallRating: 0
  });
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [triggerRender, setTriggerRender] = useState(0);

  // Compute assigned students for this mentor
  const assignedStudents = useMemo(() => {
    // We add triggerRender to dependencies so that we can force re-evaluation of the mock data if needed
    void triggerRender;
    const selectedApps = mockCompanyApplications.filter(a => a.applicationStatus === 'Selected');
    return selectedApps.map(app => {
      const student = mockFacultyStudents.find(s => s.id === app.studentId);
      const internship = mockCompanyInternships.find(i => i.id === app.internshipId);
      if (student && internship && internship.mentorId === MOCK_CURRENT_MENTOR_ID) {
        return student;
      }
      return null;
    }).filter(Boolean) as SharedStudentData[];
  }, [triggerRender]);

  const getStudentEval = (studentId: string) => {
    return evaluations.find(e => e.internId === studentId && e.industryMentorId === MOCK_CURRENT_MENTOR_ID);
  };

  const handleOpenEval = (student: SharedStudentData) => {
    setSelectedStudent(student);
    const existingEval = getStudentEval(student.id);

    if (existingEval) {
      setRatings({
        technicalSkills: existingEval.technicalSkills,
        communication: existingEval.communication,
        professionalism: existingEval.professionalism,
        problemSolving: existingEval.problemSolving,
        overallRating: existingEval.overallRating
      });
      setFeedback(existingEval.comments || '');
      setEvalType(existingEval.evaluationType);
    } else {
      setRatings({
        technicalSkills: 0,
        communication: 0,
        professionalism: 0,
        problemSolving: 0,
        overallRating: 0
      });
      setFeedback('');
      setEvalType('Mid-Term Evaluation');
    }
    setErrorMsg('');
    setIsEvaluating(true);
  };

  const handleCloseEval = () => {
    setIsEvaluating(false);
    setSelectedStudent(null);
  };

  const handleSaveEval = () => {
    if (!selectedStudent) return;
    
    // Validation
    const missingRatings = Object.values(ratings).some(val => val === 0);
    if (missingRatings) {
      setErrorMsg('Please select a rating (1-5) for all criteria.');
      return;
    }
    if (!feedback.trim()) {
      setErrorMsg('Please provide detailed feedback.');
      return;
    }

    // Identify internship
    const app = mockCompanyApplications.find(a => a.studentId === selectedStudent.id && a.applicationStatus === 'Selected');
    const internshipId = app?.internshipId || 'int-1';
    const internship = mockCompanyInternships.find(i => i.id === internshipId);

    const existingEval = getStudentEval(selectedStudent.id);
    const date = new Date().toISOString().split('T')[0];

    const evalData: CompanyEvaluationData = {
      id: existingEval?.id || `eval-${Date.now()}`,
      internId: selectedStudent.id,
      internshipId: internshipId,
      companyId: internship?.companyId || 'company-1',
      industryMentorId: MOCK_CURRENT_MENTOR_ID,
      facultyMentorId: 'fac-1', // Default mock faculty mentor
      evaluationType: evalType as 'Mid-Term Evaluation' | 'Final Evaluation',
      evaluationPeriod: 'Current',
      status: 'Pending Faculty Verification',
      technicalSkills: ratings.technicalSkills,
      qualityOfWork: ratings.technicalSkills, // Simplified for mentor UI
      problemSolving: ratings.problemSolving,
      communication: ratings.communication,
      teamwork: ratings.communication, // Simplified for mentor UI
      professionalism: ratings.professionalism,
      timeManagement: ratings.professionalism, // Simplified for mentor UI
      initiative: ratings.problemSolving, // Simplified for mentor UI
      overallRating: ratings.overallRating,
      strengths: '',
      areasForImprovement: '',
      comments: feedback,
      recommendation: 'Recommend',
      submittedAt: date,
      updatedAt: date,
      crossVerified: false
    };

    let updatedEvals;
    if (existingEval) {
      updatedEvals = evaluations.map(e => e.id === evalData.id ? evalData : e);
    } else {
      updatedEvals = [...evaluations, evalData];
    }

    setEvaluations(updatedEvals);
    setMockCompanyEvaluations(updatedEvals);

    // Update student status so the badge changes
    const target = mockFacultyStudents.find(s => s.id === selectedStudent.id);
    if (target) {
      target.evaluationStatus = 'Completed';
    }

    setTriggerRender(prev => prev + 1);
    handleCloseEval();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Student Evaluations"
        description="Provide structured performance feedback for your assigned interns."
      />

      <div className="flex gap-4 mb-6">
        <Card className="flex-1 p-4 flex items-center justify-between bg-indigo-50 border-indigo-100 shadow-sm">
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Pending Evaluations</p>
            <p className="text-2xl font-bold text-indigo-700">{assignedStudents.filter(s => !getStudentEval(s.id)).length}</p>
          </div>
          <FileCheck className="w-8 h-8 text-indigo-200" />
        </Card>
        <Card className="flex-1 p-4 flex items-center justify-between bg-emerald-50 border-emerald-100 shadow-sm">
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Completed Evaluations</p>
            <p className="text-2xl font-bold text-emerald-700">{assignedStudents.filter(s => getStudentEval(s.id)).length}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-200" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedStudents.map(student => {
          const evalData = getStudentEval(student.id);
          return (
          <Card key={student.id} className="shadow-sm flex flex-col h-full">
            <div className="mb-4 pb-4 border-b border-slate-100 flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                {student.studentName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{student.studentName}</h3>
                <p className="text-xs text-slate-500">Status: {student.evaluationStatus}</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {evalData ? (
                <>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Technical Skills</p>
                      <div className="flex items-center text-amber-500 text-xs font-bold"><Star className="w-3.5 h-3.5 mr-1 fill-current" /> {evalData.technicalSkills}/5</div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Communication</p>
                      <div className="flex items-center text-amber-500 text-xs font-bold"><Star className="w-3.5 h-3.5 mr-1 fill-current" /> {evalData.communication}/5</div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Professionalism</p>
                      <div className="flex items-center text-amber-500 text-xs font-bold"><Star className="w-3.5 h-3.5 mr-1 fill-current" /> {evalData.professionalism}/5</div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Problem Solving</p>
                      <div className="flex items-center text-amber-500 text-xs font-bold"><Star className="w-3.5 h-3.5 mr-1 fill-current" /> {evalData.problemSolving}/5</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Mentor Feedback</p>
                    <p className="text-sm text-slate-700 italic">"{evalData.comments}"</p>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                  <FileCheck className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-700">No evaluation recorded yet</p>
                  <p className="text-xs mt-1">Submit a mid-term or final evaluation.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button className="w-full justify-center" onClick={() => handleOpenEval(student)}>
                {evalData ? 'Update Evaluation' : 'Evaluate Student'}
              </Button>
            </div>
          </Card>
          );
        })}
        {assignedStudents.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500">
            No interns assigned.
          </div>
        )}
      </div>

      {isEvaluating && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedStudent.companyEvaluation ? 'Update Evaluation' : 'Give Evaluation'}
                </h2>
                <p className="text-sm text-slate-500">For {selectedStudent.studentName} ({selectedStudent.company})</p>
              </div>
              <Button variant="ghost" className="p-2 -mr-2 text-slate-400 hover:text-slate-600" onClick={handleCloseEval}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {errorMsg && (
              <Alert type="error" className="mb-6">
                {errorMsg}
              </Alert>
            )}

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Evaluation Type *</label>
                <select
                  value={evalType}
                  onChange={e => setEvalType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Mid-Term Evaluation">Mid-Term Evaluation</option>
                  <option value="Final Evaluation">Final Evaluation</option>
                </select>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Performance Ratings (1-5) *</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(ratings).map((key) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">{label}</label>
                        <select
                          value={ratings[key as keyof typeof ratings]}
                          onChange={e => setRatings(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={0}>Select Rating...</option>
                          <option value={1}>1 - Needs Improvement</option>
                          <option value={2}>2 - Below Expectations</option>
                          <option value={3}>3 - Meets Expectations</option>
                          <option value={4}>4 - Exceeds Expectations</option>
                          <option value={5}>5 - Outstanding</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Detailed Feedback *</label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Provide specific feedback on the intern's performance, strengths, and areas for improvement..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={handleCloseEval}>Cancel</Button>
                <Button onClick={handleSaveEval}>
                  {selectedStudent.companyEvaluation ? 'Update Evaluation' : 'Save Evaluation'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
