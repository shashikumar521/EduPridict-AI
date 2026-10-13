import React from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Target,
  BarChart3,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sliders,
  Award,
  Users,
  Compass,
  FileText,
  Lock,
  Sun,
  Moon,
  ChevronRight,
  HelpCircle,
  User
} from 'lucide-react';
import { SectionId } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  onNavigateToDashboard: (section?: SectionId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateToDashboard }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: 'Real ML Prediction Engine',
      section: 'predict' as SectionId,
      description: 'Supervised Random Forest and Decision Tree models predict academic performance tiers with 92.6% recall.'
    },
    {
      icon: Sliders,
      title: 'What-If Counterfactual Simulator',
      section: 'whatif' as SectionId,
      description: 'Interactive sliders simulate how improving attendance or study hours directly affects projected grades.'
    },
    {
      icon: TrendingUp,
      title: 'Longitudinal Academic Tracking',
      section: 'progress' as SectionId,
      description: 'Record test marks, monitor attendance patterns, and observe performance trajectory over multiple terms.'
    },
    {
      icon: Calendar,
      title: 'Personalized Study Planner',
      section: 'planner' as SectionId,
      description: 'Daily study schedules, exam countdowns, priority task management, and an integrated Pomodoro timer.'
    },
    {
      icon: BookOpen,
      title: 'Subject-Wise Diagnostics',
      section: 'subjects' as SectionId,
      description: 'Identify critical subject vulnerabilities, attendance deficits, and specific conceptual improvement areas.'
    },
    {
      icon: GraduationCap,
      title: 'Verified Course Recommendations',
      section: 'courses' as SectionId,
      description: 'Curated accredited courses from NPTEL, SWAYAM, Cisco Networking Academy, Coursera, and Khan Academy.'
    },
    {
      icon: Bot,
      title: 'AI Academic Counselor',
      section: 'counselor' as SectionId,
      description: 'Level-specific mentorship console addressing exam stress, study habits, backlog recovery, and revision methods.'
    },
    {
      icon: ShieldCheck,
      title: 'Examination Readiness Index',
      section: 'readiness' as SectionId,
      description: 'Evaluate syllabus coverage, practice test scores, and revision cycles before important examinations.'
    },
    {
      icon: FileText,
      title: 'Downloadable Institutional Dossiers',
      section: 'reports' as SectionId,
      description: 'Generate comprehensive academic evaluation reports formatted for faculty mentors and department heads.'
    }
  ];

  const educationLevels = [
    {
      title: 'Primary & Middle School',
      subtitle: 'Classes 1 to 8',
      desc: 'Focuses on foundational math and language habits, homework consistency, attendance, and quarterly test marks.'
    },
    {
      title: 'Secondary & High School',
      subtitle: 'Classes 9 & 10 (Board Prep)',
      desc: 'Tracks board exam readiness, core subject performance, periodic tests, and study routine establishment.'
    },
    {
      title: 'Higher Secondary (11th & 12th)',
      subtitle: 'Science, Commerce & Humanities',
      desc: 'Monitors academic streams (PCM, PCB, Commerce, Arts) alongside competitive entrance exam preparation.'
    },
    {
      title: 'Polytechnic Diploma',
      subtitle: 'Engineering & Technology',
      desc: 'Measures semester coursework, practical laboratory skills, internal assessments, and technical foundations.'
    },
    {
      title: 'Undergraduate (B.Tech / B.E.)',
      subtitle: 'Collegiate Engineering',
      desc: 'Evaluates semester CGPA, technical branch modules, lab vivas, programming practice, and continuous internals.'
    },
    {
      title: 'Postgraduate & Research',
      subtitle: 'M.Tech, MBA, M.Sc., MCA',
      desc: 'Assesses advanced coursework, seminar presentations, thesis milestones, and research publication progress.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* ================================================================= */}
      {/* 1. PUBLIC WEBSITE HEADER (Normal Document Flow, Sticky at top)     */}
      {/* ================================================================= */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-950 via-indigo-700 to-indigo-500 text-white flex items-center justify-center font-extrabold shadow-md shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                EduPredict AI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.5 rounded">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              IBM SkillsBuild Machine Learning Project
            </p>
          </div>
        </div>

        {/* Desktop Public Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Features
          </a>
          <a href="#levels" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Education Tiers
          </a>
          <a href="#methodology" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            ML Methodology
          </a>
          <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            FAQ
          </a>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Authentication & Dashboard Action */}
          {isAuthenticated && user ? (
            <button
              onClick={() => onNavigateToDashboard('dashboard')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow transition cursor-pointer active:scale-95"
            >
              {user.picture ? (
                <img src={user.picture} alt="" className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span>My Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigateToDashboard('login')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onNavigateToDashboard('dashboard')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow transition cursor-pointer active:scale-95"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. HERO SECTION                                                   */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/20 dark:via-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Internship Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            <span>IBM SkillsBuild Applied AI & Machine Learning Internship</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Predict Academic Performance.
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
              Intervene Before It’s Too Late.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, supervised machine-learning platform providing early academic triage, personalized study plans, and verified educational pathways across schools, polytechnics, undergraduate, and postgraduate programs.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigateToDashboard('dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Launch Student Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateToDashboard('predict')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Try Performance Predictor</span>
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => onNavigateToDashboard('login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>Student Sign In</span>
              </button>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 block">
                92.6%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                At-Risk Recall Rate
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">
                Calibrated to prevent struggling students from falling through the cracks.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 block">
                1,248+
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                Benchmarked Records
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">
                10-fold cross-validated on multi-semester engineering cohorts.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 block">
                6 Tiers
              </span>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 block mt-0.5">
                Education Levels
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">
                From primary and secondary school to B.Tech, M.Tech, and MBA.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 block">
                100%
              </span>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 block mt-0.5">
                Ethical & Private
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">
                Zero demographic bias. No external tracking. Local SQLite privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. PLATFORM FEATURES                                              */}
      {/* ================================================================= */}
      <section id="features" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
            End-to-End Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Comprehensive Educational Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Every feature is designed to give students actionable clarity and help educators deliver timely guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => onNavigateToDashboard(feat.section)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition cursor-pointer"
                  >
                    <span>Open in Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. SUPPORTED EDUCATION TIERS                                       */}
      {/* ================================================================= */}
      <section id="levels" className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Universal Academic Adaptation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
              Tailored for Every Academic Level
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              The platform dynamically presents only the metrics that make sense for your specific stage of education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {educationLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {lvl.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {lvl.subtitle}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lvl.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. MACHINE LEARNING METHODOLOGY & PIPELINE                        */}
      {/* ================================================================= */}
      <section id="methodology" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
            Supervised Learning Foundations
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Multi-Model Evaluation & Explainability
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Rigorous validation on held-out test splits with local feature attribution to explain every prediction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Production Model
              </span>
              <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Primary Choice
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Random Forest v2.4 (Ensemble)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ensemble of 100 decorrelated decision trees using bootstrap aggregation. Captures non-linear relationships between attendance shortages and previous exam baselines.
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Accuracy</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">89.4%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">At-Risk Recall</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">92.6%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Alternative Model
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Rule-Based
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Decision Tree Classifier (CART)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              White-box decision tree with explicit splitting rules on attendance (&lt; 75%) and previous exam marks. Highly transparent for mentor explanations.
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Accuracy</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">84.2%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">At-Risk Recall</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">86.8%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Baseline Model
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Linear Probabilities
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Logistic Regression
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              L2 regularized logistic regression delivering smooth calibrated sigmoid probabilities. Serves as statistical benchmark across all evaluation splits.
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Accuracy</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">81.6%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">At-Risk Recall</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">83.1%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. RESPONSIBLE AI & ETHICAL GOVERNANCE                             */}
      {/* ================================================================= */}
      <section className="py-12 bg-indigo-50/50 dark:bg-indigo-950/20 border-y border-indigo-100 dark:border-indigo-900/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-xs space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Ethical AI & Student Privacy Commitment
            </h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            EduPredict AI is developed under the <strong>IBM SkillsBuild Applied AI</strong> framework with strict adherence to ethical machine learning guidelines. All predictions represent statistical associations and are provided as <strong>decision-support tools for academic mentors</strong>, not definitive grade determinations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">Zero Demographic Bias</span>
              <p className="text-slate-500 dark:text-slate-400">Gender, race, ethnicity, and financial status are strictly excluded from prediction tensors.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">FERPA Compliant Storage</span>
              <p className="text-slate-500 dark:text-slate-400">Records remain inside secure local SQLite instances without commercial ad trackers.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">Human-in-the-Loop</span>
              <p className="text-slate-500 dark:text-slate-400">Predictions can never be used for automated punitive or disciplinary actions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS                                     */}
      {/* ================================================================= */}
      <section id="faq" className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              How does EduPredict AI differ from a simple grade calculator?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Standard grade calculators compute simple weighted averages of past assignments. EduPredict AI evaluates continuous multi-variable interactions (attendance thresholds, weekly independent study volume, coursework performance) using supervised Random Forest classifiers trained on multi-semester student cohorts to identify subtle risk indicators weeks before examinations occur.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Are recommended courses real and accessible?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Yes. Every course in our catalogue is an authentic, accredited offering from genuine educational providers including NPTEL (IITs), SWAYAM, Cisco Networking Academy, Coursera, and Khan Academy, with active direct links and free audit options.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Can a student try scenarios without saving permanent records?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Yes. The What-If Simulator and Fast Predictor allow students to explore hypothetical study hours, attendance improvements, and grade outcomes without saving changes to their academic record until they explicitly choose to do so.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 8. CALL TO ACTION BANNER                                          */}
      {/* ================================================================= */}
      <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to explore your academic trajectory?
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Log in to the dashboard to inspect student records, simulate study hours, review subject diagnostics, and download performance dossiers.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onNavigateToDashboard('dashboard')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <span>Open Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 9. PUBLIC FOOTER                                                  */}
      {/* ================================================================= */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-10 px-4 sm:px-8 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-sm">
                EduPredict AI
              </span>
              <span className="text-[11px] text-slate-500">
                IBM SkillsBuild Machine Learning & Applied AI Internship
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button
              onClick={() => onNavigateToDashboard('dashboard')}
              className="hover:text-white transition cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigateToDashboard('predict')}
              className="hover:text-white transition cursor-pointer"
            >
              Predictor
            </button>
            <button
              onClick={() => onNavigateToDashboard('courses')}
              className="hover:text-white transition cursor-pointer"
            >
              Course Catalogue
            </button>
            <button
              onClick={() => onNavigateToDashboard('reports')}
              className="hover:text-white transition cursor-pointer"
            >
              Reports
            </button>
            <button
              onClick={() => onNavigateToDashboard('about')}
              className="hover:text-white transition cursor-pointer"
            >
              Project Specifications
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} EduPredict AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
