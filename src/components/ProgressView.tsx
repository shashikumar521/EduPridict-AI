import React, { useState } from 'react';
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
  Target
} from 'lucide-react';
import { StudentRecord } from '../types';

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

  // Mock term progression data for selected student
  const termsHistory = [
    { term: 'Term 1 (Prior)', marks: Math.max(35, Math.round(selectedStudent.previous_marks * 0.92)), attendance: Math.max(50, Math.round(selectedStudent.attendance * 0.95)) },
    { term: 'Term 2 (Mid-Year)', marks: selectedStudent.previous_marks, attendance: selectedStudent.attendance },
    { term: 'Current Assessment', marks: selectedStudent.assignment_score, attendance: selectedStudent.attendance },
    { term: 'Projected Final', marks: Math.min(100, Math.round((selectedStudent.previous_marks * 0.45) + (selectedStudent.assignment_score * 0.35) + (selectedStudent.study_hours * 1.5))), attendance: selectedStudent.attendance }
  ];

  const marksChange = termsHistory[2].marks - termsHistory[0].marks;
  const isImproving = marksChange >= 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Student Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Longitudinal Tracking
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Academic Analytics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Academic Progress & Trajectory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Evaluate performance trends, attendance patterns, and historical assessment trajectory across academic terms.
          </p>
        </div>

        {/* Student Selector */}
        <div className="shrink-0 w-full sm:w-72">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Active Student Record
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none cursor-pointer pr-10"
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
              Status:{' '}
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
              Term Marks
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedStudent.previous_marks}%
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
              {isImproving ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +{marksChange}% vs baseline
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center">
                  <ArrowDownRight className="w-3 h-3" /> {marksChange}% vs baseline
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Attendance
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedStudent.attendance}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {selectedStudent.attendance >= 75 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Eligible for finals</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-medium">Short of 75% required</span>
              )}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Study Volume
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedStudent.study_hours} hrs/wk
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Target: 14 hrs/week
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Continuous Assessment
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedStudent.assignment_score}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Assignments & Tasks
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory Timeline & Benchmark Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Longitudinal Trajectory Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Academic Progression Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Examination scores and projected outcome across evaluation periods
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
              Semester Trend
            </span>
          </div>

          {/* Graphical Bar & Target Progression */}
          <div className="mt-6 space-y-4">
            {termsHistory.map((item, idx) => {
              const isProjected = idx === termsHistory.length - 1;
              return (
                <div key={item.term} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {item.term}
                      {isProjected && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-normal">
                          Predicted
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.marks}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.marks >= 75
                          ? 'bg-emerald-500'
                          : item.marks >= 60
                          ? 'bg-indigo-600'
                          : item.marks >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, item.marks)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benchmark Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Class Average</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">68.4%</span>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Passing Benchmark</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">50.0%</span>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Top Quartile (Q3)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">82.5%</span>
            </div>
          </div>
        </div>

        {/* Milestone Milestones & Recommendations */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Key Academic Milestones</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Status towards end-of-semester requirements
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Core Diagnostic Test</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Completed in Week 2</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Midterm Examination</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Score: {selectedStudent.previous_marks}%</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Assignment Series 2</p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400">Due in 5 days (Critical weightage)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">End-Term Final Exam</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Scheduled in 28 days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onNavigateToPredict}
              className="w-full py-2.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Run New What-If Prediction</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
