import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  User,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Plus,
  X,
  BookOpen,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { StudentRecord, AcademicRecord } from '../types';
import { fetchAcademicRecords, addAcademicRecord } from '../services/api';

interface ProgressViewProps {
  students: StudentRecord[];
  onNavigateToPredict?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  students,
  onNavigateToPredict
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'STD-88429'
  );

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) ||
    students[0] || {
      id: 'STD-88429',
      name: 'Marcus Vance',
      education_level: 'Undergraduate (B.Tech)',
      stream_or_branch: 'Computer Science & Engineering',
      course: 'CS-204 Data Structures & Algorithms',
      attendance: 58.4,
      study_hours: 6.2,
      previous_marks: 48.0,
      assignment_score: 52.0,
      practical_score: 55.0,
      predicted_risk: 'critical' as const,
      is_demo: true,
      created_at: new Date().toISOString()
    };

  // Real academic records from SQLite
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // New Record Form State
  const [newSubject, setNewSubject] = useState(selectedStudent.course || 'Core Subject Module');
  const [newMarks, setNewMarks] = useState<number>(65);
  const [newAttendance, setNewAttendance] = useState<number>(Math.round(selectedStudent.attendance) || 75);
  const [newAssignment, setNewAssignment] = useState<number>(65);
  const [newAssessmentType, setNewAssessmentType] = useState('Midterm Examination');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newNotes, setNewNotes] = useState('');

  const loadRecords = useCallback(async (stdId: string) => {
    setIsLoadingRecords(true);
    try {
      const data = await fetchAcademicRecords(stdId);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load academic records:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    loadRecords(selectedStudentId);
  }, [selectedStudentId, loadRecords]);

  // Keep default subject synchronized
  useEffect(() => {
    if (selectedStudent.course) {
      setNewSubject(selectedStudent.course);
    }
  }, [selectedStudent]);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      setSaveError('Subject or module name is required.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await addAcademicRecord({
        student_id: selectedStudentId,
        subject: newSubject.trim(),
        marks: Number(newMarks),
        attendance: Number(newAttendance),
        assignment_score: Number(newAssignment),
        assessment_type: newAssessmentType,
        recorded_date: newDate,
        notes: newNotes.trim()
      });
      setIsModalOpen(false);
      setNewNotes('');
      // Reload records to refresh all charts
      await loadRecords(selectedStudentId);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save academic record.');
    } finally {
      setIsSaving(false);
    }
  };

  // Performance trends from actual records
  const hasHistory = records.length > 0;
  const latestRecord = records[records.length - 1];
  const earliestRecord = records[0];

  const currentMarks = latestRecord ? latestRecord.marks : selectedStudent.previous_marks;
  const currentAttendance = latestRecord ? latestRecord.attendance : selectedStudent.attendance;
  const currentAssignment = latestRecord ? latestRecord.assignment_score : selectedStudent.assignment_score;

  const baselineMarks = earliestRecord ? earliestRecord.marks : selectedStudent.previous_marks;
  const marksDelta = Number((currentMarks - baselineMarks).toFixed(1));

  // Subject-wise grouping
  const subjectGroups = records.reduce((acc, r) => {
    if (!acc[r.subject]) acc[r.subject] = [];
    acc[r.subject].push(r);
    return acc;
  }, {} as Record<string, AcademicRecord[]>);

  return (
    <div className="space-y-6">
      {/* Top Banner & Student Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Longitudinal Tracking
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Persistent Records</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Academic Progress & Trajectory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Track performance trends, attendance patterns, and historical assessment marks recorded over time.
          </p>
        </div>

        {/* Action Controls & Student Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-full sm:w-60">
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none pr-10"
              >
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name} ({std.id})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Assessment</span>
          </button>
        </div>
      </div>

      {/* Selected Student Snapshot Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {selectedStudent.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedStudent.name}</h3>
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                  {selectedStudent.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedStudent.education_level || 'Higher Education'} • {selectedStudent.course}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                selectedStudent.predicted_risk === 'critical'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  : selectedStudent.predicted_risk === 'borderline'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              Risk Status:{' '}
              {selectedStudent.predicted_risk === 'critical'
                ? 'High Risk Alert'
                : selectedStudent.predicted_risk === 'borderline'
                ? 'Borderline / Moderate'
                : 'On Track'}
            </span>
          </div>
        </div>

        {/* 4 Key Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Latest Recorded Marks
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {currentMarks}%
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
              {marksDelta >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +{marksDelta}% trajectory
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center">
                  <ArrowDownRight className="w-3 h-3" /> {marksDelta}% trajectory
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recorded Attendance
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {currentAttendance}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {currentAttendance >= 75 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Eligible for finals</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-medium">Below 75% threshold</span>
              )}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Continuous Work
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {currentAssignment}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Assignments & Practical
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Historical Entries
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {records.length} assessments
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {records.length >= 3 ? 'Sufficient history' : 'More points needed'}
            </p>
          </div>
        </div>
      </div>

      {/* Actual Progress Records List & Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recorded Assessments & Longitudinal Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological log of verified academic submissions stored in the SQLite database.
            </p>
          </div>
          <button
            onClick={() => loadRecords(selectedStudentId)}
            className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecords ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoadingRecords ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading academic records...</div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 p-6 space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No academic records logged yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Use the <strong>Record Assessment</strong> button above to log periodic test scores, attendance readings, and lab evaluations over time.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Assessment</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progression Chart Bars */}
            <div className="space-y-3">
              {records.map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {rec.subject}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                        {rec.assessment_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Date: {rec.recorded_date} {rec.notes ? `• ${rec.notes}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Marks</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {rec.marks}%
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Attendance</span>
                      <span
                        className={`text-xs font-semibold ${
                          rec.attendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {rec.attendance}%
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Coursework</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {rec.assignment_score}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subject-Wise Summary */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Subject-Wise Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(subjectGroups).map(([subjectName, items]) => {
                  const avgMarks = Math.round(items.reduce((s, i) => s + i.marks, 0) / items.length);
                  const isStrong = avgMarks >= 65;
                  return (
                    <div
                      key={subjectName}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{subjectName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isStrong
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          Avg {avgMarks}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {items.length} assessments logged • {isStrong ? 'Strong mastery' : 'Needs revision practice'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Record Assessment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Record Academic Assessment
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                {saveError}
              </div>
            )}

            <form onSubmit={handleCreateRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Module Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Data Structures, Calculus, Physics"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assessment Type
                  </label>
                  <select
                    value={newAssessmentType}
                    onChange={(e) => setNewAssessmentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Unit Quiz">Unit Quiz</option>
                    <option value="Midterm Examination">Midterm Examination</option>
                    <option value="Lab Practical Assessment">Lab Practical Assessment</option>
                    <option value="Pre-Board / Pre-Final">Pre-Board / Pre-Final</option>
                    <option value="Semester Final Examination">Semester Final Examination</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Evaluation Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marks (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={newMarks}
                    onChange={(e) => setNewMarks(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attendance (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newAttendance}
                    onChange={(e) => setNewAttendance(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Coursework (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newAssignment}
                    onChange={(e) => setNewAssignment(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instructor Notes or Feedback <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Scored 100% on theory, lost marks on pointers question"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving Record...' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
