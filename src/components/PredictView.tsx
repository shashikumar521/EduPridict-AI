import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { PredictionInput, SectionId } from '../types';
import { StudentAssessmentWorkflow } from './StudentAssessmentWorkflow';

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
  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Machine Learning Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Step-by-Step Student Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Complete the 4-step intake process to compute predicted academic scores and generate personalized study guidance.
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-semibold px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
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
