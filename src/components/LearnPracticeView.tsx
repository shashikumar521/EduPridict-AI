import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Clock,
  Award,
  Search,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Layers,
  Lightbulb,
  FileText,
  BarChart2,
  Bookmark,
  Share2
} from 'lucide-react';
import { SectionId, QuizQuestion, TopicTheory, QuizSubmissionResult } from '../types';
import {
  fetchLearnTopic,
  submitLearnQuiz,
  fetchQuizAttempts
} from '../services/api';
import { TopicAICoachModal } from './TopicAICoachModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LearnPracticeViewProps {
  onNavigate: (section: SectionId) => void;
  initialTopic?: string;
  initialCourseContext?: string;
  initialSubTab?: 'theory' | 'quiz';
}

const FEATURED_TOPICS = [
  {
    topic: 'Binary Trees',
    category: 'Computer Science',
    description: 'Tree traversals, BST properties, height balancing, and recursion.',
    difficulty: 'Medium'
  },
  {
    topic: 'Operating Systems',
    category: 'Computer Science',
    description: 'Process scheduling (FCFS, SJF, RR), memory management, and paging.',
    difficulty: 'Hard'
  },
  {
    topic: 'Database Normalization',
    category: 'Computer Science',
    description: '1NF, 2NF, 3NF, BCNF decomposition and functional dependencies.',
    difficulty: 'Medium'
  },
  {
    topic: 'Graph Algorithms',
    category: 'Computer Science',
    description: 'Breadth-first search, depth-first search, Dijkstra shortest path.',
    difficulty: 'Hard'
  },
  {
    topic: 'Dynamic Programming',
    category: 'Computer Science',
    description: 'Optimal substructure, overlapping subproblems, memoization vs tabulation.',
    difficulty: 'Hard'
  },
  {
    topic: 'Calculus & Integration',
    category: 'Mathematics',
    description: 'Definite integrals, integration by parts, substitution, and limits.',
    difficulty: 'Medium'
  },
  {
    topic: 'Linear Algebra',
    category: 'Mathematics',
    description: 'Matrix determinants, Gaussian elimination, eigenvalues, and vectors.',
    difficulty: 'Medium'
  },
  {
    topic: 'Computer Networks',
    category: 'Computer Science',
    description: 'OSI 7-layer model, TCP/IP handshake, routing protocols, and subnetting.',
    difficulty: 'Medium'
  }
];

export const LearnPracticeView: React.FC<LearnPracticeViewProps> = ({
  onNavigate,
  initialTopic,
  initialCourseContext,
  initialSubTab
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Navigation within Learn & Practice: 'directory' | 'study' | 'history'
  const [activeTab, setActiveTab] = useState<'study' | 'directory' | 'history'>('study');
  const [studySubTab, setStudySubTab] = useState<'theory' | 'quiz'>(initialSubTab || 'theory');

  useEffect(() => {
    if (initialSubTab) {
      setStudySubTab(initialSubTab);
      setActiveTab('study');
    }
  }, [initialSubTab]);

  // Selected Topic
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'Binary Trees');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseContext, setCourseContext] = useState<string>(initialCourseContext || 'Computer Science & Engineering');

  // Topic Content State
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [topicTheory, setTopicTheory] = useState<TopicTheory | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [topicSource, setTopicSource] = useState<string>('');

  // Quiz Execution State (Default 30 questions)
  const [quizLength, setQuizLength] = useState<10 | 30>(30);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);
  const [topicLoadError, setTopicLoadError] = useState<string>('');

  // AI Topic Coach Modal State
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);

  // Load Topic Data from API
  const loadTopicModule = useCallback(async (topicToLoad: string) => {
    setIsLoadingTopic(true);
    setTopicLoadError('');
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const res = await fetchLearnTopic(topicToLoad, courseContext, false);
      if (res && res.status === 'success' && res.theory && Array.isArray(res.questions) && res.questions.length > 0) {
        setSelectedTopic(res.topicTitle || topicToLoad);
        setTopicTheory(res.theory);
        setQuizQuestions(res.questions || []);
        setTopicSource(res.source);
        if (res.questions.length < 30) {
          console.warn(`Curriculum module returned ${res.questions.length} questions; 30 expected.`);
        }
      } else {
        setTopicLoadError(`Incomplete curriculum response for "${topicToLoad}". Expected 30 questions.`);
      }
    } catch (err: any) {
      console.error('Failed to load topic module:', err);
      setTopicLoadError(err?.message || `Failed to load verified curriculum for "${topicToLoad}".`);
    } finally {
      setIsLoadingTopic(false);
      setQuizStartTime(Date.now());
    }
  }, [courseContext]);

  // Load Past Attempts
  const loadPastAttempts = useCallback(async () => {
    try {
      const res = await fetchQuizAttempts();
      if (res && res.attempts) {
        setPastAttempts(res.attempts);
      }
    } catch (err) {
      console.error('Failed to load quiz attempts:', err);
    }
  }, []);

  useEffect(() => {
    loadTopicModule(selectedTopic);
    loadPastAttempts();
  }, [loadTopicModule, selectedTopic, loadPastAttempts]);

  // Handle Hash changes with topic param if any
  useEffect(() => {
    const rawHash = window.location.hash;
    if (rawHash.includes('topic=')) {
      const params = new URLSearchParams(rawHash.split('?')[1] || '');
      const t = params.get('topic');
      if (t) {
        setSelectedTopic(t);
        setActiveTab('study');
      }
    }
  }, []);

  // Filtered Quiz Questions for active test session
  const activeQuestions = useMemo(() => {
    let list = [...quizQuestions];
    if (selectedDifficulty !== 'All') {
      list = list.filter(q => q.difficulty === selectedDifficulty);
    }
    // Limit to chosen length
    return list.slice(0, quizLength);
  }, [quizQuestions, selectedDifficulty, quizLength]);

  // Handle Option Selection
  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  // Submit Quiz for Evaluation
  const handleSubmitQuiz = async () => {
    if (activeQuestions.length === 0) return;

    // Build answers array matching question array indices
    const answersArray: (number | null)[] = activeQuestions.map((_: QuizQuestion, idx: number) =>
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : null
    );

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < activeQuestions.length) {
      if (!confirm(`You have answered ${answeredCount} of ${activeQuestions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    setIsSubmittingQuiz(true);
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);

    try {
      const res = await submitLearnQuiz(selectedTopic, answersArray, timeSpent);
      if (res && res.status === 'success') {
        setQuizResult(res);
        await loadPastAttempts();
      }
    } catch (err: any) {
      alert('Failed to evaluate quiz: ' + (err?.message || 'Error occurred'));
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Reset Quiz
  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setQuizStartTime(Date.now());
  };

  // Filtered Directory Topics
  const filteredDirectoryTopics = useMemo(() => {
    if (!searchQuery.trim()) return FEATURED_TOPICS;
    const q = searchQuery.toLowerCase();
    return FEATURED_TOPICS.filter(
      t => t.topic.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-[#E1E6EF] text-[#172033] shadow-xs'
            : 'bg-[#131926] border-[#1E2B42] text-[#F7F8FC] shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-[#E1E6EF] dark:border-[#1E2B42] bg-[#0B132B] shadow-md flex items-center justify-center p-1">
              <img
                src="/edupredict-ai-logo.png"
                alt="EduPredict AI"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EEE7FF] text-[#7000E8] dark:bg-[rgba(112,0,232,0.18)] dark:text-[#C4B5FD] border border-[#D1B8FC] dark:border-[rgba(142,48,255,0.35)]">
                  Core Workflow
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F0F3F9] text-[#526078] dark:bg-[#182236] dark:text-[#CBD5E1] border border-[#E1E6EF] dark:border-[#1E2B42]">
                  Topic: {selectedTopic}
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                Learn &amp; Practice Studio
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                Master academic theory, practice verified multiple-choice questions, and update your topic mastery automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsCoachModalOpen(true)}
              className="btn-primary text-xs sm:text-sm gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white">Ask AI Topic Coach</span>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className="btn-secondary text-xs sm:text-sm"
            >
              Browse Syllabus Directory
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Tabs: Study Workspace vs Directory vs History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0 overflow-x-auto max-w-full custom-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('study')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'study'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Study Workspace ({selectedTopic})
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Syllabus Directory
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Quiz Attempts ({pastAttempts.length})
          </button>
        </div>

        {/* Quick Topic Search / Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter any syllabus topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setSelectedTopic(searchQuery.trim());
                  loadTopicModule(searchQuery.trim());
                  setActiveTab('study');
                }
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. TAB 1: STUDY WORKSPACE (THEORY & INTERACTIVE QUIZ) */}
      {activeTab === 'study' && (
        <div className="space-y-4">
          {/* Sub-tab switcher: Concept Theory vs Practice Quiz */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-2">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full custom-scrollbar whitespace-nowrap py-0.5">
              <button
                onClick={() => setStudySubTab('theory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  studySubTab === 'theory'
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : 'text-[#475569] dark:text-slate-200 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Concept Theory &amp; Notes
              </button>
              <button
                onClick={() => setStudySubTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  studySubTab === 'quiz'
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : 'text-[#475569] dark:text-slate-200 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                Interactive Practice Quiz ({quizQuestions.length} Questions)
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#475569] dark:text-slate-300">
              <span>Course: <strong className="text-[#0F172A] dark:text-white">{courseContext}</strong></span>
            </div>
          </div>

          {isLoadingTopic ? (
            <div
              className={`p-16 rounded-2xl border text-center space-y-3 ${
                isLight ? 'bg-white border-[#E1E6EF]' : 'bg-[#131926] border-[#1E2B42]'
              }`}
            >
              <div className="w-10 h-10 border-3 border-[#7000E8] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className={`text-sm font-bold ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                Loading academic theory and verified 30 questions...
              </p>
              <p className={`text-xs ${isLight ? 'text-[#526078]' : 'text-slate-400'}`}>
                Retrieving comprehensive curriculum notes for "{selectedTopic}"
              </p>
            </div>
          ) : topicLoadError ? (
            <div
              className={`p-10 rounded-2xl border text-center space-y-4 ${
                isLight ? 'bg-white border-[#E1E6EF]' : 'bg-[#131926] border-[#1E2B42]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#FEECEC] text-[#B42318] dark:bg-[rgba(180,35,24,0.2)] dark:text-[#FCA5A5] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                  Curriculum Module Unavailable
                </h3>
                <p className={`text-xs mt-1 max-w-md mx-auto leading-relaxed ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                  {topicLoadError}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => loadTopicModule(selectedTopic)}
                  className="btn-primary text-xs px-4 py-2 gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                  <span>Retry Generating 30 Questions</span>
                </button>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Browse Verified Banks
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SUB-TAB A: CONCEPT THEORY & REVISION NOTES */}
              {studySubTab === 'theory' && topicTheory && (
                <div className="space-y-6">
                  {/* Introduction Card */}
                  <div
                    className={`p-5 sm:p-6 rounded-2xl border ${
                      isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Conceptual Overview
                      </span>
                      <button
                        onClick={() => setIsCoachModalOpen(true)}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Explain with analogies
                      </button>
                    </div>
                    <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {topicTheory.title || selectedTopic}
                    </h2>
                    <p className={`text-sm mt-2 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {topicTheory.introduction}
                    </p>
                  </div>

                  {/* Fundamental Concepts */}
                  {topicTheory.fundamental_concepts && topicTheory.fundamental_concepts.length > 0 && (
                    <div
                      className={`p-5 sm:p-6 rounded-2xl border ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
                      }`}
                    >
                      <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Core Fundamental Principles
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topicTheory.fundamental_concepts.map((concept, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border ${
                              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                            }`}
                          >
                            <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400">
                              {concept.title}
                            </h4>
                            <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                              {concept.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Definitions & Terms */}
                  {topicTheory.definitions && topicTheory.definitions.length > 0 && (
                    <div
                      className={`p-5 sm:p-6 rounded-2xl border ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
                      }`}
                    >
                      <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Bookmark className="w-5 h-5 text-blue-500" />
                        Essential Definitions & Formulas
                      </h3>
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {topicTheory.definitions.map((def, idx) => (
                          <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-2">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0 w-44">
                              {def.term}:
                            </span>
                            <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              {def.definition}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Worked Examples */}
                  {topicTheory.step_by_step_examples && topicTheory.step_by_step_examples.length > 0 && (
                    <div
                      className={`p-5 sm:p-6 rounded-2xl border ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
                      }`}
                    >
                      <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <FileText className="w-5 h-5 text-indigo-500" />
                        Worked Examination Examples
                      </h3>
                      <div className="space-y-4">
                        {topicTheory.step_by_step_examples.map((ex, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border ${
                              isLight ? 'bg-indigo-50/30 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900/40'
                            }`}
                          >
                            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                              Problem: {ex.problem}
                            </h4>
                            <div className="mt-2.5 space-y-1.5 pl-2 border-l-2 border-indigo-400">
                              {ex.steps.map((st, sIdx) => (
                                <p key={sIdx} className="text-xs text-slate-600 dark:text-slate-300">
                                  <strong>Step {sIdx + 1}:</strong> {st}
                                </p>
                              ))}
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-indigo-200 dark:border-indigo-900/40 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              Solution: {ex.solution}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Pitfalls & Mistakes */}
                  {topicTheory.common_mistakes && topicTheory.common_mistakes.length > 0 && (
                    <div
                      className={`p-5 sm:p-6 rounded-2xl border ${
                        isLight ? 'bg-rose-50/40 border-rose-200' : 'bg-rose-950/20 border-rose-900/40'
                      }`}
                    >
                      <h3 className="text-base font-bold text-rose-900 dark:text-rose-200 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                        Common Examination Pitfalls & Fixes
                      </h3>
                      <div className="space-y-2.5">
                        {topicTheory.common_mistakes.map((m, idx) => (
                          <div key={idx} className="text-xs space-y-0.5">
                            <p className="font-bold text-rose-800 dark:text-rose-300">
                              ❌ Mistake: {m.mistake}
                            </p>
                            <p className="text-emerald-800 dark:text-emerald-300 pl-4">
                              ✓ Correction: {m.correction}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA to practice quiz */}
                  <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-teal-900 dark:text-teal-200">
                        Finished reading the concept theory?
                      </h4>
                      <p className="text-xs text-teal-700 dark:text-teal-300">
                        Verify your understanding with our interactive practice quiz to update your mastery score.
                      </p>
                    </div>
                    <button
                      onClick={() => setStudySubTab('quiz')}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      Take Practice Quiz <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-TAB B: INTERACTIVE PRACTICE QUIZ */}
              {studySubTab === 'quiz' && (
                <div className="space-y-6">
                  {/* Quiz Configuration Controls */}
                  {!quizResult && (
                    <div
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500">Quiz Format:</span>
                        <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 text-xs">
                          <button
                            onClick={() => setQuizLength(10)}
                            className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                              quizLength === 10
                                ? 'bg-teal-600 text-white'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            10 Questions (Sprint)
                          </button>
                          <button
                            onClick={() => setQuizLength(30)}
                            className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                              quizLength === 30
                                ? 'bg-teal-600 text-white'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            30 Questions (Full Exam)
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          Answered: <strong>{Object.keys(selectedAnswers).length}</strong> of {activeQuestions.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submission Result Verdict Screen */}
                  {quizResult && (
                    <div
                      className={`p-6 sm:p-8 rounded-2xl border text-center space-y-4 animate-in fade-in ${
                        quizResult.percentage >= 75
                          ? isLight
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-emerald-950/20 border-emerald-900/50'
                          : isLight
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-amber-950/20 border-amber-900/50'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto">
                        <Award className="w-8 h-8" />
                      </div>

                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Quiz Completed
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                          {quizResult.score} / {quizResult.total_questions} ({quizResult.percentage}%)
                        </h2>
                        <p className="text-sm font-bold text-teal-700 dark:text-teal-300 mt-1">
                          Verdict: {quizResult.mastery_verdict}
                        </p>
                      </div>

                      <div className="flex justify-center gap-6 text-xs max-w-md mx-auto py-2 border-y border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-slate-500 block">Correct</span>
                          <span className="font-extrabold text-emerald-600 text-sm">
                            {quizResult.correct_count}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Incorrect</span>
                          <span className="font-extrabold text-rose-600 text-sm">
                            {quizResult.incorrect_count}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Unanswered</span>
                          <span className="font-extrabold text-slate-600 text-sm">
                            {quizResult.unanswered_count}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                        {quizResult.recommended_action?.next_step ||
                          'Great effort! Review the detailed step-by-step explanations below to solidify difficult concepts.'}
                      </p>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleRetakeQuiz}
                          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                        </button>
                        <button
                          onClick={() => onNavigate('analysis')}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          View Updated Academic Trajectory <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question Cards */}
                  <div className="space-y-4">
                    {activeQuestions.map((q: QuizQuestion, qIdx: number) => {
                      const selectedOption = selectedAnswers[qIdx];
                      const reviewItem = quizResult?.detailed_review?.find(r => r.id === q.id);
                      const isSubmitted = Boolean(quizResult);

                      return (
                        <div
                          key={q.id || qIdx}
                          className={`p-5 rounded-2xl border transition-all ${
                            isSubmitted
                              ? reviewItem?.isCorrect
                                ? 'bg-emerald-50/20 border-emerald-300 dark:border-emerald-900/60'
                                : 'bg-rose-50/20 border-rose-300 dark:border-rose-900/60'
                              : isLight
                              ? 'bg-white border-slate-200'
                              : 'bg-[#111827] border-slate-800'
                          }`}
                        >
                          {/* Question Header */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-bold text-slate-500">
                              Question {qIdx + 1} of {activeQuestions.length}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {q.difficulty}
                              </span>
                              {q.category && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">
                                  {q.category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Question Text */}
                          <h4 className={`text-sm sm:text-base font-bold leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {q.question}
                          </h4>

                          {/* Multiple Choice Options */}
                          <div className="mt-4 space-y-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isSelected = selectedOption === optIdx;
                              let optionStyle = isLight
                                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                                : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 text-slate-200';

                              if (isSelected && !isSubmitted) {
                                optionStyle = 'bg-teal-500/10 border-teal-500 text-teal-800 dark:text-teal-200 font-bold';
                              }

                              if (isSubmitted && reviewItem) {
                                if (optIdx === reviewItem.correctAnswer) {
                                  optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                                } else if (isSelected && !reviewItem.isCorrect) {
                                  optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 line-through';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                  className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${optionStyle}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                  {isSubmitted && reviewItem && optIdx === reviewItem.correctAnswer && (
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation Accordion on Submission */}
                          {isSubmitted && reviewItem && (
                            <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                                Step-by-Step Explanation:
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {reviewItem.explanation || q.explanation || 'Verified canonical answer.'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Quiz Bottom Bar */}
                  {!quizResult && activeQuestions.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky bottom-4 shadow-lg z-10">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {Object.keys(selectedAnswers).length} of {activeQuestions.length} answered
                      </span>
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={isSubmittingQuiz}
                        className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                      >
                        {isSubmittingQuiz ? (
                          <>Evaluating Answers...</>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Submit Quiz & Evaluate
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 4. TAB 2: SYLLABUS DIRECTORY */}
      {activeTab === 'directory' && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111827] border-slate-800 shadow-xs'
          }`}
        >
          <div className="mb-5">
            <h2 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Course Syllabus & Learning Catalog
            </h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Select any core subject or topic to immediately load structured theory and 30-question diagnostic quizzes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectoryTopics.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  selectedTopic.toLowerCase() === item.topic.toLowerCase()
                    ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-950/20'
                    : isLight
                    ? 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.difficulty}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.topic}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedTopic(item.topic);
                      loadTopicModule(item.topic);
                      setActiveTab('study');
                      setStudySubTab('theory');
                    }}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
                  >
                    Read Theory <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTopic(item.topic);
                      loadTopicModule(item.topic);
                      setActiveTab('study');
                      setStudySubTab('quiz');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: PAST QUIZ ATTEMPTS & HISTORY */}
      {activeTab === 'history' && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111827] border-slate-800 shadow-xs'
          }`}
        >
          <h2 className={`text-lg sm:text-xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Diagnostic Quiz Attempt History
          </h2>
          <p className={`text-xs sm:text-sm mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Track your mastery progression over time across all topics.
          </p>

          {pastAttempts.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="text-xs font-semibold">No quiz attempts recorded yet.</p>
              <button
                onClick={() => {
                  setActiveTab('study');
                  setStudySubTab('quiz');
                }}
                className="mt-2 text-xs font-bold text-teal-600 hover:underline"
              >
                Take your first practice quiz
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pastAttempts.map(att => (
                <div
                  key={att.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div>
                    <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {att.topic}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Completed: {new Date(att.completed_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">
                        {att.score} / {att.total_questions} ({att.percentage}%)
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {att.percentage >= 75 ? 'Mastered' : 'Needs Practice'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTopic(att.topic);
                        loadTopicModule(att.topic);
                        setActiveTab('study');
                        setStudySubTab('quiz');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-xs transition cursor-pointer"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. AI Topic Coach Modal Integration */}
      <TopicAICoachModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        subjectName={courseContext}
        topicName={selectedTopic}
      />
    </div>
  );
};
