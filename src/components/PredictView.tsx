import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookmarkPlus,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  TrendingUp,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
  Printer
} from 'lucide-react';
import { PredictionInput, PredictionResult, SectionId, EducationLevelId } from '../types';
import { EDUCATION_LEVELS, getEducationLevelConfig } from '../data/educationLevels';
import { predictPerformance, savePrediction } from '../services/api';

interface PredictViewProps {
  onNavigate: (section: SectionId) => void;
  prefillData?: Partial<PredictionInput> | null;
  onPredictionSaved?: () => void;
}

type FormStep = 1 | 2 | 3 | 4;

export const PredictView: React.FC<PredictViewProps> = ({
  onNavigate,
  prefillData,
  onPredictionSaved
}) => {
  // Current active form step (1: Education, 2: Academic, 3: Study Habits, 4: Identification & Model)
  const [currentStep, setCurrentStep] = useState<FormStep>(1);

  // Education Level & Level Config
  const [educationLevel, setEducationLevel] = useState<EducationLevelId>(
    (prefillData?.education_level as EducationLevelId) || 'btech'
  );
  const activeLevelConfig = useMemo(() => getEducationLevelConfig(educationLevel), [educationLevel]);

  // Form Fields
  const [subLevel, setSubLevel] = useState<string>(
    prefillData?.sub_level || activeLevelConfig.subLevelOptions[0] || ''
  );
  const [streamOrBranch, setStreamOrBranch] = useState<string>(
    prefillData?.stream_or_branch || (activeLevelConfig.streamOrBranchOptions ? activeLevelConfig.streamOrBranchOptions[0] : '')
  );
  const [course, setCourse] = useState<string>(
    prefillData?.course || activeLevelConfig.suggestedCourses[0] || 'Core Subject Module'
  );

  const [studentId, setStudentId] = useState(prefillData?.student_id || 'STD-88429');
  const [studentName, setStudentName] = useState(prefillData?.student_name || 'Marcus Vance');
  const [modelType, setModelType] = useState<'rf' | 'dt' | 'lr'>('rf');

  const [attendance, setAttendance] = useState<number>(prefillData?.attendance ?? 64);
  const [studyHours, setStudyHours] = useState<number>(prefillData?.study_hours ?? 8.5);
  const [previousMarks, setPreviousMarks] = useState<number>(prefillData?.previous_marks ?? 58);
  const [assignmentScore, setAssignmentScore] = useState<number>(prefillData?.assignment_score ?? 61);
  const [practicalScore, setPracticalScore] = useState<number>(prefillData?.practical_score ?? 65);
  const [extraAcademicScore, setExtraAcademicScore] = useState<number>(prefillData?.extra_academic_score ?? 70);

  // Status and Result State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Helper when changing education level
  const handleLevelChange = (newLevel: EducationLevelId) => {
    setEducationLevel(newLevel);
    const cfg = getEducationLevelConfig(newLevel);
    setSubLevel(cfg.subLevelOptions[0] || '');
    if (cfg.streamOrBranchOptions && cfg.streamOrBranchOptions.length > 0) {
      setStreamOrBranch(cfg.streamOrBranchOptions[0]);
    } else {
      setStreamOrBranch('');
    }
    setCourse(cfg.suggestedCourses[0] || 'Core Subject Module');
  };

  // Validation Check
  const validateForm = (): boolean => {
    if (!studentId.trim()) {
      setErrorMessage('Student ID is required so your record can be identified.');
      setCurrentStep(4);
      return false;
    }
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      setErrorMessage('Attendance must be a valid percentage between 0 and 100%.');
      setCurrentStep(3);
      return false;
    }
    if (isNaN(studyHours) || studyHours < 0 || studyHours > 40) {
      setErrorMessage('Weekly study hours must be a realistic number between 0 and 40 hours.');
      setCurrentStep(3);
      return false;
    }
    if (isNaN(previousMarks) || previousMarks < 0 || previousMarks > 100) {
      setErrorMessage('Previous marks must be a valid score between 0 and 100%.');
      setCurrentStep(2);
      return false;
    }
    if (isNaN(assignmentScore) || assignmentScore < 0 || assignmentScore > 100) {
      setErrorMessage('Assignment score must be a valid percentage between 0 and 100%.');
      setCurrentStep(2);
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleExecutePrediction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const result = await predictPerformance({
        student_id: studentId.trim(),
        student_name: studentName.trim(),
        education_level: educationLevel,
        sub_level: subLevel,
        stream_or_branch: streamOrBranch,
        course,
        attendance: Number(attendance),
        study_hours: Number(studyHours),
        previous_marks: Number(previousMarks),
        assignment_score: Number(assignmentScore),
        practical_score: activeLevelConfig.practicalLabel ? Number(practicalScore) : undefined,
        extra_academic_score: activeLevelConfig.extraFieldLabel ? Number(extraAcademicScore) : undefined,
        model_type: modelType
      });
      setPrediction(result);
      // On mobile, scroll smoothly to result panel
      const el = document.getElementById('prediction-results-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not connect to the machine learning prediction service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!prediction) return;
    setIsSaving(true);
    try {
      await savePrediction({
        student_id: prediction.student_id,
        student_name: prediction.student_name,
        education_level: prediction.education_level,
        stream_or_branch: prediction.stream_or_branch,
        course: prediction.course,
        model_used: prediction.model_used,
        attendance,
        study_hours: studyHours,
        previous_marks: previousMarks,
        assignment_score: assignmentScore,
        practical_score: activeLevelConfig.practicalLabel ? practicalScore : undefined,
        predicted_category: prediction.predicted_category,
        confidence: prediction.confidence,
        projected_score: prediction.projected_score,
        recommendations: prediction.recommendations,
        study_plan: prediction.study_plan,
        recommended_courses: prediction.recommended_courses,
        advisor: 'Dr. Elena Rostova'
      });
      setSavedSuccess(true);
      if (onPredictionSaved) onPredictionSaved();
      setTimeout(() => setSavedSuccess(false), 4500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save prediction record to the database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearForm = () => {
    setStudentId('STD-');
    setStudentName('');
    setAttendance(75);
    setStudyHours(10);
    setPreviousMarks(65);
    setAssignmentScore(65);
    setPracticalScore(70);
    setExtraAcademicScore(70);
    setCurrentStep(1);
    setErrorMessage(null);
  };

  const handleResetDemo = () => {
    setEducationLevel('btech');
    setSubLevel('Semester 5 (3rd Year)');
    setStreamOrBranch('Computer Science & Engineering');
    setCourse('Data Structures & Algorithms');
    setStudentId('STD-88429');
    setStudentName('Marcus Vance');
    setModelType('rf');
    setAttendance(64);
    setStudyHours(8.5);
    setPreviousMarks(58);
    setAssignmentScore(61);
    setPracticalScore(65);
    setExtraAcademicScore(70);
    setCurrentStep(1);
    setErrorMessage(null);
  };

  // Grouped education levels for clean selection
  const groupedLevels = useMemo(() => {
    const groups: Record<string, typeof EDUCATION_LEVELS> = {};
    EDUCATION_LEVELS.forEach((lvl) => {
      if (!groups[lvl.category]) groups[lvl.category] = [];
      groups[lvl.category].push(lvl);
    });
    return groups;
  }, []);

  const isAtRisk = prediction?.predicted_category === 'At-Risk';
  const isModerate = prediction?.predicted_category === 'Moderate Performance';

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Predict Student Academic Performance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose your education level and enter your actual academic details. Our trained model predicts early performance risk and generates a personalized study plan.
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 font-bold p-1 cursor-pointer"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Form (Step-by-Step) + Results Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Adaptive Intake Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Step Progress Bar */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Section {currentStep} of 4:{' '}
                {currentStep === 1 && 'Education Details'}
                {currentStep === 2 && 'Academic Performance'}
                {currentStep === 3 && 'Study Habits & Attendance'}
                {currentStep === 4 && 'Student ID & Review'}
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                {currentStep * 25}% Complete
              </span>
            </div>
            
            {/* Visual Step Indicator Tabs */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[
                { step: 1, label: 'Education' },
                { step: 2, label: 'Performance' },
                { step: 3, label: 'Study Habits' },
                { step: 4, label: 'Review' }
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step as FormStep)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    s.step <= currentStep ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  title={`Jump to ${s.label}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleExecutePrediction} className="p-5 sm:p-6 space-y-5">

            {/* ============================================================== */}
            {/* STEP 1: EDUCATION DETAILS */}
            {/* ============================================================== */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Select Your Education Level <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    Fields change automatically to match your education level.
                  </p>
                  <select
                    value={educationLevel}
                    onChange={(e) => handleLevelChange(e.target.value as EducationLevelId)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  >
                    {Object.entries(groupedLevels).map(([groupName, levels]) => (
                      <optgroup key={groupName} label={groupName} className="dark:bg-slate-800 dark:text-slate-200">
                        {levels.map((lvl) => (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Sub-Level & Stream/Branch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {activeLevelConfig.subLevelLabel} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={subLevel}
                      onChange={(e) => setSubLevel(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {activeLevelConfig.subLevelOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeLevelConfig.streamOrBranchOptions && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {activeLevelConfig.streamOrBranchLabel || 'Stream / Branch'} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={streamOrBranch}
                        onChange={(e) => setStreamOrBranch(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {activeLevelConfig.streamOrBranchOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Current Subject / Course */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {activeLevelConfig.courseTerm} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms, Calculus, or Science"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Suggestions:</span>
                    {activeLevelConfig.suggestedCourses.slice(0, 3).map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => setCourse(sugg)}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded cursor-pointer transition"
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Selected Level: </span>
                  {activeLevelConfig.description}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: ACADEMIC PERFORMANCE */}
            {/* ============================================================== */}
            {currentStep === 2 && (
              <div className="space-y-4">
                
                {/* 1. Previous Marks */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{activeLevelConfig.previousMarksLabel}</span>
                      <span className="text-rose-500">*</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={previousMarks}
                        onChange={(e) => setPreviousMarks(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-14 px-1.5 py-0.5 text-xs text-right font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded"
                      />
                      <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={previousMarks}
                    onChange={(e) => setPreviousMarks(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    💡 {activeLevelConfig.previousMarksExplanation}
                  </p>
                </div>

                {/* 2. Assignment / Coursework Score */}
                <div className="space-y-1 pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{activeLevelConfig.assignmentLabel}</span>
                      <span className="text-rose-500">*</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={assignmentScore}
                        onChange={(e) => setAssignmentScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-14 px-1.5 py-0.5 text-xs text-right font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded"
                      />
                      <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={assignmentScore}
                    onChange={(e) => setAssignmentScore(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    💡 {activeLevelConfig.assignmentExplanation}
                  </p>
                </div>

                {/* 3. Practical / Lab Assessment (Optional for relevant levels) */}
                {activeLevelConfig.practicalLabel && (
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{activeLevelConfig.practicalLabel}</span>
                        <span className="text-slate-400 text-[10px]">(Lab / Practical)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={practicalScore}
                          onChange={(e) => setPracticalScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-14 px-1.5 py-0.5 text-xs text-right font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded"
                        />
                        <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={practicalScore}
                      onChange={(e) => setPracticalScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      💡 {activeLevelConfig.practicalExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 3: STUDY HABITS & ATTENDANCE */}
            {/* ============================================================== */}
            {currentStep === 3 && (
              <div className="space-y-4">
                
                {/* 1. Class Attendance Rate */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Class Attendance Rate (%)</span>
                      <span className="text-rose-500">*</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={attendance}
                        onChange={(e) => setAttendance(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-14 px-1.5 py-0.5 text-xs text-right font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded"
                      />
                      <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    <span className="text-rose-500 font-medium">Critical (&lt;75%)</span>
                    <span>Standard: 80%</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Full Attendance</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    💡 <strong>Attendance means:</strong> The percentage of scheduled classes or lectures you were present in during the term.
                  </p>
                </div>

                {/* 2. Weekly Self-Study Hours */}
                <div className="space-y-1 pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Weekly Self-Study Time</span>
                      <span className="text-rose-500">*</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        step={0.5}
                        value={studyHours}
                        onChange={(e) => setStudyHours(Math.max(0, Math.min(40, Number(e.target.value))))}
                        className="w-14 px-1.5 py-0.5 text-xs text-right font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded"
                      />
                      <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">hrs</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={35}
                    step={0.5}
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    <span>Low (0–5h)</span>
                    <span>Recommended: 12–15h/week</span>
                    <span>Intensive (25h+)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    💡 <strong>Study hours means:</strong> The number of hours you spend studying on your own each week, outside of classroom teaching.
                  </p>
                </div>

                {/* Level Extra Field (e.g. Entrance Exam or Thesis) */}
                {activeLevelConfig.extraFieldLabel && (
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{activeLevelConfig.extraFieldLabel}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={extraAcademicScore}
                          onChange={(e) => setExtraAcademicScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-14 px-1.5 py-0.5 text-xs text-right font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded"
                        />
                        <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={extraAcademicScore}
                      onChange={(e) => setExtraAcademicScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      💡 {activeLevelConfig.extraFieldExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 4: STUDENT ID & MODEL REVIEW */}
            {/* ============================================================== */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Student ID / Roll Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. STD-88429"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Student Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supervised Machine Learning Model
                  </label>
                  <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="rf">Random Forest Classifier (Ensemble v2.4 - Recommended, 89.4% Accuracy)</option>
                    <option value="dt">Decision Tree (CART - High Rule Interpretability)</option>
                    <option value="lr">Logistic Regression (L2 Regularized Linear Baseline)</option>
                  </select>
                </div>

                {/* Summary Review Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                    <span>Summary of Your Information</span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{activeLevelConfig.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Class / Term:</span>
                      <strong>{subLevel}</strong> {streamOrBranch ? `• ${streamOrBranch}` : ''}
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Subject / Module:</span>
                      <strong>{course}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Attendance:</span>
                      <strong>{attendance}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Weekly Study Time:</span>
                      <strong>{studyHours} hrs/week</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Previous Examination:</span>
                      <strong>{previousMarks}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Continuous Coursework:</span>
                      <strong>{assignmentScore}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation & Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer hidden sm:inline-block"
                >
                  Reset Demo
                </button>
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev - 1) as FormStep)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev + 1) as FormStep)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm hover:shadow transition disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Performance...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Performance</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Right Column: Prediction Outcome, Strengths, Study Plan & Verified Courses */}
        <div id="prediction-results-anchor" className="lg:col-span-5 space-y-4">
          {prediction ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Prediction Outcome
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{prediction.education_level_label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isAtRisk
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        : isModerate
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {prediction.predicted_category}
                  </span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    title="Print / Save Report PDF"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Result Callout */}
              <div className="py-2 text-center">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-2 border ${
                    isAtRisk
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900'
                      : isModerate
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900'
                  }`}
                >
                  {isAtRisk ? (
                    <AlertOctagon className="w-7 h-7" />
                  ) : isModerate ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <CheckCircle2 className="w-7 h-7" />
                  )}
                </div>
                <h3
                  className={`text-base sm:text-lg font-extrabold ${
                    isAtRisk
                      ? 'text-rose-700 dark:text-rose-400'
                      : isModerate
                      ? 'text-amber-800 dark:text-amber-300'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {isAtRisk
                    ? 'Early Academic Risk Detected'
                    : isModerate
                    ? 'Moderate / Borderline Performance'
                    : 'On Track for High Performance'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Model Confidence: <strong>{prediction.confidence}%</strong> • Projected Final Marks:{' '}
                  <strong>{prediction.score_range}</strong>
                </p>
              </div>

              {/* Genuine Academic Strengths */}
              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Academic Strengths Identified</span>
                </div>
                <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  {prediction.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              {/* Genuine Areas Needing Improvement */}
              <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Areas Needing Attention</span>
                </div>
                <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  {prediction.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>

              {/* Feature Factor Contribution (SHAP Attribution) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Key Predictive Factors (Model SHAP Impact)
                </p>
                {prediction.attributions.map((attr, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                      <span className="truncate pr-2">
                        {attr.feature} ({attr.value})
                      </span>
                      <span
                        className={`font-bold shrink-0 ${
                          attr.impact < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {attr.impact > 0 ? `+${attr.impact}%` : `${attr.impact}%`} Impact
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          attr.severity === 'high'
                            ? 'bg-rose-500'
                            : attr.severity === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.abs(attr.impact) * 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actionable Personalized Study Plan */}
              {prediction.study_plan && (
                <div className="p-3.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Personalized Study Plan</span>
                  </div>
                  
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5">
                    <p>
                      <strong>Primary Target Goal:</strong> {prediction.study_plan.primaryGoal}
                    </p>
                    <p>
                      <strong>Recommended Study Time:</strong> {prediction.study_plan.weeklyTargetHours} hrs/week ({prediction.study_plan.dailyStudyRoutine})
                    </p>
                    <p>
                      <strong>Revision Routine:</strong> {prediction.study_plan.revisionStrategy}
                    </p>
                    <p>
                      <strong>Next Assessment Goal:</strong>{' '}
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">{prediction.study_plan.nextAssessmentTarget}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Level-Based Verified Course Recommendations */}
              {prediction.recommended_courses && prediction.recommended_courses.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Verified Course Recommendations</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Authentic Providers</span>
                  </div>

                  <div className="space-y-2">
                    {prediction.recommended_courses.map((crs) => (
                      <div
                        key={crs.id}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-slate-100 leading-snug">{crs.name}</h5>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                              {crs.provider} • <span className="text-slate-500 dark:text-slate-400 font-normal">{crs.difficulty}</span> • <span className="text-emerald-700 dark:text-emerald-400">{crs.pricing}</span>
                            </p>
                          </div>
                          <a
                            href={crs.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                            title="Visit official course page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">{crs.outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Honest Model Dataset Limitations Note */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/60">
                <strong>Model Note:</strong> {prediction.limitations_note}
              </div>

              {/* Save Prediction to Database */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleSavePrediction}
                  disabled={isSaving}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Saved to Database!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save to Prediction Log'}</span>
                    </>
                  )}
                </button>

                <span className="text-slate-400 dark:text-slate-500 text-[11px]">Audit Record: Advisor Rostova</span>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-1">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Ready for Analysis</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Complete the four steps on the left with your academic details and click <strong>Analyze Performance</strong> to run machine learning inference.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
