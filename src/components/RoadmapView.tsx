import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId } from '../types';

interface RoadmapStage {
  id: number;
  stageNumber: string;
  title: string;
  timeframe: string;
  description: string;
  completed: boolean;
  tasks: { text: string; done: boolean }[];
  deliverables: string;
}

export const RoadmapView: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<EducationLevelId>('btech');

  const [stages, setStages] = useState<RoadmapStage[]>([
    {
      id: 1,
      stageNumber: '01',
      title: 'Diagnostic Baseline & Syllabus Scaffolding',
      timeframe: 'Weeks 1–3',
      description: 'Audit prerequisites, download official curriculum blueprint, and establish weekly study rhythm.',
      completed: true,
      tasks: [
        { text: 'Complete baseline diagnostic test in core subject modules', done: true },
        { text: 'Set up weekly study timetable (target 14 hrs/week)', done: true },
        { text: 'Register with academic advisor and verify course credits', done: true }
      ],
      deliverables: 'Study schedule active & course materials procured'
    },
    {
      id: 2,
      stageNumber: '02',
      title: 'Core Conceptual Foundations',
      timeframe: 'Weeks 4–7',
      description: 'Master theoretical fundamentals, attend 100% of lectures, and create concise concept summaries.',
      completed: true,
      tasks: [
        { text: 'Complete Units 1 & 2 theory derivations and definitions', done: true },
        { text: 'Maintain minimum 80% class attendance threshold', done: true },
        { text: 'Submit continuous evaluation assignment series 1', done: true }
      ],
      deliverables: 'Unit notes completed & Assignment 1 score > 65%'
    },
    {
      id: 3,
      stageNumber: '03',
      title: 'Midterm Examination & Formative Feedback',
      timeframe: 'Weeks 8–10',
      description: 'Evaluate midterm scores to pinpoint misconceptions and recalibrate study allocation.',
      completed: false,
      tasks: [
        { text: 'Sit for mid-semester evaluations across all enrolled subjects', done: true },
        { text: 'Audit errors in midterms with course tutors or professors', done: false },
        { text: 'Adjust study hours for any subject scoring under 60%', done: false }
      ],
      deliverables: 'Post-midterm diagnostic triage & action plan'
    },
    {
      id: 4,
      stageNumber: '04',
      title: 'Advanced Problem Solving & Laboratory Practicals',
      timeframe: 'Weeks 11–14',
      description: 'Solve multi-step problems, past examination papers, and verify laboratory experiment records.',
      completed: false,
      tasks: [
        { text: 'Solve past 5 years of examination papers (PYQs)', done: false },
        { text: 'Finalize lab manual records, code repositories, or term projects', done: false },
        { text: 'Participate in peer group problem sets or tutoring clinics', done: false }
      ],
      deliverables: 'Lab viva readiness verified & PYQ archive completed'
    },
    {
      id: 5,
      stageNumber: '05',
      title: 'Timed Simulation & Comprehensive Revision',
      timeframe: 'Weeks 15–16',
      description: 'Simulate full-length 3-hour exam conditions and execute active recall on cheat-sheets.',
      completed: false,
      tasks: [
        { text: 'Complete 2 full timed mock tests under strict conditions', done: false },
        { text: 'Memorize formula sheets and key taxonomy lists', done: false },
        { text: 'Verify hall ticket, admit card, and attendance eligibility', done: false }
      ],
      deliverables: 'Readiness Index > 80% & hall ticket verified'
    },
    {
      id: 6,
      stageNumber: '06',
      title: 'End-Term Examination & Distinction Standing',
      timeframe: 'Final Exam Week',
      description: 'Execute strategic exam pacing, review step markings, and attain targeted GPA.',
      completed: false,
      tasks: [
        { text: 'Rest 7+ hours prior to each major evaluation date', done: false },
        { text: 'Execute step-by-step presentation in answer sheets', done: false },
        { text: 'Achieve end-of-semester honors or distinction grade', done: false }
      ],
      deliverables: 'Semester completion with good academic standing'
    }
  ]);

  const toggleTask = (stageId: number, taskIndex: number) => {
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id !== stageId) return stage;
        const newTasks = [...stage.tasks];
        newTasks[taskIndex].done = !newTasks[taskIndex].done;
        const allDone = newTasks.every((t) => t.done);
        return { ...stage, tasks: newTasks, completed: allDone };
      })
    );
  };

  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0);
  const doneTasks = stages.reduce((acc, s) => acc + s.tasks.filter((t) => t.done).length, 0);
  const overallProgress = Math.round((doneTasks / totalTasks) * 100);

  const currentLevelConfig =
    EDUCATION_LEVELS.find((l) => l.id === selectedLevelId) || EDUCATION_LEVELS[5];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Milestone Navigation
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Structured Path</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Academic Learning Roadmap
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            A step-by-step phased progression from diagnostic orientation to final examination mastery and distinction.
          </p>
        </div>

        {/* Level selector */}
        <div className="shrink-0">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Academic Track
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

      {/* Progress Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Overall Roadmap Completion: {currentLevelConfig.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {doneTasks} of {totalTasks} milestones completed across 6 academic stages.
            </p>
          </div>
          <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {overallProgress}% Achieved
          </span>
        </div>

        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Phased Roadmap Timeline */}
      <div className="space-y-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`bg-white dark:bg-slate-900 rounded-xl p-5 border transition ${
              stage.completed
                ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10 dark:bg-emerald-950/10'
                : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    stage.completed
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900'
                  }`}
                >
                  {stage.stageNumber}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {stage.title}
                    </h4>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      {stage.timeframe}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stage.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    stage.completed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {stage.completed ? 'Stage Cleared' : 'In Progress'}
                </span>
              </div>
            </div>

            {/* Checkable Tasks */}
            <div className="pt-3 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Milestone Deliverables:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {stage.tasks.map((task, tIdx) => (
                  <div
                    key={tIdx}
                    onClick={() => toggleTask(stage.id, tIdx)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition cursor-pointer ${
                      task.done
                        ? 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer pointer-events-none"
                    />
                    <span className="truncate">{task.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
