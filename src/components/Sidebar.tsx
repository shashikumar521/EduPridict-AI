import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Sliders,
  TrendingUp,
  BookOpen,
  Calendar,
  Compass,
  GraduationCap,
  ShieldCheck,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Target
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  currentSection: SectionId;
  onNavigate: (section: SectionId) => void;
  isOpen: boolean;
  onClose: () => void;
  studentCount?: number;
}

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpen,
  onClose
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleSignOut = async () => {
    await logout();
    onNavigate('home');
  };

  const navGroups: { group: string; items: NavItem[] }[] = [
    {
      group: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Core Workflows',
      items: [
        { id: 'analysis', label: 'Academic Analysis', icon: TrendingUp },
        { id: 'scheduler', label: 'Exam Scheduler', icon: Calendar },
        { id: 'learn', label: 'Learn & Practice', icon: BookOpen }
      ]
    },
    {
      group: 'Secondary & Tools',
      items: [
        { id: 'settings', label: 'Account & Settings', icon: Settings },
        { id: 'home', label: 'Public Portal', icon: Home }
      ]
    }
  ];

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
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shrink-0 bg-white dark:bg-[#172033] flex items-center justify-center border border-[#6D28D9]/30 dark:border-[#8B5CF6]/30 p-1">
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI Logo"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold tracking-tight text-sm truncate ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                    EduPredict AI
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 border ${
                      isLight
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]'
                        : 'bg-[#6D28D9]/25 text-[#DDD6FE] border-[#8B5CF6]/40'
                    }`}
                  >
                    AI
                  </span>
                </div>
                <p className={`text-[11px] font-medium truncate ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                  Academic Intelligence
                </p>
              </div>
            )}
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

        {/* Navigation Menu Items */}
        <div className="px-2.5 py-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4">
          {navGroups.map((group) => (
            <div key={group.group}>
              {!isCollapsed && (
                <p
                  className={`px-3 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                    isLight ? 'text-[#334155]' : 'text-slate-200'
                  }`}
                >
                  {group.group}
                </p>
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentSection === item.id ||
                    (item.id === 'analysis' &&
                      ['dashboard', 'predict', 'whatif', 'subjects', 'progress', 'students'].includes(currentSection)) ||
                    (item.id === 'scheduler' && ['planner', 'readiness'].includes(currentSection)) ||
                    (item.id === 'learn' && ['courses', 'counselor', 'roadmap'].includes(currentSection));
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
                      } rounded-xl text-xs transition-all text-left cursor-pointer ${
                        isActive
                          ? isLight
                            ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-xs'
                            : 'bg-[#6D28D9]/25 text-[#DDD6FE] font-bold border border-[#8B5CF6]/40 shadow-xs'
                          : isLight
                          ? 'text-[#334155] hover:bg-[#F5F3FF] hover:text-[#0F172A] font-semibold'
                          : 'text-slate-200 hover:bg-[#172033] hover:text-white font-medium'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? isLight
                              ? 'text-[#6D28D9]'
                              : 'text-[#DDD6FE]'
                            : isLight
                            ? 'text-[#475569]'
                            : 'text-slate-300'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Theme Mode Option in Sidebar (accessible on mobile & desktop) */}
        {!isCollapsed ? (
          <div
            className={`px-3.5 py-2.5 border-t flex items-center justify-between text-xs transition-colors ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#1E293B] border-[#334155]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-[#F8FAFC] text-[#6D28D9]' : 'bg-[#172033] text-amber-400'
                }`}
              >
                {isLight ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-[#DDD6FE]" />}
              </div>
              <span className={`text-xs font-bold ${isLight ? 'text-[#172033]' : 'text-[#F8FAFC]'}`}>
                {isLight ? 'Light Theme' : 'Dark Theme'}
              </span>
            </div>
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
