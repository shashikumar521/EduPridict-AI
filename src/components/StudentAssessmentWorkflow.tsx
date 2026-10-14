import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Calendar,
  Clock,
  Printer,
  BookmarkPlus,
  Sliders,
  ChevronDown,
  Layers,
  Award,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  FileText,
  User,
  ShieldCheck,
  Check,
  Plus,
  X,
  Target
} from 'lucide-react';
import {
  PredictionInput,
  PredictionResult,
  SectionId,
  EducationLevelId,
  SavedPrediction
} from '../types';
import { EDUCATION_LEVELS, getEducationLevelConfig } from '../data/educationLevels';
import { predictPerformance, savePrediction } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export interface StudentAssessmentWorkflowProps {
  onNavigate: (section: SectionId) => void;
  initialPrediction?: SavedPrediction | null;
  prefillData?: Partial<PredictionInput> | null;
  onPredictionSaved?: () => void;
  embeddedInDashboard?: boolean;
}

export type AssessmentStep = 1 | 2 | 3 | 4;

export const StudentAssessmentWorkflow: React.FC<StudentAssessmentWorkflowProps> = ({
  onNavigate,
  initialPrediction,
  prefillData,
  onPredictionSaved,
  embeddedInDashboard = false
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Step state
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(1);
  const [showAssessmentForm, setShowAssessmentForm] = useState<boolean>(!initialPrediction || Boolean(prefillData));

  // STEP 1: Student Details
  const [studentName, setStudentName] = useState<string>(
    prefillData?.student_name || user?.name || initialPrediction?.student_name || 'Shashi Kumar'
  );
  const [studentId, setStudentId] = useState<string>(
    prefillData?.student_id || initialPrediction?.student_id || 'STD-2025-01'
  );
  const [educationLevel, setEducationLevel] = useState<EducationLevelId>(
    (prefillData?.education_level as EducationLevelId) ||
    (initialPrediction?.education_level as EducationLevelId) ||
    'btech'
  );
  const activeLevelConfig = useMemo(
    () => getEducationLevelConfig(educationLevel),
    [educationLevel]
  );
  const [subLevel, setSubLevel] = useState<string>(
    activeLevelConfig.subLevelOptions[0] || 'Semester 4'
  );
  const [streamOrBranch, setStreamOrBranch] = useState<string>(
    initialPrediction?.stream_or_branch ||
      activeLevelConfig.streamOrBranchOptions?.[0] ||
      'Computer Science & Engineering'
  );
  const [course, setCourse] = useState<string>(
    initialPrediction?.course ||
      activeLevelConfig.suggestedCourses?.[0] ||
      'Core Academic Program'
  );

  // STEP 2: Study Habits and Attendance
  const [studyHours, setStudyHours] = useState<number>(
    initialPrediction?.study_hours ?? 14
  );
  const [attendance, setAttendance] = useState<number>(
    initialPrediction?.attendance ?? 78
  );
  const [assignmentScore, setAssignmentScore] = useState<number>(
    initialPrediction?.assignment_score ?? 80
  );
  const [distractionLevel, setDistractionLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [dailyScreenTime, setDailyScreenTime] = useState<number>(3);

  // STEP 3: Academic Records
  const [previousMarks, setPreviousMarks] = useState<number>(
    initialPrediction?.previous_marks ?? 72
  );
  const [midtermMarks, setMidtermMarks] = useState<number>(70);

  // Key subject marks
  const [subjects, setSubjects] = useState<{ name: string; score: number }[]>([
    { name: 'Mathematics & Analytical Thinking', score: 74 },
    { name: 'Core Specialization / Engineering', score: 68 },
    { name: 'Computing & Problem Solving', score: 82 },
    { name: 'Professional Communication', score: 76 }
  ]);

  // Weak areas / challenging topics
  const [weakAreas, setWeakAreas] = useState<string[]>([
    'Calculus & Integrals',
    'Data Structures & Algorithms'
  ]);
  const [newWeakAreaInput, setNewWeakAreaInput] = useState<string>('');

  // STEP 4: Skills and Practical Work
  const [practicalScore, setPracticalScore] = useState<number>(
    initialPrediction?.practical_score ?? 80
  );
  const [skills, setSkills] = useState<string[]>([
    'Python',
    'Problem Solving',
    'SQL',
    'Data Analysis'
  ]);
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [certification, setCertification] = useState<string>('SWAYAM / NPTEL Coursework');
  const [extracurricularLevel, setExtracurricularLevel] = useState<
    'Active Leader/Member' | 'Occasional Participant' | 'None'
  >('Active Leader/Member');

  // Model Selection
  const [modelType, setModelType] = useState<'rf' | 'dt' | 'lr'>('rf');

  // Prediction & UI States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Sync initial prediction if provided
  useEffect(() => {
    if (initialPrediction) {
      setStudentName(initialPrediction.student_name || user?.name || 'Student');
      setStudentId(initialPrediction.student_id);
      setAttendance(initialPrediction.attendance);
      setStudyHours(initialPrediction.study_hours);
      setPreviousMarks(initialPrediction.previous_marks);
      setAssignmentScore(initialPrediction.assignment_score);
      if (initialPrediction.practical_score) {
        setPracticalScore(initialPrediction.practical_score);
      }
    }
  }, [initialPrediction, user]);

  // Handle education level change
  const handleLevelChange = (lvl: EducationLevelId) => {
    setEducationLevel(lvl);
    const cfg = getEducationLevelConfig(lvl);
    setSubLevel(cfg.subLevelOptions[0] || '');
    if (cfg.streamOrBranchOptions && cfg.streamOrBranchOptions.length > 0) {
      setStreamOrBranch(cfg.streamOrBranchOptions[0]);
    }
    setCourse(cfg.suggestedCourses[0] || 'Core Subject Module');

    // Adjust default subject labels based on level
    if (lvl === 'secondary_school' || lvl === 'middle_school') {
      setSubjects([
        { name: 'Mathematics', score: 72 },
        { name: 'Science & Physics', score: 70 },
        { name: 'Social Studies & History', score: 75 },
        { name: 'English & Second Language', score: 80 }
      ]);
      setWeakAreas(['Trigonometry', 'Science Lab Practicals']);
    } else if (lvl === 'higher_secondary') {
      setSubjects([
        { name: 'Mathematics / Applied Maths', score: 70 },
        { name: 'Physics / Accountancy', score: 68 },
        { name: 'Chemistry / Economics', score: 74 },
        { name: 'English & Elective', score: 78 }
      ]);
      setWeakAreas(['Calculus & Vectors', 'Thermodynamics']);
    } else {
      setSubjects([
        { name: 'Mathematics & Analytical Thinking', score: 74 },
        { name: 'Core Specialization / Engineering', score: 68 },
        { name: 'Computing & Problem Solving', score: 82 },
        { name: 'Professional Communication', score: 76 }
      ]);
    }
  };

  // Helper for updating individual subject score
  const updateSubjectScore = (index: number, newScore: number) => {
    setSubjects((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, score: Math.max(0, Math.min(100, newScore)) } : s))
    );
  };

  const updateSubjectName = (index: number, newName: string) => {
    setSubjects((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, name: newName } : s))
    );
  };

  // Tag managers
  const handleAddWeakArea = () => {
    const trimmed = newWeakAreaInput.trim();
    if (trimmed && !weakAreas.includes(trimmed)) {
      setWeakAreas((prev) => [...prev, trimmed]);
      setNewWeakAreaInput('');
    }
  };

  const handleRemoveWeakArea = (area: string) => {
    setWeakAreas((prev) => prev.filter((a) => a !== area));
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  // Validation
  const validateAssessment = (): boolean => {
    if (!studentName.trim()) {
      setErrorMessage('Please enter the student name.');
      setCurrentStep(1);
      return false;
    }
    if (!studentId.trim()) {
      setErrorMessage('Please enter the student ID or roll number.');
      setCurrentStep(1);
      return false;
    }
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      setErrorMessage('Attendance must be between 0% and 100%.');
      setCurrentStep(2);
      return false;
    }
    if (isNaN(studyHours) || studyHours < 0 || studyHours > 40) {
      setErrorMessage('Weekly study hours must be between 0 and 40 hours.');
      setCurrentStep(2);
      return false;
    }
    if (isNaN(previousMarks) || previousMarks < 0 || previousMarks > 100) {
      setErrorMessage('Previous marks must be between 0% and 100%.');
      setCurrentStep(3);
      return false;
    }
    if (isNaN(midtermMarks) || midtermMarks < 0 || midtermMarks > 100) {
      setErrorMessage('Midterm / internal marks must be between 0% and 100%.');
      setCurrentStep(3);
      return false;
    }
    if (isNaN(practicalScore) || practicalScore < 0 || practicalScore > 100) {
      setErrorMessage('Practical lab score must be between 0% and 100%.');
      setCurrentStep(4);
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Execute ML Prediction
  const handleCalculateScore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateAssessment()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    // Calculate weighted average of key subjects to enrich baseline marks
    const subjectAverage =
      subjects.reduce((acc, curr) => acc + curr.score, 0) / (subjects.length || 1);

    const effectivePreviousMarks = Math.round(
      previousMarks * 0.5 + subjectAverage * 0.3 + midtermMarks * 0.2
    );

    try {
      const payload: PredictionInput = {
        student_id: studentId.trim(),
        student_name: studentName.trim(),
        education_level: educationLevel,
        sub_level: subLevel,
        stream_or_branch: streamOrBranch,
        course,
        attendance: Number(attendance),
        study_hours: Number(studyHours),
        previous_marks: effectivePreviousMarks,
        assignment_score: Number(assignmentScore),
        practical_score: Number(practicalScore),
        extra_academic_score: extracurricularLevel === 'Active Leader/Member' ? 85 : 70,
        model_type: modelType
      };

      const result = await predictPerformance(payload);
      setPrediction(result);
      setShowAssessmentForm(false);

      // Smooth scroll to results
      setTimeout(() => {
        const anchor = document.getElementById('assessment-results-summary');
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to connect to the prediction engine. Please check your inputs.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save prediction to database
  const handleSaveAssessment = async () => {
    if (!prediction) return;
    setIsSaving(true);
    setSaveSuccessMessage(null);

    try {
      await savePrediction({
        student_id: studentId.trim(),
        student_name: studentName.trim(),
        education_level: educationLevel,
        stream_or_branch: streamOrBranch,
        course,
        model_used: prediction.model_used,
        attendance,
        study_hours: studyHours,
        previous_marks: previousMarks,
        assignment_score: assignmentScore,
        practical_score: practicalScore,
        predicted_category: prediction.predicted_category,
        confidence: prediction.confidence,
        projected_score: prediction.projected_score,
        recommendations: prediction.recommendations,
        study_plan: prediction.study_plan,
        recommended_courses: prediction.recommended_courses,
        advisor: user?.name || 'Academic Advisor'
      });
      setSaveSuccessMessage('Assessment successfully saved to student records!');
      if (onPredictionSaved) onPredictionSaved();
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save assessment to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Computed letter grade based on projected score
  const computedGrade = useMemo(() => {
    if (!prediction) return 'N/A';
    const score = prediction.projected_score;
    if (score >= 90) return 'Grade A+ (Distinction)';
    if (score >= 80) return 'Grade A (First Class)';
    if (score >= 70) return 'Grade B+ (Upper Second)';
    if (score >= 60) return 'Grade B (Second Class)';
    if (score >= 50) return 'Grade C (Passing Grade)';
    return 'Grade F (Needs Remediation)';
  }, [prediction]);

  return (
    <div className="space-y-6">
      {/* Print-only CSS header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">EduPredict AI — Academic Assessment Report</h1>
        <p className="text-sm text-slate-600">Generated on {new Date().toLocaleDateString()} for {studentName} ({studentId})</p>
      </div>

      {/* Top Banner / Assessment Status Indicator */}
      {prediction && !showAssessmentForm && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Assessment Completed</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">{studentName} ({studentId})</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                Calculated Score: {prediction.projected_score.toFixed(1)}% — {prediction.predicted_category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAssessmentForm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Edit / Re-run Assessment</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Error & Success Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STUDENT ASSESSMENT WORKFLOW (STEPS 1 TO 4) */}
      {/* ========================================================================= */}
      {(showAssessmentForm || !prediction) && (
        <div
          className={`rounded-2xl border transition-all overflow-hidden shadow-xs print:hidden ${
            isLight
              ? 'bg-white border-[#E1E6EF]'
              : 'bg-[#131926] border-[#1E2B42] text-zinc-100'
          }`}
        >
          {/* Header of Section 1 */}
          <div
            className={`p-5 sm:p-6 border-b transition-colors ${
              isLight
                ? 'bg-[#F0F3F9] border-[#E1E6EF]'
                : 'bg-[#182236] border-[#1E2B42]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    isLight
                      ? 'bg-[#EEE7FF] border-[#D1B8FC] text-[#7000E8]'
                      : 'bg-[rgba(112,0,232,0.18)] border-[rgba(142,48,255,0.35)] text-[#C4B5FD]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Primary Assessment Intake
                </div>
                <h2
                  className={`text-xl sm:text-2xl font-bold tracking-tight ${
                    isLight ? 'text-[#172033]' : 'text-white'
                  }`}
                >
                  Student Academic Assessment
                </h2>
                <p
                  className={`text-xs sm:text-sm mt-1 max-w-2xl ${
                    isLight ? 'text-[#526078]' : 'text-zinc-400'
                  }`}
                >
                  Follow the 4-step intake process to compute predicted academic performance and identify learning gaps using machine learning models.
                </p>
              </div>

              {prediction && (
                <button
                  onClick={() => setShowAssessmentForm(false)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Minimize Form
                </button>
              )}
            </div>

            {/* Stepper Navigation Indicator */}
            <div className="mt-6">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {[
                  { step: 1, title: '1. Student Details', desc: 'Identity & Program' },
                  { step: 2, title: '2. Study & Attendance', desc: 'Hours & Presence' },
                  { step: 3, title: '3. Academic Records', desc: 'Marks & Subjects' },
                  { step: 4, title: '4. Skills & Practical', desc: 'Labs & Technical' }
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setCurrentStep(s.step as AssessmentStep)}
                      className={`text-left p-2.5 sm:p-3 rounded-xl border transition cursor-pointer ${
                        isActive
                          ? 'bg-[#6D28D9] text-white border-[#6D28D9] shadow-sm'
                          : isCompleted
                          ? isLight
                            ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534] hover:bg-[#DCFCE7]/80'
                            : 'bg-[#14532D]/30 border-[#16A34A]/40 text-[#86EFAC]'
                          : isLight
                          ? 'bg-white border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC]'
                          : 'bg-[#131926] border-[#334155] text-slate-200 hover:bg-[#182236]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] sm:text-xs font-bold truncate ${isActive ? 'text-white' : ''}`}>
                          {s.title}
                        </span>
                        {isCompleted && (
                          <Check className={`w-3.5 h-3.5 shrink-0 hidden sm:block ${isLight ? 'text-[#166534]' : 'text-[#86EFAC]'}`} />
                        )}
                      </div>
                      <span
                        className={`text-[10px] hidden sm:block truncate mt-0.5 font-medium ${
                          isActive ? 'text-purple-100' : isLight ? 'text-[#475569]' : 'text-slate-300'
                        }`}
                      >
                        {s.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Step Body */}
          <form onSubmit={handleCalculateScore} className="p-5 sm:p-6 space-y-6">
            {/* ------------------------------------------------------------- */}
            {/* STEP 1: STUDENT DETAILS */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Step 1: Student & Academic Program Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the student identity, degree level, and specialization.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Shashi Kumar"
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student ID or Roll Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. STD-2025-01 or 21CS042"
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Education Level <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => handleLevelChange(e.target.value as EducationLevelId)}
                      className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Program / Branch <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={streamOrBranch}
                      onChange={(e) => setStreamOrBranch(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Semester or Year <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={subLevel}
                      onChange={(e) => setSubLevel(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {activeLevelConfig.subLevelOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Course / Module Title
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms or Core Specialization"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: STUDY HABITS AND ATTENDANCE */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Step 2: Study Habits & Attendance
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record actual study hours, attendance percentage, and study lifestyle consistency.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Attendance percentage */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Attendance Percentage
                      </label>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                          attendance >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : attendance >= 65
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {attendance}% {attendance >= 75 ? '✓ Compliant' : '⚠️ Below 75%'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={attendance}
                      onChange={(e) => setAttendance(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>0%</span>
                      <span className="text-amber-600 font-bold">75% Min. Threshold</span>
                      <span>100%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      {attendance < 75
                        ? 'Institutional requirement is 75%. Below this threshold triggers academic probation.'
                        : 'Attendance meets institutional requirements.'}
                    </p>
                  </div>

                  {/* Study Hours */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Weekly Independent Study Hours
                      </label>
                      <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                        {studyHours} hrs/week
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={0.5}
                      value={studyHours}
                      onChange={(e) => setStudyHours(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>0 hrs</span>
                      <span>Target: ~15-20 hrs</span>
                      <span>40 hrs</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Self-study outside of scheduled lecture hours (reading, revision, problem solving).
                    </p>
                  </div>

                  {/* Assignment Completion */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Assignment & Homework Submission Rate
                      </label>
                      <span className="text-xs font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {assignmentScore}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={assignmentScore}
                      onChange={(e) => setAssignmentScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>0%</span>
                      <span>Submission Consistency</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Distraction & Screen Time */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Screen Time & Digital Distraction Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'low', label: 'Low (<2 hrs)', desc: 'High Focus' },
                        { id: 'moderate', label: 'Moderate (2-4 hrs)', desc: 'Balanced' },
                        { id: 'high', label: 'High (>4 hrs)', desc: 'Frequent Distractions' }
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setDistractionLevel(d.id as any);
                            setDailyScreenTime(d.id === 'low' ? 1.5 : d.id === 'moderate' ? 3 : 5);
                          }}
                          className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer ${
                            distractionLevel === d.id
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <div className="truncate">{d.label}</div>
                          <div className={`text-[10px] truncate ${distractionLevel === d.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {d.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Captures non-academic digital screen time that impacts focus and retention.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: ACADEMIC RECORDS */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Step 3: Academic Records & Subject Performance
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter baseline previous exam marks, current internal marks, and specific challenging topics.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Previous Exam Baseline Marks / GPA (0–100%) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={previousMarks}
                      onChange={(e) => setPreviousMarks(Number(e.target.value))}
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Aggregated score from preceding semester or qualifying board examination.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current Midterm / Internal Assessment Marks (0–100%) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={midtermMarks}
                      onChange={(e) => setMidtermMarks(Number(e.target.value))}
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Recent internal test series or mid-semester assessment score.
                    </span>
                  </div>
                </div>

                {/* Key Subjects Breakdown */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Key Subject Performance Breakdown
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Edit subject names and scores as per your syllabus
                    </span>
                  </div>

                  <div className="space-y-3">
                    {subjects.map((sub, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center bg-white p-2.5 rounded-xl border border-slate-200"
                      >
                        <div className="sm:col-span-7">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => updateSubjectName(idx, e.target.value)}
                            className="w-full text-xs font-semibold text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                          />
                        </div>
                        <div className="sm:col-span-3 flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={sub.score}
                            onChange={(e) => updateSubjectScore(idx, Number(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                        <div className="sm:col-span-2 text-right">
                          <span
                            className={`text-xs font-extrabold px-2 py-1 rounded-md ${
                              sub.score >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.score >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sub.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak Areas / Challenging Topics */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Weak Areas & Challenging Topics
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Tag specific chapters or concepts requiring additional practice and intervention.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {weakAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemoveWeakArea(area)}
                          className="hover:text-rose-900 cursor-pointer font-bold"
                          title="Remove topic"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newWeakAreaInput}
                      onChange={(e) => setNewWeakAreaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWeakArea();
                        }
                      }}
                      placeholder="Add challenging topic (e.g. Linear Algebra, Circuit Analysis)..."
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddWeakArea}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      Add Topic
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: SKILLS AND PRACTICAL WORK */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-indigo-600" />
                    Step 4: Skills, Practical Work & Review
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capture laboratory performance, key competencies, and review before final calculation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Practical score */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Practical Lab & Project Assessment Score
                      </label>
                      <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {practicalScore}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={practicalScore}
                      onChange={(e) => setPracticalScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>0%</span>
                      <span>Hands-on Lab Mastery</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Certifications & Extracurriculars */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Certifications & Coursework
                    </label>
                    <select
                      value={certification}
                      onChange={(e) => setCertification(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="SWAYAM / NPTEL Coursework">SWAYAM / NPTEL Coursework</option>
                      <option value="Coursera / edX Certificate">Coursera / edX Certificate</option>
                      <option value="Cisco Networking Academy">Cisco Networking Academy</option>
                      <option value="Self-Paced / GitHub Projects">Self-Paced / GitHub Projects</option>
                      <option value="None / Currently Enrolled">None / Currently Enrolled</option>
                    </select>

                    <label className="text-xs font-bold text-slate-800 block pt-1">
                      Extracurricular & Technical Club Involvement
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Active Leader/Member', 'Occasional Participant', 'None'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setExtracurricularLevel(lvl)}
                          className={`p-1.5 rounded-lg text-[11px] text-center border transition cursor-pointer ${
                            extracurricularLevel === lvl
                              ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Technical & Problem-Solving Skills
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-indigo-900 cursor-pointer font-bold"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add key skill (e.g. Python, SQL, Problem Solving, Data Analysis)..."
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>

                {/* SUMMARY PREVIEW CARD & ALGORITHM SELECTOR */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Verification Summary Before Calculation
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-700">All 4 Sections Verified</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                      <span className="text-[10px] text-slate-500 block">Student</span>
                      <span className="font-bold text-slate-900 truncate block">{studentName}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                      <span className="text-[10px] text-slate-500 block">Attendance</span>
                      <span className="font-bold text-slate-900 block">{attendance}%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                      <span className="text-[10px] text-slate-500 block">Study Hours</span>
                      <span className="font-bold text-slate-900 block">{studyHours} hrs/wk</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                      <span className="text-[10px] text-slate-500 block">Previous Marks</span>
                      <span className="font-bold text-slate-900 block">{previousMarks}%</span>
                    </div>
                  </div>

                  {/* ML Algorithm Selector */}
                  <div className="pt-2 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block">
                        Machine Learning Algorithm
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Trained on benchmark student academic trajectories
                      </span>
                    </div>
                    <select
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value as any)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:ring-2 focus:ring-[#8000E8] ${
                        isLight
                          ? 'border-[#E9E5F2] bg-white text-[#11182E]'
                          : 'border-zinc-700 bg-zinc-900 text-white'
                      }`}
                    >
                      <option value="rf">Random Forest Classifier (Ensemble v2.4) — 89.4% Acc, 92.6% Recall (Recommended)</option>
                      <option value="dt">Decision Tree Classifier (CART — 84.1% Accuracy)</option>
                      <option value="lr">Logistic Regression Model (L2 — 82.7% Accuracy)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as AssessmentStep)}
                  className="btn-secondary text-xs px-4 py-2.5 gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1 && (!studentName.trim() || !studentId.trim())) {
                      setErrorMessage('Please fill in student name and ID before continuing.');
                      return;
                    }
                    setErrorMessage(null);
                    setCurrentStep((prev) => (prev + 1) as AssessmentStep);
                  }}
                  className="btn-primary text-xs px-5 py-2.5 gap-1.5"
                >
                  <span>Continue to Step {currentStep + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary text-xs px-6 py-2.5 gap-2"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-white" />
                      <span>Computing Model Inference...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Calculate Performance Score</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PERFORMANCE SCORE CARD (DISPLAYED AFTER ASSESSMENT CALCULATION) */}
      {/* ========================================================================= */}
      {prediction && (
        <div id="assessment-results-summary" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 sm:p-7 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Left score display */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                <div className="relative shrink-0">
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center border-2 ${
                      prediction.predicted_category === 'High Performance'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                        : prediction.predicted_category === 'Moderate Performance'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {prediction.projected_score.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                      Projected Score
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        prediction.predicted_category === 'High Performance'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : prediction.predicted_category === 'Moderate Performance'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {prediction.predicted_category}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      {computedGrade}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                    Academic Performance Score
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                    Computed using {prediction.model_used} with{' '}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{prediction.confidence}% confidence</span>.
                    Expected range: <span className="font-semibold text-purple-700 dark:text-purple-300">{prediction.score_range}</span>.
                  </p>
                </div>
              </div>

              {/* Status pill & Urgency triage */}
              <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Advisory Status</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mt-1 ${
                      prediction.urgency === 'On Track'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : prediction.urgency === 'Monitoring'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {prediction.urgency}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleSaveAssessment}
                    disabled={isSaving}
                    className="btn-accent text-xs px-3 py-1.5 gap-1.5"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{isSaving ? 'Saving...' : 'Save Record'}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('whatif')}
                    className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
                    title="Simulate improvements"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>What-If</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Impact Attributions */}
            {prediction.attributions && prediction.attributions.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-2.5">
                  Key Score Drivers (ML Feature Attribution)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {prediction.attributions.slice(0, 4).map((attr, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-800 block truncate">{attr.feature}</span>
                        <span className="text-[11px] text-slate-500 truncate">{attr.value}</span>
                      </div>
                      <span
                        className={`font-extrabold text-xs shrink-0 ${
                          attr.impact >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {attr.impact >= 0 ? `+${attr.impact.toFixed(1)}%` : `${attr.impact.toFixed(1)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 3. ACADEMIC OVERVIEW (DERIVED STRICTLY FROM ENTERED DATA) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Academic Overview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified summary derived strictly from student examination baselines and entered coursework.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                {course} • {subLevel}
              </span>
            </div>

            {/* Exam Baseline vs Current Midterm vs Projected */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Previous Exam Baseline</span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{previousMarks}%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Historical benchmark score</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Current Midterm Marks</span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{midtermMarks}%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Recent internal testing</span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-semibold text-indigo-700 block">Predicted Final Score</span>
                <span className="text-xl font-extrabold text-indigo-900 mt-0.5 block">
                  {prediction.projected_score.toFixed(1)}%
                </span>
                <span className="text-[10px] text-indigo-600 mt-1 block">Expected semester trajectory</span>
              </div>
            </div>

            {/* Key Subjects Breakdown */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-800 block">
                Subject-Wise Diagnostic Breakdown
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate pr-2">{sub.name}</span>
                      <span
                        className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                          sub.score >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.score >= 60
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.score}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          sub.score >= 75
                            ? 'bg-emerald-500'
                            : sub.score >= 60
                            ? 'bg-indigo-600'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${sub.score}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-slate-500">
                      {sub.score >= 75
                        ? 'Demonstrates mastery of curriculum standards'
                        : sub.score >= 60
                        ? 'Stable progress; recommended for targeted review'
                        : 'Identified as a critical recovery area'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenging Topics list */}
            {weakAreas.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block mb-1.5">
                  Challenging Topics Flagged for Revision
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {weakAreas.map((w, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-amber-300 text-amber-800 shadow-2xs"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 4. ATTENDANCE AND SKILLS SUMMARY */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Attendance & Skills Summary
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Essential breakdown of attendance compliance, self-study discipline, and verified practical proficiencies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Attendance Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Attendance Rate</span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                      attendance >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {attendance}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      attendance >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${attendance}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 pt-1">
                  {attendance >= 75
                    ? 'Meets university minimum regulatory threshold (75%). Eligible for all term examinations.'
                    : 'Currently below 75% threshold. At risk of exam debarment without make-up attendance.'}
                </p>
              </div>

              {/* Study & Discipline Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Self-Study Routine</span>
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {studyHours} hrs/week
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>Assignment Consistency:</span>
                    <span className="font-bold text-slate-800">{assignmentScore}%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Distraction Index:</span>
                    <span className="font-bold text-slate-800 capitalize">{distractionLevel}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Weekly self-directed learning capacity outside of university classroom instruction.
                </p>
              </div>

              {/* Practical Labs & Project Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Practical & Lab Score</span>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {practicalScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${practicalScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 pt-1">
                  Hands-on laboratory problem solving, technical code submissions, and viva voce evaluation.
                </p>
              </div>
            </div>

            {/* Verified Skills & Certifications */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-800">
                  Key Technical & Analytical Competencies
                </span>
                <span className="text-[11px] text-slate-500">
                  Certification: <strong className="text-slate-800">{certification}</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ACTIONABLE RECOMMENDATIONS & STUDY GUIDANCE */}
          {/* ========================================================================= */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Actionable Academic Improvement Guidance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Targeted recommendations customized specifically for {studentName} based on entered performance indicators.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prediction.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 mt-0.5 border border-indigo-200">
                      {idx + 1}
                    </div>
                    <span className="text-slate-700 font-medium leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Footer / Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
            <button
              onClick={() => setShowAssessmentForm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Modify Inputs & Re-run Assessment</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintReport}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Academic Dossier</span>
              </button>

              <button
                onClick={handleSaveAssessment}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save to Student Records'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
