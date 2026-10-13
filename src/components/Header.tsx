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
          ? 'bg-white/95 border-[#E9E5F2] text-[#11182E]'
          : 'bg-[#090a0f]/95 border-zinc-800/80 text-zinc-100'
      }`}
    >
      <div className="site-container flex items-center justify-between gap-2 sm:gap-3 w-full">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Mobile menu trigger */}
          <button
            onClick={onOpenMobileMenu}
            className={`md:hidden p-1.5 rounded-xl border transition shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
              isLight
                ? 'text-[#526581] hover:text-[#11182E] bg-[#F0F3F8] hover:bg-white border-[#E9E5F2]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-zinc-800'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Navigation with Home Return */}
          <nav
            aria-label="Breadcrumb"
            className={`flex items-center text-xs gap-1 sm:gap-1.5 font-medium min-w-0 ${
              isLight ? 'text-[#526581]' : 'text-zinc-400'
            }`}
          >
            <button
              onClick={() => onNavigate('home')}
              className={`transition font-semibold flex items-center gap-1 cursor-pointer shrink-0 ${
                isLight ? 'text-[#11182E] hover:text-[#8000E8]' : 'text-zinc-300 hover:text-purple-300'
              }`}
              title="Return to Public Home Page"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#526581]/50' : 'text-zinc-600'}`} />
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition font-semibold hidden sm:inline shrink-0 ${
                isLight ? 'text-[#526581] hover:text-[#11182E]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              EduPredict AI
            </button>
            <ChevronRight className={`w-3.5 h-3.5 hidden sm:inline shrink-0 ${isLight ? 'text-[#526581]/50' : 'text-zinc-600'}`} />
            <span
              className={`font-bold truncate max-w-[130px] sm:max-w-none ${
                isLight ? 'text-[#8000E8]' : 'text-[#8B5CF6]'
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
                ? 'bg-[#F0F3F8] hover:bg-white text-[#11182E] border-[#E9E5F2]'
                : 'text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
            }`}
            title="Return to Public Website"
          >
            <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-[#8000E8]' : 'text-zinc-400'}`} />
            <span className="hidden md:inline">Public Website</span>
          </button>

          {/* Term Indicator */}
          <div
            className={`hidden xl:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl font-medium border ${
              isLight
                ? 'bg-[#F0F3F8] text-[#526581] border-[#E9E5F2]'
                : 'text-zinc-400 bg-zinc-900 border-zinc-800'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-[#8000E8]' : 'text-[#8B5CF6]'}`} />
            <span>AY 2024–2025</span>
          </div>

          {/* New Prediction Shortcut */}
          <button
            onClick={() => onNavigate('predict')}
            className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-1.5 rounded-xl shadow-md transition cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-[#8000E8] hover:bg-[#6a00c2] shadow-[#8000E8]/20'
                : 'bg-[#8000E8] hover:bg-[#9226ff] shadow-[#8000E8]/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Prediction</span>
          </button>

          {/* Authenticated User Menu or Sign In Button */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 p-1 pl-2 rounded-xl border transition cursor-pointer min-h-[36px] ${
                  isLight
                    ? 'border-[#E9E5F2] bg-white hover:bg-[#F0F3F8]'
                    : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800'
                }`}
              >
                <div className="text-left hidden md:block">
                  <span
                    className={`block text-xs font-bold truncate max-w-[120px] ${
                      isLight ? 'text-[#11182E]' : 'text-white'
                    }`}
                  >
                    {displayName}
                  </span>
                  <span
                    className={`block text-[10px] capitalize ${
                      isLight ? 'text-[#526581]' : 'text-zinc-400'
                    }`}
                  >
                    {user?.education_level || 'Student'}
                  </span>
                </div>

                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={displayName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#8000E8]/40"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs bg-[#8000E8]"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <ChevronDown className={`w-3.5 h-3.5 mr-0.5 ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl py-2 z-50 text-xs animate-in fade-in ${
                    isLight
                      ? 'bg-white border-[#E9E5F2] text-[#11182E]'
                      : 'bg-[#0d0f17] border-zinc-800 text-zinc-100'
                  }`}
                >
                  <div className={`px-4 py-2.5 border-b ${isLight ? 'border-[#E9E5F2]' : 'border-zinc-800'}`}>
                    <p className={`font-bold truncate ${isLight ? 'text-[#11182E]' : 'text-white'}`}>
                      {displayName}
                    </p>
                    <p className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
                      {displayEmail}
                    </p>
                    <div
                      className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                        isLight
                          ? 'bg-[#8000E8]/10 text-[#8000E8] border-[#8000E8]/20'
                          : 'bg-[#8000E8]/20 text-purple-300 border-[#8000E8]/30'
                      }`}
                    >
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
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                        isLight
                          ? 'hover:bg-[#F0F3F8] text-[#526581] hover:text-[#11182E]'
                          : 'hover:bg-zinc-800/60 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4 opacity-70" />
                      <span>Profile & Academic Settings</span>
                    </button>
                  </div>

                  <div className={`pt-1 border-t ${isLight ? 'border-[#E9E5F2]' : 'border-zinc-800'}`}>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 hover:bg-rose-500/10 flex items-center gap-2 text-rose-500 font-semibold cursor-pointer"
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
              className={`inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl shadow-md transition cursor-pointer active:scale-95 min-h-[38px] ${
                isLight
                  ? 'bg-[#8000E8] hover:bg-[#6a00c2] shadow-[#8000E8]/20'
                  : 'bg-[#8000E8] hover:bg-[#9226ff] shadow-[#8000E8]/30'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
