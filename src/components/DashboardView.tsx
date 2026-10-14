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
  fetchQuizAttempts,
  toggleSaveCourse
} from '../services/api';
import { getPersonalizedCourses, loadUserCoursePreferences } from '../data/courseCatalogue';
import { CoursePreferencesModal } from './CoursePreferencesModal';

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

  // -------------------------------------------------------------
  // Personalized Course Recommendations State
  // -------------------------------------------------------------
  const [coursePrefs, setCoursePrefs] = useState(() => loadUserCoursePreferences());
  const [isCoursePrefsOpen, setIsCoursePrefsOpen] = useState(false);
  const [dashboardSavedCourses, setDashboardSavedCourses] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('edupredict_saved_courses');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      'cs50x-intro-cs': 'saved',
      'nptel-dsa-python': 'in_progress'
    };
  });

  const recommendedCourses = useMemo(() => {
    return getPersonalizedCourses({
      educationLevel: profileData?.education_level || user?.education_level || 'btech',
      courseDegree: profileData?.course_degree || user?.stream_or_branch || 'Computer Science & Engineering',
      weakSubjects: weakSubjects.map((s: any) => ({
        name: s.name,
        percentage: s.percentage,
        difficult_topics: s.difficult_topics || s.topics_to_improve || []
      })),
      preferences: coursePrefs,
      limit: 3
    });
  }, [profileData, user, weakSubjects, coursePrefs]);

  const handleToggleCourseSave = (courseId: string) => {
    setDashboardSavedCourses(prev => {
      const current = prev[courseId];
      const next = current === 'saved' ? 'in_progress' : current === 'in_progress' ? 'completed' : current === 'completed' ? '' : 'saved';
      const updated = { ...prev };
      if (!next) {
        delete updated[courseId];
      } else {
        updated[courseId] = next;
      }
      localStorage.setItem('edupredict_saved_courses', JSON.stringify(updated));
      return updated;
    });
    const studentId = user?.id || 'demo-student';
    toggleSaveCourse(studentId, courseId).catch(() => {});
  };

  // Quick Actions floating menu state
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation & outside click dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQuickActionsOpen) {
        setIsQuickActionsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setIsQuickActionsOpen(false);
      }
    };
    if (isQuickActionsOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQuickActionsOpen]);

  const handleQuickAddExam = () => {
    setIsQuickActionsOpen(false);
    if (onOpenAddExam) {
      onOpenAddExam();
    } else if (onSelectExamForSchedule) {
      onSelectExamForSchedule('', '');
    } else {
      onNavigate('scheduler');
    }
  };

  const handleQuickPracticeQuiz = () => {
    setIsQuickActionsOpen(false);
    const targetTopic = prioritizedNextStep.hasEvidence ? prioritizedNextStep.topic : 'Binary Trees';
    if (onOpenPracticeQuiz) {
      onOpenPracticeQuiz(targetTopic);
    } else if (onSelectTopicForLearn) {
      onSelectTopicForLearn(targetTopic, degreeLabel);
    } else {
      onNavigate('learn');
    }
  };

  const handleQuickStudyRoadmap = () => {
    setIsQuickActionsOpen(false);
    if (onOpenStudyRoadmap) {
      onOpenStudyRoadmap();
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
      {/* 4. RECOMMENDED COURSES (Personalized to profile, degree & weak subjects) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] flex items-center justify-center shrink-0 border border-[#DDD6FE] dark:border-[#8B5CF6]/40">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9] dark:text-[#DDD6FE]">
                  Personalized Learning
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#DCFCE7] text-[#15803D] dark:bg-[#15803D]/25 dark:text-[#86EFAC] border border-[#86EFAC] dark:border-[#15803D]/40">
                  Verified Courses
                </span>
              </div>
              <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                Recommended Courses
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsCoursePrefsOpen(true)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                isLight
                  ? 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#526078]'
                  : 'border-[#334155] bg-[#172033] hover:bg-[#243248] text-slate-300'
              }`}
              title="Configure target skills & duration"
            >
              <Sliders className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE]" />
              <span>Update Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('courses')}
              className="text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE] hover:underline flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-[#EDE9FE]/50 dark:hover:bg-[#6D28D9]/20 transition cursor-pointer"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Personalized Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedCourses.map((course) => {
            const status = dashboardSavedCourses[course.id];
            return (
              <div
                key={course.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                  isLight
                    ? 'bg-white border-[#E2E8F0] hover:border-[#6D28D9]/50 shadow-xs hover:shadow-md'
                    : 'bg-[#1E293B] border-[#334155] hover:border-[#8B5CF6]/50 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header: Provider and Price */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#1E293B] dark:bg-[#172033] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#334155] flex items-center gap-1 line-clamp-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#A78BFA] shrink-0" />
                      <span className="truncate">{course.provider}</span>
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        course.pricing === '100% Free'
                          ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC] dark:bg-[#15803D]/30 dark:text-[#86EFAC] dark:border-[#15803D]/50'
                          : 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD] dark:bg-[#1D4ED8]/30 dark:text-[#93C5FD] dark:border-[#1D4ED8]/50'
                      }`}
                    >
                      {course.pricing}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-white line-clamp-2 leading-snug group-hover:text-[#6D28D9] dark:group-hover:text-[#A78BFA] transition-colors">
                    {course.name}
                  </h3>

                  {/* Why recommended badge */}
                  {course.matchReason && (
                    <div className="text-[11px] font-bold text-[#5B21B6] dark:text-[#DDD6FE] bg-[#EDE9FE] dark:bg-[#6D28D9]/30 px-2.5 py-1 rounded-lg border border-[#DDD6FE] dark:border-[#8B5CF6]/50 flex items-center gap-1.5 line-clamp-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#6D28D9] dark:text-[#DDD6FE]" />
                      <span className="truncate">{course.matchReason}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs font-medium text-[#334155] dark:text-slate-200 line-clamp-2 leading-relaxed">
                    {course.outcome}
                  </p>

                  {/* Meta Chips: Subject, Difficulty, Duration */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#475569] dark:text-slate-300 pt-1">
                    <span className="bg-[#F1F5F9] dark:bg-[#172033] px-2 py-0.5 rounded font-bold text-[#1E293B] dark:text-slate-200 border border-[#CBD5E1] dark:border-[#334155]">
                      {course.category}
                    </span>
                    <span>•</span>
                    <span
                      className={`font-bold ${
                        course.difficulty === 'Beginner'
                          ? 'text-[#166534] dark:text-[#86EFAC]'
                          : course.difficulty === 'Intermediate'
                          ? 'text-[#92400E] dark:text-[#FCD34D]'
                          : 'text-[#5B21B6] dark:text-[#DDD6FE]'
                      }`}
                    >
                      {course.difficulty}
                    </span>
                    {course.duration && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-[#475569] dark:text-slate-400" />
                          <span>{course.duration}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3.5 border-t border-[#E8ECF3] dark:border-[#334155] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCourseSave(course.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                      status === 'completed'
                        ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC] dark:bg-[#15803D]/30 dark:text-[#86EFAC] dark:border-[#15803D]/50'
                        : status === 'in_progress'
                        ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] dark:bg-[#B45309]/30 dark:text-[#FCD34D] dark:border-[#B45309]/50'
                        : status === 'saved'
                        ? 'bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE] dark:border-[#8B5CF6]/50'
                        : isLight
                        ? 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                        : 'bg-[#172033] text-slate-200 border-[#334155] hover:bg-[#243248]'
                    }`}
                  >
                    {status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] dark:text-[#86EFAC]" />
                        <span>Completed</span>
                      </>
                    ) : status === 'in_progress' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-[#92400E] dark:text-[#FCD34D]" />
                        <span>In Progress</span>
                      </>
                    ) : status === 'saved' ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-[#5B21B6] dark:text-[#DDD6FE]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-[#475569] dark:text-slate-400" />
                        <span>Bookmark</span>
                      </>
                    )}
                  </button>

                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Visit Official Course</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FIVE USEFUL DASHBOARD CAPABILITIES (Clean navigation hub) */}
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

          {/* 5. Personalized Improvement Plan */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between md:col-span-2 lg:col-span-2 ${
              isLight ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]' : 'bg-[#1E293B] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] text-[#1E40AF] dark:bg-[#1D4ED8]/30 dark:text-[#93C5FD] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                5. Personalized Improvement Plan
              </h3>
              <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-[#334155]' : 'text-slate-200'}`}>
                Set target score milestones, rebalance missed study sessions across remaining days, and track statutory attendance compliance.
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

      {/* ========================================================================= */}
      {/* 7. FLOATING QUICK ACTIONS SPEED DIAL */}
      {/* ========================================================================= */}
      <div ref={quickActionsRef} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
        {/* Expanded Speed-Dial Card */}
        {isQuickActionsOpen && (
          <div
            role="dialog"
            aria-label="Quick Actions Menu"
            className={`absolute bottom-16 right-0 mb-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-4.5 origin-bottom-right animate-quick-actions-menu ${
              isLight
                ? 'bg-white/95 backdrop-blur-md border-[#E2E8F0] text-[#172033] shadow-slate-900/15'
                : 'bg-[#1E293B]/95 backdrop-blur-md border-[#334155] text-white shadow-black/50'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8ECF3] dark:border-[#334155]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE] flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-white">Quick Actions</h4>
                  <p className="text-[11px] font-medium text-[#475569] dark:text-slate-300">Immediate access to core workflows</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickActionsOpen(false)}
                className="p-1 rounded-lg text-[#475569] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close Quick Actions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions list */}
            <div className="space-y-2">
              {/* Action 1: Add New Exam */}
              <button
                type="button"
                onClick={handleQuickAddExam}
                className={`w-full group p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer animate-quick-action-item-1 ${
                  isLight
                    ? 'border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#DBEAFE]/40 hover:border-[#1E40AF]/40'
                    : 'border-[#334155] bg-[#172033] hover:bg-[#1E293B] hover:border-[#3B82F6]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#1E40AF] dark:bg-[#1D4ED8]/30 dark:text-[#93C5FD] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CalendarPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>Add New Exam</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E40AF] border border-[#93C5FD] dark:bg-[#1D4ED8]/30 dark:text-[#93C5FD]">
                        Scheduler
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${isLight ? 'text-[#334155]' : 'text-slate-300'}`}>
                      Schedule test date, syllabus chapters &amp; priority
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#475569] dark:text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-[#93C5FD] group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Action 2: Start New Practice Quiz */}
              <button
                type="button"
                onClick={handleQuickPracticeQuiz}
                className={`w-full group p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer animate-quick-action-item-2 ${
                  isLight
                    ? 'border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#DCFCE7]/40 hover:border-[#166534]/40'
                    : 'border-[#334155] bg-[#172033] hover:bg-[#1E293B] hover:border-[#10B981]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] dark:bg-[#15803D]/30 dark:text-[#6EE7B7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>Start New Practice Quiz</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] dark:bg-[#15803D]/30 dark:text-[#6EE7B7]">
                        30 Questions
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${isLight ? 'text-[#334155]' : 'text-slate-300'}`}>
                      {prioritizedNextStep.hasEvidence
                        ? `Practice ${prioritizedNextStep.topic} (${prioritizedNextStep.subject})`
                        : 'Interactive diagnostic quiz & curriculum mastery'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#475569] dark:text-slate-400 group-hover:text-[#166534] dark:group-hover:text-[#6EE7B7] group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Action 3: View Study Roadmap */}
              <button
                type="button"
                onClick={handleQuickStudyRoadmap}
                className={`w-full group p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer animate-quick-action-item-3 ${
                  isLight
                    ? 'border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EDE9FE]/50 hover:border-[#6D28D9]/40'
                    : 'border-[#334155] bg-[#172033] hover:bg-[#1E293B] hover:border-[#8B5CF6]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>View Study Roadmap</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE]">
                        Daily Roadmap
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${isLight ? 'text-[#334155]' : 'text-slate-300'}`}>
                      {nextExam
                        ? `${nextExam.subject_name} (${getExamCountdown(nextExam.exam_date)}) • Daily plan & timer`
                        : 'Day-by-day task distribution & focus sessions'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#475569] dark:text-slate-400 group-hover:text-[#6D28D9] dark:group-hover:text-[#DDD6FE] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Quick Status / Keyboard Hint */}
            <div className={`mt-3 pt-2.5 border-t border-[#E8ECF3] dark:border-[#334155] flex items-center justify-between text-[11px] font-medium ${isLight ? 'text-[#475569]' : 'text-slate-300'}`}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Active intelligence hub</span>
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-semibold">
                ESC to close
              </kbd>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          type="button"
          onClick={() => setIsQuickActionsOpen(prev => !prev)}
          aria-expanded={isQuickActionsOpen}
          aria-haspopup="dialog"
          aria-label="Toggle Quick Actions Floating Menu"
          className={`flex items-center gap-2.5 px-4.5 py-3 sm:px-5 sm:py-3.5 rounded-full font-bold shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 focus:outline-hidden focus:ring-4 ${
            isQuickActionsOpen
              ? isLight
                ? 'bg-[#0F172A] text-white shadow-slate-900/30 focus:ring-[#0F172A]/25'
                : 'bg-white text-[#0B0F19] shadow-black/50 focus:ring-white/30'
              : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-[#6D28D9]/40 hover:shadow-[#6D28D9]/60 focus:ring-[#6D28D9]/30 hover:-translate-y-0.5'
          }`}
        >
          <div className={`transition-transform duration-300 ${isQuickActionsOpen ? 'rotate-90' : 'rotate-0'}`}>
            {isQuickActionsOpen ? (
              <X className={`w-5 h-5 ${isQuickActionsOpen && !isLight ? 'text-[#0B0F19]' : 'text-white'}`} />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>
          <span className={`text-sm font-bold tracking-wide ${isQuickActionsOpen && !isLight ? 'text-[#0B0F19]' : 'text-white'}`}>
            Quick Actions
          </span>
          <span
            className={`inline-flex items-center justify-center text-xs font-black px-2 py-0.5 rounded-full shadow-xs ${
              isQuickActionsOpen && !isLight ? 'bg-[#0F172A] text-white' : 'bg-white text-[#6D28D9]'
            }`}
          >
            3
          </span>
        </button>
      </div>

      {/* Course Preferences Modal */}
      {isCoursePrefsOpen && (
        <CoursePreferencesModal
          isOpen={isCoursePrefsOpen}
          onClose={() => setIsCoursePrefsOpen(false)}
          onSaved={(newPrefs) => {
            setCoursePrefs(newPrefs);
          }}
        />
      )}
    </div>
  );
};
