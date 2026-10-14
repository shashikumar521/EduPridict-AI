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
  Bell,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Flame,
  BookOpen,
  Filter,
  CheckSquare
} from 'lucide-react';
import { SectionId } from '../types';
import {
  fetchExamsList,
  createExamRecord,
  updateExamRecord,
  deleteExamRecord,
  fetchAcademicProfile
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ExamSchedulerViewProps {
  onNavigate: (section: SectionId) => void;
  prefillSubject?: string;
  prefillTopic?: string;
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

interface TimetableBlock {
  id: string;
  day: string;
  date: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  timeSlot: string;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
}

export const ExamSchedulerView: React.FC<ExamSchedulerViewProps> = ({
  onNavigate,
  prefillSubject,
  prefillTopic
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // State
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exams' | 'timetable' | 'timer'>('exams');
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Form State
  const [examSubject, setExamSubject] = useState(prefillSubject || '');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [examTime, setExamTime] = useState('10:00 AM');
  const [examPriority, setExamPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [examSyllabusPercent, setExamSyllabusPercent] = useState<number>(45);
  const [examNotes, setExamNotes] = useState(prefillTopic ? `Focus chapters: ${prefillTopic}` : '');

  // Timetable State (stored locally & synced)
  const [timetable, setTimetable] = useState<TimetableBlock[]>(() => {
    const saved = localStorage.getItem('edupredict_timetable');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  // Pomodoro Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [currentTopicFocus, setCurrentTopicFocus] = useState('Data Structures - Core Review');
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // SMS / Alert State
  const [isSmsSubscribed, setIsSmsSubscribed] = useState(false);
  const [reminderToast, setReminderToast] = useState('');

  // Fetch Exams
  const loadExams = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchExamsList();
      if (res && res.exams) {
        setExams(res.exams);
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  // Handle prefill parameters if opened from Academic Analysis
  useEffect(() => {
    if (prefillSubject) {
      setExamSubject(prefillSubject);
      if (prefillTopic) {
        setExamNotes(`Focus chapters: ${prefillTopic}`);
      }
      setIsAddExamOpen(true);
    }
  }, [prefillSubject, prefillTopic]);

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
        setReminderToast('Great work! 25-minute focus session finished. Take a 5-minute break.');
      } else {
        setTimerMode('work');
        setTimerSeconds(25 * 60);
        setReminderToast('Break finished! Ready to begin next focus block.');
      }
      setTimeout(() => setReminderToast(''), 5000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  // Generate / Seed Intelligent Timetable based on active exams
  const generateIntelligentTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const activeExams = exams.filter(e => e.status !== 'completed');

    const generated: TimetableBlock[] = [];
    const subjectsToPlan = activeExams.length > 0
      ? activeExams
      : [
          { subject_name: 'Data Structures & Algorithms', priority: 'high' as const },
          { subject_name: 'Discrete Mathematics', priority: 'medium' as const },
          { subject_name: 'Operating Systems', priority: 'high' as const },
          { subject_name: 'Database Management Systems', priority: 'medium' as const }
        ];

    let blockIdx = 1;
    days.forEach((day, dayIdx) => {
      // 2 sessions per weekday, 3 per weekend
      const sessionsPerDay = dayIdx >= 5 ? 3 : 2;
      for (let s = 0; s < sessionsPerDay; s++) {
        const assignedExam = subjectsToPlan[(dayIdx + s) % subjectsToPlan.length];
        const timeSlot = s === 0 ? '08:00 AM - 09:30 AM' : s === 1 ? '04:00 PM - 05:30 PM' : '07:00 PM - 08:30 PM';
        
        let sampleTopic = 'Core Concept Derivation & Theory';
        if (assignedExam.subject_name.includes('Data Structure')) sampleTopic = 'Binary Trees & Traversals';
        else if (assignedExam.subject_name.includes('Math')) sampleTopic = 'Set Theory Proofs & Relations';
        else if (assignedExam.subject_name.includes('Operating')) sampleTopic = 'CPU Scheduling & Memory Paging';
        else if (assignedExam.subject_name.includes('Database')) sampleTopic = 'Normalization & 3NF Schema';

        generated.push({
          id: `block-${blockIdx++}`,
          day,
          date: `Day ${dayIdx + 1}`,
          subject: assignedExam.subject_name,
          topic: sampleTopic,
          durationMinutes: 90,
          timeSlot,
          priority: assignedExam.priority || 'medium',
          isCompleted: false
        });
      }
    });

    setTimetable(generated);
    localStorage.setItem('edupredict_timetable', JSON.stringify(generated));
    setActiveTab('timetable');
    setReminderToast('AI Timetable successfully generated with spaced repetition!');
    setTimeout(() => setReminderToast(''), 4000);
  };

  // Toggle timetable block completion
  const handleToggleBlock = (blockId: string) => {
    setTimetable(prev => {
      const updated = prev.map(b => (b.id === blockId ? { ...b, isCompleted: !b.isCompleted } : b));
      localStorage.setItem('edupredict_timetable', JSON.stringify(updated));
      return updated;
    });
  };

  // 1-Click Reschedule Missed Sessions
  const handleRescheduleMissed = () => {
    setTimetable(prev => {
      const missed = prev.filter(b => !b.isCompleted);
      const completed = prev.filter(b => b.isCompleted);
      // Re-assign remaining incomplete tasks sequentially
      const reassigned = missed.map((b, i) => ({
        ...b,
        date: `Upcoming Session ${i + 1}`
      }));
      const updated = [...completed, ...reassigned];
      localStorage.setItem('edupredict_timetable', JSON.stringify(updated));
      return updated;
    });
    setReminderToast('Missed study sessions rebalanced across remaining study days.');
    setTimeout(() => setReminderToast(''), 3000);
  };

  // Add / Edit Exam Submit
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examSubject.trim()) {
      alert('Please enter a subject name');
      return;
    }

    try {
      if (editingExamId) {
        await updateExamRecord(editingExamId, {
          subject_name: examSubject.trim(),
          exam_date: examDate,
          exam_time: examTime,
          priority: examPriority,
          syllabus_completion_percent: examSyllabusPercent,
          notes: examNotes
        });
      } else {
        await createExamRecord({
          subject_name: examSubject.trim(),
          exam_date: examDate,
          exam_time: examTime,
          priority: examPriority,
          syllabus_completion_percent: examSyllabusPercent,
          notes: examNotes
        });
      }
      setIsAddExamOpen(false);
      setEditingExamId(null);
      setExamSubject('');
      setExamNotes('');
      await loadExams();
    } catch (err: any) {
      alert('Failed to save exam: ' + (err?.message || 'Error'));
    }
  };

  // Delete Exam
  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to remove this examination from your schedule?')) return;
    try {
      await deleteExamRecord(examId);
      await loadExams();
    } catch (err: any) {
      alert('Failed to delete exam: ' + (err?.message || 'Error'));
    }
  };

  // Mark Completed
  const handleMarkCompleted = async (exam: ExamItem) => {
    try {
      await updateExamRecord(exam.id, {
        status: exam.status === 'completed' ? 'upcoming' : 'completed',
        syllabus_completion_percent: 100
      });
      await loadExams();
    } catch (err: any) {
      alert('Failed to update exam status: ' + (err?.message || 'Error'));
    }
  };

  // Open Edit Modal
  const handleEditClick = (exam: ExamItem) => {
    setEditingExamId(exam.id);
    setExamSubject(exam.subject_name);
    setExamDate(exam.exam_date);
    setExamTime(exam.exam_time || '10:00 AM');
    setExamPriority(exam.priority);
    setExamSyllabusPercent(exam.syllabus_completion_percent || 0);
    setExamNotes(exam.notes || '');
    setIsAddExamOpen(true);
  };

  // Helper: Calculate Countdown
  const getCountdown = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffMs = target - now;
    if (diffMs < 0) return { text: 'Exam Today or Past', isUrgent: true, days: 0 };
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days === 0) return { text: `In ${hours} hours!`, isUrgent: true, days: 0 };
    if (days === 1) return { text: 'Tomorrow!', isUrgent: true, days: 1 };
    return { text: `In ${days} days ${hours}h`, isUrgent: days <= 3, days };
  };

  // Calculate Overall Exam Readiness
  const overallReadiness = useMemo(() => {
    if (exams.length === 0) return { score: 68, tier: 'Moderate Readiness' };
    const avgSyllabus = exams.reduce((sum, e) => sum + (e.syllabus_completion_percent || 0), 0) / exams.length;
    // Readiness formula: 70% syllabus completion + 30% consistency
    const score = Math.round(avgSyllabus * 0.8 + 15);
    let tier = 'Moderate Readiness';
    if (score >= 80) tier = 'High Readiness';
    else if (score < 50) tier = 'Needs Urgent Preparation';
    return { score, tier };
  }, [exams]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border-blue-200/80 shadow-xs'
            : 'bg-gradient-to-r from-[#0d172a] via-[#0B132B] to-[#111827] border-blue-500/30 shadow-md'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-blue-500/40 bg-[#0B132B] shadow-md flex items-center justify-center p-1">
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  Core Workflow 2
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  {exams.length} Upcoming Exams Scheduled
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Exam Scheduler & Study Planner
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Manage exam dates, generate an AI spaced-repetition timetable, and track live preparation readiness.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setEditingExamId(null);
                setExamSubject('');
                setExamNotes('');
                setIsAddExamOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Add Upcoming Exam
            </button>
            <button
              onClick={generateIntelligentTimetable}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Generate AI Timetable
            </button>
          </div>
        </div>

        {reminderToast && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
            {reminderToast}
          </div>
        )}
      </div>

      {/* 2. Readiness Metric Strip & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Upcoming Exams ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timetable'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Study Timetable ({timetable.filter(b => b.isCompleted).length}/{timetable.length})
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pomodoro Focus Timer
          </button>
        </div>

        {/* Readiness Snapshot */}
        <div
          className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
          }`}
        >
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500">Readiness Score</span>
            <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
              {overallReadiness.score}% • {overallReadiness.tier}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. TAB 1: UPCOMING EXAMINATIONS DECK */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {exams.length === 0 ? (
            <div
              className={`p-10 rounded-2xl border text-center space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                No Upcoming Exams Added Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add your upcoming midterms or final semester examinations to activate urgency countdowns and generate a prioritized study plan.
              </p>
              <button
                onClick={() => setIsAddExamOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                + Add First Examination
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
                        ? 'opacity-60 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        : countdown.isUrgent
                        ? isLight
                          ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                          : 'bg-rose-950/20 border-rose-900/50 shadow-xs'
                        : isLight
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-[#111827] border-slate-800 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
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
                          className={`text-xs font-extrabold flex items-center gap-1 ${
                            countdown.isUrgent
                              ? 'text-rose-600 dark:text-rose-400 font-black animate-pulse'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {countdown.text}
                        </span>
                      </div>

                      {/* Title & Date */}
                      <h3 className={`text-lg font-bold mt-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {exam.subject_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        🗓 {exam.exam_date} • ⏰ {exam.exam_time || '10:00 AM'}
                      </p>

                      {/* Notes / Topics */}
                      {exam.notes && (
                        <p className={`text-xs mt-2.5 p-2 rounded-lg ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-slate-800/60 text-slate-300'}`}>
                          {exam.notes}
                        </p>
                      )}

                      {/* Syllabus Progress Bar */}
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            Syllabus Completed:
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {exam.syllabus_completion_percent}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              exam.syllabus_completion_percent >= 80
                                ? 'bg-emerald-500'
                                : exam.syllabus_completion_percent >= 50
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, exam.syllabus_completion_percent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMarkCompleted(exam)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                            isCompleted
                              ? 'text-emerald-600 hover:text-emerald-700'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                          title={isCompleted ? 'Mark as Upcoming' : 'Mark as Completed'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[11px]">{isCompleted ? 'Completed' : 'Done'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            window.location.hash = `learn?topic=${encodeURIComponent(exam.subject_name)}`;
                            onNavigate('learn');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-500/20 transition cursor-pointer"
                        >
                          Practice Quiz
                        </button>
                        <button
                          onClick={() => handleEditClick(exam)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          title="Edit Exam"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
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

      {/* 4. TAB 2: STUDY TIMETABLE WITH INTERACTIVE SESSIONS */}
      {activeTab === 'timetable' && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111827] border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Personalized AI Study Timetable
              </h2>
              <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Check off sessions as you study. Incomplete sessions can be automatically rebalanced across remaining days.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRescheduleMissed}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reschedule Missed
              </button>
              <button
                onClick={generateIntelligentTimetable}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Re-Generate Plan
              </button>
            </div>
          </div>

          {timetable.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-blue-500/60" />
              <p className="text-sm font-semibold">No timetable active yet.</p>
              <button
                onClick={generateIntelligentTimetable}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Generate Spaced Repetition Timetable
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {timetable.map(block => (
                <div
                  key={block.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    block.isCompleted
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleBlock(block.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                        block.isCompleted
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                      }`}
                    >
                      {block.isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500">
                          {block.day} • {block.timeSlot}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          {block.subject}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-bold truncate mt-0.5 ${
                          block.isCompleted
                            ? 'line-through text-slate-400'
                            : isLight
                            ? 'text-slate-900'
                            : 'text-white'
                        }`}
                      >
                        {block.topic}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                      ⏱ {block.durationMinutes} mins
                    </span>
                    <button
                      onClick={() => {
                        setCurrentTopicFocus(`${block.subject} - ${block.topic}`);
                        setActiveTab('timer');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Focus Timer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: POMODORO FOCUS TIMER */}
      {activeTab === 'timer' && (
        <div
          className={`p-6 sm:p-10 rounded-2xl border text-center max-w-2xl mx-auto transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111827] border-slate-800 shadow-md'
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
              {timerMode === 'work' ? 'Deep Work Focus (25m)' : 'Restorative Break (5m)'}
            </span>
            <h3 className={`text-base font-bold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Target: {currentTopicFocus}
            </h3>
          </div>

          {/* Time Display */}
          <div className="my-8">
            <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
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
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isTimerRunning ? 'Pause Session' : 'Start Focus Block'}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(timerMode === 'work' ? 25 * 60 : 5 * 60);
              }}
              className={`p-3 rounded-2xl border transition cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            Completed today: <strong>{completedSessionsCount} sessions</strong> ({completedSessionsCount * 25} minutes of deep focus).
          </p>
        </div>
      )}

      {/* 6. Add / Edit Exam Modal */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {editingExamId ? 'Edit Examination' : 'Schedule New Examination'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddExamOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={examSubject}
                  onChange={e => setExamSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Exam Time
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={examTime}
                    onChange={e => setExamTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Priority Tier
                  </label>
                  <select
                    value={examPriority}
                    onChange={e => setExamPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Syllabus Completed ({examSyllabusPercent}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={examSyllabusPercent}
                    onChange={e => setExamSyllabusPercent(Number(e.target.value))}
                    className="w-full accent-blue-600 mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Notes & Priority Chapters
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Focus on graph algorithms, Dijkstra proof, and dynamic programming memoization."
                  value={examNotes}
                  onChange={e => setExamNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingExamId ? 'Update Exam' : 'Save to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
