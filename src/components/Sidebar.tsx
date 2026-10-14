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
  badge?: string;
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
      group: 'Core Platform',
      items: [
        { id: 'dashboard', label: 'Dashboard & Overview', icon: LayoutDashboard },
        { id: 'predict', label: 'Predict Performance', icon: Sparkles },
        { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
        { id: 'planner', label: 'AI Exam Planner', icon: Calendar }
      ]
    },
    {
      group: 'Academic Intelligence',
      items: [
        { id: 'progress', label: 'Academic Progress', icon: TrendingUp },
        { id: 'subjects', label: 'Subject Diagnostics', icon: BookOpen },
        { id: 'roadmap', label: 'Skill Gap Roadmap', icon: Compass },
        { id: 'counselor', label: 'AI Academic Coach', icon: Bot },
        { id: 'readiness', label: 'Exam Readiness', icon: ShieldCheck },
        { id: 'courses', label: 'Verified Curricula', icon: GraduationCap }
      ]
    },
    {
      group: 'Student Goals',
      items: [
        { id: 'goals', label: 'Goals & Achievements', icon: Target },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    },
    {
      group: 'Quick Navigation',
      items: [
        { id: 'home', label: 'Public Website', icon: Home }
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
            ? 'bg-white border-r border-slate-200 text-slate-900 shadow-xs'
            : 'bg-[#111827] border-r border-slate-800 text-slate-100 shadow-xs'
        }`}
      >
        {/* App Logo & Branding */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-extrabold shadow-md shrink-0 ${
                isLight
                  ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 shadow-purple-500/20'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/30'
              }`}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold tracking-tight text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    EduPredict AI
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 border ${
                      isLight
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-purple-950/70 text-purple-300 border-purple-800'
                    }`}
                  >
                    AI
                  </span>
                </div>
                <p className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
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
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
                  className={`px-3 text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {group.group}
                </p>
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
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
                            ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300 shadow-xs'
                            : 'bg-purple-950/70 text-purple-200 font-bold border border-purple-700/80 shadow-xs'
                          : isLight
                          ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? isLight
                              ? 'text-purple-700'
                              : 'text-purple-300'
                            : isLight
                            ? 'text-slate-600'
                            : 'text-slate-300'
                        }`}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`ml-auto text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
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
              isLight ? 'bg-white border-slate-200' : 'bg-[#161F33] border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-slate-100 text-purple-700' : 'bg-slate-800 text-amber-400'
                }`}
              >
                {isLight ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
              </div>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {isLight ? 'Light Theme' : 'Dark Theme'}
              </span>
            </div>
            <ThemeToggle className="scale-90" />
          </div>
        ) : (
          <div className="py-2 flex justify-center border-t border-slate-800">
            <ThemeToggle className="scale-85" />
          </div>
        )}

        {/* User Profile Footer */}
        <div
          className={`p-3 border-t ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F19] border-slate-800'
          }`}
        >
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 shrink-0 ring-purple-600/40"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                    isLight
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-purple-950/70 text-purple-300 border-purple-800'
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
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {user.name}
                    </p>
                    <p
                      className={`text-[10px] font-medium truncate capitalize ${
                        isLight ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {user.education_level || 'Student Account'}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      isLight
                        ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                        : 'text-slate-300 hover:text-rose-400 hover:bg-slate-800'
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
