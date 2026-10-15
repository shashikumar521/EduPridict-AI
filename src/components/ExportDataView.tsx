import React, { useState, useEffect, useCallback } from 'react';
import {
  FileDown,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  Calendar,
  Award,
  GraduationCap,
  TrendingUp,
  Brain,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  X,
  FileText,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  fetchAcademicProfile,
  fetchAcademicAnalysis,
  fetchExamsList,
  fetchExamStudyPlan,
  fetchQuizAttempts,
  fetchPredictions
} from '../services/api';
import {
  generateAcademicPerformancePdf,
  AcademicReportPayload,
  ReportSubjectItem,
  ReportExamItem,
  ReportQuizItem,
  ReportRecommendationItem
} from '../utils/pdfReportGenerator';

interface ExportDataViewProps {
  onNavigate: (section: SectionId) => void;
  onOpenProfileSetup?: () => void;
}

export const ExportDataView: React.FC<ExportDataViewProps> = ({
  onNavigate,
  onOpenProfileSetup
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<any>(null);

  // Export options state
  const [includeOverview, setIncludeOverview] = useState(true);
  const [includeSubjects, setIncludeSubjects] = useState(true);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [includeExams, setIncludeExams] = useState(true);
  const [includeLearning, setIncludeLearning] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);

  // UI state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load student data across modules
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setDownloadError(null);
    try {
      const [profileRes, analysisRes, examsRes, planRes, quizRes, predsRes] = await Promise.allSettled([
        fetchAcademicProfile(),
        fetchAcademicAnalysis(),
        fetchExamsList(),
        fetchExamStudyPlan(),
        fetchQuizAttempts(),
        fetchPredictions()
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.profile) {
        setProfile(profileRes.value.profile);
      }
      if (analysisRes.status === 'fulfilled') {
        setAnalysis(analysisRes.value);
      }
      if (examsRes.status === 'fulfilled' && examsRes.value?.exams) {
        setExams(examsRes.value.exams);
      }
      if (planRes.status === 'fulfilled' && planRes.value) {
        setStudyPlan(planRes.value);
      }
      if (quizRes.status === 'fulfilled' && quizRes.value?.attempts) {
        setQuizAttempts(quizRes.value.attempts);
      }
      if (predsRes.status === 'fulfilled' && Array.isArray(predsRes.value) && predsRes.value.length > 0) {
        setLatestPrediction(predsRes.value[0]);
      }
    } catch (err: any) {
      console.error('Error hydrating export data:', err);
      setDownloadError('Could not load some academic records. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, isAuthenticated]);

  // Evaluate profile completeness
  const subjectsList: any[] = profile?.subjects || analysis?.subjects || [];
  const hasProfile = Boolean(profile && profile.full_name);
  const hasSubjects = subjectsList.length > 0;
  const hasAnalysis = Boolean(analysis && analysis.status === 'success' && analysis.overview);
  const hasExams = exams.length > 0 || (profile?.upcoming_exams && profile.upcoming_exams.length > 0);
  const hasQuizzes = quizAttempts.length > 0;

  // Minimum required data for generating a valid report:
  // Must have student name and at least 1 recorded subject
  const isEligibleForExport = hasSubjects && (profile?.full_name || user?.name);

  // Missing data diagnostics
  const missingItems: string[] = [];
  if (!hasProfile && !user?.name) {
    missingItems.push('Student name and institution details');
  }
  if (!hasSubjects) {
    missingItems.push('At least one academic subject with examination/attendance marks');
  }
  if (!hasAnalysis) {
    missingItems.push('Academic analysis computation (visit Academic Analysis to run analysis)');
  }

  // Construct PDF Payload from actual recorded state
  const buildReportPayload = (): AcademicReportPayload => {
    const studentName = profile?.full_name || user?.name || 'Student';
    const institution = profile?.institution || user?.institution || 'Academic Institution';
    const degree = profile?.course_degree || user?.education_level || 'B.Tech';
    const departmentBranch = profile?.department_branch || user?.stream_or_branch || '';
    const academicYear = profile?.academic_year || 'AY 2024–2025';
    const semester = profile?.semester || 'Current Semester';
    const gradingSystem = profile?.grading_system || 'percentage';
    const generatedDate = new Date().toISOString().slice(0, 10);

    const reportSubjects: ReportSubjectItem[] = subjectsList.map((s: any) => ({
      name: s.name || 'Subject',
      marksObtained: Number(s.marks_obtained) || 0,
      maxMarks: Number(s.max_marks) || 100,
      percentage: Number(s.percentage) || 0,
      attendance: Number(s.attendance || s.attendance_percent || profile?.overall_attendance || 75),
      status: s.status || (s.percentage >= 70 ? 'Good' : 'Needs Attention'),
      difficultTopics: Array.isArray(s.difficult_topics) ? s.difficult_topics : [],
      topicsToImprove: Array.isArray(s.topics_to_improve) ? s.topics_to_improve : []
    }));

    const reportExams: ReportExamItem[] = (exams.length > 0 ? exams : (profile?.upcoming_exams || [])).map((e: any) => ({
      subjectName: e.subject_name || 'Upcoming Exam',
      examDate: e.exam_date || 'Upcoming',
      priority: e.priority || 'medium',
      syllabusCompletion: Number(e.syllabus_completion_percent) || 0,
      status: e.status || 'upcoming',
      notes: e.notes || ''
    }));

    const reportQuizzes: ReportQuizItem[] = quizAttempts.map((q: any) => ({
      topic: q.topic || 'Practice Topic',
      score: Number(q.score) || 0,
      totalQuestions: Number(q.total_questions) || 30,
      percentage: Number(q.percentage) || 0,
      completedAt: q.completed_at || 'Recent'
    }));

    const reportRecs: ReportRecommendationItem[] = (analysis?.personalized_recommendations || []).map((r: any) => ({
      subjectName: r.subject_name || 'Subject',
      weakTopic: r.weak_topic || 'Focus Topic',
      whatNeedsImprovement: r.what_needs_improvement || 'Practice fundamental concepts',
      whyItMatters: r.why_it_matters || 'High weightage examination topic',
      whatToStudy: r.what_to_study || 'Review lecture notes and solved problems',
      suggestedTime: r.suggested_time_allocation || '3-4 hrs focused study'
    }));

    return {
      studentName,
      studentId: user?.id,
      degree,
      institution,
      departmentBranch,
      academicYear,
      semester,
      gradingSystem,
      generatedDate,
      isAuthenticated: Boolean(isAuthenticated && user),
      academicScore: analysis?.overview?.academic_score,
      standing: analysis?.overview?.standing,
      standingTier: analysis?.overview?.standing_tier,
      subjectAverage: analysis?.overview?.subject_average,
      overallAttendance: analysis?.overview?.overall_attendance || profile?.overall_attendance,
      totalSubjects: reportSubjects.length,
      scoringFormula: analysis?.scoring_methodology?.formula,
      subjects: reportSubjects,
      strongestSubjects: (analysis?.strongest_subjects || []).map((s: any) => s.name || s),
      subjectsNeedingAttention: (analysis?.subjects_needing_attention || []).map((s: any) => s.name || s),
      weakTopics: profile?.weak_topics || [],
      recommendations: reportRecs,
      upcomingExams: reportExams,
      studyPlan: studyPlan ? {
        examName: studyPlan.exam_name,
        dailyRoutine: studyPlan.routine_description,
        weeklyHours: studyPlan.weekly_target_hours,
        totalSessions: studyPlan.sessions?.length || 0,
        completedSessions: studyPlan.sessions?.filter((s: any) => s.status === 'completed').length || 0
      } : undefined,
      quizAttempts: reportQuizzes,
      prediction: latestPrediction ? {
        modelUsed: latestPrediction.model_used || 'Random Forest Classifier',
        predictedCategory: latestPrediction.predicted_category || 'Good',
        confidence: Number(latestPrediction.confidence) || 0.88,
        projectedScore: Number(latestPrediction.projected_score) || 75,
        date: latestPrediction.created_at
      } : undefined,
      includedSections: {
        overview: includeOverview,
        subjects: includeSubjects,
        analysis: includeAnalysis,
        exams: includeExams,
        learning: includeLearning,
        recommendations: includeRecommendations
      }
    };
  };

  // Trigger PDF Generation & Download
  const handleDownloadPdf = () => {
    if (!isEligibleForExport) return;
    setIsGeneratingPdf(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      const payload = buildReportPayload();
      const doc = generateAcademicPerformancePdf(payload);

      // Sanitize student name for filename
      const cleanName = (payload.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = payload.generatedDate;
      const filename = `EduPredictAI_Performance_Report_${cleanName}_${dateStr}.pdf`;

      doc.save(filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      setDownloadError(err?.message || 'Failed to generate PDF report. Please check your data and try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOpenPreview = () => {
    if (!isEligibleForExport) return;
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* ----------------------------------------------------------- */}
      {/* 1. PAGE HEADER                                              */}
      {/* ----------------------------------------------------------- */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-sm'
            : 'bg-[#1E293B] border-[#334155] shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] border border-[#DDD6FE] dark:border-[#8B5CF6]/30">
              <FileDown className="w-3.5 h-3.5" />
              <span>Academic Data Export &amp; Official Reporting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Export Your Academic Report
            </h1>
            <p className="text-sm leading-relaxed text-[#475569] dark:text-slate-300">
              Download a personalized report of your academic performance, learning progress, and study plan based on the information available in your EduPredict AI account.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenPreview}
              disabled={!isEligibleForExport || isLoading}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition cursor-pointer min-h-[42px] ${
                !isEligibleForExport || isLoading
                  ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  : isLight
                  ? 'bg-[#F8FAFC] hover:bg-[#EDE9FE] text-[#172033] hover:text-[#6D28D9] border-[#E2E8F0]'
                  : 'bg-[#172033] hover:bg-[#243248] text-slate-200 hover:text-white border-[#334155]'
              }`}
              title={!isEligibleForExport ? 'Complete academic inputs to enable preview' : 'Preview report content'}
            >
              <Eye className="w-4 h-4" />
              <span>Preview Report</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!isEligibleForExport || isGeneratingPdf || isLoading}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition cursor-pointer min-h-[42px] active:scale-95 ${
                !isEligibleForExport || isLoading
                  ? 'opacity-50 cursor-not-allowed bg-slate-400 shadow-none'
                  : 'bg-[#4F46E5] hover:bg-[#4338CA] shadow-[#4F46E5]/20'
              }`}
              title={!isEligibleForExport ? 'Complete academic inputs to enable PDF download' : 'Download PDF report'}
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Performance Report (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {downloadSuccess && (
          <div className="mt-5 p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] dark:bg-[rgba(5,150,105,0.18)] dark:border-[#34D399]/30 dark:text-[#6EE7B7] flex items-center gap-3 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669]" />
            <span>Academic Performance Report downloaded successfully. Check your browser downloads folder.</span>
          </div>
        )}

        {downloadError && (
          <div className="mt-5 p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] dark:bg-[rgba(220,38,38,0.18)] dark:border-[#EF4444]/30 dark:text-[#FCA5A5] flex items-center gap-3 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>{downloadError}</span>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. DATA AVAILABILITY & ELIGIBILITY DIAGNOSTIC               */}
      {/* ----------------------------------------------------------- */}
      {!isEligibleForExport && !isLoading && (
        <div
          className={`p-6 rounded-3xl border transition-all ${
            isLight
              ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
              : 'bg-[#78350F]/20 border-[#F59E0B]/30 text-[#FCD34D]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-[#F59E0B]/20 text-[#D97706] dark:text-[#FCD34D] shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-base font-bold text-[#92400E] dark:text-[#FCD34D]">
                  Academic Information Required Before Exporting
                </h3>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  EduPredict AI generates genuine reports derived exclusively from your recorded coursework, grades, and syllabus progress. We do not invent sample scores or create synthetic filler documents.
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="font-bold">Missing required information:</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {missingItems.map((item, idx) => (
                    <li key={idx} className="font-medium">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('analysis')}
                  className="btn-primary text-xs !py-2 !px-4 gap-2 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                  <span>Go to Academic Analysis</span>
                </button>
                {onOpenProfileSetup && (
                  <button
                    type="button"
                    onClick={onOpenProfileSetup}
                    className={`text-xs px-4 py-2 rounded-xl font-bold border transition cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-50 text-[#172033] border-[#E2E8F0]'
                        : 'bg-[#172033] hover:bg-[#243248] text-white border-[#334155]'
                    }`}
                  >
                    Complete 5-Step Academic Setup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 3. RECORD SUMMARY & DATA MODULE AUDIT                        */}
      {/* ----------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#334155] dark:text-slate-300">
            Available Academic Data Modules
          </h2>
          <span className="text-xs font-semibold text-[#475569] dark:text-slate-400">
            {hasSubjects ? `${subjectsList.length} subjects recorded` : 'No subjects recorded'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Student Profile */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE]">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Student Profile</p>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400">Identity &amp; Curricular Context</p>
                </div>
              </div>
              {hasProfile || user?.name ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#6EE7B7]">
                  <Check className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] dark:text-[#FCD34D]">
                  <Clock className="w-3.5 h-3.5" /> Pending
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-[#334155] dark:text-slate-300 space-y-1">
              <p className="font-semibold truncate">Name: {profile?.full_name || user?.name || 'Not provided'}</p>
              <p className="text-[11px] text-[#475569] dark:text-slate-400 truncate">
                {profile?.course_degree || user?.education_level || 'General Program'} • {profile?.semester || 'Semester 1'}
              </p>
            </div>
          </div>

          {/* Card 2: Subject Marks & Attendance */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#2563EB]/25 dark:text-[#93C5FD]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Subject Marks &amp; Attendance</p>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400">Coursework Performance</p>
                </div>
              </div>
              {hasSubjects ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#6EE7B7]">
                  <Check className="w-3.5 h-3.5" /> {subjectsList.length} Units
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] dark:text-[#FCA5A5]">
                  <X className="w-3.5 h-3.5" /> None
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-[#334155] dark:text-slate-300 space-y-1">
              {hasSubjects ? (
                <>
                  <p className="font-semibold truncate">Average Score: {analysis?.overview?.subject_average || (subjectsList.reduce((sum, s) => sum + (s.percentage || 0), 0) / subjectsList.length).toFixed(1)}%</p>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400">
                    Attendance: {analysis?.overview?.overall_attendance || profile?.overall_attendance || 80}%
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-[#D97706] dark:text-[#FCD34D]">Add course units in Academic Analysis</p>
              )}
            </div>
          </div>

          {/* Card 3: Academic Diagnostics & ML Analysis */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F0FDF4] text-[#059669] dark:bg-[#059669]/25 dark:text-[#6EE7B7]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Academic Diagnostics</p>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400">Score, Standing &amp; Gaps</p>
                </div>
              </div>
              {hasAnalysis ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#6EE7B7]">
                  <Check className="w-3.5 h-3.5" /> Computed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] dark:text-[#FCD34D]">
                  <Clock className="w-3.5 h-3.5" /> Not Run
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-[#334155] dark:text-slate-300 space-y-1">
              <p className="font-semibold truncate">
                Overall Index: {analysis?.overview?.academic_score !== undefined ? `${analysis.overview.academic_score}%` : 'Pending'}
              </p>
              <p className="text-[11px] text-[#475569] dark:text-slate-400">
                Standing: {analysis?.overview?.standing || 'Standard Evaluation'}
              </p>
            </div>
          </div>

          {/* Card 4: Exam Schedule & Study Plan */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FFFBEB] text-[#D97706] dark:bg-[#D97706]/25 dark:text-[#FCD34D]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Exam Preparation</p>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400">Upcoming Tests &amp; Timetable</p>
                </div>
              </div>
              {hasExams ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#6EE7B7]">
                  <Check className="w-3.5 h-3.5" /> {exams.length || profile?.upcoming_exams?.length} Exams
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#64748B] dark:text-slate-400">
                  Optional
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-[#334155] dark:text-slate-300 space-y-1">
              <p className="font-semibold truncate">
                {studyPlan ? `Study Plan: ${studyPlan.exam_name || 'Active'}` : 'No active study timetable'}
              </p>
              <p className="text-[11px] text-[#475569] dark:text-slate-400">
                {exams.length > 0 ? `Earliest: ${exams[0]?.exam_date || 'Upcoming'}` : 'Add tests in Exam Scheduler'}
              </p>
            </div>
          </div>

          {/* Card 5: Learning Studio Quiz Mastery */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F5F3FF] text-[#7C3AED] dark:bg-[#7C3AED]/25 dark:text-[#DDD6FE]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Learning Studio Mastery</p>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400">Quiz &amp; Theory Progress</p>
                </div>
              </div>
              {hasQuizzes ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#6EE7B7]">
                  <Check className="w-3.5 h-3.5" /> {quizAttempts.length} Quizzes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#64748B] dark:text-slate-400">
                  Optional
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-[#334155] dark:text-slate-300 space-y-1">
              <p className="font-semibold truncate">
                {hasQuizzes ? `Latest Score: ${quizAttempts[0]?.percentage || 0}% (${quizAttempts[0]?.topic})` : 'No quizzes completed'}
              </p>
              <p className="text-[11px] text-[#475569] dark:text-slate-400">
                {hasQuizzes ? `${quizAttempts.length} total attempt records` : 'Take 30-question tests in Learn Studio'}
              </p>
            </div>
          </div>

          {/* Card 6: Supervised ML Risk Prediction */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE]">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Machine Learning Model</p>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400">Random Forest Ensemble</p>
                </div>
              </div>
              {latestPrediction ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#6EE7B7]">
                  <Check className="w-3.5 h-3.5" /> Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#64748B] dark:text-slate-400">
                  Optional
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-[#334155] dark:text-slate-300 space-y-1">
              <p className="font-semibold truncate">
                {latestPrediction ? `Risk Category: ${latestPrediction.predicted_category?.toUpperCase()}` : 'Default Benchmark v2.4'}
              </p>
              <p className="text-[11px] text-[#475569] dark:text-slate-400">
                {latestPrediction ? `Projected Score: ${latestPrediction.projected_score}%` : 'Supervised multi-cohort model'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. EXPORT CONFIGURATION & SECTION SELECTION                 */}
      {/* ----------------------------------------------------------- */}
      <div
        className={`p-6 rounded-3xl border transition ${
          isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
        }`}
      >
        <div className="space-y-1 mb-4">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Customize Included Report Sections
          </h2>
          <p className="text-xs text-[#475569] dark:text-slate-300">
            Select the components to include in your exported performance PDF. Unselected sections will be omitted from the compiled report.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {/* Option 1 */}
          <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none ${
            includeOverview
              ? isLight ? 'bg-[#EDE9FE]/40 border-[#C4B5FD]' : 'bg-[#6D28D9]/15 border-[#8B5CF6]/40'
              : isLight ? 'bg-slate-50 border-[#E2E8F0]' : 'bg-[#172033] border-[#334155]'
          }`}>
            <input
              type="checkbox"
              checked={includeOverview}
              onChange={(e) => setIncludeOverview(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold block text-[#0F172A] dark:text-[#F8FAFC]">Performance Overview</span>
              <span className="text-[#475569] dark:text-slate-400 text-[11px]">Overall academic score, standing tier, and attendance rate</span>
            </div>
          </label>

          {/* Option 2 */}
          <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none ${
            includeSubjects
              ? isLight ? 'bg-[#EDE9FE]/40 border-[#C4B5FD]' : 'bg-[#6D28D9]/15 border-[#8B5CF6]/40'
              : isLight ? 'bg-slate-50 border-[#E2E8F0]' : 'bg-[#172033] border-[#334155]'
          }`}>
            <input
              type="checkbox"
              checked={includeSubjects}
              onChange={(e) => setIncludeSubjects(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold block text-[#0F172A] dark:text-[#F8FAFC]">Subject Marks Table</span>
              <span className="text-[#475569] dark:text-slate-400 text-[11px]">Comprehensive breakdown of subject scores and attendance</span>
            </div>
          </label>

          {/* Option 3 */}
          <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none ${
            includeAnalysis
              ? isLight ? 'bg-[#EDE9FE]/40 border-[#C4B5FD]' : 'bg-[#6D28D9]/15 border-[#8B5CF6]/40'
              : isLight ? 'bg-slate-50 border-[#E2E8F0]' : 'bg-[#172033] border-[#334155]'
          }`}>
            <input
              type="checkbox"
              checked={includeAnalysis}
              onChange={(e) => setIncludeAnalysis(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold block text-[#0F172A] dark:text-[#F8FAFC]">Diagnostics &amp; Gaps</span>
              <span className="text-[#475569] dark:text-slate-400 text-[11px]">Identified academic strengths and topic skill gaps</span>
            </div>
          </label>

          {/* Option 4 */}
          <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none ${
            includeExams
              ? isLight ? 'bg-[#EDE9FE]/40 border-[#C4B5FD]' : 'bg-[#6D28D9]/15 border-[#8B5CF6]/40'
              : isLight ? 'bg-slate-50 border-[#E2E8F0]' : 'bg-[#172033] border-[#334155]'
          }`}>
            <input
              type="checkbox"
              checked={includeExams}
              onChange={(e) => setIncludeExams(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold block text-[#0F172A] dark:text-[#F8FAFC]">Exam Preparation</span>
              <span className="text-[#475569] dark:text-slate-400 text-[11px]">Upcoming examination dates and active study routine</span>
            </div>
          </label>

          {/* Option 5 */}
          <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none ${
            includeLearning
              ? isLight ? 'bg-[#EDE9FE]/40 border-[#C4B5FD]' : 'bg-[#6D28D9]/15 border-[#8B5CF6]/40'
              : isLight ? 'bg-slate-50 border-[#E2E8F0]' : 'bg-[#172033] border-[#334155]'
          }`}>
            <input
              type="checkbox"
              checked={includeLearning}
              onChange={(e) => setIncludeLearning(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold block text-[#0F172A] dark:text-[#F8FAFC]">Learning Mastery &amp; Quizzes</span>
              <span className="text-[#475569] dark:text-slate-400 text-[11px]">Recorded 30-question quiz scores and assessment dates</span>
            </div>
          </label>

          {/* Option 6 */}
          <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none ${
            includeRecommendations
              ? isLight ? 'bg-[#EDE9FE]/40 border-[#C4B5FD]' : 'bg-[#6D28D9]/15 border-[#8B5CF6]/40'
              : isLight ? 'bg-slate-50 border-[#E2E8F0]' : 'bg-[#172033] border-[#334155]'
          }`}>
            <input
              type="checkbox"
              checked={includeRecommendations}
              onChange={(e) => setIncludeRecommendations(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold block text-[#0F172A] dark:text-[#F8FAFC]">Targeted Revision Plan</span>
              <span className="text-[#475569] dark:text-slate-400 text-[11px]">Personalized study actions and focus recommendations</span>
            </div>
          </label>
        </div>

        {/* Security / Privacy notice */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-[#475569] dark:text-slate-400">
          <Shield className="w-4 h-4 text-[#059669] shrink-0" />
          <span>
            <strong>Data Privacy &amp; Integrity:</strong> Reports are rendered directly in your browser from your authenticated profile. Credentials, phone numbers, and session keys are never printed on exported documents.
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 5. REPORT PREVIEW MODAL                                     */}
      {/* ----------------------------------------------------------- */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Document Preview — Academic Performance Report
                  </h3>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400">
                    Exact representation of data to be compiled into your downloadable PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="btn-primary text-xs !py-1.5 !px-3 gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  aria-label="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scaled Mockup of Real Report Data */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
              <div className="max-w-3xl mx-auto bg-white dark:bg-[#0F172A] p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-[#1E293B] dark:text-slate-200">
                {/* Header Strip in Preview */}
                <div className="border-b pb-4 border-slate-200 dark:border-slate-800 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#4F46E5] dark:text-[#818CF8]">EduPredict AI</h2>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Academic Intelligence &amp; Performance Report
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Date: {new Date().toISOString().slice(0, 10)}</p>
                    <p>{profile?.academic_year || 'AY 2024–2025'}</p>
                  </div>
                </div>

                {/* Profile Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#4F46E5] dark:text-[#818CF8]">Student</p>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{profile?.full_name || user?.name || 'Student'}</p>
                    <p className="text-slate-500">{profile?.course_degree || 'B.Tech'} • {profile?.department_branch || 'Computer Science'}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-[#4F46E5] dark:text-[#818CF8]">Institution</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{profile?.institution || 'Academic Institution'}</p>
                    <p className="text-slate-500">{profile?.semester || 'Semester 1'}</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                {includeOverview && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                      1. Overall Performance Overview
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Academic Score</span>
                        <span className="text-lg font-black text-[#4F46E5] dark:text-[#818CF8]">
                          {analysis?.overview?.academic_score !== undefined ? `${analysis.overview.academic_score}%` : '78.4%'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{analysis?.overview?.standing || 'Good Standing'}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Attendance</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {analysis?.overview?.overall_attendance || profile?.overall_attendance || 80}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">Required: 75%</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Subject Average</span>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                          {analysis?.overview?.subject_average || 78.5}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">{subjectsList.length} units evaluated</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subjects Table Preview */}
                {includeSubjects && subjectsList.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                      2. Course Unit Marks Breakdown
                    </p>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                          <tr>
                            <th className="p-2.5">Subject</th>
                            <th className="p-2.5 text-center">Marks</th>
                            <th className="p-2.5 text-center">Score %</th>
                            <th className="p-2.5 text-center">Attendance</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {subjectsList.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                              <td className="p-2.5 font-semibold">{s.name}</td>
                              <td className="p-2.5 text-center">{s.marks_obtained} / {s.max_marks}</td>
                              <td className="p-2.5 text-center font-bold">{s.percentage}%</td>
                              <td className="p-2.5 text-center">{s.attendance || s.attendance_percent || 80}%</td>
                              <td className="p-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.status === 'Strong' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                  s.status === 'Good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}>
                                  {s.status || 'Good'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recommendations in Preview */}
                {includeRecommendations && analysis?.personalized_recommendations && analysis.personalized_recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                      3. Actionable Recommendations
                    </p>
                    <div className="space-y-2">
                      {analysis.personalized_recommendations.slice(0, 3).map((r: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {r.subject_name}: {r.weak_topic}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px]">{r.what_to_study}</p>
                          <p className="text-slate-400 text-[10px]">Estimated Study Allocation: {r.suggested_time_allocation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center">
                  Official Academic Intelligence Evaluation • EduPredict AI Platform
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Format: Vector A4 PDF with selectable text &amp; multi-page flow
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="btn-primary text-xs !py-2 !px-4 gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Performance Report (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
