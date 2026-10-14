import React, { useState } from 'react';
import {
  Search,
  UserCheck,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  AlertTriangle,
  GraduationCap,
  Filter
} from 'lucide-react';
import { StudentRecord, PredictionInput, EducationLevelId } from '../types';
import { EDUCATION_LEVELS, getEducationLevelConfig } from '../data/educationLevels';
import { createStudent } from '../services/api';

interface StudentsViewProps {
  students: StudentRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectForPrediction: (prefill: Partial<PredictionInput>) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  isLoading,
  onRefresh,
  onSelectForPrediction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'borderline' | 'good'>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'real' | 'demo'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(
    students.length > 0 ? students[0] : null
  );

  // Add Student Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState<EducationLevelId>('btech');
  const [newStream, setNewStream] = useState('');
  const [newCourse, setNewCourse] = useState('Data Structures & Algorithms');
  const [newAttendance, setNewAttendance] = useState(75);
  const [newStudyHours, setNewStudyHours] = useState(10);
  const [newPrevMarks, setNewPrevMarks] = useState(65);
  const [newAssignment, setNewAssignment] = useState(65);
  const [newPractical, setNewPractical] = useState(70);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const activeModalLevelConfig = getEducationLevelConfig(newLevel);

  // Filter students
  const filteredStudents = students.filter((std) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      std.name.toLowerCase().includes(q) ||
      std.id.toLowerCase().includes(q) ||
      std.course.toLowerCase().includes(q) ||
      (std.stream_or_branch && std.stream_or_branch.toLowerCase().includes(q));

    let matchesRisk = true;
    if (riskFilter !== 'all') {
      matchesRisk = std.predicted_risk === riskFilter;
    }

    let matchesLevel = true;
    if (levelFilter !== 'all') {
      matchesLevel = std.education_level === levelFilter;
    }

    let matchesSource = true;
    if (sourceFilter === 'real') {
      matchesSource = !std.is_demo;
    } else if (sourceFilter === 'demo') {
      matchesSource = std.is_demo;
    }

    return matchesSearch && matchesRisk && matchesLevel && matchesSource;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) {
      setModalError('Student ID and Student Name are required.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      await createStudent({
        id: newId.trim(),
        name: newName.trim(),
        education_level: newLevel,
        stream_or_branch: newStream || (activeModalLevelConfig.streamOrBranchOptions ? activeModalLevelConfig.streamOrBranchOptions[0] : ''),
        course: newCourse,
        attendance: Number(newAttendance),
        study_hours: Number(newStudyHours),
        previous_marks: Number(newPrevMarks),
        assignment_score: Number(newAssignment),
        practical_score: activeModalLevelConfig.practicalLabel ? Number(newPractical) : undefined
      });

      setIsModalOpen(false);
      setNewId('');
      setNewName('');
      onRefresh();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save student record to SQLite.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadPredictor = (student: StudentRecord) => {
    onSelectForPrediction({
      student_id: student.id,
      student_name: student.name,
      education_level: (student.education_level as EducationLevelId) || 'btech',
      stream_or_branch: student.stream_or_branch,
      course: student.course,
      attendance: student.attendance,
      study_hours: student.study_hours,
      previous_marks: student.previous_marks,
      assignment_score: student.assignment_score,
      practical_score: student.practical_score
    });
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Enrolled Students Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and inspect comprehensive academic profile records across all education levels in persistent SQLite storage.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs px-3.5 py-2 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Add Student</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ID, course, or stream..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Education Levels</option>
            {EDUCATION_LEVELS.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.label}
              </option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Risk Tiers</option>
            <option value="critical">Critical At-Risk Only</option>
            <option value="borderline">Borderline Only</option>
            <option value="good">Good Standing</option>
          </select>

          {/* Source Filter: Real vs Demo */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Record Types</option>
            <option value="real">Verified User Records</option>
            <option value="demo">Demo Records</option>
          </select>

          <button
            onClick={onRefresh}
            title="Refresh database records"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            aria-label="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Student Table + Selected Student Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Table Column */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 min-w-[580px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Education Level</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Study Time</th>
                  <th className="p-3">Predicted Risk</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Loading students from persistent SQLite storage...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No student records match your query.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => {
                    const isSelected = selectedStudent?.id === std.id;
                    const badgeClass =
                      std.predicted_risk === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold'
                        : std.predicted_risk === 'borderline'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-bold'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold';

                    const riskLabel =
                      std.predicted_risk === 'critical'
                        ? 'Critical At-Risk'
                        : std.predicted_risk === 'borderline'
                        ? 'Borderline'
                        : 'Good Standing';

                    const levelCfg = getEducationLevelConfig(std.education_level as any);

                    return (
                      <tr
                        key={std.id}
                        onClick={() => setSelectedStudent(std)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition ${
                          isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{std.name}</span>
                            {std.is_demo ? (
                              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                                Demo
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{std.id}</div>
                        </td>
                        <td className="p-3">
                          <span className="text-slate-800 dark:text-slate-200 font-medium block truncate max-w-[150px]">
                            {levelCfg.label.split('(')[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate max-w-[150px]">
                            {std.stream_or_branch || std.course}
                          </span>
                        </td>
                        <td
                          className={`p-3 font-semibold ${
                            std.attendance < 75 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {std.attendance}%
                        </td>
                        <td className="p-3">{std.study_hours} hrs/wk</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${badgeClass}`}>
                            {riskLabel}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(std);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold text-xs transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Student Detail Drawer */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs h-fit">
          {selectedStudent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedStudent.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {selectedStudent.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {selectedStudent.id} • {selectedStudent.course}
                  </p>
                </div>
                <span
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    selectedStudent.predicted_risk === 'critical'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                      : selectedStudent.predicted_risk === 'borderline'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {selectedStudent.predicted_risk === 'critical'
                    ? 'Critical'
                    : selectedStudent.predicted_risk === 'borderline'
                    ? 'Borderline'
                    : 'Good'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Education Level:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {getEducationLevelConfig(selectedStudent.education_level as any).label}
                  </span>
                </div>
                {selectedStudent.stream_or_branch && (
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400">Stream / Branch:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {selectedStudent.stream_or_branch}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Attendance:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.attendance}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Weekly Study Hours:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.study_hours} hrs/week</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Prior Exam Marks:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedStudent.previous_marks} / 100
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Coursework / Homework:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedStudent.assignment_score} / 100
                  </span>
                </div>
                {selectedStudent.practical_score ? (
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400">Lab / Practical Score:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedStudent.practical_score} / 100
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Record Origin:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedStudent.is_demo ? 'Seeded Benchmark Sample' : 'User Saved Profile'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleLoadPredictor(selectedStudent)}
                  className="btn-primary w-full py-2.5 px-3 text-xs gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">Load Into Predictor</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-2">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Student Selected</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Click any row on the left table to inspect individual telemetry across educational levels.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 my-8 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Enrolled Student Record</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STD-10928"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sen"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Education Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newLevel}
                  onChange={(e) => {
                    const lvl = e.target.value as EducationLevelId;
                    setNewLevel(lvl);
                    const cfg = getEducationLevelConfig(lvl);
                    setNewStream(cfg.streamOrBranchOptions ? cfg.streamOrBranchOptions[0] : '');
                    setNewCourse(cfg.suggestedCourses[0] || 'Core Subject Module');
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>

              {activeModalLevelConfig.streamOrBranchOptions && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {activeModalLevelConfig.streamOrBranchLabel || 'Stream / Branch'}
                  </label>
                  <select
                    value={newStream}
                    onChange={(e) => setNewStream(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {activeModalLevelConfig.streamOrBranchOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Course Module
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures, Physics, Mathematics"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attendance (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newAttendance}
                    onChange={(e) => setNewAttendance(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Study Hours (wk)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={newStudyHours}
                    onChange={(e) => setNewStudyHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prior Exam (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newPrevMarks}
                    onChange={(e) => setNewPrevMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assignment / Homework (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newAssignment}
                    onChange={(e) => setNewAssignment(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs px-3.5 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  <span className="text-white">{isSubmitting ? 'Saving...' : 'Save to SQLite'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
