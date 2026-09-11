import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp, Mic, Plus, Menu, X, Download, Copy, Check,
  Volume2, VolumeX, ThumbsUp, ThumbsDown, Trash2, Compass,
  Sparkles, ChevronDown, SquarePen, Paperclip, ChevronRight,
  Search, BookOpen, GraduationCap, Briefcase, Bot, User as UserIcon
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    icon: Compass,
    title: 'Match my Holland Code',
    prompt: 'Explain what careers best match my Holland Code and personality dimensions at DELSU.'
  },
  {
    icon: BookOpen,
    title: 'Course Roadmap Guidance',
    prompt: 'What specific DELSU departmental courses are most critical for a career in software engineering?'
  },
  {
    icon: Briefcase,
    title: 'Delta State SIWES Placements',
    prompt: 'What industrial training and SIWES internship placements are available in Delta State for my discipline?'
  },
  {
    icon: GraduationCap,
    title: 'CGPA & Academic Strategy',
    prompt: 'How can I optimize my study plan and CGPA for competitive graduate tech opportunities?'
  }
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: "Hello! I am your PathWise AI Career Advisor, trained on DELSU academic curricula and vocational psychometrics. How can I guide your career or course choices today?",
    cards: null,
  },
];

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 py-2 px-1">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full bg-[var(--blue)] opacity-60"
        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

const AIAdvisor = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const location = useLocation();
  const initialQueryHandled = useRef(false);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const promptParam = params.get('prompt');
    const targetQuery = location.state?.initialQuery || promptParam;
    if (targetQuery && !initialQueryHandled.current) {
      initialQueryHandled.current = true;
      sendMessage(targetQuery);
    }
  }, [location.state, location.search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/gemini/sessions');
      setSessions(res.data || []);
    } catch (error) {
      console.warn('Could not fetch chat sessions:', error);
    }
  };

  const loadSession = async (sessionId) => {
    setActiveSession(sessionId);
    setIsSidebarOpen(false);
    try {
      const res = await api.get(`/gemini/sessions/${sessionId}`);
      if (res.data?.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    } catch (error) {
      addNotification('Failed to load chat session', 'error');
    }
  };

  const startNewSession = () => {
    setActiveSession(null);
    setMessages(INITIAL_MESSAGES);
    setInput('');
    setIsSidebarOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/gemini/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession === sessionId) {
        startNewSession();
      }
      addNotification('Chat session deleted.', 'success');
    } catch (error) {
      addNotification('Failed to delete session.', 'error');
    }
  };

  const speakText = (text, idx) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgIdx === idx) {
        window.speechSynthesis.cancel();
        setSpeakingMsgIdx(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*\*|•|-/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeakingMsgIdx(null);
      utterance.onerror = () => setSpeakingMsgIdx(null);
      setSpeakingMsgIdx(idx);
      window.speechSynthesis.speak(utterance);
    } else {
      addNotification('Text-to-speech is not supported in this browser.', 'info');
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification('Speech recognition is not supported in this browser.', 'info');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' : '') + transcript);
      setIsListening(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
      }
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const handleFeedback = (idx, type) => {
    setFeedbacks(prev => ({
      ...prev,
      [idx]: prev[idx] === type ? null : type
    }));
    addNotification('Thank you for your feedback!', 'success');
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    addNotification('Message copied to clipboard!', 'success');
  };

  const exportChat = () => {
    try {
      const textContent = messages.map(m => {
        const roleName = m.role === 'user' ? (user?.fullName || 'Student') : 'PathWise AI Advisor';
        return `[${roleName}]
${m.content}
`;
      }).join('\n');
      
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pathwise_chat_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addNotification('Chat transcript exported!', 'success');
    } catch (err) {
      addNotification('Failed to export chat.', 'error');
    }
  };

  const sendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await api.post('/gemini/chat', {
        message: query,
        sessionId: activeSession,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        userContext: {
          department: user?.department,
          level: user?.level,
          cgpa: user?.cgpa,
          matricNo: user?.matricNo,
          faculty: user?.faculty,
          hollandCode: user?.hollandCode,
          topMatch: user?.quizResults?.[0]?.careerId
        }
      });

      const aiReply = {
        role: 'assistant',
        content: res.data.reply || res.data.message || 'I have analyzed your query based on DELSU guidelines.',
        cards: res.data.careerCards || null,
      };
      setMessages(prev => [...prev, aiReply]);

      if (res.data.sessionId && !activeSession) {
        setActiveSession(res.data.sessionId);
        fetchSessions();
      }
    } catch (error) {
      // Offline fallback
      const fallbackReplies = [
        {
          trigger: /course|electiv|regist/i,
          content: "Based on DELSU academic regulations, ensure you verify compulsory credit loads for your semester before selecting electives. If you are pursuing Software Engineering, prioritize CSC 211, CSC 311, and MTH 110.",
          cards: null
        },
        {
          trigger: /siwes|intern|job/i,
          content: "For SIWES and industrial attachment within Delta State, major placements include DELSUTH Oghara, Chevron Warri, NNPC WRPC, and regional technology hubs in Warri and Asaba.",
          cards: null
        },
        {
          trigger: /cgpa|grade|probation/i,
          content: "A 5.0 CGPA system rewards consistent performance across core departmental credit loads. Focus on high-unit courses early in your semester to bolster your cumulative average.",
          cards: null
        }
      ];

      const matched = fallbackReplies.find(f => f.trigger.test(query));
      const fallbackContent = matched
        ? matched.content
        : "I have consulted the local PathWise advisory cache. For personalized guidance on this specific query, please confirm your departmental course curriculum at the Faculty office or retry when network is restored.";

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackContent,
        cards: matched?.cards || null
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredSessions = sessions.filter(s =>
    (s.title || 'Untitled Chat').toLowerCase().includes(searchHistoryQuery.toLowerCase())
  );

  const isFreshChat = messages.length <= 1;

  return (
    <div className="flex h-[calc(100vh-4.25rem)] bg-[var(--canvas)] relative overflow-hidden" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <style>{`
        h1, h2, h3, h4, h5, h6 { font-family: 'Nunito', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── ChatGPT Style Slide-over Sidebar Drawer ────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl flex flex-col md:relative md:translate-x-0"
            >
              {/* Drawer Top Header */}
              <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between">
                <button
                  onClick={startNewSession}
                  className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--lavender)] text-[var(--blue)] text-xs font-bold transition-all hover:bg-[var(--blue)] hover:text-white shadow-2xs mr-2"
                >
                  <span className="flex items-center gap-2">
                    <SquarePen className="w-4 h-4" /> New Chat
                  </span>
                  <span className="text-[10px] opacity-75">Ctrl+K</span>
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--graphite)] hover:bg-[var(--mist)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* History Search */}
              <div className="p-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--mist)] border border-[var(--border)] text-xs">
                  <Search className="w-3.5 h-3.5 text-[var(--graphite)]" />
                  <input
                    type="text"
                    placeholder="Search past conversations..."
                    value={searchHistoryQuery}
                    onChange={e => setSearchHistoryQuery(e.target.value)}
                    className="w-full bg-transparent text-[var(--ink)] placeholder-[var(--ash)] outline-none text-xs"
                  />
                </div>
              </div>

              {/* Session History List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--graphite)]">
                  Recent Conversations
                </div>

                {filteredSessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--graphite)]">
                    No conversation history found.
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const isActive = activeSession === session.id;
                    return (
                      <div
                        key={session.id}
                        onClick={() => loadSession(session.id)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          isActive
                            ? 'bg-[var(--lavender)] text-[var(--blue)] font-bold'
                            : 'text-[var(--ink)] hover:bg-[var(--mist)]'
                        }`}
                      >
                        <span className="truncate flex-1 pr-2">
                          {session.title || 'Career Advisory Session'}
                        </span>
                        <button
                          onClick={(e) => deleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* User Account Drawer Footer */}
              <div className="p-3 border-t border-[var(--border)] bg-[var(--mist)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--blue)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.fullName ? user.fullName[0] : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--ink)] truncate leading-tight">
                    {user?.fullName || 'DELSU Student'}
                  </p>
                  <p className="text-[10px] text-[var(--graphite)] truncate">
                    {user?.matricNo || 'Matric Pending'}
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Chat Canvas ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">

        {/* ── ChatGPT Style Top Bar ──────────────────────────────────── */}
        <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)] px-3.5 sm:px-6 flex items-center justify-between z-10 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--mist)] transition-colors"
              title="Chat History"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* ChatGPT Model Selector Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--mist)] text-xs font-bold text-[var(--ink)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PathWise Llama 3.3 70B</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--graphite)] opacity-70" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={startNewSession}
              className="p-2 rounded-xl text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--mist)] transition-colors"
              title="New Chat"
            >
              <SquarePen className="w-5 h-5" />
            </button>
            <button
              onClick={exportChat}
              className="p-2 rounded-xl text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--mist)] transition-colors hidden sm:flex"
              title="Export Chat Transcript"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Chat Messages Scroll Stream ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4 space-y-6">
          <div className="max-w-3xl mx-auto w-full space-y-6">

            {/* Empty Greeting State (ChatGPT Style) */}
            {isFreshChat && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 sm:py-10 text-center"
              >
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3.5 flex items-center justify-center bg-[var(--lavender)] border border-[var(--border)] shadow-xs">
                  <Compass className="w-7 h-7 text-[var(--blue)]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] mb-1">
                  What would you like to explore?
                </h2>
                <p className="text-xs text-[var(--graphite)] max-w-md mx-auto mb-6">
                  Ask anything about DELSU course requirements, your RIASEC assessment results, career prospects, or SIWES internships.
                </p>

                {/* 2x2 Suggested Prompts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto text-left">
                  {SUGGESTED_PROMPTS.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => sendMessage(item.prompt)}
                        className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--blue)] hover:shadow-sm transition-all group flex items-start gap-3 text-left"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[var(--mist)] group-hover:bg-[var(--lavender)] flex items-center justify-center text-[var(--graphite)] group-hover:text-[var(--blue)] transition-colors flex-shrink-0">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--ink)] mb-0.5 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[var(--graphite)] line-clamp-2 leading-relaxed">
                            {item.prompt}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Conversation Flow */}
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* User Bubble */}
                  {isUser ? (
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-[var(--blue)] text-white px-4 py-2.5 text-sm leading-relaxed shadow-xs">
                      {msg.content}
                    </div>
                  ) : (
                    /* Assistant Message: Clean ChatGPT open style */
                    <div className="w-full space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[var(--lavender)] flex items-center justify-center text-[var(--blue)] shadow-2xs">
                          <Compass className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-[var(--ink)]">PathWise Advisor</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--mist)] text-[var(--graphite)] font-bold">
                          70B
                        </span>
                      </div>

                      <div className="text-sm text-[var(--ink)] leading-relaxed pl-8 space-y-2 whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {/* Interactive Career Cards (if generated by AI) */}
                      {msg.cards && (
                        <div className="pl-8 space-y-2 mt-3 max-w-md">
                          {msg.cards.map((card, j) => (
                            <Link
                              key={j}
                              to={`/career/${card.link || card.id}`}
                              className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--blue)] hover:shadow-xs transition-all"
                            >
                              <div>
                                <h4 className="text-xs font-bold text-[var(--ink)]">{card.title}</h4>
                                <p className="text-[10px] text-[var(--graphite)] line-clamp-1">{card.desc}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[var(--ash)]" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* ChatGPT Action Bar */}
                      <div className="flex items-center gap-2 pl-8 pt-1 text-[var(--graphite)] text-xs">
                        <button
                          onClick={() => copyToClipboard(msg.content, i)}
                          className="p-1 rounded-md hover:text-[var(--ink)] hover:bg-[var(--mist)] transition-colors"
                          title="Copy advice"
                        >
                          {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => speakText(msg.content, i)}
                          className={`p-1 rounded-md hover:text-[var(--ink)] hover:bg-[var(--mist)] transition-colors ${
                            speakingMsgIdx === i ? 'text-[var(--blue)]' : ''
                          }`}
                          title="Read aloud"
                        >
                          {speakingMsgIdx === i ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleFeedback(i, 'like')}
                          className={`p-1 rounded-md hover:text-[var(--ink)] hover:bg-[var(--mist)] transition-colors ${
                            feedbacks[i] === 'like' ? 'text-emerald-600 font-bold' : ''
                          }`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(i, 'dislike')}
                          className={`p-1 rounded-md hover:text-[var(--ink)] hover:bg-[var(--mist)] transition-colors ${
                            feedbacks[i] === 'dislike' ? 'text-red-600 font-bold' : ''
                          }`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="pl-8">
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Signature ChatGPT Mobile Capsule Input Bar ─────────────── */}
        <div className="px-3 sm:px-6 pb-[78px] md:pb-4 bg-gradient-to-t from-[var(--canvas)] via-[var(--canvas)] to-transparent pt-2">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full pl-2 pr-2 py-1.5 shadow-sm focus-within:border-[var(--blue)] focus-within:ring-2 focus-within:ring-[var(--blue)]/15 transition-all">
              {/* Plus / Attachment Button */}
              <button
                type="button"
                onClick={() => {
                  const inputEl = document.createElement('input');
                  inputEl.type = 'file';
                  inputEl.onchange = () => addNotification('Document attachment received (simulated).', 'success');
                  inputEl.click();
                }}
                className="w-8 h-8 rounded-full bg-[var(--mist)] hover:bg-[var(--fog)] text-[var(--graphite)] hover:text-[var(--ink)] flex items-center justify-center transition-colors flex-shrink-0"
                title="Attach transcript or syllabus"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Auto-expanding Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message PathWise..."
                rows={1}
                className="flex-1 bg-transparent text-[var(--ink)] placeholder-[var(--ash)] resize-none focus:outline-none text-xs sm:text-sm py-1.5 px-1"
                style={{ scrollbarWidth: 'none', minHeight: '32px', maxHeight: '120px' }}
              />

              {/* Action Button: Dynamic Mic <-> ArrowUp */}
              {input.trim().length > 0 ? (
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isTyping}
                  className="w-8 h-8 rounded-full bg-[var(--blue)] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 flex-shrink-0"
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                    isListening
                      ? 'bg-red-50 text-red-600 animate-pulse'
                      : 'text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--mist)]'
                  }`}
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-center text-[var(--ash)] mt-1.5">
              PathWise AI can make mistakes. Verify critical course codes with DELSU Faculty guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
