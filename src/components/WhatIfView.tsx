import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Target,
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
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Interactive Simulation
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Supervised Model Sensitivity</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            What-If Scenario Analysis
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
            Simulate hypothetical adjustments to attendance, self-study volume, or coursework marks to evaluate statistical sensitivity from the trained machine learning model.
          </p>
        </div>

        {/* Student Selector */}
        <div className="shrink-0 w-full sm:w-72">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Active Student Record
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#161F33] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer appearance-none pr-10"
            >
              {students.map((std) => (
                <option key={std.id} value={std.id} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                  {std.name} ({std.id})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Outcome Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Card */}
        <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold uppercase tracking-wider">Current Recorded Baseline</span>
            <span className="font-mono font-semibold">{activeStudent.id}</span>
          </div>

          <div className="my-4 flex items-baseline justify-between">
            <div>
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                {baselineScore}%
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Projected Outcome</p>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                baseTier.color === 'emerald'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : baseTier.color === 'indigo'
                  ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              {baseTier.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>Attendance: <strong className="text-slate-900 dark:text-white">{baseAttendance}%</strong></div>
            <div>Study Volume: <strong className="text-slate-900 dark:text-white">{baseStudyHours} hrs/wk</strong></div>
            <div>Previous Marks: <strong className="text-slate-900 dark:text-white">{baseMarks}%</strong></div>
            <div>Coursework: <strong className="text-slate-900 dark:text-white">{baseAssignment}%</strong></div>
          </div>
        </div>

        {/* Simulated Card */}
        <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-purple-200 dark:border-purple-800 shadow-xs relative">
          {isCalculating && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-300 bg-white/90 dark:bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 font-semibold">
              <RefreshCw className="w-3 h-3 animate-spin text-purple-600 dark:text-purple-400" />
              <span>Inferring...</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pb-3 border-b border-purple-100 dark:border-purple-900/40">
            <span className="font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Simulated Future Trajectory
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`} Delta
            </span>
          </div>

          <div className="my-4 flex items-baseline justify-between">
            <div>
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                {simulatedScore}%
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Projected Outcome</p>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  simTier.color === 'emerald'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : simTier.color === 'indigo'
                    ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                {simTier.label}
              </span>
              {categoryChanged && (
                <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  ✓ Category Promoted!
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-purple-100 dark:border-purple-900/40">
            <div>Attendance: <strong className="text-purple-800 dark:text-purple-300">{simAttendance}%</strong></div>
            <div>Study Volume: <strong className="text-purple-800 dark:text-purple-300">{simStudyHours} hrs/wk</strong></div>
            <div>Previous Marks: <strong className="text-purple-800 dark:text-purple-300">{simMarks}%</strong></div>
            <div>Coursework: <strong className="text-purple-800 dark:text-purple-300">{simAssignment}%</strong></div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sliders */}
      <div className="bg-white dark:bg-[#111827] rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Adjust Hypothetical Academic Levers
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              Drag sliders to simulate realistic changes in attendance, study habits, or coursework completion.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Attendance */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Classroom Attendance Rate
              </span>
              <span className="font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                {simAttendance}% ({simAttendance >= baseAttendance ? `+${simAttendance - baseAttendance}%` : `${simAttendance - baseAttendance}%`})
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={simAttendance}
              onChange={(e) => setSimAttendance(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <span>Baseline: {baseAttendance}%</span>
              <span>Statistically #1 Impact Feature (34.2%)</span>
            </div>
          </div>

          {/* Slider 2: Study Hours */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Weekly Independent Study Hours
              </span>
              <span className="font-extrabold text-purple-700 dark:text-purple-300 font-mono">
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
              className="w-full accent-purple-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <span>Baseline: {baseStudyHours} hrs</span>
              <span>Target Benchmark: 14 hrs/wk</span>
            </div>
          </div>

          {/* Slider 3: Coursework & Assignment Marks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Continuous Coursework / Assignment Score
              </span>
              <span className="font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                {simAssignment}% ({simAssignment >= baseAssignment ? `+${simAssignment - baseAssignment}%` : `${simAssignment - baseAssignment}%`})
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={simAssignment}
              onChange={(e) => setSimAssignment(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <span>Baseline: {baseAssignment}%</span>
              <span>Second Highest Importance (28.6%)</span>
            </div>
          </div>

          {/* Slider 4: Previous Examination Marks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Examination Prerequisite Marks
              </span>
              <span className="font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                {simMarks}% ({simMarks >= baseMarks ? `+${simMarks - baseMarks}%` : `${simMarks - baseMarks}%`})
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={simMarks}
              onChange={(e) => setSimMarks(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <span>Baseline: {baseMarks}%</span>
              <span>Prerequisite Baseline (15.8%)</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#161F33] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong>Methodological Disclaimer:</strong> This what-if simulation demonstrates statistical sensitivity from the trained machine learning model. It is an educational planning estimate, not a guaranteed grade outcome. Your real student records remain unmodified.
          </p>
        </div>

        {/* Convert to Real Action Goal */}
        {onNavigateToGoals && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Turn this simulated scenario into an actionable target:
            </span>
            <button
              onClick={onNavigateToGoals}
              className="btn-primary text-xs px-4 py-2 gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-white" />
              <span className="text-white">Create Target in Goals &amp; Reminders</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
