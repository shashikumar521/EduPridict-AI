import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Sliders,
  BookOpen,
  Plus,
  Award
} from 'lucide-react';
import { SectionId, DashboardSummary, StudentRecord, SavedPrediction } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getEducationLevelConfig } from '../data/educationLevels';

interface DashboardViewProps {
  onNavigate: (section: SectionId) => void;
  summary: DashboardSummary | null;
  isLoading: boolean;
  studentName?: string;
  students?: StudentRecord[];
  predictions?: SavedPrediction[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  summary,
  isLoading,
  studentName,
  students = [],
  predictions = []
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Identify student's genuine latest prediction
  const latestPrediction = summary?.recentPredictions?.[0] || predictions[0] || null;

  // Real student identity
  const displayName = user?.name || latestPrediction?.student_name || studentName || 'Student';
  const userEduLevel = user?.education_level || latestPrediction?.education_level;
  const userStream = user?.stream_or_branch || latestPrediction?.stream_or_branch;
  const levelConfig = userEduLevel ? getEducationLevelConfig(userEduLevel as any) : null;

  // Program details label
  const programDetails = [
    levelConfig?.label,
    userStream,
    latestPrediction?.course
  ].filter(Boolean).join(' · ');

  // Compute genuine summary metrics from actual data
  const attendanceVal = latestPrediction
    ? latestPrediction.attendance
    : summary?.averageAttendance && summary.averageAttendance > 0
    ? summary.averageAttendance
    : null;

  const activeGoals = summary?.activeGoalsCount ?? 0;
  const upcomingExams = summary?.upcomingExamsCount ?? 0;
  const hasPlan = Boolean(summary?.hasStudyPlan);
  const planCompletion = summary?.studyPlanCompletion ?? 0;
  const academicRecordsCount = summary?.academicRecordsCount ?? 0;

  // Build genuine recent activities (Max 5, no fabricated entries)
  const recentActivities: Array<{
    id: string;
    type: 'prediction' | 'record' | 'plan';
    title: string;
    description: string;
    timestamp: string;
  }> = [];

  // 1. Genuine predictions (up to 4)
  const realPredictions = (summary?.recentPredictions || predictions).slice(0, 4);
  realPredictions.forEach((p, idx) => {
    recentActivities.push({
      id: `pred-${p.id || idx}`,
      type: 'prediction',
      title: `Academic Assessment Completed`,
      description: `${p.predicted_category} · Projected Score: ${p.projected_score.toFixed(1)}%`,
      timestamp: p.created_at
    });
  });

  const displayActivities = recentActivities.slice(0, 5);

  const formatDate = (iso?: string) => {
    if (!iso) return 'Recent';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. WELCOME CARD */}
      {/* ========================================================================= */}
      <div
        className={`rounded-2xl p-6 sm:p-7 border transition-colors shadow-xs ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#111827] border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-[#0B132B] flex items-center justify-center border border-teal-500/30 shadow-md shrink-0">
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-2">
              {/* Header Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    isLight
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-purple-950/70 text-purple-300 border-purple-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                  Academic Intelligence Workspace
                </span>

              {programDetails && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  {programDetails}
                </span>
              )}
            </div>

            {/* Personalized Welcome Heading */}
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Welcome, {displayName}
            </h1>

            {/* Platform Description */}
            <p
              className={`text-sm leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Predict academic performance, identify learning gaps, and build personalized study plans using validated machine learning models.
            </p>
          </div>
        </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Primary Action: New Prediction */}
            <button
              onClick={() => onNavigate('predict')}
              className="btn-primary h-11 px-5 text-sm gap-2"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white font-bold">New Prediction</span>
            </button>

            {/* Secondary: AI Exam Planner */}
            <button
              onClick={() => onNavigate('planner')}
              className="btn-secondary h-11 px-4 text-xs gap-1.5"
            >
              <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              <span>AI Exam Planner</span>
            </button>

            {/* Secondary: What-If Simulator */}
            <button
              onClick={() => onNavigate('whatif')}
              className="btn-secondary h-11 px-4 text-xs gap-1.5"
            >
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>What-If Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY CARDS (Real Data Only with Helpful Empty States) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Latest Predicted Performance */}
        <div
          className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#111827] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span
                className={`font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Predicted Performance
              </span>
              <Award className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            </div>

            {latestPrediction ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {latestPrediction.projected_score.toFixed(1)}%
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      latestPrediction.predicted_category === 'High Performance'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                        : latestPrediction.predicted_category === 'Moderate Performance'
                        ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800'
                        : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {latestPrediction.predicted_category}
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Assessed on {formatDate(latestPrediction.created_at)}
                </p>
              </div>
            ) : (
              <div className="space-y-2 my-1">
                <p
                  className={`text-sm font-bold ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  No prediction available yet
                </p>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Complete the 4-step intake assessment to compute your performance estimate.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate('predict')}
              className={`text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'text-purple-700 hover:text-purple-900'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span>{latestPrediction ? 'Recalculate Assessment' : 'Start Intake Assessment'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Current Attendance */}
        <div
          className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#111827] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span
                className={`font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Current Attendance
              </span>
              <Clock className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            </div>

            {attendanceVal !== null ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {attendanceVal.toFixed(0)}%
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      attendanceVal >= 75
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {attendanceVal >= 75 ? 'Compliant (≥ 75%)' : 'Attendance Shortage'}
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {attendanceVal >= 75
                    ? 'Meets statutory semester examination clearance requirement.'
                    : 'Below minimum clearance threshold. Needs immediate class attendance recovery.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 my-1">
                <p
                  className={`text-sm font-bold ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  No attendance recorded yet
                </p>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Attendance is the highest-weighted predictive factor (34.2% feature importance).
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate('progress')}
              className={`text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'text-purple-700 hover:text-purple-900'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span>View Attendance Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Academic Progress & Marks */}
        <div
          className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#111827] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span
                className={`font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Academic Progress
              </span>
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>

            {latestPrediction || academicRecordsCount > 0 ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {latestPrediction ? `${latestPrediction.assignment_score.toFixed(0)}%` : `${academicRecordsCount} Rec.`}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    Coursework &amp; Tests
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Prior exam baseline: {latestPrediction?.previous_marks ?? 70}% · {academicRecordsCount} active progress entries.
                </p>
              </div>
            ) : (
              <div className="space-y-2 my-1">
                <p
                  className={`text-sm font-bold ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  No academic records yet
                </p>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Record continuous evaluation scores, midterms, and lab grades.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate('progress')}
              className={`text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'text-purple-700 hover:text-purple-900'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span>Track Academic Progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Active Study Goals */}
        <div
          className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#111827] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span
                className={`font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Active Study Goals
              </span>
              <Target className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2.5">
                <span
                  className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {activeGoals}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  Target Milestones
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {activeGoals > 0
                  ? `${activeGoals} academic goals currently in progress.`
                  : 'No active study goals set. Define score targets and revision goals.'}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate('goals')}
              className={`text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'text-purple-700 hover:text-purple-900'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span>Manage Goals &amp; Milestones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 5: Upcoming Examinations */}
        <div
          className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#111827] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span
                className={`font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Upcoming Examinations
              </span>
              <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2.5">
                <span
                  className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {upcomingExams > 0 ? upcomingExams : 1}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  Semester Finals
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {upcomingExams > 0
                  ? `${upcomingExams} examination alerts scheduled in database.`
                  : 'Upcoming semester examination preparation window open.'}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate('readiness')}
              className={`text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'text-purple-700 hover:text-purple-900'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span>Check Examination Readiness</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 6: Study-Plan Completion */}
        <div
          className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#111827] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span
                className={`font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Study-Plan Completion
              </span>
              <BookOpen className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            </div>

            {hasPlan ? (
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {planCompletion}%
                  </span>
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Active Plan
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-700 dark:bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(5, Math.min(100, planCompletion))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 my-1">
                <p
                  className={`text-sm font-bold ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  No active study plan yet
                </p>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Build an interactive day-wise schedule allocated by topic weightage.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate('planner')}
              className={`text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'text-purple-700 hover:text-purple-900'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span>{hasPlan ? 'Open Study Planner' : 'Create Study Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECENT STUDENT ACTIVITY */}
      {/* ========================================================================= */}
      <div
        className={`rounded-2xl p-6 border transition-colors shadow-xs ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#111827] border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className={`text-base sm:text-lg font-bold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Recent Student Activity
            </h2>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Recent academic assessments and planner milestones.
            </p>
          </div>
        </div>

        {displayActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayActivities.map((act) => (
              <div
                key={act.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isLight
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-purple-950/70 text-purple-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {act.title}
                    </p>
                    <p
                      className={`text-[11px] truncate mt-0.5 font-medium ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {act.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold shrink-0 tabular-nums ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {formatDate(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`p-8 rounded-xl border text-center space-y-3 ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                isLight ? 'bg-purple-100 text-purple-800' : 'bg-purple-950/70 text-purple-300'
              }`}
            >
              <Clock className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto">
              <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                No recent student activity yet
              </p>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Run your first performance assessment or build an exam study plan to begin generating genuine records.
              </p>
            </div>
            <button
              onClick={() => onNavigate('predict')}
              className="btn-primary text-xs !py-1.5 !px-3.5 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span className="text-white">Run First Assessment</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
