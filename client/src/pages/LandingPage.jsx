import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Brain, BookOpen, Target, Sparkles, LogIn, ArrowRight, ChevronDown,
  GraduationCap, Briefcase, Compass, GitCompare, Check, Award, School,
  UserCheck, FileText, Layers, ExternalLink, ShieldCheck, ChevronRight,
  TrendingUp, Code, Database, Cpu, MessageSquare, BarChart2
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

/* ─── Falling Glass Embers ─── */
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

/* ─── Desktop Typewriter Hook ─── */
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
    timerId = setTimeout(tick, 800);
    return () => clearTimeout(timerId);
  }, [words]);
  return elRef;
}

/* ─── Scroll Reveal Wrapper ─── */
function Reveal({ children, delay = 0, yOffset = 25 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.45, 0.27, 0.9] }}
    >
      {children}
    </motion.div>
  );
}

const LandingPage = () => {
  const typeRef = useTypewriter([
    'High-Growth Tech Career',
    'Fulfilling Life Trajectory',
    'Personalized DELSU Roadmap',
    'Globally Competitive Future'
  ]);

  const features = [
    {
      icon: Brain,
      watermark: 'AI',
      badge: 'Psychometric Engine',
      title: 'AI-Powered Career Matching',
      desc: 'Our weighted algorithmic scoring models your responses against Holland\'s 6 RIASEC dimensions and SCCT self-efficacy to pinpoint your top-fit careers among 30+ modern professions.'
    },
    {
      icon: BookOpen,
      watermark: 'CR',
      badge: 'DELSU Syllabus',
      title: 'Semester Course Roadmaps',
      desc: 'Directly aligned with the Delta State University academic curriculum. Get an actionable 100L through 400L course sequencing breakdown with prerequisites and credit distribution guidance.'
    },
    {
      icon: MessageSquare,
      watermark: 'AA',
      badge: '24/7 Intelligent Guidance',
      title: 'Interactive AI Career Advisor',
      desc: 'Have questions about SIWES industrial training placements, CGPA requirements, or industry certifications? Our dedicated AI Advisor delivers instantaneous contextual recommendations.'
    },
    {
      icon: BarChart2,
      watermark: 'SA',
      badge: 'Targeted Growth',
      title: 'Skill Gap & Readiness Analyzer',
      desc: 'Benchmark your current technical, analytical, and interpersonal capabilities against real-world employer requirements in the Nigerian and global technology ecosystems.'
    }
  ];

  const howSteps = [
    {
      number: '01',
      icon: Target,
      title: 'Take the Assessment',
      desc: 'Complete 18 calibrated Likert-scale statements exploring your vocational inclinations, interests, and academic comfort.'
    },
    {
      number: '02',
      icon: Cpu,
      title: 'Algorithmic Multi-Theory Scoring',
      desc: 'Our decision engine analyzes your responses using Holland\'s RIASEC model, SCCT self-efficacy, and your current CGPA.'
    },
    {
      number: '03',
      icon: TrendingUp,
      title: 'Discover Top Career Matches',
      desc: 'Explore ranked career recommendations complete with match confidence percentages, expected salaries, and market trends.'
    },
    {
      number: '04',
      icon: BookOpen,
      title: 'Follow Your DELSU Roadmap',
      desc: 'Implement your personalized semester-by-semester study and skill development roadmap from matriculation to graduation.'
    }
  ];

  const levelGuides = [
    {
      level: '100 Level',
      title: 'Foundation & Discovery',
      tag: 'Freshers',
      desc: 'Build foundational mastery, clarify technical passions early, and establish a high-CGPA academic trajectory right from year one.',
      points: [
        'Core mathematics and introductory programming alignment',
        'Early identification of natural vocational inclinations',
        'Academic prerequisite planning to prevent bottlenecks'
      ]
    },
    {
      level: '200 Level',
      title: 'Field Specialization',
      tag: 'Sophomores',
      desc: 'Narrow down your tech focus into specialized domains such as Software Engineering, Cybersecurity, Data Science, or AI.',
      points: [
        'Exploration of technical tracks and practical tools',
        'Foundational extracurricular project development',
        'Benchmarking course performance against career goals'
      ]
    },
    {
      level: '300 Level',
      title: 'SIWES & Practical Mastery',
      tag: 'Industrial Training',
      desc: 'Prepare for your mandatory 6-month SIWES industrial training with a targeted technical skillset, resume, and portfolio.',
      points: [
        'Industry-tailored skill gap remediation',
        'SIWES internship targeting and placement alignment',
        'Hands-on portfolio building for real-world employers'
      ]
    },
    {
      level: '400 Level',
      title: 'Final Project & Transition',
      tag: 'Graduating Class',
      desc: 'Deliver a high-impact final year project, prepare for NYSC, and transition smoothly into competitive entry-level tech roles.',
      points: [
        'Final Year Project topic selection & research guidance',
        'Industry CV tailoring and technical interview prep',
        'Post-graduation career roadmap and graduate schemes'
      ]
    }
  ];

  return (
    <>
      <style>{`
        /* ─── MOBILE ORIGINAL STYLING (VERBATIM FOR SCREENS < 1024px) ─── */
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
          0% { 
            transform: translateY(0) translateX(0) scale(1); 
            opacity: 0; 
          }
          10% { opacity: 0.8; }
          50% { 
            transform: translateY(50vh) translateX(var(--drift)) scale(0.8); 
            opacity: 1; 
          }
          90% { opacity: 0.6; }
          100% { 
            transform: translateY(105vh) translateX(calc(var(--drift) * 1.5)) scale(0.3); 
            opacity: 0; 
          }
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
        .land-header-right a:hover {
          color: #fff;
        }

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
        .land-heading span {
          color: #4361EE;
        }

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
        .land-btn-fill::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
          transition: transform 0.6s;
          transform: translateX(-100%);
        }
        .land-btn-fill:hover::before { transform: translateX(100%); }
        .land-btn-fill:hover {
          background: #3651D4;
          box-shadow: 0 8px 35px rgba(67,97,238,0.5);
          transform: translateY(-2px) scale(1.02);
        }
        .land-btn-fill:active {
          transform: scale(0.98);
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
        .land-btn-ghost:active {
          transform: scale(0.98);
          background: rgba(255, 255, 255, 0.12);
        }

        .land-mobile-logo {
          display: none;
        }

        @media (max-width: 768px) {
          .land-glass {
            width: 100%;
            max-width: 100%;
            background: rgba(13, 15, 28, 0.85);
            min-height: 100vh;
            min-height: 100dvh;
          }
          .land-header {
            display: none;
          }
          .land-logo-text { display: none; }
          
          .land-mobile-logo {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .land-content {
            padding: max(2.5rem, env(safe-area-inset-top)) 1.5rem max(2.5rem, env(safe-area-inset-bottom));
            max-width: 100%;
          }
          .land-heading {
            font-size: clamp(1.85rem, 6.5vw, 2.3rem);
          }
          .land-sub {
            font-size: 0.9rem;
            margin-bottom: 2rem;
          }
          .land-features {
            gap: 1.15rem;
            margin-bottom: 2.25rem;
          }
          
          .land-bg::after {
            background: linear-gradient(to bottom, rgba(10,12,22,0.1) 0%, rgba(10,12,22,0.85) 50%, rgba(10,12,22,0.98) 100%);
          }
        }

        /* ─── DESKTOP SPECIFIC ANIMATIONS & UTILITIES (≥ 1024px) ─── */
        .dt-typewriter::after {
          content: '|';
          animation: dtBlink 1s infinite;
          color: #4361EE;
          font-weight: 300;
          margin-left: 4px;
        }
        @keyframes dtBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .dt-glass-card {
          background: rgba(255, 255, 255, 0.025);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dt-glass-card:hover {
          border-color: rgba(67, 97, 238, 0.35);
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -15px rgba(67, 97, 238, 0.12);
        }

        .dt-primary-btn {
          background: linear-gradient(135deg, #4361EE 0%, #3a0ca3 100%);
          box-shadow: 0 8px 24px -6px rgba(67, 97, 238, 0.5);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dt-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -4px rgba(67, 97, 238, 0.7);
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
      {/* 2. MODERN DESKTOP WEBSITE DISPLAY (Strictly for screens ≥ 1024px)         */}
      {/* ========================================================================= */}
      <div className="hidden lg:block min-h-screen bg-[#070913] text-white selection:bg-[#4361EE] selection:text-white relative overflow-x-hidden">
        
        {/* Ambient Glowing Radial Orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#4361EE]/10 blur-[140px]" />
          <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#3a0ca3]/15 blur-[160px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#4cc9f0]/08 blur-[150px]" />
        </div>

        {/* ── STICKY TOP DESKTOP NAVIGATION ──────────────────────────────────── */}
        <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0A0C16]/85 border-b border-white/[0.08] transition-all">
          <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
            
            {/* Brand Logo & Academic Tag */}
            <div className="flex items-center gap-4">
              <PathWiseLogo href="/" size={30} textColor="#ffffff" />
              <div className="h-5 w-[1px] bg-white/20" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70 tracking-wide">
                DELSU B.Sc. Degree Project
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center gap-8 text-sm font-medium text-white/70">
              <a href="#overview" className="hover:text-white transition-colors">Overview</a>
              <a href="#academic-project" className="hover:text-[#6080ff] transition-colors flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-[#4361EE]" />
                Researcher Dossier
              </a>
              <a href="#features" className="hover:text-white transition-colors">Core Pillars</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">Methodology</a>
              <a href="#student-levels" className="hover:text-white transition-colors">Curriculum Levels</a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-white/80 hover:text-white px-4 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="dt-primary-btn text-sm font-bold text-white px-6 py-2.5 rounded-full flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </header>

        {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
        <section id="overview" className="relative z-10 pt-20 pb-24 px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
            
            {/* Final Year Project Academic Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#4361EE]/10 border border-[#4361EE]/30 text-[#6080ff] text-xs font-bold uppercase tracking-wider mb-8 shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-[#4361EE]" />
              <span>Delta State University, Abraka · Dept. of Computer Science · Final Year Project</span>
            </motion.div>

            {/* Main Punchy Heading with Animated Typewriter */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-6xl font-black text-white leading-[1.14] tracking-tight max-w-5xl"
            >
              AI-Powered Academic & Career Pathway System for DELSU Undergraduates
            </motion.h1>

            {/* Sub-headline displaying dynamic focus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-2xl lg:text-3xl font-extrabold text-white/90"
            >
              Guiding Your Journey Toward a{' '}
              <span
                ref={typeRef}
                className="dt-typewriter bg-gradient-to-r from-[#4361EE] via-[#6080ff] to-[#93c5fd] bg-clip-text text-transparent"
              />
            </motion.div>

            {/* Academic Lead Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-base lg:text-lg text-white/60 max-w-3xl leading-relaxed"
            >
              PathWise is an intelligent decision support system designed and engineered to bridge Nigerian university curricula, validated Holland RIASEC psychometrics, and high-growth industry demands. Developed specifically to guide Delta State University students from 100 Level through graduation.
            </motion.p>

            {/* Primary Action Button Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-5 flex-wrap"
            >
              <Link
                to="/register"
                className="dt-primary-btn text-base font-bold text-white px-8 py-4 rounded-full flex items-center gap-3"
              >
                <span>Take Career Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/choice"
                className="px-8 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white font-bold text-base transition-all flex items-center gap-2.5 backdrop-blur-sm"
              >
                <Compass className="w-5 h-5 text-[#6080ff]" />
                <span>Explore Careers & Roadmap</span>
              </Link>
              <a
                href="#academic-project"
                className="px-6 py-4 text-white/60 hover:text-white font-medium text-sm transition-colors flex items-center gap-2"
              >
                <School className="w-4 h-4 text-[#4361EE]" />
                <span>Project Credentials</span>
              </a>
            </motion.div>

            {/* Quick Metrics & System Highlights Strip */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-16 w-full max-w-4xl p-6 rounded-3xl bg-white/[0.025] border border-white/[0.07] backdrop-blur-md grid grid-cols-4 gap-6 text-left"
            >
              <div className="border-r border-white/10 pr-4">
                <div className="text-3xl font-black text-white font-mono">6</div>
                <div className="text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">RIASEC Dimensions</div>
                <div className="text-[11px] text-[#6080ff] mt-0.5">Holland Code Model</div>
              </div>
              <div className="border-r border-white/10 pr-4">
                <div className="text-3xl font-black text-white font-mono">30+</div>
                <div className="text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">Career Tracks</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">Tech & Applied Sciences</div>
              </div>
              <div className="border-r border-white/10 pr-4">
                <div className="text-3xl font-black text-white font-mono">100L–400L</div>
                <div className="text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">DELSU Syllabi</div>
                <div className="text-[11px] text-[#6080ff] mt-0.5">Course Prerequisite Trees</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white font-mono">100%</div>
                <div className="text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">Student-First</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">Free Academic Tool</div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── ACADEMIC RESEARCH & PROJECT SPECIFICATIONS ─────────────────────── */}
        <section id="academic-project" className="py-24 border-t border-white/[0.08] relative z-10 bg-gradient-to-b from-transparent via-[#0A0C16]/50 to-transparent">
          <div className="max-w-6xl mx-auto px-8">
            
            <Reveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Award className="w-3.5 h-3.5" />
                  <span>Academic Certification & Research Dossier</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Undergraduate Final Year Degree Project
                </h2>
                <p className="mt-3 text-sm lg:text-base text-white/60 leading-relaxed">
                  PathWise was conceived, designed, and implemented to satisfy the academic requirements for the award of Bachelor of Science (B.Sc. Hons) Degree in Computer Science at Delta State University (DELSU), Abraka.
                </p>
              </div>
            </Reveal>

            {/* 3 Research Cards */}
            <div className="grid grid-cols-3 gap-6">
              
              {/* Card 1: Student Researcher Details */}
              <Reveal delay={0.1}>
                <div className="dt-glass-card p-8 rounded-3xl h-full flex flex-col justify-between border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-3.5 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#4361EE]/15 border border-[#4361EE]/30 flex items-center justify-center text-[#4361EE]">
                        <School className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Researcher Information</h3>
                        <p className="text-xs text-white/50">Department of Computer Science</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between py-2 border-b border-white/[0.06]">
                        <span className="text-white/50">Student Name</span>
                        <span className="font-bold text-white text-sm">Ifeanyi Wisdom</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/[0.06]">
                        <span className="text-white/50">Matriculation No.</span>
                        <span className="font-mono font-bold text-[#6080ff] bg-[#4361EE]/10 px-2 py-0.5 rounded border border-[#4361EE]/20">
                          FOS/19/20/248102
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/[0.06]">
                        <span className="text-white/50">Degree In View</span>
                        <span className="font-semibold text-white">B.Sc. (Hons) Computer Science</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/[0.06]">
                        <span className="text-white/50">Faculty</span>
                        <span className="text-white/90">Faculty of Computing</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/[0.06]">
                        <span className="text-white/50">Institution</span>
                        <span className="text-white/90">Delta State University (DELSU)</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white/50">Location</span>
                        <span className="text-white/70">Abraka, Delta State, Nigeria</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" /> Verified B.Sc. Degree Project Submission
                  </div>
                </div>
              </Reveal>

              {/* Card 2: Multi-Theory Architecture */}
              <Reveal delay={0.2}>
                <div className="dt-glass-card p-8 rounded-3xl h-full flex flex-col justify-between border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-3.5 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#4cc9f0]/15 border border-[#4cc9f0]/30 flex items-center justify-center text-[#4cc9f0]">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Theoretical Framework</h3>
                        <p className="text-xs text-white/50">Triple-Engine Synthesis</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs text-white/70 leading-relaxed">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-[#4361EE]" />
                          Holland's RIASEC Theory (1959)
                        </div>
                        <p className="text-[11px] text-white/55">
                          Evaluates personality-environment fit across 6 dimensions (Realistic, Investigative, Artistic, Social, Enterprising, Conventional).
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-[#4cc9f0]" />
                          Social Cognitive Career Theory (SCCT)
                        </div>
                        <p className="text-[11px] text-white/55">
                          Lent, Brown & Hackett framework factoring student self-efficacy, career expectations, and academic performance.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          Constructivist Experience Integration
                        </div>
                        <p className="text-[11px] text-white/55">
                          Credits prior hands-on projects, self-taught tech skills, and personalized learning styles to optimize trajectory fits.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-[#6080ff] font-medium">
                    <Check className="w-4 h-4" /> 3 Validated Psychometric Theories
                  </div>
                </div>
              </Reveal>

              {/* Card 3: Research Motivation & System Value */}
              <Reveal delay={0.3}>
                <div className="dt-glass-card p-8 rounded-3xl h-full flex flex-col justify-between border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-3.5 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Project Objectives</h3>
                        <p className="text-xs text-white/50">Undergraduate Guidance Solution</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-white/70 leading-relaxed">
                      <p>
                        Undergraduate computing students often experience uncertainty regarding how classroom courses translate into practical careers. PathWise resolves this by providing:
                      </p>
                      <ul className="space-y-2 text-[11px] text-white/60">
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Objective decision support replacing generic advice with data-driven fit scores.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Prerequisite-mapped DELSU course roadmaps ensuring smooth academic progression.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Direct SIWES internship prep and high-demand skill prioritization.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <Check className="w-4 h-4" /> Engineered for DELSU Students
                  </div>
                </div>
              </Reveal>

            </div>

          </div>
        </section>

        {/* ── CORE SYSTEM PILLARS ────────────────────────────────────────────── */}
        <section id="features" className="py-24 border-t border-white/[0.08] relative z-10">
          <div className="max-w-6xl mx-auto px-8">
            
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-bold uppercase tracking-widest text-[#4361EE]">System Architecture</span>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-2 tracking-tight">
                  Four Intelligent Guidance Pillars
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  Every component in PathWise works synergistically to ensure you make informed, confident choices throughout your undergraduate years.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.title} delay={i * 0.1}>
                    <div className="dt-glass-card p-8 rounded-3xl relative overflow-hidden group h-full flex flex-col justify-between">
                      
                      {/* Hover top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#4361EE] to-[#4cc9f0] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div>
                        {/* Header with Icon and Watermark */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-[#4361EE]/10 border border-[#4361EE]/20 flex items-center justify-center text-[#6080ff] group-hover:scale-105 group-hover:bg-[#4361EE] group-hover:text-white transition-all duration-300">
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-4xl font-black font-mono text-white/[0.05] group-hover:text-[#4361EE]/15 select-none transition-colors">
                            {f.watermark}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-[#6080ff] mb-2 uppercase tracking-wide">
                          {f.badge}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#93c5fd] transition-colors">
                          {f.title}
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-white/40 group-hover:text-white/70 transition-colors">
                        <span>Integrated with DELSU Portal</span>
                        <ChevronRight className="w-4 h-4 text-[#4361EE] group-hover:translate-x-1 transition-transform" />
                      </div>

                    </div>
                  </Reveal>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── HOW PATHWISE WORKS (METHODOLOGY) ───────────────────────────────── */}
        <section id="how-it-works" className="py-24 border-t border-white/[0.08] relative z-10 bg-[#0A0C16]/40">
          <div className="max-w-6xl mx-auto px-8">
            
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-bold uppercase tracking-widest text-[#4361EE]">Assessment Flow</span>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-2 tracking-tight">
                  From Assessment to Career Clarity
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  Complete our streamlined 4-step process in under 5 minutes to unlock your custom roadmap.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-4 gap-6 relative">
              {howSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <Reveal key={step.number} delay={idx * 0.12}>
                    <div className="dt-glass-card p-6 rounded-3xl relative h-full flex flex-col">
                      
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-11 h-11 rounded-2xl bg-[#4361EE]/10 border border-[#4361EE]/20 flex items-center justify-center text-[#6080ff]">
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-black font-mono text-white/20">
                          {step.number}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-2">
                        {step.title}
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed flex-grow">
                        {step.desc}
                      </p>

                    </div>
                  </Reveal>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── DELSU ACADEMIC LEVEL ROADMAPS ──────────────────────────────────── */}
        <section id="student-levels" className="py-24 border-t border-white/[0.08] relative z-10">
          <div className="max-w-6xl mx-auto px-8">
            
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-bold uppercase tracking-widest text-[#4361EE]">Targeted Student Stages</span>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-2 tracking-tight">
                  Aligned for Every Level at DELSU
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  Whether you are just beginning 100 Level or wrapping up your 400 Level project, PathWise delivers tailored milestones.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-6">
              {levelGuides.map((lg, i) => (
                <Reveal key={lg.level} delay={i * 0.1}>
                  <div className="dt-glass-card p-8 rounded-3xl h-full flex flex-col justify-between border-white/[0.08]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#4361EE]/15 border border-[#4361EE]/30 text-[#6080ff]">
                          {lg.level}
                        </span>
                        <span className="text-xs font-semibold text-white/40">
                          {lg.tag}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {lg.title}
                      </h3>
                      <p className="text-xs text-white/60 leading-relaxed mb-5">
                        {lg.desc}
                      </p>

                      <div className="space-y-2 pt-4 border-t border-white/[0.05]">
                        {lg.points.map((pt, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-white/70">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

          </div>
        </section>

        {/* ── FINAL CALL TO ACTION ───────────────────────────────────────────── */}
        <section className="py-20 relative z-10 border-t border-white/[0.08]">
          <div className="max-w-5xl mx-auto px-8 text-center">
            <Reveal>
              <div className="p-12 rounded-3xl bg-gradient-to-br from-[#4361EE]/20 via-[#0A0C16] to-[#3a0ca3]/20 border border-[#4361EE]/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                
                {/* Decorative glow blob */}
                <div className="absolute top-[-50%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-[#4361EE]/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs font-medium text-white/80 mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Free Access for All DELSU Undergraduates</span>
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                    Ready to Take Command of Your Academic & Career Future?
                  </h2>

                  <p className="mt-4 text-sm text-white/70 leading-relaxed">
                    Discover your RIASEC personality match, see your semester course roadmap, and chat with your AI advisor in minutes.
                  </p>

                  <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                    <Link
                      to="/register"
                      className="dt-primary-btn px-8 py-3.5 rounded-full font-bold text-white text-base flex items-center gap-2.5"
                    >
                      <span>Start Your Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="px-7 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 font-semibold text-white text-sm transition-all"
                    >
                      Already Have an Account? Log In
                    </Link>
                  </div>
                </div>

              </div>
            </Reveal>
          </div>
        </section>

        {/* ── DESKTOP FOOTER ─────────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.08] bg-[#05060D] py-14 relative z-10 text-white/60 text-xs">
          <div className="max-w-6xl mx-auto px-8">
            
            <div className="grid grid-cols-4 gap-10 mb-12">
              {/* Col 1: Brand & Academic Project Attribution */}
              <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <PathWiseLogo href="/" size={26} textColor="#ffffff" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white/70 border border-white/10">
                    B.Sc. Final Year Project
                  </span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed max-w-sm">
                  An algorithmic career decision support platform designed and developed for the Department of Computer Science, Faculty of Computing, Delta State University (DELSU), Abraka.
                </p>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] space-y-1 text-white/60 max-w-md">
                  <div className="text-white font-medium">Student Researcher: Ifeanyi Wisdom</div>
                  <div>Matriculation Number: <span className="font-mono text-[#6080ff]">FOS/19/20/248102</span></div>
                  <div>Department: Department of Computer Science · Faculty of Computing</div>
                </div>
              </div>

              {/* Col 2: Navigation Links */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Platform</div>
                <ul className="space-y-2 text-white/50">
                  <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
                  <li><Link to="/register" className="hover:text-white transition-colors">Career Assessment</Link></li>
                  <li><Link to="/choice" className="hover:text-white transition-colors">Portal Choice</Link></li>
                  <li><a href="#features" className="hover:text-white transition-colors">System Pillars</a></li>
                  <li><a href="#student-levels" className="hover:text-white transition-colors">Curriculum Levels</a></li>
                </ul>
              </div>

              {/* Col 3: Research Foundations */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Research & Theory</div>
                <ul className="space-y-2 text-white/50">
                  <li><a href="#academic-project" className="hover:text-white transition-colors">Holland's RIASEC (1959)</a></li>
                  <li><a href="#academic-project" className="hover:text-white transition-colors">SCCT Self-Efficacy Model</a></li>
                  <li><a href="#academic-project" className="hover:text-white transition-colors">Constructivist Theory</a></li>
                  <li><a href="#academic-project" className="hover:text-white transition-colors">Researcher Dossier</a></li>
                </ul>
              </div>

            </div>

            {/* Bottom Copyright & Disclaimer */}
            <div className="pt-8 border-t border-white/[0.06] flex items-center justify-between text-white/40 text-[11px]">
              <div>
                © {new Date().getFullYear()} PathWise Decision Support System · Delta State University Final Year Project.
              </div>
              <div className="flex items-center gap-4">
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                <span>·</span>
                <Link to="/register" className="hover:text-white transition-colors">Register</Link>
                <span>·</span>
                <span>Abraka, Delta State</span>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;
