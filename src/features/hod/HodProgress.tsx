import React, { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/apiClient';

export const HodProgress: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for detailed view modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/hod/progress');
      setStudents((response.data as any[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateProgress = (assignment: any) => {
    if (!assignment) return { overall: 0, tasks: 0, milestones: 0, attendance: 0, hasData: false };
    
    // Tasks Progress
    const totalTasks = assignment.tasks?.length || 0;
    const completedTasks = assignment.tasks?.filter((t: any) => t.status === 'approved' || t.status === 'completed').length || 0;
    const tasksPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Milestones Progress
    const totalMilestones = assignment.milestones?.length || 0;
    const completedMilestones = assignment.milestones?.filter((m: any) => m.status === 'completed' || m.status === 'verified').length || 0;
    const milestonesPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // Attendance Progress
    const totalAttendance = assignment.attendanceRecords?.length || 0;
    const presentAttendance = assignment.attendanceRecords?.filter((a: any) => a.status === 'present').length || 0;
    const attendancePercent = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

    // Overall Calculation (averaging available metrics)
    let validMetricsCount = 0;
    let totalScore = 0;
    
    if (totalTasks > 0) { validMetricsCount++; totalScore += tasksPercent; }
    if (totalMilestones > 0) { validMetricsCount++; totalScore += milestonesPercent; }
    if (totalAttendance > 0) { validMetricsCount++; totalScore += attendancePercent; }
    
    const overall = validMetricsCount > 0 ? Math.round(totalScore / validMetricsCount) : 0;
    const hasData = validMetricsCount > 0;

    return { overall, tasksPercent, milestonesPercent, attendancePercent, hasData, totalTasks, completedTasks, totalMilestones, completedMilestones, totalAttendance, presentAttendance };
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-rose-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Student Progress</h1>
      
      {students.length === 0 ? (
        <div className="text-slate-500">No student progress data found in your department.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Internship / Company</th>
                <th className="p-4">Assigned Faculty</th>
                <th className="p-4">Overall Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any) => {
                const assignment = student.assignments?.[0]; // Get the primary/latest assignment if available
                if (!assignment) {
                  return (
                    <tr key={student.id} className="border-b border-slate-100">
                      <td className="p-4 font-medium text-slate-900">{student.profile.fullName}</td>
                      <td className="p-4 text-slate-400 italic" colSpan={3}>No active internship assignment</td>
                    </tr>
                  );
                }

                const progress = calculateProgress(assignment);

                return (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedStudent(student)}>
                    <td className="p-4">
                      <div className="font-medium text-indigo-600 hover:underline">{student.profile.fullName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{assignment.internship?.title || 'Internship'}</div>
                      <div className="text-xs text-slate-500">{assignment.company?.companyName}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      {assignment.facultyMentor?.profile?.fullName || 'Unassigned'}
                    </td>
                    <td className="p-4">
                      {progress.hasData ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progress.overall}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold">{progress.overall}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No data</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Detailed Progress: {selectedStudent.profile.fullName}</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600">
                Close
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {(() => {
                const assignment = selectedStudent.assignments?.[0];
                if (!assignment) return <div>No internship assignment available.</div>;

                const progress = calculateProgress(assignment);
                
                const avgScore = assignment.evaluations?.length > 0 
                  ? (assignment.evaluations.reduce((sum: number, ev: any) => sum + Number(ev.overallRating || 0), 0) / assignment.evaluations.length).toFixed(1)
                  : null;

                const workLogsCount = assignment.workLogs?.length || 0;

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Company</p>
                        <p className="text-slate-900 font-medium">{assignment.company?.companyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Faculty Mentor</p>
                        <p className="text-slate-900 font-medium">{assignment.facultyMentor?.profile?.fullName}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800">Overall Progress</h3>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {progress.hasData ? (
                           <div className="flex items-center space-x-3">
                             <div className="flex-1 bg-slate-200 rounded-full h-3">
                               <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${progress.overall}%` }}></div>
                             </div>
                             <span className="font-bold text-emerald-700">{progress.overall}%</span>
                           </div>
                        ) : (
                          <div className="text-slate-500 text-sm">No data available to calculate overall progress.</div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Tasks Progress</p>
                          {progress.totalTasks > 0 ? (
                            <>
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>{progress.completedTasks} of {progress.totalTasks} Completed</span>
                                <span>{progress.tasksPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress.tasksPercent}%` }}></div>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">No tasks assigned</p>
                          )}
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Milestones Progress</p>
                          {progress.totalMilestones > 0 ? (
                            <>
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>{progress.completedMilestones} of {progress.totalMilestones} Achieved</span>
                                <span>{progress.milestonesPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress.milestonesPercent}%` }}></div>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">No milestones set</p>
                          )}
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Attendance</p>
                          {progress.totalAttendance > 0 ? (
                            <>
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>{progress.presentAttendance} of {progress.totalAttendance} Present</span>
                                <span>{progress.attendancePercent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress.attendancePercent}%` }}></div>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">No attendance records</p>
                          )}
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Work Logs & Evaluations</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Total Work Logs:</span>
                            <span className="font-semibold text-slate-900">{workLogsCount} logs</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-slate-600">Avg Evaluation Rating:</span>
                            <span className="font-semibold text-slate-900">{avgScore ? `${avgScore} / 5` : 'No evaluations'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
