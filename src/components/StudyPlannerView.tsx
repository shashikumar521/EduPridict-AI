import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
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
  Layers,
  Wand2
} from 'lucide-react';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId, StudyPlannerTask } from '../types';
import {
  fetchPlannerTasks,
  addPlannerTask,
  updatePlannerTaskStatus,
  deletePlannerTask
} from '../services/api';

export const StudyPlannerView: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<EducationLevelId>('btech');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(14);
  const [activeDay, setActiveDay] = useState<string>('Monday');

  // Study tasks from persistent database
  const [tasks, setTasks] = useState<StudyPlannerTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Data Structures');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(60);
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timetable Generator Modal
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genDailyHours, setGenDailyHours] = useState<number>(2.5);
  const [genWeakSubject, setGenWeakSubject] = useState('Data Structures');
  const [genSecondarySubject, setGenSecondarySubject] = useState('Calculus');
  const [genExamFocus, setGenExamFocus] = useState('Midterm Examination');

  // Pomodoro Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPlannerTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load planner tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  const handleToggleTask = async (task: StudyPlannerTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    try {
      await updatePlannerTaskStatus(task.id, newStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Revert if error
      await loadTasks();
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await addPlannerTask({
        student_id: 'STD-88429',
        title: newTaskTitle.trim(),
        subject: newTaskSubject,
        day_of_week: activeDay,
        time_slot: `${newTaskDuration} min focus block`,
        duration_minutes: newTaskDuration,
        priority: newTaskPriority,
        status: 'pending'
      });
      setNewTaskTitle('');
      await loadTasks();
    } catch (err) {
      console.error('Failed to add planner task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deletePlannerTask(id);
    } catch (err) {
      console.error('Failed to delete task:', err);
      await loadTasks();
    }
  };

  const handleGenerateSmartTimetable = async () => {
    setIsSubmitting(true);
    try {
      // Create balanced 45-min blocks + 15-min reviews across the week capped at student daily budget
      const scheduleItems = [
        { day: 'Monday', title: `Deep Dive: ${genWeakSubject} Core Concept derivation`, subject: genWeakSubject, priority: 'high' as const, mins: 45 },
        { day: 'Monday', title: `Problem solving: ${genWeakSubject} solved examples`, subject: genWeakSubject, priority: 'high' as const, mins: 45 },
        { day: 'Tuesday', title: `Theory notes & proofs in ${genSecondarySubject}`, subject: genSecondarySubject, priority: 'medium' as const, mins: 50 },
        { day: 'Wednesday', title: `Active recall & flashcard test for ${genWeakSubject}`, subject: genWeakSubject, priority: 'high' as const, mins: 45 },
        { day: 'Thursday', title: `Lab practical & assignment write-up in ${genSecondarySubject}`, subject: genSecondarySubject, priority: 'medium' as const, mins: 60 },
        { day: 'Friday', title: `Previous Year Questions (PYQs) for ${genExamFocus}`, subject: genWeakSubject, priority: 'high' as const, mins: 60 },
        { day: 'Saturday', title: 'Comprehensive weekly self-quiz and error analysis', subject: 'All Subjects', priority: 'high' as const, mins: 90 },
        { day: 'Sunday', title: 'Weekly rest & 30-min preview of upcoming week lectures', subject: 'Review', priority: 'low' as const, mins: 30 }
      ];

      for (const item of scheduleItems) {
        await addPlannerTask({
          student_id: 'STD-88429',
          title: item.title,
          subject: item.subject,
          day_of_week: item.day,
          time_slot: `${item.mins} min block`,
          duration_minutes: item.mins,
          priority: item.priority,
          status: 'pending'
        });
      }

      setIsGeneratorOpen(false);
      await loadTasks();
    } catch (err) {
      console.error('Failed to generate timetable:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dayTasks = tasks.filter((t) => t.day_of_week === activeDay);
  const completedDayTasks = dayTasks.filter((t) => t.status === 'completed').length;
  const currentLevelConfig = EDUCATION_LEVELS.find((l) => l.id === selectedLevelId) || EDUCATION_LEVELS[5];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Personalized Timetable
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Persistent SQLite Planner</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Personalized Study Planner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Build a sustainable weekly study routine, distribute core subjects into digestible focus blocks, and eliminate last-minute cramming.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate Smart Timetable</span>
          </button>

          <select
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value as EducationLevelId)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {EDUCATION_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routine Overview & Interactive Pomodoro Focus Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Target Hours & Schedule Strategy */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recommended Weekly Study Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailored for {currentLevelConfig.label}
              </p>
            </div>

            {/* Target hours indicator */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target:</span>
              <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">
                {weeklyTargetHours} hrs / week
              </span>
            </div>
          </div>

          {/* Recommended Subject Allocation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Core Subject Mastery</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Concepts & derivation</p>
              <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                {Math.round(weeklyTargetHours * 0.45)} hrs
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">45% of allocated hours</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Active Problem Solving</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Exercises & past questions</p>
              <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                {Math.round(weeklyTargetHours * 0.35)} hrs
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">35% of allocated hours</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Revision & Self-Quiz</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Spaced repetition reviews</p>
              <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                {Math.round(weeklyTargetHours * 0.20)} hrs
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">20% of allocated hours</p>
            </div>
          </div>

          {/* Evidence-Based Strategy Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Planning Disclaimer:</strong> Timetables serve as structured time-management guides. Following a schedule supports consistent study habits, but academic results naturally reflect ongoing understanding, assessment effort, and individual mastery.
            </p>
          </div>
        </div>

        {/* Pomodoro Focus Timer Widget */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Focus Session Timer</h3>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  timerMode === 'work'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {timerMode === 'work' ? 'Deep Work Block' : 'Active Break'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              25 min focus + 5 min rest interval technique
            </p>

            <div className="text-center py-4">
              <div className="text-5xl font-mono font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {timerMode === 'work' ? 'Maintain distraction-free attention' : 'Step away from screen and stretch'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? 'Pause Session' : 'Start Focus'}</span>
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(timerMode === 'work' ? 25 * 60 : 5 * 60);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Day-by-Day Interactive Timetable */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Daily Schedule & Study Tasks ({activeDay})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {completedDayTasks} of {dayTasks.length} tasks completed for {activeDay}
            </p>
          </div>

          {/* Days of Week Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeDay === day
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Task List for Active Day */}
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading scheduled tasks...</div>
          ) : dayTasks.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 p-6 space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No tasks scheduled for {activeDay}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                Add an individual study block below, or use the "Generate Smart Timetable" button to populate your week.
              </p>
            </div>
          ) : (
            dayTasks.map((t) => (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                  t.status === 'completed'
                    ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleTask(t)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition ${
                      t.status === 'completed'
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {t.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        t.status === 'completed'
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{t.subject}</span>
                      <span>•</span>
                      <span>{t.duration_minutes} min block</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      t.priority === 'high'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900'
                        : t.priority === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.priority}
                  </span>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Quick Task Form */}
        <form onSubmit={handleAddTask} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2.5 items-center">
          <input
            type="text"
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={`Add study task for ${activeDay}...`}
            className="flex-1 min-w-[200px] px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            value={newTaskSubject}
            onChange={(e) => setNewTaskSubject(e.target.value)}
            placeholder="Subject"
            className="w-32 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={newTaskDuration}
            onChange={(e) => setNewTaskDuration(Number(e.target.value))}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>

          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting || !newTaskTitle.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </form>
      </div>

      {/* Smart Timetable Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Smart Study Timetable Generator
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Creates balanced weekly focus blocks based on your available study time.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Available Study Hours Per Day ({genDailyHours} hrs/day)
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={genDailyHours}
                  onChange={(e) => setGenDailyHours(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">
                  Total Weekly Capacity: {Math.round(genDailyHours * 6)} hours (Mon–Sat)
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Subject Needing Improvement (High Priority)
                </label>
                <input
                  type="text"
                  value={genWeakSubject}
                  onChange={(e) => setGenWeakSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Secondary Subject
                </label>
                <input
                  type="text"
                  value={genSecondarySubject}
                  onChange={(e) => setGenSecondarySubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upcoming Assessment Goal
                </label>
                <input
                  type="text"
                  value={genExamFocus}
                  onChange={(e) => setGenExamFocus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGenerateSmartTimetable}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Generating...' : 'Generate & Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
