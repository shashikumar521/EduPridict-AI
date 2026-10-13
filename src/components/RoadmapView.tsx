import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Calendar,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Layers,
  HelpCircle
} from 'lucide-react';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId, RoadmapTopic } from '../types';
import { fetchRoadmapTopics, updateRoadmapTopicStatus } from '../services/api';

const PHASES: Array<{
  phase: RoadmapTopic['phase'];
  title: string;
  stepNumber: string;
  description: string;
}> = [
  {
    phase: 'foundations',
    stepNumber: '01',
    title: 'Foundations & Core Prerequisites',
    description: 'Fundamental vocabulary, essential formulas, and core conceptual scaffolding.'
  },
  {
    phase: 'improvements',
    stepNumber: '02',
    title: 'Topics to Improve & Weak Areas',
    description: 'Targeted remediation on topics with lower past examination scores.'
  },
  {
    phase: 'practice',
    stepNumber: '03',
    title: 'Practice & Laboratory Activities',
    description: 'Hands-on problem sets, laboratory vivas, and assignment problem solving.'
  },
  {
    phase: 'intermediate',
    stepNumber: '04',
    title: 'Intermediate Concepts & Applications',
    description: 'Multi-topic synthesis, architectural patterns, and mid-tier problem sets.'
  },
  {
    phase: 'advanced',
    stepNumber: '05',
    title: 'Advanced Specialization & Exam Distinction',
    description: 'High-complexity synthesis, timed past-paper runs, and honors milestones.'
  }
];

export const RoadmapView: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<EducationLevelId>('btech');
  const [topics, setTopics] = useState<RoadmapTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTopics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoadmapTopics();
      setTopics(data);
    } catch (err) {
      console.error('Failed to load roadmap topics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const handleToggleStatus = async (topic: RoadmapTopic) => {
    let nextStatus: RoadmapTopic['status'] = 'in_progress';
    if (topic.status === 'not_started') nextStatus = 'in_progress';
    else if (topic.status === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'not_started';

    // Optimistic UI update
    setTopics((prev) =>
      prev.map((t) => (t.id === topic.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await updateRoadmapTopicStatus(topic.id, nextStatus);
    } catch (err) {
      console.error('Failed to persist roadmap status:', err);
      await loadTopics();
    }
  };

  const totalTopics = topics.length;
  const completedCount = topics.filter((t) => t.status === 'completed').length;
  const inProgressCount = topics.filter((t) => t.status === 'in_progress').length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const currentLevelConfig =
    EDUCATION_LEVELS.find((l) => l.id === selectedLevelId) || EDUCATION_LEVELS[5];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Adaptive Curriculum
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Persistent SQLite Progress</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Personalized Learning Roadmap
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Structured step-by-step milestones organized into Foundations, Topics to Improve, Practice, Intermediate, and Advanced milestones.
          </p>
        </div>

        {/* Level selector */}
        <div className="shrink-0 flex items-center gap-2">
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
          <button
            onClick={loadTopics}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Metric Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Curriculum Mastery Completion: {progressPercent}%
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {completedCount} completed • {inProgressCount} in progress • {totalTopics - completedCount - inProgressCount} pending
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">
              {currentLevelConfig.courseTerm}: Core Specialization
            </span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 5-Phase Longitudinal Progression Cards */}
      <div className="space-y-4">
        {PHASES.map((phaseItem) => {
          const phaseTopics = topics.filter((t) => t.phase === phaseItem.phase);
          const allCompleted = phaseTopics.length > 0 && phaseTopics.every((t) => t.status === 'completed');

          return (
            <div
              key={phaseItem.phase}
              className={`bg-white dark:bg-slate-900 rounded-xl p-5 border transition-all shadow-xs ${
                allCompleted
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10 dark:bg-emerald-950/10'
                  : 'border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      allCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                    }`}
                  >
                    {phaseItem.stepNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {phaseItem.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {phaseItem.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    allCompleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                      : phaseTopics.some((t) => t.status === 'in_progress')
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {allCompleted
                    ? 'Phase Completed'
                    : phaseTopics.some((t) => t.status === 'in_progress')
                    ? 'In Progress'
                    : 'Prerequisites Pending'}
                </span>
              </div>

              {/* Topics in this phase */}
              <div className="mt-3.5 space-y-2">
                {phaseTopics.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    No specific sub-topics assigned for this stage yet.
                  </p>
                ) : (
                  phaseTopics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => handleToggleStatus(topic)}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs cursor-pointer transition ${
                        topic.status === 'completed'
                          ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : topic.status === 'in_progress'
                          ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            topic.status === 'completed'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : topic.status === 'in_progress'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {topic.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                          {topic.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                        </button>
                        <span
                          className={`font-semibold truncate ${
                            topic.status === 'completed'
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {topic.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ~{topic.estimated_hours}h
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            topic.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                              : topic.status === 'in_progress'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {topic.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
