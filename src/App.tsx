/**
 * EduPredict AI - AI-Based Student Performance Prediction System
 * Main Application Orchestrator
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
import { ThemeProvider } from './context/ThemeContext';
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
import {
  fetchStudents,
  fetchPredictions,
  fetchModelMetrics,
  fetchDashboardSummary
} from './services/api';

const ALL_SECTIONS: SectionId[] = [
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
  'about'
];

function AppContent() {
  // Navigation state: displays ONLY the selected section
  const [currentSection, setCurrentSection] = useState<SectionId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Initialize section from URL hash if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as SectionId;
      if (ALL_SECTIONS.includes(hash)) {
        setCurrentSection(hash);
      }
    };

    handleHashChange();
    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, []);

  const handleNavigate = (section: SectionId) => {
    setCurrentSection(section);
    window.location.hash = section;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Initial data hydration
  useEffect(() => {
    loadStudents();
    loadPredictions();
    loadMetrics();
    loadSummary();
  }, [loadStudents, loadPredictions, loadMetrics, loadSummary]);

  const handleSelectStudentForPrediction = (prefill: Partial<PredictionInput>) => {
    setPrefillData(prefill);
    handleNavigate('predict');
  };

  const handlePredictionSaved = () => {
    loadPredictions();
    loadSummary();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        studentCount={students.length > 0 ? 1248 + Math.max(0, students.length - 8) : 1248}
      />

      {/* Main View Area with Header and Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          currentSection={currentSection}
          onNavigate={handleNavigate}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          studentName="Dr. Elena Rostova"
        />

        {/* Viewport: Renders ONLY the active section */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-10">
            {/* 1. Dashboard Overview */}
            {currentSection === 'dashboard' && (
              <DashboardView
                onNavigate={handleNavigate}
                summary={dashboardSummary}
                isLoading={isLoadingSummary}
                studentName="Dr. Elena Rostova"
                students={students}
                predictions={predictions}
              />
            )}

            {/* 2. Predict Performance */}
            {currentSection === 'predict' && (
              <PredictView
                onNavigate={handleNavigate}
                prefillData={prefillData}
                onPredictionSaved={handlePredictionSaved}
              />
            )}

            {/* 3. What-If Scenario Analysis */}
            {currentSection === 'whatif' && (
              <WhatIfView
                students={students}
                onNavigateToGoals={() => handleNavigate('goals')}
              />
            )}

            {/* 4. Students Directory */}
            {currentSection === 'students' && (
              <StudentsView
                students={students}
                isLoading={isLoadingStudents}
                onRefresh={loadStudents}
                onSelectForPrediction={handleSelectStudentForPrediction}
              />
            )}

            {/* 5. Academic Progress */}
            {currentSection === 'progress' && (
              <ProgressView
                students={students}
                onNavigateToPredict={() => handleNavigate('predict')}
              />
            )}

            {/* 6. Subject Analysis */}
            {currentSection === 'subjects' && (
              <SubjectAnalysisView />
            )}

            {/* 7. Study Planner */}
            {currentSection === 'planner' && (
              <StudyPlannerView />
            )}

            {/* 8. Learning Roadmap */}
            {currentSection === 'roadmap' && (
              <RoadmapView />
            )}

            {/* 9. Course Recommendations */}
            {currentSection === 'courses' && (
              <CourseRecommendationsView />
            )}

            {/* 10. Examination Readiness */}
            {currentSection === 'readiness' && (
              <ExamReadinessView />
            )}

            {/* 11. AI Academic Counselor */}
            {currentSection === 'counselor' && (
              <CounselorView />
            )}

            {/* 12. Goals and Achievements */}
            {currentSection === 'goals' && (
              <GoalsAchievementsView />
            )}

            {/* 13. Prediction History */}
            {currentSection === 'history' && (
              <HistoryView
                predictions={predictions}
                isLoading={isLoadingPredictions}
                onRefresh={loadPredictions}
                onNavigateToPredict={() => handleNavigate('predict')}
              />
            )}

            {/* 14. Model Analytics */}
            {currentSection === 'analytics' && (
              <AnalyticsView
                metrics={modelMetrics}
                isLoading={isLoadingMetrics}
              />
            )}

            {/* 15. Reports */}
            {currentSection === 'reports' && (
              <ReportsView students={students} />
            )}

            {/* 16. Notifications */}
            {currentSection === 'notifications' && (
              <NotificationsView />
            )}

            {/* 17. Settings */}
            {currentSection === 'settings' && (
              <SettingsView />
            )}

            {/* 18. About the Project */}
            {currentSection === 'about' && (
              <AboutView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
