import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Brain, BookOpen, MessageSquare, BarChart2,
  ArrowRight, ChevronDown, GraduationCap, Briefcase, Compass,
  Zap, Shield, Target, GitCompare, Check, Sparkles
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

/* ─── Falling Glass Embers for Mobile ─── */
function Embers() {
  const embers = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * -15,
    drift: Math.random() * 40 - 20,
  }));
  return (
    <div className="embers-container" aria-hidden="true">
      {embers.map(e => (
        <div
          key={e.id}
          className="ember"
          style={{
            width: e.size, height: e.size,
            left: `${e.left}%`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            '--drift': `${e.drift}px`
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating Particles for Desktop ─── */
function Particles() {
  const colors = ['#4361EE', '#3B82F6', '#60A5FA', '#2563EB'];
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 16 + 10,
    delay: Math.random() * -15,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  return (
    <div className="particles-container" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle-dot"
          style={{
            width: p.size, height: p.size,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Typewriter Hook ─── */
function useTypewriter(words) {
  const elRef = useRef(null);
  useEffect(() => {
    let wIdx = 0, cIdx = 0, deleting = false, timerId;
    const el = elRef.current;
    if (!el) return;
    const tick = () => {
      const word = words[wIdx];
      if (!deleting) {
        el.textContent = word.slice(0, ++cIdx);
        if (cIdx === word.length) {
          deleting = true;
          timerId = setTimeout(tick, 2200);
          return;
        }
      } else {
        el.textContent = word.slice(0, --cIdx);
        if (cIdx === 0) {
          deleting = false;
          wIdx = (wIdx + 1) % words.length;
        }
      }
      timerId = setTimeout(tick, deleting ? 50 : 80);
    };
    timerId = setTimeout(tick, 900);
    return () => clearTimeout(timerId);
  }, [words]);
  return elRef;
}

/* ─── Scroll Reveal Wrapper ─── */
function Reveal({ children, delay = 0, yOffset = 24 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.45, 0.27, 0.9] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, watermark, title, desc, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="relative bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.08] hover:border-[#4361EE]/40 rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full group overflow-hidden">
        {/* Glow bar at top on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#4361EE] to-[#6080ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#4361EE]/10 border border-[#4361EE]/25 flex items-center justify-center text-[#6080ff] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#4361EE] group-hover:text-white shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-4xl font-black text-white/[0.04] select-none font-mono group-hover:text-[#4361EE]/15 transition-colors">
            {watermark}
          </span>
        </div>

        <h3 className="font-extrabold text-white text-lg mb-3 tracking-tight group-hover:text-[#93c5fd] transition-colors">
          {title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">
          {desc}
        </p>
      </div>
    </Reveal>
  );
}

/* ─── Audience Card ─── */
function AudienceCard({ icon: Icon, title, desc, bullets = [], delay }) {
  const splitTitle = title.split(' ');
  const watermark = (splitTitle[0]?.[0] || '') + (splitTitle[1]?.[0] || '');

  return (
    <Reveal delay={delay}>
      <div className="relative bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.08] hover:border-[#4361EE]/40 rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full group overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#4361EE] to-[#6080ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#4361EE]/10 border border-[#4361EE]/25 flex items-center justify-center text-[#6080ff] transition-all duration-300 group-hover:bg-[#4361EE] group-hover:text-white group-hover:scale-105 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-4xl font-black text-white/[0.04] select-none font-mono group-hover:text-[#4361EE]/15 transition-colors">
            {watermark}
          </span>
        </div>

        <h3 className="font-extrabold text-white text-xl mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed mb-6 flex-grow">
          {desc}
        </p>

        <div className="space-y-3 pt-5 border-t border-white/[0.06]">
          {bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs text-white/70 font-medium">
              <div className="w-4 h-4 rounded-full bg-[#4361EE]/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-[#6080ff]" />
              </div>
              <span className="leading-snug">{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ─── How It Works Step ─── */
function HowStep({ number, icon: Icon, title, desc, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="relative flex flex-col items-center text-center p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-[#4361EE]/30 transition-all h-full">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#4361EE]/10 border border-[#4361EE]/30 flex items-center justify-center">
            <Icon className="w-7 h-7 text-[#6080ff]" />
          </div>
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#4361EE] text-white text-xs font-bold font-mono flex items-center justify-center shadow-md">
            {number}
          </span>
        </div>
        <h3 className="font-bold text-white text-base mb-2">{title}</h3>
        <p className="text-white/60 text-xs leading-relaxed max-w-xs">{desc}</p>
      </div>
    </Reveal>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const typeRef = useTypewriter([
    'Perfect Career Path',
    'Ideal Future',
    'Dream Career',
    'Right Direction'
  ]);

  const features = [
    {
      icon: Brain,
      watermark: 'AI',
      title: 'AI-Powered Career Matching',
      desc: 'Our weighted scoring algorithm analyzes your academic strengths, interests, skills, and personality across 4 dimensions to calculate your best-fit career match with precision.',
    },
    {
      icon: BookOpen,
      watermark: 'CR',
      title: 'DELSU Course Roadmap',
      desc: 'Get a semester-by-semester course plan aligned with the Delta State University curriculum — from Year 1 all the way to graduation — tailored to your chosen career.',
    },
    {
      icon: MessageSquare,
      watermark: 'AA',
      title: 'AI Career Advisor',
      desc: 'Ask anything, anytime. Our intelligent AI advisor answers your career questions, compares paths, and generates personalized study plans — instantly.',
    },
    {
      icon: BarChart2,
      watermark: 'SA',
      title: 'Skill Gap Analyzer',
      desc: 'See exactly which skills you need to develop for your target career, with a visual gap analysis and actionable steps to close the gap faster.',
    },
  ];

  const howSteps = [
    { number: 1, icon: Target, title: 'Take the Assessment', desc: 'Answer 20 thoughtful questions about your strengths, interests, and goals. Takes under 5 minutes.' },
    { number: 2, icon: Brain, title: 'Get Your Match', desc: 'Our AI engine scores you across 30+ career paths and surfaces your top fits with confidence scores.' },
    { number: 3, icon: BookOpen, title: 'Follow Your Roadmap', desc: 'Get a personalized semester-by-semester DELSU course plan built around your matched career.' },
    { number: 4, icon: MessageSquare, title: 'Chat with AI Advisor', desc: 'Ask follow-up questions, compare career options, and get personalized advice from our AI.' },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: 'Current Students',
      desc: 'Get matched to your best career path and follow a DELSU-aligned course roadmap from your very first year to stay on track.',
      bullets: [
        'Semester-by-semester course plans',
        'Academic pre-requisite warnings',
        'Direct alignment with DELSU syllabus'
      ]
    },
    {
      icon: Briefcase,
      title: 'Fresh Graduates',
      desc: 'Translate your academic qualifications into targeted career options and start navigating local industries with confidence.',
      bullets: [
        'Local Nigerian industry mapping',
        'Personalized skill gap analyzers',
        'CV compatibility matching guidelines'
      ]
    },
    {
      icon: GitCompare,
      title: 'Career Switchers',
      desc: 'Identify transferable skill adjacencies and map out transitional milestones to pivot fields without starting from scratch.',
      bullets: [
        'Transferable skill adjacency reports',
        'Fast-track certification matching',
        'Targeted skill building guidelines'
      ]
    },
  ];

  return (
    <>
      <style>{`
        /* ─── MOBILE ORIGINAL STYLING (Preserved verbatim < 1024px) ─── */
        .land-wrapper {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          font-family: 'Inter', 'Open Sans', sans-serif;
          color: #ffffff;
          background-color: #0A0C16;
        }

        .land-bg {
          position: absolute;
          inset: -10%;
          background:
            url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80')
            center / cover no-repeat;
          z-index: 0;
          animation: kenBurns 20s ease-in-out infinite alternate;
        }

        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }

        .land-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(10, 12, 22, 0.05) 0%,
            rgba(10, 12, 22, 0.3) 30%,
            rgba(10, 12, 22, 0.85) 65%,
            rgba(10, 12, 22, 0.98) 100%
          );
        }

        .embers-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }
        .ember {
          position: absolute;
          top: -10px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(67, 97, 238, 0.8), 0 0 20px rgba(67, 97, 238, 0.4), inset 0 0 4px #ffffff;
          opacity: 0;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translateY(50vh) translateX(var(--drift)) scale(0.8); opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(105vh) translateX(calc(var(--drift) * 1.5)) scale(0.3); opacity: 0; }
        }

        .land-glass {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          min-height: 100dvh;
          width: 55%;
          max-width: 650px;
          margin-left: auto;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .land-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 2.5rem 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }

        .land-header-right a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .land-header-right a:hover { color: #fff; }

        .land-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 4rem 4rem 2rem;
          max-width: 500px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .land-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(67, 97, 238, 0.1);
          border: 1px solid rgba(67, 97, 238, 0.25);
          color: #4361EE;
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          width: fit-content;
        }

        .land-heading {
          font-family: 'Nunito', 'Outfit', sans-serif;
          font-size: 3rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        .land-heading span { color: #4361EE; }

        .land-sub {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .land-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .land-feature {
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
        }
        .land-feature-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4361EE;
          flex-shrink: 0;
        }
        .land-feature-text h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 0.2rem 0;
          color: #fff;
        }
        .land-feature-text p {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.45);
          margin: 0;
          line-height: 1.5;
        }

        .land-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .land-btn-fill {
          width: 100%;
          padding: 1rem;
          background: #4361EE;
          border: none;
          border-radius: 100px;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(67,97,238,0.3);
          position: relative;
          overflow: hidden;
        }
        .land-btn-fill:hover {
          background: #3651D4;
          box-shadow: 0 8px 35px rgba(67,97,238,0.5);
          transform: translateY(-2px) scale(1.02);
        }

        .land-btn-ghost {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 100px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .land-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }

        .land-mobile-logo { display: none; }

        @media (max-width: 768px) {
          .land-glass {
            width: 100%;
            max-width: 100%;
            background: rgba(13, 15, 28, 0.85);
            min-height: 100vh;
            min-height: 100dvh;
          }
          .land-header { display: none; }
          .land-mobile-logo {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .land-content {
            padding: max(2.5rem, env(safe-area-inset-top)) 1.5rem max(2.5rem, env(safe-area-inset-bottom));
            max-width: 100%;
          }
          .land-heading { font-size: clamp(1.85rem, 6.5vw, 2.3rem); }
          .land-sub { font-size: 0.9rem; margin-bottom: 2rem; }
          .land-features { gap: 1.15rem; margin-bottom: 2.25rem; }
          .land-bg::after {
            background: linear-gradient(to bottom, rgba(10,12,22,0.1) 0%, rgba(10,12,22,0.85) 50%, rgba(10,12,22,0.98) 100%);
          }
        }

        /* ─── DESKTOP SPECIFIC UTILITIES (≥ 1024px) ─── */
        .typewriter-text::after {
          content: '|';
          animation: twBlink 1s infinite;
          color: #4361EE;
          font-weight: 300;
          margin-left: 2px;
        }
        @keyframes twBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .particles-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .particle-dot {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          opacity: 0;
          box-shadow: 0 0 10px rgba(67, 97, 238, 0.4);
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          15% { opacity: 0.5; }
          85% { opacity: 0.4; }
          100% { transform: translateY(-105vh) scale(1.1); opacity: 0; }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW (PRESERVED VERBATIM - Strictly for screens < 1024px)       */}
      {/* ========================================================================= */}
      <div className="block lg:hidden">
        <div className="land-wrapper">
          <div className="land-bg"></div>
          <Embers />

          <header className="land-header">
            <div className="land-logo">
              <PathWiseLogo href="/" size={28} textColor="#ffffff" />
            </div>
            <div className="land-header-right">
              <Link to="/login">Sign In</Link>
            </div>
          </header>

          <motion.div
            className="land-glass"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="land-content">
              <div className="land-mobile-logo">
                <PathWiseLogo href="/" size={30} textColor="#ffffff" />
              </div>

              <motion.div
                className="land-badge"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Sparkles size={12} /> Mobile-First Design
              </motion.div>

              <motion.h1
                className="land-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Discover Your<br />
                <span>Perfect Career</span>
              </motion.h1>

              <motion.p
                className="land-sub"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Take the scientifically-backed RIASEC assessment and get AI-powered career matches tailored perfectly to your DELSU profile.
              </motion.p>

              <motion.div
                className="land-features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="land-feature">
                  <div className="land-feature-icon"><Brain size={18} /></div>
                  <div className="land-feature-text">
                    <h4>AI-Powered Matching</h4>
                    <p>Our algorithm matches your strengths to over 30+ career paths.</p>
                  </div>
                </div>
                <div className="land-feature">
                  <div className="land-feature-icon"><BookOpen size={18} /></div>
                  <div className="land-feature-text">
                    <h4>DELSU Roadmap</h4>
                    <p>Get a semester-by-semester course plan to keep you on track.</p>
                  </div>
                </div>
                <div className="land-feature">
                  <div className="land-feature-icon"><Target size={18} /></div>
                  <div className="land-feature-text">
                    <h4>Skill Gap Analysis</h4>
                    <p>See what skills you need to build to reach your dream job.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="land-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Link to="/register" className="land-btn-fill">
                  Get Started for Free
                </Link>
                <Link to="/login" className="land-btn-ghost">
                  I already have an account
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REFINED DESKTOP WEBSITE DISPLAY (Strictly for screens ≥ 1024px)        */}
      {/* ========================================================================= */}
      <div className="hidden lg:block min-h-screen bg-[#0A0C16] text-white selection:bg-[#4361EE] selection:text-white relative overflow-x-hidden">

        {/* Ambient Subtle Glow Orbs & Particles */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[25%] w-[600px] h-[600px] rounded-full bg-[#4361EE]/08 blur-[150px]" />
          <div className="absolute top-[45%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#3a0ca3]/10 blur-[160px]" />
        </div>
        <Particles />

        {/* ── STICKY TOP NAVBAR ────────────────────────────────────────────── */}
        <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0A0C16]/80 border-b border-white/[0.08]">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            
            <div className="flex items-center gap-3.5">
              <PathWiseLogo href="/" size={28} textColor="#ffffff" />
              <div className="h-4 w-[1px] bg-white/20" />
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/65">
                B.Sc. Final Year Project · DELSU
              </span>
            </div>

            <nav className="flex items-center gap-8 text-sm font-medium text-white/70">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#for-who" className="hover:text-white transition-colors">Who It's For</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-white/75 hover:text-white transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                to="/choice"
                className="px-5 py-2.5 rounded-full bg-[#4361EE] hover:bg-[#3651D4] text-white text-sm font-bold shadow-lg shadow-[#4361EE]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>

          </div>
        </header>

        {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
        <section className="relative z-10 min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-center px-6 pt-16 pb-20">

          {/* Academic Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-[#4361EE]/10 border border-[#4361EE]/30 text-[#6080ff] rounded-full px-4 py-1.5 text-xs font-semibold mb-8"
          >
            <GraduationCap className="w-4 h-4 text-[#4361EE]" />
            <span>B.Sc. Computer Science Final Year Project · Delta State University</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-outfit font-black text-5xl lg:text-6xl leading-[1.12] max-w-4xl text-white"
          >
            Discover Your<br />
            <span
              ref={typeRef}
              className="bg-gradient-to-r from-[#4361EE] via-[#6080ff] to-[#93c5fd] bg-clip-text text-transparent typewriter-text"
            />
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white/65 text-lg max-w-2xl leading-relaxed mt-6"
          >
            PathWise is an intelligent career advisory platform that analyzes your skills, personality,
            and academic strengths to connect you with the career you were born for — and the DELSU courses to get you there.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <Link
              to="/choice"
              className="group inline-flex items-center gap-2.5 text-white font-bold rounded-full px-8 py-4 text-base transition-all duration-300 shadow-xl shadow-[#4361EE]/30 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4361EE, #3651D4)' }}
            >
              <span>Start Your Assessment</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 bg-transparent text-white/80 border border-white/20 hover:border-white/40 hover:text-white font-semibold rounded-full px-8 py-4 text-base transition-all duration-300"
            >
              <span>Learn More</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex flex-col items-center gap-1.5 text-white/40 text-xs"
          >
            <span>Scroll to explore</span>
            <span className="animate-bounce text-base">↓</span>
          </motion.div>

        </section>

        {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
        <div className="relative z-10 border-y border-white/[0.08] bg-white/[0.01]">
          <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between">
            {[
              { num: '30+', label: 'Career Paths Covered' },
              { num: '6', label: 'RIASEC Dimensions' },
              { num: 'AI', label: 'Intelligent Advisor' },
              { num: 'DELSU', label: 'Curriculum Aligned' },
            ].map(s => (
              <div key={s.label} className="text-center flex-1">
                <div className="font-outfit text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#4361EE] to-[#6080ff] bg-clip-text text-transparent font-mono">
                  {s.num}
                </div>
                <div className="text-white/50 text-xs mt-1 font-medium tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT IS PATHWISE (FEATURES) ──────────────────────────────────── */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 py-24" id="features">
          <div className="text-center mb-16">
            <Reveal>
              <p className="text-[#6080ff] text-xs font-bold tracking-widest uppercase mb-3">What is PathWise?</p>
              <div className="w-12 h-1 rounded-full mb-6 mx-auto bg-gradient-to-r from-[#4361EE] to-[#6080ff]" />
              <h2 className="font-outfit font-extrabold text-3xl lg:text-4xl text-white mb-4">
                Your Intelligent Career Guide,<br />Built for Nigerian Students
              </h2>
              <p className="text-white/60 text-base leading-relaxed max-w-2xl mx-auto">
                PathWise isn't just another career assessment. It's a full intelligent advisory system that understands you — and maps your future.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.1} />
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="relative z-10 border-t border-white/[0.08] py-24 bg-[#0A0C16]/50" id="how-it-works">
          <div className="max-w-5xl mx-auto px-6">
            <Reveal>
              <div className="text-center mb-16">
                <p className="text-[#6080ff] text-xs font-bold tracking-widest uppercase mb-3">How it works</p>
                <div className="w-12 h-1 rounded-full mb-6 mx-auto bg-gradient-to-r from-[#4361EE] to-[#6080ff]" />
                <h2 className="font-outfit font-extrabold text-3xl lg:text-4xl text-white mb-3">
                  From Zero to Career Clarity<br />in 4 Simple Steps
                </h2>
                <p className="text-white/60 text-sm max-w-md mx-auto">
                  Takes less than 5 minutes to unlock your complete personalized DELSU academic roadmap.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-4 gap-6">
              {howSteps.map((s, i) => (
                <HowStep key={s.title} {...s} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT IS PATHWISE FOR? (AUDIENCE) ─────────────────────────────── */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 py-24" id="for-who">
          <div className="text-center mb-16">
            <Reveal>
              <p className="text-[#6080ff] text-xs font-bold tracking-widest uppercase mb-3">What is PathWise for?</p>
              <div className="w-12 h-1 rounded-full mb-6 mx-auto bg-gradient-to-r from-[#4361EE] to-[#6080ff]" />
              <h2 className="font-outfit font-extrabold text-3xl lg:text-4xl text-white mb-3">
                Tailored Solutions for Every Stage
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {audiences.map((a, i) => (
              <AudienceCard key={a.title} {...a} delay={i * 0.1} />
            ))}
          </div>
        </section>

        {/* ── TRUST BADGES ─────────────────────────────────────────────────── */}
        <section className="relative z-10 py-14 border-y border-white/[0.08] bg-white/[0.015]">
          <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-10">
            {[
              { icon: Zap, label: 'AI-Powered Advisor' },
              { icon: Shield, label: '100% Free for Students' },
              { icon: GraduationCap, label: 'DELSU Curriculum Aligned' },
              { icon: Compass, label: '30+ Career Paths' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-white/65 text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-[#4361EE]/10 border border-[#4361EE]/20 flex items-center justify-center text-[#6080ff]">
                  <Icon className="w-4 h-4" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BOTTOM ───────────────────────────────────────────────────── */}
        <section className="relative z-10 py-24 px-6 text-center overflow-hidden">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2 className="font-outfit font-black text-4xl lg:text-5xl text-white mb-5">
                Ready to Find Your Path?
              </h2>
              <p className="text-white/65 text-base max-w-md mx-auto leading-relaxed mb-8">
                Take the 5-minute assessment and get your personalized career match, course roadmap, and AI-powered guidance — completely free.
              </p>
              <Link
                to="/choice"
                className="inline-flex items-center gap-3 text-white font-bold rounded-full px-9 py-4 text-base transition-all duration-300 shadow-xl shadow-[#4361EE]/35 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #4361EE, #3651D4)' }}
              >
                <span>Get Started — It's Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-white/40 text-xs mt-4">No credit card required · Built for DELSU undergraduates</p>
            </Reveal>
          </div>
        </section>

        {/* ── DESKTOP FOOTER ───────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.08] bg-[#070810] py-12 text-white/60 text-xs relative z-10">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-between pb-8 border-b border-white/[0.06]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <PathWiseLogo href="/" size={24} textColor="#ffffff" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white/65 border border-white/10">
                    B.Sc. Final Year Project
                  </span>
                </div>
                <p className="text-white/45 text-[11px] max-w-md">
                  PathWise · B.Sc. Final Year Degree Project by Ifeanyi Wisdom (Matric: FOS/19/20/248102) · Department of Computer Science, Faculty of Computing, Delta State University (DELSU), Abraka.
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-white/70">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
                <a href="#for-who" className="hover:text-white transition-colors">Who It's For</a>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-white/40 text-[11px]">
              <div>© {new Date().getFullYear()} PathWise. Delta State University Undergraduate Degree Project. All rights reserved.</div>
              <div>Abraka, Delta State, Nigeria</div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;
