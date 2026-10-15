import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Calendar,
  Menu,
  Home,
  User,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown,
  Check,
  Bot,
  Sparkles
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

const ACADEMIC_YEARS = [
  { id: 'ay2425', label: 'AY 2024–2025', badge: 'Current' },
  { id: 'sp25', label: 'Spring Semester 2025', badge: 'Active' },
  { id: 'fa24', label: 'Fall Semester 2024', badge: 'Archived' },
  { id: 'ay2526', label: 'AY 2025–2026', badge: 'Upcoming' }
];

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
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('AY 2024–2025');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const yearMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (yearMenuRef.current && !yearMenuRef.current.contains(event.target as Node)) {
        setIsYearMenuOpen(false);
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
    dashboard: 'Student Dashboard',
    predict: 'Academic Assessment & Predictor',
    whatif: 'What-If Sensitivity Simulator',
    students: 'Students Directory',
    progress: 'Academic Progress Trajectory',
    subjects: 'Subject Diagnostics',
    planner: 'Exam Scheduler & Timetable',
    roadmap: 'Academic Learning Roadmap',
    courses: 'Courses & Certifications',
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
          ? 'bg-white/95 border-[#E2E8F0] text-[#172033] shadow-xs'
          : 'bg-[#1E293B]/95 border-[#334155] text-[#F8FAFC] shadow-xs'
      }`}
    >
      <div className="site-container flex items-center justify-between gap-3 sm:gap-4 w-full">
        {/* Left Side: Mobile Menu Button & Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Mobile menu trigger */}
          <button
            onClick={onOpenMobileMenu}
            className={`md:hidden p-1.5 rounded-xl border transition shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
              isLight
                ? 'text-[#526078] hover:text-[#172033] bg-[#F8FAFC] hover:bg-[#EDE9FE] border-[#E2E8F0]'
                : 'text-slate-300 hover:text-white bg-[#172033] hover:bg-[#243248] border-[#334155]'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className={`flex items-center text-xs gap-1 sm:gap-1.5 font-medium min-w-0 ${
              isLight ? 'text-[#526078]' : 'text-slate-300'
            }`}
          >
            <button
              onClick={() => onNavigate('home')}
              className={`transition font-semibold flex items-center gap-1 cursor-pointer shrink-0 py-1 px-1.5 rounded-lg ${
                isLight
                  ? 'text-[#172033] hover:text-[#6D28D9] hover:bg-[#F5F3FF]'
                  : 'text-slate-100 hover:text-[#DDD6FE] hover:bg-[#172033]'
              }`}
              title="Return to Public Home Page"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#64748B]' : 'text-slate-500'}`} />
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition font-semibold hidden sm:inline-flex items-center gap-1.5 shrink-0 py-1 px-1.5 rounded-lg ${
                isLight
                  ? 'text-[#526078] hover:text-[#172033] hover:bg-[#F8FAFC]'
                  : 'text-slate-300 hover:text-white hover:bg-[#172033]'
              }`}
              title="Go to Student Dashboard"
            >
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI"
                className="w-4 h-4 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              EduPredict AI
            </button>
            <ChevronRight className={`w-3.5 h-3.5 hidden sm:inline shrink-0 ${isLight ? 'text-[#64748B]' : 'text-slate-500'}`} />
            <span
              className={`font-bold px-2 py-0.5 rounded-md text-xs truncate max-w-[140px] sm:max-w-none border ${
                isLight
                  ? 'text-[#6D28D9] bg-[#EDE9FE] border-[#DDD6FE]'
                  : 'text-[#DDD6FE] bg-[#6D28D9]/25 border-[#8B5CF6]/40'
              }`}
            >
              {sectionTitles[currentSection] || 'Academic Analysis'}
            </span>
          </nav>
        </div>

        {/* Right Side: Academic Year Selector, Theme Toggle, User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Academic Year Selector with Interactive Dropdown */}
          <div className="relative" ref={yearMenuRef}>
            <button
              type="button"
              onClick={() => setIsYearMenuOpen(!isYearMenuOpen)}
              aria-expanded={isYearMenuOpen}
              aria-label="Select Academic Term"
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-semibold border transition cursor-pointer ${
                isLight
                  ? 'bg-[#F8FAFC] hover:bg-[#EDE9FE] text-[#172033] border-[#E2E8F0]'
                  : 'bg-[#172033] hover:bg-[#243248] text-slate-200 border-[#334155]'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-[#6D28D9]' : 'text-[#DDD6FE]'}`} />
              <span>{selectedYear}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isYearMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isYearMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl py-2 z-50 text-xs animate-in fade-in ${
                  isLight
                    ? 'bg-white border-[#E2E8F0] text-[#172033]'
                    : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
                }`}
              >
                <div className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#526078]' : 'text-slate-400'}`}>
                  Academic Term
                </div>
                {ACADEMIC_YEARS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedYear(item.label);
                      setIsYearMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition cursor-pointer ${
                      selectedYear === item.label
                        ? isLight
                          ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold'
                          : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold'
                        : isLight
                        ? 'hover:bg-[#F8FAFC] text-[#172033]'
                        : 'hover:bg-[#172033] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                        item.badge === 'Current'
                          ? 'bg-[#DCFCE7] text-[#15803D] dark:bg-[rgba(21,128,61,0.22)] dark:text-[#86EFAC]'
                          : 'bg-slate-100 text-[#64748B] dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    {selectedYear === item.label && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* EduPredict AI Assistant Launch Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-edupredict-chatbot'))}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-bold border transition cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] border-[#C4B5FD]'
                : 'bg-[#6D28D9]/25 hover:bg-[#6D28D9]/40 text-[#DDD6FE] border-[#7C3AED]/40'
            }`}
            title="Ask EduPredict AI Assistant"
            aria-label="Ask EduPredict AI Assistant"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Assistant</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </button>

          {/* Theme Toggle Button (Sun / Moon) */}
          <ThemeToggle />

          {/* Authenticated User Menu or Sign In Button */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 p-1 pl-2 rounded-xl border transition cursor-pointer min-h-[36px] ${
                  isLight
                    ? 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                    : 'border-[#334155] bg-[#172033] hover:bg-[#243248]'
                }`}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                aria-label="User Account Menu"
              >
                <div className="text-left hidden md:block">
                  <span
                    className={`block text-xs font-bold truncate max-w-[120px] ${
                      isLight ? 'text-[#172033]' : 'text-[#F8FAFC]'
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
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#6D28D9]/40"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs bg-[#6D28D9]"
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
                      ? 'bg-white border-[#E2E8F0] text-[#172033]'
                      : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
                  }`}
                >
                  <div className={`px-4 py-2.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#334155]'}`}>
                    <p className={`font-bold truncate text-sm ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                      {displayName}
                    </p>
                    <p className={`text-xs truncate mt-0.5 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                      {displayEmail}
                    </p>
                    <div
                      className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        isLight
                          ? 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]'
                          : 'bg-[#6D28D9]/25 text-[#DDD6FE] border-[#8B5CF6]/40'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Authenticated Student</span>
                    </div>
                  </div>

                  <div className="py-1">
                    {onOpenProfileSetup && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfileSetup();
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                          isLight
                            ? 'hover:bg-[#EDE9FE] text-[#6D28D9]'
                            : 'hover:bg-[#6D28D9]/25 text-[#DDD6FE]'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-[#6D28D9] dark:text-[#DDD6FE]" />
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
                          ? 'hover:bg-[#F8FAFC] text-[#526078] hover:text-[#172033]'
                          : 'hover:bg-[#172033] text-slate-200 hover:text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-[#6D28D9] dark:text-[#DDD6FE]" />
                      <span>Profile &amp; Academic Settings</span>
                    </button>
                  </div>

                  <div className={`pt-1 border-t ${isLight ? 'border-[#E2E8F0]' : 'border-[#334155]'}`}>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 hover:bg-[#FEE2E2] dark:hover:bg-[rgba(185,28,28,0.2)] flex items-center gap-2 text-[#B91C1C] dark:text-[#FCA5A5] font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#B91C1C] dark:text-[#FCA5A5]" />
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

