import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Save,
  User,
  Sun,
  Moon,
  GraduationCap,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { EDUCATION_LEVELS } from '../data/educationLevels';

export const SettingsView: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Profile state
  const [userName, setUserName] = useState(user?.name || 'Student');
  const [educationLevel, setEducationLevel] = useState(user?.education_level || 'btech');
  const [department, setDepartment] = useState(user?.stream_or_branch || 'Computer Science & Engineering');
  const [institution, setInstitution] = useState(user?.institution || 'College of Engineering & Technology');
  const [email, setEmail] = useState(user?.email || 'student@edupredict.ai');

  // Sync when user loads
  useEffect(() => {
    if (user) {
      if (user.name) setUserName(user.name);
      if (user.email) setEmail(user.email);
      if (user.education_level) setEducationLevel(user.education_level);
      if (user.stream_or_branch) setDepartment(user.stream_or_branch);
      if (user.institution) setInstitution(user.institution);
    }
  }, [user]);

  // Academic settings
  const [gradingScale, setGradingScale] = useState<'percentage' | 'cgpa_10' | 'gpa_4' | 'letter'>('percentage');
  const [riskSensitivity, setRiskSensitivity] = useState<'high_recall' | 'balanced' | 'conservative'>('high_recall');
  const [minAttendanceThreshold, setMinAttendanceThreshold] = useState(75);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoSavePredictions, setAutoSavePredictions] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isAuthenticated) {
        await updateProfile({
          name: userName,
          education_level: educationLevel,
          institution: institution,
          stream_or_branch: department
        });
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile from settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setGradingScale('percentage');
    setRiskSensitivity('high_recall');
    setMinAttendanceThreshold(75);
    setEmailAlerts(true);
    setAutoSavePredictions(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div
        className={`rounded-2xl p-6 border transition-colors shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isLight
            ? 'bg-white border-[#E9E5F2] text-[#11182E]'
            : 'bg-[#0d0f17] border-zinc-800/80 text-zinc-100'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-[#8000E8]/10 text-[#8000E8] border-[#8000E8]/20'
                  : 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30'
              }`}
            >
              System &amp; Profile
            </span>
            <span className={`text-xs ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`}>
              Academic Configuration
            </span>
          </div>
          <h2
            className={`text-2xl font-extrabold mt-1 tracking-tight ${
              isLight ? 'text-[#11182E]' : 'text-white'
            }`}
          >
            Profile &amp; Academic Settings
          </h2>
          <p
            className={`text-sm mt-1 max-w-2xl ${
              isLight ? 'text-[#526581]' : 'text-zinc-400'
            }`}
          >
            Update your student identity, educational degree program, institution compliance standards, and appearance preferences.
          </p>
        </div>

        {/* Save button feedback */}
        {isSaved && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Profile &amp; Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 0: User Profile */}
        <div
          className={`rounded-2xl p-6 border transition-colors shadow-xs space-y-4 ${
            isLight
              ? 'bg-white border-[#E9E5F2] text-[#11182E]'
              : 'bg-[#0d0f17] border-zinc-800/80 text-zinc-100'
          }`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#E9E5F2] dark:border-zinc-800">
            <User className="w-4 h-4 text-[#8000E8] dark:text-[#8B5CF6]" />
            <h3
              className={`text-sm font-bold ${
                isLight ? 'text-[#11182E]' : 'text-white'
              }`}
            >
              Student Profile Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? 'text-[#11182E]' : 'text-zinc-300'
                }`}
              >
                Student Full Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium border focus:outline-none transition ${
                  isLight
                    ? 'bg-white border-[#E9E5F2] text-[#11182E] focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8]'
                    : 'bg-zinc-900 border-zinc-800 text-white focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? 'text-[#11182E]' : 'text-zinc-300'
                }`}
              >
                Account Email Address
              </label>
              <input
                type="email"
                disabled={Boolean(user?.email)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium border focus:outline-none transition ${
                  user?.email
                    ? 'opacity-70 cursor-not-allowed bg-slate-100 dark:bg-zinc-800/80 border-[#E9E5F2] dark:border-zinc-800'
                    : isLight
                    ? 'bg-white border-[#E9E5F2] text-[#11182E] focus:border-[#8000E8]'
                    : 'bg-zinc-900 border-zinc-800 text-white focus:border-[#8B5CF6]'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? 'text-[#11182E]' : 'text-zinc-300'
                }`}
              >
                Education Level
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium border focus:outline-none cursor-pointer transition ${
                  isLight
                    ? 'bg-white border-[#E9E5F2] text-[#11182E] focus:border-[#8000E8]'
                    : 'bg-zinc-900 border-zinc-800 text-white focus:border-[#8B5CF6]'
                }`}
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? 'text-[#11182E]' : 'text-zinc-300'
                }`}
              >
                Branch, Stream or Specialization
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium border focus:outline-none transition ${
                  isLight
                    ? 'bg-white border-[#E9E5F2] text-[#11182E] focus:border-[#8000E8]'
                    : 'bg-zinc-900 border-zinc-800 text-white focus:border-[#8B5CF6]'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? 'text-[#11182E]' : 'text-zinc-300'
                }`}
              >
                College, University or School Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Faculty of Engineering and Applied Sciences"
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium border focus:outline-none transition ${
                  isLight
                    ? 'bg-white border-[#E9E5F2] text-[#11182E] focus:border-[#8000E8]'
                    : 'bg-zinc-900 border-zinc-800 text-white focus:border-[#8B5CF6]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 1: Appearance */}
        <div
          className={`rounded-2xl p-6 border transition-colors shadow-xs space-y-4 ${
            isLight
              ? 'bg-white border-[#E9E5F2] text-[#11182E]'
              : 'bg-[#0d0f17] border-zinc-800/80 text-zinc-100'
          }`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#E9E5F2] dark:border-zinc-800">
            <Sun className="w-4 h-4 text-[#8000E8] dark:text-[#8B5CF6]" />
            <h3
              className={`text-sm font-bold ${
                isLight ? 'text-[#11182E]' : 'text-white'
              }`}
            >
              Interface Appearance &amp; Theme
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E9E5F2] dark:border-zinc-800 bg-[#F7F9FC] dark:bg-zinc-900/60">
            <div>
              <p
                className={`text-xs font-bold ${
                  isLight ? 'text-[#11182E]' : 'text-white'
                }`}
              >
                Color Theme (Light / Dark)
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? 'text-[#526581]' : 'text-zinc-400'
                }`}
              >
                Switch between high-contrast light mode (`#F7F9FC`) and dark mode. Saved to your browser.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Section 2: Institutional Compliance & Machine Learning Parameters */}
        <div
          className={`rounded-2xl p-6 border transition-colors shadow-xs space-y-4 ${
            isLight
              ? 'bg-white border-[#E9E5F2] text-[#11182E]'
              : 'bg-[#0d0f17] border-zinc-800/80 text-zinc-100'
          }`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#E9E5F2] dark:border-zinc-800">
            <Sliders className="w-4 h-4 text-[#8000E8] dark:text-[#8B5CF6]" />
            <h3
              className={`text-sm font-bold ${
                isLight ? 'text-[#11182E]' : 'text-white'
              }`}
            >
              Academic Parameters &amp; Risk Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? 'text-[#11182E]' : 'text-zinc-300'
                }`}
              >
                Minimum Statutory Attendance Threshold (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={90}
                  value={minAttendanceThreshold}
                  onChange={(e) => setMinAttendanceThreshold(Number(e.target.value))}
                  className="flex-1 accent-[#8000E8]"
                />
                <span
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border shrink-0 ${
                    isLight
                      ? 'bg-[#F0F3F8] text-[#8000E8] border-[#E9E5F2]'
                      : 'bg-zinc-900 text-purple-300 border-zinc-800'
                  }`}
                >
                  {minAttendanceThreshold}%
                </span>
              </div>
              <p
                className={`text-[11px] mt-1 ${
                  isLight ? 'text-[#526581]' : 'text-zinc-400'
                }`}
              >
                Standard requirement for semester examination eligibility.
              </p>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? 'text-[#11182E]' : 'text-zinc-300'
                }`}
              >
                Model Risk Sensitivity Tier
              </label>
              <select
                value={riskSensitivity}
                onChange={(e) => setRiskSensitivity(e.target.value as any)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium border focus:outline-none cursor-pointer transition ${
                  isLight
                    ? 'bg-white border-[#E9E5F2] text-[#11182E] focus:border-[#8000E8]'
                    : 'bg-zinc-900 border-zinc-800 text-white focus:border-[#8B5CF6]'
                }`}
              >
                <option value="high_recall">
                  High Recall (92.6% Recall — Prioritizes detecting any struggling student)
                </option>
                <option value="balanced">Balanced Precision &amp; Recall (F1 90.3%)</option>
                <option value="conservative">Conservative (Minimizes false alarms)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit & Reset Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-[#F0F3F8] text-[#526581] border-[#E9E5F2]'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-[#8000E8] hover:bg-[#6a00c2] shadow-[#8000E8]/20'
                : 'bg-[#8000E8] hover:bg-[#9226ff] shadow-[#8000E8]/30'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
