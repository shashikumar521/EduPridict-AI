import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  School
} from 'lucide-react';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [educationLevel, setEducationLevel] = useState<EducationLevelId>(
    (user?.education_level as EducationLevelId) || 'btech'
  );
  const [institution, setInstitution] = useState(user?.institution || '');
  const [streamOrBranch, setStreamOrBranch] = useState(user?.stream_or_branch || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const selectedConfig =
    EDUCATION_LEVELS.find((l) => l.id === educationLevel) || EDUCATION_LEVELS[5];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        education_level: educationLevel,
        institution: institution.trim(),
        stream_or_branch: streamOrBranch.trim()
      });
      onComplete();
    } catch (err) {
      console.error('Failed to update student profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className={`rounded-2xl sm:rounded-3xl border shadow-2xl max-w-lg w-full max-h-[92dvh] overflow-y-auto custom-scrollbar transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
            : 'bg-[#111827] border-slate-800 text-slate-100 shadow-black/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div
          className={`p-5 sm:p-6 border-b relative ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-900'
              : 'bg-[#161F33] border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold'
                  : 'bg-purple-950/70 text-purple-300 border-purple-800'
              }`}
            >
              First-Time Setup
            </span>
            <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Personalized Configuration
            </span>
          </div>

          <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Welcome, {user?.name || 'Student'}! 👋
          </h2>
          <p className={`text-xs mt-1 leading-relaxed font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            Let’s configure your educational context so our machine-learning model uses the right terminology, syllabus subjects, and grading scale.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              What is your current education level?
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as EducationLevelId)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold border focus:outline-none cursor-pointer min-h-[44px] transition ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                  : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
              }`}
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#111827] text-white'}>
                  {lvl.label} ({lvl.category})
                </option>
              ))}
            </select>
            <p className={`text-[11px] mt-1 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {selectedConfig.description}
            </p>
          </div>

          {selectedConfig.streamOrBranchLabel && (
            <div>
              <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {selectedConfig.streamOrBranchLabel}
              </label>
              {selectedConfig.streamOrBranchOptions ? (
                <select
                  value={streamOrBranch}
                  onChange={(e) => setStreamOrBranch(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold border focus:outline-none cursor-pointer min-h-[44px] transition ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                  }`}
                >
                  <option value="" className={isLight ? 'bg-white text-slate-500' : 'bg-[#111827] text-slate-400'}>
                    Select your specialization / stream
                  </option>
                  {selectedConfig.streamOrBranchOptions.map((opt) => (
                    <option key={opt} value={opt} className={isLight ? 'bg-white text-slate-900' : 'bg-[#111827] text-white'}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={streamOrBranch}
                  onChange={(e) => setStreamOrBranch(e.target.value)}
                  placeholder="e.g. Mechanical Engineering / Commerce"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium border focus:outline-none min-h-[44px] transition ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                  }`}
                />
              )}
            </div>
          )}

          <div>
            <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              School / College / Institution Name (Optional)
            </label>
            <div className="relative">
              <School className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Marwadi University / National Public School"
                className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-medium border focus:outline-none min-h-[44px] transition ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                    : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                }`}
              />
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
              isLight
                ? 'bg-purple-50 border-purple-200 text-purple-900'
                : 'bg-purple-950/60 border-purple-800 text-purple-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Once saved, you can run your first machine-learning performance assessment. Your forecasts will remain private to your student account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto px-4 py-2.5 min-h-[44px]"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary w-full sm:w-auto px-5 py-2.5 gap-2 min-h-[44px]"
            >
              <span className="text-white font-bold">{isSaving ? 'Saving Profile...' : 'Save & Start First Assessment'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
