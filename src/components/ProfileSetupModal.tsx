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
        className="bg-[#0d0f17] rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-2xl max-w-lg w-full max-h-[92dvh] overflow-y-auto custom-scrollbar transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="p-5 sm:p-6 bg-[#121522] border-b border-zinc-800 text-white relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
              First-Time Setup
            </span>
            <span className="text-xs text-zinc-400">Personalized Configuration</span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Welcome, {user?.name || 'Student'}! 👋
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Let’s configure your educational context so our machine-learning model uses the right terminology, syllabus subjects, and grading scale.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              What is your current education level?
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as EducationLevelId)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white font-medium focus:outline-none focus:border-[#8000E8] cursor-pointer min-h-[44px]"
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id} className="bg-[#0d0f17] text-white">
                  {lvl.label} ({lvl.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">
              {selectedConfig.description}
            </p>
          </div>

          {selectedConfig.streamOrBranchLabel && (
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                {selectedConfig.streamOrBranchLabel}
              </label>
              {selectedConfig.streamOrBranchOptions ? (
                <select
                  value={streamOrBranch}
                  onChange={(e) => setStreamOrBranch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white font-medium focus:outline-none focus:border-[#8000E8] cursor-pointer min-h-[44px]"
                >
                  <option value="" className="bg-[#0d0f17] text-zinc-400">Select your specialization / stream</option>
                  {selectedConfig.streamOrBranchOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0d0f17] text-white">
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#8000E8] min-h-[44px]"
                />
              )}
            </div>
          )}

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              School / College / Institution Name (Optional)
            </label>
            <div className="relative">
              <School className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Marwadi University / National Public School"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#8000E8] min-h-[44px]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Once saved, you can run your first machine-learning performance assessment. Your forecasts will remain private to your student account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 font-semibold hover:bg-zinc-800 hover:text-white transition cursor-pointer min-h-[44px]"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8000E8] hover:bg-[#6a00c2] text-white font-bold shadow-md shadow-[#8000E8]/25 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 min-h-[44px]"
            >
              <span>{isSaving ? 'Saving Profile...' : 'Save & Start First Assessment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
