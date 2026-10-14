import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  Clock,
  Building2,
  GraduationCap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CoursePreferences } from '../types';
import {
  DEFAULT_COURSE_PREFERENCES,
  loadUserCoursePreferences,
  saveUserCoursePreferences
} from '../data/courseCatalogue';

interface CoursePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (newPrefs: CoursePreferences) => void;
}

const AVAILABLE_SKILLS = [
  'Artificial Intelligence',
  'Data Structures & Algorithms',
  'Python Programming',
  'Web Development',
  'Cloud Computing',
  'Cybersecurity',
  'Mathematics',
  'Operating Systems',
  'Database Management',
  'Computer Networks',
  'Deep Learning',
  'Statistics & Probability'
];

const AVAILABLE_SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Artificial Intelligence',
  'Cloud Computing',
  'Cybersecurity',
  'Web Development',
  'Data Science',
  'Electrical Engineering',
  'Mechanical Engineering'
];

export const CoursePreferencesModal: React.FC<CoursePreferencesModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [prefs, setPrefs] = useState<CoursePreferences>(loadUserCoursePreferences);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPrefs(loadUserCoursePreferences());
      setIsSuccessFeedback(false);
    }
  }, [isOpen]);

  // ESC key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    setPrefs((prev) => {
      const exists = prev.targetSkills.includes(skill);
      const nextSkills = exists
        ? prev.targetSkills.filter((s) => s !== skill)
        : [...prev.targetSkills, skill];
      return { ...prev, targetSkills: nextSkills };
    });
  };

  const toggleSubject = (subject: string) => {
    setPrefs((prev) => {
      const exists = prev.focusSubjects.includes(subject);
      const nextSubjects = exists
        ? prev.focusSubjects.filter((s) => s !== subject)
        : [...prev.focusSubjects, subject];
      return { ...prev, focusSubjects: nextSubjects };
    });
  };

  const handleSave = () => {
    saveUserCoursePreferences(prefs);
    setIsSuccessFeedback(true);
    if (onSaved) {
      onSaved(prefs);
    }
    setTimeout(() => {
      setIsSuccessFeedback(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setPrefs(DEFAULT_COURSE_PREFERENCES);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isLight
            ? 'bg-white border-[#CBD5E1] text-[#172033]'
            : 'bg-[#131926] border-[#2D3E5E] text-white'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEE7FF] text-[#7000E8] dark:bg-[#7000E8]/20 dark:text-[#C4B5FD] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Course Recommendation Preferences
              </h3>
              <p className="text-xs text-[#526078] dark:text-slate-400">
                Tailor course recommendations to your target skills, subjects, and study pace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          {/* Section 1: Target Skills */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#526078] dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7000E8] dark:text-[#C4B5FD]" />
                Target Skills You Want to Learn
              </label>
              <span className="text-[11px] text-slate-400">
                {prefs.targetSkills.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = prefs.targetSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#7000E8] text-white border-[#7000E8] shadow-xs'
                        : isLight
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Preferred Duration */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#526078] dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2458A6] dark:text-[#93C5FD]" />
              Preferred Course Duration &amp; Commitment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'all', title: 'Any Duration', desc: 'Flexible self-paced and structured terms' },
                { id: 'short', title: 'Short (< 4 Weeks / < 30 hrs)', desc: 'Fast modular skill builders & quick refreshers' },
                { id: 'medium', title: 'Medium (4–8 Weeks)', desc: 'Balanced topic coverage with hands-on practice' },
                { id: 'comprehensive', title: 'Comprehensive (8–12+ Weeks)', desc: 'Full semester-length university curricula' }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-3 ${
                    prefs.preferredDuration === opt.id
                      ? 'border-[#7000E8] bg-[#EEE7FF]/40 dark:bg-[#7000E8]/15 ring-1 ring-[#7000E8]'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                      : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredDuration"
                    value={opt.id}
                    checked={prefs.preferredDuration === opt.id}
                    onChange={() => setPrefs({ ...prefs, preferredDuration: opt.id as any })}
                    className="mt-1 text-[#7000E8] focus:ring-[#7000E8]"
                  />
                  <div>
                    <span className="text-xs font-bold block">{opt.title}</span>
                    <span className="text-[11px] text-[#526078] dark:text-slate-400 block mt-0.5">
                      {opt.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Preferred Provider Types */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#526078] dark:text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#087A55] dark:text-[#6EE7B7]" />
              Preferred Official Provider Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'all',
                  title: 'All Providers',
                  desc: 'University & Tech Industry'
                },
                {
                  id: 'university',
                  title: 'University / Academia',
                  desc: 'MIT, Harvard, IIT/NPTEL, Stanford'
                },
                {
                  id: 'tech_industry',
                  title: 'Tech Industry Leaders',
                  desc: 'Google, Microsoft, Cisco, IBM'
                }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-3 ${
                    prefs.preferredProviderType === opt.id
                      ? 'border-[#7000E8] bg-[#EEE7FF]/40 dark:bg-[#7000E8]/15 ring-1 ring-[#7000E8]'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                      : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredProviderType"
                    value={opt.id}
                    checked={prefs.preferredProviderType === opt.id}
                    onChange={() => setPrefs({ ...prefs, preferredProviderType: opt.id as any })}
                    className="mt-1 text-[#7000E8] focus:ring-[#7000E8]"
                  />
                  <div>
                    <span className="text-xs font-bold block">{opt.title}</span>
                    <span className="text-[11px] text-[#526078] dark:text-slate-400 block mt-0.5">
                      {opt.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Focus Disciplines */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#526078] dark:text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#7000E8] dark:text-[#C4B5FD]" />
                Focus Disciplines
              </label>
              <span className="text-[11px] text-slate-400">
                {prefs.focusSubjects.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SUBJECTS.map((subj) => {
                const isSelected = prefs.focusSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubject(subj)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#2458A6] text-white border-[#2458A6] shadow-xs'
                        : isLight
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{subj}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Primary Goal */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#526078] dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#087A55] dark:text-[#6EE7B7]" />
              Primary Learning Goal
            </label>
            <input
              type="text"
              value={prefs.learningGoal}
              onChange={(e) => setPrefs({ ...prefs, learningGoal: e.target.value })}
              placeholder="e.g. Master curriculum concepts, prepare for exams, learn machine learning"
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#7000E8] ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-4 py-2 font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              {isSuccessFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
