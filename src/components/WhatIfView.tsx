import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Target,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Info
} from 'lucide-react';
import { StudentRecord, PredictionResult } from '../types';
import { runWhatIfAnalysis } from '../services/api';

interface WhatIfViewProps {
  students: StudentRecord[];
  onNavigateToGoals?: () => void;
}

export const WhatIfView: React.FC<WhatIfViewProps> = ({
  students,
  onNavigateToGoals
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'STD-88429'
  );

  const activeStudent =
    students.find((s) => s.id === selectedStudentId) ||
    students[0] || {
      id: 'STD-88429',
      name: 'Marcus Vance',
      education_level: 'btech',
      course: 'CS-204 Data Structures & Algorithms',
      attendance: 58.4,
      study_hours: 6.2,
      previous_marks: 48.0,
      assignment_score: 52.0,
      predicted_risk: 'critical' as const,
      is_demo: true,
      created_at: new Date().toISOString()
    };

  // Baseline values
  const baseMarks = activeStudent.previous_marks;
  const baseAttendance = activeStudent.attendance;
  const baseStudyHours = activeStudent.study_hours;
  const baseAssignment = activeStudent.assignment_score;

  // Simulated slider states
  const [simMarks, setSimMarks] = useState<number>(baseMarks);
  const [simAttendance, setSimAttendance] = useState<number>(Math.min(100, Math.round(baseAttendance + 15)));
  const [simStudyHours, setSimStudyHours] = useState<number>(Math.round(baseStudyHours + 5));
  const [simAssignment, setSimAssignment] = useState<number>(Math.min(100, Math.round(baseAssignment + 15)));

  // ML Analysis Result State
  const [mlResult, setMlResult] = useState<{
    baseline: PredictionResult | null;
    hypothetical: PredictionResult | null;
    deltaScore: number;
    categoryChanged: boolean;
    disclaimer: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Sync simulation values when selected student changes
  useEffect(() => {
    setSimMarks(activeStudent.previous_marks);
    setSimAttendance(Math.min(100, Math.round(activeStudent.attendance + 15)));
    setSimStudyHours(Math.round(activeStudent.study_hours + 5));
    setSimAssignment(Math.min(100, Math.round(activeStudent.assignment_score + 15)));
  }, [activeStudent]);

  // Execute actual ML What-If inference
  useEffect(() => {
    let isCurrent = true;
    const calculateSimulation = async () => {
      setIsCalculating(true);
      try {
        const baselinePayload = {
          student_id: activeStudent.id,
          student_name: activeStudent.name,
          education_level: activeStudent.education_level || 'btech',
          course: activeStudent.course,
          attendance: baseAttendance,
          study_hours: baseStudyHours,
          previous_marks: baseMarks,
          assignment_score: baseAssignment,
          model_type: 'rf'
        };

        const hypotheticalPayload = {
          student_id: activeStudent.id,
          student_name: activeStudent.name,
          education_level: activeStudent.education_level || 'btech',
          course: activeStudent.course,
          attendance: simAttendance,
          study_hours: simStudyHours,
          previous_marks: simMarks,
          assignment_score: simAssignment,
          model_type: 'rf'
        };

        const result = await runWhatIfAnalysis(baselinePayload, hypotheticalPayload);
        if (isCurrent) {
          setMlResult(result);
        }
      } catch (err) {
        console.warn('What-If ML simulation fallback active:', err);
      } finally {
        if (isCurrent) setIsCalculating(false);
      }
    };

    const timer = setTimeout(calculateSimulation, 250);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [
    activeStudent,
    baseAttendance,
    baseStudyHours,
    baseMarks,
    baseAssignment,
    simAttendance,
    simStudyHours,
    simMarks,
    simAssignment
  ]);

  const handleReset = () => {
    setSimMarks(baseMarks);
    setSimAttendance(baseAttendance);
    setSimStudyHours(baseStudyHours);
    setSimAssignment(baseAssignment);
  };

  const baselineScore = mlResult?.baseline?.projected_score ?? Math.round(
    (baseAttendance * 0.342) + (baseAssignment * 0.286) + (Math.min(100, baseStudyHours * 4.0) * 0.214) + (baseMarks * 0.158)
  );

  const simulatedScore = mlResult?.hypothetical?.projected_score ?? Math.round(
    (simAttendance * 0.342) + (simAssignment * 0.286) + (Math.min(100, simStudyHours * 4.0) * 0.214) + (simMarks * 0.158)
  );

  const scoreDelta = mlResult ? mlResult.deltaScore : Number((simulatedScore - baselineScore).toFixed(1));
  const categoryChanged = mlResult ? mlResult.categoryChanged : (simulatedScore >= 75 && baselineScore < 75);

  const getTierDetails = (score: number, category?: string) => {
    if (category) {
      if (category.includes('High')) return { label: category, color: 'emerald', badge: 'On Track' };
      if (category.includes('Moderate')) return { label: category, color: 'indigo', badge: 'Monitoring' };
      return { label: category, color: 'rose', badge: 'Immediate Triage' };
    }
    if (score >= 75) return { label: 'High Performance', color: 'emerald', badge: 'On Track' };
    if (score >= 60) return { label: 'Moderate Performance', color: 'indigo', badge: 'Monitoring' };
    return { label: 'At-Risk', color: 'rose', badge: 'Immediate Triage' };
  };

  const baseTier = getTierDetails(baselineScore, mlResult?.baseline?.predicted_category);
  const simTier = getTierDetails(simulatedScore, mlResult?.hypothetical?.predicted_category);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Interactive Simulation
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Supervised Model Sensitivity</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            What-If Scenario Analysis
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Simulate hypothetical adjustments to attendance, self-study volume, or coursework marks to evaluate statistical sensitivity from the trained machine learning model.
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
      </div>

      {/* Outcome Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold uppercase tracking-wider">Current Recorded Baseline</span>
            <span className="font-mono">{activeStudent.id}</span>
          </div>

          <div className="my-4 flex items-baseline justify-between">
            <div>
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {baselineScore}%
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Projected Outcome</p>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                baseTier.color === 'emerald'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : baseTier.color === 'indigo'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}
            >
              {baseTier.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>Attendance: <strong className="text-slate-800 dark:text-slate-200">{baseAttendance}%</strong></div>
            <div>Study Volume: <strong className="text-slate-800 dark:text-slate-200">{baseStudyHours} hrs/wk</strong></div>
            <div>Previous Marks: <strong className="text-slate-800 dark:text-slate-200">{baseMarks}%</strong></div>
            <div>Coursework: <strong className="text-slate-800 dark:text-slate-200">{baseAssignment}%</strong></div>
          </div>
        </div>

        {/* Simulated Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs relative">
          {isCalculating && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Inferring...</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
            <span className="font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Simulated Future Trajectory
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`} Delta
            </span>
          </div>

          <div className="my-4 flex items-baseline justify-between">
            <div>
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {simulatedScore}%
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Projected Outcome</p>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  simTier.color === 'emerald'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : simTier.color === 'indigo'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                }`}
              >
                {simTier.label}
              </span>
              {categoryChanged && (
                <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ✓ Category Promoted!
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
            <div>Attendance: <strong className="text-indigo-700 dark:text-indigo-300">{simAttendance}%</strong></div>
            <div>Study Volume: <strong className="text-indigo-700 dark:text-indigo-300">{simStudyHours} hrs/wk</strong></div>
            <div>Previous Marks: <strong className="text-indigo-700 dark:text-indigo-300">{simMarks}%</strong></div>
            <div>Coursework: <strong className="text-indigo-700 dark:text-indigo-300">{simAssignment}%</strong></div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sliders */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Adjust Hypothetical Academic Levers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Drag sliders to simulate realistic changes in attendance, study habits, or coursework completion.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Attendance */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Classroom Attendance Rate
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 font-mono">
                {simAttendance}% ({simAttendance >= baseAttendance ? `+${simAttendance - baseAttendance}%` : `${simAttendance - baseAttendance}%`})
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={simAttendance}
              onChange={(e) => setSimAttendance(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseAttendance}%</span>
              <span>Statistically #1 Impact Feature (34.2%)</span>
            </div>
          </div>

          {/* Slider 2: Study Hours */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Weekly Independent Study Hours
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 font-mono">
                {simStudyHours} hrs/wk ({simStudyHours >= baseStudyHours ? `+${(simStudyHours - baseStudyHours).toFixed(1)}h` : `${(simStudyHours - baseStudyHours).toFixed(1)}h`})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={simStudyHours}
              onChange={(e) => setSimStudyHours(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseStudyHours} hrs</span>
              <span>Target Benchmark: 14 hrs/wk</span>
            </div>
          </div>

          {/* Slider 3: Coursework & Assignment Marks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Continuous Coursework / Assignment Score
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 font-mono">
                {simAssignment}% ({simAssignment >= baseAssignment ? `+${simAssignment - baseAssignment}%` : `${simAssignment - baseAssignment}%`})
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={simAssignment}
              onChange={(e) => setSimAssignment(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseAssignment}%</span>
              <span>Second Highest Importance (28.6%)</span>
            </div>
          </div>

          {/* Slider 4: Previous Examination Marks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Examination Prerequisite Marks
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 font-mono">
                {simMarks}% ({simMarks >= baseMarks ? `+${simMarks - baseMarks}%` : `${simMarks - baseMarks}%`})
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={simMarks}
              onChange={(e) => setSimMarks(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseMarks}%</span>
              <span>Prerequisite Baseline (15.8%)</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Methodological Disclaimer:</strong> This what-if simulation demonstrates statistical sensitivity from the trained machine learning model. It is an educational planning estimate, not a guaranteed grade outcome. Your real student records remain unmodified.
          </p>
        </div>

        {/* Convert to Real Action Goal */}
        {onNavigateToGoals && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Turn this simulated scenario into an actionable target:
            </span>
            <button
              onClick={onNavigateToGoals}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Create Target in Goals & Reminders</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
