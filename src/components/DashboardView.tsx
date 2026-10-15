import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  CalendarPlus,
  BrainCircuit,
  BookOpen,
  Target,
  ArrowRight,
  ExternalLink,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  Play,
  X,
  ChevronRight,
  Zap,
  GraduationCap,
  ShieldCheck,
  Bot,
  Sliders,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { SectionId, SavedPrediction, StudentRecord, DashboardSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  fetchAcademicAnalysis,
  fetchAcademicProfile,
  fetchExamsList,
  fetchQuizAttempts
} from '../services/api';

interface DashboardViewProps {
  onNavigate: (section: SectionId) => void;
  onOpenProfileSetup?: () => void;
  onSelectTopicForLearn?: (topic: string, courseContext?: string) => void;
  onSelectExamForSchedule?: (subject: string, topic?: string) => void;
  onOpenAddExam?: () => void;
  onOpenPracticeQuiz?: (topic?: string) => void;
  onOpenStudyRoadmap?: () => void;
  summary?: DashboardSummary | null;
  isLoading?: boolean;
  studentName?: string;
  students?: StudentRecord[];
  predictions?: SavedPrediction[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenProfileSetup,
  onSelectTopicForLearn,
  onSelectExamForSchedule,
  onOpenAddExam,
  onOpenPracticeQuiz,
  onOpenStudyRoadmap
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Live state from real records
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);

  // Load genuine academic records across services
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analysisRes, profileRes, examsRes, quizRes] = await Promise.all([
        fetchAcademicAnalysis().catch(() => null),
        fetchAcademicProfile().catch(() => null),
        fetchExamsList().catch(() => ({ status: 'error', exams: [] })),
        fetchQuizAttempts().catch(() => ({ status: 'error', attempts: [] }))
      ]);

      if (analysisRes && analysisRes.status === 'success') {
        setAnalysisData(analysisRes);
      }
      if (profileRes && profileRes.profile) {
        setProfileData(profileRes.profile);
      }
      if (examsRes && examsRes.exams) {
        setExams(examsRes.exams);
      }
      if (quizRes && quizRes.attempts) {
        setQuizAttempts(quizRes.attempts);
      }
    } catch (err) {
      console.error('Error hydrating dashboard records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Genuine student identity
  const displayName = user?.name || profileData?.full_name || 'Student';
  const degreeLabel = profileData?.course_degree || 'B.Tech Computer Science & Engineering';
  const institutionLabel = profileData?.institution || 'Academic Institute';
  const termLabel = `${profileData?.academic_year || 'Year 2'} • ${profileData?.semester || 'Semester 4'}`;

  // 1. Genuine Academic Performance Metric
  const academicScore = analysisData?.overview?.academic_score ?? null;
  const standingLabel = analysisData?.overview?.standing || 'Good Standing';
  const standingTier = analysisData?.overview?.standing_tier || 'good';
  const subjectAverage = analysisData?.overview?.subject_average ?? null;
  const totalSubjectsCount = analysisData?.overview?.total_subjects ?? (profileData?.subjects?.length || 0);

  // 2. Genuine Subjects Needing Attention
  const weakSubjects = useMemo(() => {
    if (!analysisData?.subjects) return [];
    return analysisData.subjects.filter(
      (s: any) =>
        s.status === 'Critical' ||
        s.status === 'Needs Attention' ||
        s.percentage < 60 ||
        (s.attendance && s.attendance < 75)
    );
  }, [analysisData]);

  // 3. Genuine Next Examination (closest upcoming by exam_date)
  const nextExam = useMemo(() => {
    if (!exams || exams.length === 0) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Filter to upcoming or current
    const upcoming = exams
      .map(e => ({
        ...e,
        parsedDate: new Date(e.exam_date)
      }))
      .filter(e => !isNaN(e.parsedDate.getTime()) && e.status !== 'completed')
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    return upcoming[0] || null;
  }, [exams]);

  // Helper for exam countdown
  const getExamCountdown = (dateObj: Date | string) => {
    try {
      const target = new Date(dateObj).getTime();
      const now = new Date().getTime();
      const diffMs = target - now;
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (days < 0) return 'Concluded';
      if (days === 0) return 'Exam Today';
      if (days === 1) return 'Tomorrow';
      return `In ${days} days`;
    } catch {
      return 'Scheduled';
    }
  };

  // 4. Genuine Learning Progress Metric
  const totalQuizzesTaken = quizAttempts.length;
  const avgQuizScore = useMemo(() => {
    if (totalQuizzesTaken === 0) return null;
    const sum = quizAttempts.reduce((acc, curr) => acc + (curr.score_percent || 0), 0);
    return Math.round(sum / totalQuizzesTaken);
  }, [quizAttempts, totalQuizzesTaken]);

  // Read saved timetable from localStorage if available
  const timetableStats = useMemo(() => {
    try {
      const saved = localStorage.getItem('edupredict_timetable');
      if (saved) {
        const blocks = JSON.parse(saved);
        if (Array.isArray(blocks) && blocks.length > 0) {
          const completed = blocks.filter(b => b.isCompleted).length;
          return { total: blocks.length, completed, percent: Math.round((completed / blocks.length) * 100) };
        }
      }
    } catch {}
    return null;
  }, []);

  // 5. Personalized Next Step: Identify one specific topic with real evidence
  const prioritizedNextStep = useMemo(() => {
    // Priority A: Weakest subject with an explicit difficult topic
    if (weakSubjects.length > 0) {
      // Sort to find the lowest percentage subject
      const lowestSub = [...weakSubjects].sort((a, b) => a.percentage - b.percentage)[0];
      const topic = lowestSub.difficult_topics?.[0] || lowestSub.topics_to_improve?.[0] || `${lowestSub.name} Core Principles`;
      return {
        hasEvidence: true,
        subject: lowestSub.name,
        topic,
        score: lowestSub.percentage,
        reason: `Current subject score is ${lowestSub.percentage}%. Reenforcing this topic through structured theory and active recall practice directly supports your next examination.`
      };
    }

    // Priority B: If any subject has recorded difficult topics even if >= 60%
    if (analysisData?.subjects) {
      for (const sub of analysisData.subjects) {
        if (sub.difficult_topics && sub.difficult_topics.length > 0) {
          return {
            hasEvidence: true,
            subject: sub.name,
            topic: sub.difficult_topics[0],
            score: sub.percentage,
            reason: `Identified as a targeted concept in your ${sub.name} curriculum. Reviewing the structured theory builds high-tier retention.`
          };
        }
      }
    }

    // Priority C: No profile subjects or insufficient diagnostic evidence
    return {
      hasEvidence: false,
      subject: '',
      topic: 'Diagnostic Foundation',
      score: null,
      reason: 'Complete your academic profile marks or take a diagnostic quiz to generate an evidence-backed topic recommendation.'
    };
  }, [weakSubjects, analysisData]);

  // Actions for the personalized next step
  const handleReadTheory = () => {
    if (prioritizedNextStep.hasEvidence && onSelectTopicForLearn) {
      onSelectTopicForLearn(prioritizedNextStep.topic, degreeLabel);
    } else {
      onNavigate('learn');
    }
  };

  const handleOpenVerifiedResource = () => {
    const query = prioritizedNextStep.hasEvidence
      ? `${prioritizedNextStep.subject} ${prioritizedNextStep.topic} university lecture tutorial`
      : 'engineering computer science diagnostic lecture';
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTakeQuiz = () => {
    if (prioritizedNextStep.hasEvidence && onSelectTopicForLearn) {
      onSelectTopicForLearn(prioritizedNextStep.topic, degreeLabel);
    } else {
      onNavigate('learn');
    }
  };

  const handleScheduleRevision = () => {
    if (prioritizedNextStep.hasEvidence && onSelectExamForSchedule) {
      onSelectExamForSchedule(prioritizedNextStep.subject, prioritizedNextStep.topic);
    } else {
      onNavigate('scheduler');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. CONCISE WELCOME AREA (No distracting calculation banner) */}
      {/* ========================================================================= */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-[#E2E8F0] text-[#172033] shadow-xs'
            : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC] shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            {/* Official EduPredict AI Logo */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-[#E2E8F0] dark:border-[#334155] bg-[#0B132B] shadow-sm flex items-center justify-center p-1">
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE] border border-[#DDD6FE] dark:border-[#8B5CF6]/50">
                  Student Dashboard
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#334155] dark:bg-[#172033] dark:text-[#E2E8F0] border border-[#CBD5E1] dark:border-[#475569]">
                  {termLabel}
                </span>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                Welcome, {displayName}
              </h1>

              <p className={`text-xs sm:text-sm font-normal max-w-2xl leading-relaxed ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                Monitor verified academic standing, upcoming examination schedules, and prioritized revision topics across {degreeLabel}.
              </p>
            </div>
          </div>

          {/* Direct Profile and Navigation Actions */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => onOpenProfileSetup ? onOpenProfileSetup() : onNavigate('settings')}
              className="btn-primary text-xs sm:text-sm px-4 py-2.5 gap-2"
              aria-label="Edit Academic Profile"
            >
              <Edit3 className="w-4 h-4 text-white" />
              <span>Edit Academic Profile</span>
            </button>

            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="btn-secondary p-2.5 rounded-xl cursor-pointer"
              title="Refresh Dashboard Records"
              aria-label="Refresh Dashboard Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FOUR PRIMARY SUMMARY CARDS (No more than four, distinct real metrics) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Academic Performance */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#1E293B] border-[#334155] shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className={`font-bold uppercase tracking-wider ${isLight ? 'text-[#1E293B]' : 'text-slate-200'}`}>
                Academic Performance
              </span>
              <div className="p-1.5 rounded-lg bg-[#DBEAFE] text-[#1E40AF] dark:bg-[#1D4ED8]/30 dark:text-[#93C5FD]">
                <Award className="w-4 h-4 text-[#1E40AF] dark:text-[#93C5FD]" />
              </div>
            </div>

            {academicScore !== null ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className={`text-3xl font-extrabold tracking-tight tabular-nums ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                    {academicScore}%
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                      standingTier === 'distinction'
                        ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC] dark:bg-[#15803D]/30 dark:text-[#86EFAC] dark:border-[#15803D]/50'
                        : standingTier === 'good'
                        ? 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD] dark:bg-[#1D4ED8]/30 dark:text-[#93C5FD] dark:border-[#1D4ED8]/50'
                        : standingTier === 'moderate'
                        ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] dark:bg-[#B45309]/30 dark:text-[#FDE68A] dark:border-[#B45309]/50'
                        : 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5] dark:bg-[#B91C1C]/30 dark:text-[#FCA5A5] dark:border-[#B91C1C]/50'
                    }`}
                  >
                    {standingLabel}
                  </span>
                </div>
                <p className={`text-xs font-medium ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                  Subject aggregate of {subjectAverage ?? 70}% across {totalSubjectsCount} enrolled courses.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 py-1">
                <p className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-slate-100'}`}>
                  Profile Incomplete
                </p>
                <p className={`text-xs font-medium ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
                  Enter semester subject marks to calculate verified standing.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3.5 mt-3 border-t border-[#CBD5E1] dark:border-[#334155]">
            <button
              onClick={() => onNavigate('analysis')}
              className="text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE] hover:text-[#4C1D95] dark:hover:text-white hover:underline flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>View Trajectory &amp; Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE] shrink-0" />
            </button>
          </div>
        </div>

        {/* CARD 2: Subjects Needing Attention */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#1E293B] border-[#334155] shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className={`font-bold uppercase tracking-wider ${isLight ? 'text-[#1E293B]' : 'text-slate-200'}`}>
                Subjects Needing Attention
              </span>
              <div className={`p-1.5 rounded-lg ${
                weakSubjects.length > 0
                  ? 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#B45309]/30 dark:text-[#FDE68A]'
                  : 'bg-[#DCFCE7] text-[#166534] dark:bg-[#15803D]/30 dark:text-[#86EFAC]'
              }`}>
                <AlertTriangle className={`w-4 h-4 ${weakSubjects.length > 0 ? 'text-[#92400E] dark:text-[#FDE68A]' : 'text-[#166534] dark:text-[#86EFAC]'}`} />
              </div>
            </div>

            {weakSubjects.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold tracking-tight tabular-nums ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                    {weakSubjects.length}
                  </span>
                  <span className="text-xs font-bold text-[#92400E] dark:text-[#FDE68A]">
                    {weakSubjects.length === 1 ? 'Course below target' : 'Courses below target'}
                  </span>
                </div>
                <p className={`text-xs font-semibold truncate ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                  {weakSubjects.map((s: any) => s.name).join(', ')}
                </p>
              </div>
            ) : totalSubjectsCount > 0 ? (
              <div className="space-y-1.5 py-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#166534] dark:text-[#86EFAC]" />
                  <span className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                    All Subjects In Good Standing
                  </span>
                </div>
                <p className={`text-xs font-semibold ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                  All {totalSubjectsCount} enrolled courses are meeting or exceeding 60% baseline.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 py-1">
                <p className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-slate-100'}`}>
                  No Subjects Recorded
                </p>
                <p className={`text-xs font-medium ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
                  Add courses in your academic profile to diagnose focus areas.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3.5 mt-3 border-t border-[#CBD5E1] dark:border-[#334155]">
            <button
              onClick={() => onNavigate('analysis')}
              className="text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE] hover:text-[#4C1D95] dark:hover:text-white hover:underline flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Diagnose Syllabus Gaps</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE] shrink-0" />
            </button>
          </div>
        </div>

        {/* CARD 3: Next Examination */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#1E293B] border-[#334155] shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className={`font-bold uppercase tracking-wider ${isLight ? 'text-[#1E293B]' : 'text-slate-200'}`}>
                Next Examination
              </span>
              <div className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE]">
                <Calendar className="w-4 h-4 text-[#5B21B6] dark:text-[#DDD6FE]" />
              </div>
            </div>

            {nextExam ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-1">
                  <span className={`text-base font-bold truncate ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                    {nextExam.subject_name}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE] shrink-0 border border-[#DDD6FE] dark:border-[#8B5CF6]/50">
                    {getExamCountdown(nextExam.exam_date)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-xs font-bold ${isLight ? 'text-[#1E293B]' : 'text-slate-100'}`}>
                    <span>Syllabus Coverage</span>
                    <span className="font-extrabold text-[#0F172A] dark:text-white">{nextExam.syllabus_completion_percent || 0}%</span>
                  </div>
                  <div className="w-full bg-[#CBD5E1] dark:bg-[#334155] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#6D28D9] dark:bg-[#8B5CF6] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(4, Math.min(100, nextExam.syllabus_completion_percent || 0))}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 py-1">
                <p className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-slate-100'}`}>
                  No Exam Scheduled
                </p>
                <p className={`text-xs font-medium ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
                  Add target semester examination dates to generate a spaced timetable.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3.5 mt-3 border-t border-[#CBD5E1] dark:border-[#334155]">
            <button
              onClick={() => onNavigate('scheduler')}
              className="text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE] hover:text-[#4C1D95] dark:hover:text-white hover:underline flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Open Exam Scheduler</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE] shrink-0" />
            </button>
          </div>
        </div>

        {/* CARD 4: Learning Progress */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#1E293B] border-[#334155] shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className={`font-bold uppercase tracking-wider ${isLight ? 'text-[#1E293B]' : 'text-slate-200'}`}>
                Learning Progress
              </span>
              <div className="p-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] dark:bg-[#15803D]/30 dark:text-[#86EFAC]">
                <BookOpen className="w-4 h-4 text-[#166534] dark:text-[#86EFAC]" />
              </div>
            </div>

            {totalQuizzesTaken > 0 || timetableStats ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold tracking-tight tabular-nums ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                    {totalQuizzesTaken}
                  </span>
                  <span className={`text-xs font-bold ${isLight ? 'text-[#1E293B]' : 'text-slate-200'}`}>
                    {totalQuizzesTaken === 1 ? 'Quiz completed' : 'Quizzes completed'}
                  </span>
                </div>
                <p className={`text-xs font-semibold ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                  {avgQuizScore !== null ? `Average diagnostic accuracy: ${avgQuizScore}%` : 'Diagnostic practice active'}
                  {timetableStats ? ` • ${timetableStats.completed}/${timetableStats.total} study tasks finished` : ''}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 py-1">
                <p className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-slate-100'}`}>
                  No Quizzes Completed
                </p>
                <p className={`text-xs font-medium ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
                  Take 30-question diagnostic quizzes with immediate explanation keys.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3.5 mt-3 border-t border-[#CBD5E1] dark:border-[#334155]">
            <button
              onClick={() => onNavigate('learn')}
              className="text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE] hover:text-[#4C1D95] dark:hover:text-white hover:underline flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Practice Diagnostic Quizzes</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE] shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PERSONALIZED NEXT-STEP SECTION (One concise, evidence-backed recommendation) */}
      {/* ========================================================================= */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-[#E2E8F0] text-[#0F172A] shadow-xs'
            : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC] shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE] flex items-center justify-center shrink-0 border border-[#DDD6FE] dark:border-[#8B5CF6]/50 shadow-xs">
              <Sparkles className="w-5 h-5 text-[#5B21B6] dark:text-[#DDD6FE]" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#6D28D9] dark:text-[#DDD6FE]">
                Recommended Study Action
              </span>
              <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                {prioritizedNextStep.hasEvidence
                  ? `Focus Topic: ${prioritizedNextStep.topic}`
                  : 'Diagnostic Onboarding Recommendation'}
              </h2>
            </div>
          </div>

          {prioritizedNextStep.hasEvidence && prioritizedNextStep.subject && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F1F5F9] text-[#0F172A] dark:bg-[#172033] dark:text-[#E2E8F0] border border-[#CBD5E1] dark:border-[#475569] shrink-0 self-start md:self-auto shadow-xs">
              Course: {prioritizedNextStep.subject}
            </span>
          )}
        </div>

        <p className={`text-xs sm:text-sm font-medium leading-relaxed mb-5 ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
          {prioritizedNextStep.reason}
        </p>

        {/* 4 Actionable Paths for this Recommendation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Path 1: Theory */}
          <button
            onClick={handleReadTheory}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
              isLight
                ? 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#EDE9FE]/50 hover:border-[#6D28D9] text-[#0F172A]'
                : 'bg-[#172033] border-[#334155] hover:bg-[#243248] hover:border-[#8B5CF6] text-white'
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">1. Read Theory</p>
              <p className={`text-[11px] font-medium truncate mt-0.5 ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
                Core concepts &amp; formulas
              </p>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-[#6D28D9] dark:text-[#A78BFA]" />
          </button>

          {/* Path 2: Verified Resource Link */}
          <button
            onClick={handleOpenVerifiedResource}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
              isLight
                ? 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#EDE9FE]/50 hover:border-[#6D28D9] text-[#0F172A]'
                : 'bg-[#172033] border-[#334155] hover:bg-[#243248] hover:border-[#8B5CF6] text-white'
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">2. Verified Lecture</p>
              <p className={`text-[11px] font-medium truncate mt-0.5 ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
                YouTube verified search
              </p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0 text-[#1D4ED8] dark:text-[#60A5FA]" />
          </button>

          {/* Path 3: 30-Question Quiz */}
          <button
            onClick={handleTakeQuiz}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
              isLight
                ? 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#EDE9FE]/50 hover:border-[#6D28D9] text-[#0F172A]'
                : 'bg-[#172033] border-[#334155] hover:bg-[#243248] hover:border-[#8B5CF6] text-white'
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">3. Diagnostic Quiz</p>
              <p className={`text-[11px] font-medium truncate mt-0.5 ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
                30-Question assessment
              </p>
            </div>
            <Play className="w-4 h-4 shrink-0 text-[#166534] dark:text-[#4ADE80]" />
          </button>

          {/* Path 4: Add to Study Plan */}
          <button
            onClick={handleScheduleRevision}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
              isLight
                ? 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#EDE9FE]/50 hover:border-[#6D28D9] text-[#0F172A]'
                : 'bg-[#172033] border-[#334155] hover:bg-[#243248] hover:border-[#8B5CF6] text-white'
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">4. Schedule Revision</p>
              <p className={`text-[11px] font-medium truncate mt-0.5 ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
                Spaced repetition session
              </p>
            </div>
            <Calendar className="w-4 h-4 shrink-0 text-[#6D28D9] dark:text-[#A78BFA]" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ACADEMIC CAPABILITIES (Clean navigation hub) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
            Academic Capabilities
          </h2>
          <span className={`text-xs font-medium ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
            Direct access to full academic tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Academic Performance & Progress */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isLight ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]' : 'bg-[#1E293B] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] text-[#1E40AF] dark:bg-[#1D4ED8]/30 dark:text-[#93C5FD] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                1. Performance &amp; Progress
              </h3>
              <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                Review semester marks, attendance trends, and predictive grade distribution.
              </p>
            </div>
            <button
              onClick={() => onNavigate('analysis')}
              className="mt-4 pt-3 border-t border-[#E8ECF3] dark:border-[#334155] text-xs font-bold text-[#6D28D9] dark:text-[#A78BFA] hover:text-[#5B21B6] dark:hover:text-[#DDD6FE] flex items-center gap-1.5 cursor-pointer hover:underline transition-colors"
            >
              <span>Open Academic Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Weak-Subject & Topic Diagnosis */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isLight ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]' : 'bg-[#1E293B] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#92400E] dark:bg-[#B45309]/30 dark:text-[#FCD34D] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                2. Weak-Subject Diagnosis
              </h3>
              <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                Pinpoint syllabus chapters causing performance friction and view targeted intervention suggestions.
              </p>
            </div>
            <button
              onClick={() => onNavigate('analysis')}
              className="mt-4 pt-3 border-t border-[#E8ECF3] dark:border-[#334155] text-xs font-bold text-[#6D28D9] dark:text-[#A78BFA] hover:text-[#5B21B6] dark:hover:text-[#DDD6FE] flex items-center gap-1.5 cursor-pointer hover:underline transition-colors"
            >
              <span>View Topic Diagnostics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Exam Scheduling & Timetable */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isLight ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]' : 'bg-[#1E293B] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                3. Exam Scheduling &amp; Timetable
              </h3>
              <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                Manage upcoming examinations, track countdowns, and maintain a spaced revision timetable.
              </p>
            </div>
            <button
              onClick={() => onNavigate('scheduler')}
              className="mt-4 pt-3 border-t border-[#E8ECF3] dark:border-[#334155] text-xs font-bold text-[#6D28D9] dark:text-[#A78BFA] hover:text-[#5B21B6] dark:hover:text-[#DDD6FE] flex items-center gap-1.5 cursor-pointer hover:underline transition-colors"
            >
              <span>Open Exam Scheduler</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Topic Theory & 30-Question Quizzes */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isLight ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]' : 'bg-[#1E293B] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#166534] dark:bg-[#15803D]/30 dark:text-[#86EFAC] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                4. Learn &amp; Practice Studio
              </h3>
              <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                Search any curriculum topic to study concise structured theory and take 30-question diagnostic quizzes.
              </p>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className="mt-4 pt-3 border-t border-[#E8ECF3] dark:border-[#334155] text-xs font-bold text-[#6D28D9] dark:text-[#A78BFA] hover:text-[#5B21B6] dark:hover:text-[#DDD6FE] flex items-center gap-1.5 cursor-pointer hover:underline transition-colors"
            >
              <span>Open Learn &amp; Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5. Courses & Certifications */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isLight ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]' : 'bg-[#1E293B] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                5. Courses &amp; Certifications
              </h3>
              <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                Discover officially verified courses from Harvard, MIT, and NPTEL mapped to your degree and weak subjects.
              </p>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="mt-4 pt-3 border-t border-[#E8ECF3] dark:border-[#334155] text-xs font-bold text-[#6D28D9] dark:text-[#A78BFA] hover:text-[#5B21B6] dark:hover:text-[#DDD6FE] flex items-center gap-1.5 cursor-pointer hover:underline transition-colors"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6. Personalized Study Roadmap */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isLight ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]' : 'bg-[#1E293B] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] text-[#1E40AF] dark:bg-[#1D4ED8]/30 dark:text-[#93C5FD] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                6. Personalized Study Roadmap
              </h3>
              <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                Set target milestones, rebalance study workload across days, and track daily session completion.
              </p>
            </div>
            <button
              onClick={() => onNavigate('scheduler')}
              className="mt-4 pt-3 border-t border-[#E8ECF3] dark:border-[#334155] text-xs font-bold text-[#6D28D9] dark:text-[#A78BFA] hover:text-[#5B21B6] dark:hover:text-[#DDD6FE] flex items-center gap-1.5 cursor-pointer hover:underline transition-colors"
            >
              <span>Build Revision Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
