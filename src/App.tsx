/**
 * EduPredict AI - AI-Based Student Performance Prediction System
 * Main Application Orchestrator with Google Identity Services & Protected Dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SectionId,
  StudentRecord,
  SavedPrediction,
  ModelMetrics,
  DashboardSummary,
  PredictionInput
} from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PredictView } from './components/PredictView';
import { WhatIfView } from './components/WhatIfView';
import { StudentsView } from './components/StudentsView';
import { ProgressView } from './components/ProgressView';
import { SubjectAnalysisView } from './components/SubjectAnalysisView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { RoadmapView } from './components/RoadmapView';
import { CourseRecommendationsView } from './components/CourseRecommendationsView';
import { CounselorView } from './components/CounselorView';
import { ExamReadinessView } from './components/ExamReadinessView';
import { GoalsAchievementsView } from './components/GoalsAchievementsView';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { HomeView } from './components/HomeView';
import { LoginView } from './components/LoginView';
import { AuthModal } from './components/AuthModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { AcademicAnalysisView } from './components/AcademicAnalysisView';
import { ExamSchedulerView } from './components/ExamSchedulerView';
import { LearnPracticeView } from './components/LearnPracticeView';
import { EduPredictChatbot } from './components/EduPredictChatbot';
import {
  fetchStudents,
  fetchPredictions,
  fetchModelMetrics,
  fetchDashboardSummary
} from './services/api';

const ALL_SECTIONS: SectionId[] = [
  'home',
  'login',
  'analysis',
  'scheduler',
  'learn',
  'dashboard',
  'predict',
  'whatif',
  'students',
  'progress',
  'subjects',
  'planner',
  'roadmap',
  'courses',
  'readiness',
  'counselor',
  'goals',
  'history',
  'analytics',
  'reports',
  'notifications',
  'settings',
];


// Sections open to public visitors without authentication
const PUBLIC_SECTIONS: SectionId[] = ['home', 'about', 'login'];

function AppContent() {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    isAuthModalOpen,
    closeAuthModal
  } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Navigation state: displays ONLY the selected section
  const [currentSection, setCurrentSection] = useState<SectionId>(() => {
    const rawHash = window.location.hash.replace('#', '');
    if (rawHash.includes('access_token=') || rawHash.includes('id_token=')) {
      return 'home';
    }
    const hash = rawHash as SectionId;
    if (ALL_SECTIONS.includes(hash)) {
      return hash;
    }
    return 'home';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [pendingRedirectSection, setPendingRedirectSection] = useState<SectionId | null>(null);

  // Data states
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);

  // Loading states
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Predictor prefill state (e.g. when advisor clicks "Load into Predictor" on a student)
  const [prefillData, setPrefillData] = useState<Partial<PredictionInput> | null>(null);

  // Workflow bridge states
  const [selectedLearnTopic, setSelectedLearnTopic] = useState<string>('Binary Trees');
  const [selectedLearnCourse, setSelectedLearnCourse] = useState<string>('Computer Science & Engineering');
  const [selectedScheduleSubject, setSelectedScheduleSubject] = useState<string>('');
  const [selectedScheduleTopic, setSelectedScheduleTopic] = useState<string>('');
  const [schedulerInitialTab, setSchedulerInitialTab] = useState<'roadmap' | 'exams' | 'availability' | 'timer'>('roadmap');
  const [schedulerAutoOpenAdd, setSchedulerAutoOpenAdd] = useState<boolean>(false);
  const [learnInitialSubTab, setLearnInitialSubTab] = useState<'theory' | 'quiz'>('theory');

  // Navigation handler with protection checks
  const handleNavigate = useCallback(
    (targetSection: SectionId) => {
      // If destination is protected and user is not authenticated:
      if (!PUBLIC_SECTIONS.includes(targetSection) && !isAuthenticated) {
        setPendingRedirectSection(targetSection);
        setCurrentSection('login');
        window.location.hash = 'login';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setCurrentSection(targetSection);
      window.location.hash = targetSection;

      if (targetSection === 'home' || targetSection === 'login') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll dashboard internal content container to top
        const dashboardScrollArea = document.getElementById('dashboard-main-content');
        if (dashboardScrollArea) {
          dashboardScrollArea.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    [isAuthenticated]
  );

  // Initialize and listen to hash change from browser URL
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '');
      if (rawHash.includes('access_token=') || rawHash.includes('id_token=')) {
        return;
      }
      const hash = rawHash as SectionId;
      if (!ALL_SECTIONS.includes(hash)) {
        return;
      }

      // Check protection on hash change
      if (!PUBLIC_SECTIONS.includes(hash) && !isAuthenticated && !isAuthLoading) {
        setPendingRedirectSection(hash);
        setCurrentSection('login');
        window.location.hash = 'login';
        return;
      }

      setCurrentSection(hash);
    };

    handleHashChange();
    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, [isAuthenticated, isAuthLoading]);

  // Protect current section once authentication hydration completes
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated && !PUBLIC_SECTIONS.includes(currentSection)) {
        setPendingRedirectSection(currentSection);
        setCurrentSection('login');
        window.location.hash = 'login';
      }
    }
  }, [isAuthLoading, isAuthenticated, currentSection]);

  // Load students from API
  const loadStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  // Load predictions from API
  const loadPredictions = useCallback(async () => {
    setIsLoadingPredictions(true);
    try {
      const data = await fetchPredictions();
      setPredictions(data);
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setIsLoadingPredictions(false);
    }
  }, []);

  // Load metrics
  const loadMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    try {
      const data = await fetchModelMetrics();
      setModelMetrics(data);
    } catch (err) {
      console.error('Failed to load model metrics:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  // Load dashboard summary
  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const data = await fetchDashboardSummary();
      setDashboardSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  // Initial & auth-change data hydration
  useEffect(() => {
    loadStudents();
    loadPredictions();
    loadMetrics();
    loadSummary();
  }, [loadStudents, loadPredictions, loadMetrics, loadSummary, isAuthenticated]);

  const handleSelectStudentForPrediction = (prefill: Partial<PredictionInput>) => {
    setPrefillData(prefill);
    handleNavigate('predict');
  };

  const handlePredictionSaved = () => {
    loadPredictions();
    loadSummary();
  };

  // Login completion handler
  const handleLoginSuccess = (isNewUser: boolean) => {
    loadStudents();
    loadPredictions();
    loadSummary();

    if (isNewUser) {
      setShowProfileSetup(true);
    } else {
      const dest = pendingRedirectSection || 'dashboard';
      setPendingRedirectSection(null);
      handleNavigate(dest);
    }
  };

  // First-time profile setup completion
  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    const dest = pendingRedirectSection || 'dashboard';
    setPendingRedirectSection(null);
    handleNavigate(dest);
  };

  // 0. Initial Session Hydration Screen with Official Logo
  if (isAuthLoading) {
    return (
      <div
        className={`h-[100dvh] w-full flex flex-col items-center justify-center transition-colors ${
          isLight ? 'bg-[#F7F8FC] text-[#172033]' : 'bg-[#0F172A] text-slate-100'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-[#1E293B] flex items-center justify-center border-2 border-[#6D28D9]/40 dark:border-[#8B5CF6]/40 animate-pulse p-2">
            <img
              src="/edupredict-ai-logo.png"
              alt="EduPredict AI"
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="mt-5 text-center space-y-1">
          <p className={`text-base font-black tracking-tight ${isLight ? 'text-[#172033]' : 'text-white'}`}>
            EduPredict AI
          </p>
          <p className="text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE] uppercase tracking-widest animate-pulse">
            Academic Intelligence Platform
          </p>
        </div>
      </div>
    );
  }

  // 1. PUBLIC LOGIN & REGISTER PAGE
  if (currentSection === 'login') {
    return (
      <>
        <LoginView
          onNavigate={handleNavigate}
          onSuccess={handleLoginSuccess}
        />
        {showProfileSetup && (
          <ProfileSetupModal
            isOpen={showProfileSetup}
            onClose={() => setShowProfileSetup(false)}
            onComplete={handleProfileSetupComplete}
          />
        )}
        <EduPredictChatbot
          currentSection={currentSection}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  // 2. PUBLIC HOME PAGE: Natural document scrolling without dashboard shell or sidebar
  if (currentSection === 'home') {
    return (
      <>
        <HomeView
          onNavigateToDashboard={(targetSection = 'dashboard') => handleNavigate(targetSection)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onSuccess={handleLoginSuccess}
        />
        {showProfileSetup && (
          <ProfileSetupModal
            isOpen={showProfileSetup}
            onClose={() => setShowProfileSetup(false)}
            onComplete={handleProfileSetupComplete}
          />
        )}
        <EduPredictChatbot
          currentSection={currentSection}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  // 3. AUTHENTICATED DASHBOARD & PROTECTED WORKSPACES
  // 100dvh viewport shell with stationary sidebar and independent main content scrolling
  const studentDisplayName = user?.name || predictions[0]?.student_name || 'Student';

  return (
    <div
      className={`h-[100dvh] max-h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden antialiased transition-colors ${
        isLight ? 'bg-[#F7F8FC] text-[#172033]' : 'bg-[#0F172A] text-slate-100'
      }`}
    >
      {/* Sidebar Navigation - Fixed & stationary on desktop */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        studentCount={students.length}
      />

      {/* Main View Area with Header and Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header - Stationary & sticky at top of main application area */}
        <Header
          currentSection={currentSection}
          onNavigate={handleNavigate}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          studentName={studentDisplayName}
          onOpenProfileSetup={() => setShowProfileSetup(true)}
        />

        {/* Viewport: Renders ONLY the active section; ONLY this container scrolls vertically */}
        <main
          id="dashboard-main-content"
          className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-4 md:p-6 w-full"
        >
          <div className="site-container pb-10">
            {/* DASHBOARD: Executive Student Overview & Priority Action Hub */}
            {currentSection === 'dashboard' && (
              <DashboardView
                onNavigate={handleNavigate}
                onOpenProfileSetup={() => setShowProfileSetup(true)}
                onSelectTopicForLearn={(t, c) => {
                  setSelectedLearnTopic(t);
                  if (c) setSelectedLearnCourse(c);
                  setLearnInitialSubTab('theory');
                  handleNavigate('learn');
                }}
                onSelectExamForSchedule={(s, t) => {
                  setSelectedScheduleSubject(s);
                  setSelectedScheduleTopic(t || '');
                  setSchedulerInitialTab('exams');
                  setSchedulerAutoOpenAdd(true);
                  handleNavigate('scheduler');
                }}
                onOpenAddExam={() => {
                  setSelectedScheduleSubject('');
                  setSelectedScheduleTopic('');
                  setSchedulerInitialTab('exams');
                  setSchedulerAutoOpenAdd(true);
                  handleNavigate('scheduler');
                }}
                onOpenPracticeQuiz={(topic?: string) => {
                  if (topic) setSelectedLearnTopic(topic);
                  setLearnInitialSubTab('quiz');
                  handleNavigate('learn');
                }}
                onOpenStudyRoadmap={() => {
                  setSchedulerInitialTab('roadmap');
                  setSchedulerAutoOpenAdd(false);
                  handleNavigate('scheduler');
                }}
                summary={dashboardSummary}
                isLoading={isLoadingSummary}
                studentName={studentDisplayName}
                students={students}
                predictions={predictions}
              />
            )}

            {/* CORE WORKFLOW 1: Academic Analysis & Performance Trajectory */}
            {(currentSection === 'analysis' ||
              currentSection === 'predict' ||
              currentSection === 'whatif' ||
              currentSection === 'subjects' ||
              currentSection === 'progress' ||
              currentSection === 'students') && (
              <AcademicAnalysisView
                onNavigate={handleNavigate}
                onSelectTopicForLearn={(t, c) => {
                  setSelectedLearnTopic(t);
                  if (c) setSelectedLearnCourse(c);
                  setLearnInitialSubTab('theory');
                  handleNavigate('learn');
                }}
                onSelectExamForSchedule={(s, t) => {
                  setSelectedScheduleSubject(s);
                  setSelectedScheduleTopic(t || '');
                  setSchedulerInitialTab('exams');
                  setSchedulerAutoOpenAdd(true);
                  handleNavigate('scheduler');
                }}
              />
            )}

            {/* CORE WORKFLOW 2: Exam Scheduler & Intelligent Study Planner */}
            {(currentSection === 'scheduler' ||
              currentSection === 'planner' ||
              currentSection === 'readiness' ||
              currentSection === 'roadmap') && (
              <ExamSchedulerView
                onNavigate={handleNavigate}
                prefillSubject={selectedScheduleSubject}
                prefillTopic={selectedScheduleTopic}
                initialTab={currentSection === 'roadmap' ? 'roadmap' : schedulerInitialTab}
                autoOpenAddModal={schedulerAutoOpenAdd}
              />
            )}

            {/* CORE WORKFLOW 3: Learn & Practice Studio (Theory & Diagnostic Quizzes) */}
            {(currentSection === 'learn' ||
              currentSection === 'counselor') && (
              <LearnPracticeView
                onNavigate={handleNavigate}
                initialTopic={selectedLearnTopic}
                initialCourseContext={selectedLearnCourse}
                initialSubTab={learnInitialSubTab}
              />
            )}

            {/* RECOMMENDED COURSES & CURRICULUM DISCOVERY */}
            {currentSection === 'courses' && (
              <CourseRecommendationsView onNavigate={handleNavigate} />
            )}

            {/* Secondary Workflows & Utility Screens */}
            {currentSection === 'goals' && <GoalsAchievementsView />}

            {currentSection === 'history' && (
              <HistoryView
                predictions={predictions}
                isLoading={isLoadingPredictions}
                onRefresh={loadPredictions}
                onNavigateToPredict={() => handleNavigate('predict')}
              />
            )}

            {currentSection === 'analytics' && (
              <AnalyticsView
                metrics={modelMetrics}
                isLoading={isLoadingMetrics}
              />
            )}

            {currentSection === 'reports' && (
              <ReportsView students={students} predictions={predictions} />
            )}

            {currentSection === 'notifications' && <NotificationsView />}

            {currentSection === 'settings' && (
              <SettingsView onOpenProfileSetup={() => setShowProfileSetup(true)} />
            )}

            {currentSection === 'about' && <AboutView />}
          </div>
        </main>
      </div>

      {/* Global AI Academic Assistant Chatbot */}
      <EduPredictChatbot
        currentSection={currentSection}
        onNavigate={handleNavigate}
      />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={handleLoginSuccess}
      />

      {showProfileSetup && (
        <ProfileSetupModal
          isOpen={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          onComplete={handleProfileSetupComplete}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
