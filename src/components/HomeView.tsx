import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Menu,
  X,
  TrendingUp,
  Brain,
  Calendar,
  Sparkles,
  Sliders,
  CheckCircle2,
  Zap,
  Layers,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { Footer } from './Footer';
import { motion } from 'motion/react';
import { EduPredictLogoAnimation } from './EduPredictLogoAnimation';
import { FloatingLogoBackground } from './FloatingLogoBackground';
import { EASINGS, cardVariants, containerVariants } from '../utils/motionPresets';

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

  const handleGetStarted = () => {
    if (isAuthenticated) {
      onNavigateToDashboard('dashboard');
    } else {
      onNavigateToDashboard('login');
    }
  };

  const handleCreateStudyPlan = () => {
    if (isAuthenticated) {
      onNavigateToDashboard('scheduler');
    } else {
      onNavigateToDashboard('login');
    }
  };

  // 6 Verified Core Academic Intelligence Features
  const featureTools = [
    {
      id: 'prediction',
      title: 'Performance & Risk Assessment',
      category: 'PREDICTION',
      description:
        'Predict semester marks, letter grades, and academic risk using supervised machine learning trained on authentic student cohorts.',
      icon: TrendingUp,
      actionSection: 'predict' as SectionId,
      linkText: 'Open Predictor'
    },
    {
      id: 'diagnostics',
      title: 'Learning Gap & What-If Simulator',
      category: 'DIAGNOSTICS',
      description:
        'Simulate how study hours, attendance percentages, and test scores directly shift your projected academic trajectory.',
      icon: Sliders,
      actionSection: 'whatif' as SectionId,
      linkText: 'Simulate Outcomes'
    },
    {
      id: 'scheduler',
      title: 'Intelligent Exam Scheduler',
      category: 'PLANNING',
      description:
        'Generate balanced, non-overlapping day-by-day revision timetables with automatic buffer days before examination dates.',
      icon: Calendar,
      actionSection: 'scheduler' as SectionId,
      linkText: 'Build Schedule'
    },
    {
      id: 'learn',
      title: 'Learn & Practice Studio',
      category: 'MASTERY',
      description:
        'Master core engineering and science topics with comprehensive academic theory and timed 30-question diagnostic quizzes.',
      icon: BookOpen,
      actionSection: 'learn' as SectionId,
      linkText: 'Start Practice'
    },
    {
      id: 'counselor',
      title: 'AI Academic Coach',
      category: 'COACHING',
      description:
        'Receive personalized guidance, active-recall prompts, and exam pitfall alerts grounded strictly in your enrolled subjects.',
      icon: Brain,
      actionSection: 'counselor' as SectionId,
      linkText: 'Ask AI Coach'
    },
    {
      id: 'courses',
      title: 'Curated Course Recommendations',
      category: 'CURRICULUM',
      description:
        'Discover verified courses from NPTEL, SWAYAM, Coursera, and MIT OCW targeted directly to address identified concept vulnerabilities.',
      icon: GraduationCap,
      actionSection: 'courses' as SectionId,
      linkText: 'Explore Courses'
    }
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased overflow-x-hidden transition-colors relative ${
        isLight
          ? 'bg-[#F8FAFC] text-[#0F172A] selection:bg-[#7C3AED]/20 selection:text-[#6D28D9]'
          : 'bg-[#0B0F19] text-slate-100 selection:bg-[#7C3AED]/30 selection:text-purple-200'
      }`}
    >
      {/* Signature Floating Logo Background Animation */}
      <FloatingLogoBackground />

      {/* 1. Header & Navigation */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200/80 text-[#0F172A] shadow-xs'
            : 'bg-[#111A2E]/95 border-[#1E2B45] text-slate-100 shadow-xs'
        }`}
      >
        <div className="site-container h-16 sm:h-[72px] flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Group on the Left */}
          <div
            onClick={() => onNavigateToDashboard('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none text-left min-w-0 shrink-0"
          >
            <EduPredictLogoAnimation variant="sidebar" showWordmark={false} />
            <div className="flex flex-col justify-center text-left leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-[#0F172A] dark:text-white">
                  EduPredict <span className="text-[#7C3AED] dark:text-[#A78BFA]">AI</span>
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                Academic Intelligence Platform
              </span>
            </div>
          </div>

          {/* Primary Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors cursor-pointer py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors cursor-pointer py-1"
            >
              Key Features
            </button>
            <button
              onClick={() => onNavigateToDashboard('about')}
              className="hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors cursor-pointer py-1"
            >
              About Platform
            </button>
          </nav>

          {/* Action CTAs & Theme Toggle (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <ThemeToggle />

            {isAuthenticated ? (
              <button
                onClick={() => onNavigateToDashboard('dashboard')}
                className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Student Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onNavigateToDashboard('login')}
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#7C3AED] dark:hover:text-white hover:border-[#7C3AED] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4.5 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <ThemeToggle className="min-h-[38px] min-w-[38px]" />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#7C3AED]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          className={`fixed inset-x-0 top-16 sm:top-[72px] border-b shadow-2xl z-50 lg:hidden transition-all duration-200 ${
            isLight
              ? 'bg-white border-slate-200 text-[#0F172A]'
              : 'bg-[#111A2E] border-slate-800 text-white'
          }`}
        >
          <div className="site-container py-5 flex flex-col gap-3">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Key Features
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateToDashboard('about');
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              About Platform
            </button>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleGetStarted();
                }}
                className="w-full py-2.5 px-4 rounded-full text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateToDashboard('login');
                  }}
                  className="w-full py-2.5 px-4 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 text-center"
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
        
        {/* ========================================================================= */}
        {/* 2. HERO SECTION — Matches reference style, centered typography & lavender glow */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center justify-center py-16 sm:py-20 lg:py-24 transition-colors">
          
          {/* Subtle lavender/purple radial glow with gentle ambient breathing */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0.25, scale: 0.95 }}
            animate={{ opacity: [0.25, 0.4, 0.25], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[400px] rounded-full pointer-events-none blur-[110px] bg-purple-300/30 dark:bg-purple-900/25"
          />

          <div className="site-container relative z-10 w-full">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
              
              {/* Signature EduPredict AI Logo Introduction */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASINGS.smooth }}
                className="mb-5 flex justify-center"
              >
                <EduPredictLogoAnimation variant="hero" />
              </motion.div>

              {/* Stage 0: Introductory badge */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: EASINGS.smooth }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200/90 dark:border-purple-800/60 bg-white dark:bg-[#162035] shadow-xs mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA] animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#7C3AED] dark:text-[#A78BFA] uppercase">
                  AI-POWERED STUDENT PERFORMANCE
                </span>
              </motion.div>

              {/* Stage 1 & 2: Coordinated Two-Stage Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-extrabold tracking-tight leading-[1.12] sm:leading-[1.12] max-w-4xl mx-auto mb-4 text-balance">
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12, ease: EASINGS.smooth }}
                  className="block text-[#0F172A] dark:text-white"
                >
                  Understand Your Performance.
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.24, ease: EASINGS.smooth }}
                  className="block text-[#7C3AED] dark:text-[#A78BFA] mt-1 sm:mt-2"
                >
                  Plan Your Success.
                </motion.span>
              </h1>

              {/* Stage 3: Supporting Description */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.36, ease: EASINGS.smooth }}
                className="text-base sm:text-lg lg:text-[21px] text-[#475569] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mt-4 mb-9 font-normal text-balance"
              >
                Predict your academic performance, discover learning gaps, and build a personalized study plan.
              </motion.p>

              {/* Stage 4: Two Call-to-Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.48, ease: EASINGS.smooth }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
              >
                {/* Primary Button */}
                <motion.button
                  type="button"
                  onClick={handleGetStarted}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASINGS.smooth }}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-md shadow-purple-600/20 hover:shadow-purple-600/35 transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Secondary Button */}
                <motion.button
                  type="button"
                  onClick={handleCreateStudyPlan}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASINGS.smooth }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base text-[#0F172A] dark:text-white bg-white dark:bg-[#162035] border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-[#7C3AED] dark:text-[#A78BFA]" />
                  <span>Create Study Plan</span>
                </motion.button>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Thin light-neutral divider below hero */}
        <div className="w-full border-b border-slate-200/80 dark:border-slate-800/80" />

        {/* ========================================================================= */}
        {/* 3. HOW IT WORKS — Simple, transparent 3-step academic workflow */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#0D1322] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="site-container">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: EASINGS.smooth }}
              className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-950/40 text-[#7C3AED] dark:text-[#A78BFA] text-xs font-bold uppercase tracking-wider mb-3.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Simple Academic Workflow</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white mb-3">
                How EduPredict AI Works
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Transform historical coursework, test scores, and study habits into early diagnosis and confident exam preparation.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
            >
              
              {/* Step 1 */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.18, ease: EASINGS.smooth } }}
                className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#111A2E] text-left flex flex-col justify-between shadow-xs hover:border-purple-300 dark:hover:border-purple-700/60 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md bg-white dark:bg-[#1E2B45] text-[#7C3AED] dark:text-[#DDD6FE] border border-purple-200 dark:border-purple-800/50">
                      STEP 01
                    </span>
                    <Layers className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white mb-2">
                    1. Input Academic Details
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Provide your degree, enrolled subjects, past midterm or assignment marks, and current attendance rates.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Supports School, B.Tech &amp; Higher Ed</span>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.18, ease: EASINGS.smooth } }}
                className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#111A2E] text-left flex flex-col justify-between shadow-xs hover:border-purple-300 dark:hover:border-purple-700/60 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md bg-white dark:bg-[#1E2B45] text-[#7C3AED] dark:text-[#DDD6FE] border border-purple-200 dark:border-purple-800/50">
                      STEP 02
                    </span>
                    <Brain className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white mb-2">
                    2. Analyze Performance &amp; Gaps
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Supervised ML models evaluate risk categories, projected score bands, and flag vulnerable chapters before exam day.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Sub-second diagnostic evaluation</span>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.18, ease: EASINGS.smooth } }}
                className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#111A2E] text-left flex flex-col justify-between shadow-xs hover:border-purple-300 dark:hover:border-purple-700/60 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md bg-white dark:bg-[#1E2B45] text-[#7C3AED] dark:text-[#DDD6FE] border border-purple-200 dark:border-purple-800/50">
                      STEP 03
                    </span>
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white mb-2">
                    3. Follow Your Improvement Plan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Follow personalized revision schedules, practice timed 30-question diagnostic quizzes, and complete target milestones.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Aligned to your real exam deadlines</span>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. KEY FEATURES — 6 Functional Core Pillars */}
        {/* ========================================================================= */}
        <section id="features" className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFC] dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="site-container">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: EASINGS.smooth }}
              className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-[#162035] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-bold uppercase tracking-wider mb-3.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Academic Capabilities</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white mb-3">
                Key Platform Features
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Purpose-built tools designed to give students transparent academic visibility and disciplined preparation.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 max-w-7xl mx-auto"
            >
              {featureTools.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={feature.id}
                    variants={cardVariants}
                    whileHover={{ y: -4, transition: { duration: 0.18, ease: EASINGS.smooth } }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onNavigateToDashboard(feature.actionSection)}
                    className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111A2E] flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-lg transition-all duration-200 group cursor-pointer text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {feature.category}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white mb-2 group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors">
                        {feature.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                        {feature.description}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                      <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                        {feature.linkText}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">Available</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

      </main>

      {/* Redesigned Compact Four-Column Footer */}
      <Footer onNavigate={onNavigateToDashboard} />
    </div>
  );
};
