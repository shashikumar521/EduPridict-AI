import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { fetchTopicAIAssistance } from '../services/api';

interface TopicAICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  topicName: string;
  difficulty?: string;
  confidence?: string;
}

export const TopicAICoachModal: React.FC<TopicAICoachModalProps> = ({
  isOpen,
  onClose,
  subjectName,
  topicName,
  difficulty = 'Medium',
  confidence = 'Average'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    summary: string;
    activeRecallQuestions: string[];
    examPitfall: string;
    source: string;
  } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isOpen || !topicName) return;

    let isMounted = true;
    setIsLoading(true);
    setData(null);

    fetchTopicAIAssistance({
      subjectName,
      topicName,
      difficulty,
      confidence
    })
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load topic AI coaching:', err);
        if (isMounted) {
          setData({
            summary: `Essential conceptual principles for ${topicName} in ${subjectName}. Focus on deriving the core formulas and standard problem templates.`,
            activeRecallQuestions: [
              `What is the primary governing formula or principle behind ${topicName}?`,
              `List the 3 consecutive steps to solve a typical exam problem on ${topicName}.`,
              `What edge condition or edge case causes mistakes in ${topicName}?`
            ],
            examPitfall: 'Substituting numerical values before simplifying algebraic expressions, causing arithmetic errors under time pressure.',
            source: 'heuristic'
          });
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, subjectName, topicName, difficulty, confidence]);

  if (!isOpen) return null;

  const handleCopyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleReveal = (idx: number) => {
    setRevealedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white dark:bg-[#111827] rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#161F33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                  AI Study Coach
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{subjectName}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{topicName}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-slate-800 dark:text-slate-200">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
              <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
              <p className="text-sm font-medium">Generating high-impact revision breakdown &amp; recall prompts...</p>
            </div>
          ) : data ? (
            <>
              {/* Concept Summary Card */}
              <div className="bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800 rounded-xl p-4.5">
                <div className="flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wide">
                  <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Exam Concept Blueprint</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{data.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                    Difficulty: <strong className="text-slate-900 dark:text-white">{difficulty}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                    Confidence: <strong className="text-slate-900 dark:text-white">{confidence}</strong>
                  </span>
                  <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Source: {data.source === 'gemini' ? 'Gemini 3.8 Flash' : 'EduPredict Knowledge Base'}
                  </span>
                </div>
              </div>

              {/* Active Recall Practice Questions */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Active Recall Questions (Test Yourself Before Looking)</span>
                  </h4>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">3 Flash Drills</span>
                </div>
                <div className="space-y-2.5">
                  {data.activeRecallQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161F33] hover:border-purple-300 dark:hover:border-purple-600 transition shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">{q}</p>
                        </div>
                        <button
                          onClick={() => handleCopyQuestion(q, idx)}
                          title="Copy question"
                          className="text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <button
                          onClick={() => toggleReveal(idx)}
                          className="text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 font-semibold text-xs cursor-pointer hover:underline"
                        >
                          {revealedQuestions[idx] ? 'Hide Answer Strategy' : 'Reveal Answer Strategy'}
                        </button>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Recall check</span>
                      </div>
                      {revealedQuestions[idx] && (
                        <div className="mt-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 animate-in fade-in duration-100 font-medium">
                          <strong>Strategy:</strong> State the law or definition, write the formula with term meanings, and sketch a quick diagram or flowchart before solving.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfall / Trap Warning */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wide mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Top Exam Trap to Avoid</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium">{data.examPitfall}</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#161F33] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Recommended: Solve 2 pen-and-paper problems today</span>
          </div>
          <button
            onClick={onClose}
            className="btn-primary w-full sm:w-auto px-4 py-2 text-xs font-semibold"
          >
            Done &amp; Return to Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
