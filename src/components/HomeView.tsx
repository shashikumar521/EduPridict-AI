import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ArrowRight,
  User,
  Menu,
  X,
  TrendingUp,
  Brain,
  Calendar,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  BarChart3,
  CheckCircle2,
  Zap,
  Play,
  Shield,
  Layers
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { Footer } from './Footer';

interface HomeViewProps {
  onNavigateToDashboard: (section?: SectionId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateToDashboard }) => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile navigation menu overlay is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key to dismiss mobile navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 6 Academic Intelligence Feature Tools (Screenshot 2 reference)
  const featureTools = [
    {
      id: 'prediction',
      title: 'Student Performance & Risk Assessment',
      category: 'PREDICTION',
      description:
        'Predict semester GPAs, final grade bands, and at-risk trajectories using multi-factor machine learning models.',
      icon: TrendingUp,
      actionSection: 'predict' as SectionId,
      linkText: 'Explore Tool'
    },
    {
      id: 'diagnostics',
      title: 'Learning Gap Diagnostics',
      category: 'DIAGNOSTICS',
      description:
        'Pinpoint syllabus gaps, weak concept mastery, and suboptimal study habits before they impact exam scores.',
      icon: Brain,
      actionSection: 'whatif' as SectionId,
      linkText: 'Explore Tool'
    },
    {
      id: 'planning',
      title: 'AI-Powered Exam Planner',
      category: 'PLANNING',
      description:
        'Generate dynamic study timetables, spaced-repetition schedules, and milestone targets tailored to your exam calendar.',
      icon: Calendar,
      actionSection: 'planner' as SectionId,
      linkText: 'Explore Tool'
    },
    {
      id: 'recommendations',
      title: 'Actionable Study Recommendations',
      category: 'RECOMMENDATIONS',
      description:
        'Receive prioritized revision techniques, resource recommendations, and daily velocity targets for maximum score gain.',
      icon: Sparkles,
      actionSection: 'readiness' as SectionId,
      linkText: 'Explore Tool'
    },
    {
      id: 'intelligence',
      title: 'What-If Scenario Simulation',
      category: 'INTELLIGENCE',
      description:
        'Simulate how changes in attendance, study hours, and assignment scores directly influence your predicted final GPA.',
      icon: Sliders,
      actionSection: 'whatif' as SectionId,
      linkText: 'Explore Tool'
    },
    {
      id: 'insights',
      title: 'Comprehensive Analytics & Reports',
      category: 'INSIGHTS',
      description:
        'Track performance trajectories over time with institutional-grade score distributions and historical progress charts.',
      icon: BarChart3,
      actionSection: 'analytics' as SectionId,
      linkText: 'Explore Tool'
    }
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased overflow-x-hidden transition-colors ${
        isLight
          ? 'bg-[#F7F9FC] text-[#11182E] selection:bg-[#8000E8]/20 selection:text-[#8000E8]'
          : 'bg-[#090a0f] text-zinc-100 selection:bg-[#8000E8]/30 selection:text-purple-200'
      }`}
    >
      {/* 1. Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          isLight
            ? 'bg-white/95 border-[#E1E6EF] text-[#172033]'
            : 'bg-[#131926]/95 border-[#1E2B42] text-[#F7F8FC]'
        }`}
      >
        <div className="site-container h-16 sm:h-[72px] flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Group on the Left */}
          <div
            onClick={() => onNavigateToDashboard('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none text-left min-w-0 shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-sm transition shrink-0 bg-[#0B132B] flex items-center justify-center border border-[#7000E8]/30 group-hover:scale-105">
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center text-left leading-tight min-w-0">
              <span
                className={`text-base sm:text-lg font-bold tracking-tight transition truncate ${
                  isLight
                    ? 'text-[#172033] group-hover:text-[#7000E8]'
                    : 'text-white group-hover:text-[#C4B5FD]'
                }`}
              >
                EduPredict AI
              </span>
              <span
                className={`text-[10px] font-medium tracking-normal truncate ${
                  isLight ? 'text-[#526078]' : 'text-slate-300'
                }`}
              >
                Academic Intelligence Platform
              </span>
            </div>
          </div>

          {/* Primary Navigation Links in the Center (Desktop) */}
          <nav
            className={`hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium ${
              isLight ? 'text-[#526078]' : 'text-slate-300'
            }`}
          >
            <button
              onClick={() => scrollToSection('features')}
              className={`transition-colors cursor-pointer py-1.5 ${
                isLight ? 'hover:text-[#7000E8]' : 'hover:text-white'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`transition-colors cursor-pointer py-1.5 ${
                isLight ? 'hover:text-[#7000E8]' : 'hover:text-white'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className={`transition-colors cursor-pointer py-1.5 ${
                isLight ? 'hover:text-[#7000E8]' : 'hover:text-white'
              }`}
            >
              Platform Demo
            </button>
            <button
              onClick={() => onNavigateToDashboard('planner')}
              className={`transition-colors cursor-pointer py-1.5 ${
                isLight ? 'hover:text-[#7000E8]' : 'hover:text-white'
              }`}
            >
              AI Exam Planner
            </button>
            <button
              onClick={() => onNavigateToDashboard('about')}
              className={`transition-colors cursor-pointer py-1.5 ${
                isLight ? 'hover:text-[#7000E8]' : 'hover:text-white'
              }`}
            >
              About
            </button>
          </nav>

          {/* Action CTAs & Theme Toggle on the Right (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Sun / Moon Theme Toggle */}
            <ThemeToggle />

            {/* Dashboard Button */}
            <button
              onClick={() => onNavigateToDashboard('dashboard')}
              className="btn-primary text-sm px-5 py-2.5 rounded-full"
            >
              <span className="text-white">Dashboard</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Mobile Navigation Controls (< lg screens) */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {/* Navbar Theme Toggle */}
            <ThemeToggle className="min-h-[40px] min-w-[40px]" />

            {/* Mobile Hamburger / Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border transition shrink-0 cursor-pointer ${
                isLight
                  ? 'text-[#526581] hover:text-[#11182E] bg-[#F0F3F8] hover:bg-white border-[#E9E5F2]'
                  : 'text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
              }`}
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className={`w-5 h-5 ${isLight ? 'text-[#8000E8]' : 'text-purple-400'}`} />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 top-16 sm:top-[72px] bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          className={`fixed inset-x-0 top-16 sm:top-[72px] max-h-[calc(100vh-4rem)] overflow-y-auto border-b shadow-2xl z-50 lg:hidden transition-all duration-300 animate-in slide-in-from-top-3 ${
            isLight
              ? 'bg-white border-[#E9E5F2] text-[#11182E]'
              : 'bg-[#10121a] border-zinc-800 text-zinc-100'
          }`}
        >
          <div className="site-container py-5 flex flex-col gap-4">
            {/* Nav Links Stack */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => scrollToSection('features')}
                className={`w-full text-left py-2.5 px-3 rounded-xl font-medium text-sm flex items-center justify-between transition cursor-pointer ${
                  isLight
                    ? 'hover:bg-[#F0F3F8] text-[#11182E] hover:text-[#8000E8]'
                    : 'hover:bg-zinc-800/80 text-zinc-200 hover:text-white'
                }`}
              >
                <span>Features</span>
                <ArrowRight className="w-4 h-4 text-[#475569] dark:text-slate-300" />
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`w-full text-left py-2.5 px-3 rounded-xl font-medium text-sm flex items-center justify-between transition cursor-pointer ${
                  isLight
                    ? 'hover:bg-[#F0F3F8] text-[#11182E] hover:text-[#8000E8]'
                    : 'hover:bg-zinc-800/80 text-zinc-200 hover:text-white'
                }`}
              >
                <span>How It Works</span>
                <ArrowRight className="w-4 h-4 text-[#475569] dark:text-slate-300" />
              </button>

              <button
                onClick={() => scrollToSection('demo')}
                className={`w-full text-left py-2.5 px-3 rounded-xl font-medium text-sm flex items-center justify-between transition cursor-pointer ${
                  isLight
                    ? 'hover:bg-[#F0F3F8] text-[#11182E] hover:text-[#8000E8]'
                    : 'hover:bg-zinc-800/80 text-zinc-200 hover:text-white'
                }`}
              >
                <span>Platform Demo</span>
                <ArrowRight className="w-4 h-4 text-[#475569] dark:text-slate-300" />
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateToDashboard('planner');
                }}
                className={`w-full text-left py-2.5 px-3 rounded-xl font-medium text-sm flex items-center justify-between transition cursor-pointer ${
                  isLight
                    ? 'hover:bg-[#F0F3F8] text-[#11182E] hover:text-[#8000E8]'
                    : 'hover:bg-zinc-800/80 text-zinc-200 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${isLight ? 'text-[#8000E8]' : 'text-purple-400'}`} />
                  <span>AI Exam Planner</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#475569] dark:text-slate-300" />
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateToDashboard('about');
                }}
                className={`w-full text-left py-2.5 px-3 rounded-xl font-medium text-sm flex items-center justify-between transition cursor-pointer ${
                  isLight
                    ? 'hover:bg-[#F0F3F8] text-[#11182E] hover:text-[#8000E8]'
                    : 'hover:bg-zinc-800/80 text-zinc-200 hover:text-white'
                }`}
              >
                <span>About</span>
                <ArrowRight className="w-4 h-4 text-[#475569] dark:text-slate-300" />
              </button>
            </div>

            {/* Dedicated Theme Toggle Card */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                isLight
                  ? 'bg-[#F0F3F8] border-[#E9E5F2]'
                  : 'bg-zinc-900/90 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    isLight
                      ? 'bg-white text-[#8000E8] shadow-xs border border-[#E9E5F2]'
                      : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  }`}
                >
                  {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#8000E8]" />}
                </div>
                <div>
                  <p className={`text-xs font-bold ${isLight ? 'text-[#11182E]' : 'text-white'}`}>
                    Appearance
                  </p>
                  <p className={`text-[11px] font-medium ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
                    {isLight ? 'Light Theme Active' : 'Dark Theme Active'}
                  </p>
                </div>
              </div>
              <ThemeToggle className="shadow-xs" />
            </div>

            {/* Action Buttons Container */}
            <div className={`pt-2 border-t flex flex-col gap-2.5 ${isLight ? 'border-[#E9E5F2]' : 'border-zinc-800'}`}>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateToDashboard('dashboard');
                }}
                className={`w-full py-3 px-4 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer ${
                  isLight
                    ? 'bg-[#8000E8] hover:bg-[#6a00c2] shadow-[#8000E8]/25'
                    : 'bg-[#8000E8] hover:bg-[#9226ff] shadow-[#8000E8]/30'
                }`}
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateToDashboard('login');
                  }}
                  className={`w-full py-2.5 px-4 rounded-full text-sm font-semibold transition cursor-pointer border text-center ${
                    isLight
                      ? 'border-[#E9E5F2] text-[#11182E] bg-white hover:bg-[#F0F3F8]'
                      : 'border-zinc-800 text-zinc-200 bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* 2. Hero Section */}
        <section
          className={`pt-12 pb-14 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 relative overflow-hidden transition-colors ${
            isLight ? 'bg-[#F7F8FC]' : 'bg-[#0C101A]'
          }`}
        >
          {/* Subtle Ambient Glow */}
          <div
            className={`absolute top-0 right-1/4 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none ${
              isLight ? 'bg-[#7000E8]/5' : 'bg-[#7000E8]/10'
            }`}
          />
          <div
            className={`absolute -bottom-20 left-10 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none ${
              isLight ? 'bg-[#5B00C4]/5' : 'bg-[#5B00C4]/10'
            }`}
          />

          <div className="site-container relative z-10">
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
              {/* Category Lead-in */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-6 shadow-xs ${
                  isLight
                    ? 'bg-white border-[#E1E6EF] text-[#526078]'
                    : 'bg-[#182236] border-[#1E2B42] text-slate-300'
                }`}
              >
                <span className="uppercase tracking-wider text-[11px] font-bold text-[#7000E8] dark:text-[#C4B5FD]">
                  AI-Powered Student Performance
                </span>
              </div>

              {/* Main Heading */}
              <h1
                className={`text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.15] sm:leading-[1.16] mb-5 max-w-2xl sm:max-w-3xl text-balance ${
                  isLight ? 'text-[#172033]' : 'text-[#F7F8FC]'
                }`}
              >
                Understand Your Performance.{' '}
                <span
                  className="text-transparent bg-clip-text inline-block bg-gradient-to-r from-[#7000E8] via-[#5B00C4] to-[#7000E8]"
                >
                  Plan Your Success.
                </span>
              </h1>

              {/* Supporting Description */}
              <p
                className={`text-base sm:text-lg lg:text-xl max-w-xl sm:max-w-2xl leading-relaxed mb-8 sm:mb-9 font-normal text-balance ${
                  isLight ? 'text-[#526078]' : 'text-slate-300'
                }`}
              >
                Predict your academic performance, discover learning gaps, and build a personalized study plan.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={() => onNavigateToDashboard('dashboard')}
                  className="btn-primary h-12 px-7 text-base rounded-full shadow-md"
                >
                  <span className="text-white">Get Started</span>
                  <ArrowRight className="w-4 h-4 text-white shrink-0" />
                </button>

                <button
                  onClick={() => onNavigateToDashboard('planner')}
                  className="btn-secondary h-12 px-6 text-base rounded-full"
                >
                  <Calendar className="w-4 h-4 text-[#7000E8] dark:text-[#C4B5FD]" />
                  <span>Create Study Plan</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Feature Section */}
        <section
          id="features"
          className={`py-16 sm:py-20 lg:py-24 border-t transition-colors ${
            isLight
              ? 'bg-[#F7F8FC] border-[#E1E6EF]'
              : 'bg-[#0C101A] border-[#1E2B42]'
          }`}
        >
          <div className="site-container">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-3.5 shadow-xs ${
                  isLight
                    ? 'bg-white border-[#E9E5F2] text-[#8000E8]'
                    : 'bg-zinc-900/90 border-zinc-800 text-purple-300'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#8000E8]"
                />
                <span className="uppercase tracking-wider text-[11px] font-bold">
                  POWERFUL CAPABILITIES
                </span>
              </div>

              <h2
                className={`text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-tight mb-4 ${
                  isLight ? 'text-[#11182E]' : 'text-white'
                }`}
              >
                Comprehensive Academic Intelligence Tools
              </h2>

              <p
                className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
                  isLight ? 'text-[#526581]' : 'text-zinc-400'
                }`}
              >
                EduPredict AI provides machine learning tools, real-time risk classification, and intelligent planning to help students achieve top grades.
              </p>
            </div>

            {/* 6-Card Grid: 3 columns x 2 rows on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 max-w-7xl mx-auto">
              {featureTools.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.id}
                    onClick={() => onNavigateToDashboard(feature.actionSection)}
                    className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group cursor-pointer text-left ${
                      isLight
                        ? 'bg-white border-[#E9E5F2] shadow-xs hover:shadow-xl hover:border-[#8000E8]/40 hover:-translate-y-1'
                        : 'bg-[#121522] border-zinc-800/80 hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon Container on Left & Category Badge on Right */}
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                            isLight
                              ? 'bg-[#F0F3F8] text-[#8000E8] border border-[#E9E5F2] group-hover:bg-[#8000E8] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#8000E8]/20'
                              : 'bg-zinc-800 text-purple-300 border border-zinc-700 group-hover:bg-[#8000E8] group-hover:text-white'
                          }`}
                        >
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        <span
                          className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border transition-colors ${
                            isLight
                              ? 'bg-[#F0F3F8] text-[#8000E8] border-[#E9E5F2] group-hover:border-[#8000E8]/30'
                              : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 group-hover:text-purple-300'
                          }`}
                        >
                          {feature.category}
                        </span>
                      </div>

                      {/* Card Title */}
                      <h3
                        className={`text-lg sm:text-xl font-bold tracking-tight mb-2.5 transition-colors ${
                          isLight
                            ? 'text-[#11182E] group-hover:text-[#8000E8]'
                            : 'text-white group-hover:text-purple-300'
                        }`}
                      >
                        {feature.title}
                      </h3>

                      {/* Supporting Description */}
                      <p
                        className={`text-sm leading-relaxed mb-6 ${
                          isLight ? 'text-[#475569]' : 'text-slate-300'
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>

                    {/* Thin Divider & Action Link at Bottom */}
                    <div
                      className={`pt-4 border-t flex items-center justify-between transition-colors ${
                        isLight ? 'border-[#CBD5E1]' : 'border-zinc-800'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-colors ${
                          isLight
                            ? 'text-[#6D28D9] group-hover:text-[#4C1D95]'
                            : 'text-[#DDD6FE] group-hover:text-white'
                        }`}
                      >
                        <span>{feature.linkText}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>

                      <span
                        className={`text-[11px] font-semibold transition-colors ${
                          isLight ? 'text-[#475569]' : 'text-slate-300'
                        }`}
                      >
                        Instant Access
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. How It Works Section */}
        <section
          id="how-it-works"
          className={`py-16 sm:py-20 border-t transition-colors ${
            isLight
              ? 'bg-white border-[#E9E5F2]'
              : 'bg-[#090a0f] border-zinc-800/80'
          }`}
        >
          <div className="site-container">
            <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-3.5 shadow-xs ${
                  isLight
                    ? 'bg-[#F0F3F8] border-[#E9E5F2] text-[#8000E8]'
                    : 'bg-zinc-900/90 border-zinc-800 text-purple-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#8000E8] dark:text-purple-400" />
                <span className="uppercase tracking-wider text-[11px] font-bold">
                  SIMPLE WORKFLOW
                </span>
              </div>

              <h2
                className={`text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-4 ${
                  isLight ? 'text-[#11182E]' : 'text-white'
                }`}
              >
                How EduPredict AI Works
              </h2>

              <p
                className={`text-base sm:text-lg max-w-xl mx-auto leading-relaxed ${
                  isLight ? 'text-[#526581]' : 'text-zinc-400'
                }`}
              >
                Three simple steps turn your past assessments and study habits into guaranteed academic advancement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <div
                className={`p-6 sm:p-7 rounded-2xl border transition text-left flex flex-col justify-between ${
                  isLight
                    ? 'bg-[#F7F9FC] border-[#E9E5F2] hover:border-[#8000E8]/40 shadow-xs'
                    : 'bg-[#121522] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                        isLight
                          ? 'bg-white text-[#8000E8] border-[#E9E5F2]'
                          : 'bg-zinc-800 text-purple-300 border-zinc-700'
                      }`}
                    >
                      STEP 01
                    </span>
                    <Layers className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h3
                    className={`text-lg font-bold tracking-tight mb-2 ${
                      isLight ? 'text-[#11182E]' : 'text-white'
                    }`}
                  >
                    Input Student Records
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isLight ? 'text-[#526581]' : 'text-zinc-400'
                    }`}
                  >
                    Enter your historical marks, current attendance, weekly study velocity, and syllabus completion.
                  </p>
                </div>
                <div
                  className={`mt-6 pt-4 border-t flex items-center gap-2 text-xs font-medium ${
                    isLight ? 'border-[#E9E5F2] text-[#526581]' : 'border-zinc-800 text-zinc-400'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-[#8000E8]' : 'text-purple-400'}`} />
                  <span>Supports all streams & grades</span>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`p-6 sm:p-7 rounded-2xl border transition text-left flex flex-col justify-between ${
                  isLight
                    ? 'bg-[#F7F9FC] border-[#E9E5F2] hover:border-[#8000E8]/40 shadow-xs'
                    : 'bg-[#121522] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                        isLight
                          ? 'bg-white text-[#8000E8] border-[#E9E5F2]'
                          : 'bg-zinc-800 text-purple-300 border-zinc-700'
                      }`}
                    >
                      STEP 02
                    </span>
                    <Brain className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h3
                    className={`text-lg font-bold tracking-tight mb-2 ${
                      isLight ? 'text-[#11182E]' : 'text-white'
                    }`}
                  >
                    Run Multi-Factor Inference
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isLight ? 'text-[#526581]' : 'text-zinc-400'
                    }`}
                  >
                    Our supervised Random Forest model calculates projected GPA, score bounds, and flags hidden concept vulnerabilities.
                  </p>
                </div>
                <div
                  className={`mt-6 pt-4 border-t flex items-center gap-2 text-xs font-medium ${
                    isLight ? 'border-[#E9E5F2] text-[#526581]' : 'border-zinc-800 text-zinc-400'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-[#8000E8]' : 'text-purple-400'}`} />
                  <span>Sub-second instant analysis</span>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`p-6 sm:p-7 rounded-2xl border transition text-left flex flex-col justify-between ${
                  isLight
                    ? 'bg-[#F7F9FC] border-[#E9E5F2] hover:border-[#8000E8]/40 shadow-xs'
                    : 'bg-[#121522] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                        isLight
                          ? 'bg-white text-[#8000E8] border-[#E9E5F2]'
                          : 'bg-zinc-800 text-purple-300 border-zinc-700'
                      }`}
                    >
                      STEP 03
                    </span>
                    <Calendar className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h3
                    className={`text-lg font-bold tracking-tight mb-2 ${
                      isLight ? 'text-[#11182E]' : 'text-white'
                    }`}
                  >
                    Execute Your Study Plan
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isLight ? 'text-[#526581]' : 'text-zinc-400'
                    }`}
                  >
                    Follow targeted revision milestones, daily study velocity, and spaced-repetition schedules designed for distinction.
                  </p>
                </div>
                <div
                  className={`mt-6 pt-4 border-t flex items-center gap-2 text-xs font-medium ${
                    isLight ? 'border-[#E9E5F2] text-[#526581]' : 'border-zinc-800 text-zinc-400'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-[#8000E8]' : 'text-purple-400'}`} />
                  <span>Personalized to exam deadlines</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Platform Demo Section */}
        <section
          id="demo"
          className={`py-16 sm:py-20 border-t transition-colors ${
            isLight
              ? 'bg-[#F7F8FC] border-[#E1E6EF]'
              : 'bg-[#0C101A] border-[#1E2B42]'
          }`}
        >
          <div className="site-container">
            <div
              className={`max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 border relative overflow-hidden text-center transition-all ${
                isLight
                  ? 'bg-white border-[#E1E6EF] shadow-sm'
                  : 'bg-[#131926] border-[#1E2B42] shadow-xl'
              }`}
            >
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-4 shadow-xs ${
                  isLight
                    ? 'bg-[#EEE7FF] border-[#D1B8FC] text-[#7000E8]'
                    : 'bg-[rgba(112,0,232,0.18)] border-[rgba(142,48,255,0.35)] text-[#C4B5FD]'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="uppercase tracking-wider text-[11px] font-bold">
                  Platform Demo
                </span>
              </div>

              <h2
                className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 ${
                  isLight ? 'text-[#172033]' : 'text-white'
                }`}
              >
                Ready to Experience EduPredict AI?
              </h2>

              <p
                className={`text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed ${
                  isLight ? 'text-[#526078]' : 'text-slate-300'
                }`}
              >
                Launch our interactive platform to explore real-time risk assessment, simulate what-if scenarios, and build a custom exam roadmap.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onNavigateToDashboard('dashboard')}
                  className="btn-primary h-12 px-7 text-sm rounded-full gap-2 shadow-md"
                >
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span className="text-white">Launch Platform Demo</span>
                </button>

                <button
                  onClick={() => onNavigateToDashboard('whatif')}
                  className="btn-secondary h-12 px-6 text-sm rounded-full gap-2"
                >
                  <Sliders className="w-4 h-4 text-[#7000E8] dark:text-[#C4B5FD]" />
                  <span>Try What-If Simulator</span>
                </button>
              </div>

              {/* Model Badges */}
              <div className="mt-10 pt-6 border-t border-[#E1E6EF] dark:border-[#1E2B42] flex flex-wrap items-center justify-center gap-6 text-xs text-[#526078] dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#7000E8] dark:text-[#C4B5FD]" />
                  <span>Supervised Ensemble Model</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#087A55] dark:text-[#6EE7B7]" />
                  <span>30+ Multi-Factor Metrics</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#7000E8] dark:text-[#C4B5FD]" />
                  <span>Real-Time Inference</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Complete Footer */}
      <Footer onNavigate={onNavigateToDashboard} />
    </div>
  );
};
