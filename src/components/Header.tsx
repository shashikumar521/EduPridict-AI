import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Calendar,
  Plus,
  Menu,
  Sun,
  Moon,
  Sparkles,
  Globe,
  Home,
  User,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { SectionId } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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
  studentName
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sectionTitles: Record<SectionId, string> = {
    home: 'Public Home Page',
    login: 'Student Sign In & Portal',
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

  const displayName = user?.name || studentName || 'Dr. Elena Rostova';
  const displayEmail = user?.email || 'mentor@edupredict.ai';

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await logout();
    onNavigate('home');
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-20 transition-colors shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation with Home Return */}
        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-semibold flex items-center gap-1 cursor-pointer"
            title="Return to Public Home Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
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
        {/* Quick Link to Return to Public Home Page */}
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
          title="Return to Public Website"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Public Website</span>
        </button>

        {/* Term Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-xl font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>AY 2024–2025</span>
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
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs hover:shadow transition cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Prediction</span>
        </button>

        {/* Authenticated User Menu or Sign In Button */}
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              <div className="text-left hidden md:block">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {displayName}
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                  {user?.education_level || 'Student'}
                </span>
              </div>

              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={displayName}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs animate-fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {displayEmail}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Authenticated Student</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Profile & Academic Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => openAuthModal()}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl shadow-xs hover:shadow transition cursor-pointer active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
