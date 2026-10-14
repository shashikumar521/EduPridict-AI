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
  onOpenProfileSetup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onNavigate,
  onOpenMobileMenu,
  studentName,
  onOpenProfileSetup
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
    analysis: 'Academic Analysis & Trajectory',
    scheduler: 'Exam Scheduler & Study Planner',
    learn: 'Learn & Practice Studio',
    dashboard: 'Academic Analysis & Trajectory',
    predict: 'Academic Assessment & Predictor',
    whatif: 'What-If Sensitivity Simulator',
    students: 'Students Directory',
    progress: 'Academic Progress Trajectory',
    subjects: 'Subject Diagnostics',
    planner: 'Exam Scheduler & Timetable',
    roadmap: 'Academic Learning Roadmap',
    courses: 'Verified Curricula',
    counselor: 'AI Academic Coach',
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
          ? 'bg-white/95 border-[#E1E6EF] text-[#172033] shadow-xs'
          : 'bg-[#131926]/95 border-[#1E2B42] text-[#F7F8FC] shadow-xs'
      }`}
    >
      <div className="site-container flex items-center justify-between gap-2 sm:gap-3 w-full">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Mobile menu trigger */}
          <button
            onClick={onOpenMobileMenu}
            className={`md:hidden p-1.5 rounded-xl border transition shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
              isLight
                ? 'text-[#526078] hover:text-[#172033] bg-[#F0F3F9] hover:bg-[#E1E6EF] border-[#CBD3E1]'
                : 'text-slate-300 hover:text-white bg-[#182236] hover:bg-[#1F2C46] border-[#2D3E5E]'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Navigation with Home Return */}
          <nav
            aria-label="Breadcrumb"
            className={`flex items-center text-xs gap-1 sm:gap-1.5 font-medium min-w-0 ${
              isLight ? 'text-[#526078]' : 'text-slate-300'
            }`}
          >
            <button
              onClick={() => onNavigate('home')}
              className={`transition font-semibold flex items-center gap-1 cursor-pointer shrink-0 ${
                isLight ? 'text-[#172033] hover:text-[#7000E8]' : 'text-slate-100 hover:text-[#C4B5FD]'
              }`}
              title="Return to Public Home Page"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#667085]' : 'text-slate-500'}`} />
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition font-semibold hidden sm:inline-flex items-center gap-1.5 shrink-0 ${
                isLight ? 'text-[#526078] hover:text-[#172033]' : 'text-slate-300 hover:text-white'
              }`}
            >
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI"
                className="w-4 h-4 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              EduPredict AI
            </button>
            <ChevronRight className={`w-3.5 h-3.5 hidden sm:inline shrink-0 ${isLight ? 'text-[#667085]' : 'text-slate-500'}`} />
            <span
              className={`font-bold truncate max-w-[130px] sm:max-w-none ${
                isLight ? 'text-[#7000E8]' : 'text-[#C4B5FD]'
              }`}
            >
              {sectionTitles[currentSection] || 'Academic Analysis'}
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
                ? 'bg-[#F0F3F9] hover:bg-[#E1E6EF] text-[#172033] border-[#CBD3E1]'
                : 'bg-[#182236] hover:bg-[#1F2C46] text-slate-100 border-[#2D3E5E]'
            }`}
            title="Return to Public Website"
          >
            <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-[#7000E8]' : 'text-[#C4B5FD]'}`} />
            <span className="hidden md:inline">Public Website</span>
          </button>

          {/* Term Indicator */}
          <div
            className={`hidden xl:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-semibold border ${
              isLight
                ? 'bg-[#F0F3F9] text-[#526078] border-[#E1E6EF]'
                : 'text-slate-300 bg-[#182236] border-[#1E2B42]'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-[#7000E8]' : 'text-[#C4B5FD]'}`} />
            <span>AY 2024–2025</span>
          </div>

          {/* 3 Core Workflow Navigation Controls */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-[#F0F3F9] dark:bg-[#182236] border border-[#E1E6EF] dark:border-[#1E2B42] text-xs font-semibold">
            <button
              onClick={() => onNavigate('analysis')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                ['analysis', 'dashboard', 'predict', 'whatif', 'subjects', 'progress'].includes(currentSection)
                  ? 'bg-[#7000E8] text-white shadow-xs font-bold'
                  : 'text-[#526078] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white hover:bg-white dark:hover:bg-[#131926]'
              }`}
            >
              Academic Analysis
            </button>
            <button
              onClick={() => onNavigate('scheduler')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                ['scheduler', 'planner', 'readiness'].includes(currentSection)
                  ? 'bg-[#7000E8] text-white shadow-xs font-bold'
                  : 'text-[#526078] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white hover:bg-white dark:hover:bg-[#131926]'
              }`}
            >
              Exam Scheduler
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                ['learn', 'courses', 'counselor', 'roadmap'].includes(currentSection)
                  ? 'bg-[#7000E8] text-white shadow-xs font-bold'
                  : 'text-[#526078] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white hover:bg-white dark:hover:bg-[#131926]'
              }`}
            >
              Learn &amp; Practice
            </button>
          </div>

          {/* Authenticated User Menu or Sign In Button */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 p-1 pl-2 rounded-xl border transition cursor-pointer min-h-[36px] ${
                  isLight
                    ? 'border-[#CBD3E1] bg-white hover:bg-[#F0F3F9]'
                    : 'border-[#2D3E5E] bg-[#182236] hover:bg-[#1F2C46]'
                }`}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="text-left hidden md:block">
                  <span
                    className={`block text-xs font-bold truncate max-w-[120px] ${
                      isLight ? 'text-[#172033]' : 'text-[#F7F8FC]'
                    }`}
                  >
                    {displayName}
                  </span>
                  <span
                    className={`block text-[10px] font-medium capitalize ${
                      isLight ? 'text-[#526078]' : 'text-slate-300'
                    }`}
                  >
                    {user?.education_level || 'Student'}
                  </span>
                </div>

                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={displayName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#7000E8]/40"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs bg-[#7000E8]"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <ChevronDown className={`w-3.5 h-3.5 mr-0.5 ${isLight ? 'text-[#526078]' : 'text-slate-300'}`} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl py-2 z-50 text-xs animate-in fade-in ${
                    isLight
                      ? 'bg-white border-[#E1E6EF] text-[#172033]'
                      : 'bg-[#131926] border-[#1E2B42] text-[#F7F8FC]'
                  }`}
                >
                  <div className={`px-4 py-2.5 border-b ${isLight ? 'border-[#E1E6EF]' : 'border-[#1E2B42]'}`}>
                    <p className={`font-bold truncate text-sm ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                      {displayName}
                    </p>
                    <p className={`text-xs truncate mt-0.5 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                      {displayEmail}
                    </p>
                    <div
                      className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        isLight
                          ? 'bg-[#EEE7FF] text-[#7000E8] border-[#D1B8FC]'
                          : 'bg-[#7000E8]/20 text-[#C4B5FD] border-[#8E30FF]/40'
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
                        onNavigate('analysis');
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                        isLight
                          ? 'hover:bg-[#F0F3F9] text-[#526078] hover:text-[#172033]'
                          : 'hover:bg-[#182236] text-slate-200 hover:text-white'
                      }`}
                    >
                      <span>Academic Analysis</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('scheduler');
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                        isLight
                          ? 'hover:bg-[#F0F3F9] text-[#526078] hover:text-[#172033]'
                          : 'hover:bg-[#182236] text-slate-200 hover:text-white'
                      }`}
                    >
                      <span>Exam Scheduler</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('learn');
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                        isLight
                          ? 'hover:bg-[#F0F3F9] text-[#526078] hover:text-[#172033]'
                          : 'hover:bg-[#182236] text-slate-200 hover:text-white'
                      }`}
                    >
                      <span>Learn &amp; Practice</span>
                    </button>
                    {onOpenProfileSetup && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfileSetup();
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                          isLight
                            ? 'hover:bg-[#EEE7FF] text-[#7000E8]'
                            : 'hover:bg-[#7000E8]/20 text-[#C4B5FD]'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-[#7000E8] dark:text-[#C4B5FD]" />
                        <span>Academic Onboarding (5-Step)</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                        isLight
                          ? 'hover:bg-[#F0F3F9] text-[#526078] hover:text-[#172033]'
                          : 'hover:bg-[#182236] text-slate-200 hover:text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-[#7000E8] dark:text-[#C4B5FD]" />
                      <span>Profile &amp; Academic Settings</span>
                    </button>
                  </div>

                  <div className={`pt-1 border-t ${isLight ? 'border-[#E1E6EF]' : 'border-[#1E2B42]'}`}>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 hover:bg-[#FEECEC] dark:hover:bg-[rgba(180,35,24,0.15)] flex items-center gap-2 text-[#B42318] dark:text-[#FCA5A5] font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#B42318] dark:text-[#FCA5A5]" />
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
