import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Sliders,
  Calendar,
  BookOpen,
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Award,
  Layers,
  GraduationCap,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { SectionId } from '../types';
import {
  fetchAcademicAnalysis,
  fetchAcademicProfile,
  saveAcademicProfile,
  predictPerformance
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface AcademicAnalysisViewProps {
  onNavigate: (section: SectionId) => void;
  onSelectTopicForLearn?: (topic: string, courseContext?: string) => void;
  onSelectExamForSchedule?: (subject: string, topic?: string) => void;
}

interface SubjectItem {
  id: string;
  name: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  attendance: number;
  status: 'Strong' | 'Good' | 'Needs Attention' | 'Critical';
  difficult_topics: string[];
  topics_to_improve: string[];
}

export const AcademicAnalysisView: React.FC<AcademicAnalysisViewProps> = ({
  onNavigate,
  onSelectTopicForLearn,
  onSelectExamForSchedule
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'weak' | 'moderate' | 'strong'>('all');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // What-If Simulation State
  const [simStudyHours, setSimStudyHours] = useState<number>(12);
  const [simAttendance, setSimAttendance] = useState<number>(75);
  const [simAssignmentScore, setSimAssignmentScore] = useState<number>(70);
  const [isSimulating, setIsSimulating] = useState(false);

  // Editable Profile Draft State (for modal)
  const [draftProfile, setDraftProfile] = useState<{
    full_name: string;
    institution: string;
    course_degree: string;
    department_branch: string;
    academic_year: string;
    semester: string;
    grading_system: string;
    overall_attendance: number;
    daily_study_hours_weekday: number;
    daily_study_hours_weekend: number;
    subjects: Array<{
      id: string;
      name: string;
      marks_obtained: number;
      max_marks: number;
      percentage: number;
      attendance_percent: number;
      difficult_topics: string[];
    }>;
  }>({
    full_name: '',
    institution: '',
    course_degree: '',
    department_branch: '',
    academic_year: '',
    semester: '',
    grading_system: 'percentage',
    overall_attendance: 75,
    daily_study_hours_weekday: 3,
    daily_study_hours_weekend: 5,
    subjects: []
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analysisRes, profileRes] = await Promise.all([
        fetchAcademicAnalysis().catch(() => null),
        fetchAcademicProfile().catch(() => null)
      ]);

      if (analysisRes && analysisRes.status === 'success') {
        setAnalysisData(analysisRes);
      }
      if (profileRes && profileRes.profile) {
        setProfileData(profileRes.profile);
        const p = profileRes.profile;
        setDraftProfile({
          full_name: p.full_name || user?.name || '',
          institution: p.institution || '',
          course_degree: p.course_degree || '',
          department_branch: p.department_branch || '',
          academic_year: p.academic_year || 'Year 2',
          semester: p.semester || 'Semester 4',
          grading_system: p.grading_system || 'percentage',
          overall_attendance: p.overall_attendance || 75,
          daily_study_hours_weekday: p.daily_study_hours_weekday || 3,
          daily_study_hours_weekend: p.daily_study_hours_weekend || 5,
          subjects: (p.subjects || []).map((s: any) => ({
            id: s.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            name: s.name,
            marks_obtained: s.marks_obtained,
            max_marks: s.max_marks || 100,
            percentage: s.percentage || Math.round((s.marks_obtained / (s.max_marks || 100)) * 100),
            attendance_percent: s.attendance_percent || p.overall_attendance || 75,
            difficult_topics: s.difficult_topics || []
          }))
        });

        // Initialize simulation controls with current student metrics
        setSimAttendance(p.overall_attendance || 75);
        const weeklyHours = (p.daily_study_hours_weekday || 3) * 5 + (p.daily_study_hours_weekend || 5) * 2;
        setSimStudyHours(weeklyHours || 14);
      }
    } catch (err) {
      console.error('Failed to load academic analysis:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      // Recompute percentages for all subjects
      const updatedSubjects = draftProfile.subjects.map(s => ({
        ...s,
        max_marks: s.max_marks > 0 ? s.max_marks : 100,
        percentage: Number(((s.marks_obtained / (s.max_marks || 100)) * 100).toFixed(1))
      }));

      // Average attendance
      const computedAttendance = updatedSubjects.length > 0
        ? Number((updatedSubjects.reduce((acc, s) => acc + (s.attendance_percent || draftProfile.overall_attendance), 0) / updatedSubjects.length).toFixed(1))
        : draftProfile.overall_attendance;

      const payload = {
        ...draftProfile,
        overall_attendance: computedAttendance,
        subjects: updatedSubjects
      };

      const res = await saveAcademicProfile(payload);
      if (res && res.profile) {
        setProfileData(res.profile);
      }
      setSaveSuccessMsg('Academic profile updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      setIsEditProfileOpen(false);
      await loadData();
    } catch (err: any) {
      alert('Failed to save profile: ' + (err?.message || 'Error occurred'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Add a new subject row to draft
  const handleAddSubjectRow = () => {
    setDraftProfile(prev => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        {
          id: `sub-${Date.now()}`,
          name: '',
          marks_obtained: 60,
          max_marks: 100,
          percentage: 60,
          attendance_percent: prev.overall_attendance || 75,
          difficult_topics: []
        }
      ]
    }));
  };

  // Remove subject row from draft
  const handleRemoveSubjectRow = (index: number) => {
    setDraftProfile(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, idx) => idx !== index)
    }));
  };

  // Simulated Outcome Calculation
  const simulatedScore = useMemo(() => {
    if (!analysisData?.overview) return null;
    const baseSubjectMarks = analysisData.overview.subject_average || 65;
    // Study hours boost: each 2 hrs/week above base gives ~1.5% improvement up to 15%
    const baseWeekly = ((profileData?.daily_study_hours_weekday || 3) * 5) + ((profileData?.daily_study_hours_weekend || 5) * 2);
    const hoursDelta = simStudyHours - baseWeekly;
    const studyHoursBoost = Math.max(-10, Math.min(15, hoursDelta * 0.75));

    // Attendance factor (25% weight in formula)
    const normalizedAssignment = simAssignmentScore;
    const projectedSubjectMarks = Math.min(98, Math.max(30, baseSubjectMarks + studyHoursBoost));
    const score = (projectedSubjectMarks * 0.60) + (simAttendance * 0.25) + (normalizedAssignment * 0.15);
    const scoreRounded = Number(score.toFixed(1));

    let tier = 'moderate';
    let label = 'Moderate Standing';
    if (scoreRounded >= 80) {
      tier = 'distinction';
      label = 'High Distinction';
    } else if (scoreRounded >= 70) {
      tier = 'good';
      label = 'Good Standing';
    } else if (scoreRounded < 55) {
      tier = 'critical';
      label = 'Critical Academic Risk';
    }

    return {
      score: scoreRounded,
      tier,
      label,
      delta: Number((scoreRounded - (analysisData.overview.academic_score || 0)).toFixed(1))
    };
  }, [analysisData, profileData, simStudyHours, simAttendance, simAssignmentScore]);

  // Filtered Subjects
  const filteredSubjects: SubjectItem[] = useMemo(() => {
    if (!analysisData?.subjects) return [];
    if (statusFilter === 'all') return analysisData.subjects;
    if (statusFilter === 'weak') {
      return analysisData.subjects.filter((s: SubjectItem) => s.status === 'Critical' || s.status === 'Needs Attention' || s.percentage < 60 || s.attendance < 75);
    }
    if (statusFilter === 'moderate') {
      return analysisData.subjects.filter((s: SubjectItem) => s.status === 'Good' || (s.percentage >= 60 && s.percentage < 75));
    }
    if (statusFilter === 'strong') {
      return analysisData.subjects.filter((s: SubjectItem) => s.status === 'Strong' || s.percentage >= 75);
    }
    return analysisData.subjects;
  }, [analysisData, statusFilter]);

  // Fallback / Defaults if fresh onboarding
  const overview = analysisData?.overview || {
    academic_score: 72.4,
    standing: 'Good Standing (Consistent Performance)',
    standing_tier: 'good',
    subject_average: 70.8,
    overall_attendance: 78.5,
    total_subjects: 5,
    strong_subjects_count: 2,
    subjects_needing_attention_count: 2
  };

  const currentProfile = profileData || {
    full_name: user?.name || 'Student',
    institution: 'University College of Engineering',
    course_degree: 'B.Tech Computer Science & Engineering',
    department_branch: 'Computer Science',
    academic_year: 'Year 2',
    semester: 'Semester 4',
    grading_system: 'percentage'
  };

  const handleStartPractice = (topicName: string) => {
    if (onSelectTopicForLearn) {
      onSelectTopicForLearn(topicName, currentProfile.course_degree);
    } else {
      window.location.hash = `learn?topic=${encodeURIComponent(topicName)}`;
      onNavigate('learn');
    }
  };

  const handleScheduleExam = (subjectName: string, topicName?: string) => {
    if (onSelectExamForSchedule) {
      onSelectExamForSchedule(subjectName, topicName);
    } else {
      window.location.hash = `scheduler?subject=${encodeURIComponent(subjectName)}`;
      onNavigate('scheduler');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner & Profile Snapshot */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-[#E2E8F0] text-[#172033] shadow-xs'
            : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC] shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-[#E2E8F0] dark:border-[#334155] bg-[#0B132B] shadow-sm flex items-center justify-center p-1">
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] border border-[#DDD6FE] dark:border-[#8B5CF6]/40">
                  Core Workflow
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#526078] dark:bg-[#172033] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]">
                  {currentProfile.academic_year} • {currentProfile.semester}
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                Academic Analysis &amp; Trajectory
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                {currentProfile.full_name} • {currentProfile.course_degree} ({currentProfile.institution || 'Verified Academy'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="btn-primary text-xs sm:text-sm gap-2"
            >
              <Edit3 className="w-4 h-4 text-white" />
              <span className="text-white">Edit Academic Profile</span>
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="btn-secondary p-2.5 rounded-xl"
              title="Refresh Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            {saveSuccessMsg}
          </div>
        )}
      </div>

      {/* 2. Top-Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Academic Score */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#1E293B] border-[#334155] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#526078]' : 'text-slate-400'}`}>
              Academic Score
            </span>
            <div className="p-2 rounded-xl bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${isLight ? 'text-[#172033]' : 'text-white'}`}>
              {overview.academic_score}%
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                overview.standing_tier === 'distinction'
                  ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] dark:bg-[rgba(21,128,61,0.22)] dark:text-[#86EFAC] dark:border-[rgba(34,197,94,0.35)]'
                  : overview.standing_tier === 'good'
                  ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE] dark:bg-[rgba(29,78,216,0.22)] dark:text-[#93C5FD] dark:border-[rgba(59,130,246,0.35)]'
                  : overview.standing_tier === 'moderate'
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] dark:bg-[rgba(180,83,9,0.22)] dark:text-[#FDE68A] dark:border-[rgba(245,158,11,0.35)]'
                  : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA] dark:bg-[rgba(185,28,28,0.22)] dark:text-[#FCA5A5] dark:border-[rgba(239,68,68,0.35)]'
              }`}
            >
              {overview.standing_tier === 'distinction'
                ? 'Distinction'
                : overview.standing_tier === 'good'
                ? 'Good'
                : overview.standing_tier === 'moderate'
                ? 'Moderate'
                : 'At-Risk'}
            </span>
          </div>
          <p className={`text-xs mt-2 font-medium truncate ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
            {overview.standing}
          </p>
        </div>

        {/* Metric 2: Attendance */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#1E293B] border-[#334155] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#526078]' : 'text-slate-400'}`}>
              Overall Attendance
            </span>
            <div
              className={`p-2 rounded-xl ${
                overview.overall_attendance >= 75
                  ? 'bg-[#DCFCE7] text-[#15803D] dark:bg-[rgba(21,128,61,0.22)] dark:text-[#86EFAC]'
                  : 'bg-[#FEE2E2] text-[#B91C1C] dark:bg-[rgba(185,28,28,0.22)] dark:text-[#FCA5A5]'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${isLight ? 'text-[#172033]' : 'text-white'}`}>
              {overview.overall_attendance}%
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                overview.overall_attendance >= 75
                  ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] dark:bg-[rgba(21,128,61,0.22)] dark:text-[#86EFAC] dark:border-[rgba(34,197,94,0.35)]'
                  : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA] dark:bg-[rgba(185,28,28,0.22)] dark:text-[#FCA5A5] dark:border-[rgba(239,68,68,0.35)]'
              }`}
            >
              {overview.overall_attendance >= 75 ? 'Above 75% Threshold' : 'Below 75% Threshold'}
            </span>
          </div>
          <p className={`text-xs mt-2 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
            25% Weightage in university evaluation
          </p>
        </div>

        {/* Metric 3: Subject Marks Average */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#1E293B] border-[#334155] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#526078]' : 'text-slate-400'}`}>
              Subject Average
            </span>
            <div className="p-2 rounded-xl bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE]">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${isLight ? 'text-[#172033]' : 'text-white'}`}>
              {overview.subject_average}%
            </span>
            <span className={`text-xs font-semibold ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
              across {overview.total_subjects} subjects
            </span>
          </div>
          <p className={`text-xs mt-2 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
            60% Primary Weightage in Model
          </p>
        </div>

        {/* Metric 4: Weak Subjects Requiring Action */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#1E293B] border-[#334155] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#526078]' : 'text-slate-400'}`}>
              Focus Areas
            </span>
            <div
              className={`p-2 rounded-xl ${
                overview.subjects_needing_attention_count > 0
                  ? 'bg-[#FEF3C7] text-[#B45309] dark:bg-[rgba(180,83,9,0.22)] dark:text-[#FDE68A]'
                  : 'bg-[#DCFCE7] text-[#15803D] dark:bg-[rgba(21,128,61,0.22)] dark:text-[#86EFAC]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${isLight ? 'text-[#172033]' : 'text-white'}`}>
              {overview.subjects_needing_attention_count}
            </span>
            <span className="text-xs font-bold text-[#B45309] dark:text-[#FDE68A]">
              Subjects Need Attention
            </span>
          </div>
          <p className={`text-xs mt-2 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
            {overview.strong_subjects_count} subjects in strong standing
          </p>
        </div>
      </div>

      {/* 3. Transparent Scoring Methodology & Data Category Distinction */}
      <div
        className={`p-5 rounded-2xl border text-xs sm:text-sm ${
          isLight
            ? 'bg-white border-[#E1E6EF] text-[#172033] shadow-xs'
            : 'bg-[#131926] border-[#1E2B42] text-[#F7F8FC] shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E1E6EF] dark:border-[#1E2B42]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EAF2FF] text-[#2458A6] dark:bg-[rgba(36,88,166,0.2)] dark:text-[#93C5FD] shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#172033] dark:text-white">
                Academic Score Methodology &amp; Distinction
              </h3>
              <p className="text-xs text-[#526078] dark:text-slate-300 mt-0.5">
                We clearly separate your recorded raw marks, weighted institutional indicators, and predictive ML estimates.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="text-xs font-semibold text-[#7000E8] dark:text-[#C4B5FD] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            Update Subject Marks &amp; Attendance <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Clear Category Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
          <div className="p-3.5 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526078] dark:text-slate-400 block mb-1">
              1. Actual Marks
            </span>
            <p className="text-xs font-semibold text-[#172033] dark:text-white">
              Raw Continuous Evaluation
            </p>
            <p className="text-[11px] text-[#526078] dark:text-slate-300 mt-1 leading-relaxed">
              Direct marks recorded for assignments, midterms, and lab practicals. No synthetic adjustments applied.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2458A6] dark:text-[#93C5FD] block mb-1">
              2. Calculated Indicator
            </span>
            <p className="text-xs font-semibold text-[#172033] dark:text-white font-mono">
              Score = (Marks × 60%) + (Att. × 25%) + (Coursework × 15%)
            </p>
            <p className="text-[11px] text-[#526078] dark:text-slate-300 mt-1 leading-relaxed">
              Transparent, weighted academic standing calibrated to statutory university examination clearance rules.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7000E8] dark:text-[#C4B5FD] block mb-1">
              3. ML Prediction
            </span>
            <p className="text-xs font-semibold text-[#172033] dark:text-white">
              Validated Algorithmic Model
            </p>
            <p className="text-[11px] text-[#526078] dark:text-slate-300 mt-1 leading-relaxed">
              Random Forest and Gradient Boosting models trained on academic datasets to project semester performance categories.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Subject Diagnostics & Weak Topic Breakdown */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111827] border-slate-800 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Subject Performance & Friction Diagnosis
            </h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Pinpoint specific syllabus chapters causing performance friction and start immediate targeted practice.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#334155] shrink-0">
            {(['all', 'weak', 'moderate', 'strong'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-[#1E293B] text-[#6D28D9] dark:text-[#DDD6FE] shadow-xs'
                    : 'text-[#526078] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Subjects' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects List */}
        <div className="space-y-4">
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="text-sm font-semibold">No subjects match the selected filter.</p>
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-2 text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE] hover:underline"
              >
                View all subjects
              </button>
            </div>
          ) : (
            filteredSubjects.map(sub => {
              const isWeak = sub.percentage < 60 || sub.attendance < 75;
              const isModerate = sub.percentage >= 60 && sub.percentage < 75;
              const isStrong = sub.percentage >= 75;

              return (
                <div
                  key={sub.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isWeak
                      ? isLight
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-rose-950/20 border-rose-900/50'
                      : isModerate
                      ? isLight
                        ? 'bg-amber-50/30 border-amber-200'
                        : 'bg-amber-950/15 border-amber-900/40'
                      : isLight
                      ? 'bg-white border-[#E2E8F0] hover:border-slate-300'
                      : 'bg-[#1E293B] border-[#334155] hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Subject Info */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-bold ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                          {sub.name}
                        </h3>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            isStrong
                              ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] dark:bg-[rgba(21,128,61,0.22)] dark:text-[#86EFAC] dark:border-[rgba(34,197,94,0.35)]'
                              : isModerate
                              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] dark:bg-[rgba(180,83,9,0.22)] dark:text-[#FDE68A] dark:border-[rgba(245,158,11,0.35)]'
                              : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA] dark:bg-[rgba(185,28,28,0.22)] dark:text-[#FCA5A5] dark:border-[rgba(239,68,68,0.35)]'
                          }`}
                        >
                          {sub.percentage}% Score • {sub.status || (isStrong ? 'Strong' : isModerate ? 'Good' : 'Needs Attention')}
                        </span>
                        {sub.attendance < 75 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#B91C1C] text-white flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3" /> Attendance Alert ({sub.attendance}%)
                          </span>
                        )}
                      </div>

                      {/* Marks details */}
                      <p className={`text-xs ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                        Marks: <span className="font-bold text-[#172033] dark:text-slate-200">{sub.marks_obtained}</span> / {sub.max_marks} • Class Attendance: <span className="font-bold text-[#172033] dark:text-slate-200">{sub.attendance}%</span>
                      </p>

                      {/* Root cause reason why */}
                      <div className="flex items-center gap-1.5 text-xs text-[#526078] dark:text-slate-300 pt-0.5">
                        <span className="font-semibold text-[#172033] dark:text-slate-200">Why this standing:</span>
                        {sub.attendance < 75 ? (
                          <span>Class attendance is below the 75% threshold, significantly weighing down predicted examination tier.</span>
                        ) : sub.percentage < 60 ? (
                          <span>Assessment marks reflect conceptual friction in foundational derivations and test problems.</span>
                        ) : (
                          <span>Consistent scores and healthy class participation maintain positive academic momentum.</span>
                        )}
                      </div>

                      {/* Weak Topics */}
                      {sub.difficult_topics && sub.difficult_topics.length > 0 && (
                        <div className="pt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                            Friction Topics:
                          </span>
                          {sub.difficult_topics.map((t, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleStartPractice(t)}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] border border-[#DDD6FE] dark:border-[#8B5CF6]/40 transition cursor-pointer flex items-center gap-1"
                              title={`Practice ${t} in Learn & Practice`}
                            >
                              <BookOpen className="w-3 h-3 text-[#6D28D9] dark:text-[#DDD6FE]" />
                              {t}
                              <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Direct 1-Click Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleScheduleExam(sub.name, sub.difficult_topics?.[0])}
                        className="btn-secondary text-xs !py-2 !px-3"
                        title="Add study block or exam to scheduler"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE]" />
                        <span>Schedule Exam</span>
                      </button>

                      <button
                        onClick={() => handleStartPractice(sub.difficult_topics?.[0] || `${sub.name} Core Principles`)}
                        className="btn-primary text-xs !py-2 !px-3.5"
                      >
                        <BrainCircuit className="w-3.5 h-3.5 text-white" />
                        <span>Learn &amp; Practice</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Interactive What-If Scenario Simulator */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#1E293B] border-[#334155] shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE]">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                What-If Sensitivity Simulator
              </h2>
              <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                Simulate how changes in your daily study volume, attendance, and coursework directly boost your final grade band.
              </p>
            </div>
          </div>

          {simulatedScore && (
            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B]">Simulated Outcome</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-[#6D28D9] dark:text-[#DDD6FE] tabular-nums">
                    {simulatedScore.score}%
                  </span>
                  <span className={`text-xs font-bold ${simulatedScore.delta >= 0 ? 'text-[#15803D] dark:text-[#86EFAC]' : 'text-[#B91C1C] dark:text-[#FCA5A5]'}`}>
                    ({simulatedScore.delta >= 0 ? `+${simulatedScore.delta}%` : `${simulatedScore.delta}%`})
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE]">
                {simulatedScore.label}
              </span>
            </div>
          )}
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
          {/* Slider 1: Weekly Study Hours */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#172033] dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE]" />
                Weekly Study Volume:
              </span>
              <span className="font-mono font-bold text-[#6D28D9] dark:text-[#DDD6FE] text-sm tabular-nums">
                {simStudyHours} hrs/week
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={35}
              step={1}
              value={simStudyHours}
              onChange={e => setSimStudyHours(Number(e.target.value))}
              className="w-full accent-[#6D28D9] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>Light (2 hrs)</span>
              <span>Balanced (14 hrs)</span>
              <span>Intensive (35 hrs)</span>
            </div>
          </div>

          {/* Slider 2: Target Attendance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#172033] dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D] dark:text-[#86EFAC]" />
                Target Attendance %:
              </span>
              <span className="font-mono font-bold text-[#6D28D9] dark:text-[#DDD6FE] text-sm tabular-nums">
                {simAttendance}%
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={1}
              value={simAttendance}
              onChange={e => setSimAttendance(Number(e.target.value))}
              className="w-full accent-[#15803D] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>40% (Barred)</span>
              <span>75% (Min Req)</span>
              <span>100% (Perfect)</span>
            </div>
          </div>

          {/* Slider 3: Coursework & Assignment Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#172033] dark:text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE]" />
                Assignment &amp; Practicals:
              </span>
              <span className="font-mono font-bold text-[#6D28D9] dark:text-[#DDD6FE] text-sm tabular-nums">
                {simAssignmentScore}%
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              step={1}
              value={simAssignmentScore}
              onChange={e => setSimAssignmentScore(Number(e.target.value))}
              className="w-full accent-[#6D28D9] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>30%</span>
              <span>70%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Simulation Insight Box */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#EDE9FE] dark:bg-[#6D28D9]/20 border border-[#DDD6FE] dark:border-[#8B5CF6]/35 text-xs text-[#172033] dark:text-[#DDD6FE] flex items-center justify-between flex-wrap gap-2">
          <p>
            💡 <strong>Actionable takeaway:</strong> Increasing your self-study volume to{' '}
            <strong>{simStudyHours} hrs/week</strong> and sustaining <strong>{simAttendance}%</strong> attendance can boost your trajectory by{' '}
            <strong>{simulatedScore && simulatedScore.delta >= 0 ? `+${simulatedScore.delta}%` : `${simulatedScore?.delta ?? 0}%`}</strong>.
          </p>
          <button
            onClick={() => onNavigate('scheduler')}
            className="btn-primary text-xs !py-1.5 !px-3"
          >
            <span>Create Study Plan for this Goal</span>
          </button>
        </div>
      </div>

      {/* 6. Personalized Actionable Next Steps */}
      {analysisData?.personalized_recommendations && analysisData.personalized_recommendations.length > 0 && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111827] border-slate-800 shadow-xs'
          }`}
        >
          <h2 className={`text-lg sm:text-xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Concrete Action Steps for Identified Weaknesses
          </h2>
          <p className={`text-xs sm:text-sm mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Follow these recommendations to convert your weakest topics into high-scoring strengths.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.personalized_recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                      {rec.subject_name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600">
                      Topic: {rec.weak_topic}
                    </span>
                  </div>
                  <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {rec.what_needs_improvement}
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {rec.what_to_study}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-500">
                    ⏱ {rec.suggested_time_allocation}
                  </span>
                  <button
                    onClick={() => handleStartPractice(rec.weak_topic)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    Start Practice & Quiz <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Edit Academic Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div
            className={`w-full max-w-3xl my-8 rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Edit Academic Profile & Subjects
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update your current degree, subjects, marks, and attendance. Changes automatically recalculate your prediction.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Personal & Context Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  1. Academic Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={draftProfile.full_name}
                      onChange={e => setDraftProfile(p => ({ ...p, full_name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Academic Institution
                    </label>
                    <input
                      type="text"
                      value={draftProfile.institution}
                      onChange={e => setDraftProfile(p => ({ ...p, institution: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Course or Degree
                    </label>
                    <input
                      type="text"
                      required
                      value={draftProfile.course_degree}
                      onChange={e => setDraftProfile(p => ({ ...p, course_degree: e.target.value }))}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Department or Branch
                    </label>
                    <input
                      type="text"
                      value={draftProfile.department_branch}
                      onChange={e => setDraftProfile(p => ({ ...p, department_branch: e.target.value }))}
                      placeholder="e.g. Computer Science & Eng"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Current Year
                    </label>
                    <input
                      type="text"
                      value={draftProfile.academic_year}
                      onChange={e => setDraftProfile(p => ({ ...p, academic_year: e.target.value }))}
                      placeholder="e.g. Year 2"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Current Semester
                    </label>
                    <input
                      type="text"
                      value={draftProfile.semester}
                      onChange={e => setDraftProfile(p => ({ ...p, semester: e.target.value }))}
                      placeholder="e.g. Semester 4"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Subjects & Marks Section */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      2. Subjects, Marks & Attendance
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Add all enrolled subjects. Percentages and GPA are calculated automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubjectRow}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Subject
                  </button>
                </div>

                <div className="space-y-3">
                  {draftProfile.subjects.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Subject #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubjectRow(idx)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
                            Subject Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Data Structures & Algorithms"
                            value={sub.name}
                            onChange={e => {
                              const val = e.target.value;
                              setDraftProfile(p => {
                                const next = [...p.subjects];
                                next[idx] = { ...next[idx], name: val };
                                return { ...p, subjects: next };
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
                            Marks Obtained
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={sub.max_marks || 100}
                            required
                            value={sub.marks_obtained}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setDraftProfile(p => {
                                const next = [...p.subjects];
                                next[idx] = {
                                  ...next[idx],
                                  marks_obtained: val,
                                  percentage: Math.round((val / (next[idx].max_marks || 100)) * 100)
                                };
                                return { ...p, subjects: next };
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
                            Max Marks
                          </label>
                          <input
                            type="number"
                            min={10}
                            max={1000}
                            required
                            value={sub.max_marks || 100}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setDraftProfile(p => {
                                const next = [...p.subjects];
                                next[idx] = {
                                  ...next[idx],
                                  max_marks: val,
                                  percentage: Math.round((next[idx].marks_obtained / val) * 100)
                                };
                                return { ...p, subjects: next };
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
                            Class Attendance (%)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={sub.attendance_percent}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setDraftProfile(p => {
                                const next = [...p.subjects];
                                next[idx] = { ...next[idx], attendance_percent: val };
                                return { ...p, subjects: next };
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
                            Difficult Topics / Friction (comma separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Binary Trees, Dynamic Programming"
                            value={(sub.difficult_topics || []).join(', ')}
                            onChange={e => {
                              const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setDraftProfile(p => {
                                const next = [...p.subjects];
                                next[idx] = { ...next[idx], difficult_topics: val };
                                return { ...p, subjects: next };
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingProfile ? (
                    <>Saving Profile...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Academic Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
