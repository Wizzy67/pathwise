import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Compass, LayoutDashboard, ClipboardCheck, MessageSquare, Bookmark, User, Star, BookmarkCheck, CheckCircle2, Map, Code, BarChart2, Lock, Brain, Sparkles, Bell, Settings, Trophy, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_STEPS = [
  { targetId: 'nav-main', title: '🧭 Your Navigation', body: 'This sidebar is your main navigation. Use it to access the Career Assessment, Explore Careers, your AI Advisor, and more.', position: 'right' },
  { targetId: 'wb', title: '👤 Your Profile Overview', body: 'This banner shows your XP level, top match score, and key profile details. Complete your assessment to unlock your full career profile!', position: 'bottom' },
  { targetId: 'nav-quiz', title: '📝 Career Assessment', body: 'This is the most important step. Take the 5-minute assessment and our AI will match you with the best career paths based on your unique profile.', position: 'right' },
  { targetId: 'nav-advisor', title: '🤖 Your AI Advisor', body: 'Meet your AI career advisor. Ask it anything — career comparisons, course recommendations, industry insights, and more.', position: 'right' },
  { targetId: 'nav-saved', title: '🔖 Saved Careers', body: 'Bookmark careers you like and compare them side-by-side. You can always come back and review your favorites here.', position: 'right' }
];

const WelcomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tourState, setTourState] = useState('modal'); // 'modal', 'tour', 'done'
  const [currentStep, setCurrentStep] = useState(0);

  const xp = user?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpMax = level * 100;
  const displayName = user?.fullName?.split(' ')[0] || 'User';
  const rawLevel = user?.level || '100';
  const welcomeLevelText = String(rawLevel).includes('Level') || String(rawLevel).includes('L')
    ? rawLevel
    : `${rawLevel} Level`;

  const [careersList, setCareersList] = useState([]);
  const [roadmapsExploredCount, setRoadmapsExploredCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [careersRes, activityRes] = await Promise.all([
          api.get('/data/careers'),
          api.get('/users/activity')
        ]);
        if (careersRes.data) setCareersList(careersRes.data);
        if (activityRes.data) {
          const count = activityRes.data.filter(a => a.action === 'roadmap_viewed').length;
          setRoadmapsExploredCount(count);
        }
      } catch (err) {
        console.error('Failed to fetch stats data', err);
      }
    };
    fetchData();
  }, [user]);

  const topMatchScore = user?.quizResults && user.quizResults.length > 0 ? `${user.quizResults[0].score}%` : '0%';
  const careersSavedCount = user?.savedCareers?.length || 0;
  const assessmentStatus = user?.quizResults && user.quizResults.length > 0 ? 'Done' : 'Pending';

  const matchedCareers = (user?.quizResults || []).slice(0, 3).map(match => {
    const detail = careersList.find(c => c.id === match.id);
    return {
      id: match.id,
      title: detail?.title || match.id,
      category: detail?.category || 'Category',
      score: match.score,
    };
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('pathwise_notifs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: '🎓 Welcome to PathWise! Complete your profile to get started.', read: false, time: 'Just now' },
      { id: 2, text: '💡 Recommendation: Software Engineering matches your CGPA.', read: false, time: '2 hours ago' },
      { id: 3, text: '📅 DELSU Academic Calendar: First semester exam schedules updated.', read: true, time: '1 day ago' },
      { id: 4, text: '🚀 AI Advisor: New curriculum course advisory is now online.', read: true, time: '2 days ago' },
    ];
  });

  const saveNotifications = (newNotifs) => {
    setNotifications(newNotifs);
    localStorage.setItem('pathwise_notifs', JSON.stringify(newNotifs));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const toggleRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    saveNotifications(updated);
  };

  const deleteNotif = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const startTour = () => setTourState('tour');
  const skipTour = () => {
    setTourState('done');
    navigate('/dashboard');
  };
  
  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      skipTour();
    }
  };

  const getSpotlightStyle = () => {
    if (tourState !== 'tour') return {};
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (!el) return {};
    const rect = el.getBoundingClientRect();
    const padding = 8;
    return {
      left: rect.left - padding,
      top: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    };
  };

  const getTooltipStyle = () => {
    if (tourState !== 'tour') return {};
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (!el) return {};
    const rect = el.getBoundingClientRect();
    
    // Estimate max tooltip height to prevent it from going off-screen
    const maxTooltipHeight = 220; 
    let top = rect.top;
    
    // If positioning at the bottom, add offset
    if (step.position !== 'right') {
      top = rect.bottom + 20;
    }
    
    // Ensure it doesn't overflow bottom of viewport
    if (top + maxTooltipHeight > window.innerHeight) {
      top = Math.max(20, window.innerHeight - maxTooltipHeight - 20);
    }

    if (step.position === 'right') {
      return { left: rect.right + 20, top };
    }
    return { left: rect.left, top };
  };

  return (
    <>
      <style>{`
        .welcome-page-container {
          background: var(--canvas); color: var(--ink); font-family: 'Open Sans', sans-serif;
          min-height: 100vh; display: flex;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 240px; min-height: 100vh; flex-shrink: 0;
          background: var(--surface); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; padding: 1.5rem 0;
          position: relative; z-index: 5; backdrop-filter: blur(20px);
        }
        .sidebar-logo { display: flex; align-items: center; gap: 0.7rem; padding: 0 1.4rem 1.5rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
        .sidebar-logo-icon { width: 34px; height: 34px; border-radius: 9px; background: var(--blue); display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .sidebar-logo-text { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.15rem; color: var(--blue); }

        .nav-section { padding: 0 0.8rem; margin-bottom: 0.5rem; }
        .nav-label { font-size: 0.7rem; font-weight: 700; color: var(--graphite); opacity: 0.7; letter-spacing: 0.1em; text-transform: uppercase; padding: 0 0.6rem; margin-bottom: 0.4rem; }
        .nav-item {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.7rem 0.9rem; border-radius: 12px; cursor: pointer;
          color: var(--graphite); font-size: 0.88rem; font-weight: 500;
          transition: all 0.2s; position: relative; text-decoration: none;
        }
        .nav-item:hover { background: var(--fog); color: var(--ink); }
        .nav-item.active { background: var(--lavender); color: var(--blue); }
        .nav-item.active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; background: var(--blue); border-radius: 0 3px 3px 0; }
        .nav-icon { font-size: 1rem; width: 20px; text-align: center; }
        .nav-badge { margin-left: auto; background: var(--blue); color: #fff; font-size: 0.65rem; font-weight: 700; border-radius: 50px; padding: 0.15rem 0.5rem; }

        .sidebar-bottom { margin-top: auto; padding: 1rem 0.8rem; border-top: 1px solid var(--border); }
        .user-chip { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 0.9rem; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .user-chip:hover { background: var(--fog); }
        .user-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--blue); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 700; color: #fff; }
        .user-name { font-size: 0.85rem; font-weight: 600; color: var(--ink); }
        .user-level { font-size: 0.72rem; color: var(--blue); }

        /* ── MAIN ── */
        .dash-main { flex: 1; position: relative; z-index: 1; }
        .topbar { position: sticky; top: 0; background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; z-index: 4; }
        .topbar-left h1 { font-family: 'Nunito', sans-serif; font-size: 1.3rem; font-weight: 800; color: var(--ink); }
        .topbar-left p { color: var(--graphite); font-size: 0.82rem; margin-top: 0.1rem; }
        .topbar-right { display: flex; align-items: center; gap: 1rem; }
        .notif-btn { width: 38px; height: 38px; border-radius: 10px; background: var(--fog); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s; color: var(--graphite); }
        .notif-btn:hover { background: var(--mist); }
        .notif-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: var(--blue); border: 2px solid var(--surface); }

        /* ── DASHBOARD CONTENT ── */
        .dash-content { padding: 2rem; }
        .welcome-banner { background: var(--lavender); border: 1px solid var(--border); border-radius: 20px; padding: 2rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; position: relative; overflow: hidden; }
        .wb-left h2 { font-family: 'Nunito', sans-serif; font-size: 1.5rem; font-weight: 900; margin-bottom: 0.4rem; color: var(--ink); }
        .wb-left p { color: var(--graphite); font-size: 0.88rem; line-height: 1.6; }
        .xp-bar-wrap { margin-top: 1rem; }
        .xp-label { display: flex; justify-content: space-between; color: var(--graphite); font-size: 0.75rem; margin-bottom: 0.4rem; }
        .xp-track { background: var(--mist); border-radius: 50px; height: 8px; overflow: hidden; }
        .xp-fill { height: 100%; border-radius: 50px; background: var(--blue); width: 75%; }
        .wb-right { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .level-badge { background: var(--surface); border: 1px solid var(--border); border-radius: 50px; padding: 0.3rem 1rem; color: var(--blue); font-size: 0.78rem; font-weight: 700; }
        .wb-right .big-score { font-family: 'Nunito', sans-serif; font-size: 2.5rem; font-weight: 900; color: var(--blue); }
        .wb-right span { color: var(--graphite); font-size: 0.8rem; }

        .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.2rem; transition: all 0.3s; cursor: pointer; }
        .stat-card:hover { border-color: var(--blue); transform: translateY(-3px); }
        .stat-icon { font-size: 1.4rem; margin-bottom: 0.6rem; color: var(--blue); }
        .stat-value { font-family: 'Nunito', sans-serif; font-size: 1.6rem; font-weight: 900; color: var(--ink); }
        .stat-label { color: var(--graphite); font-size: 0.78rem; margin-top: 0.2rem; }
        .stat-card:nth-child(1) .stat-value { color: var(--blue); }
        .stat-card:nth-child(2) .stat-value { color: var(--blue); }
        .stat-card:nth-child(3) .stat-value { color: var(--azure); }
        .stat-card:nth-child(4) .stat-value { color: var(--azure); }

        .main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 1.5rem; }
        .card h3 { font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem; color: var(--ink); }
        .career-item { display: flex; align-items: center; gap: 1rem; padding: 0.9rem; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); margin-bottom: 0.7rem; transition: all 0.2s; cursor: pointer; }
        .career-item:hover { border-color: var(--blue); background: var(--mist); }
        .career-icon { font-size: 1.4rem; width: 38px; text-align: center; color: var(--blue); }
        .career-info { flex: 1; }
        .career-name { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; color: var(--ink); }
        .career-field { color: var(--graphite); font-size: 0.75rem; }
        .career-score { font-family: 'Nunito', sans-serif; font-size: 1.1rem; font-weight: 800; color: var(--blue); }
        .progress-mini { height: 4px; border-radius: 2px; background: var(--mist); margin-top: 0.3rem; }
        .progress-mini-fill { height: 100%; border-radius: 2px; background: var(--blue); }

        .tip-card { background: var(--mist); border: 1px solid var(--border); border-radius: 14px; padding: 1rem; margin-bottom: 0.9rem; }
        .tip-card h4 { color: var(--blue); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.3rem; display: flex; align-items: center; gap: 0.4rem; }
        .tip-card p { color: var(--graphite); font-size: 0.82rem; line-height: 1.6; }
        .cta-start { width: 100%; padding: 0.9rem; border-radius: 14px; background: var(--blue); color: #fff; border: none; font-size: 0.92rem; font-weight: 700; cursor: pointer; transition: all 0.3s; text-decoration: none; display: block; text-align: center; }
        .cta-start:hover { transform: translateY(-2px); background: var(--azure); }

        /* ── MODALS & TOUR ── */
        .welcome-modal-wrap { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); }
        .welcome-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 28px; padding: 3rem; max-width: 480px; width: calc(100% - 2rem); text-align: center; animation: modalIn 0.5s ease both; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        @keyframes modalIn { from{opacity:0;transform:scale(0.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .modal-emoji { font-size: 3.5rem; margin-bottom: 1rem; display: block; animation: wave 1s ease-in-out 0.5s 3; }
        @keyframes wave { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-20deg)} 75%{transform:rotate(20deg)} }
        .welcome-modal h2 { font-family: 'Nunito', sans-serif; font-size: 1.8rem; font-weight: 900; margin-bottom: 0.7rem; color: var(--ink); }
        .welcome-modal h2 span { color: var(--blue); }
        .welcome-modal p { color: var(--graphite); line-height: 1.7; margin-bottom: 2rem; font-size: 0.95rem; }
        .modal-btns { display: flex; gap: 1rem; }
        .modal-btn-skip { flex: 1; background: var(--mist); border: 1px solid var(--border); color: var(--graphite); border-radius: 14px; padding: 0.85rem; font-size: 0.92rem; cursor: pointer; transition: all 0.2s; font-family: 'Open Sans', sans-serif; }
        .modal-btn-skip:hover { border-color: var(--blue); color: var(--ink); }
        .modal-btn-tour { flex: 2; background: var(--blue); color: #fff; border: none; border-radius: 14px; padding: 0.85rem; font-size: 0.92rem; font-weight: 700; cursor: pointer; transition: all 0.3s; font-family: 'Open Sans', sans-serif; }
        .modal-btn-tour:hover { background: var(--azure); }

        .tour-overlay { position: fixed; inset: 0; z-index: 9998; pointer-events: none; }
        .spotlight { position: absolute; transition: all 0.5s cubic-bezier(0.4,0,0.2,1); border-radius: 16px; pointer-events: none; outline: 2px solid var(--blue); outline-offset: 3px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.4); }
        .tour-tooltip { position: absolute; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 1.5rem; width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); pointer-events: all; z-index: 9999; transition: all 0.4s; }
        .tooltip-step { color: var(--blue); font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem; }
        .tooltip-step-dots { display: flex; gap: 4px; margin-left: auto; }
        .tooltip-step-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); }
        .tooltip-step-dot.active { background: var(--blue); }
        .tour-tooltip h4 { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--ink); }
        .tour-tooltip p { color: var(--graphite); font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.2rem; }
        .tooltip-btns { display: flex; gap: 0.7rem; }
        .btn-skip { background: var(--mist); border: 1px solid var(--border); color: var(--graphite); border-radius: 10px; padding: 0.55rem 1rem; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .btn-skip:hover { border-color: var(--blue); color: var(--ink); }
        .btn-next { flex: 1; background: var(--blue); color: #fff; border: none; border-radius: 10px; padding: 0.55rem 1rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .btn-next:hover { background: var(--azure); }
      `}</style>

      <div className="welcome-page-container">
        {/* SIDEBAR */}
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon flex items-center justify-center"><Compass className="w-5 h-5 text-white animate-spin-slow" /></div>
            <div className="sidebar-logo-text">PathWise</div>
          </div>

          <div className="nav-section" id="nav-main">
            <div className="nav-label">Main</div>
            <Link to="/dashboard" className="nav-item active" id="nav-home"><span className="nav-icon flex items-center justify-center"><LayoutDashboard className="w-4 h-4" /></span> Dashboard</Link>
            <Link to="/quiz" className="nav-item" id="nav-quiz"><span className="nav-icon flex items-center justify-center"><ClipboardCheck className="w-4 h-4" /></span> Take Assessment <span className="nav-badge">NEW</span></Link>
            <Link to="/explore" className="nav-item" id="nav-explore"><span className="nav-icon flex items-center justify-center"><Compass className="w-4 h-4" /></span> Explore Careers</Link>
          </div>

          <div className="nav-section" style={{ marginTop: '0.5rem' }} id="nav-tools">
            <div className="nav-label">Tools</div>
            <Link to="/advisor" className="nav-item" id="nav-advisor"><span className="nav-icon flex items-center justify-center"><MessageSquare className="w-4 h-4" /></span> AI Advisor</Link>
            <Link to="/saved" className="nav-item" id="nav-saved"><span className="nav-icon flex items-center justify-center"><Bookmark className="w-4 h-4" /></span> Saved Careers</Link>
            <Link to="/profile" className="nav-item"><span className="nav-icon flex items-center justify-center"><User className="w-4 h-4" /></span> My Profile</Link>
          </div>

          <div className="sidebar-bottom">
            <div className="user-chip">
              <div className="user-avatar">{displayName.charAt(0)}</div>
              <div>
                <div className="user-name">{user?.fullName || 'User'}</div>
                <div className="user-level inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-[var(--blue)]" /> Level {level} Explorer</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="dash-main">
          <div className="topbar">
            <div className="topbar-left">
              <h1>Dashboard</h1>
              <p>Welcome to PathWise · {user?.matricNo || 'Your Matric No'}</p>
            </div>
            <div className="topbar-right">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`notif-btn relative cursor-pointer focus:outline-none ${showNotifications ? 'bg-[var(--mist)]' : ''}`}
                >
                  <Bell className="w-4 h-4 text-[var(--graphite)]" />
                  {unreadCount > 0 && <div className="notif-dot animate-pulse"></div>}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden z-50 p-1 text-left"
                      >
                        <div className="flex justify-between items-center p-3 border-b border-[var(--border)]">
                          <span className="text-xs font-bold text-[var(--ink)]">Notifications ({unreadCount})</span>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-[10px] text-[var(--blue)] hover:underline font-semibold"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-[var(--graphite)] text-xs">
                              All caught up! 🎉
                            </div>
                          ) : (
                            <div className="divide-y divide-[var(--border)]">
                              {notifications.map(n => (
                                <div 
                                  key={n.id} 
                                  className={`p-3 text-xs leading-relaxed flex items-start gap-2.5 transition-colors group/item relative ${n.read ? 'text-[var(--graphite)]' : 'text-[var(--ink)] bg-[var(--lavender)]'}`}
                                >
                                  {!n.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)] mt-1.5 shrink-0" />
                                  )}
                                  <div className="flex-1 cursor-pointer" onClick={() => toggleRead(n.id)}>
                                    <p>{n.text}</p>
                                    <span className="text-[10px] text-[var(--ash)] block mt-1">{n.time}</span>
                                  </div>
                                  <button 
                                    onClick={() => deleteNotif(n.id)}
                                    className="text-[var(--graphite)] hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="notif-btn cursor-pointer"><Settings className="w-4 h-4 text-[var(--graphite)]" /></div>
            </div>
          </div>

          <div className="dash-content">
            {/* Welcome banner */}
            <div className="welcome-banner" id="wb">
              <div className="wb-left">
                <h2>Good afternoon, {displayName} 👋</h2>
                <p>{user?.department || 'Department'} · {welcomeLevelText} · DELSU</p>
                <div className="xp-bar-wrap">
                  <div className="xp-label"><span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-[var(--blue)]" /> {xp} XP — Level {level}</span><span>{xpMax - xp} XP to Level {level + 1}</span></div>
                  <div className="xp-track"><div className="xp-fill" style={{ width: `${(xp / xpMax) * 100}%` }}></div></div>
                </div>
              </div>
              <div className="wb-right">
                <div className="level-badge inline-flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Level {level} Explorer</div>
                <div className="big-score">{topMatchScore}</div>
                <span>Top Match Score</span>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
              <div className="stat-card"><div className="stat-icon flex items-center justify-center"><Star className="w-5 h-5" /></div><div className="stat-value">{topMatchScore}</div><div className="stat-label">Best Career Match</div></div>
              <div className="stat-card"><div className="stat-icon flex items-center justify-center"><BookmarkCheck className="w-5 h-5" /></div><div className="stat-value">{careersSavedCount}</div><div className="stat-label">Saved Careers</div></div>
              <div className="stat-card"><div className="stat-icon flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div><div className="stat-value">{assessmentStatus}</div><div className="stat-label">Assessment Complete</div></div>
              <div className="stat-card"><div className="stat-icon flex items-center justify-center"><Map className="w-5 h-5" /></div><div className="stat-value">{roadmapsExploredCount}</div><div className="stat-label">Roadmaps Explored</div></div>
            </div>

            {/* Main grid */}
            <div className="main-grid">
              <div>
                <div className="card">
                  <h3 className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-[var(--blue)]" /> Your Top Career Matches</h3>
                  {matchedCareers.length > 0 ? (
                    matchedCareers.map((c, idx) => (
                      <div key={c.id} className="career-item">
                        <span className="career-icon flex items-center justify-center">
                          <Code className="w-5 h-5" />
                        </span>
                        <div className="career-info">
                          <div className="career-name">{c.title}</div>
                          <div className="career-field">{c.category}</div>
                          <div className="progress-mini">
                            <div className="progress-mini-fill" style={{ width: `${c.score}%`, background: idx === 1 ? 'var(--lavender)' : idx === 2 ? 'var(--azure)' : undefined }}></div>
                          </div>
                        </div>
                        <div className="career-score" style={{ color: idx === 1 ? 'var(--blue)' : idx === 2 ? 'var(--azure)' : undefined }}>{c.score}%</div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--graphite)] text-xs gap-3">
                      <Sparkles className="w-8 h-8 text-[var(--mist)]" />
                      <p>No matches yet. Take the Career Assessment to unlock your matches!</p>
                      <Link to="/quiz" className="px-4 py-2 rounded-xl bg-[var(--blue)] text-white font-bold hover:bg-[var(--azure)] transition-all">Take Assessment</Link>
                    </div>
                  )}
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div className="card">
                  <h3 className="flex items-center gap-2"><Compass className="w-5 h-5 text-[var(--blue)]" /> Quick Actions</h3>
                  <div className="tip-card">
                    <h4 className="flex items-center gap-2"><Brain className="w-4 h-4 text-[var(--blue)]" /> Ask the AI Advisor</h4>
                    <p>Get instant answers about careers, courses, and your next steps.</p>
                  </div>
                  {assessmentStatus === 'Pending' ? (
                    <Link to="/quiz" className="cta-start text-center">Start Career Assessment</Link>
                  ) : (
                    <Link to="/advisor" className="cta-start text-center" style={{ background: 'var(--blue)' }}>Talk to AI Advisor</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ WELCOME MODAL ══ */}
      {tourState === 'modal' && (
        <div className="welcome-modal-wrap" id="welcome-modal">
          <div className="welcome-modal">
            <span className="modal-emoji inline-flex items-center justify-center bg-[var(--lavender)] p-4 rounded-full mb-2 text-[var(--blue)]"><Sparkles className="w-8 h-8" /></span>
            <h2>Welcome to PathWise, <span>{displayName}!</span></h2>
            <p>Your account is all set up. PathWise will help you discover the perfect career path, get a semester-by-semester DELSU course roadmap, and access your AI advisor 24/7.<br/><br/>Would you like a quick 2-minute tour of the platform?</p>
            <div className="modal-btns">
              <button className="modal-btn-skip" onClick={skipTour}>Skip for Now</button>
              <button className="modal-btn-tour flex items-center gap-1.5 justify-center" onClick={startTour}><Target className="w-4 h-4" /> Take the Tour</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOUR OVERLAY ══ */}
      {tourState === 'tour' && (
        <div className="tour-overlay" style={{ pointerEvents: 'all' }}>
          <div className="spotlight" style={getSpotlightStyle()}></div>
          <div className="tour-tooltip" style={getTooltipStyle()}>
            <div className="tooltip-step">
              <span>Step {currentStep + 1} of {TOUR_STEPS.length}</span>
              <div className="tooltip-step-dots">
                {TOUR_STEPS.map((_, i) => (
                  <div key={i} className={`tooltip-step-dot ${i === currentStep ? 'active' : ''}`}></div>
                ))}
              </div>
            </div>
            <h4>{TOUR_STEPS[currentStep].title}</h4>
            <p>{TOUR_STEPS[currentStep].body}</p>
            <div className="tooltip-btns">
              <button className="btn-skip" onClick={skipTour}>✕ Skip Tour</button>
              <button className="btn-next flex items-center gap-1.5 justify-center" onClick={nextStep}>
                {currentStep === TOUR_STEPS.length - 1 ? <><Trophy className="w-4 h-4" /> Finish Tour</> : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WelcomePage;
