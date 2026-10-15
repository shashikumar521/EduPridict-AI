import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Bot,
  Sparkles,
  GraduationCap,
  FileDown
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { EduPredictLogoAnimation } from './EduPredictLogoAnimation';

interface SidebarProps {
  currentSection: SectionId;
  onNavigate: (section: SectionId) => void;
  isOpen: boolean;
  onClose: () => void;
  studentCount?: number;
  isChatbotOpen?: boolean;
  onToggleChatbot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpen,
  onClose,
  isChatbotOpen,
  onToggleChatbot
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const handleSignOut = async () => {
    await logout();
    onNavigate('home');
  };

  const handleChatbotClick = () => {
    if (onToggleChatbot) {
      onToggleChatbot();
    } else {
      window.dispatchEvent(new CustomEvent('open-edupredict-chatbot'));
    }
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transform transition-all duration-200 ease-in-out md:static md:translate-x-0 shrink-0 h-full max-h-[100dvh] overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64 ${
          isLight
            ? 'bg-white border-r border-[#E2E8F0] text-[#172033] shadow-xs'
            : 'bg-[#1E293B] border-r border-[#334155] text-[#F8FAFC] shadow-xs'
        }`}
      >
        {/* App Logo & Branding */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'border-[#E2E8F0]' : 'border-[#334155]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <EduPredictLogoAnimation variant="sidebar" isCollapsed={isCollapsed} />
          </div>

          <div className="flex items-center">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden md:flex p-1 rounded-lg transition cursor-pointer ${
                isLight
                  ? 'text-[#526078] hover:text-[#172033] hover:bg-[#F8FAFC]'
                  : 'text-slate-300 hover:text-white hover:bg-[#172033]'
              }`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className={`md:hidden p-1.5 rounded-lg cursor-pointer ${
                isLight
                  ? 'text-[#526078] hover:text-[#172033] hover:bg-[#F8FAFC]'
                  : 'text-slate-300 hover:text-white hover:bg-[#172033]'
              }`}
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu Items with strictly specified order */}
        <div className="px-2.5 py-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4">
          
          {/* WORKSPACE */}
          <div>
            {!isCollapsed && (
              <p
                className={`px-3 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-[#334155]' : 'text-slate-200'
                }`}
              >
                Workspace
              </p>
            )}

            <nav className="space-y-0.5">
              {/* 1. Dashboard */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('dashboard');
                  onClose();
                }}
                title={isCollapsed ? 'Dashboard' : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  currentSection === 'dashboard'
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                }`}
              >
                <LayoutDashboard
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'dashboard'
                      ? isLight
                        ? 'text-[#6D28D9]'
                        : 'text-[#DDD6FE]'
                      : isLight
                      ? 'text-[#475569]'
                      : 'text-slate-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Dashboard</span>}
              </button>
            </nav>
          </div>

          {/* CORE WORKFLOWS */}
          <div>
            {!isCollapsed && (
              <p
                className={`px-3 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-[#334155]' : 'text-slate-200'
                }`}
              >
                Core Workflows
              </p>
            )}

            <nav className="space-y-0.5">
              {/* 2. Academic Analysis */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('analysis');
                  onClose();
                }}
                title={isCollapsed ? 'Academic Analysis' : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  currentSection === 'analysis' ||
                  ['predict', 'whatif', 'subjects', 'progress', 'students'].includes(currentSection)
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'analysis' ||
                    ['predict', 'whatif', 'subjects', 'progress', 'students'].includes(currentSection)
                      ? isLight
                        ? 'text-[#6D28D9]'
                        : 'text-[#DDD6FE]'
                      : isLight
                      ? 'text-[#475569]'
                      : 'text-slate-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Academic Analysis</span>}
              </button>

              {/* 3. Exam Scheduler */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('scheduler');
                  onClose();
                }}
                title={isCollapsed ? 'Exam Scheduler' : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  currentSection === 'scheduler' ||
                  ['planner', 'readiness', 'roadmap'].includes(currentSection)
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                }`}
              >
                <Calendar
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'scheduler' ||
                    ['planner', 'readiness', 'roadmap'].includes(currentSection)
                      ? isLight
                        ? 'text-[#6D28D9]'
                        : 'text-[#DDD6FE]'
                      : isLight
                      ? 'text-[#475569]'
                      : 'text-slate-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Exam Scheduler</span>}
              </button>

              {/* 4. Courses & Certifications — Dedicated sidebar item */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('courses');
                  onClose();
                }}
                title={isCollapsed ? 'Courses & Certifications' : undefined}
                aria-label="Courses & Certifications"
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  currentSection === 'courses'
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                }`}
              >
                <GraduationCap
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'courses'
                      ? isLight
                        ? 'text-[#6D28D9]'
                        : 'text-[#DDD6FE]'
                      : isLight
                      ? 'text-[#475569]'
                      : 'text-slate-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Courses &amp; Certifications</span>}
              </button>

              {/* 5. Learn & Practice */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('learn');
                  onClose();
                }}
                title={isCollapsed ? 'Learn & Practice' : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  currentSection === 'learn' ||
                  ['counselor'].includes(currentSection)
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                }`}
              >
                <BookOpen
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'learn' ||
                    ['counselor'].includes(currentSection)
                      ? isLight
                        ? 'text-[#6D28D9]'
                        : 'text-[#DDD6FE]'
                      : isLight
                      ? 'text-[#475569]'
                      : 'text-slate-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Learn &amp; Practice</span>}
              </button>

              {/* EduPredict AI Assistant — Positioned directly below Learn & Practice */}
              <button
                type="button"
                onClick={handleChatbotClick}
                title={isCollapsed ? 'EduPredict AI Assistant' : undefined}
                aria-label="EduPredict AI Assistant"
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  isChatbotOpen
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold border border-transparent hover:border-[#DDD6FE]/60'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium border border-transparent hover:border-[#8B5CF6]/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Bot
                      className={`w-4 h-4 ${
                        isChatbotOpen
                          ? isLight
                            ? 'text-[#6D28D9]'
                            : 'text-[#DDD6FE]'
                          : isLight
                          ? 'text-[#7C3AED]'
                          : 'text-[#A78BFA]'
                      }`}
                    />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  {!isCollapsed && (
                    <span className="truncate font-semibold">EduPredict AI Assistant</span>
                  )}
                </div>

                {!isCollapsed && (
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded shrink-0 border ml-1.5 ${
                      isChatbotOpen
                        ? isLight
                          ? 'bg-[#6D28D9] text-white border-[#5B21B6]'
                          : 'bg-[#8B5CF6] text-white border-[#7C3AED]'
                        : isLight
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]'
                        : 'bg-[#6D28D9]/30 text-[#DDD6FE] border-[#8B5CF6]/30'
                    }`}
                  >
                    AI
                  </span>
                )}
              </button>

              {/* 6. Export Data — Positioned directly below EduPredict AI Assistant */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('export');
                  onClose();
                }}
                title={isCollapsed ? 'Export Data' : undefined}
                aria-label="Export Data"
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  currentSection === 'export'
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                }`}
              >
                <FileDown
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'export'
                      ? isLight
                        ? 'text-[#6D28D9]'
                        : 'text-[#DDD6FE]'
                      : isLight
                      ? 'text-[#475569]'
                      : 'text-slate-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Export Data</span>}
              </button>
            </nav>
          </div>

          {/* SECONDARY & TOOLS */}
          <div>
            {!isCollapsed && (
              <p
                className={`px-3 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-[#334155]' : 'text-slate-200'
                }`}
              >
                Secondary &amp; Tools
              </p>
            )}

            <nav className="space-y-0.5">
              {/* 7. Account & Settings */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('settings');
                  onClose();
                }}
                title={isCollapsed ? 'Account & Settings' : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  currentSection === 'settings'
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                }`}
              >
                <Settings
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'settings'
                      ? isLight
                        ? 'text-[#6D28D9]'
                        : 'text-[#DDD6FE]'
                      : isLight
                      ? 'text-[#475569]'
                      : 'text-slate-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Account &amp; Settings</span>}
              </button>

              {/* 8. Public Portal */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('home');
                  onClose();
                }}
                title={isCollapsed ? 'Public Portal' : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs transition-all text-left cursor-pointer ${
                  currentSection === 'home'
                    ? isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                    : isLight
                    ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                    : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                }`}
              >
                <Home
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'home'
                      ? isLight
                        ? 'text-[#6D28D9]'
                        : 'text-[#DDD6FE]'
                      : isLight
                      ? 'text-[#475569]'
                      : 'text-slate-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Public Portal</span>}
              </button>
            </nav>
          </div>

        </div>

        {/* Theme Mode Option in Sidebar (accessible on mobile & desktop) */}
        {!isCollapsed ? (
          <div
            className={`px-3.5 py-2.5 border-t flex items-center justify-between text-xs transition-colors ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none group"
              title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
              aria-label={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isLight ? 'bg-[#F8FAFC] text-[#6D28D9] group-hover:bg-[#EDE9FE]' : 'bg-[#172033] text-amber-400 group-hover:bg-[#243248]'
                }`}
              >
                {isLight ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-[#DDD6FE]" />}
              </div>
              <span className={`text-xs font-bold transition-colors ${isLight ? 'text-[#172033] group-hover:text-[#6D28D9]' : 'text-[#F8FAFC] group-hover:text-[#DDD6FE]'}`}>
                {isLight ? 'Light Theme' : 'Dark Theme'}
              </span>
            </button>
            <ThemeToggle className="scale-90" />
          </div>
        ) : (
          <div className="py-2 flex justify-center border-t border-[#E2E8F0] dark:border-[#334155]">
            <ThemeToggle className="scale-85" />
          </div>
        )}

        {/* User Profile Footer */}
        <div
          className={`p-3 border-t ${
            isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#0F172A] border-[#334155]'
          }`}
        >
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 shrink-0 ring-[#6D28D9]/40"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                    isLight
                      ? 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]'
                      : 'bg-[#6D28D9]/25 text-[#DDD6FE] border-[#8B5CF6]/40'
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isLight ? 'text-[#172033]' : 'text-white'
                      }`}
                    >
                      {user.name}
                    </p>
                    <p
                      className={`text-[10px] font-medium truncate capitalize ${
                        isLight ? 'text-[#526078]' : 'text-slate-300'
                      }`}
                    >
                      {user.education_level || 'Student Account'}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      isLight
                        ? 'text-[#526078] hover:text-[#B91C1C] hover:bg-[#FEE2E2]'
                        : 'text-slate-300 hover:text-[#FCA5A5] hover:bg-[#172033]'
                    }`}
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onNavigate('login');
                  onClose();
                }}
                className="btn-primary w-full text-xs !py-2 justify-center gap-2"
                title="Sign In to Save"
              >
                <LogIn className="w-3.5 h-3.5 text-white" />
                {!isCollapsed && <span className="text-white font-bold">Sign In</span>}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
