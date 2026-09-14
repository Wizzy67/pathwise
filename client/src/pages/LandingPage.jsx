import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      timerId = setTimeout(tick, deleting ? 45 : 75);
    };
    timerId = setTimeout(tick, 600);
    return () => clearTimeout(timerId);
  }, [words]);
  return elRef;
}

const CATCHY_TYPEWRITER_PHRASES = [
  'Before You Graduate.',
  'From Day One.',
  'With Total Confidence.',
  'Step by Step.'
];

const LandingPage = () => {
  const [matricInput, setMatricInput] = useState('');

  const typeRef = useTypewriter(CATCHY_TYPEWRITER_PHRASES);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered RIASEC Matching',
      desc: 'Our weighted algorithmic engine scores you across Holland\'s 6 personality dimensions and SCCT self-efficacy to recommend your highest-affinity career paths with confidence scores.',
    },
    {
      icon: BookOpen,
      title: 'DELSU Semester Course Roadmap',
      desc: 'Get a clear, semester-by-semester course sequencing plan aligned directly with the Delta State University academic catalog from 100L all the way to graduation.',
    },
    {
      icon: MessageSquare,
      title: 'Interactive AI Career Advisor',
      desc: 'Get instantaneous, contextual answers about SIWES industrial training placements, CGPA optimization, departmental electives, and industry technical certifications.',
    },
    {
      icon: BarChart2,
      title: 'Skill Gap & Readiness Analyzer',
      desc: 'Visualize the exact technical, analytical, and professional competencies required by Nigerian and global tech employers, with guided steps to close any gaps.',
    },
  ];

  const howSteps = [
    { number: '01', icon: Target, title: 'Take Assessment', desc: 'Answer 18 calibrated Likert-scale statements exploring your vocational inclinations and strengths in under 5 minutes.' },
    { number: '02', icon: Brain, title: 'Multi-Theory Scoring', desc: 'Our decision engine analyzes your responses using Holland\'s RIASEC model and your current academic level.' },
    { number: '03', icon: Zap, title: 'Explore Ranked Matches', desc: 'Review top career matches complete with compatibility percentages, expected salary ranges, and market demand.' },
    { number: '04', icon: BookOpen, title: 'Follow Your Roadmap', desc: 'Execute your custom semester-by-semester DELSU course schedule and targeted skill development milestones.' },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: 'Current Students',
      desc: 'Get matched to your best career path and follow a DELSU-aligned course roadmap from your very first semester to stay on track.',
      bullets: [
        'Semester-by-semester course plans',
        'Academic prerequisite bottleneck warnings',
        'Direct alignment with DELSU syllabus'
      ]
    },
    {
      icon: Briefcase,
      title: 'Graduating Finalists',
      desc: 'Translate your academic qualifications into targeted tech career options and navigate the graduate tech job market with confidence.',
      bullets: [
        'Nigerian & remote tech industry mapping',
        'Personalized skill gap analyzers',
        'Portfolio & CV compatibility guidelines'
      ]
    },
    {
      icon: GitCompare,
      title: 'Career Switchers',
      desc: 'Identify transferable skill adjacencies and map out transitional milestones to pivot fields without starting from scratch.',
      bullets: [
        'Transferable skill adjacency reports',
        'Fast-track certification matching',
        'Targeted practical project milestones'
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
          0% { transform: translateY(0) scale(1); opacity: 0; }
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

        /* ─── BRAND BLUE HERO + 3D ANIMATION STYLING (≥ 1024px) ─── */
        .brand-blue-wrapper {
          position: relative;
          background:
            radial-gradient(ellipse 90% 50% at 50% -10%, rgba(255, 255, 255, 0.12) 0%, transparent 70%),
            radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 85% 35%, rgba(65, 100, 185, 0.22) 0%, transparent 50%),
            linear-gradient(180deg, #1A346C 0%, #20428B 38%, #2A52A8 65%, #F8FAFC 98%, #F8FAFC 100%);
        }

        .credix-glass-pill {
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.32);
        }

        /* Typewriter Cursor */
        .typewriter-text::after {
          content: '|';
          animation: twBlink 1s infinite;
          color: #38BDF8;
          font-weight: 300;
          margin-left: 3px;
        }
        @keyframes twBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* 3D Perspective Floating Dashboard */
        .credix-perspective-scene {
          perspective: 1400px;
          perspective-origin: 50% 0%;
        }

        .credix-floating-frame {
          transform-style: preserve-3d;
          transform: rotateX(10deg) translateY(0px) scale(0.98);
          animation: credixLevitate 6s ease-in-out infinite alternate;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease;
        }

        .credix-floating-frame:hover {
          transform: rotateX(2deg) translateY(-8px) scale(1.005);
          box-shadow: 0 45px 100px -15px rgba(27, 55, 123, 0.28), 0 20px 45px -10px rgba(0, 0, 0, 0.14);
        }

        @keyframes credixLevitate {
          0% {
            transform: rotateX(11deg) translateY(0px) scale(0.98);
            box-shadow: 0 30px 75px -15px rgba(27, 55, 123, 0.22), 0 15px 35px -10px rgba(0, 0, 0, 0.1);
          }
          100% {
            transform: rotateX(6deg) translateY(-16px) scale(0.995);
            box-shadow: 0 45px 95px -15px rgba(27, 55, 123, 0.28), 0 20px 45px -10px rgba(0, 0, 0, 0.14);
          }
        }

        .credix-float-badge-1 {
          animation: badgeFloat1 5s ease-in-out infinite alternate;
        }
        @keyframes badgeFloat1 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }

        .credix-float-badge-2 {
          animation: badgeFloat2 5.5s ease-in-out infinite alternate-reverse;
        }
        @keyframes badgeFloat2 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }

        .credix-float-badge-3 {
          animation: badgeFloat3 6s ease-in-out infinite alternate;
        }
        @keyframes badgeFloat3 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-6px); }
        }

        .credix-card-clean {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .credix-card-clean:hover {
          border-color: #1944F1;
          transform: translateY(-3px);
          box-shadow: 0 16px 32px -8px rgba(25, 68, 241, 0.12);
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW (UNTOUCHED VERBATIM - Strictly for screens < 1024px)       */}
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
      {/* 2. REFINED BLUE BRAND DESKTOP DISPLAY (Screens ≥ 1024px)                  */}
      {/* ========================================================================= */}
      <div className="hidden lg:block min-h-screen bg-[#F8FAFC] text-[#111827] font-['Open_Sans',sans-serif] selection:bg-[#1944F1] selection:text-white relative overflow-x-hidden">

        {/* ── BRAND BLUE HERO WRAPPER ──────────────────────────────────────── */}
        <section className="brand-blue-wrapper pt-6 pb-24 px-8 relative overflow-hidden">

          {/* Floating Glass Top Navigation */}
          <header className="max-w-6xl mx-auto flex items-center justify-between py-3.5 px-8 rounded-full credix-glass-pill shadow-lg shadow-[#1A346C]/20 mb-14">
            
            {/* Logo + Final Year Project Tag */}
            <div className="flex items-center gap-3">
              <PathWiseLogo href="/" size={28} textColor="#ffffff" />
              <div className="h-4 w-[1px] bg-white/30" />
              <span className="text-[11px] font-semibold text-white/95 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/25">
                B.Sc. Final Year Project · DELSU
              </span>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-8 text-sm font-semibold text-white/95">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#for-who" className="hover:text-white transition-colors">Who It's For</a>
            </nav>

            {/* Action buttons */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-bold text-white hover:text-white/85 transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/choice"
                className="bg-white hover:bg-[#20428B] text-[#20428B] hover:text-white border border-transparent hover:border-white/30 px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          </header>

          {/* Hero Typography & CTA */}
          <div className="max-w-5xl mx-auto text-center flex flex-col items-center pt-4">
            
            {/* Academic badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/35 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-white" />
              <span>Delta State University · Dept. of Computer Science · Degree Project</span>
            </motion.div>

            {/* Catchy Animated Typewriter Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-['Nunito',sans-serif] font-black text-5xl lg:text-6xl text-white tracking-tight leading-[1.12] drop-shadow-sm max-w-4xl"
            >
              Know Your Destination<br />
              <span
                ref={typeRef}
                className="typewriter-text text-[#38BDF8]"
              />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-white/95 max-w-2xl leading-relaxed font-medium drop-shadow-sm"
            >
              Built specifically for Delta State University students. Take the scientifically validated RIASEC assessment to discover your ideal tech career and personalized semester course roadmap.
            </motion.p>

            {/* Capsule Input with Blue Hover Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col items-center gap-3 w-full"
            >
              <div className="inline-flex items-center p-1.5 pl-6 rounded-full credix-glass-pill shadow-2xl max-w-md w-full justify-between border border-white/30">
                <input
                  type="text"
                  placeholder="Enter your Matric No. or Email"
                  className="bg-transparent text-white placeholder-white/70 text-sm outline-none w-full pr-3 font-medium"
                  value={matricInput}
                  onChange={(e) => setMatricInput(e.target.value)}
                />
                <Link
                  to={matricInput ? `/register?id=${encodeURIComponent(matricInput)}` : '/choice'}
                  className="bg-white text-[#20428B] hover:bg-[#20428B] hover:text-white border border-transparent hover:border-white/40 px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap shadow-md transition-all duration-200 flex items-center gap-2 shrink-0 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
              <span className="text-xs text-white/85 font-medium drop-shadow-xs">
                100% Free for all DELSU undergraduates · Takes under 5 minutes
              </span>
            </motion.div>

            {/* ── THE CENTERPIECE: 3D ANIMATED FLOATING HIGH-RES USER DASHBOARD SHOWCASE ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="credix-perspective-scene mt-14 w-full max-w-5xl mx-auto px-2 relative"
            >
              <div className="credix-floating-frame relative">

                {/* Floating Chip 1 (Top-Left) */}
                <div className="credix-float-badge-1 absolute -top-4 -left-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-xl border border-blue-100 text-xs font-bold text-[#1944F1]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>94% Career Compatibility · RIASEC Engine</span>
                </div>

                {/* Floating Chip 2 (Top-Right) */}
                <div className="credix-float-badge-2 absolute -top-4 -right-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-xl border border-blue-100 text-xs font-bold text-[#111827]">
                  <GraduationCap className="w-4 h-4 text-[#1944F1]" />
                  <span>DELSU Syllabus Aligned · 100L - 400L</span>
                </div>

                {/* Application Window Frame */}
                <div className="rounded-[28px] overflow-hidden bg-white border border-white/80 shadow-[0_35px_90px_-15px_rgba(25,68,241,0.28),0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                  
                  {/* Chrome Browser Header Bar */}
                  <div className="h-10 bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                      <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                      <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    </div>
                    <div className="px-5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[11px] font-mono text-[#64748B] flex items-center gap-2 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>https://pathwise.delsu.edu.ng/dashboard</span>
                    </div>
                    <div className="w-10" />
                  </div>

                  {/* Enhanced 2x Crisp PathWise Dashboard Image */}
                  <div className="relative bg-[#F8FAFC] overflow-hidden">
                    <img
                      src="/dashboard-preview.png"
                      alt="PathWise Student Dashboard Interface"
                      className="w-full h-auto object-cover object-top block select-none pointer-events-none"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        filter: 'contrast(1.02) brightness(1.01)'
                      }}
                    />
                  </div>
                </div>

                {/* Floating Chip 3 (Bottom-Right) */}
                <div className="credix-float-badge-3 absolute -bottom-5 right-6 z-20 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-2xl border border-blue-100">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#1944F1]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#111827]">Live Career Decision Engine</div>
                    <div className="text-[11px] text-[#64748B]">Personalized to your CGPA & courses</div>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </section>

        {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
        <section className="py-12 bg-white border-b border-[#E2E8F0]">
          <div className="max-w-5xl mx-auto px-8 grid grid-cols-4 gap-8 text-center">
            {[
              { num: '30+', label: 'Tech & Science Career Tracks' },
              { num: '6', label: 'Holland RIASEC Dimensions' },
              { num: '100L–400L', label: 'DELSU Curriculum Syllabi' },
              { num: '100%', label: 'Free for Nigerian Undergraduates' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-['Nunito',sans-serif] text-3xl lg:text-4xl font-black text-[#1944F1] font-mono">
                  {s.num}
                </div>
                <div className="text-[#64748B] text-xs mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOUR CORE FEATURES ───────────────────────────────────────────── */}
        <section className="py-24 max-w-6xl mx-auto px-8" id="features">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1944F1] bg-[#EEF2FF] px-3.5 py-1 rounded-full border border-blue-100">
              System Capabilities
            </span>
            <h2 className="font-['Nunito',sans-serif] font-black text-4xl text-[#111827] mt-4 tracking-tight">
              Intelligent Career Guidance, Tailored for DELSU
            </h2>
            <p className="text-[#64748B] text-base mt-3 leading-relaxed">
              PathWise bridges the gap between university coursework and high-impact technology industries.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="credix-card-clean p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] border border-blue-100 flex items-center justify-center text-[#1944F1] mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-['Nunito',sans-serif] font-bold text-xl text-[#111827] mb-2.5">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center gap-2 text-xs font-bold text-[#1944F1]">
                    <span>Integrated with DELSU Syllabus</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="py-24 bg-[#FFFFFF] border-y border-[#E2E8F0]" id="how-it-works">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1944F1] bg-[#EEF2FF] px-3.5 py-1 rounded-full border border-blue-100">
                Simple Methodology
              </span>
              <h2 className="font-['Nunito',sans-serif] font-black text-4xl text-[#111827] mt-4 tracking-tight">
                From Assessment to Career Clarity in 4 Steps
              </h2>
              <p className="text-[#64748B] text-base mt-3">
                Complete our fast, validated assessment in under 5 minutes to unlock your full roadmap.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {howSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.number} className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col h-full hover:border-[#1944F1]/40 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] border border-blue-100 flex items-center justify-center text-[#1944F1]">
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xl font-black text-[#94A3B8]">{step.number}</span>
                    </div>
                    <h4 className="font-bold text-base text-[#111827] mb-2">{step.title}</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed flex-grow">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TARGET AUDIENCE CARDS ────────────────────────────────────────── */}
        <section className="py-24 max-w-6xl mx-auto px-8" id="for-who">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1944F1] bg-[#EEF2FF] px-3.5 py-1 rounded-full border border-blue-100">
              Student Segments
            </span>
            <h2 className="font-['Nunito',sans-serif] font-black text-4xl text-[#111827] mt-4 tracking-tight">
              Tailored Guidance for Every Stage at DELSU
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {audiences.map((a) => {
              const AudIcon = a.icon;
              return (
                <div key={a.title} className="credix-card-clean p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] border border-blue-100 flex items-center justify-center text-[#1944F1] mb-6">
                      <AudIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-['Nunito',sans-serif] font-bold text-xl text-[#111827] mb-2">
                      {a.title}
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                      {a.desc}
                    </p>
                    <div className="space-y-2.5 pt-4 border-t border-[#F1F5F9]">
                      {a.bullets.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-[#334155] font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── BOTTOM CTA BANNER (Atmospheric Blue) ─────────────────────────── */}
        <section className="py-20 px-8">
          <div className="max-w-5xl mx-auto rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl bg-gradient-to-r from-[#1A346C] via-[#20428B] to-[#2A52A8]">
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Delta State University Undergraduates</span>
              </span>

              <h2 className="font-['Nunito',sans-serif] font-black text-4xl lg:text-5xl leading-tight">
                Ready to Find Your Career Path?
              </h2>
              <p className="mt-4 text-base text-white/90 leading-relaxed max-w-xl mx-auto">
                Discover your RIASEC match, get your semester course plan, and chat with your AI advisor today.
              </p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <Link
                  to="/choice"
                  className="bg-white hover:bg-[#20428B] text-[#20428B] hover:text-white border border-transparent hover:border-white/40 px-8 py-4 rounded-full font-black text-base shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Your Assessment
                </Link>
                <Link
                  to="/login"
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-7 py-4 rounded-full font-bold text-sm transition-all"
                >
                  Sign In to Account
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ── DESKTOP FOOTER ───────────────────────────────────────────────── */}
        <footer className="border-t border-[#E2E8F0] bg-white py-12 text-xs text-[#64748B]">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex items-center justify-between pb-8 border-b border-[#F1F5F9]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <PathWiseLogo href="/" size={24} textColor="#111827" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] text-[#1944F1] border border-[#E2E8F0] font-bold">
                    B.Sc. Final Year Degree Project
                  </span>
                </div>
                <p className="text-[#64748B] text-xs max-w-lg leading-relaxed">
                  PathWise · B.Sc. Final Year Degree Project by Ifeanyi Wisdom (Matric: FOS/19/20/248102) · Department of Computer Science, Faculty of Computing, Delta State University (DELSU), Abraka.
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs font-semibold text-[#475569]">
                <a href="#features" className="hover:text-[#1944F1] transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-[#1944F1] transition-colors">How It Works</a>
                <a href="#for-who" className="hover:text-[#1944F1] transition-colors">Who It's For</a>
                <Link to="/login" className="hover:text-[#1944F1] transition-colors">Sign In</Link>
                <Link to="/choice" className="hover:text-[#1944F1] transition-colors">Assessment</Link>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-[#94A3B8] text-[11px]">
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
