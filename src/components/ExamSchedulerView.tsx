import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Check,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Sliders,
  Coffee,
  HelpCircle,
  Award,
  Layers,
  Info
} from 'lucide-react';
import {
  SectionId,
  ExamSubject,
  ExamTopic,
  StudyAvailability,
  ScheduledStudySession,
  DaySchedule,
  ExamStudyPlan,
  SessionType,
  TopicDifficulty,
  TopicConfidence,
  TopicWeightage
} from '../types';
import {
  fetchExamsList,
  createExamRecord,
  updateExamRecord,
  deleteExamRecord,
  fetchExamStudyPlan,
  generateExamStudyPlan,
  updateExamSessionStatus,
  rebalanceExamSchedule,
  fetchAIScheduleAdvice,
  fetchAcademicProfile
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { EXAM_PRESET_TEMPLATES } from '../data/examTemplates';
import { TopicAICoachModal } from './TopicAICoachModal';

interface ExamSchedulerViewProps {
  onNavigate: (section: SectionId) => void;
  prefillSubject?: string;
  prefillTopic?: string;
  initialTab?: 'roadmap' | 'exams' | 'availability' | 'timer';
  autoOpenAddModal?: boolean;
}

interface ExamItem {
  id: string;
  subject_name: string;
  exam_date: string;
  exam_time?: string;
  priority: 'high' | 'medium' | 'low';
  syllabus_completion_percent: number;
  notes?: string;
  status: 'upcoming' | 'completed';
}

export const ExamSchedulerView: React.FC<ExamSchedulerViewProps> = ({
  onNavigate,
  prefillSubject,
  prefillTopic,
  initialTab,
  autoOpenAddModal
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Active view tab: 'roadmap' (Primary) | 'exams' | 'availability' | 'timer'
  const [activeTab, setActiveTab] = useState<'roadmap' | 'exams' | 'availability' | 'timer'>(initialTab || 'roadmap');

  // Exam Records
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);

  // Active Daily Study Roadmap
  const [studyPlan, setStudyPlan] = useState<ExamStudyPlan | null>(() => {
    const cached = localStorage.getItem('edupredict_active_study_plan');
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    return null;
  });
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState('');

  // Roadmap Navigation state
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isFullPlanView, setIsFullPlanView] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Study Availability & Constraints
  const [availability, setAvailability] = useState<StudyAvailability>(() => {
    const cached = localStorage.getItem('edupredict_study_availability');
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    return {
      dailyHoursWeekday: 3.5,
      dailyHoursWeekend: 5.0,
      dailyHours: 3.5,
      dailyMinutes: 30,
      preferredTimeSlot: 'morning',
      startTime: '08:30 AM',
      endTime: '01:00 PM',
      sessionDurationMinutes: 45,
      breakDurationMinutes: 10,
      restDays: ['Sunday'],
      revisionBufferDays: 2,
      commitmentsNote: 'Morning college lectures 09:30 AM – 02:00 PM'
    };
  });

  // Add / Edit Examination Modal State
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [examFormError, setExamFormError] = useState('');

  // Exam creation form fields
  const [formExamType, setFormExamType] = useState('Final Semester Examination');
  const [formSubjectName, setFormSubjectName] = useState(prefillSubject || '');
  const [formExamDate, setFormExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [formExamTime, setFormExamTime] = useState('10:00 AM');
  const [formExamPriority, setFormExamPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [formSyllabusPercent, setFormSyllabusPercent] = useState<number>(45);
  const [formExamNotes, setFormExamNotes] = useState(prefillTopic ? `Focus chapters: ${prefillTopic}` : '');

  // Topics list within the exam creation modal
  const [formTopics, setFormTopics] = useState<Array<{
    id: string;
    name: string;
    unitOrChapter: string;
    difficulty: TopicDifficulty;
    confidence: TopicConfidence;
    weightage: TopicWeightage;
    estimatedMinutes: number;
    isCompleted: boolean;
  }>>([
    {
      id: 'top-init-1',
      name: prefillTopic || 'Core Concept Theory & Derivations',
      unitOrChapter: 'Unit 1: Fundamentals',
      difficulty: 'Medium',
      confidence: 'Average',
      weightage: 'High',
      estimatedMinutes: 45,
      isCompleted: false
    },
    {
      id: 'top-init-2',
      name: 'Advanced Problem Solving & Case Studies',
      unitOrChapter: 'Unit 2: Application',
      difficulty: 'Hard',
      confidence: 'Weak',
      weightage: 'High',
      estimatedMinutes: 60,
      isCompleted: false
    }
  ]);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [newTopicUnit, setNewTopicUnit] = useState('Unit 3');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<TopicDifficulty>('Medium');
  const [newTopicPriority, setNewTopicPriority] = useState<TopicWeightage>('High');

  // AI Topic Coach Modal
  const [coachModalInfo, setCoachModalInfo] = useState<{
    isOpen: boolean;
    subjectName: string;
    topicName: string;
    difficulty?: string;
    confidence?: string;
  }>({
    isOpen: false,
    subjectName: '',
    topicName: ''
  });

  // Pomodoro Focus Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [currentTopicFocus, setCurrentTopicFocus] = useState('Data Structures - Core Review');
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 4500);
  };

  // 1. Load active exams
  const loadExams = useCallback(async () => {
    setIsLoadingExams(true);
    try {
      const res = await fetchExamsList();
      if (res && res.exams) {
        setExams(res.exams);
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setIsLoadingExams(false);
    }
  }, []);

  // 2. Load or bootstrap study plan
  const loadOrBootstrapPlan = useCallback(async (currentExams: ExamItem[]) => {
    setIsLoadingPlan(true);
    try {
      const res = await fetchExamStudyPlan();
      if (res && res.days && res.days.length > 0) {
        setStudyPlan(res);
        localStorage.setItem('edupredict_active_study_plan', JSON.stringify(res));
      } else {
        // Auto-generate plan from either active exams or default template
        const defaultPreset = EXAM_PRESET_TEMPLATES[0];
        let planSubjects: ExamSubject[] = [];

        if (currentExams.length > 0) {
          planSubjects = currentExams.map((e, idx) => ({
            id: e.id || `sub-${idx}`,
            name: e.subject_name,
            examDate: e.exam_date,
            examTime: e.exam_time,
            topics: [
              {
                id: `top-${idx}-1`,
                name: `${e.subject_name} - Core Theory & First Principles`,
                unitOrChapter: 'Module 1',
                difficulty: e.priority === 'high' ? 'Hard' : 'Medium',
                confidence: 'Weak',
                weightage: 'High',
                estimatedMinutes: 50,
                isCompleted: (e.syllabus_completion_percent || 0) >= 80
              },
              {
                id: `top-${idx}-2`,
                name: `${e.subject_name} - Practical Problem Sets & PYQs`,
                unitOrChapter: 'Module 2',
                difficulty: 'Medium',
                confidence: 'Average',
                weightage: 'High',
                estimatedMinutes: 60,
                isCompleted: (e.syllabus_completion_percent || 0) >= 50
              },
              {
                id: `top-${idx}-3`,
                name: `${e.subject_name} - Analytical Synthesis & Numerical Examples`,
                unitOrChapter: 'Module 3',
                difficulty: 'Medium',
                confidence: 'Good',
                weightage: 'Medium',
                estimatedMinutes: 45,
                isCompleted: false
              }
            ]
          }));
        } else {
          planSubjects = defaultPreset.subjects;
        }

        const generated = await generateExamStudyPlan({
          exam_name: currentExams.length > 0 ? `${currentExams[0].subject_name} & Semester Preparation` : defaultPreset.name,
          subjects: planSubjects,
          availability
        });

        if (generated && generated.days) {
          setStudyPlan(generated);
          localStorage.setItem('edupredict_active_study_plan', JSON.stringify(generated));
        }
      }
    } catch (err) {
      console.error('Failed to load study plan:', err);
    } finally {
      setIsLoadingPlan(false);
    }
  }, [availability]);

  useEffect(() => {
    loadExams().then(() => {
      // Trigger bootstrap once exams are loaded
      loadOrBootstrapPlan(exams);
    });
  }, []);

  // Handle prefill parameters
  useEffect(() => {
    if (prefillSubject) {
      setFormSubjectName(prefillSubject);
      if (prefillTopic) {
        setFormExamNotes(`Focus chapters: ${prefillTopic}`);
        setFormTopics([
          {
            id: `top-prefill-1`,
            name: prefillTopic,
            unitOrChapter: 'Priority Module',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 60,
            isCompleted: false
          },
          {
            id: `top-prefill-2`,
            name: `${prefillSubject} - Core Concept Theory`,
            unitOrChapter: 'Foundations',
            difficulty: 'Medium',
            confidence: 'Average',
            weightage: 'Medium',
            estimatedMinutes: 45,
            isCompleted: false
          }
        ]);
      }
      setIsAddExamOpen(true);
      setActiveTab('exams');
    }
  }, [prefillSubject, prefillTopic]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (autoOpenAddModal) {
      setIsAddExamOpen(true);
      setActiveTab('exams');
    }
  }, [autoOpenAddModal]);

  // Pomodoro Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (timerMode === 'work') {
        setCompletedSessionsCount(c => c + 1);
        setTimerMode('break');
        setTimerSeconds(5 * 60);
        showToast('Great focus! 25-minute study block completed. Enjoy a 5-minute restorative break.');
      } else {
        setTimerMode('work');
        setTimerSeconds(25 * 60);
        showToast('Break finished! Ready to begin next study block.');
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  // Synchronize expanded days default
  useEffect(() => {
    if (studyPlan && studyPlan.days && studyPlan.days.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayIdx = studyPlan.days.findIndex(d => d.date === todayStr);
      if (todayIdx >= 0) {
        setSelectedDayIndex(todayIdx);
        setExpandedDays(prev => ({ ...prev, [studyPlan.days[todayIdx].date]: true }));
      } else {
        setSelectedDayIndex(0);
        setExpandedDays(prev => ({ ...prev, [studyPlan.days[0].date]: true }));
      }
    }
  }, [studyPlan]);

  // -------------------------------------------------------------
  // ROADMAP ACTIONS
  // -------------------------------------------------------------

  // Mark task status (completed, partially_completed, skipped, pending)
  const handleUpdateTaskStatus = async (
    sessionId: string,
    newStatus: 'pending' | 'completed' | 'partially_completed' | 'skipped'
  ) => {
    if (!studyPlan) return;

    // Optimistic local update
    const updatedDays = studyPlan.days.map(day => ({
      ...day,
      sessions: day.sessions.map(sess => {
        if (sess.id === sessionId) {
          return {
            ...sess,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
          };
        }
        return sess;
      })
    }));

    // Recalculate completion statistics
    let totalSessions = 0;
    let completedCount = 0;
    let completedMinutes = 0;

    for (const d of updatedDays) {
      for (const s of d.sessions) {
        totalSessions++;
        if (s.status === 'completed') {
          completedCount += 1.0;
          completedMinutes += s.durationMinutes || 0;
        } else if (s.status === 'partially_completed') {
          completedCount += 0.5;
          completedMinutes += (s.durationMinutes || 0) * 0.5;
        }
      }
    }

    const updatedPlan: ExamStudyPlan = {
      ...studyPlan,
      days: updatedDays,
      completedTopics: Math.round(completedCount),
      completedHours: Number((completedMinutes / 60).toFixed(1)),
      updatedAt: new Date().toISOString()
    };

    setStudyPlan(updatedPlan);
    localStorage.setItem('edupredict_active_study_plan', JSON.stringify(updatedPlan));

    if (newStatus === 'completed') {
      showToast('Session marked as completed! Syllabus progress updated.');
    } else if (newStatus === 'partially_completed') {
      showToast('Partially completed session noted. Balance preserved in roadmap.');
    } else if (newStatus === 'skipped') {
      showToast('Task marked skipped. You can reschedule this into future days with 1 click.');
    }

    // Persist to backend if plan has id
    if (studyPlan.id) {
      try {
        await updateExamSessionStatus(studyPlan.id, sessionId, newStatus);
      } catch (err) {
        console.warn('Backend session status update notice:', err);
      }
    }
  };

  // Recalculate Roadmap when availability or date changes
  const handleRecalculateRoadmap = async () => {
    if (!studyPlan) return;
    setIsRebalancing(true);
    try {
      localStorage.setItem('edupredict_study_availability', JSON.stringify(availability));
      const res = await rebalanceExamSchedule(studyPlan.id || 1, studyPlan, availability);
      if (res && res.days) {
        setStudyPlan(res);
        localStorage.setItem('edupredict_active_study_plan', JSON.stringify(res));
        showToast('Study roadmap successfully recalculated with updated daily availability.');
        setActiveTab('roadmap');
      }
    } catch (err: any) {
      showToast('Rebalance notice: ' + (err?.message || 'Updated locally'));
    } finally {
      setIsRebalancing(false);
    }
  };

  // Report Missed Day / Unplanned Break
  const handleReportMissedDay = async (missedDateStr?: string) => {
    if (!studyPlan) return;
    setIsRebalancing(true);
    const dateToMiss = missedDateStr || (studyPlan.days[selectedDayIndex]?.date || new Date().toISOString().slice(0, 10));

    try {
      const res = await rebalanceExamSchedule(studyPlan.id || 1, studyPlan, availability, {
        missedDate: dateToMiss,
        unplannedBreak: true
      });
      if (res && res.days) {
        setStudyPlan(res);
        localStorage.setItem('edupredict_active_study_plan', JSON.stringify(res));
        showToast(`Unplanned break recorded for ${dateToMiss}. Incomplete tasks rebalanced into remaining days!`);
      }
    } catch (err: any) {
      showToast('Rebalanced locally: ' + (err?.message || 'Done'));
    } finally {
      setIsRebalancing(false);
    }
  };

  // 1-Click Reschedule Incomplete Tasks into future sessions
  const handleRescheduleIncomplete = async () => {
    if (!studyPlan) return;
    setIsRebalancing(true);
    try {
      const res = await rebalanceExamSchedule(studyPlan.id || 1, studyPlan, availability);
      if (res && res.days) {
        setStudyPlan(res);
        localStorage.setItem('edupredict_active_study_plan', JSON.stringify(res));
        showToast('All incomplete tasks rebalanced across remaining study days.');
      }
    } catch (err: any) {
      showToast('Rescheduled: ' + (err?.message || 'Plan updated'));
    } finally {
      setIsRebalancing(false);
    }
  };

  // -------------------------------------------------------------
  // EXAM CRUD & TOPICS BUILDER
  // -------------------------------------------------------------

  const handleAddTopicToForm = () => {
    if (!newTopicInput.trim()) return;
    const newTopic = {
      id: `top-custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: newTopicInput.trim(),
      unitOrChapter: newTopicUnit.trim() || 'Unit 1',
      difficulty: newTopicDifficulty,
      confidence: 'Average' as TopicConfidence,
      weightage: newTopicPriority,
      estimatedMinutes: newTopicDifficulty === 'Hard' ? 60 : 45,
      isCompleted: false
    };
    setFormTopics(prev => [...prev, newTopic]);
    setNewTopicInput('');
  };

  const handleRemoveTopicFromForm = (topicId: string) => {
    setFormTopics(prev => prev.filter(t => t.id !== topicId));
  };

  const handleToggleTopicCompletedInForm = (topicId: string) => {
    setFormTopics(prev => prev.map(t => (t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t)));
  };

  const handleLoadPresetTemplate = (templateId: string) => {
    const tmpl = EXAM_PRESET_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    setFormExamType(tmpl.name);
    if (tmpl.subjects.length > 0) {
      const firstSub = tmpl.subjects[0];
      setFormSubjectName(firstSub.name);
      setFormExamDate(firstSub.examDate);
      setFormTopics(
        firstSub.topics.map(t => ({
          id: t.id,
          name: t.name,
          unitOrChapter: t.unitOrChapter || 'Core Module',
          difficulty: t.difficulty,
          confidence: t.confidence,
          weightage: t.weightage,
          estimatedMinutes: t.estimatedMinutes || 45,
          isCompleted: Boolean(t.isCompleted)
        }))
      );
    }
    showToast(`Loaded pre-built curriculum topics for ${tmpl.name}.`);
  };

  // Save Exam Record
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingExam) return;

    if (!formSubjectName.trim()) {
      setExamFormError('Please enter a valid subject name');
      return;
    }

    if (!formExamDate) {
      setExamFormError('Please select a valid examination date');
      return;
    }

    const examDateTimestamp = new Date(formExamDate).getTime();
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);
    if (isNaN(examDateTimestamp) || examDateTimestamp < todayTimestamp) {
      setExamFormError('Examination date cannot be in the past. Please select an upcoming date.');
      return;
    }

    if (formTopics.length === 0) {
      setExamFormError('Please enter at least one syllabus topic or chapter for this examination.');
      return;
    }

    setIsSavingExam(true);
    setExamFormError('');

    try {
      const completedTopicsCount = formTopics.filter(t => t.isCompleted).length;
      const calculatedSyllabusPct = Math.round((completedTopicsCount / formTopics.length) * 100);

      const notesContent = `${formExamType} • Topics: ${formTopics.map(t => t.name).slice(0, 3).join(', ')}${formTopics.length > 3 ? ` (+${formTopics.length - 3} more)` : ''}`;

      if (editingExamId) {
        await updateExamRecord(editingExamId, {
          subject_name: formSubjectName.trim(),
          exam_date: formExamDate,
          exam_time: formExamTime,
          priority: formExamPriority,
          syllabus_completion_percent: calculatedSyllabusPct,
          notes: notesContent
        });
        showToast('Examination record updated.');
      } else {
        await createExamRecord({
          subject_name: formSubjectName.trim(),
          exam_date: formExamDate,
          exam_time: formExamTime,
          priority: formExamPriority,
          syllabus_completion_percent: calculatedSyllabusPct,
          notes: notesContent
        });
        showToast('New examination scheduled successfully.');
      }

      setIsAddExamOpen(false);
      setEditingExamId(null);
      await loadExams();

      // Automatically sync topics into study plan roadmap
      const updatedSubject: ExamSubject = {
        id: editingExamId || `sub-${Date.now()}`,
        name: formSubjectName.trim(),
        examType: formExamType,
        examDate: formExamDate,
        examTime: formExamTime,
        topics: formTopics.map(t => ({
          id: t.id,
          name: t.name,
          unitOrChapter: t.unitOrChapter,
          difficulty: t.difficulty,
          confidence: t.confidence,
          weightage: t.weightage,
          estimatedMinutes: t.estimatedMinutes,
          isCompleted: t.isCompleted
        }))
      };

      const existingSubjects = studyPlan?.subjects || [];
      const filteredSubjects = existingSubjects.filter(s => s.name.toLowerCase() !== formSubjectName.trim().toLowerCase());
      const newPlanSubjects = [updatedSubject, ...filteredSubjects];

      const newPlan = await generateExamStudyPlan({
        exam_name: formExamType,
        subjects: newPlanSubjects,
        availability
      });

      setStudyPlan(newPlan);
      localStorage.setItem('edupredict_active_study_plan', JSON.stringify(newPlan));
      setActiveTab('roadmap');
      showToast('Daily study roadmap updated with your syllabus topics!');
    } catch (err: any) {
      setExamFormError(err?.message || 'Failed to save examination record');
    } finally {
      setIsSavingExam(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to remove this examination from your schedule?')) return;
    try {
      await deleteExamRecord(examId);
      await loadExams();
      showToast('Examination removed from schedule.');
    } catch (err: any) {
      alert('Failed to delete exam: ' + (err?.message || 'Error'));
    }
  };

  const handleMarkExamCompleted = async (exam: ExamItem) => {
    try {
      const nextStatus = exam.status === 'completed' ? 'upcoming' : 'completed';
      await updateExamRecord(exam.id, {
        status: nextStatus,
        syllabus_completion_percent: nextStatus === 'completed' ? 100 : exam.syllabus_completion_percent
      });
      await loadExams();
      showToast(nextStatus === 'completed' ? 'Exam marked as completed!' : 'Exam marked as upcoming.');
    } catch (err: any) {
      alert('Failed to update exam: ' + (err?.message || 'Error'));
    }
  };

  // Helper: Countdown
  const getCountdown = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffMs = target - now;
    if (diffMs < 0) return { text: 'Exam Today or Concluded', isUrgent: true, days: 0 };
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days === 0) return { text: `In ${hours} hours!`, isUrgent: true, days: 0 };
    if (days === 1) return { text: 'Tomorrow!', isUrgent: true, days: 1 };
    return { text: `In ${days} days ${hours}h`, isUrgent: days <= 3, days };
  };

  // -------------------------------------------------------------
  // TOP SUMMARY CARDS DATA
  // -------------------------------------------------------------
  const summaryMetrics = useMemo(() => {
    // 1. Nearest Exam Countdown
    let nearestExam: ExamItem | null = null;
    let minDiff = Infinity;
    const now = Date.now();

    for (const e of exams) {
      if (e.status === 'completed') continue;
      const t = new Date(e.exam_date).getTime();
      const diff = t - now;
      if (diff >= -86400000 && diff < minDiff) {
        minDiff = diff;
        nearestExam = e;
      }
    }

    const countdown = nearestExam ? getCountdown(nearestExam.exam_date) : { text: 'No active exams', isUrgent: false, days: 99 };

    // 2. Daily Available Study Time
    const weekdayHrs = availability.dailyHoursWeekday || availability.dailyHours || 3.5;
    const dailyTimeDisplay = `${Math.floor(weekdayHrs)}h ${Math.round((weekdayHrs % 1) * 60)}m / day`;

    // 3. Today's Planned Study Time
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySchedule = studyPlan?.days?.find(d => d.date === todayStr);
    const todayPlannedMins = todaySchedule ? todaySchedule.totalPlannedMinutes : (studyPlan?.days?.[0]?.totalPlannedMinutes || 135);
    const todayHours = Math.floor(todayPlannedMins / 60);
    const todayMins = todayPlannedMins % 60;
    const todayPlannedDisplay = todayPlannedMins === 0 ? 'Rest / Buffer Day' : `${todayHours}h ${todayMins}m today`;

    // 4. Tasks Completed
    let totalTasksCount = 0;
    let completedTasksCount = 0;
    if (studyPlan?.days) {
      for (const d of studyPlan.days) {
        for (const s of d.sessions) {
          totalTasksCount++;
          if (s.status === 'completed') completedTasksCount += 1;
          else if (s.status === 'partially_completed') completedTasksCount += 0.5;
        }
      }
    }

    // 5. Overall Syllabus Completion
    const syllabusPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // 6. Upcoming Revision or Mock-Test Milestone
    let nextMilestone = 'Mock Test 2 days prior';
    if (studyPlan?.days) {
      for (const d of studyPlan.days) {
        const mockSess = d.sessions.find(s => s.sessionType === 'mock_test' || s.sessionType === 'revision');
        if (mockSess && sDateInFuture(d.date)) {
          nextMilestone = `${mockSess.sessionType === 'mock_test' ? 'Mock Test' : 'Revision'}: ${d.dayOfWeek} (${d.date.slice(5)})`;
          break;
        }
      }
    }

    return {
      nearestExam,
      countdown,
      dailyTimeDisplay,
      todayPlannedDisplay,
      todayPlannedMins,
      tasksCompletedDisplay: `${Math.round(completedTasksCount)} / ${totalTasksCount} tasks`,
      syllabusPct,
      nextMilestone
    };
  }, [exams, studyPlan, availability]);

  function sDateInFuture(dateStr: string) {
    const todayStr = new Date().toISOString().slice(0, 10);
    return dateStr >= todayStr;
  }

  // Active day in single day view
  const currentSelectedDay: DaySchedule | undefined = studyPlan?.days?.[selectedDayIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Hero Banner */}
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
                  {exams.filter(e => e.status !== 'completed').length} Active Examinations
                </span>
                {studyPlan?.days && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] dark:bg-[#15803D]/25 dark:text-[#86EFAC] border border-[#86EFAC] dark:border-[#15803D]/40">
                    {studyPlan.days.length}-Day Daily Roadmap Active
                  </span>
                )}
              </div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                Personalized Daily Exam Study Roadmap
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                Automated day-by-day study schedule with spaced revision, non-overlapping timed slots, and active progress tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setEditingExamId(null);
                setFormSubjectName('');
                setFormExamNotes('');
                setIsAddExamOpen(true);
              }}
              className="btn-primary text-xs sm:text-sm gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white">Schedule Examination</span>
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className="btn-secondary text-xs sm:text-sm gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#6D28D9] dark:text-[#DDD6FE]" />
              <span>Study Hours &amp; Days</span>
            </button>
          </div>
        </div>

        {feedbackToast && (
          <div className="mt-4 p-3 rounded-xl bg-[#E8F7EF] dark:bg-[rgba(8,122,85,0.2)] border border-[#A6E9C7] dark:border-[rgba(8,122,85,0.35)] text-[#087A55] dark:text-[#6EE7B7] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}
      </div>

      {/* 2. Top Summary Metric Cards (6 core metrics strictly aligned with specification) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Exam Countdown */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            summaryMetrics.countdown.isUrgent
              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
              : isLight
              ? 'bg-white border-[#E1E6EF] text-[#172033]'
              : 'bg-[#131926] border-[#1E2B42] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#526078] dark:text-slate-400 uppercase tracking-wider">
              Countdown
            </span>
            <Clock className={`w-4 h-4 ${summaryMetrics.countdown.isUrgent ? 'text-rose-600 animate-pulse' : 'text-[#7000E8] dark:text-[#C4B5FD]'}`} />
          </div>
          <div className="mt-2">
            <p className="text-base sm:text-lg font-black truncate">
              {summaryMetrics.countdown.text}
            </p>
            <p className="text-[11px] text-[#526078] dark:text-slate-400 truncate mt-0.5">
              {summaryMetrics.nearestExam ? summaryMetrics.nearestExam.subject_name : 'No active exams'}
            </p>
          </div>
        </div>

        {/* Metric 2: Daily Available Study Time */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isLight ? 'bg-white border-[#E1E6EF] text-[#172033]' : 'bg-[#131926] border-[#1E2B42] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#526078] dark:text-slate-400 uppercase tracking-wider">
              Available Time
            </span>
            <Calendar className="w-4 h-4 text-[#2458A6] dark:text-[#93C5FD]" />
          </div>
          <div className="mt-2">
            <p className="text-base sm:text-lg font-black text-[#2458A6] dark:text-[#93C5FD]">
              {summaryMetrics.dailyTimeDisplay}
            </p>
            <p className="text-[11px] text-[#526078] dark:text-slate-400 truncate mt-0.5">
              {availability.startTime} start • {availability.restDays.join(', ') || 'No rest days'}
            </p>
          </div>
        </div>

        {/* Metric 3: Today's Planned Study Time */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isLight ? 'bg-white border-[#E1E6EF] text-[#172033]' : 'bg-[#131926] border-[#1E2B42] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#526078] dark:text-slate-400 uppercase tracking-wider">
              Today's Plan
            </span>
            <CheckSquare className="w-4 h-4 text-[#7000E8] dark:text-[#C4B5FD]" />
          </div>
          <div className="mt-2">
            <p className="text-base sm:text-lg font-black text-[#7000E8] dark:text-[#C4B5FD]">
              {summaryMetrics.todayPlannedDisplay}
            </p>
            <p className="text-[11px] text-[#526078] dark:text-slate-400 truncate mt-0.5">
              {currentSelectedDay?.sessions?.length || 0} study blocks planned
            </p>
          </div>
        </div>

        {/* Metric 4: Tasks Completed */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isLight ? 'bg-white border-[#E1E6EF] text-[#172033]' : 'bg-[#131926] border-[#1E2B42] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#526078] dark:text-slate-400 uppercase tracking-wider">
              Tasks Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#087A55] dark:text-[#6EE7B7]" />
          </div>
          <div className="mt-2">
            <p className="text-base sm:text-lg font-black text-[#087A55] dark:text-[#6EE7B7]">
              {summaryMetrics.tasksCompletedDisplay}
            </p>
            <p className="text-[11px] text-[#526078] dark:text-slate-400 truncate mt-0.5">
              {studyPlan?.completedHours || 0}h deep work done
            </p>
          </div>
        </div>

        {/* Metric 5: Overall Syllabus Completion */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isLight ? 'bg-white border-[#E1E6EF] text-[#172033]' : 'bg-[#131926] border-[#1E2B42] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#526078] dark:text-slate-400 uppercase tracking-wider">
              Syllabus Coverage
            </span>
            <ShieldCheck className="w-4 h-4 text-[#7000E8] dark:text-[#C4B5FD]" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-sm">{summaryMetrics.syllabusPct}%</span>
              <span className="text-[10px] text-[#526078] dark:text-slate-400">Target: 100%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E1E6EF] dark:bg-[#1E2B42] overflow-hidden">
              <div
                className="h-full bg-[#7000E8] transition-all rounded-full"
                style={{ width: `${Math.min(100, summaryMetrics.syllabusPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 6: Upcoming Milestone */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isLight ? 'bg-white border-[#E1E6EF] text-[#172033]' : 'bg-[#131926] border-[#1E2B42] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#526078] dark:text-slate-400 uppercase tracking-wider">
              Next Milestone
            </span>
            <Award className="w-4 h-4 text-[#945800] dark:text-[#FCD34D]" />
          </div>
          <div className="mt-2">
            <p className="text-xs sm:text-sm font-black text-[#945800] dark:text-[#FCD34D] truncate">
              {summaryMetrics.nextMilestone}
            </p>
            <p className="text-[10px] text-[#526078] dark:text-slate-400 truncate mt-0.5">
              Spaced review &amp; mock drill
            </p>
          </div>
        </div>
      </div>

      {/* 3. Workload Deficit Warning Banner (If syllabus hours > available study time) */}
      {studyPlan?.workloadDeficit?.hasDeficit && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF4D6] dark:bg-[rgba(148,88,0,0.2)] border border-[#FEEA9F] dark:border-[rgba(245,158,11,0.35)] text-[#945800] dark:text-[#FDE68A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#945800] dark:text-[#FDE68A]" />
            <div>
              <h4 className="text-sm font-bold">
                Workload Capacity Alert: Remaining Syllabus Exceeds Available Study Window
              </h4>
              <p className="text-xs mt-0.5">
                {studyPlan.workloadDeficit.priorityNotice}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('availability')}
              className="px-3 py-1.5 rounded-xl bg-[#945800] text-white hover:bg-[#784600] text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Increase Daily Hours
            </button>
          </div>
        </div>
      )}

      {/* 4. Tab Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#334155] overflow-x-auto max-w-full custom-scrollbar whitespace-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-white dark:bg-[#1E293B] text-[#6D28D9] dark:text-[#DDD6FE] shadow-xs'
                : 'text-[#526078] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Study Roadmap</span>
            {studyPlan?.days && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE]">
                {studyPlan.days.length}d
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-white dark:bg-[#1E293B] text-[#6D28D9] dark:text-[#DDD6FE] shadow-xs'
                : 'text-[#526078] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Upcoming Exams ({exams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'availability'
                ? 'bg-white dark:bg-[#1E293B] text-[#6D28D9] dark:text-[#DDD6FE] shadow-xs'
                : 'text-[#526078] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Study Availability &amp; Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-white dark:bg-[#1E293B] text-[#6D28D9] dark:text-[#DDD6FE] shadow-xs'
                : 'text-[#526078] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Focus Timer</span>
          </button>
        </div>

        {/* Quick Real-Time Adjustment Buttons (Visible in roadmap tab) */}
        {activeTab === 'roadmap' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleReportMissedDay()}
              disabled={isRebalancing}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#526078] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Report an unplanned rest day and automatically push uncompleted sessions forward"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-500" />
              <span>Report Missed Day</span>
            </button>
            <button
              onClick={handleRescheduleIncomplete}
              disabled={isRebalancing}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#6D28D9] dark:text-[#DDD6FE] hover:bg-[#EDE9FE]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Re-distribute any uncompleted tasks across upcoming study days without losing completed work"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRebalancing ? 'animate-spin' : ''}`} />
              <span>Rebalance Roadmap</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. TAB 1: INTERACTIVE DAILY STUDY ROADMAP                 */}
      {/* ========================================================= */}
      {activeTab === 'roadmap' && (
        <div className="space-y-5">
          {/* Day Navigation Bar */}
          {studyPlan?.days && studyPlan.days.length > 0 && (
            <div
              className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isLight ? 'bg-white border-[#E1E6EF] shadow-xs' : 'bg-[#131926] border-[#1E2B42] shadow-xs'
              }`}
            >
              {/* Day Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDayIndex(prev => Math.max(0, prev - 1))}
                  disabled={selectedDayIndex === 0}
                  className="p-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] text-[#526078] dark:text-slate-300 hover:bg-[#F0F3F9] dark:hover:bg-[#182236] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center px-2">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-sm font-extrabold text-[#172033] dark:text-white">
                      {currentSelectedDay?.dayOfWeek}, {currentSelectedDay?.date}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-[#F0F3F9] dark:bg-[#182236] text-[#526078] dark:text-slate-300">
                      Day {selectedDayIndex + 1} of {studyPlan.days.length}
                    </span>
                    {currentSelectedDay?.isRestDay && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                        Designated Rest Day
                      </span>
                    )}
                    {currentSelectedDay?.examOnThisDay && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 animate-pulse">
                        🎯 Examination Day: {currentSelectedDay.examOnThisDay.subjectName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#526078] dark:text-slate-400 mt-0.5">
                    {currentSelectedDay?.totalPlannedMinutes ? `${Math.floor(currentSelectedDay.totalPlannedMinutes / 60)}h ${currentSelectedDay.totalPlannedMinutes % 60}m planned` : '0 minutes planned'} • {currentSelectedDay?.sessions?.length || 0} scheduled session(s)
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDayIndex(prev => Math.min(studyPlan.days.length - 1, prev + 1))}
                  disabled={selectedDayIndex === studyPlan.days.length - 1}
                  className="p-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] text-[#526078] dark:text-slate-300 hover:bg-[#F0F3F9] dark:hover:bg-[#182236] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* View Toggle & Today Shortcut */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const todayIdx = studyPlan.days.findIndex(d => d.date === todayStr);
                    if (todayIdx >= 0) setSelectedDayIndex(todayIdx);
                    else setSelectedDayIndex(0);
                    setIsFullPlanView(false);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] text-xs font-bold hover:bg-[#F0F3F9] dark:hover:bg-[#182236] cursor-pointer"
                >
                  Jump to Today
                </button>

                <button
                  onClick={() => setIsFullPlanView(!isFullPlanView)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isFullPlanView
                      ? 'bg-[#7000E8] text-white shadow-xs'
                      : 'border border-[#E1E6EF] dark:border-[#1E2B42] text-[#526078] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isFullPlanView ? 'Viewing Full Multi-Day Plan' : 'View Full Plan'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Render Days: either full plan or selected day */}
          {(!studyPlan || !studyPlan.days || studyPlan.days.length === 0) ? (
            <div
              className={`p-10 rounded-2xl border text-center space-y-3 ${
                isLight ? 'bg-white border-[#E1E6EF]' : 'bg-[#131926] border-[#1E2B42]'
              }`}
            >
              <Calendar className="w-10 h-10 text-[#7000E8] dark:text-[#C4B5FD] mx-auto" />
              <h3 className="text-base font-bold text-[#172033] dark:text-white">
                No Active Study Roadmap Yet
              </h3>
              <p className="text-xs text-[#526078] dark:text-slate-400 max-w-md mx-auto">
                Schedule your upcoming examinations or set your daily study hours to generate an intelligent day-by-day roadmap with spaced revision and realistic session timings.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsAddExamOpen(true)}
                  className="btn-primary text-xs"
                >
                  Schedule Your First Examination
                </button>
                <button
                  onClick={() => handleLoadPresetTemplate('btech-cs-finals')}
                  className="btn-secondary text-xs"
                >
                  Load Sample B.Tech Syllabus
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Day Card(s) */}
              {(isFullPlanView ? studyPlan.days : [currentSelectedDay!]).filter(Boolean).map((day, dIdx) => {
                const dayDateStr = day.date;
                const isExpanded = isFullPlanView ? (expandedDays[dayDateStr] ?? true) : true;
                const completedSessionsInDay = day.sessions.filter(s => s.status === 'completed').length;

                return (
                  <div
                    key={dayDateStr}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      day.examOnThisDay
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                        : day.isRestDay
                        ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/10 dark:bg-amber-950/10'
                        : isLight
                        ? 'bg-white border-[#E1E6EF] shadow-xs'
                        : 'bg-[#131926] border-[#1E2B42] shadow-xs'
                    }`}
                  >
                    {/* Day Card Header */}
                    <div
                      onClick={() => {
                        if (isFullPlanView) {
                          setExpandedDays(prev => ({ ...prev, [dayDateStr]: !isExpanded }));
                        }
                      }}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-[#E1E6EF] dark:border-[#1E2B42] ${
                        isFullPlanView ? 'cursor-pointer hover:bg-[#F0F3F9]/60 dark:hover:bg-[#182236]/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 rounded-xl bg-[#EEE7FF] dark:bg-[rgba(112,0,232,0.18)] text-[#7000E8] dark:text-[#C4B5FD] flex items-center justify-center font-black text-sm shrink-0 border border-[#D1B8FC] dark:border-[rgba(142,48,255,0.35)]">
                          {day.date.slice(8)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white">
                              {day.dayOfWeek}, {day.date}
                            </h3>
                            {day.isRestDay && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Rest / Recovery Day
                              </span>
                            )}
                            {day.examOnThisDay && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                🎯 Exam: {day.examOnThisDay.subjectName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#526078] dark:text-slate-400 mt-0.5">
                            {day.sessions.length} study tasks • {Math.floor(day.totalPlannedMinutes / 60)}h {day.totalPlannedMinutes % 60}m planned ({completedSessionsInDay}/{day.sessions.length} completed)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isFullPlanView && (
                          <span className="text-xs font-bold text-[#526078] dark:text-slate-400 flex items-center gap-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Day Task List */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 space-y-3">
                        {day.sessions.length === 0 ? (
                          <div className="p-6 text-center text-xs text-[#526078] dark:text-slate-400 italic">
                            No study sessions scheduled for this day. Enjoy your scheduled rest or review your personal notes!
                          </div>
                        ) : (
                          day.sessions.map((session, sIdx) => {
                            const isCompleted = session.status === 'completed';
                            const isPartially = session.status === 'partially_completed';
                            const isSkipped = session.status === 'skipped';

                            // Recommended activity badge configuration
                            const activityConfig = {
                              concept: {
                                label: 'Theory & Concept Mastery',
                                color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              },
                              problem_solving: {
                                label: 'Problem Solving & Exercises',
                                color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              },
                              revision: {
                                label: 'Spaced Repetition & Revision',
                                color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              },
                              mock_test: {
                                label: 'Timed Full Mock Simulation',
                                color: 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              },
                              spaced_recall: {
                                label: 'Active Recall & Flash Formulas',
                                color: 'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                              }
                            }[session.sessionType || 'concept'] || {
                              label: 'Core Study Session',
                              color: 'bg-slate-100 text-slate-700'
                            };

                            return (
                              <div
                                key={session.id}
                                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                  isCompleted
                                    ? 'bg-[#E8F7EF]/40 dark:bg-[rgba(8,122,85,0.08)] border-[#A6E9C7] dark:border-[rgba(8,122,85,0.3)] opacity-85'
                                    : isPartially
                                    ? 'bg-[#FFF4D6]/40 dark:bg-[rgba(148,88,0,0.08)] border-[#FEEA9F] dark:border-[rgba(148,88,0,0.3)]'
                                    : isSkipped
                                    ? 'bg-[#F0F3F9]/60 dark:bg-[#182236]/40 border-[#E1E6EF] dark:border-[#1E2B42] opacity-60'
                                    : isLight
                                    ? 'bg-[#F7F8FC] border-[#E1E6EF] hover:border-[#D1B8FC]'
                                    : 'bg-[#182236]/50 border-[#1E2B42] hover:border-[rgba(142,48,255,0.35)]'
                                }`}
                              >
                                {/* Left Info */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* Realistic Time Slot */}
                                    <span className="text-xs font-bold text-[#172033] dark:text-slate-200 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-[#7000E8] dark:text-[#C4B5FD]" />
                                      {session.timeSlot || `${session.durationMinutes} mins`}
                                    </span>

                                    {/* Subject badge */}
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EEE7FF] text-[#7000E8] dark:bg-[rgba(112,0,232,0.2)] dark:text-[#C4B5FD] border border-[#D1B8FC] dark:border-[rgba(142,48,255,0.35)]">
                                      {session.subjectName}
                                    </span>

                                    {/* Recommended Activity tag */}
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${activityConfig.color}`}>
                                      {activityConfig.label}
                                    </span>

                                    {/* Duration */}
                                    <span className="text-[11px] font-medium text-[#526078] dark:text-slate-400">
                                      ⏱ {session.durationMinutes} mins
                                    </span>
                                  </div>

                                  {/* Specific Topic / Chapter */}
                                  <div>
                                    <h4
                                      className={`text-sm sm:text-base font-bold ${
                                        isCompleted
                                          ? 'line-through text-[#087A55] dark:text-[#6EE7B7]'
                                          : isSkipped
                                          ? 'line-through text-[#667085]'
                                          : isLight
                                          ? 'text-[#172033]'
                                          : 'text-white'
                                      }`}
                                    >
                                      {session.topicName}
                                    </h4>
                                    {session.unitOrChapter && (
                                      <p className="text-xs text-[#526078] dark:text-slate-400">
                                        Chapter: {session.unitOrChapter}
                                      </p>
                                    )}
                                  </div>

                                  {/* AI Strategy Advice / Quick Recall Tip */}
                                  {session.aiTip && (
                                    <p className="text-xs text-[#526078] dark:text-slate-300 bg-white/70 dark:bg-[#111827]/70 p-2 rounded-lg border border-[#E1E6EF] dark:border-[#1E2B42] flex items-start gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-[#7000E8] dark:text-[#C4B5FD] shrink-0 mt-0.5" />
                                      <span>{session.aiTip}</span>
                                    </p>
                                  )}
                                </div>

                                {/* Right Actions: Completion Status & Direct Links */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 pt-2 md:pt-0">
                                  {/* Status Selectors */}
                                  <div className="flex items-center gap-1 bg-white dark:bg-[#111827] p-1 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42]">
                                    <button
                                      onClick={() => handleUpdateTaskStatus(session.id, isCompleted ? 'pending' : 'completed')}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                        isCompleted
                                          ? 'bg-[#087A55] text-white shadow-xs'
                                          : 'text-[#526078] dark:text-slate-300 hover:text-[#087A55]'
                                      }`}
                                      title="Mark task completed"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Done</span>
                                    </button>

                                    <button
                                      onClick={() => handleUpdateTaskStatus(session.id, isPartially ? 'pending' : 'partially_completed')}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        isPartially
                                          ? 'bg-[#945800] text-white shadow-xs'
                                          : 'text-[#526078] dark:text-slate-300 hover:text-[#945800]'
                                      }`}
                                      title="Mark as partially completed"
                                    >
                                      <span>Partial</span>
                                    </button>

                                    <button
                                      onClick={() => handleUpdateTaskStatus(session.id, isSkipped ? 'pending' : 'skipped')}
                                      className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        isSkipped
                                          ? 'bg-[#667085] text-white shadow-xs'
                                          : 'text-[#667085] hover:text-[#172033] dark:hover:text-white'
                                      }`}
                                      title="Mark as skipped (can be rescheduled)"
                                    >
                                      <span>Skip</span>
                                    </button>
                                  </div>

                                  {/* Direct Links to Learn & Practice / AI Coach / Focus Timer */}
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        window.location.hash = `learn?topic=${encodeURIComponent(session.topicName)}`;
                                        onNavigate('learn');
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#EEE7FF] dark:bg-[rgba(112,0,232,0.18)] text-[#7000E8] dark:text-[#C4B5FD] text-xs font-bold hover:bg-[#D1B8FC]/40 transition cursor-pointer flex items-center gap-1"
                                      title="Launch 30-Question Diagnostic Quiz & Theory in Learn & Practice"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                      <span>Practice Quiz</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setCoachModalInfo({
                                          isOpen: true,
                                          subjectName: session.subjectName,
                                          topicName: session.topicName,
                                          difficulty: session.priority === 'high' ? 'Hard' : 'Medium',
                                          confidence: 'Average'
                                        });
                                      }}
                                      className="p-1.5 rounded-lg border border-[#E1E6EF] dark:border-[#1E2B42] text-[#526078] dark:text-slate-300 hover:text-[#7000E8] dark:hover:text-white cursor-pointer"
                                      title="Ask AI Topic Coach for active recall questions and exam pitfalls"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        setCurrentTopicFocus(`${session.subjectName} — ${session.topicName}`);
                                        setTimerSeconds(session.durationMinutes * 60 || 25 * 60);
                                        setActiveTab('timer');
                                      }}
                                      className="p-1.5 rounded-lg border border-[#E1E6EF] dark:border-[#1E2B42] text-[#526078] dark:text-slate-300 hover:text-[#7000E8] dark:hover:text-white cursor-pointer"
                                      title="Launch timed Pomodoro block for this topic"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Strategy Tips Card */}
          {studyPlan?.aiStrategyTips && studyPlan.aiStrategyTips.length > 0 && (
            <div
              className={`p-5 sm:p-6 rounded-2xl border ${
                isLight ? 'bg-white border-[#E1E6EF]' : 'bg-[#131926] border-[#1E2B42]'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#7000E8] dark:text-[#C4B5FD]" />
                <h3 className="text-sm font-bold text-[#172033] dark:text-white">
                  Strategic Study Plan Commentary &amp; Exam Insights
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {studyPlan.aiStrategyTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42] text-xs font-medium text-[#172033] dark:text-slate-200 flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#EEE7FF] text-[#7000E8] dark:bg-[rgba(112,0,232,0.2)] dark:text-[#C4B5FD] flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. TAB 2: UPCOMING EXAMINATIONS DECK                     */}
      {/* ========================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#172033] dark:text-white">
                Scheduled Examinations
              </h2>
              <p className="text-xs text-[#526078] dark:text-slate-400">
                Manage upcoming exam dates, weights, and syllabus completion. Modifying exams automatically refreshes your roadmap.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingExamId(null);
                setFormSubjectName('');
                setFormExamNotes('');
                setIsAddExamOpen(true);
              }}
              className="btn-primary text-xs gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Exam</span>
            </button>
          </div>

          {exams.length === 0 ? (
            <div
              className={`p-10 rounded-2xl border text-center space-y-3 ${
                isLight ? 'bg-white border-[#E1E6EF]' : 'bg-[#131926] border-[#1E2B42]'
              }`}
            >
              <Calendar className="w-10 h-10 text-[#7000E8] dark:text-[#C4B5FD] mx-auto" />
              <h3 className="text-base font-bold text-[#172033] dark:text-white">
                No Examinations Added Yet
              </h3>
              <p className="text-xs text-[#526078] dark:text-slate-400 max-w-md mx-auto">
                Add your upcoming examinations to activate urgent countdown timers and distribute syllabus topics across your available daily study hours.
              </p>
              <button
                onClick={() => setIsAddExamOpen(true)}
                className="btn-primary text-xs"
              >
                + Schedule First Examination
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map(exam => {
                const countdown = getCountdown(exam.exam_date);
                const isCompleted = exam.status === 'completed';

                return (
                  <div
                    key={exam.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCompleted
                        ? 'opacity-60 bg-[#F0F3F9] dark:bg-[#182236] border-[#E1E6EF] dark:border-[#1E2B42]'
                        : countdown.isUrgent
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 shadow-xs'
                        : isLight
                        ? 'bg-white border-[#E1E6EF] shadow-xs'
                        : 'bg-[#131926] border-[#1E2B42] shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Priority and Countdown */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            exam.priority === 'high'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : exam.priority === 'medium'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {exam.priority.toUpperCase()} PRIORITY
                        </span>

                        <span
                          className={`text-xs font-black flex items-center gap-1 ${
                            countdown.isUrgent
                              ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                              : 'text-[#526078] dark:text-slate-400'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {countdown.text}
                        </span>
                      </div>

                      {/* Subject Name & Date */}
                      <h3 className="text-base sm:text-lg font-bold text-[#172033] dark:text-white mt-3">
                        {exam.subject_name}
                      </h3>
                      <p className="text-xs text-[#526078] dark:text-slate-400 mt-0.5">
                        🗓 {exam.exam_date} • ⏰ {exam.exam_time || '10:00 AM'}
                      </p>

                      {/* Notes / Topics summary */}
                      {exam.notes && (
                        <p className="text-xs mt-2.5 p-2 rounded-lg bg-[#F0F3F9] dark:bg-[#182236] text-[#526078] dark:text-slate-300 line-clamp-2">
                          {exam.notes}
                        </p>
                      )}

                      {/* Syllabus Progress */}
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-[#526078] dark:text-slate-400">
                            Syllabus Completed:
                          </span>
                          <span className="font-bold text-[#7000E8] dark:text-[#C4B5FD]">
                            {exam.syllabus_completion_percent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#E1E6EF] dark:bg-[#1E2B42] overflow-hidden">
                          <div
                            className="h-full bg-[#7000E8] rounded-full transition-all"
                            style={{ width: `${Math.min(100, exam.syllabus_completion_percent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-[#E1E6EF] dark:border-[#1E2B42] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleMarkExamCompleted(exam)}
                        className={`text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          isCompleted
                            ? 'text-emerald-600 hover:text-emerald-700'
                            : 'text-[#526078] hover:text-[#172033] dark:hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            window.location.hash = `learn?topic=${encodeURIComponent(exam.subject_name)}`;
                            onNavigate('learn');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#EEE7FF] text-[#7000E8] dark:bg-[rgba(112,0,232,0.2)] dark:text-[#C4B5FD] text-xs font-bold hover:bg-[#D1B8FC]/40 cursor-pointer"
                        >
                          Practice Quiz
                        </button>
                        <button
                          onClick={() => {
                            setEditingExamId(exam.id);
                            setFormSubjectName(exam.subject_name);
                            setFormExamDate(exam.exam_date);
                            setFormExamTime(exam.exam_time || '10:00 AM');
                            setFormExamPriority(exam.priority);
                            setFormSyllabusPercent(exam.syllabus_completion_percent || 0);
                            setFormExamNotes(exam.notes || '');
                            setIsAddExamOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-[#526078] hover:text-[#172033] dark:hover:text-white cursor-pointer"
                          title="Edit Exam"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-1.5 rounded-lg text-[#526078] hover:text-rose-600 cursor-pointer"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TAB 3: STUDY AVAILABILITY & CONSTRAINTS CONFIG         */}
      {/* ========================================================= */}
      {activeTab === 'availability' && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border max-w-3xl mx-auto space-y-6 ${
            isLight ? 'bg-white border-[#E1E6EF] shadow-xs' : 'bg-[#131926] border-[#1E2B42] shadow-xs'
          }`}
        >
          <div>
            <h2 className="text-xl font-bold text-[#172033] dark:text-white">
              Daily Study Availability &amp; Routine Constraints
            </h2>
            <p className="text-xs sm:text-sm text-[#526078] dark:text-slate-400 mt-1">
              Configure how much time you can realistically study each day, your preferred timed study hours, and rest days. The intelligent roadmap generator distributes workload accordingly.
            </p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm">
            {/* 1. Daily Study Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42] space-y-2">
                <label className="font-bold text-[#172033] dark:text-white flex items-center justify-between">
                  <span>Weekday Study Time</span>
                  <span className="text-[#7000E8] dark:text-[#C4B5FD] font-extrabold">
                    {availability.dailyHoursWeekday} hours / day
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={0.5}
                  value={availability.dailyHoursWeekday}
                  onChange={e => setAvailability(prev => ({ ...prev, dailyHoursWeekday: Number(e.target.value) }))}
                  className="w-full accent-[#7000E8] cursor-pointer"
                />
                <p className="text-[11px] text-[#526078] dark:text-slate-400">
                  Total daily capacity on Monday through Friday.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42] space-y-2">
                <label className="font-bold text-[#172033] dark:text-white flex items-center justify-between">
                  <span>Weekend Study Time</span>
                  <span className="text-[#7000E8] dark:text-[#C4B5FD] font-extrabold">
                    {availability.dailyHoursWeekend} hours / day
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={availability.dailyHoursWeekend}
                  onChange={e => setAvailability(prev => ({ ...prev, dailyHoursWeekend: Number(e.target.value) }))}
                  className="w-full accent-[#7000E8] cursor-pointer"
                />
                <p className="text-[11px] text-[#526078] dark:text-slate-400">
                  Target study capacity on Saturday and Sunday.
                </p>
              </div>
            </div>

            {/* 2. Preferred Timed Sessions: Start and End Time */}
            <div className="p-4 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42] space-y-3">
              <h4 className="font-bold text-[#172033] dark:text-white">
                Preferred Study Session Time Window
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#526078] dark:text-slate-300 mb-1">
                    Daily Study Start Time
                  </label>
                  <input
                    type="text"
                    value={availability.startTime || '08:30 AM'}
                    onChange={e => setAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                    placeholder="e.g. 08:30 AM or 18:00"
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-white dark:bg-[#111827] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#526078] dark:text-slate-300 mb-1">
                    Study End / Wind-down Time
                  </label>
                  <input
                    type="text"
                    value={availability.endTime || '01:00 PM'}
                    onChange={e => setAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                    placeholder="e.g. 01:00 PM or 22:30"
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-white dark:bg-[#111827] text-xs font-semibold"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#526078] dark:text-slate-400">
                The scheduler uses this window to assign non-overlapping start/end times with realistic breaks.
              </p>
            </div>

            {/* 3. Session Block Length & Break Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42] space-y-2">
                <label className="font-bold text-[#172033] dark:text-white">
                  Preferred Session Block Duration
                </label>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[25, 40, 50, 60].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setAvailability(prev => ({ ...prev, sessionDurationMinutes: mins }))}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        (availability.sessionDurationMinutes || 45) === mins
                          ? 'bg-[#7000E8] text-white shadow-xs'
                          : 'bg-white dark:bg-[#111827] text-[#526078] dark:text-slate-300 border border-[#E1E6EF] dark:border-[#1E2B42]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#526078] dark:text-slate-400">
                  {availability.sessionDurationMinutes === 25 ? 'Pomodoro focus rhythm' : 'Deep work block length'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42] space-y-2">
                <label className="font-bold text-[#172033] dark:text-white">
                  Break Duration Between Sessions
                </label>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[5, 10, 15].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setAvailability(prev => ({ ...prev, breakDurationMinutes: mins }))}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        (availability.breakDurationMinutes ?? 10) === mins
                          ? 'bg-[#7000E8] text-white shadow-xs'
                          : 'bg-white dark:bg-[#111827] text-[#526078] dark:text-slate-300 border border-[#E1E6EF] dark:border-[#1E2B42]'
                      }`}
                    >
                      {mins}m Break
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#526078] dark:text-slate-400">
                  Rest interval between consecutive study sessions.
                </p>
              </div>
            </div>

            {/* 4. Available Study Days & Rest Days */}
            <div className="p-4 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42] space-y-2">
              <label className="font-bold text-[#172033] dark:text-white block">
                Designated Rest Days (Optional)
              </label>
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const isRest = availability.restDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setAvailability(prev => {
                          const updated = isRest
                            ? prev.restDays.filter(d => d !== day)
                            : [...prev.restDays, day];
                          return { ...prev, restDays: updated };
                        });
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-0.5 ${
                        isRest
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          : 'bg-white dark:bg-[#111827] text-[#526078] dark:text-slate-300 border border-[#E1E6EF] dark:border-[#1E2B42]'
                      }`}
                    >
                      <span>{day.slice(0, 3)}</span>
                      <span className="text-[9px] font-semibold">{isRest ? 'Rest' : 'Study'}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#526078] dark:text-slate-400">
                Rest days prevent burnout by allocating zero mandatory sessions.
              </p>
            </div>

            {/* 5. Existing Commitments */}
            <div>
              <label className="block font-bold text-[#172033] dark:text-white mb-1">
                Existing Commitments or Unavailable Periods (Optional)
              </label>
              <input
                type="text"
                value={availability.commitmentsNote || ''}
                onChange={e => setAvailability(prev => ({ ...prev, commitmentsNote: e.target.value }))}
                placeholder="e.g. College lectures 9:00 AM – 2:00 PM, Gym 5:00 PM – 6:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-white dark:bg-[#111827] text-xs"
              />
            </div>

            {/* Save & Recalculate Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRecalculateRoadmap}
                disabled={isRebalancing}
                className="btn-primary text-xs sm:text-sm font-bold gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isRebalancing ? 'Recalculating...' : 'Recalculate Daily Roadmap'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. TAB 4: POMODORO FOCUS TIMER                            */}
      {/* ========================================================= */}
      {activeTab === 'timer' && (
        <div
          className={`p-6 sm:p-10 rounded-2xl border text-center max-w-2xl mx-auto transition-all ${
            isLight ? 'bg-white border-[#E1E6EF] shadow-xs' : 'bg-[#131926] border-[#1E2B42] shadow-xs'
          }`}
        >
          <div className="space-y-2">
            <span
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                timerMode === 'work'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {timerMode === 'work' ? 'Deep Work Focus Block' : 'Restorative Break'}
            </span>
            <h3 className="text-base font-bold text-[#172033] dark:text-white truncate pt-1">
              Target: {currentTopicFocus}
            </h3>
          </div>

          {/* Time Display */}
          <div className="my-8">
            <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-[#172033] dark:text-white">
              {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
              {String(timerSeconds % 60).padStart(2, '0')}
            </span>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer ${
                isTimerRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'btn-primary text-white'
              }`}
            >
              {isTimerRunning ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              <span>{isTimerRunning ? 'Pause Session' : 'Start Focus Block'}</span>
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(timerMode === 'work' ? (availability.sessionDurationMinutes || 25) * 60 : 5 * 60);
              }}
              className="p-3 rounded-2xl border border-[#E1E6EF] dark:border-[#1E2B42] text-[#526078] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#526078] dark:text-slate-400 mt-6">
            Completed today: <strong>{completedSessionsCount} sessions</strong> ({completedSessionsCount * (availability.sessionDurationMinutes || 25)} mins of focused work).
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. MODAL: ENHANCED SCHEDULE / EDIT EXAMINATION WORKFLOW   */}
      {/* ========================================================= */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
              isLight ? 'bg-white border-[#E1E6EF]' : 'bg-[#131926] border-[#1E2B42]'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E1E6EF] dark:border-[#1E2B42] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#7000E8] dark:text-[#C4B5FD]" />
                <div>
                  <h3 className="text-base font-bold text-[#172033] dark:text-white">
                    {editingExamId ? 'Edit Examination Schedule' : 'Schedule New Examination'}
                  </h3>
                  <p className="text-xs text-[#526078] dark:text-slate-400">
                    Add syllabus topics, priorities, and completed chapters to build your daily roadmap.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddExamOpen(false)}
                className="p-1.5 rounded-lg text-[#526078] hover:text-[#172033] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveExam} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Preset Curriculum Quick Fill */}
              <div className="p-3 rounded-xl bg-[#EEE7FF]/40 dark:bg-[rgba(112,0,232,0.12)] border border-[#D1B8FC] dark:border-[rgba(142,48,255,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-semibold text-[#7000E8] dark:text-[#C4B5FD]">
                  ⚡ Fast Setup: Load Pre-Built Syllabus Template:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EXAM_PRESET_TEMPLATES.map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleLoadPresetTemplate(tmpl.id)}
                      className="px-2 py-1 rounded-md bg-white dark:bg-[#111827] border border-[#D1B8FC] dark:border-[rgba(142,48,255,0.3)] text-[#7000E8] dark:text-[#C4B5FD] font-bold text-[10px] hover:bg-[#EEE7FF] cursor-pointer"
                    >
                      {tmpl.category.slice(0, 15)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#172033] dark:text-slate-300">
                    Exam Name / Examination Type *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm 1, Final Semester Exam, GATE"
                    value={formExamType}
                    onChange={e => setFormExamType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-transparent text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#172033] dark:text-slate-300">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures & Algorithms"
                    value={formSubjectName}
                    onChange={e => setFormSubjectName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-transparent text-xs"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#172033] dark:text-slate-300">
                    Examination Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={formExamDate}
                    onChange={e => setFormExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#172033] dark:text-slate-300">
                    Exam Time Slot
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={formExamTime}
                    onChange={e => setFormExamTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-transparent text-xs"
                  />
                </div>
              </div>

              {/* Priority Tier */}
              <div>
                <label className="block font-semibold mb-1 text-[#172033] dark:text-slate-300">
                  Priority Tier
                </label>
                <select
                  value={formExamPriority}
                  onChange={e => setFormExamPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-transparent text-xs"
                >
                  <option value="high">High Priority (Major Credit Exam / Highest Impact)</option>
                  <option value="medium">Medium Priority (Standard Midterm / Assessment)</option>
                  <option value="low">Low Priority (Quiz / Minor Elective)</option>
                </select>
              </div>

              {/* Syllabus Topics Builder */}
              <div className="space-y-2 pt-2 border-t border-[#E1E6EF] dark:border-[#1E2B42]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#172033] dark:text-white">
                    Syllabus Topics &amp; Chapters ({formTopics.length})
                  </label>
                  <span className="text-[11px] text-[#526078] dark:text-slate-400">
                    Check topics you have already completed
                  </span>
                </div>

                {/* Topics List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {formTopics.map(t => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-[#F0F3F9]/60 dark:bg-[#182236]/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTopicCompletedInForm(t.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer shrink-0 ${
                            t.isCompleted
                              ? 'bg-[#087A55] border-[#087A55] text-white'
                              : 'border-[#667085]'
                          }`}
                          title="Mark already completed"
                        >
                          {t.isCompleted && <Check className="w-3 h-3" />}
                        </button>
                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${t.isCompleted ? 'line-through text-[#667085]' : 'text-[#172033] dark:text-white'}`}>
                            {t.name}
                          </p>
                          <p className="text-[10px] text-[#526078] dark:text-slate-400">
                            {t.unitOrChapter} • {t.difficulty} Difficulty • {t.weightage} Priority • ⏱ {t.estimatedMinutes}m
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTopicFromForm(t.id)}
                        className="text-[#667085] hover:text-rose-600 p-1 cursor-pointer shrink-0"
                        title="Remove topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Topic Input Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={e => setNewTopicInput(e.target.value)}
                    placeholder="Enter chapter or topic name..."
                    className="flex-1 w-full px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-transparent text-xs"
                  />
                  <input
                    type="text"
                    value={newTopicUnit}
                    onChange={e => setNewTopicUnit(e.target.value)}
                    placeholder="Chapter / Unit"
                    className="w-full sm:w-28 px-3 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-transparent text-xs"
                  />
                  <select
                    value={newTopicDifficulty}
                    onChange={e => setNewTopicDifficulty(e.target.value as any)}
                    className="w-full sm:w-28 px-2 py-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] bg-transparent text-xs"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddTopicToForm}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#7000E8] text-white font-bold text-xs hover:bg-[#5B00C4] cursor-pointer shrink-0"
                  >
                    + Add Topic
                  </button>
                </div>
              </div>

              {/* Form Validation Error Banner */}
              {examFormError && (
                <div className="p-3 rounded-xl bg-[#FEECEC] dark:bg-[rgba(180,35,24,0.2)] border border-[#FECDCA] dark:border-[rgba(239,68,68,0.35)] text-[#B42318] dark:text-[#FCA5A5] font-semibold text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{examFormError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#E1E6EF] dark:border-[#1E2B42] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#526078] hover:text-[#172033] dark:text-slate-300 dark:hover:text-white cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingExam}
                  className="btn-primary px-5 py-2 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingExam ? 'Generating Plan...' : editingExamId ? 'Update Exam & Roadmap' : 'Save & Generate Daily Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. AI Topic Coach Modal */}
      <TopicAICoachModal
        isOpen={coachModalInfo.isOpen}
        onClose={() => setCoachModalInfo(prev => ({ ...prev, isOpen: false }))}
        subjectName={coachModalInfo.subjectName}
        topicName={coachModalInfo.topicName}
        difficulty={coachModalInfo.difficulty}
        confidence={coachModalInfo.confidence}
      />
    </div>
  );
};
