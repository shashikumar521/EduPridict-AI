import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { PredictionInput, SectionId } from '../types';
import { StudentAssessmentWorkflow } from './StudentAssessmentWorkflow';
import { useTheme } from '../context/ThemeContext';

interface PredictViewProps {
  onNavigate: (section: SectionId) => void;
  prefillData?: Partial<PredictionInput> | null;
  onPredictionSaved?: () => void;
}

export const PredictView: React.FC<PredictViewProps> = ({
  onNavigate,
  prefillData,
  onPredictionSaved
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 border ${
              isLight
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-purple-950/70 text-purple-300 border-purple-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            Machine Learning Engine
          </div>
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Step-by-Step Student Assessment
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 font-medium ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Complete the 4-step intake process to compute predicted academic scores and generate personalized study guidance.
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="btn-secondary self-start sm:self-auto shrink-0 text-xs px-3.5 py-2 gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Main Student Assessment Workflow */}
      <StudentAssessmentWorkflow
        onNavigate={onNavigate}
        prefillData={prefillData}
        onPredictionSaved={onPredictionSaved}
        embeddedInDashboard={false}
      />
    </div>
  );
};
