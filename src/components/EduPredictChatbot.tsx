import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Square,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Globe,
  AlertCircle,
  BookOpen,
  GraduationCap,
  ChevronDown,
  Info,
  ShieldCheck,
  Search,
  MessageSquare,
  ArrowRight,
  User as UserIcon,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ChatMessage,
  GroundingSource,
  ChatResponsePayload,
  ChatStatusPayload,
  fetchChatStatus,
  sendChatMessage
} from '../services/api';
import { SectionId } from '../types';

interface EduPredictChatbotProps {
  currentSection?: SectionId;
  onNavigate?: (section: SectionId) => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: GroundingSource[];
  suggestedQuestions?: string[];
  personalized?: boolean;
  searchUsed?: boolean;
  isError?: boolean;
  missingConfig?: boolean;
}

const DEFAULT_SUGGESTED_QUESTIONS = [
  'Explain a BTech subject in simple words.',
  'Help me prepare for my next examination.',
  'Explain a programming concept with an example.',
  'Recommend courses for my career goals.',
  'Help me understand my academic performance.',
  'Create a revision plan for my subjects.'
];

export const EduPredictChatbot: React.FC<EduPredictChatbotProps> = ({
  currentSection = 'home',
  onNavigate,
  isOpen: controlledIsOpen,
  onToggleOpen
}) => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // State management
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [chatStatus, setChatStatus] = useState<ChatStatusPayload | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Abort controller reference for stopping generation
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize conversation with welcome message
  const [messages, setMessages] = useState<DisplayMessage[]>(() => {
    const greetingName = user?.name ? user.name.split(' ')[0] : 'Student';
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `👋 Hello ${greetingName}! I'm **EduPredict AI Assistant**, your dedicated academic mentor and engineering study partner.\n\nI can help you with:\n• **B.Tech Core Subjects & Exam Prep**: DSA, Operating Systems, DBMS, Networks, Mathematics\n• **Code Explanations & Worked Examples**: Python, Java, C++, JavaScript, SQL\n• **Study Planning & Timetables**: Personalized revision strategy based on your syllabus\n• **Academic Trajectory & Gaps**: Understanding marks, attendance benchmarks, and high-yield topics\n\nHow can I help you excel today? Choose an inquiry below or type your question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        personalized: Boolean(isAuthenticated && user)
      }
    ];
  });

  // Load chat status on mount and when authentication changes
  useEffect(() => {
    let isMounted = true;
    fetchChatStatus()
      .then((status) => {
        if (isMounted) setChatStatus(status);
      })
      .catch((err) => {
        console.warn('Failed to load chat status:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  // Listen to global open event from Quick Actions or any view
  useEffect(() => {
    const handleGlobalOpen = (e: Event) => {
      setIsOpen(true);
      const customEvent = e as CustomEvent<{ query?: string }>;
      if (customEvent.detail?.query) {
        handleSendMessage(customEvent.detail.query);
      }
    };
    window.addEventListener('open-edupredict-chatbot', handleGlobalOpen);
    return () => window.removeEventListener('open-edupredict-chatbot', handleGlobalOpen);
  }, []);

  // Update welcome message personalization when user signs in or out
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome-msg') {
      const greetingName = user?.name ? user.name.split(' ')[0] : 'Student';
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `👋 Hello ${greetingName}! I'm **EduPredict AI Assistant**, your dedicated academic mentor and engineering study partner.\n\n${
            isAuthenticated
              ? `✨ **Personalized Academic Record Active**: I have direct context on your degree, enrolled subjects, upcoming exams, and diagnostic quiz attempts.\n\n`
              : `💡 **Guest Mode**: Feel free to ask any conceptual or exam questions! You can also sign in to unlock automated syllabus gap diagnosis tailored to your marks.\n\n`
          }I can help you with:\n• **B.Tech Core Subjects & Exam Prep**: DSA, Operating Systems, DBMS, Networks, Mathematics\n• **Code Explanations & Worked Examples**: Python, Java, C++, JavaScript, SQL\n• **Study Planning & Timetables**: Personalized revision strategy based on your syllabus\n• **Academic Trajectory & Gaps**: Understanding marks, attendance benchmarks, and high-yield topics\n\nHow can I help you excel today? Choose an inquiry below or type your question.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          personalized: Boolean(isAuthenticated && user)
        }
      ]);
    }
  }, [isAuthenticated, user]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setUnreadCount(0);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  // Monitor scroll position to show "scroll to bottom" button
  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollBottom(!isAtBottom);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Stop active generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Copy response text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Copy code snippet
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeSnippet(code);
    setTimeout(() => {
      setCopiedCodeSnippet(null);
    }, 2000);
  };

  // Reset conversation
  const handleClearChat = () => {
    if (isLoading) {
      handleStopGeneration();
    }
    const greetingName = user?.name ? user.name.split(' ')[0] : 'Student';
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation refreshed. Hello ${greetingName}! What subject, concept, or examination would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        personalized: Boolean(isAuthenticated && user)
      }
    ]);
    setInputText('');
  };

  // Send message
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    // Validate length
    if (textToSend.length > 3000) {
      alert('Message exceeds maximum limit of 3000 characters.');
      return;
    }

    const userMessageId = `usr-${Date.now()}`;
    const userMsg: DisplayMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    // If panel is closed, increment unread count
    if (!isOpen) {
      setUnreadCount((prev) => prev + 1);
    }

    // Build chat API history payload
    const apiPayload: ChatMessage[] = updatedMessages
      .filter((m) => !m.isError)
      .map((m) => ({
        role: m.role,
        content: m.content
      }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Human-readable section name for contextual assistance
      const sectionLabels: Record<string, string> = {
        home: 'Public Home Portal',
        dashboard: 'Student Performance Dashboard',
        analysis: 'Academic Analysis & Gap Diagnosis',
        scheduler: 'Exam Scheduler & Revision Timetable',
        learn: 'Learn & Practice Studio',
        predict: 'ML Performance Predictor',
        whatif: 'What-If Simulation Simulator',
        students: 'Student Records Directory',
        progress: 'Progress & Grade Trajectory',
        subjects: 'Subject-wise Mastery Analysis',
        planner: 'Weekly Study Habit Planner',
        roadmap: 'Engineering Knowledge Roadmap',
        courses: 'Recommended Verified Courses',
        readiness: 'Exam Readiness Assessment',
        counselor: 'Academic Counselor View',
        goals: 'Target Goals & Achievements',
        history: 'Inference Prediction History',
        analytics: 'ML Model Validation Metrics',
        reports: 'Comprehensive Student Reports',
        notifications: 'Study Session & Exam Alerts',
        settings: 'Account & Academic Profile Settings'
      };

      const pageContext = sectionLabels[currentSection] || currentSection;

      const response: ChatResponsePayload = await sendChatMessage(
        apiPayload,
        enableSearch,
        pageContext,
        controller.signal
      );

      const assistantMsg: DisplayMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        suggestedQuestions: response.suggestedQuestions,
        personalized: response.personalized,
        searchUsed: response.searchUsed
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Generation was cancelled by student
        const cancelMsg: DisplayMessage = {
          id: `cancelled-${Date.now()}`,
          role: 'assistant',
          content: '_Generation stopped by student._',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, cancelMsg]);
      } else {
        console.error('Chatbot error:', err);
        const isMissingKey = Boolean(err.missingConfig || err.message?.includes('GEMINI_API_KEY'));
        const errorMessage: DisplayMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: isMissingKey
            ? `⚠️ **Gemini API Key Required**\n\nEduPredict AI Assistant requires a configured \`GEMINI_API_KEY\` to perform real AI reasoning.\n\n**Setup Instructions:**\n1. Obtain an API key from Google AI Studio.\n2. Add \`GEMINI_API_KEY=your_key_here\` to your server environment or \`.env\` file.\n3. Restart the server and your assistant will connect immediately with full live reasoning and search grounding.`
            : `❌ **Connection Issue**: ${err.message || 'Unable to retrieve answer from AI service. Please check your network and try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          missingConfig: isMissingKey
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Safe Markdown & Code Formatter
  const renderFormattedContent = (content: string) => {
    // Split by fenced code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim() || 'code';
        const code = lines.slice(1).join('\n');

        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-[#CBD5E1] dark:border-[#334155] bg-[#0F172A] text-slate-100 text-xs font-mono shadow-sm"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#1E293B] border-b border-[#334155] text-[11px] text-slate-300">
              <span className="uppercase tracking-wider font-semibold text-[#A78BFA]">{language}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(code)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy code to clipboard"
              >
                {copiedCodeSnippet === code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto custom-scrollbar font-mono leading-relaxed text-[12px]">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Process paragraphs, headings, bullet points, bold, inline code, and blockquotes
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-2">
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lineIdx} className="h-1.5" />;

            // Headings
            if (trimmed.startsWith('### ')) {
              return (
                <h4
                  key={lineIdx}
                  className="text-sm font-bold mt-2 mb-1 text-[#0F172A] dark:text-white tracking-tight"
                >
                  {renderInlineFormatting(trimmed.substring(4))}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3
                  key={lineIdx}
                  className="text-base font-extrabold mt-3 mb-1 text-[#0F172A] dark:text-white tracking-tight border-b border-slate-200 dark:border-slate-800 pb-1"
                >
                  {renderInlineFormatting(trimmed.substring(3))}
                </h3>
              );
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h2
                  key={lineIdx}
                  className="text-lg font-black mt-3 mb-1 text-[#0F172A] dark:text-white tracking-tight"
                >
                  {renderInlineFormatting(trimmed.substring(2))}
                </h2>
              );
            }

            // Blockquote
            if (trimmed.startsWith('> ')) {
              return (
                <div
                  key={lineIdx}
                  className="my-2 pl-3 py-1.5 border-l-3 border-[#7C3AED] bg-[#F5F3FF] dark:bg-[#6D28D9]/15 rounded-r-lg text-xs leading-relaxed text-[#4C1D95] dark:text-[#DDD6FE]"
                >
                  {renderInlineFormatting(trimmed.substring(2))}
                </div>
              );
            }

            // Bullet points
            if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const bulletContent = trimmed.substring(2);
              return (
                <div key={lineIdx} className="flex items-start gap-2 text-xs leading-relaxed pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA] mt-1.5 shrink-0" />
                  <span className="flex-1">{renderInlineFormatting(bulletContent)}</span>
                </div>
              );
            }

            // Numbered list
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
            if (numMatch) {
              return (
                <div key={lineIdx} className="flex items-start gap-2 text-xs leading-relaxed pl-1">
                  <span className="font-bold text-[#6D28D9] dark:text-[#A78BFA] text-[11px] min-w-4 shrink-0">
                    {numMatch[1]}.
                  </span>
                  <span className="flex-1">{renderInlineFormatting(numMatch[2])}</span>
                </div>
              );
            }

            // Standard paragraph
            return (
              <p key={lineIdx} className="text-xs leading-relaxed text-[#1E293B] dark:text-slate-200">
                {renderInlineFormatting(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper for inline markdown: bold, italic, inline code
  const renderInlineFormatting = (text: string) => {
    // Process inline code first: `code`
    const codeParts = text.split(/(`[^`]+`)/g);

    return codeParts.map((subPart, sIdx) => {
      if (subPart.startsWith('`') && subPart.endsWith('`')) {
        return (
          <code
            key={sIdx}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#7C3AED] dark:text-[#C4B5FD] font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700"
          >
            {subPart.slice(1, -1)}
          </code>
        );
      }

      // Process bold: **text**
      const boldParts = subPart.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={bIdx} className="font-bold text-[#0F172A] dark:text-white">
              {bPart.slice(2, -2)}
            </strong>
          );
        }

        // Process italic: *text*
        const italicParts = bPart.split(/(\*[^*]+\*)/g);
        return italicParts.map((iPart, iIdx) => {
          if (iPart.startsWith('*') && iPart.endsWith('*') && !iPart.startsWith('**')) {
            return (
              <em key={iIdx} className="italic text-slate-700 dark:text-slate-300">
                {iPart.slice(1, -1)}
              </em>
            );
          }
          return iPart;
        });
      });
    });
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING CHATBOT TRIGGER BUTTON (Bottom-Right, accessible on all pages) */}
      {/* ========================================================================= */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open EduPredict AI Assistant"
            className="group relative flex items-center gap-2.5 px-4.5 py-3 sm:px-5 sm:py-3.5 rounded-full font-bold shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 focus:outline-hidden focus:ring-4 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] hover:from-[#5B21B6] hover:to-[#4338CA] text-white shadow-[#6D28D9]/40 hover:shadow-[#6D28D9]/60 focus:ring-[#7C3AED]/35 hover:-translate-y-1"
          >
            {/* Pulsing glow ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] opacity-40 blur-xs group-hover:opacity-75 animate-pulse transition-opacity" />

            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-xs">
              <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </div>

            <div className="relative text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
                  EduPredict AI
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-white/20 text-white border border-white/30">
                  Assistant
                </span>
              </div>
            </div>

            {/* Sparkle icon */}
            <Sparkles className="relative w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />

            {/* Unread badge if messages arrived while closed */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN CONVERSATIONAL CHAT PANEL */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="EduPredict AI Assistant Chat"
          aria-modal="false"
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl rounded-2xl border overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-10 w-auto h-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] md:w-[460px] h-[calc(100dvh-5rem)] max-h-[640px]'
          } ${
            isLight
              ? 'bg-white border-[#CBD5E1] text-[#0F172A] shadow-slate-900/20'
              : 'bg-[#111A2E] border-[#2D3E5E] text-white shadow-black/60'
          }`}
        >
          {/* HEADER */}
          <div
            className={`p-3.5 sm:p-4 border-b flex items-center justify-between shrink-0 transition-colors ${
              isLight
                ? 'bg-gradient-to-r from-[#FAF5FF] via-white to-[#F5F3FF] border-[#E2E8F0]'
                : 'bg-gradient-to-r from-[#172033] via-[#111A2E] to-[#1E1B4B] border-[#2D3E5E]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src="/edupredict-ai-logo.png"
                  alt="EduPredict AI Logo"
                  className="w-full h-full object-cover rounded-[10px]"
                  onError={(e) => {
                    // Fallback to Bot icon if image missing
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <Bot className="w-5 h-5 text-white absolute" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight truncate text-[#0F172A] dark:text-white">
                    EduPredict AI Assistant
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/30 dark:text-[#DDD6FE]">
                    <Sparkles className="w-2.5 h-2.5" />
                    {chatStatus?.model || 'gemini-3.8-flash'}
                  </span>
                </div>

                {/* Subtitle / Personalization context */}
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                  {isAuthenticated ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Personalized for {user?.name || 'Student'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium truncate">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      <span>Academic Tutor (Guest Mode)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Reset chat button */}
              <button
                type="button"
                onClick={handleClearChat}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Start new conversation"
                aria-label="Start new conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Expand / Minimize toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer hidden sm:flex items-center justify-center ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isExpanded ? 'Restore window size' : 'Expand window'}
                aria-label={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Close chat (Esc)"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE VIEWPORT BANNER */}
          <div
            className={`px-3.5 py-1.5 border-b text-[11px] font-medium flex items-center justify-between shrink-0 ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-[#162035] border-[#2D3E5E] text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">Context: {currentSection} page</span>
            </div>

            {/* Toggle live search grounding */}
            <button
              type="button"
              onClick={() => setEnableSearch((prev) => !prev)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                enableSearch
                  ? 'bg-indigo-600 text-white'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle Google Search grounding for real-time exam dates and admission criteria"
            >
              <Globe className="w-3 h-3" />
              <span>Search Grounding {enableSearch ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* MESSAGES SCROLL CONTAINER */}
          <div
            ref={chatScrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-4"
          >
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-end gap-2 max-w-[92%] sm:max-w-[85%]">
                    {/* Assistant Avatar */}
                    {isAssistant && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] flex items-center justify-center shrink-0 mb-1 text-white shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative rounded-2xl p-3 sm:p-3.5 transition-all text-xs sm:text-[13px] ${
                        isAssistant
                          ? msg.isError
                            ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 rounded-bl-xs'
                            : isLight
                            ? 'bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] rounded-bl-xs shadow-xs'
                            : 'bg-[#172033] border border-[#2D3E5E] text-slate-100 rounded-bl-xs shadow-xs'
                          : 'bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white rounded-br-xs shadow-sm font-medium'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="break-words leading-relaxed space-y-2">
                        {renderFormattedContent(msg.content)}
                      </div>

                      {/* Grounding Sources (Real Google Search citations) */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6D28D9] dark:text-[#A78BFA] mb-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Verified External Sources ({msg.sources.length}):</span>
                          </div>
                          <div className="space-y-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-700 hover:border-[#7C3AED] dark:hover:border-[#A78BFA] transition-colors text-[11px] group"
                              >
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-[#6D28D9] dark:group-hover:text-[#A78BFA]">
                                  {src.title || src.url}
                                </span>
                                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#6D28D9] shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer bar of the message (timestamp, copy, badge) */}
                      <div
                        className={`mt-2 flex items-center justify-between gap-3 text-[10px] ${
                          isAssistant
                            ? 'text-slate-600 dark:text-slate-300'
                            : 'text-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{msg.timestamp}</span>
                          {msg.searchUsed && (
                            <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold">
                              <Globe className="w-2.5 h-2.5" />
                              <span>Search verified</span>
                            </span>
                          )}
                          {msg.personalized && (
                            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Profile context</span>
                            </span>
                          )}
                        </div>

                        {/* Copy message button */}
                        {isAssistant && !msg.isError && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                            title="Copy response to clipboard"
                            aria-label="Copy response"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {!isAssistant && (
                      <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mb-1 text-slate-700 dark:text-slate-200 shadow-xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Contextual Suggested Questions Chips (from AI response) */}
                  {isAssistant && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5 max-w-[90%]">
                      {msg.suggestedQuestions.map((sq, sqIdx) => (
                        <button
                          key={sqIdx}
                          type="button"
                          onClick={() => handleSendMessage(sq)}
                          disabled={isLoading}
                          className={`text-left text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer disabled:opacity-50 ${
                            isLight
                              ? 'bg-purple-50/70 border-purple-200 text-purple-900 hover:bg-purple-100 hover:border-purple-300'
                              : 'bg-[#1E1B4B]/60 border-[#4C1D95] text-purple-200 hover:bg-[#1E1B4B] hover:border-purple-400'
                          }`}
                        >
                          <span className="mr-1 text-[#7C3AED]">↳</span>
                          {sq}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading indicator while waiting for model */}
            {isLoading && (
              <div className="flex items-end gap-2 items-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] flex items-center justify-center shrink-0 text-white shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div
                  className={`rounded-2xl rounded-bl-xs p-3 border text-xs flex items-center gap-2.5 ${
                    isLight
                      ? 'bg-white border-[#E2E8F0] text-slate-600'
                      : 'bg-[#172033] border-[#2D3E5E] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-[#6D28D9] animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce" />
                  </div>
                  <span className="font-medium">
                    EduPredict AI Assistant is synthesizing academic guidance...
                  </span>

                  {/* Stop generation button */}
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors cursor-pointer"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Stop</span>
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SCROLL TO BOTTOM BUTTON */}
          {showScrollBottom && (
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-24 right-6 p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-lg hover:scale-105 transition-transform cursor-pointer"
              title="Scroll to latest messages"
              aria-label="Scroll to latest messages"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* SUGGESTED STARTER QUESTIONS (Collapsible if few messages) */}
          {messages.length <= 2 && !isLoading && (
            <div
              className={`px-3 py-2 border-t border-b text-xs shrink-0 ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#162035]/80 border-[#2D3E5E]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6D28D9] dark:text-[#A78BFA] mb-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Suggested Student Questions:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className={`text-[11px] text-left px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-900'
                        : 'bg-[#111A2E] border-slate-700 text-slate-300 hover:bg-purple-950/40 hover:border-purple-600 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT FORM */}
          <div
            className={`p-3 sm:p-3.5 border-t shrink-0 ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#111A2E] border-[#2D3E5E]'
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="space-y-2"
            >
              <div className="relative flex items-end rounded-xl border focus-within:ring-2 focus-within:ring-[#7C3AED]/40 focus-within:border-[#7C3AED] transition-all bg-white dark:bg-[#172033] border-[#CBD5E1] dark:border-[#334155]">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  maxLength={3000}
                  placeholder="Ask a question about BTech subjects, code, exam prep, or study planning... (Enter to send)"
                  disabled={isLoading}
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-[13px] bg-transparent resize-none focus:outline-hidden text-[#0F172A] dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 custom-scrollbar disabled:opacity-50"
                />

                <div className="flex items-center gap-1.5 p-2 shrink-0">
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="p-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer"
                      title="Stop generating"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className={`p-2 rounded-lg font-bold transition-all cursor-pointer ${
                        inputText.trim()
                          ? 'bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] hover:from-[#5B21B6] hover:to-[#4338CA] text-white shadow-md shadow-purple-500/25 active:scale-95'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Send message (Enter)"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status footer with character count and privacy note */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 px-1">
                <div className="flex items-center gap-2">
                  <span>Shift + Enter for new line</span>
                  <span>•</span>
                  <span>Strict Academic Tutor</span>
                </div>
                <div>{inputText.length} / 3000</div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
