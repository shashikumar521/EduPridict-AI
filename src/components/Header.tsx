import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Calendar,
  Plus,
  Menu,
  Globe,
  Home,
  User,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
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
  studentName
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
    planner: 'AI Exam Scheduler & Study Planner',
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

  const displayName = user?.name || studentName || 'Student';
  const displayEmail = user?.email || (user ? 'student@edupredict.ai' : 'Student Portal');

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await logout();
    onNavigate('home');
  };

  return (
    <header
      className={`py-2 sm:py-2.5 shrink-0 sticky top-0 z-20 transition-colors border-b backdrop-blur-md ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
          : 'bg-[#111827]/95 border-slate-800 text-slate-100 shadow-xs'
      }`}
    >
      <div className="site-container flex items-center justify-between gap-2 sm:gap-3 w-full">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Mobile menu trigger */}
          <button
            onClick={onOpenMobileMenu}
            className={`md:hidden p-1.5 rounded-xl border transition shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Navigation with Home Return */}
          <nav
            aria-label="Breadcrumb"
            className={`flex items-center text-xs gap-1 sm:gap-1.5 font-medium min-w-0 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <button
              onClick={() => onNavigate('home')}
              className={`transition font-semibold flex items-center gap-1 cursor-pointer shrink-0 ${
                isLight ? 'text-slate-900 hover:text-purple-700' : 'text-slate-100 hover:text-purple-300'
              }`}
              title="Return to Public Home Page"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition font-semibold hidden sm:inline shrink-0 ${
                isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              EduPredict AI
            </button>
            <ChevronRight className={`w-3.5 h-3.5 hidden sm:inline shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <span
              className={`font-bold truncate max-w-[130px] sm:max-w-none ${
                isLight ? 'text-purple-700' : 'text-purple-300'
              }`}
            >
              {sectionTitles[currentSection] || 'Dashboard'}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle Button (Sun / Moon) */}
          <ThemeToggle />

          {/* Quick Link to Return to Public Home Page */}
          <button
            onClick={() => onNavigate('home')}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
            }`}
            title="Return to Public Website"
          >
            <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
            <span className="hidden md:inline">Public Website</span>
          </button>

          {/* Term Indicator */}
          <div
            className={`hidden xl:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-semibold border ${
              isLight
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'text-slate-300 bg-slate-800/80 border-slate-700'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
            <span>AY 2024–2025</span>
          </div>

          {/* New Prediction Shortcut */}
          <button
            onClick={() => onNavigate('predict')}
            className="btn-primary text-xs !py-1.5 !px-3.5 gap-1.5 hidden sm:inline-flex"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span className="text-white">New Prediction</span>
          </button>

          {/* Authenticated User Menu or Sign In Button */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 p-1 pl-2 rounded-xl border transition cursor-pointer min-h-[36px] ${
                  isLight
                    ? 'border-slate-300 bg-white hover:bg-slate-100'
                    : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700'
                }`}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="text-left hidden md:block">
                  <span
                    className={`block text-xs font-bold truncate max-w-[120px] ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {displayName}
                  </span>
                  <span
                    className={`block text-[10px] font-medium capitalize ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {user?.education_level || 'Student'}
                  </span>
                </div>

                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={displayName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-600/40"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs bg-purple-700"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <ChevronDown className={`w-3.5 h-3.5 mr-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl py-2 z-50 text-xs animate-in fade-in ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900'
                      : 'bg-[#161F33] border-slate-700 text-slate-100'
                  }`}
                >
                  <div className={`px-4 py-2.5 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                    <p className={`font-bold truncate text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {displayName}
                    </p>
                    <p className={`text-xs truncate mt-0.5 font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {displayEmail}
                    </p>
                    <div
                      className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        isLight
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-purple-950/70 text-purple-300 border-purple-800'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Authenticated Student</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                        isLight
                          ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                          : 'hover:bg-slate-800 text-slate-200 hover:text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Profile & Academic Settings</span>
                    </button>
                  </div>

                  <div className={`pt-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 hover:bg-rose-500/10 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="btn-primary text-xs !py-1.5 !px-3.5 gap-1.5 min-h-[36px]"
            >
              <User className="w-3.5 h-3.5 text-white" />
              <span className="text-white">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
