import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Layers,
  ShieldCheck,
  User,
  Building,
  Check,
  X,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { EDUCATION_LEVELS, getEducationLevelConfig } from '../data/educationLevels';
import { EducationLevelId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { saveAcademicProfile, fetchAcademicProfile } from '../services/api';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export interface SubjectEntry {
  id: string;
  name: string;
  marks_obtained: number;
  max_marks: number;
  previous_marks?: number;
  internal_marks?: number;
  assignment_marks?: number;
  practical_marks?: number;
  attendance_percent?: number;
  difficult_topics: string[];
  topics_to_improve: string[];
}

export interface ExamEntry {
  id: string;
  subject_name: string;
  exam_date: string;
  priority: 'high' | 'medium' | 'low';
  syllabus_completion_percent: number;
}

const DEFAULT_SUBJECTS: SubjectEntry[] = [
  {
    id: 'sub-1',
    name: 'Data Structures & Algorithms',
    marks_obtained: 64,
    max_marks: 100,
    previous_marks: 60,
    internal_marks: 18,
    assignment_marks: 17,
    practical_marks: 20,
    attendance_percent: 74,
    difficult_topics: ['Binary Trees', 'Dynamic Programming'],
    topics_to_improve: ['Tree Traversals', 'Graph Search']
  },
  {
    id: 'sub-2',
    name: 'Operating Systems',
    marks_obtained: 54,
    max_marks: 100,
    previous_marks: 52,
    internal_marks: 14,
    assignment_marks: 15,
    practical_marks: 16,
    attendance_percent: 68,
    difficult_topics: ['Process Synchronization', 'Deadlocks'],
    topics_to_improve: ['Bankers Algorithm', 'Paging']
  },
  {
    id: 'sub-3',
    name: 'Database Management Systems',
    marks_obtained: 78,
    max_marks: 100,
    previous_marks: 72,
    internal_marks: 22,
    assignment_marks: 24,
    practical_marks: 25,
    attendance_percent: 88,
    difficult_topics: ['Database Normalization'],
    topics_to_improve: ['BCNF Decomposition']
  },
  {
    id: 'sub-4',
    name: 'Computer Networks',
    marks_obtained: 82,
    max_marks: 100,
    previous_marks: 80,
    internal_marks: 26,
    assignment_marks: 25,
    practical_marks: 26,
    attendance_percent: 92,
    difficult_topics: ['Subnetting'],
    topics_to_improve: ['TCP Flow Control']
  }
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Step state: 1 to 5
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1: Personal & Course Details
  const [fullName, setFullName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [educationLevel, setEducationLevel] = useState<EducationLevelId>(
    (user?.education_level as EducationLevelId) || 'btech'
  );
  const activeLevelConfig = useMemo(() => getEducationLevelConfig(educationLevel), [educationLevel]);
  const [departmentBranch, setDepartmentBranch] = useState(
    user?.stream_or_branch || activeLevelConfig.streamOrBranchOptions?.[0] || 'Computer Science & Engineering'
  );
  const [courseDegree, setCourseDegree] = useState(activeLevelConfig.suggestedCourses?.[0] || 'B.Tech in Computer Science');
  const [academicYear, setAcademicYear] = useState('Year 2');
  const [semester, setSemester] = useState('Semester 4');
  const [gradingSystem, setGradingSystem] = useState<'percentage' | 'gpa_10' | 'gpa_4' | 'letter'>('percentage');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // STEP 2: Subjects & Academic Results
  const [subjects, setSubjects] = useState<SubjectEntry[]>(DEFAULT_SUBJECTS);
  const [previousSemesterCgpa, setPreviousSemesterCgpa] = useState<number>(7.2);

  // STEP 3: Assessment & Attendance
  const [overallAttendance, setOverallAttendance] = useState<number>(78);
  const [internalAvg, setInternalAvg] = useState<number>(20);
  const [assignmentAvg, setAssignmentAvg] = useState<number>(22);
  const [practicalAvg, setPracticalAvg] = useState<number>(24);
  const [weekdayStudyHours, setWeekdayStudyHours] = useState<number>(3.5);
  const [weekendStudyHours, setWeekendStudyHours] = useState<number>(5.5);

  // STEP 4: Upcoming Exams & Learning Goals
  const [upcomingExams, setUpcomingExams] = useState<ExamEntry[]>([
    {
      id: 'ex-1',
      subject_name: 'Operating Systems',
      exam_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      priority: 'high',
      syllabus_completion_percent: 50
    },
    {
      id: 'ex-2',
      subject_name: 'Data Structures & Algorithms',
      exam_date: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
      priority: 'high',
      syllabus_completion_percent: 65
    }
  ]);
  const [weakTopicsList, setWeakTopicsList] = useState<string[]>([
    'Binary Trees',
    'Process Synchronization',
    'Database Normalization'
  ]);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [targetGoal, setTargetGoal] = useState('Improve overall semester score from 68% to 80%+');

  // Preload existing profile if available
  useEffect(() => {
    let isMounted = true;
    async function loadExisting() {
      try {
        const res = await fetchAcademicProfile();
        if (res?.profile && isMounted) {
          const p = res.profile;
          if (p.full_name) setFullName(p.full_name);
          if (p.institution) setInstitution(p.institution);
          if (p.department_branch) setDepartmentBranch(p.department_branch);
          if (p.course_degree) setCourseDegree(p.course_degree);
          if (p.academic_year) setAcademicYear(p.academic_year);
          if (p.semester) setSemester(p.semester);
          if (p.grading_system) setGradingSystem(p.grading_system);
          if (p.preferred_language) setPreferredLanguage(p.preferred_language);
          if (Array.isArray(p.subjects) && p.subjects.length > 0) {
            setSubjects(p.subjects);
          }
          if (p.overall_attendance) setOverallAttendance(p.overall_attendance);
          if (p.daily_study_hours_weekday) setWeekdayStudyHours(p.daily_study_hours_weekday);
          if (p.daily_study_hours_weekend) setWeekendStudyHours(p.daily_study_hours_weekend);
          if (Array.isArray(p.upcoming_exams) && p.upcoming_exams.length > 0) {
            setUpcomingExams(p.upcoming_exams);
          }
          if (Array.isArray(p.weak_topics) && p.weak_topics.length > 0) {
            setWeakTopicsList(p.weak_topics);
          }
        }
      } catch {
        // default state remains
      }
    }
    if (isOpen) {
      loadExisting();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation before advancing
  const handleNextStep = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!fullName.trim()) {
        setValidationError('Please enter your full name.');
        return;
      }
      if (!courseDegree.trim()) {
        setValidationError('Please specify your course or degree.');
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (subjects.length === 0) {
        setValidationError('Please add at least one subject to analyze.');
        return;
      }
      for (let i = 0; i < subjects.length; i++) {
        const sub = subjects[i];
        if (!sub.name.trim()) {
          setValidationError(`Subject #${i + 1} needs a valid name.`);
          return;
        }
        if (sub.max_marks <= 0 || isNaN(sub.max_marks)) {
          setValidationError(`Subject "${sub.name}" max marks must be greater than 0.`);
          return;
        }
        if (sub.marks_obtained < 0 || isNaN(sub.marks_obtained)) {
          setValidationError(`Subject "${sub.name}" marks obtained cannot be negative.`);
          return;
        }
        if (sub.marks_obtained > sub.max_marks) {
          setValidationError(
            `Subject "${sub.name}" marks obtained (${sub.marks_obtained}) exceeds max marks (${sub.max_marks}). Please correct it.`
          );
          return;
        }
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (overallAttendance < 0 || overallAttendance > 100) {
        setValidationError('Attendance percentage must be between 0 and 100%.');
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      for (const ex of upcomingExams) {
        if (!ex.subject_name.trim()) {
          setValidationError('Please specify subject names for all upcoming exams.');
          return;
        }
        if (!ex.exam_date) {
          setValidationError(`Please pick a valid date for ${ex.subject_name}.`);
          return;
        }
      }
      setCurrentStep(5);
      return;
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  // Add Subject handler
  const handleAddSubject = () => {
    setSubjects((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: 'New Academic Subject',
        marks_obtained: 65,
        max_marks: 100,
        previous_marks: 60,
        internal_marks: 20,
        assignment_marks: 20,
        practical_marks: 20,
        attendance_percent: 80,
        difficult_topics: [],
        topics_to_improve: []
      }
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) {
      setValidationError('You must retain at least one subject.');
      return;
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSubject = (id: string, field: keyof SubjectEntry, value: any) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Add Exam handler
  const handleAddExam = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14);
    setUpcomingExams((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}`,
        subject_name: subjects[0]?.name || 'Final Semester Exam',
        exam_date: nextDate.toISOString().slice(0, 10),
        priority: 'high',
        syllabus_completion_percent: 50
      }
    ]);
  };

  const handleRemoveExam = (id: string) => {
    setUpcomingExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Weak topic chips
  const handleAddWeakTopic = () => {
    if (newTopicInput.trim() && !weakTopicsList.includes(newTopicInput.trim())) {
      setWeakTopicsList((prev) => [...prev, newTopicInput.trim()]);
      setNewTopicInput('');
    }
  };

  const handleRemoveWeakTopic = (topic: string) => {
    setWeakTopicsList((prev) => prev.filter((t) => t !== topic));
  };

  // Final Confirmation & Submission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const formattedSubjects = subjects.map((sub, idx) => {
        const maxM = Number(sub.max_marks) || 100;
        const obtM = Number(sub.marks_obtained) || 0;
        const pct = Number(((obtM / maxM) * 100).toFixed(1));
        return {
          id: sub.id || `sub-${idx}`,
          name: sub.name.trim(),
          marks_obtained: obtM,
          max_marks: maxM,
          percentage: pct,
          previous_marks: sub.previous_marks,
          internal_marks: sub.internal_marks ?? internalAvg,
          assignment_marks: sub.assignment_marks ?? assignmentAvg,
          practical_marks: sub.practical_marks ?? practicalAvg,
          attendance_percent: sub.attendance_percent ?? overallAttendance,
          difficult_topics: sub.difficult_topics || [],
          topics_to_improve: sub.topics_to_improve || []
        };
      });

      const profilePayload = {
        full_name: fullName.trim(),
        institution: institution.trim(),
        course_degree: courseDegree.trim(),
        department_branch: departmentBranch.trim(),
        academic_year: academicYear.trim(),
        semester: semester.trim(),
        grading_system: gradingSystem,
        preferred_language: preferredLanguage,
        subjects: formattedSubjects,
        overall_attendance: Number(overallAttendance),
        daily_study_hours_weekday: Number(weekdayStudyHours),
        daily_study_hours_weekend: Number(weekendStudyHours),
        upcoming_exams: upcomingExams.map((ex) => ({
          ...ex,
          syllabus_completion_percent: Number(ex.syllabus_completion_percent)
        })),
        weak_topics: weakTopicsList,
        target_goals: [targetGoal],
        onboarding_completed: true
      };

      // 1. Save to Academic Profile API
      await saveAcademicProfile(profilePayload);

      // 2. Update user auth context
      await updateProfile({
        name: fullName.trim(),
        institution: institution.trim(),
        education_level: educationLevel,
        stream_or_branch: departmentBranch.trim()
      });

      // 3. Move directly to Academic Analysis
      onComplete();
    } catch (err: any) {
      console.error('Failed to submit onboarding academic profile:', err);
      setValidationError(err?.message || 'Failed to save profile. Please check your connection and values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS_NAV = [
    { num: 1, title: 'Personal & Course', desc: 'Degree & institution' },
    { num: 2, title: 'Subjects & Results', desc: 'Marks & grading' },
    { num: 3, title: 'Assessments & Attendance', desc: 'Internal & practical' },
    { num: 4, title: 'Exams & Learning Focus', desc: 'Timelines & goals' },
    { num: 5, title: 'Review & Confirm', desc: 'Verify & activate' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div
        className={`w-full max-w-4xl my-auto rounded-3xl border shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
            : 'bg-[#111827] border-slate-800 text-slate-100 shadow-black/90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Banner */}
        <div
          className={`p-4 sm:p-5 border-b relative flex items-center justify-between shrink-0 ${
            isLight
              ? 'bg-slate-50/90 border-slate-200'
              : 'bg-[#161F33] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md bg-[#0B132B] flex items-center justify-center border border-teal-500/40 shrink-0">
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Student Registration & Academic Profile
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                  Step {currentStep} of 5
                </span>
              </div>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Enter your academic details once to unlock personalized intelligence, weak topic diagnosis, and your exam trajectory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        <div className={`px-4 sm:px-6 py-3 border-b shrink-0 ${isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <div className="grid grid-cols-5 gap-2">
            {STEPS_NAV.map((s) => {
              const isActive = s.num === currentStep;
              const isDone = s.num < currentStep;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (isDone) setCurrentStep(s.num as any);
                  }}
                  disabled={!isDone && !isActive}
                  className={`text-left group transition p-1.5 rounded-xl border flex flex-col min-w-0 ${
                    isActive
                      ? isLight
                        ? 'bg-white border-purple-500 text-purple-700 shadow-xs'
                        : 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-xs'
                      : isDone
                      ? isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:border-slate-600'
                      : 'opacity-40 border-transparent cursor-not-allowed text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s.num}
                      </span>
                    )}
                    <span className="truncate hidden sm:inline">{s.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate hidden md:inline pl-5.5">
                    {s.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Step Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar text-xs">
          {/* STEP 1: Personal & Course Details */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b pb-3 mb-4 border-slate-200 dark:border-slate-800">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                  Step 1: Personal Details & Educational Context
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Only necessary academic information is requested to calibrate your syllabus, grading model, and improvement targets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shashi Kumar"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Academic Institution / University
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Marwadi University / National Institute of Tech"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Education Level / Framework <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => {
                      const newLvl = e.target.value as EducationLevelId;
                      setEducationLevel(newLvl);
                      const cfg = getEducationLevelConfig(newLvl);
                      if (cfg.suggestedCourses?.[0]) setCourseDegree(cfg.suggestedCourses[0]);
                      if (cfg.streamOrBranchOptions?.[0]) setDepartmentBranch(cfg.streamOrBranchOptions[0]);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400'
                    }`}
                  >
                    {EDUCATION_LEVELS.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.label} ({lvl.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Current Course or Degree <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={courseDegree}
                    onChange={(e) => setCourseDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science & Engineering"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Department or Branch
                  </label>
                  <input
                    type="text"
                    value={departmentBranch}
                    onChange={(e) => setDepartmentBranch(e.target.value)}
                    placeholder="e.g. Department of Computer Engineering"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Academic Year
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-[#161F33] border-slate-700 text-white'
                      }`}
                    >
                      <option value="Year 1">Year 1 (Freshman)</option>
                      <option value="Year 2">Year 2 (Sophomore)</option>
                      <option value="Year 3">Year 3 (Junior)</option>
                      <option value="Year 4">Year 4 (Senior)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Semester / Term
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-[#161F33] border-slate-700 text-white'
                      }`}
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Academic Grading System
                  </label>
                  <select
                    value={gradingSystem}
                    onChange={(e) => setGradingSystem(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400'
                    }`}
                  >
                    <option value="percentage">Percentage (0% – 100%)</option>
                    <option value="gpa_10">10-Point CGPA Scale (e.g. 8.5 / 10)</option>
                    <option value="gpa_4">4.0 GPA Scale (US / International)</option>
                    <option value="letter">Letter Grades (A+, A, B, C, F)</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Preferred Study Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400'
                    }`}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Subjects & Academic Results */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                    Step 2: Subjects & Academic Results
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Add the subjects you are enrolled in. Marks are automatically validated against max values.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subject</span>
                </button>
              </div>

              {/* Previous semester benchmark */}
              <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isLight ? 'bg-purple-50/60 border-purple-200 text-purple-950' : 'bg-purple-950/20 border-purple-800/60 text-purple-200'
              }`}>
                <div>
                  <span className="font-bold text-xs block">Previous Semester Performance (Benchmark)</span>
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Used by the machine-learning pipeline to compute semester-over-semester momentum.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Previous CGPA / Marks:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={previousSemesterCgpa}
                    onChange={(e) => setPreviousSemesterCgpa(parseFloat(e.target.value) || 0)}
                    className={`w-20 px-2.5 py-1.5 rounded-lg border font-bold text-center text-xs ${
                      isLight ? 'bg-white border-purple-300 text-slate-900' : 'bg-[#161F33] border-purple-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Subjects List */}
              <div className="space-y-3">
                {subjects.map((sub, idx) => {
                  const percentage = sub.max_marks > 0 ? ((sub.marks_obtained / sub.max_marks) * 100).toFixed(1) : '0';
                  const isExceeding = sub.marks_obtained > sub.max_marks;
                  return (
                    <div
                      key={sub.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition ${
                        isExceeding
                          ? 'border-red-500 bg-red-500/5'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 hover:border-purple-300'
                          : 'bg-[#161F33] border-slate-800 hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="font-black text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400">
                          Subject #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                              isExceeding
                                ? 'bg-red-500/20 text-red-600 border-red-500/40'
                                : Number(percentage) >= 75
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : Number(percentage) >= 60
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {percentage}%
                          </span>
                          {subjects.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(sub.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-lg transition cursor-pointer"
                              title="Remove Subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Subject Name
                          </label>
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => handleUpdateSubject(sub.id, 'name', e.target.value)}
                            placeholder="e.g. Applied Mathematics"
                            className={`w-full px-3 py-2 rounded-xl border font-medium text-xs ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Marks Obtained
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={sub.max_marks}
                            value={sub.marks_obtained}
                            onChange={(e) => handleUpdateSubject(sub.id, 'marks_obtained', parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2 rounded-xl border font-bold text-xs ${
                              isExceeding
                                ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                                : isLight
                                ? 'bg-white border-slate-300 text-slate-900'
                                : 'bg-[#111827] border-slate-700 text-white'
                            }`}
                          />
                          {isExceeding && (
                            <span className="text-[10px] text-red-500 font-bold block mt-0.5">
                              Cannot exceed max marks!
                            </span>
                          )}
                        </div>

                        <div>
                          <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Max Marks
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={sub.max_marks}
                            onChange={(e) => handleUpdateSubject(sub.id, 'max_marks', parseFloat(e.target.value) || 100)}
                            className={`w-full px-3 py-2 rounded-xl border font-bold text-xs ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Assessment & Attendance */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b pb-3 mb-4 border-slate-200 dark:border-slate-800">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                  Step 3: Internal Assessment & Attendance Information
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Continuous internal assessments and attendance are strong early predictors of examination risk.
                </p>
              </div>

              {/* Attendance Slider & Warning */}
              <div
                className={`p-4 rounded-2xl border ${
                  overallAttendance < 75
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                    : isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-[#161F33] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Overall Attendance Record</span>
                    {overallAttendance < 75 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-white">
                        Below 75% Threshold
                      </span>
                    )}
                  </div>
                  <span className="font-black text-sm text-teal-600 dark:text-teal-400">
                    {overallAttendance}%
                  </span>
                </div>

                <input
                  type="range"
                  min="30"
                  max="100"
                  value={overallAttendance}
                  onChange={(e) => setOverallAttendance(parseInt(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                  <span>30% (Critical Detention)</span>
                  <span>75% (University Norm)</span>
                  <span>100% (Perfect)</span>
                </div>

                {overallAttendance < 75 && (
                  <p className="text-[11px] mt-2 font-medium text-amber-700 dark:text-amber-300">
                    ⚠️ Note: Institutional guidelines typically mandate at least 75% attendance. EduPredict AI will incorporate targeted attendance alerts in your action plan.
                  </p>
                )}
              </div>

              {/* Continuous Assessment Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Internal Assessment Marks (avg)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={internalAvg}
                      onChange={(e) => setInternalAvg(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-xl border font-bold text-xs ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                      }`}
                    />
                    <span className="text-slate-500 font-bold">/30</span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assignment Score (avg)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={assignmentAvg}
                      onChange={(e) => setAssignmentAvg(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-xl border font-bold text-xs ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                      }`}
                    />
                    <span className="text-slate-500 font-bold">/30</span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Practical / Lab Marks (avg)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={practicalAvg}
                      onChange={(e) => setPracticalAvg(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-xl border font-bold text-xs ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                      }`}
                    />
                    <span className="text-slate-500 font-bold">/30</span>
                  </div>
                </div>
              </div>

              {/* Study Availability */}
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                <h4 className="font-bold text-xs mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Available Study Time (Self-Study Hours)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Weekday Study Hours / Day:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{weekdayStudyHours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="0.5"
                      value={weekdayStudyHours}
                      onChange={(e) => setWeekdayStudyHours(parseFloat(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Weekend Study Hours / Day:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{weekendStudyHours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="0.5"
                      value={weekendStudyHours}
                      onChange={(e) => setWeekendStudyHours(parseFloat(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Upcoming Exams & Learning Goals */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b pb-3 mb-4 border-slate-200 dark:border-slate-800">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                  Step 4: Upcoming Examinations & Learning Goals
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Record examination dates and areas of difficulty so the Exam Scheduler and Learn & Practice modules focus on your most urgent deadlines.
                </p>
              </div>

              {/* Upcoming Exams Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Upcoming Examination Timelines</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddExam}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-500/30 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Examination</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {upcomingExams.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#161F33] border-slate-800'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Subject</label>
                          <select
                            value={ex.subject_name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUpcomingExams((prev) =>
                                prev.map((item) => (item.id === ex.id ? { ...item, subject_name: val } : item))
                              );
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg border font-semibold text-xs ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                            }`}
                          >
                            {subjects.map((sub) => (
                              <option key={sub.id} value={sub.name}>
                                {sub.name}
                              </option>
                            ))}
                            <option value="Final Comprehensive Exam">Final Comprehensive Exam</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Exam Date</label>
                          <input
                            type="date"
                            value={ex.exam_date}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUpcomingExams((prev) =>
                                prev.map((item) => (item.id === ex.id ? { ...item, exam_date: val } : item))
                              );
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg border font-medium text-xs ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Priority</label>
                          <select
                            value={ex.priority}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setUpcomingExams((prev) =>
                                prev.map((item) => (item.id === ex.id ? { ...item, priority: val } : item))
                              );
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg border font-semibold text-xs ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                            }`}
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExam(ex.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg transition self-end sm:self-center cursor-pointer"
                        title="Remove exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Topics Chips */}
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                <label className={`block font-bold text-xs mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Topics You Find Difficult (Weak Topics)
                </label>
                <p className={`text-[11px] mb-2.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  EduPredict AI will generate targeted theory summaries and diagnostic quizzes for these concepts.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {weakTopicsList.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWeakTopic(t)}
                        className="hover:text-red-500 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddWeakTopic();
                      }
                    }}
                    placeholder="e.g. Dynamic Programming, Normalization, Fourier Transforms"
                    className={`flex-1 px-3 py-2 rounded-xl border font-medium text-xs ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddWeakTopic}
                    className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition cursor-pointer"
                  >
                    Add Topic
                  </button>
                </div>
              </div>

              {/* Learning Goal Target */}
              <div>
                <label className={`block font-bold text-xs mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Primary Academic Target or Goal
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. Raise overall grade from 68% to 80% and secure A in Algorithms"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161F33] border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b pb-3 mb-4 border-slate-200 dark:border-slate-800">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-teal-700' : 'text-teal-400'}`}>
                  Step 5: Review & Confirm Profile
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Please review your details before activation. You can jump back to any step to make updates, and you can edit your profile at any time in the future.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Personal Context */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Personal & Course
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                    >
                      Edit Step 1
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500">Student Name:</span>{' '}
                      <span className="font-bold">{fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Institution:</span>{' '}
                      <span className="font-semibold">{institution || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Degree:</span>{' '}
                      <span className="font-semibold">{courseDegree}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Department:</span>{' '}
                      <span className="font-semibold">{departmentBranch}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Standing:</span>{' '}
                      <span className="font-semibold">{academicYear} • {semester}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Attendance & Assessments */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Attendance & Assessments
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                    >
                      Edit Step 3
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500">Attendance:</span>{' '}
                      <span className={`font-bold ${overallAttendance < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {overallAttendance}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Internal Marks:</span>{' '}
                      <span className="font-semibold">{internalAvg} / 30</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Study Availability:</span>{' '}
                      <span className="font-semibold">{weekdayStudyHours} hrs/day (weekday) • {weekendStudyHours} hrs/day (wknd)</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Benchmark CGPA:</span>{' '}
                      <span className="font-semibold">{previousSemesterCgpa}</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Subjects & Marks */}
                <div className={`sm:col-span-2 p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Academic Subjects ({subjects.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                    >
                      Edit Step 2
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {subjects.map((s) => {
                      const pct = s.max_marks > 0 ? ((s.marks_obtained / s.max_marks) * 100).toFixed(0) : '0';
                      return (
                        <div
                          key={s.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-700'
                          }`}
                        >
                          <p className="font-bold truncate text-[11px]">{s.name}</p>
                          <div className="flex justify-between items-center mt-1 text-[11px]">
                            <span className="text-slate-500">{s.marks_obtained}/{s.max_marks}</span>
                            <span className="font-extrabold text-teal-600 dark:text-teal-400">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card 4: Upcoming Exams & Target */}
                <div className={`sm:col-span-2 p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161F33] border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Upcoming Exams & Focus Topics
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                    >
                      Edit Step 4
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                    <span className="font-semibold text-slate-500">Exams Scheduled:</span>
                    {upcomingExams.map((ex) => (
                      <span key={ex.id} className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20">
                        {ex.subject_name} ({ex.exam_date})
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-500">Focus Areas:</span>
                    {weakTopicsList.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          className={`p-4 sm:p-5 border-t shrink-0 flex items-center justify-between gap-3 ${
            isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-[#161F33] border-slate-800'
          }`}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
              }`}
            >
              Cancel
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activating Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Profile & Launch Academic Analysis</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
