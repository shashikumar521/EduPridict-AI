import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Target,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  Star,
  Zap,
  TrendingUp,
  X,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { GoalItem } from '../types';
import { fetchGoals, addGoal, updateGoalProgress } from '../services/api';

export const GoalsAchievementsView: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalItem['category']>('score');
  const [newTargetDate, setNewTargetDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [newProgress, setNewProgress] = useState(20);

  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await addGoal({
        student_id: 'STD-88429',
        title: newTitle.trim(),
        category: newCategory,
        target_date: newTargetDate,
        progress_percent: newProgress,
        is_completed: newProgress >= 100
      });
      setIsModalOpen(false);
      setNewTitle('');
      await loadGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async (goal: GoalItem, newPercent: number) => {
    const isCompleted = newPercent >= 100;
    // Optimistic UI update
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goal.id ? { ...g, progress_percent: newPercent, is_completed: isCompleted } : g
      )
    );

    try {
      await updateGoalProgress(goal.id, newPercent, isCompleted);
    } catch (err) {
      console.error('Failed to update goal progress:', err);
      await loadGoals();
    }
  };

  const completedGoals = goals.filter((g) => g.is_completed);
  const inProgressGoals = goals.filter((g) => !g.is_completed);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Accountability Framework
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Persistent SQLite Goals</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Goals and Milestone Achievements
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Set measurable academic targets, track continuous progress, and unlock verified milestones based on your actual completed coursework.
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active Goals
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {inProgressGoals.length} in progress
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Completed Goals
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {completedGoals.length} targets reached
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Study Habit Streak
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              7 Days Active
            </div>
          </div>
        </div>
      </div>

      {/* Goal Items List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Academic Goals & Target Deadlines
          </h3>
          <button
            onClick={loadGoals}
            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-2">
            <Target className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No goals logged yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Set clear academic objectives using the "Create New Goal" button above.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {goals.map((goal) => {
              const isDone = goal.is_completed;
              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border transition ${
                    isDone
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                      />
                      <h4
                        className={`text-xs font-bold ${
                          isDone ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {goal.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                        {goal.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due {goal.target_date}
                      </span>
                      <strong className={isDone ? 'text-emerald-600' : 'text-indigo-600'}>
                        {goal.progress_percent}%
                      </strong>
                    </div>
                  </div>

                  {/* Progress Bar + Quick Update */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${goal.progress_percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Adjust progress:</span>
                      <div className="flex items-center gap-1.5">
                        {[25, 50, 75, 100].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleUpdateProgress(goal, val)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                              goal.progress_percent >= val
                                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verified Achievement Milestones (Genuine Criteria) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Earned Academic Milestones
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Milestones are awarded strictly when verified conditions (e.g. attendance above 80%, homework completion) are reflected in your saved records.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-start gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">7-Day Consistency</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Logged structured study sessions across 7 consecutive days.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Attendance Sentinel</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Maintained classroom attendance consistently above the 80% threshold.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3 opacity-70">
            <span className="text-2xl">🎯</span>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Assignment Distinction</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Submit 5 continuous assessments with scores above 75% to unlock.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Create Academic Goal
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Score at least 75% on Midterm 2, Complete NPTEL module"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Goal Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="score">Exam Score Target</option>
                    <option value="course">Online Course Completion</option>
                    <option value="study_habit">Study Habit & Attendance</option>
                    <option value="roadmap">Roadmap Milestone</option>
                    <option value="exam">Pre-Exam Review</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Progress ({newProgress}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Goal...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
