import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Quote,
  ShieldCheck,
  TrendingUp,
  User,
  Menu,
  X,
  Calendar,
  Sliders,
  Bot,
  Layers,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  onNavigateToDashboard: (section?: SectionId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateToDashboard }) => {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const quotations = [
    {
      quote: 'Education is the key to unlocking your potential.',
      author: 'Academic Empowerment'
    },
    {
      quote: 'Small improvements today create greater opportunities tomorrow.',
      author: 'Continuous Growth'
    },
    {
      quote: 'Every student has the potential to succeed with structured preparation.',
      author: 'Inclusive Excellence'
    }
  ];

  const features = [
    {
      icon: GraduationCap,
      color: 'bg-purple-100 text-purple-700',
      title: 'Student Performance & Risk Assessment',
      description: 'Streamlined 3-step evaluation collecting academic metrics, verified syllabus data, attendance, and study habits to predict risk levels accurately.',
      tag: 'Core ML Model',
      action: () => onNavigateToDashboard('dashboard')
    },
    {
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-700',
      title: 'AI Exam Scheduler & Study Planner',
      description: 'Smart day-wise revision timetable generated around your exam dates, confidence levels, weightage, realistic daily hours, and buffer days.',
      tag: 'New Feature',
      action: () => onNavigateToDashboard('planner')
    },
    {
      icon: Sliders,
      color: 'bg-blue-100 text-blue-700',
      title: 'What-If Academic Simulator',
      description: 'Interactive sliders simulate how shifting attendance, weekly study hours, or internal assignment marks will alter your expected final grade.',
      tag: 'Simulation Engine',
      action: () => onNavigateToDashboard('whatif')
    },
    {
      icon: Bot,
      color: 'bg-emerald-100 text-emerald-700',
      title: '24/7 AI Academic Counselor',
      description: 'Personalized mentoring powered by Google Gemini to analyze learning blockers, recommend study techniques, and resolve subject doubts.',
      tag: 'AI Powered',
      action: () => onNavigateToDashboard('counselor')
    },
    {
      icon: Layers,
      color: 'bg-amber-100 text-amber-700',
      title: 'Subject Diagnostics & Curricula',
      description: 'Detailed breakdowns for core subjects across Engineering, Science, and Management with priority scoring and recommended study hours.',
      tag: 'Curriculum Tracking',
      action: () => onNavigateToDashboard('subjects')
    },
    {
      icon: Compass,
      color: 'bg-rose-100 text-rose-700',
      title: 'Personalized Learning Roadmap',
      description: 'Targeted milestone sequences structured week-by-week to elevate weak topics into academic strengths before semester examinations.',
      tag: 'Milestone Guides',
      action: () => onNavigateToDashboard('roadmap')
    }
  ];

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      {/* 1. Clean Purple-and-White Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => onNavigateToDashboard('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-800 via-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold shadow-sm group-hover:shadow transition shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-purple-700 transition block truncate">
                EduPredict AI
              </span>
              <span className="text-[10px] text-purple-600 font-semibold hidden sm:block">
                Academic Intelligence Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigateToDashboard('about')}
              className="text-xs font-semibold text-slate-600 hover:text-purple-700 transition cursor-pointer"
            >
              About
            </button>

            <button
              onClick={scrollToFeatures}
              className="text-xs font-semibold text-slate-600 hover:text-purple-700 transition cursor-pointer"
            >
              Features
            </button>

            <button
              onClick={() => onNavigateToDashboard('planner')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Exam Planner</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => onNavigateToDashboard('dashboard')}
                className="inline-flex items-center gap-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Open Dashboard ({user?.name || 'Student'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigateToDashboard('login')}
                className="inline-flex items-center gap-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition cursor-pointer active:scale-95"
              >
                <span>Get Started / Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-purple-50 border border-slate-200 transition"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-purple-100 bg-white px-4 py-4 space-y-2.5 shadow-lg animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateToDashboard('about');
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-purple-50 flex items-center justify-between"
            >
              <span>About EduPredict AI</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToFeatures();
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-purple-50 flex items-center justify-between"
            >
              <span>Platform Features</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateToDashboard('planner');
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> AI Exam Scheduler & Planner
              </span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateToDashboard('dashboard');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-700 text-white flex items-center justify-center gap-2 shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Go to Dashboard ({user?.name || 'Student'})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateToDashboard('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-700 text-white flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Get Started / Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          {/* Subtle Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-6 sm:mb-8 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI-Powered Student Performance & Academic Guidance</span>
          </div>

          {/* Hero Heading as requested */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5 sm:mb-6">
            Understand Your Performance.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600">
              Plan Your Success.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-medium px-2">
            Analyze your academic performance, spot hidden risk areas early, and generate intelligent exam revision timetables with personalized AI study schedules.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigateToDashboard('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 min-h-[48px]"
              >
                <span>Open Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigateToDashboard('login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 min-h-[48px]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onNavigateToDashboard('planner')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-2xl bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-900 font-bold text-sm border border-purple-200 shadow-xs transition cursor-pointer min-h-[48px]"
            >
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Generate Exam Schedule</span>
            </button>

            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-sm transition cursor-pointer min-h-[48px]"
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* Quick Credibility Trust Badges */}
          <div className="mt-10 pt-8 border-t border-purple-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
              <p className="text-xl font-black text-purple-700">100%</p>
              <p className="text-[11px] font-semibold text-slate-500">Student Centered</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
              <p className="text-xl font-black text-indigo-700">Multi-Course</p>
              <p className="text-[11px] font-semibold text-slate-500">Verified Curricula</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
              <p className="text-xl font-black text-purple-700">Day-Wise</p>
              <p className="text-[11px] font-semibold text-slate-500">Intelligent Timetable</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
              <p className="text-xl font-black text-emerald-700">Gemini AI</p>
              <p className="text-[11px] font-semibold text-slate-500">Active Recall Coach</p>
            </div>
          </div>
        </section>

        {/* 3. Features Section */}
        <section id="features-section" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full bg-white rounded-3xl border border-purple-100/80 shadow-xs my-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
              Intelligent Tools Built for Student Success
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Every tool is designed to provide actionable academic clarity, optimize study time, and remove examination anxiety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color} shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={item.action}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition cursor-pointer pt-3 border-t border-slate-200/60"
                  >
                    <span>Explore Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Inspiring Quotations Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Inspiration & Purpose</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Guiding Principles for Every Learner</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {quotations.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                    <Quote className="w-4 h-4" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                    "{item.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-purple-700 tracking-wide uppercase">
                    {item.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 5. Simple, Compact Footer */}
      <footer className="mt-auto border-t border-purple-100 bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <GraduationCap className="w-4 h-4 text-purple-700 shrink-0" />
            <span className="font-semibold text-slate-800">EduPredict AI</span>
            <span>—</span>
            <span>Academic Performance Analysis & AI Exam Planning Platform</span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <button
              onClick={() => onNavigateToDashboard('about')}
              className="hover:text-purple-700 transition cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => onNavigateToDashboard('planner')}
              className="hover:text-purple-700 transition cursor-pointer"
            >
              Study Planner
            </button>
            <button
              onClick={() => onNavigateToDashboard('login')}
              className="hover:text-purple-700 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigateToDashboard('home')}
              className="hover:text-purple-700 transition cursor-pointer"
            >
              Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
