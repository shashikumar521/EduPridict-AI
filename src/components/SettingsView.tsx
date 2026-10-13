import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Save,
  User,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();

  // Profile state
  const [userName, setUserName] = useState(user?.name || 'Dr. Elena Rostova');
  const [userRole, setUserRole] = useState(user?.education_level ? `Student (${user.education_level})` : 'Senior Academic Advisor & Head of Retention');
  const [department, setDepartment] = useState(user?.stream_or_branch || 'Department of Computer Science & Applied AI');
  const [email, setEmail] = useState(user?.email || 'e.rostova@edupredict.edu');

  // Sync when user loads
  React.useEffect(() => {
    if (user) {
      setUserName(user.name);
      setEmail(user.email);
      if (user.education_level) setUserRole(`Student (${user.education_level})`);
      if (user.stream_or_branch) setDepartment(user.stream_or_branch);
    }
  }, [user]);

  // Academic settings
  const [gradingScale, setGradingScale] = useState<'percentage' | 'cgpa_10' | 'gpa_4' | 'letter'>('percentage');
  const [riskSensitivity, setRiskSensitivity] = useState<'high_recall' | 'balanced' | 'conservative'>('high_recall');
  const [academicTerm, setAcademicTerm] = useState('Academic Year 2024–2025 (Term 2)');
  const [minAttendanceThreshold, setMinAttendanceThreshold] = useState(75);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoSavePredictions, setAutoSavePredictions] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      try {
        await updateProfile({
          name: userName,
          stream_or_branch: department
        });
      } catch (err) {
        console.error('Failed to update profile from settings:', err);
      }
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              System & Profile
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Institutional Configuration</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Profile & Academic Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Configure advisor profile, theme appearance, institutional grading standards, and machine learning risk sensitivity.
          </p>
        </div>

        {/* Save button feedback */}
        {isSaved && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 0: User Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Advisor Profile Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Role
              </label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Institutional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 1: Appearance / Dark Theme Mode */}
        {/* Section 1: Appearance */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sun className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Interface Appearance & Theme</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Color Theme Mode
            </label>
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 flex items-center gap-3 max-w-md">
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-left text-xs">
                <span className="block font-bold text-slate-900">Light Theme (Active & Default)</span>
                <span className="text-[11px] text-slate-600">High-contrast, distraction-free light theme across all pages, dashboards, and export reports.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Grading & Term Conventions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Grading & Academic Standards</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Grading Scale
              </label>
              <select
                value={gradingScale}
                onChange={(e) => setGradingScale(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="percentage">Percentage (0% – 100%) - Standard</option>
                <option value="cgpa_10">10-Point CGPA Scale (0.0 – 10.0)</option>
                <option value="gpa_4">4.0 GPA Scale (US / International)</option>
                <option value="letter">Letter Grades (A+, A, B, C, D, F)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                All input forms and reports adapt labels and calculation ranges to this standard.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Academic Term Designation
              </label>
              <input
                type="text"
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Displayed across headers and official performance dossiers.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Minimum Mandatory Class Attendance Threshold (%)
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                {minAttendanceThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={minAttendanceThreshold}
              onChange={(e) => setMinAttendanceThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Students falling below this percentage are automatically flagged in early-warning alerts.
            </p>
          </div>
        </div>

        {/* Section 3: Machine Learning Risk Calibration */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Machine Learning Decision Thresholds</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Model Risk Sensitivity Calibration
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRiskSensitivity('high_recall')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  riskSensitivity === 'high_recall'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">High Recall (Recommended)</span>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 px-1.5 py-0.2 rounded">
                    92.6% Recall
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Flags any student with ≥25% risk probability. Ensures almost zero vulnerable students slip past undetected.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRiskSensitivity('balanced')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  riskSensitivity === 'balanced'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Balanced Calibration</span>
                  <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-400 px-1.5 py-0.2 rounded">
                    89.4% Acc
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Standard 50% probability threshold balancing precision and recall equally.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRiskSensitivity('conservative')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  riskSensitivity === 'conservative'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Conservative / High Precision</span>
                  <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.2 rounded">
                    94.1% Prec
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Only triggers critical alerts when failure certainty exceeds 70%, avoiding false alarms.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Notification & System Defaults */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notification Preferences</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Automated Faculty Early-Warning Alerts
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Notify assigned mentors immediately when a student's predicted risk shifts to Critical.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSavePredictions}
                onChange={(e) => setAutoSavePredictions(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Auto-Archive Predictions to Historical Audit Trail
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically log each execution to the SQLite prediction history database table.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Controls footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
