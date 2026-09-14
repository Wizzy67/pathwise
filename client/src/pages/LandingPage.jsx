import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, BookOpen, MessageSquare, BarChart2,
  ArrowRight, ChevronDown, GraduationCap, Briefcase, Compass,
  Zap, Shield, Target, GitCompare, Check, Sparkles, Search, Bell,
  TrendingUp, Award, Layers, ExternalLink
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

const LandingPage = () => {
  const [matricInput, setMatricInput] = useState('');

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Career Matching',
      desc: 'Our weighted algorithmic scoring analyzes your academic strengths, interests, and personality across Holland\'s 6 RIASEC dimensions to calculate your best-fit career match with precision.',
    },
    {
      icon: BookOpen,
      title: 'DELSU Course Roadmap',
      desc: 'Get a semester-by-semester course plan aligned with the Delta State University curriculum — from 100L all the way to graduation — tailored to your chosen career path.',
    },
    {
      icon: MessageSquare,
      title: 'AI Career Advisor',
      desc: 'Ask anything, anytime. Our intelligent AI advisor answers your career inquiries, compares paths, and generates personalized study milestones for DELSU courses.',
    },
    {
      icon: BarChart2,
      title: 'Skill Gap Analyzer',
      desc: 'See exactly which technical and industry skills you need to develop for your target career, with actionable steps to prepare for SIWES and graduate opportunities.',
    },
  ];

  const howSteps = [
    { number: '01', icon: Target, title: 'Take Assessment', desc: 'Answer 18 calibrated Likert statements exploring your interests and strengths. Takes under 5 minutes.' },
    { number: '02', icon: Brain, title: 'Multi-Theory Scoring', desc: 'Our engine computes your Holland RIASEC code, SCCT self-efficacy, and academic alignment.' },
    { number: '03', icon: TrendingUp, title: 'Explore Ranked Matches', desc: 'Discover your top career matches with confidence scores, salary benchmarks, and local Nigerian market insights.' },
    { number: '04', icon: BookOpen, title: 'Follow Your Roadmap', desc: 'Execute your semester-by-semester DELSU course schedule and targeted skill goals.' },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: 'Current Students',
      desc: 'Get matched to your optimal career path and follow a DELSU-aligned course roadmap from Year 1 to graduation.',
      bullets: [
        'Semester-by-semester course plans',
        'Academic prerequisite planning',
        'Direct alignment with DELSU syllabus'
      ]
    },
    {
      icon: Briefcase,
      title: 'Graduating Finalists',
      desc: 'Translate your academic degree into targeted tech career options and prepare for national youth service & hiring.',
      bullets: [
        'Nigerian & remote tech industry mapping',
        'Personalized skill gap analyzers',
        'Portfolio & CV alignment guidance'
      ]
    },
    {
      icon: GitCompare,
      title: 'Career Switchers',
      desc: 'Identify transferable skill adjacencies and map out transitional milestones to pivot fields without restarting.',
      bullets: [
        'Transferable skill adjacency reports',
        'High-impact certification roadmaps',
        'Practical portfolio building tips'
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

        /* ─── CREDIX DESKTOP BLUE-SKY & CLOUD STYLING (≥ 1024px) ─── */
        .credix-hero-bg {
          position: relative;
          background:
            linear-gradient(to bottom, rgba(58, 125, 232, 0.65) 0%, rgba(90, 155, 248, 0.45) 45%, #f4f8fe 98%),
            url('https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1920&q=80') center top / cover no-repeat;
        }

        .credix-glass-pill {
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.35);
        }

        .credix-mockup-card {
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 35px 80px -20px rgba(18, 52, 120, 0.28), 0 10px 30px -10px rgba(0, 0, 0, 0.12);
        }

        .credix-card-surface {
          background: #ffffff;
          border: 1px solid #e2e8f4;
          border-radius: 24px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .credix-card-surface:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -15px rgba(59, 130, 246, 0.15);
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
      {/* 2. CREDIX-INSPIRED WHITE & BLUE DESKTOP DISPLAY (Screens ≥ 1024px)        */}
      {/* ========================================================================= */}
      <div className="hidden lg:block min-h-screen bg-[#f4f8fe] text-[#0f172a] font-['Inter',sans-serif] selection:bg-[#2563eb] selection:text-white relative overflow-x-hidden">

        {/* ── SKY HERO WRAPPER ─────────────────────────────────────────────── */}
        <section className="credix-hero-bg pt-6 pb-28 px-8 relative overflow-hidden">

          {/* Floating Glass Top Navigation */}
          <header className="max-w-6xl mx-auto flex items-center justify-between py-4 px-8 rounded-full credix-glass-pill shadow-lg shadow-[#1e3a8a]/10 mb-14">
            
            {/* Logo + Final Year Project Tag */}
            <div className="flex items-center gap-3">
              <PathWiseLogo href="/" size={28} textColor="#ffffff" />
              <div className="h-4 w-[1px] bg-white/30" />
              <span className="text-[11px] font-semibold text-white/90 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                B.Sc. Final Year Project · DELSU
              </span>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-8 text-sm font-semibold text-white/90">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#for-who" className="hover:text-white transition-colors">Who It's For</a>
            </nav>

            {/* Action buttons */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-bold text-white hover:text-white/80 transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/choice"
                className="bg-white hover:bg-white/95 text-[#1e40af] px-6 py-2.5 rounded-full font-extrabold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          </header>

          {/* Hero Typography & CTA */}
          <div className="max-w-5xl mx-auto text-center flex flex-col items-center pt-6">
            
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

            {/* Credix-style Bold Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-outfit font-black text-6xl lg:text-7xl text-white tracking-tight leading-[1.06] drop-shadow-sm max-w-4xl"
            >
              Your Ambition. Your Degree.<br />
              Your Future is here.
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

            {/* Credix-style Capsule Input / Action Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col items-center gap-3 w-full"
            >
              <div className="inline-flex items-center p-1.5 pl-6 rounded-full credix-glass-pill shadow-2xl max-w-md w-full justify-between">
                <input
                  type="text"
                  placeholder="Enter your Matric No. or Email"
                  className="bg-transparent text-white placeholder-white/70 text-sm outline-none w-full pr-3 font-medium"
                  value={matricInput}
                  onChange={(e) => setMatricInput(e.target.value)}
                />
                <Link
                  to={matricInput ? `/register?id=${encodeURIComponent(matricInput)}` : '/choice'}
                  className="bg-white hover:bg-white/95 text-[#1e40af] px-6 py-3 rounded-full font-black text-sm whitespace-nowrap shadow-md transition-all flex items-center gap-2 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <span className="text-xs text-white/80 font-medium drop-shadow-xs">
                100% Free for all DELSU undergraduates · Takes under 5 minutes
              </span>
            </motion.div>

            {/* ── THE CENTERPIECE: FLOATING DASHBOARD MOCKUP CARD ──────────── */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 w-full max-w-5xl credix-mockup-card p-6 lg:p-8 text-left relative overflow-hidden"
            >
              {/* Mock Dashboard Top Header Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-[#e8effc]">
                <div className="flex items-center gap-6 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#2563eb] flex items-center justify-center text-white font-black text-sm">
                      P
                    </div>
                    <span className="font-outfit font-extrabold text-[#0f172a] text-lg">PathWise</span>
                  </div>

                  {/* Mock Search Bar */}
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#f4f7fc] border border-[#e2e8f4] text-xs text-[#64748b] w-72">
                    <Search className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span>Search careers, courses, skills...</span>
                  </div>
                </div>

                {/* Mock User Area */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#f4f7fc] flex items-center justify-center text-[#64748b]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2.5 pl-2 border-l border-[#e2e8f4]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      IW
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-[#0f172a]">Ifeanyi Wisdom</div>
                      <div className="text-[#64748b] text-[11px]">DELSU · 400L Comp Sci</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Body Columns */}
              <div className="grid grid-cols-12 gap-6 pt-6">
                
                {/* Left Mini-Sidebar */}
                <div className="col-span-3 space-y-1.5 pr-4 border-r border-[#e8effc]">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94a3b8] px-3 mb-2">Navigation</div>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#2563eb]/10 text-[#2563eb] font-bold text-xs">
                    <Compass className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[#64748b] hover:bg-[#f8fafc] font-semibold text-xs">
                    <Briefcase className="w-4 h-4" />
                    <span>Career Explorer</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[#64748b] hover:bg-[#f8fafc] font-semibold text-xs">
                    <BookOpen className="w-4 h-4" />
                    <span>Course Roadmap</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[#64748b] hover:bg-[#f8fafc] font-semibold text-xs">
                    <MessageSquare className="w-4 h-4" />
                    <span>AI Advisor</span>
                  </div>
                </div>

                {/* Center Main Match Card */}
                <div className="col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#f8fafc] border border-[#dbeafe]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#2563eb] text-white px-2.5 py-0.5 rounded-full">
                        Top Career Match · 94%
                      </span>
                      <span className="font-mono text-xs font-bold text-[#2563eb]">Holland: IRC</span>
                    </div>
                    <h4 className="font-outfit font-black text-xl text-[#0f172a]">
                      Cloud & Distributed Systems Architect
                    </h4>
                    <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                      High alignment with your Investigative and Realistic problem-solving dimensions.
                    </p>
                    <div className="mt-4 pt-3 border-t border-[#dbeafe] flex items-center justify-between text-xs">
                      <span className="text-[#64748b]">Nigerian Industry Benchmark</span>
                      <span className="font-bold text-[#0f172a]">₦8,500,000 – ₦18,000,000 / yr</span>
                    </div>
                  </div>

                  {/* Mini RIASEC Traits Strip */}
                  <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#e2e8f4]">
                    <div className="text-xs font-bold text-[#0f172a] mb-2.5">Holland RIASEC Dimension Scores</div>
                    <div className="grid grid-cols-6 gap-2 text-center">
                      {[
                        { k: 'R', val: 82, l: 'Realistic' },
                        { k: 'I', val: 94, l: 'Investigative' },
                        { k: 'A', val: 58, l: 'Artistic' },
                        { k: 'S', val: 42, l: 'Social' },
                        { k: 'E', val: 68, l: 'Enterprising' },
                        { k: 'C', val: 88, l: 'Conventional' },
                      ].map(t => (
                        <div key={t.k} className="flex flex-col items-center gap-1">
                          <div className="w-full h-12 bg-[#f1f5f9] rounded-lg p-1 flex flex-col justify-end">
                            <div
                              className="w-full rounded-md bg-gradient-to-t from-[#2563eb] to-[#60a5fa]"
                              style={{ height: `${t.val}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-[#0f172a]">{t.k}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Roadmap & Academic Standing */}
                <div className="col-span-4 space-y-4">
                  {/* Semester Courses Card */}
                  <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f4]">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-[#0f172a]">DELSU Semester Roadmap</span>
                      <span className="text-[10px] font-semibold text-[#2563eb] bg-[#dbeafe] px-2 py-0.5 rounded-md">400 Level</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-[#e2e8f4] flex justify-between items-center">
                        <div>
                          <div className="font-bold text-[#0f172a]">CSC 401</div>
                          <div className="text-[10px] text-[#64748b]">Artificial Intelligence</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Core · 3U</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#e2e8f4] flex justify-between items-center">
                        <div>
                          <div className="font-bold text-[#0f172a]">CSC 411</div>
                          <div className="text-[10px] text-[#64748b]">Distributed Computing</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Core · 3U</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#e2e8f4] flex justify-between items-center">
                        <div>
                          <div className="font-bold text-[#0f172a]">CSC 499</div>
                          <div className="text-[10px] text-[#64748b]">Final Year Degree Project</div>
                        </div>
                        <span className="text-[10px] font-bold text-[#2563eb] bg-[#dbeafe] px-2 py-0.5 rounded">6 Units</span>
                      </div>
                    </div>
                  </div>

                  {/* Advisor Tip Chip */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-xs space-y-1 shadow-md shadow-[#2563eb]/20">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI Career Advisor Insight</span>
                    </div>
                    <p className="text-[11px] text-white/90 leading-snug">
                      Your high investigative score pairs directly with systems engineering. Start building distributed prototypes before graduation.
                    </p>
                  </div>
                </div>

              </div>

            </motion.div>

          </div>
        </section>

        {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
        <section className="py-12 bg-white border-b border-[#e2e8f4]">
          <div className="max-w-5xl mx-auto px-8 grid grid-cols-4 gap-8 text-center">
            {[
              { num: '30+', label: 'Tech & Science Career Tracks' },
              { num: '6', label: 'Holland RIASEC Dimensions' },
              { num: '100L–400L', label: 'DELSU Curriculum Syllabi' },
              { num: '100%', label: 'Free for Nigerian Undergraduates' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-outfit text-3xl lg:text-4xl font-black text-[#1e40af] font-mono">
                  {s.num}
                </div>
                <div className="text-[#64748b] text-xs mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOUR CORE FEATURES ───────────────────────────────────────────── */}
        <section className="py-24 max-w-6xl mx-auto px-8" id="features">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563eb] bg-[#dbeafe] px-3 py-1 rounded-full">
              System Capabilities
            </span>
            <h2 className="font-outfit font-black text-4xl text-[#0f172a] mt-4 tracking-tight">
              Intelligent Career Guidance, Tailored for DELSU
            </h2>
            <p className="text-[#64748b] text-base mt-3 leading-relaxed">
              PathWise bridges the gap between university coursework and high-impact technology industries.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="credix-card-surface p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#2563eb] mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-outfit font-bold text-xl text-[#0f172a] mb-2.5">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#64748b] leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#f1f5f9] flex items-center gap-2 text-xs font-bold text-[#2563eb]">
                    <span>Integrated with DELSU Syllabus</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="py-24 bg-[#ffffff] border-y border-[#e2e8f4]" id="how-it-works">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563eb] bg-[#dbeafe] px-3 py-1 rounded-full">
                Simple Methodology
              </span>
              <h2 className="font-outfit font-black text-4xl text-[#0f172a] mt-4 tracking-tight">
                From Assessment to Career Clarity in 4 Steps
              </h2>
              <p className="text-[#64748b] text-base mt-3">
                Complete our fast, validated assessment in under 5 minutes to unlock your full roadmap.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {howSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.number} className="p-6 rounded-2xl bg-[#f8fafc] border border-[#e2e8f4] flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#2563eb]">
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xl font-black text-[#94a3b8]">{step.number}</span>
                    </div>
                    <h4 className="font-bold text-base text-[#0f172a] mb-2">{step.title}</h4>
                    <p className="text-xs text-[#64748b] leading-relaxed flex-grow">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TARGET AUDIENCE CARDS ────────────────────────────────────────── */}
        <section className="py-24 max-w-6xl mx-auto px-8" id="for-who">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563eb] bg-[#dbeafe] px-3 py-1 rounded-full">
              Student Segments
            </span>
            <h2 className="font-outfit font-black text-4xl text-[#0f172a] mt-4 tracking-tight">
              Tailored Guidance for Every Stage at DELSU
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {audiences.map((a) => {
              const AudIcon = a.icon;
              return (
                <div key={a.title} className="credix-card-surface p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#2563eb] mb-6">
                      <AudIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-outfit font-bold text-xl text-[#0f172a] mb-2">
                      {a.title}
                    </h3>
                    <p className="text-xs text-[#64748b] leading-relaxed mb-6">
                      {a.desc}
                    </p>
                    <div className="space-y-2.5 pt-4 border-t border-[#f1f5f9]">
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

        {/* ── BOTTOM CTA BANNER (Atmospheric Sky Glow) ─────────────────────── */}
        <section className="py-20 px-8">
          <div className="max-w-5xl mx-auto rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#3b82f6]">
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Delta State University Undergraduates</span>
              </span>

              <h2 className="font-outfit font-black text-4xl lg:text-5xl leading-tight">
                Ready to Find Your Career Path?
              </h2>
              <p className="mt-4 text-base text-white/90 leading-relaxed max-w-xl mx-auto">
                Discover your RIASEC match, get your semester course plan, and chat with your AI advisor today.
              </p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <Link
                  to="/choice"
                  className="bg-white hover:bg-white/95 text-[#1e40af] px-8 py-4 rounded-full font-black text-base shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        <footer className="border-t border-[#e2e8f4] bg-white py-12 text-xs text-[#64748b]">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex items-center justify-between pb-8 border-b border-[#f1f5f9]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <PathWiseLogo href="/" size={24} textColor="#0f172a" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f1f5f9] text-[#1e40af] border border-[#e2e8f4] font-bold">
                    B.Sc. Final Year Degree Project
                  </span>
                </div>
                <p className="text-[#64748b] text-xs max-w-lg leading-relaxed">
                  PathWise · B.Sc. Final Year Degree Project by Ifeanyi Wisdom (Matric: FOS/19/20/248102) · Department of Computer Science, Faculty of Computing, Delta State University (DELSU), Abraka.
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs font-semibold text-[#475569]">
                <a href="#features" className="hover:text-[#2563eb] transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-[#2563eb] transition-colors">How It Works</a>
                <a href="#for-who" className="hover:text-[#2563eb] transition-colors">Who It's For</a>
                <Link to="/login" className="hover:text-[#2563eb] transition-colors">Sign In</Link>
                <Link to="/choice" className="hover:text-[#2563eb] transition-colors">Assessment</Link>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-[#94a3b8] text-[11px]">
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
