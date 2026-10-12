import React, { useState } from 'react';
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
  X
} from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  status: 'in_progress' | 'completed';
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export const GoalsAchievementsView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: 'Target Semester Final Percentage',
      category: 'Exam Performance',
      currentValue: 68,
      targetValue: 80,
      unit: '%',
      deadline: 'Nov 30, 2025',
      status: 'in_progress'
    },
    {
      id: 2,
      title: 'Weekly Structured Study Volume',
      category: 'Study Habits',
      currentValue: 12,
      targetValue: 16,
      unit: 'hrs/wk',
      deadline: 'Every Sunday',
      status: 'in_progress'
    },
    {
      id: 3,
      title: 'Mandatory Attendance Maintenance',
      category: 'Classroom Compliance',
      currentValue: 82,
      targetValue: 85,
      unit: '%',
      deadline: 'Semester End',
      status: 'in_progress'
    },
    {
      id: 4,
      title: 'Complete 100% of Continuous Internal Assessments',
      category: 'Continuous Evaluation',
      currentValue: 10,
      targetValue: 10,
      unit: 'tasks',
      deadline: 'Oct 15, 2025',
      status: 'completed'
    }
  ]);

  const [badges] = useState<Badge[]>([
    {
      id: 'b-1',
      title: 'Study Streak Champion',
      description: 'Logged 7 consecutive days of focused study sessions.',
      icon: '🔥',
      unlocked: true,
      unlockedAt: '3 days ago'
    },
    {
      id: 'b-2',
      title: 'Attendance Guardian',
      description: 'Maintained attendance consistently above 80% threshold.',
      icon: '🛡️',
      unlocked: true,
      unlockedAt: 'Last week'
    },
    {
      id: 'b-3',
      title: 'Assignment Pacesetter',
      description: 'Submitted all semester assignments at least 24 hours before deadlines.',
      icon: '⭐',
      unlocked: true,
      unlockedAt: 'Oct 02, 2025'
    },
    {
      id: 'b-4',
      title: 'Score Breakthrough +15%',
      description: 'Improved recent midterm test score by 15% or more over diagnostic baseline.',
      icon: '🚀',
      unlocked: false
    },
    {
      id: 'b-5',
      title: 'Mock Exam Distinction',
      description: 'Scored above 85% in a full simulated end-term examination.',
      icon: '🏆',
      unlocked: false
    },
    {
      id: 'b-6',
      title: 'Curated Course Graduate',
      description: 'Completed a recommended verified course from NPTEL / SWAYAM / MIT.',
      icon: '🎓',
      unlocked: true,
      unlockedAt: 'Sep 24, 2025'
    }
  ]);

  // Modal for new goal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(80);
  const [newUnit, setNewUnit] = useState('%');
  const [newCategory, setNewCategory] = useState('Exam Performance');
  const [newDeadline, setNewDeadline] = useState('Dec 15, 2025');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newTitle.trim(),
        category: newCategory,
        currentValue: 0,
        targetValue: newTarget,
        unit: newUnit,
        deadline: newDeadline,
        status: 'in_progress'
      }
    ]);
    setIsModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Goal Tracking & Badges
            </span>
            <span className="text-xs text-slate-400">Academic Milestones</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Goals & Academic Achievements
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Set ambitious target marks, build consistent study streaks, and celebrate verified academic milestones.
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set New Target Goal</span>
          </button>
        </div>
      </div>

      {/* Active Academic Goals */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Learning Targets</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {goals.filter((g) => g.status === 'completed').length} / {goals.length} Goals Achieved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isDone = goal.status === 'completed' || pct >= 100;
            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border transition ${
                  isDone
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/60 border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {goal.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                      {goal.title}
                    </h4>
                  </div>
                  {isDone ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Achieved
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500">
                      Due: {goal.deadline}
                    </span>
                  )}
                </div>

                {/* Progress Value & Gauge */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">
                      Current: <strong>{goal.currentValue} {goal.unit}</strong>
                    </span>
                    <span className="font-bold text-slate-800">
                      Target: {goal.targetValue} {goal.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges Showcase */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">Academic Achievements & Badges</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition ${
                badge.unlocked
                  ? 'bg-amber-50/20 border-amber-200/80 shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  badge.unlocked
                    ? 'bg-amber-100 border border-amber-200 shadow-2xs'
                    : 'bg-slate-200 grayscale'
                }`}
              >
                {badge.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {badge.title}
                  </h4>
                  {badge.unlocked && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {badge.description}
                </p>
                {badge.unlocked ? (
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1.5">
                    Unlocked: {badge.unlockedAt}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                    In Progress • Complete requirements
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Set New Academic Goal</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Attain 85% in Advanced Mathematics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Exam Performance">Exam Performance</option>
                  <option value="Study Habits">Study Habits</option>
                  <option value="Classroom Compliance">Classroom Compliance</option>
                  <option value="Continuous Evaluation">Continuous Evaluation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Deadline
                </label>
                <input
                  type="text"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  placeholder="e.g. Dec 15, 2025"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
