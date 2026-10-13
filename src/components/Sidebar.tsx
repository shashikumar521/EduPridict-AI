import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Sliders,
  Users,
  TrendingUp,
  BookOpen,
  Calendar,
  Compass,
  GraduationCap,
  ShieldCheck,
  Bot,
  Trophy,
  History,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  Globe,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';

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
  onClose,
  studentCount = 1248
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    onNavigate('home');
  };

  const navGroups: { group: string; items: NavItem[] }[] = [
    {
      group: 'Student Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard & Assessment', icon: LayoutDashboard },
        { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
        { id: 'planner', label: 'AI Exam & Study Planner', icon: Calendar },
        { id: 'courses', label: 'Course Directory', icon: GraduationCap }
      ]
    },
    {
      group: 'Academic Intelligence',
      items: [
        { id: 'subjects', label: 'Subject Analysis', icon: BookOpen },
        { id: 'roadmap', label: 'Learning Roadmap', icon: Compass },
        { id: 'readiness', label: 'Exam Readiness', icon: ShieldCheck }
      ]
    },
    {
      group: 'Records & Reports',
      items: [
        { id: 'history', label: 'Assessment History', icon: History },
        { id: 'analytics', label: 'Model Analytics', icon: BarChart3 },
        { id: 'reports', label: 'Academic Reports', icon: FileText }
      ]
    },
    {
      group: 'Portal & Settings',
      items: [
        { id: 'settings', label: 'Profile & Settings', icon: Settings },
        { id: 'about', label: 'About Project', icon: Info },
        { id: 'home', label: 'Public Home Page', icon: Home }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transform transition-all duration-200 ease-in-out md:static md:translate-x-0 shrink-0 h-full max-h-[100dvh] overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}
      >
        {/* App Logo & Branding */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-950 via-indigo-700 to-indigo-500 text-white flex items-center justify-center font-extrabold shadow-md shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-sm truncate">
                    EduPredict AI
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded shrink-0">
                    v2.4
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Applied AI Education
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
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
                <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
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
                      } rounded-xl text-xs transition-all text-left font-medium cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border-r-3 border-indigo-600 dark:border-indigo-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`ml-auto text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                                item.id === 'notifications'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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

        {/* Model Calibration Status Pill */}
        {!isCollapsed && (
          <div className="p-3 m-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-800">
                Random Forest v2.4
              </span>
              <span className="text-[9px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.2 rounded border border-emerald-200 ml-auto">
                92.6% Recall
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Calibrated for early academic triage & support.
            </p>
          </div>
        )}

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-100 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate capitalize">
                      {user.education_level || 'Authenticated Student'}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2' : 'justify-center gap-2 px-3 py-2'
                } rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer`}
                title="Sign In to Save"
              >
                <LogIn className="w-3.5 h-3.5" />
                {!isCollapsed && <span>Sign In</span>}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
