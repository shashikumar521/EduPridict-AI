import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

export const ExamReadinessView: React.FC = () => {
  // Input parameters
  const [syllabusCoverage, setSyllabusCoverage] = useState(78);
  const [mockScore, setMockScore] = useState(68);
  const [pastPapersSolved, setPastPapersSolved] = useState(3);
  const [revisionCycles, setRevisionCycles] = useState(2);
  const [confidenceLevel, setConfidenceLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // Days until exam
  const daysUntilExam = 19;

  // Calculate dynamic readiness index (0 - 100)
  const confidenceMultiplier = confidenceLevel === 'high' ? 1.05 : confidenceLevel === 'medium' ? 1.0 : 0.92;
  const paperBonus = Math.min(10, pastPapersSolved * 2);
  const revisionBonus = Math.min(10, revisionCycles * 3);

  const rawScore =
    syllabusCoverage * 0.45 + mockScore * 0.35 + paperBonus + revisionBonus;
  const readinessIndex = Math.min(100, Math.max(0, Math.round(rawScore * confidenceMultiplier)));

  // Determine readiness status
  const getReadinessStatus = (score: number) => {
    if (score >= 82) {
      return {
        label: 'Ready for Distinction',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-500',
        badge: 'High Distinction Potential'
      };
    } else if (score >= 68) {
      return {
        label: 'On Track / Good Standing',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        barColor: 'bg-indigo-600',
        badge: 'Solid Pass & Honors'
      };
    } else if (score >= 52) {
      return {
        label: 'Moderate / Needs Revision Boost',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        badge: 'Borderline Passing Margin'
      };
    } else {
      return {
        label: 'Critical Exam Risk',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        barColor: 'bg-rose-500',
        badge: 'High Failure Vulnerability'
      };
    }
  };

  const status = getReadinessStatus(readinessIndex);

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
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Exam Benchmark Engine
            </span>
            <span className="text-xs text-slate-400">Readiness Diagnostics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Examination Readiness Index
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Evaluate your syllabus mastery, mock exam performance, and revision depth to simulate your readiness for upcoming term and final exams.
          </p>
        </div>

        {/* Countdown Badge */}
        <div className="shrink-0 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-xs text-slate-500 block font-medium">Upcoming Finals</span>
            <span className="text-base font-extrabold text-slate-900">
              {daysUntilExam} Days Remaining
            </span>
          </div>
        </div>
      </div>

      {/* Main Readiness Gauge & Interactive Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Index Score Card */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Overall Readiness Index</h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                {status.label}
              </span>
            </div>

            {/* Gauge Display */}
            <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {readinessIndex}%
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-2">
                Simulated Preparedness Score
              </p>

              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${status.barColor}`}
                  style={{ width: `${readinessIndex}%` }}
                />
              </div>

              <span className="text-[11px] font-bold text-slate-500 mt-3">
                Tier: {status.badge}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p>
              • <strong>Syllabus Coverage:</strong> Contributes 45% of weightage
            </p>
            <p>
              • <strong>Mock Assessment:</strong> Contributes 35% of weightage
            </p>
            <p>
              • <strong>Past Papers & Revision:</strong> Contributes 20% bonus points
            </p>
          </div>
        </div>

        {/* Interactive Readiness Tuner */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Preparation Parameters
            </h3>
            <p className="text-xs text-slate-500">
              Adjust your current preparation variables to see your readiness projection.
            </p>
          </div>

          {/* Slider 1: Syllabus Coverage */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Syllabus Coverage (%)</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {syllabusCoverage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={syllabusCoverage}
              onChange={(e) => setSyllabusCoverage(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Slider 2: Mock Exam Score */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Recent Mock Exam Score (%)</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {mockScore}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={mockScore}
              onChange={(e) => setMockScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Past Papers Solved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Past Papers (PYQs) Solved
              </label>
              <select
                value={pastPapersSolved}
                onChange={(e) => setPastPapersSolved(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>0 Papers</option>
                <option value={1}>1 Past Paper</option>
                <option value={2}>2 Past Papers</option>
                <option value={3}>3 Past Papers</option>
                <option value={4}>4 Past Papers</option>
                <option value={5}>5+ Past Papers (Optimal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Revision Cycles Completed
              </label>
              <select
                value={revisionCycles}
                onChange={(e) => setRevisionCycles(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>0 (First Time Reading)</option>
                <option value={1}>1 Complete Cycle</option>
                <option value={2}>2 Cycles (Recommended)</option>
                <option value={3}>3+ Cycles (Mastery)</option>
              </select>
            </div>
          </div>

          {/* Confidence Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject Confidence Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConfidenceLevel(lvl)}
                  className={`py-2 rounded-lg text-xs font-bold capitalize transition border cursor-pointer ${
                    confidenceLevel === lvl
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl} Confidence
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Exam Final Checklist */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              High-Yield Pre-Exam Action Checklist
            </h3>
            <p className="text-xs text-slate-500">
              Crucial milestones to complete before examination week.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {checklist.filter((c) => c.completed).length} / {checklist.length} Complete
          </span>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                item.completed
                  ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                  item.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {item.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-xs font-medium ${item.completed ? 'line-through opacity-80' : ''}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
