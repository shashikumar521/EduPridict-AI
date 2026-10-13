import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  BookOpen,
  Send,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-indigo-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  AI Study Coach
                </span>
                <span className="text-xs text-slate-400 font-medium">{subjectName}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{topicName}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-slate-700">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium">Generating high-impact revision breakdown & recall prompts...</p>
            </div>
          ) : data ? (
            <>
              {/* Concept Summary Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4.5">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-xs uppercase tracking-wide">
                  <Lightbulb className="w-4 h-4" />
                  <span>Exam Concept Blueprint</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                    Difficulty: <strong className="text-slate-800">{difficulty}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                    Your Confidence: <strong className="text-slate-800">{confidence}</strong>
                  </span>
                  <span className="ml-auto text-[11px] text-slate-400">
                    Source: {data.source === 'gemini' ? 'Gemini 3.8 Flash' : 'EduPredict Knowledge Base'}
                  </span>
                </div>
              </div>

              {/* Active Recall Practice Questions */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>Active Recall Questions (Test Yourself Before Looking)</span>
                  </h4>
                  <span className="text-xs text-slate-400">3 Flash Drills</span>
                </div>
                <div className="space-y-2.5">
                  {data.activeRecallQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{q}</p>
                        </div>
                        <button
                          onClick={() => handleCopyQuestion(q, idx)}
                          title="Copy question"
                          className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-slate-50 transition shrink-0 cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <button
                          onClick={() => toggleReveal(idx)}
                          className="text-indigo-600 hover:text-indigo-700 font-medium text-xs cursor-pointer hover:underline"
                        >
                          {revealedQuestions[idx] ? 'Hide Answer Strategy' : 'Reveal Answer Strategy'}
                        </button>
                        <span className="text-[11px] text-slate-400">Recall check</span>
                      </div>
                      {revealedQuestions[idx] && (
                        <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 animate-in fade-in duration-100">
                          <strong>Strategy:</strong> State the law or definition, write the formula with term meanings, and sketch a quick diagram or flowchart before solving.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfall / Trap Warning */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Top Exam Trap to Avoid</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">{data.examPitfall}</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Recommended: Solve 2 pen-and-paper problems today</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            Done & Return to Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
