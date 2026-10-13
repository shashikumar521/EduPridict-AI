import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Flame,
  ArrowRight,
  RefreshCw,
  Info,
  Wand2,
  CalendarDays,
  Sliders,
  Printer,
  Download,
  Copy,
  Check,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Layers,
  ChevronRight,
  ListFilter,
  CheckSquare,
  BookmarkCheck,
  Target,
  Edit3
} from 'lucide-react';
import {
  ExamStudyPlan,
  ExamSubject,
  ExamTopic,
  StudyAvailability,
  ScheduledStudySession,
  TopicDifficulty,
  TopicConfidence,
  TopicWeightage,
  StudyPlannerTask
} from '../types';
import { EXAM_PRESET_TEMPLATES } from '../data/examTemplates';
import {
  fetchExamStudyPlan,
  generateExamStudyPlan,
  updateExamSessionStatus,
  rebalanceExamSchedule,
  fetchAIScheduleAdvice,
  fetchPlannerTasks,
  addPlannerTask,
  updatePlannerTaskStatus,
  deletePlannerTask
} from '../services/api';
import { TopicAICoachModal } from './TopicAICoachModal';

export const StudyPlannerView: React.FC = () => {
  // Navigation tabs within planner: 'schedule' | 'builder' | 'habits'
  const [activeTab, setActiveTab] = useState<'schedule' | 'builder' | 'habits'>('schedule');

  // Exam Study Plan state
  const [plan, setPlan] = useState<ExamStudyPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [isRefreshingAdvice, setIsRefreshingAdvice] = useState(false);

  // Filter & Search in Schedule
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  // Form Builder state
  const [examName, setExamName] = useState('Semester 4 Final Examinations');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [subjects, setSubjects] = useState<ExamSubject[]>(EXAM_PRESET_TEMPLATES[0].subjects);
  const [availability, setAvailability] = useState<StudyAvailability>(EXAM_PRESET_TEMPLATES[0].availability);

  // Topic AI Coach Modal State
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

  // Pomodoro Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timerTopic, setTimerTopic] = useState<string>('Data Structures - Core Concept Review');

  // Tasks from quick habits
  const [quickTasks, setQuickTasks] = useState<StudyPlannerTask[]>([]);
  const [newQuickTitle, setNewQuickTitle] = useState('');
  const [newQuickSubject, setNewQuickSubject] = useState('Data Structures');

  // 1. Load active plan and tasks
  const loadPlan = useCallback(async () => {
    setIsLoadingPlan(true);
    try {
      const data = await fetchExamStudyPlan();
      if (data && data.days && data.days.length > 0) {
        setPlan(data);
        setExamName(data.examName);
        setSubjects(data.subjects);
        setAvailability(data.availability);
      } else {
        // Auto-generate default initial plan from template if none exists
        const defaultPreset = EXAM_PRESET_TEMPLATES[0];
        const initial = await generateExamStudyPlan({
          exam_name: defaultPreset.name,
          subjects: defaultPreset.subjects,
          availability: defaultPreset.availability
        });
        setPlan(initial);
      }
    } catch (err) {
      console.error('Failed to load exam study plan:', err);
    } finally {
      setIsLoadingPlan(false);
    }
  }, []);

  const loadQuickTasks = useCallback(async () => {
    try {
      const tasks = await fetchPlannerTasks();
      setQuickTasks(tasks);
    } catch (err) {
      console.error('Failed to fetch quick tasks:', err);
    }
  }, []);

  useEffect(() => {
    loadPlan();
    loadQuickTasks();
  }, [loadPlan, loadQuickTasks]);

  // Pomodoro Interval Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (timerMode === 'work') {
        setTimerMode('break');
        setTimerSeconds(5 * 60);
      } else {
        setTimerMode('work');
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. Preset Template Loader
  const handleLoadPreset = (presetId: string) => {
    const found = EXAM_PRESET_TEMPLATES.find((p) => p.id === presetId);
    if (!found) return;
    setExamName(found.name);
    setSubjects(JSON.parse(JSON.stringify(found.subjects)));
    setAvailability(JSON.parse(JSON.stringify(found.availability)));
  };

  // 3. Subject and Topic Form Management
  const handleAddSubject = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14 + subjects.length * 4);
    const newSub: ExamSubject = {
      id: `sub-${Date.now()}`,
      name: 'New Academic Subject',
      examDate: nextDate.toISOString().slice(0, 10),
      topics: [
        {
          id: `top-${Date.now()}-1`,
          name: 'Core Module 1: Foundational Principles',
          unitOrChapter: 'Unit 1',
          difficulty: 'Medium',
          confidence: 'Average',
          weightage: 'High',
          estimatedMinutes: 60
        }
      ]
    };
    setSubjects([...subjects, newSub]);
  };

  const handleRemoveSubject = (subId: string) => {
    if (subjects.length <= 1) {
      alert('You need at least one subject in your exam schedule.');
      return;
    }
    setSubjects(subjects.filter((s) => s.id !== subId));
  };

  const handleUpdateSubjectField = (subId: string, field: 'name' | 'examDate', val: string) => {
    setSubjects(
      subjects.map((s) => (s.id === subId ? { ...s, [field]: val } : s))
    );
  };

  const handleAddTopic = (subId: string) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id !== subId) return s;
        const newTop: ExamTopic = {
          id: `top-${Date.now()}`,
          name: `Topic ${s.topics.length + 1}: Important Concept`,
          unitOrChapter: `Unit ${s.topics.length + 1}`,
          difficulty: 'Medium',
          confidence: 'Average',
          weightage: 'High',
          estimatedMinutes: 50
        };
        return { ...s, topics: [...s.topics, newTop] };
      })
    );
  };

  const handleRemoveTopic = (subId: string, topicId: string) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id !== subId) return s;
        if (s.topics.length <= 1) {
          alert('Every subject must contain at least one topic.');
          return s;
        }
        return { ...s, topics: s.topics.filter((t) => t.id !== topicId) };
      })
    );
  };

  const handleUpdateTopicField = (
    subId: string,
    topicId: string,
    field: keyof ExamTopic,
    val: any
  ) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id !== subId) return s;
        return {
          ...s,
          topics: s.topics.map((t) => (t.id === topicId ? { ...t, [field]: val } : t))
        };
      })
    );
  };

  // 4. Generate New Schedule Action
  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateExamStudyPlan({
        exam_name: examName.trim() || 'Upcoming Examinations',
        start_date: startDate,
        subjects,
        availability
      });
      setPlan(generated);
      setActiveTab('schedule');
    } catch (err: any) {
      console.error('Error generating schedule:', err);
      alert('Failed to generate schedule: ' + (err?.message || 'Please check input data.'));
    } finally {
      setIsGenerating(false);
    }
  };

  // 5. Interactive Session Status Toggle (Checkbox / Needs Review)
  const handleToggleSessionStatus = async (
    sessionId: string,
    currentStatus: 'pending' | 'completed' | 'needs_review'
  ) => {
    if (!plan || !plan.id) return;

    const nextStatus: 'pending' | 'completed' = currentStatus === 'completed' ? 'pending' : 'completed';

    // Optimistic UI Update
    const updatedDays = plan.days.map((d) => ({
      ...d,
      sessions: d.sessions.map((sess): ScheduledStudySession => {
        if (sess.id === sessionId) {
          return {
            ...sess,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined
          };
        }
        return sess;
      })
    }));

    let completedCount = 0;
    let completedMins = 0;
    for (const d of updatedDays) {
      for (const s of d.sessions) {
        if (s.status === 'completed') {
          completedCount++;
          completedMins += s.durationMinutes || 0;
        }
      }
    }

    setPlan({
      ...plan,
      days: updatedDays,
      completedTopics: completedCount,
      completedHours: Number((completedMins / 60).toFixed(1))
    });

    try {
      await updateExamSessionStatus(plan.id, sessionId, nextStatus);
    } catch (err) {
      console.error('Failed to update session status on server:', err);
      // Re-fetch to synchronize state
      loadPlan();
    }
  };

  const handleMarkNeedsReview = async (sessionId: string) => {
    if (!plan || !plan.id) return;

    // Optimistic UI update
    const updatedDays = plan.days.map((d) => ({
      ...d,
      sessions: d.sessions.map((sess): ScheduledStudySession => {
        if (sess.id === sessionId) {
          return { ...sess, status: 'needs_review' as const };
        }
        return sess;
      })
    }));

    setPlan({ ...plan, days: updatedDays });

    try {
      await updateExamSessionStatus(plan.id, sessionId, 'needs_review');
    } catch (err) {
      console.error('Failed to flag review status:', err);
    }
  };

  // 6. Smart Rebalance Schedule Action
  const handleRebalance = async () => {
    if (!plan || !plan.id) return;
    setIsRebalancing(true);
    try {
      const rebalanced = await rebalanceExamSchedule(plan.id, plan, availability);
      setPlan(rebalanced);
    } catch (err: any) {
      console.error('Failed to rebalance schedule:', err);
      alert('Could not rebalance schedule: ' + (err?.message || 'Internal error'));
    } finally {
      setIsRebalancing(false);
    }
  };

  // 7. Refresh AI Advice
  const handleRefreshAIAdvice = async () => {
    if (!plan) return;
    setIsRefreshingAdvice(true);
    try {
      const tips = await fetchAIScheduleAdvice(plan);
      setPlan({ ...plan, aiStrategyTips: tips });
    } catch (err) {
      console.error('Failed to refresh AI advice:', err);
    } finally {
      setIsRefreshingAdvice(false);
    }
  };

  // 8. Open AI Coach Modal for specific session
  const handleOpenAICoach = (sess: ScheduledStudySession) => {
    const parentSub = plan?.subjects.find((s) => s.id === sess.subjectId);
    const parentTopic = parentSub?.topics.find((t) => t.id === sess.topicId);

    setCoachModalInfo({
      isOpen: true,
      subjectName: sess.subjectName,
      topicName: sess.topicName,
      difficulty: parentTopic?.difficulty || 'Medium',
      confidence: parentTopic?.confidence || 'Average'
    });
  };

  // 9. Export iCalendar (.ics)
  const handleExportICS = () => {
    if (!plan) return;
    let icsContent =
      'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//EduPredict AI//Exam Study Planner//EN\nCALSCALE:GREGORIAN\n';
    for (const day of plan.days) {
      for (const sess of day.sessions) {
        const dateClean = sess.date.replace(/-/g, '');
        icsContent += 'BEGIN:VEVENT\n';
        icsContent += `SUMMARY:EduPredict: ${sess.subjectName} - ${sess.topicName}\n`;
        icsContent += `DESCRIPTION:${sess.topicName} (${sess.sessionType}, ${sess.durationMinutes} mins). Priority: ${sess.priority}. ${sess.aiTip || ''}\n`;
        icsContent += `DTSTART;VALUE=DATE:${dateClean}\n`;
        icsContent += `DTEND;VALUE=DATE:${dateClean}\n`;
        icsContent += `STATUS:${sess.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}\n`;
        icsContent += 'END:VEVENT\n';
      }
    }
    icsContent += 'END:VCALENDAR';
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${plan.examName.replace(/\s+/g, '_')}_Schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 10. Copy schedule text to clipboard
  const handleCopyScheduleText = () => {
    if (!plan) return;
    let txt = `📚 EduPredict AI Exam Study Schedule: ${plan.examName}\n`;
    txt += `Timeline: ${plan.startDate} to ${plan.endDate} (${plan.totalHoursPlanned} planned hours)\n\n`;
    for (const day of plan.days) {
      txt += `📅 ${day.date} (${day.dayOfWeek}):\n`;
      if (day.isRestDay) {
        txt += `   🌿 Rest / Recharge Day\n`;
      } else if (day.sessions.length === 0) {
        txt += `   No sessions scheduled\n`;
      } else {
        for (const s of day.sessions) {
          const statusMark = s.status === 'completed' ? '✅' : (s.status === 'needs_review' ? '⚠️' : '⏳');
          txt += `   ${statusMark} [${s.durationMinutes}m] ${s.subjectName} — ${s.topicName} (${s.sessionType})\n`;
        }
      }
      txt += '\n';
    }
    navigator.clipboard.writeText(txt);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2000);
  };

  // Filtered Sessions View Calculation
  const filteredDays = useMemo(() => {
    if (!plan) return [];
    return plan.days.map((day) => {
      let filteredSessions = day.sessions;
      if (selectedSubjectFilter !== 'all') {
        filteredSessions = filteredSessions.filter(
          (s) => s.subjectId === selectedSubjectFilter || s.subjectName === selectedSubjectFilter
        );
      }
      if (statusFilter !== 'all') {
        filteredSessions = filteredSessions.filter((s) => s.status === statusFilter);
      }
      return {
        ...day,
        sessions: filteredSessions
      };
    });
  }, [plan, selectedSubjectFilter, statusFilter]);

  // Overall metrics calculation
  const totalSessionsCount = useMemo(() => {
    if (!plan) return 0;
    return plan.days.reduce((acc, d) => acc + d.sessions.length, 0);
  }, [plan]);

  const completedSessionsCount = useMemo(() => {
    if (!plan) return 0;
    return plan.days.reduce(
      (acc, d) => acc + d.sessions.filter((s) => s.status === 'completed').length,
      0
    );
  }, [plan]);

  const completionPercent = totalSessionsCount > 0
    ? Math.round((completedSessionsCount / totalSessionsCount) * 100)
    : 0;

  // Session Type Styling Helper
  const getSessionTypeBadge = (type: string) => {
    switch (type) {
      case 'concept':
        return {
          label: 'Concept Mastery',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'problem_solving':
        return {
          label: 'Problem Practice',
          bg: 'bg-sky-50 text-sky-700 border-sky-200'
        };
      case 'spaced_recall':
        return {
          label: 'Spaced Recall',
          bg: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'mock_test':
        return {
          label: 'Exam Mock Test',
          bg: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'revision':
        return {
          label: 'Buffer Revision',
          bg: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      default:
        return {
          label: 'Study Block',
          bg: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Exam Scheduler & Personalized Study Planner</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Algorithmic & Gemini Assisted</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            AI Exam Scheduler & Study Planner
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Generate an intelligent, day-wise study timetable calibrated to your exact exam dates, topic difficulty, confidence ratings, and daily study hour budget.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Study Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Syllabus & Exams</span>
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'habits'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Focus Timer</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: BUILDER / SYLLABUS INPUT FORM */}
      {activeTab === 'builder' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-7">
          {/* Preset Buttons Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-600" />
                <span>Quick-Start Presets (1-Click Sample Syllabi)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Preload common exam structures so you don't have to type every topic from scratch.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {EXAM_PRESET_TEMPLATES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Exam Name / Semester Target
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. Semester 4 Final Examinations"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Preparation Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50/50"
              />
            </div>
          </div>

          {/* Daily Study Availability Card */}
          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Daily Study Availability & Routine Constraints</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  The algorithm strictly honors these hours so the timetable remains realistic and achievable.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Weekday Available Hours
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={availability.dailyHoursWeekday}
                    onChange={(e) =>
                      setAvailability({
                        ...availability,
                        dailyHoursWeekday: Math.max(1, Math.min(12, Number(e.target.value) || 3))
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">hrs/day</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Weekend Available Hours
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    step="0.5"
                    value={availability.dailyHoursWeekend}
                    onChange={(e) =>
                      setAvailability({
                        ...availability,
                        dailyHoursWeekend: Math.max(1, Math.min(14, Number(e.target.value) || 4))
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">hrs/day</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={availability.preferredTimeSlot}
                  onChange={(e) =>
                    setAvailability({
                      ...availability,
                      preferredTimeSlot: e.target.value as any
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="morning">Morning (6:00 - 10:00)</option>
                  <option value="afternoon">Afternoon (14:00 - 18:00)</option>
                  <option value="evening">Evening (18:00 - 22:00)</option>
                  <option value="night">Night (21:00 - 01:00)</option>
                  <option value="flexible">Flexible / Any Slot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Rest / Break Day
                </label>
                <select
                  value={availability.restDays[0] || 'none'}
                  onChange={(e) =>
                    setAvailability({
                      ...availability,
                      restDays: e.target.value === 'none' ? [] : [e.target.value]
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Sunday">Sunday (Full Rest)</option>
                  <option value="Saturday">Saturday (Full Rest)</option>
                  <option value="none">No Rest Days (Intensive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Revision Buffer
                </label>
                <select
                  value={availability.revisionBufferDays}
                  onChange={(e) =>
                    setAvailability({
                      ...availability,
                      revisionBufferDays: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={1}>1 Day before each exam</option>
                  <option value={2}>2 Days before each exam</option>
                  <option value={3}>3 Days before each exam</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subjects & Topics Syllabus Builder */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Subjects & Detailed Syllabus Topic List</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define individual exam dates, units, difficulty, confidence, and exam weightage for each topic.
                </p>
              </div>
              <button
                onClick={handleAddSubject}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Subject</span>
              </button>
            </div>

            {/* Subject Cards */}
            <div className="space-y-6">
              {subjects.map((sub, sIdx) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4"
                >
                  {/* Subject Title & Exam Date Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => handleUpdateSubjectField(sub.id, 'name', e.target.value)}
                        placeholder="Subject Name (e.g. Data Structures & Algorithms)"
                        className="flex-1 font-bold text-slate-900 text-sm sm:text-base border-b border-dashed border-slate-300 focus:border-indigo-600 focus:outline-none py-1 bg-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Exam Date:</span>
                        <input
                          type="date"
                          value={sub.examDate}
                          onChange={(e) => handleUpdateSubjectField(sub.id, 'examDate', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Topics Grid / Table */}
                  <div className="space-y-2.5">
                    <div className="hidden lg:grid lg:grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      <div className="col-span-4">Topic / Chapter Name</div>
                      <div className="col-span-2">Unit / Module</div>
                      <div className="col-span-2">Difficulty</div>
                      <div className="col-span-2">Your Confidence</div>
                      <div className="col-span-1">Weightage</div>
                      <div className="col-span-1 text-right">Action</div>
                    </div>

                    {sub.topics.map((top) => (
                      <div
                        key={top.id}
                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 items-center"
                      >
                        {/* Topic Name */}
                        <div className="w-full lg:col-span-4">
                          <input
                            type="text"
                            value={top.name}
                            onChange={(e) => handleUpdateTopicField(sub.id, top.id, 'name', e.target.value)}
                            placeholder="e.g. Graph Algorithms (BFS/DFS)"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Unit Name */}
                        <div className="w-full lg:col-span-2">
                          <input
                            type="text"
                            value={top.unitOrChapter || ''}
                            onChange={(e) =>
                              handleUpdateTopicField(sub.id, top.id, 'unitOrChapter', e.target.value)
                            }
                            placeholder="Unit 1"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
                          />
                        </div>

                        {/* Difficulty */}
                        <div className="w-full lg:col-span-2">
                          <select
                            value={top.difficulty}
                            onChange={(e) =>
                              handleUpdateTopicField(
                                sub.id,
                                top.id,
                                'difficulty',
                                e.target.value as TopicDifficulty
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 cursor-pointer"
                          >
                            <option value="Easy">Easy (Fast Mastery)</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard (Needs Deep Focus)</option>
                          </select>
                        </div>

                        {/* Confidence */}
                        <div className="w-full lg:col-span-2">
                          <select
                            value={top.confidence}
                            onChange={(e) =>
                              handleUpdateTopicField(
                                sub.id,
                                top.id,
                                'confidence',
                                e.target.value as TopicConfidence
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 cursor-pointer"
                          >
                            <option value="Weak">Weak (High Priority)</option>
                            <option value="Average">Average</option>
                            <option value="Good">Good (Confident)</option>
                          </select>
                        </div>

                        {/* Weightage */}
                        <div className="w-full lg:col-span-1">
                          <select
                            value={top.weightage}
                            onChange={(e) =>
                              handleUpdateTopicField(
                                sub.id,
                                top.id,
                                'weightage',
                                e.target.value as TopicWeightage
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 cursor-pointer"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Med</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>

                        {/* Remove Action */}
                        <div className="w-full lg:col-span-1 flex justify-end">
                          <button
                            onClick={() => handleRemoveTopic(sub.id, top.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                            title="Remove Topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Topic to this Subject */}
                  <button
                    onClick={() => handleAddTopic(sub.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic to {sub.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit / Generate Button Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('schedule')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel & Return to Schedule
            </button>
            <button
              onClick={handleGenerateSchedule}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Optimal Sequence...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate AI Exam Study Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: SCHEDULE & CALENDAR VIEW */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {isLoadingPlan ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Loading your personalized exam schedule...</p>
            </div>
          ) : !plan ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Exam Schedule Created Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Set up your exam dates and syllabus topics to generate your tailored day-by-day plan.
              </p>
              <button
                onClick={() => setActiveTab('builder')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition cursor-pointer"
              >
                Create Exam Schedule Now
              </button>
            </div>
          ) : (
            <>
              {/* Progress Tracker KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Completion Rate */}
                <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Schedule Completion
                    </span>
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {completionPercent}%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {completedSessionsCount} / {totalSessionsCount}
                    <span className="text-xs font-semibold text-slate-400 ml-1.5">sessions</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {/* 2. Planned Hours */}
                <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Hours Covered
                    </span>
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {plan.completedHours}
                    <span className="text-sm font-semibold text-slate-400 ml-1">/ {plan.totalHoursPlanned} hrs</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Target: {plan.availability.dailyHoursWeekday}h weekday / {plan.availability.dailyHoursWeekend}h weekend
                  </p>
                </div>

                {/* 3. Subjects & Exam Timeline */}
                <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Active Subjects
                    </span>
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {plan.subjects.length}
                    <span className="text-xs font-semibold text-slate-400 ml-1.5">subjects scheduled</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    Earliest Exam: {plan.subjects[0]?.name?.slice(0, 18)}...
                  </p>
                </div>

                {/* 4. Revision Buffer Protection */}
                <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Buffer Protection
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    {plan.availability.revisionBufferDays} Days
                  </div>
                  <p className="text-xs text-slate-500">
                    Dedicated 100% to mock papers & formula drills
                  </p>
                </div>
              </div>

              {/* AI Strategy Insights Explainer Card */}
              <div className="bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/50 rounded-2xl p-5 border border-indigo-100 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-indigo-100" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        AI Schedule Strategy & Tactical Advisory
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Why this sequence was generated for {plan.examName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshAIAdvice}
                    disabled={isRefreshingAdvice}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAdvice ? 'animate-spin' : ''}`} />
                    <span>Refresh Advice</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {(plan.aiStrategyTips || []).map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/90 border border-indigo-100/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2 shadow-2xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar & Filters */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                {/* Filters */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Filter:</span>
                  </div>

                  {/* Subject Filter */}
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 cursor-pointer"
                  >
                    <option value="all">All Subjects ({plan.subjects.length})</option>
                    {plan.subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Only</option>
                    <option value="completed">Completed Only</option>
                  </select>
                </div>

                {/* Actions: Rebalance, Export ICS, Copy, Print */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Rebalance Button */}
                  <button
                    onClick={handleRebalance}
                    disabled={isRebalancing}
                    title="Redistribute uncompleted topics into remaining days without penalty"
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRebalancing ? 'animate-spin' : ''}`} />
                    <span>Rebalance Schedule</span>
                  </button>

                  {/* Export to ICS Calendar */}
                  <button
                    onClick={handleExportICS}
                    title="Download iCalendar file to sync with Google / Apple Calendar"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Calendar (.ics)</span>
                  </button>

                  {/* Copy Schedule */}
                  <button
                    onClick={handleCopyScheduleText}
                    title="Copy full schedule as text"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSchedule ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Print / PDF */}
                  <button
                    onClick={() => window.print()}
                    title="Print schedule or save as PDF"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Day-by-Day Timeline / Calendar Cards */}
              <div className="space-y-4">
                {filteredDays.map((day, dIdx) => (
                  <div
                    key={day.date}
                    className={`rounded-2xl border p-5 transition shadow-2xs ${
                      day.examOnThisDay
                        ? 'bg-rose-50/50 border-rose-200'
                        : day.isRestDay
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center shrink-0 border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {day.dayOfWeek.slice(0, 3)}
                          </span>
                          <span className="text-sm font-black text-slate-900 leading-none">
                            {day.date.slice(8, 10)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {day.dayOfWeek}, {day.date}
                            </h4>
                            {day.examOnThisDay && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold animate-pulse">
                                🎯 Exam: {day.examOnThisDay.subjectName}
                              </span>
                            )}
                            {day.isRestDay && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold">
                                🌿 Scheduled Rest / Recharge Day
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {day.isRestDay
                              ? 'Take time away from screens to consolidate memory and avoid burnout.'
                              : `${day.sessions.length} sessions • Total: ${(day.totalPlannedMinutes / 60).toFixed(1)} hrs planned`}
                          </p>
                        </div>
                      </div>

                      {/* Day Stats Badge */}
                      <div className="flex items-center gap-2">
                        {day.sessions.length > 0 && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {day.sessions.filter((s) => s.status === 'completed').length} / {day.sessions.length} done
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sessions for this Day */}
                    {day.sessions.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400 italic">
                        {day.isRestDay ? 'Rest day — no intense study blocks scheduled.' : 'No sessions matching current filters.'}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 mt-2">
                        {day.sessions.map((sess) => {
                          const badge = getSessionTypeBadge(sess.sessionType);
                          const isDone = sess.status === 'completed';
                          const isReview = sess.status === 'needs_review';

                          return (
                            <div
                              key={sess.id}
                              className={`py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl px-2 transition ${
                                isDone ? 'opacity-60 bg-slate-50/50' : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* Left Checkbox & Topic Info */}
                              <div className="flex items-start gap-3 flex-1">
                                <button
                                  onClick={() => handleToggleSessionStatus(sess.id, sess.status)}
                                  className="mt-0.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer shrink-0"
                                  title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-indigo-600" />
                                  )}
                                </button>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-extrabold text-slate-800">
                                      {sess.subjectName}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}
                                    >
                                      {badge.label}
                                    </span>
                                    {sess.priority === 'high' && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                        High Priority
                                      </span>
                                    )}
                                    {isReview && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                                        <span>Needs Re-Review</span>
                                      </span>
                                    )}
                                  </div>

                                  <h5
                                    className={`text-sm font-bold text-slate-900 ${
                                      isDone ? 'line-through text-slate-500' : ''
                                    }`}
                                  >
                                    {sess.topicName}
                                  </h5>

                                  {sess.aiTip && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 italic">
                                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <span>{sess.aiTip}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right Duration & Action Controls */}
                              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{sess.durationMinutes} min</span>
                                </span>

                                {/* Needs Review Toggle */}
                                <button
                                  onClick={() => handleMarkNeedsReview(sess.id)}
                                  className="text-[11px] font-semibold text-slate-500 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-md border border-slate-200 transition cursor-pointer"
                                  title="Flag this topic for re-review"
                                >
                                  Flag Review
                                </button>

                                {/* Ask AI Coach Modal */}
                                <button
                                  onClick={() => handleOpenAICoach(sess)}
                                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                                  title="Get AI revision summary & active recall drills"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-600" />
                                  <span>AI Coach</span>
                                </button>

                                {/* Quick Focus with Timer */}
                                <button
                                  onClick={() => {
                                    setTimerTopic(`${sess.subjectName} — ${sess.topicName}`);
                                    setActiveTab('habits');
                                  }}
                                  className="text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                                  title="Study this topic in Focus Timer"
                                >
                                  <Play className="w-3 h-3 text-sky-600" />
                                  <span>Focus</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: FOCUS TIMER & WEEKLY HABITS */}
      {activeTab === 'habits' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pomodoro Focus Timer Widget */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  Pomodoro Focus Engine
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Mode: {timerMode === 'work' ? 'Deep Work (25m)' : 'Short Break (5m)'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dedicated Focus Timer</h3>
              <p className="text-xs text-slate-500 mt-1">
                Active Topic: <strong className="text-slate-800">{timerTopic}</strong>
              </p>
            </div>

            {/* Huge Timer Clock Display */}
            <div className="py-8 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-6xl font-black text-slate-900 tracking-tight font-mono">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">
                {isTimerRunning ? 'Session in Progress' : 'Paused / Ready'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-6 py-3 rounded-xl font-bold text-sm shadow-xs transition flex items-center gap-2 cursor-pointer ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Focus Session</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(25 * 60);
                  setTimerMode('work');
                }}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Quick Study Habits & Tasks Checklist */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span>Study Habits & Quick Checklist</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily micro-tasks to maintain study momentum alongside your exam schedule.
              </p>
            </div>

            {/* Add Task Input */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newQuickTitle.trim()) return;
                try {
                  await addPlannerTask({
                    student_id: 'STD-88429',
                    title: newQuickTitle.trim(),
                    subject: newQuickSubject,
                    day_of_week: 'Monday',
                    duration_minutes: 45,
                    priority: 'medium',
                    status: 'pending'
                  });
                  setNewQuickTitle('');
                  loadQuickTasks();
                } catch (err) {
                  console.error('Failed to add task:', err);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={newQuickTitle}
                onChange={(e) => setNewQuickTitle(e.target.value)}
                placeholder="Add daily habit (e.g. 15 min formula revision)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
              {quickTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No habits added yet. Add a quick reminder above!
                </div>
              ) : (
                quickTasks.map((t) => (
                  <div
                    key={t.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={async () => {
                          const newStatus = t.status === 'completed' ? 'pending' : 'completed';
                          await updatePlannerTaskStatus(t.id, newStatus);
                          loadQuickTasks();
                        }}
                        className="cursor-pointer text-slate-400 hover:text-indigo-600"
                      >
                        {t.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-md border border-slate-300" />
                        )}
                      </button>
                      <span
                        className={`font-medium ${
                          t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await deletePlannerTask(t.id);
                        loadQuickTasks();
                      }}
                      className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Topic AI Coach Modal */}
      <TopicAICoachModal
        isOpen={coachModalInfo.isOpen}
        onClose={() => setCoachModalInfo({ ...coachModalInfo, isOpen: false })}
        subjectName={coachModalInfo.subjectName}
        topicName={coachModalInfo.topicName}
        difficulty={coachModalInfo.difficulty}
        confidence={coachModalInfo.confidence}
      />
    </div>
  );
};
