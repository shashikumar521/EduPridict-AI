import React from 'react';
import { ChevronRight, Calendar, Plus, Menu, Sun, Moon, Sparkles } from 'lucide-react';
import { SectionId } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onOpenMobileMenu: () => void;
  studentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onNavigate,
  onOpenMobileMenu,
  studentName = 'Dr. Elena Rostova'
}) => {
  const { theme, toggleTheme } = useTheme();

  const sectionTitles: Record<SectionId, string> = {
    dashboard: 'Dashboard Overview',
    predict: 'Student Assessment & Predictor',
    whatif: 'What-If Scenario Simulator',
    students: 'Students Directory',
    progress: 'Academic Progress Trajectory',
    subjects: 'Subject-Wise Diagnostics',
    planner: 'Personalized Study Planner',
    roadmap: 'Academic Learning Roadmap',
    courses: 'Verified Course Recommendations',
    counselor: 'AI Academic Counselor',
    readiness: 'Examination Readiness Index',
    goals: 'Goals & Achievements',
    history: 'Prediction History Logs',
    analytics: 'Model Analytics & Evaluation',
    reports: 'Academic Performance Reports',
    notifications: 'Notifications & Alerts',
    settings: 'Profile & Academic Settings',
    about: 'About EduPredict AI'
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 md:px-6 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 font-medium">
          <button
            onClick={() => onNavigate('dashboard')}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition font-semibold"
          >
            EduPredict AI
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[170px] sm:max-w-none">
            {sectionTitles[currentSection] || 'Dashboard'}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Term Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-xl font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>AY 2024–2025 • Term 2</span>
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* New Prediction Shortcut */}
        <button
          onClick={() => onNavigate('predict')}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs hover:shadow transition cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Prediction</span>
          <span className="sm:hidden">Predict</span>
        </button>
      </div>
    </header>
  );
};
