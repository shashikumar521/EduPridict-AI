import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { SectionId, DashboardSummary, StudentRecord, SavedPrediction } from '../types';
import { useAuth } from '../context/AuthContext';
import { StudentAssessmentWorkflow } from './StudentAssessmentWorkflow';

interface DashboardViewProps {
  onNavigate: (section: SectionId) => void;
  summary: DashboardSummary | null;
  isLoading: boolean;
  studentName?: string;
  students?: StudentRecord[];
  predictions?: SavedPrediction[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  summary,
  isLoading,
  studentName,
  students = [],
  predictions = []
}) => {
  const { user } = useAuth();

  // Find latest saved prediction for this user or first available real prediction
  const latestPrediction = summary?.recentPredictions?.[0] || predictions[0] || null;

  // Real display name
  const displayName = user?.name || latestPrediction?.student_name || studentName || 'Student';

  return (
    <div className="space-y-6">
      {/* Clean, Focused Student Header - No clutter or fabricated metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Student Academic Dashboard
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Evaluate your academic standing, verify institutional attendance compliance, and predict performance using our trained machine learning models.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-800">{user?.email || 'Student Portal'}</span>
          </div>
        </div>
      </div>

      {/* PRIMARY DASHBOARD CONTENT:
          1. Student Assessment (Step-by-Step Intake Form)
          2. Performance Score (Computed ML Score & Risk Tier)
          3. Academic Overview (Derived strictly from entered marks)
          4. Attendance and Skills Summary (Concise summary of presence & competencies)
      */}
      <StudentAssessmentWorkflow
        onNavigate={onNavigate}
        initialPrediction={latestPrediction}
        embeddedInDashboard={true}
      />
    </div>
  );
};
