import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  User,
  GraduationCap,
  Lightbulb,
  Clock,
  Target,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  Bot
} from 'lucide-react';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId } from '../types';
import { counselorChat } from '../services/api';

interface Message {
  id: string;
  sender: 'student' | 'counselor';
  text: string;
  timestamp: string;
  source?: string;
  steps?: string[];
  recommendedMethod?: string;
}

export const CounselorView: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<EducationLevelId>('btech');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'counselor',
      text: "Hello! I am your AI Academic Counselor. Whether you are dealing with low exam scores, attendance bottlenecks, study habits, or exam anxiety, I'm here to give you practical, evidence-based academic advice tailored to your educational level.",
      timestamp: '10:00 AM',
      source: 'counselor_knowledge_base'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const presetQueries = [
    {
      title: 'Score Jump Plan',
      text: 'How can I systematically raise my examination score from 50% to 75%?'
    },
    {
      title: 'Exam Anxiety & Cramming',
      text: 'I tend to panic and procrastinate before exams. How can I manage study stress and plan ahead?'
    },
    {
      title: 'Attendance & Backlog Recovery',
      text: 'My attendance is below 65% and I have backlogs. What is the fastest path to academic recovery?'
    },
    {
      title: 'Balancing Projects & Theory',
      text: 'How do I balance semester lab projects with theoretical exam revision without burning out?'
    }
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'student',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsTyping(true);

    try {
      const data = await counselorChat(textToSend.trim(), {
        education_level: selectedLevelId
      });

      const counselorMsg: Message = {
        id: `cns-${Date.now()}`,
        sender: 'counselor',
        text: data.reply,
        source: data.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, counselorMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `cns-${Date.now()}`,
        sender: 'counselor',
        text: "I experienced a temporary communication glitch with the counselor service. For immediate guidance, maintain steady attendance above 75%, break revision into 45-minute active blocks, and review previous exam papers.",
        source: 'system_fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const currentLevelConfig = EDUCATION_LEVELS.find((l) => l.id === selectedLevelId) || EDUCATION_LEVELS[5];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Interactive Mentorship
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Pedagogical Advice</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            AI Academic Counselor
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Personalized guidance on exam strategies, motivation, study techniques, time management, and recovering from academic setbacks.
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-edupredict-chatbot'))}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Open EduPredict AI Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>

        {/* Education Level selector */}
        <div className="shrink-0">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Student Profile Level
          </label>
          <select
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value as EducationLevelId)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {EDUCATION_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Query Bubbles */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
          Frequently Consulted Academic Topics:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presetQueries.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pq.text)}
              disabled={isTyping}
              className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:border-indigo-800 transition text-xs group cursor-pointer disabled:opacity-50"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 block">
                {pq.title}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                {pq.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Counselor Conversation Thread */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'student' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'student'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white'
                }`}
              >
                {msg.sender === 'student' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'student'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-tl-none space-y-3'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.source && msg.sender === 'counselor' && (
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <Bot className="w-3 h-3 text-indigo-500" />
                    <span>
                      {msg.source === 'gemini'
                        ? 'Powered by Gemini AI (Live Academic Guidance)'
                        : 'Calibrated Pedagogical Knowledge Base'}
                    </span>
                  </div>
                )}

                <span
                  className={`block text-[10px] ${
                    msg.sender === 'student' ? 'text-indigo-200 text-right' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-75"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-150"></span>
                <span className="text-[11px] ml-1">Consulting academic counselor framework...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask academic counselor for advice (${currentLevelConfig.label})...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="btn-primary !p-2.5 !rounded-xl min-h-[38px] min-w-[38px] shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
