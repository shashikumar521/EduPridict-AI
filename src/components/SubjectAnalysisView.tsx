import React, { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  BarChart2,
  Plus,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId } from '../types';

interface SubjectMetric {
  id: string;
  name: string;
  code: string;
  marks: number;
  attendance: number;
  studyHoursPerWeek: number;
  credits: number;
  status: 'critical' | 'moderate' | 'strong';
  keyWeakness: string;
  recommendedAction: string;
}

export const SubjectAnalysisView: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<EducationLevelId>('btech');

  // Sample subject data configured per student
  const [subjects, setSubjects] = useState<SubjectMetric[]>([
    {
      id: 'sub-1',
      name: 'Data Structures & Algorithms',
      code: 'CS-204',
      marks: 48,
      attendance: 62,
      studyHoursPerWeek: 2.5,
      credits: 4,
      status: 'critical',
      keyWeakness: 'Graph algorithms & dynamic programming complexity',
      recommendedAction: 'Dedicate 3 additional hours weekly to LeetCode Easy/Medium practice problems and visual trace.'
    },
    {
      id: 'sub-2',
      name: 'Discrete Mathematics',
      code: 'MATH-201',
      marks: 54,
      attendance: 68,
      studyHoursPerWeek: 3.0,
      credits: 3,
      status: 'moderate',
      keyWeakness: 'Set theory proofs and recurrence relations',
      recommendedAction: 'Solve 10 textbook review proofs from Kenneth Rosen discrete mathematics chapter 5.'
    },
    {
      id: 'sub-3',
      name: 'Computer Organization & Architecture',
      code: 'CS-202',
      marks: 74,
      attendance: 84,
      studyHoursPerWeek: 3.5,
      credits: 3,
      status: 'strong',
      keyWeakness: 'Cache memory mapping techniques',
      recommendedAction: 'Review direct vs associative cache homework problems once prior to finals.'
    },
    {
      id: 'sub-4',
      name: 'Object Oriented Programming (Java/C++)',
      code: 'CS-206',
      marks: 79,
      attendance: 90,
      studyHoursPerWeek: 4.0,
      credits: 4,
      status: 'strong',
      keyWeakness: 'Minor syntax errors in template polymorphism',
      recommendedAction: 'Maintain current rhythm and assist study group peers to reinforce mastery.'
    },
    {
      id: 'sub-5',
      name: 'Environmental Science & Ethics',
      code: 'HS-102',
      marks: 61,
      attendance: 71,
      studyHoursPerWeek: 1.0,
      credits: 2,
      status: 'moderate',
      keyWeakness: 'Missed submission deadline for case study review',
      recommendedAction: 'Complete pending case study summary to secure remaining 15% internal evaluation marks.'
    }
  ]);

  const criticalCount = subjects.filter((s) => s.status === 'critical').length;
  const moderateCount = subjects.filter((s) => s.status === 'moderate').length;
  const strongCount = subjects.filter((s) => s.status === 'strong').length;

  const currentLevel = EDUCATION_LEVELS.find((l) => l.id === selectedLevelId) || EDUCATION_LEVELS[5];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Granular Diagnostics
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Subject-Wise Evaluation</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Subject-Wise Performance Analysis
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Identify specific subject vulnerability points, correlate study hour investment with test scores, and prioritize revision efforts.
          </p>
        </div>

        {/* Education Level selector */}
        <div className="shrink-0">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Education Context
          </label>
          <select
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value as EducationLevelId)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-750 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {EDUCATION_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">High Attention Needed</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">{criticalCount} Subjects</div>
          <p className="text-xs text-rose-600 dark:text-rose-300 mt-0.5">Scoring below 50% or poor attendance</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Moderate / Borderline</span>
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{moderateCount} Subjects</div>
          <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">Scores between 50% - 69%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Strong Mastery</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{strongCount} Subjects</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-0.5">Scoring 70%+ with reliable attendance</p>
        </div>
      </div>

      {/* Subject Analysis Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Enrolled Subject Roster</h3>

        <div className="grid grid-cols-1 gap-4">
          {subjects.map((sub) => {
            const isCritical = sub.status === 'critical';
            const isModerate = sub.status === 'moderate';

            const badgeColor = isCritical
              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900'
              : isModerate
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900'
              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';

            const progressColor = isCritical
              ? 'bg-rose-500'
              : isModerate
              ? 'bg-amber-500'
              : 'bg-emerald-500';

            return (
              <div
                key={sub.id}
                className={`bg-white dark:bg-slate-900 rounded-xl p-5 border shadow-xs transition hover:shadow-sm ${
                  isCritical
                    ? 'border-rose-200 dark:border-rose-900/60'
                    : isModerate
                    ? 'border-amber-200 dark:border-amber-900/60'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                      <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{sub.name}</h4>
                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded">
                          {sub.code}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">({sub.credits} Credits)</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Study Allocation: <strong>{sub.studyHoursPerWeek} hrs/week</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                      {isCritical ? 'Urgent Attention' : isModerate ? 'Moderate Attention' : 'Strong Standing'}
                    </span>
                  </div>
                </div>

                {/* Score and Attendance Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Marks / Exam Percentage</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{sub.marks}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progressColor}`}
                        style={{ width: `${sub.marks}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Class Attendance</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{sub.attendance}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.attendance >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${sub.attendance}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pedagogical Diagnostic & Action Guidance */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Diagnosed Concept Bottleneck:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">{sub.keyWeakness}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-200 block mb-0.5">
                      Targeted Action Plan:
                    </span>
                    <p className="text-indigo-800 dark:text-indigo-300">{sub.recommendedAction}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
