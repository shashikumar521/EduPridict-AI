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
          isLight ? 'border-[#E9E5F2]' : 'border-zinc-800'
        }`}
      >
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-1 border ${
              isLight
                ? 'bg-[#8000E8]/10 text-[#8000E8] border-[#8000E8]/20'
                : 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Machine Learning Engine
          </div>
          <h1
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isLight ? 'text-[#11182E]' : 'text-white'
            }`}
          >
            Step-by-Step Student Assessment
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 ${
              isLight ? 'text-[#526581]' : 'text-zinc-400'
            }`}
          >
            Complete the 4-step intake process to compute predicted academic scores and generate personalized study guidance.
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs ${
            isLight
              ? 'bg-[#F0F3F8] hover:bg-white text-[#11182E] border-[#E9E5F2]'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
          }`}
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isLight ? 'text-[#8000E8]' : 'text-[#8B5CF6]'}`} />
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
