import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Flame,
  CheckSquare,
  ShieldCheck,
  TrendingUp,
  FileText,
  BookmarkPlus,
  RefreshCw,
  Info
} from 'lucide-react';
import { ExamReadinessAssessment } from '../types';
import { fetchExamReadiness, addExamReadiness } from '../services/api';

export const ExamReadinessView: React.FC = () => {
  // Input parameters
  const [examName, setExamName] = useState('Upcoming Semester Examination');
  const [examDate, setExamDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [syllabusCoverage, setSyllabusCoverage] = useState(78);
  const [mockScore, setMockScore] = useState(68);
  const [revisionCycles, setRevisionCycles] = useState(2);
  const [remainingDays, setRemainingDays] = useState(14);

  // Past assessments from persistent database
  const [history, setHistory] = useState<ExamReadinessAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchExamReadiness();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load readiness assessments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Rule-based readiness index calculation (0 - 100)
  // Transparently labeled as a rule-based planning estimate as required by specification
  const revisionProgress = Math.min(100, revisionCycles * 35);
  const rawScore =
    (syllabusCoverage * 0.45) + (mockScore * 0.35) + (revisionProgress * 0.20);
  const readinessIndex = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determine readiness status
  const getReadinessStatus = (score: number) => {
    if (score >= 75) {
      return {
        label: 'High Readiness',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        barColor: 'bg-emerald-500',
        badge: 'On Track for Distinction'
      };
    } else if (score >= 55) {
      return {
        label: 'Moderate Readiness',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
        barColor: 'bg-indigo-600',
        badge: 'Borderline Passing Margin'
      };
    } else {
      return {
        label: 'Needs Urgent Preparation',
        color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
        barColor: 'bg-rose-500',
        badge: 'High Vulnerability to Underperformance'
      };
    }
  };

  const status = getReadinessStatus(readinessIndex);

  const handleSaveAssessment = async () => {
    setIsSaving(true);
    try {
      await addExamReadiness({
        student_id: 'STD-88429',
        exam_name: examName,
        exam_date: examDate,
        syllabus_completion: syllabusCoverage,
        practice_score: mockScore,
        revision_progress: revisionProgress
      });
      setSaveSuccess(true);
      await loadHistory();
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save readiness assessment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Checklists
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Download official exam timetable & syllabus blueprint', completed: true },
    { id: 2, text: 'Create one-page summary cheat sheets for formulas and definitions', completed: true },
    { id: 3, text: 'Attempt at least 2 full timed 3-hour past papers without notes', completed: false },
    { id: 4, text: 'Resolve all doubt questions with course tutor or study group', completed: true },
    { id: 5, text: 'Verify hall ticket eligibility, attendance certificate, and ID badge', completed: false }
  ]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Exam Benchmark Engine
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Rule-Based Planning Estimate
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Examination Readiness Index
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Evaluate your syllabus mastery, mock exam performance, and revision depth to simulate your readiness for upcoming term and final exams.
          </p>
        </div>

        {/* Methodological Label */}
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900">
            <Info className="w-3.5 h-3.5" />
            <span>Rule-Based Planning Estimate</span>
          </span>
        </div>
      </div>

      {/* Input Parameters + Readiness Score Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Upcoming Exam Parameters
            </h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {remainingDays} Days Remaining
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Examination Name
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Examination Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Slider 1: Syllabus Coverage */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>Syllabus Covered & Reviewed</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{syllabusCoverage}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={syllabusCoverage}
                onChange={(e) => setSyllabusCoverage(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Practice / Mock Test Score */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>Recent Practice / Mock Exam Score</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{mockScore}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={mockScore}
                onChange={(e) => setMockScore(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 3: Revision Cycles */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>Completed Revision Cycles</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{revisionCycles} full rounds</span>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                value={revisionCycles}
                onChange={(e) => setRevisionCycles(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleSaveAssessment}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved to Audit Log!' : 'Save Readiness Assessment'}</span>
            </button>
            <span className="text-[11px] text-slate-400">Persisted in SQLite database</span>
          </div>
        </div>

        {/* Dynamic Calculated Score Tile */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Calculated Readiness Index
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                {status.label}
              </span>
            </div>

            <div className="text-center py-6">
              <div className="text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {readinessIndex}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {status.badge}
              </p>

              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${status.barColor}`}
                  style={{ width: `${readinessIndex}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-900 dark:text-amber-300">
            <strong>Honest Disclaimer:</strong> This index is a deterministic planning model based on syllabus coverage, mock scores, and revision rounds. It is an organizational study benchmark and not a guarantee of actual test marks.
          </div>
        </div>
      </div>

      {/* Actionable Checklists */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Pre-Examination Readiness Checklist
        </h3>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3 rounded-xl border flex items-center gap-3 text-xs cursor-pointer transition ${
                item.completed
                  ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-800/30 text-slate-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  item.completed
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {item.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
