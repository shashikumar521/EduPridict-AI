import React, { useState, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId } from '../types';

export const StudyPlannerView: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<EducationLevelId>('btech');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(14);
  const [activeDay, setActiveDay] = useState<string>('Monday');

  // Study tasks state with persistence in localStorage if available
  const [tasks, setTasks] = useState<{ id: number; day: string; title: string; category: string; duration: string; completed: boolean }[]>([
    { id: 1, day: 'Monday', title: 'Review Lecture Notes & Key Theorems', category: 'Theory Revision', duration: '60 min', completed: true },
    { id: 2, day: 'Monday', title: 'Solve 5 Practice Problem Sets', category: 'Problem Solving', duration: '90 min', completed: false },
    { id: 3, day: 'Tuesday', title: 'Read Prescribed Textbook Chapter', category: 'Reading', duration: '45 min', completed: false },
    { id: 4, day: 'Tuesday', title: 'Work on Continuous Assessment Task', category: 'Assignment', duration: '60 min', completed: false },
    { id: 5, day: 'Wednesday', title: 'Active Recall Flashcards Review', category: 'Memory Retention', duration: '30 min', completed: true },
    { id: 6, day: 'Wednesday', title: 'Formula Sheet / Cheat Sheet Summary', category: 'Summary Notes', duration: '45 min', completed: false },
    { id: 7, day: 'Thursday', title: 'Lab Practical Preparation & Code Run', category: 'Practical Lab', duration: '75 min', completed: false },
    { id: 8, day: 'Friday', title: 'Weekly Mock Quiz / Self-Test', category: 'Self-Assessment', duration: '60 min', completed: false },
    { id: 9, day: 'Saturday', title: 'Revise Weak Topics from Week Quiz', category: 'Targeted Remediation', duration: '90 min', completed: false },
    { id: 10, day: 'Sunday', title: 'Plan Next Week Schedule & Light Review', category: 'Weekly Review', duration: '45 min', completed: false }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Problem Solving');
  const [newTaskDuration, setNewTaskDuration] = useState('45 min');

  // Pomodoro Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');

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

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        day: activeDay,
        title: newTaskTitle.trim(),
        category: newTaskCategory,
        duration: newTaskDuration,
        completed: false
      }
    ]);
    setNewTaskTitle('');
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayTasks = tasks.filter((t) => t.day === activeDay);
  const completedDayTasks = dayTasks.filter((t) => t.completed).length;

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
            <span className="text-xs text-slate-400 dark:text-slate-500">Structured Study Habits</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Personalized Study Planner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Build a sustainable weekly study routine, distribute core subjects into digestible focus blocks, and eliminate last-minute cramming.
          </p>
        </div>

        {/* Level selector */}
        <div className="shrink-0">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Target Education Level
          </label>
          <select
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value as EducationLevelId)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

            {/* Target hours slider */}
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

          {/* Suggested Routine Template */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                Evidence-Based Study Strategy: 3-Phase Daily Routine
              </span>
              <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
                • <strong>Prime Morning:</strong> 45 min on difficult conceptual theory when cognitive stamina is highest.<br />
                • <strong>Midday Practical:</strong> 60 min problem solving, coding lab, or practice tests.<br />
                • <strong>Evening Consolidate:</strong> 30 min flashcards, formula recap, and preview of tomorrow's lecture.
              </p>
            </div>
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
                {timerMode === 'work' ? 'Deep Work (25m)' : 'Rest Break (5m)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Use the Pomodoro technique to maintain focus and prevent mental exhaustion.
            </p>

            {/* Timer Dial Display */}
            <div className="py-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tracking-wider">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {isTimerRunning ? 'Session in progress...' : 'Ready to start focus session'}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Focus</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(timerMode === 'work' ? 25 * 60 : 5 * 60);
                  }}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Daily Target: 4 Blocks
            </span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">2 Completed Today</span>
          </div>
        </div>
      </div>

      {/* Daily Study Schedule & Interactive Task Checklist */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        {/* Day selection tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  activeDay === day
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Progress: <strong className="text-slate-800 dark:text-slate-200">{completedDayTasks} / {dayTasks.length}</strong> tasks done
          </span>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {dayTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No tasks scheduled for {activeDay}. Add one below to structure your study session!
            </div>
          ) : (
            dayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${task.completed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-medium">
                        {task.category}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-300 dark:text-slate-600 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                  title="Remove task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={`Add study task for ${activeDay}...`}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Problem Solving">Problem Solving</option>
            <option value="Theory Revision">Theory Revision</option>
            <option value="Assignment">Assignment</option>
            <option value="Self-Assessment">Self-Assessment</option>
            <option value="Practical Lab">Practical Lab</option>
          </select>
          <select
            value={newTaskDuration}
            onChange={(e) => setNewTaskDuration(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="30 min">30 min</option>
            <option value="45 min">45 min</option>
            <option value="60 min">60 min</option>
            <option value="90 min">90 min</option>
            <option value="120 min">120 min</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </form>
      </div>
    </div>
  );
};
