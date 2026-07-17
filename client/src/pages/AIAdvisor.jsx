import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Plus, MoreHorizontal, Menu, X, Brain, Download, Check, Copy, Volume2, VolumeX, ThumbsUp, ThumbsDown, Trash2, Briefcase } from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

const SUGGESTED_PROMPTS = [
  'Compare careers',
  'Show course roadmap',
  'What skills do I need?',
  'Highest paying careers in Nigeria',
  'Recommended electives for Software Engineer',
  'How to improve CGPA in DELSU?'
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: "Hello! I'm your PathWise AI Advisor. I can help you explore career options, understand course requirements, and plan your academic journey at DELSU. What would you like to know?",
    cards: null,
  },
];

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-pw-surface2 rounded-2xl rounded-tl-sm w-20">
    {[0,1,2].map(i => (
      <motion.div key={i} className="w-2 h-2 rounded-full bg-pw-gray"
        animate={{ y: [0,-5,0] }} transition={{ duration: 0.6, delay: i*0.15, repeat: Infinity }} />
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const scrollContainerRef = useRef(null);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text, idx) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgIdx === idx) {
        window.speechSynthesis.cancel();
        setSpeakingMsgIdx(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*\*|•|-/g, ''); // strip markdown syntax
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
      const text = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + text);
      setIsListening(false);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addNotification('Advice copied to clipboard!', 'success');
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/gemini/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession === sessionId) {
        setMessages(INITIAL_MESSAGES);
        setActiveSession(null);
      }
      addNotification('Chat session deleted.', 'success');
    } catch (error) {
      console.error('Failed to delete session', error);
      addNotification('Failed to delete chat session.', 'error');
    }
  };

  const exportChat = () => {
    try {
      const textContent = messages.map(m => {
        const roleName = m.role === 'user' ? 'Student' : 'AI Advisor';
        return `[${roleName}]\n${m.content}\n`;
      }).join('\n');
      
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pathwise_advisory_chat.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addNotification('Chat exported successfully!', 'success');
    } catch (err) {
      console.error('Failed to export chat', err);
      addNotification('Failed to export chat history.', 'error');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/gemini/sessions');
      setSessions(res.data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  };

  const loadSession = async (sessionId) => {
    setActiveSession(sessionId);
    try {
      const res = await api.get(`/gemini/sessions/${sessionId}`);
      if (res.data.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    } catch (error) {
      console.error('Failed to load session', error);
      addNotification('error', 'Failed to load chat history');
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 1) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await api.post('/gemini/chat', {
        message: msg,
        sessionId: activeSession,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        userContext: {
          department: user?.department,
          level: user?.level,
          cgpa: user?.cgpa,
        }
      });

      const aiReply = {
        role: 'assistant',
        content: res.data.reply || res.data.message,
        cards: res.data.careerCards || null,
      };
      setMessages(prev => [...prev, aiReply]);
      
      // If a new session was created, update the active session and refresh the list
      if (res.data.sessionId && !activeSession) {
        setActiveSession(res.data.sessionId);
        fetchSessions();
      }
    } catch {
      // Fallback mock response
      const fallbacks = [
        {
          content: "Based on your profile, I'd recommend exploring these career paths:\n\n• **Software Engineering**: Strong match for analytical thinkers with a background in mathematics and computing.\n\n• **Data Science**: Highly recommended for students who enjoy statistics, research and problem solving.\n\n• **Actuarial Science**: Ideal for those who excel in mathematics and enjoy risk analysis.",
          cards: [
            { title: 'Software Engineering', desc: 'Software engineering focusing on mathematics and data systems.', link: 'software-engineer' },
            { title: 'Actuarial Science',    desc: 'Recommends actuarial career path with strong analytical skills.',  link: 'data-scientist'    },
          ]
        },
      ];
      const fb = fallbacks[0];
      setMessages(prev => [...prev, { role: 'assistant', content: fb.content, cards: fb.cards }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const location = useLocation();
  const initialQueryHandled = useRef(false);

  useEffect(() => {
    if (location.state?.initialQuery && !initialQueryHandled.current) {
      initialQueryHandled.current = true;
      sendMessage(location.state.initialQuery);
    }
  }, [location.state]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const parseInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="text-pw-blue font-bold">{part.slice(2, -2)}</strong>
        : part
    );
  };

  const formatContent = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Check for headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-pw-white font-extrabold text-sm mt-3 mb-1.5">{parseInline(line.slice(4))}</h4>;
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        const cleanLine = line.startsWith('## ') ? line.slice(3) : line.slice(2);
        return <h3 key={idx} className="text-pw-white font-black text-base mt-4 mb-2 border-b border-pw-white/5 pb-1">{parseInline(cleanLine)}</h3>;
      }
      
      // Check for bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const cleanText = line.replace(/^[•\-\*]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-pw-blue mt-1.5 text-xs flex-shrink-0">•</span>
            <span className="text-pw-gray text-sm leading-relaxed">{parseInline(cleanText)}</span>
          </div>
        );
      }

      // Check for numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-pw-blue font-bold text-xs mt-0.5 flex-shrink-0">{numMatch[1]}.</span>
            <span className="text-pw-gray text-sm leading-relaxed">{parseInline(numMatch[2])}</span>
          </div>
        );
      }

      // Default paragraph
      return line.trim() ? (
        <p key={idx} className="text-pw-gray text-sm leading-relaxed mb-2 last:mb-0">{parseInline(line)}</p>
      ) : (
        <div key={idx} className="h-2" />
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-pw-black relative">

      {/* Overlay Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in" 
        />
      )}

      {/* Speech Recognition Floating Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pw-black/95 z-50 flex flex-col items-center justify-center gap-6"
          >
            <div className="relative flex items-center justify-center">
              {/* Concentric Pulsing Circles */}
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-pw-blue/10 border border-pw-blue/20"
                  style={{ width: 100 + i * 50, height: 100 + i * 50 }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
              <div className="w-24 h-24 rounded-full bg-pw-blue flex items-center justify-center shadow-[0_0_40px_rgba(0,86,255,0.6)] z-10">
                <Mic className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            <div className="text-center z-10">
              <h3 className="text-pw-white font-extrabold text-2xl font-outfit mb-2">Listening...</h3>
              <p className="text-pw-gray text-sm">Speak now. Tap anywhere to cancel.</p>
            </div>
            <button 
              onClick={() => setIsListening(false)}
              className="px-6 py-2 rounded-xl bg-pw-white/5 border border-pw-white/10 text-pw-white text-sm hover:bg-pw-white/10 transition-all z-10 mt-4"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 bg-pw-surface border-r border-pw-white/5 flex flex-col transition-all duration-300 md:relative ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-0 overflow-hidden border-r-0'}`}>
        {/* Header */}
        <div className="p-5 border-b border-pw-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PathWiseLogo size={36} />
            <div>
              <p className="text-pw-muted text-xs">AI Advisory</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="text-pw-gray hover:text-pw-white p-2 rounded-lg hover:bg-pw-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <button
            onClick={() => { setMessages(INITIAL_MESSAGES); setActiveSession(null); setIsSidebarOpen(false); }}
            className="w-full py-2.5 rounded-xl bg-pw-blue text-white font-bold text-sm hover:bg-pw-azure transition-all shadow-[0_4px_15px_rgba(0,86,255,0.2)] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Consultation
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ scrollbarWidth: 'none' }}>
          <div className="text-[10px] uppercase tracking-wider text-pw-muted font-bold px-3 mb-2">Recent Sessions</div>
          {sessions.length === 0 ? (
            <div className="text-pw-muted text-xs px-3 py-4 text-center">No past consultations</div>
          ) : (
            sessions.map(session => {
              const isSelected = activeSession === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => { loadSession(session.id); setIsSidebarOpen(false); }}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-pw-blue/10 border-l-2 border-pw-blue' : 'hover:bg-pw-white/5 border-l-2 border-transparent'}`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-pw-blue' : 'text-pw-white group-hover:text-pw-white'}`}>{session.title || 'PathWise Consultation'}</p>
                    <p className="text-pw-muted text-[10px] mt-0.5">
                      {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : 'Active session'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-pw-muted hover:text-red-500 hover:bg-red-500/10 transition-all flex-shrink-0"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-pw-black">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-pw-white/5 bg-pw-surface/30 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="text-pw-gray hover:text-pw-white p-2 rounded-lg hover:bg-pw-white/5"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div>
              <h2 className="text-pw-white font-extrabold text-lg leading-tight font-outfit flex items-center gap-1.5">
                Path<span className="text-pw-blue">Wise</span> AI Advisor
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-pw-muted text-[10px] hidden sm:inline">Ready to advise based on RIASEC &amp; SCCT theories</span>
                <span className="text-pw-muted text-[10px] sm:hidden">Ready to advise</span>
              </div>
            </div>
          </div>
          <button 
            onClick={exportChat} 
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-pw-blue/5 text-pw-blue border border-pw-blue/10 hover:bg-pw-blue/15 transition-all rounded-xl"
            title="Export Advice"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Chat</span>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          
          {/* Welcome Screen Dashboard when no messages sent */}
          {messages.length <= 1 && (
            <div className="max-w-3xl mx-auto py-4 sm:py-8 text-center flex flex-col items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-pw-blue/15 border border-pw-blue/20 flex items-center justify-center mb-6"
              >
                <Brain className="w-8 h-8 text-pw-blue" />
              </motion.div>
              <h1 className="text-pw-white text-3xl font-black font-outfit mb-2 tracking-tight">
                Hi, I'm your <span className="bg-gradient-to-r from-pw-blue to-pw-azure bg-clip-text text-transparent">PathWise Advisor</span>
              </h1>
              <p className="text-pw-gray text-sm max-w-md leading-relaxed mb-8">
                I combine Holland's RIASEC codes, Social Cognitive Career Theory, and DELSU's curriculum to offer personalized advice. Select a prompt or type below to start.
              </p>

              {/* Grid of Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                {[
                  { title: "Suggest Careers", desc: "Identify matching career fields suited for my personality profile.", prompt: "Suggest careers suited for my Holland RIASEC code and department." },
                  { title: "DELSU Roadmaps", desc: "Show me a semester-by-semester path for my course of study.", prompt: "Show me a semester-by-semester course roadmap for my department." },
                  { title: "Skill Gap Advice", desc: "Recommend certifications, tools and electives to learn.", prompt: "What skills and certifications should I develop based on my major?" },
                  { title: "Improve Academic CGPA", desc: "Practical advice on managing coursework and improving grades.", prompt: "How can I improve my CGPA and study more effectively at DELSU?" }
                ].map((act, idx) => (
                  <div
                    key={idx}
                    onClick={() => sendMessage(act.prompt)}
                    className="p-4 rounded-2xl bg-pw-surface border border-pw-white/5 hover:border-pw-blue/20 hover:bg-pw-blue/5 transition-all cursor-pointer group"
                  >
                    <span className="text-pw-white font-bold text-sm block group-hover:text-pw-blue transition-colors">{act.title}</span>
                    <span className="text-pw-gray text-xs leading-relaxed hidden sm:block mt-1">{act.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.length > 1 && (
            <AnimatePresence>
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-pw-blue/10 border border-pw-blue/30 flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="w-4.5 h-4.5 text-pw-blue" />
                      </div>
                    )}

                    <div className={`max-w-[85%] md:max-w-2xl w-fit group relative ${isUser ? 'order-first' : ''}`}>
                      {isUser ? (
                        <div className="px-5 py-3 rounded-[24px] rounded-tr-[4px] bg-gradient-to-r from-pw-blue to-pw-azure text-white text-sm leading-relaxed shadow-lg break-words w-fit min-w-[60px]">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="px-5 py-4 rounded-[24px] rounded-tl-[4px] bg-pw-surface border border-pw-white/5 text-pw-gray text-sm leading-relaxed relative">
                            {formatContent(msg.content)}

                            {/* Message actions footer bar inside bubble */}
                            <div className="flex items-center justify-end gap-2 mt-4 pt-2.5 border-t border-pw-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => speakText(msg.content, i)}
                                className={`hidden sm:inline-flex p-1.5 rounded-lg hover:bg-pw-white/5 transition-all ${speakingMsgIdx === i ? 'text-pw-blue' : 'text-pw-gray'}`}
                                title={speakingMsgIdx === i ? "Stop speaking" : "Speak advice"}
                              >
                                {speakingMsgIdx === i ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(msg.content)}
                                className="p-1.5 rounded-lg text-pw-gray hover:text-pw-white hover:bg-pw-white/5 transition-all"
                                title="Copy to clipboard"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <div className="h-3 w-px bg-pw-white/10 mx-0.5" />
                              <button
                                onClick={() => handleFeedback(i, 'up')}
                                className={`p-1.5 rounded-lg hover:bg-pw-white/5 transition-all ${feedbacks[i] === 'up' ? 'text-green-400' : 'text-pw-gray hover:text-green-400'}`}
                                title="Helpful"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(i, 'down')}
                                className={`p-1.5 rounded-lg hover:bg-pw-white/5 transition-all ${feedbacks[i] === 'down' ? 'text-red-400' : 'text-pw-gray hover:text-red-400'}`}
                                title="Not helpful"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Embedded Career Cards */}
                          {msg.cards && (
                            <div className="space-y-2 mt-3 max-w-md">
                              {msg.cards.map((card, j) => (
                                <Link key={j} to={`/career/${card.link}`} className="block">
                                  <div className="bg-pw-surface border border-pw-white/5 rounded-full p-2 pl-3 pr-4 flex items-center justify-between hover:border-pw-blue/30 transition-all hover:bg-pw-blue/[0.02] group/card">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-8 h-8 rounded-full bg-pw-blue/10 border border-pw-blue/20 flex items-center justify-center flex-shrink-0 text-pw-blue group-hover/card:bg-pw-blue group-hover/card:text-white transition-colors">
                                        <Briefcase className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-pw-white font-bold text-xs truncate">{card.title}</p>
                                        <p className="text-pw-gray text-[10px] truncate">{card.desc}</p>
                                      </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-pw-white/5 flex items-center justify-center flex-shrink-0 text-pw-muted group-hover/card:text-pw-blue group-hover/card:bg-pw-blue/10 transition-all">
                                      <Send className="w-3 h-3 rotate-45" />
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-pw-blue/10 border border-pw-blue/30 flex items-center justify-center flex-shrink-0 mt-1 text-pw-blue font-bold text-xs">
                        {userInitial}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-pw-blue/10 border border-pw-blue/30 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4.5 h-4.5 text-pw-blue animate-pulse" />
              </div>
              <TypingIndicator />
            </div>
          )}
        </div>

        {/* Suggested Prompts Pills */}
        {messages.length > 1 && (
          <div className="hidden sm:flex px-4 sm:px-6 pb-2.5 sm:pb-3 items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {SUGGESTED_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="px-4 py-2 rounded-full border border-pw-white/5 bg-pw-surface text-pw-gray text-xs font-bold hover:border-pw-blue/30 hover:text-pw-blue hover:bg-pw-blue/[0.02] transition-all whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="px-4 sm:px-6 pb-8 sm:pb-10">
          <div className="flex items-center gap-2 sm:gap-3 bg-pw-surface border border-pw-white/10 rounded-full pl-3 sm:pl-5 pr-2 py-1.5 sm:py-2 focus-within:border-pw-blue/40 transition-all shadow-lg">
            <button 
              onClick={() => {
                const inputElement = document.createElement('input');
                inputElement.type = 'file';
                inputElement.onchange = () => addNotification('Attachment uploaded successfully (simulation).', 'success');
                inputElement.click();
              }}
              className="text-pw-gray hover:text-white transition-colors flex-shrink-0"
              title="Attach document/transcript"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 bg-transparent text-pw-white placeholder-pw-muted resize-none focus:outline-none text-sm py-2"
              style={{ scrollbarWidth: 'none', minHeight: '36px', maxHeight: '128px' }}
            />

            <button 
              onClick={startSpeechRecognition}
              className={`text-pw-gray hover:text-white transition-colors flex-shrink-0 ${isListening ? 'text-pw-blue' : ''}`}
              title="Voice typing"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-pw-blue text-white flex items-center justify-center hover:bg-pw-azure disabled:opacity-40 transition-all flex-shrink-0 shadow-[0_2px_12px_rgba(0,86,255,0.3)]"
              title="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
