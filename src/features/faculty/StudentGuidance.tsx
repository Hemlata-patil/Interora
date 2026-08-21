import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Badge } from '@/components';
import { MessageSquare, Plus, CheckCircle2 } from 'lucide-react';
import {
  fetchFacultyAssignedStudentsBackend,
  fetchFacultyGuidanceNotesBackend,
  createFacultyGuidanceNoteBackend,
  type FacultyAssignedStudentRecord,
  type FacultyGuidanceNoteRecord,
} from '@/services/api/backendService';

export const StudentGuidance: React.FC = () => {
  const [students, setStudents] = useState<FacultyAssignedStudentRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [notes, setNotes] = useState<FacultyGuidanceNoteRecord[]>([]);
  const [category, setCategory] = useState<string>('Mentorship Note');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      const stds = await fetchFacultyAssignedStudentsBackend();
      setStudents(stds);
      if (stds.length > 0) {
        setSelectedStudentId(stds[0].studentId);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;

    const loadNotes = async () => {
      const res = await fetchFacultyGuidanceNotesBackend(selectedStudentId);
      setNotes(res);
    };

    loadNotes();
  }, [selectedStudentId]);

  const handleAddNote = async () => {
    if (!selectedStudentId || !newNoteText.trim()) return;

    setSubmitting(true);
    await createFacultyGuidanceNoteBackend(selectedStudentId, category, newNoteText.trim());
    setNewNoteText('');
    const res = await fetchFacultyGuidanceNotesBackend(selectedStudentId);
    setNotes(res);
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Student Guidance & Mentorship Notes"
        description="Log persistent mentorship notes, guidance observations, and intervention feedback for assigned students."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Selector */}
        <Card title="Select Student" className="md:col-span-1">
          <div className="space-y-2 text-xs">
            {students.map((s) => (
              <div
                key={s.studentId}
                onClick={() => setSelectedStudentId(s.studentId)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedStudentId === s.studentId
                    ? 'bg-indigo-50 border-indigo-200 font-bold text-indigo-900'
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                }`}
              >
                <div>{s.studentName}</div>
                <div className="text-[10px] font-normal text-slate-500 truncate">{s.internshipTitle}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Guidance Notes & Input */}
        <Card title="Guidance Timeline & Notes" className="md:col-span-2">
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Log New Guidance Note</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Mentorship Note">Mentorship Note</option>
                    <option value="Academic Guidance">Academic Guidance</option>
                    <option value="Attendance Intervention">Attendance Intervention</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Observation / Guidance Details</label>
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter observation notes..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="primary" size="sm" onClick={handleAddNote} disabled={submitting || !newNoteText.trim()}>
                  {submitting ? 'Saving...' : 'Add Note'}
                </Button>
              </div>
            </div>

            {/* Notes List */}
            {notes.length > 0 ? (
              <div className="space-y-3 pt-2">
                {notes.map((n) => (
                  <div key={n.id} className="p-3.5 bg-white border border-slate-100 rounded-xl space-y-1 text-xs shadow-xs">
                    <div className="flex justify-between items-center">
                      <Badge variant="indigo">{n.category}</Badge>
                      <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1">{n.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">No guidance notes logged for this student yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
