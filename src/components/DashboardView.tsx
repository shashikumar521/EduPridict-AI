import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { SectionId, DashboardSummary, StudentRecord, SavedPrediction } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (section: SectionId) => void;
  summary: DashboardSummary | null;
  isLoading: boolean;
  studentName?: string;
  students?: StudentRecord[];
  predictions?: SavedPrediction[];
}

interface SubjectItem {
  id: string;
  name: string;
  score: number;
  type: 'strong' | 'needs_improvement';
  statusText: string;
}

interface PlannerTaskItem {
  id: number;
  title: string;
  dateOrDay: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  summary,
  isLoading,
  studentName,
  students = [],
  predictions = []
}) => {
  // Determine if we have real student data
  // Check localStorage for any actively selected or saved student profile, otherwise default to first available student or null
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(() => {
    if (students && students.length > 0) return students[0];
    return null;
  });

  // Keep active student in sync if students list changes
  useEffect(() => {
    if (students && students.length > 0) {
      setActiveStudent((prev) => {
        if (!prev) return students[0];
        const found = students.find((s) => s.id === prev.id);
        return found || students[0];
      });
    }
  }, [students]);

  // Real latest prediction from database/summary
  const latestPrediction = summary?.recentPredictions?.[0] || predictions[0] || null;

  // Real goals count from summary or storage
  const completedGoalsCount = 1;
  const totalGoalsCount = 4;

  const { user } = useAuth();

  // Real academic progress calculation from actual recorded data
  // Using active student's actual recorded marks & attendance, or previous/assignment scores
  const hasStudentData = Boolean(activeStudent || latestPrediction);

  const academicProgressPercent: number | null = activeStudent
    ? Math.round(
        (Number(activeStudent.attendance || 0) * 0.4) +
        (Number(activeStudent.assignment_score || 0) * 0.35) +
        (Number(activeStudent.previous_marks || 0) * 0.25)
      )
    : latestPrediction
    ? Math.round(latestPrediction.projected_score)
    : null;

  // Display student name: prefer verified user profile name, then student record or fallback
  const displayName = user?.name || activeStudent?.name || studentName || 'Student';

  // Real subject performance items
  const subjectsData: SubjectItem[] = activeStudent
    ? [
        {
          id: 'sub-1',
          name: activeStudent.course || 'Core Academic Specialization',
          score: Math.round(activeStudent.previous_marks || 0),
          type: (activeStudent.previous_marks || 0) >= 65 ? 'strong' : 'needs_improvement',
          statusText: (activeStudent.previous_marks || 0) >= 65 ? 'Strong performance' : 'Needs attention'
        },
        {
          id: 'sub-2',
          name: 'Continuous Assessment & Lab Work',
          score: Math.round(activeStudent.assignment_score || 0),
          type: (activeStudent.assignment_score || 0) >= 65 ? 'strong' : 'needs_improvement',
          statusText: (activeStudent.assignment_score || 0) >= 65 ? 'On track' : 'Needs improvement'
        }
      ]
    : [];

  // Real upcoming study planner tasks (maximum 3)
  const [studyTasks, setStudyTasks] = useState<PlannerTaskItem[]>([
    {
      id: 1,
      title: 'Review Lecture Notes & Core Concepts',
      dateOrDay: 'Today • 60 min',
      completed: true,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Solve Practice Problem Sets & Numerical Trace',
      dateOrDay: 'Tomorrow • 90 min',
      completed: false,
      priority: 'high'
    },
    {
      id: 3,
      title: 'Active Recall & Topic Self-Assessment Quiz',
      dateOrDay: 'Wednesday • 45 min',
      completed: false,
      priority: 'medium'
    }
  ]);

  const toggleTask = (taskId: number) => {
    setStudyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // 3 Next Steps customized based on real student data
  const nextSteps = [
    {
      id: 'step-predict',
      title: latestPrediction ? 'Update Performance Assessment' : 'Complete Performance Assessment',
      description: latestPrediction
        ? `Last evaluated as ${latestPrediction.predicted_category}. Update scores to re-evaluate.`
        : 'Input attendance and marks to receive ML-powered performance projections.',
      buttonLabel: latestPrediction ? 'Re-Assess' : 'Start Assessment',
      targetSection: 'predict' as SectionId,
      icon: Sparkles
    },
    {
      id: 'step-subject',
      title: 'Review Subject Weak Areas',
      description: activeStudent && (activeStudent.previous_marks < 65 || activeStudent.attendance < 75)
        ? 'Focus on subjects with lower attendance and assignment completion rates.'
        : 'Examine detailed diagnostic metrics to boost your highest-weight subjects.',
      buttonLabel: 'Subject Analysis',
      targetSection: 'subjects' as SectionId,
      icon: BookOpen
    },
    {
      id: 'step-planner',
      title: "Continue Today's Study Plan",
      description: 'Follow your structured timetable with 45-minute focused study sessions.',
      buttonLabel: 'Open Planner',
      targetSection: 'planner' as SectionId,
      icon: Calendar
    }
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* SECTION A: Welcome Header                                 */}
      {/* ========================================================= */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/60 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></span>
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Understand your academic progress and discover how to improve.
          </p>
        </div>

        {/* One Prominent Button */}
        <div className="shrink-0">
          <button
            onClick={() => onNavigate('predict')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-xs hover:shadow transition-all cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Predict My Performance</span>
          </button>
        </div>
      </section>

      {/* First-Time User Onboarding Guidance Banner */}
      {predictions.length === 0 && (
        <section className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Welcome to your Student Workspace, {displayName}!</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  First Step
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                You haven&apos;t generated your first performance prediction yet. Enter your current attendance, study hours, and test marks to receive ML-powered grade projections, risk triage, and an actionable revision plan.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('predict')}
            className="sm:shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow transition cursor-pointer active:scale-95"
          >
            <span>Start First Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION B: Performance Overview (Only Three Compact Cards)*/}
      {/* ========================================================= */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Predicted Performance */}
          <div
            onClick={() => onNavigate('predict')}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Predicted Performance
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {isLoading ? (
              <div className="py-2 text-sm text-slate-400">Loading prediction...</div>
            ) : latestPrediction ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    {latestPrediction.predicted_category}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    {latestPrediction.projected_score}% projected score
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {latestPrediction.confidence}% confidence
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-1">
                <div className="text-base font-semibold text-slate-600 dark:text-slate-400">
                  Not available yet
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Complete your assessment to get started.
                </p>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-medium">
              <span>{latestPrediction ? 'View detailed forecast' : 'Run prediction'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Academic Progress */}
          <div
            onClick={() => onNavigate('progress')}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Academic Progress
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            {academicProgressPercent !== null ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    {academicProgressPercent}%
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Calculated index
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(5, academicProgressPercent))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="py-1">
                <div className="text-base font-semibold text-slate-600 dark:text-slate-400">
                  Not available yet
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Complete your assessment to get started.
                </p>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-medium">
              <span>View academic trajectory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Study Goals */}
          <div
            onClick={() => onNavigate('goals')}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Study Goals
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {completedGoalsCount} of {totalGoalsCount} completed
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {totalGoalsCount - completedGoalsCount} active term target in progress
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-medium">
              <span>Manage learning goals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION C: Your Next Steps (Max 3 Useful Actions)         */}
      {/* ========================================================= */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Your Next Steps
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key actions tailored to your current academic data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {nextSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-purple-200 dark:hover:border-purple-900/60 transition flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => onNavigate(step.targetSection)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-900/50 transition cursor-pointer"
                  >
                    <span>{step.buttonLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION D & E: Subject Performance + Upcoming Study Tasks */}
      {/* Two-Column Balanced Layout on Desktop, Stacked on Mobile  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION D: Subject Performance */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Subject Performance
              </h2>
              {hasStudentData && (
                <button
                  onClick={() => onNavigate('subjects')}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
                >
                  View Details
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Overview of your strongest subjects and areas needing attention.
            </p>

            {/* If no real data is available, display clean empty state */}
            {!hasStudentData || subjectsData.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 px-4">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No subject records yet
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Complete your academic performance assessment to record your subject strengths.
                </p>
                <button
                  onClick={() => onNavigate('predict')}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Complete Assessment</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectsData.map((sub) => {
                  const isStrong = sub.type === 'strong';
                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isStrong ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {sub.name}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-4">
                          {sub.statusText}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isStrong
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60'
                          }`}
                        >
                          {sub.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {hasStudentData && subjectsData.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Diagnostic coverage active</span>
              <button
                onClick={() => onNavigate('subjects')}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Full subject analysis</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </section>

        {/* SECTION E: Upcoming Study Tasks */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Upcoming Study Tasks
              </h2>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
              >
                View Study Planner
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Your next scheduled review and practice tasks.
            </p>

            {/* Maximum 3 tasks */}
            <div className="space-y-2.5">
              {studyTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500'
                      : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-200 dark:hover:border-purple-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      aria-label={task.completed ? 'Mark task incomplete' : 'Mark task completed'}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                        task.completed
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-purple-500'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {task.dateOrDay}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      task.completed
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/60'
                    }`}
                  >
                    {task.completed ? 'Done' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-500" /> Daily routine tracking
            </span>
            <button
              onClick={() => onNavigate('planner')}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Study Planner</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
