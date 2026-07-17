import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Brain, BookOpen, MessageSquare, BarChart2,
  ArrowRight, ChevronDown, GraduationCap, Briefcase, RefreshCw, Compass,
  Zap, Shield, Target, GitCompare, Check
} from 'lucide-react';

/* ─── Typewriter hook ─── */
function useTypewriter(words) {
  const elRef = useRef(null);
  useEffect(() => {
    let wIdx = 0, cIdx = 0, deleting = false, timerId;
    const el = elRef.current;
    if (!el) return;
    const tick = () => {
      const word = words[wIdx];
      // Show cursor by default during changes
      el.classList.add('typewriter-active');

      if (!deleting) {
        el.textContent = word.slice(0, ++cIdx);
        if (cIdx === word.length) { 
          deleting = true; 
          // Hide cursor when done typing (during static pause)
          el.classList.remove('typewriter-active');
          timerId = setTimeout(tick, 2200); 
          return; 
        }
      } else {
        el.textContent = word.slice(0, --cIdx);
        if (cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; }
      }
      timerId = setTimeout(tick, deleting ? 60 : 90);
    };
    timerId = setTimeout(tick, 1200);
    return () => clearTimeout(timerId);
  }, []);
  return elRef;
}

/* ─── Scroll reveal wrapper ─── */
function Reveal({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating particles ─── */
function Particles() {
  const colors = ['#0056FF', '#2277FF', '#0056FF', '#2277FF'];
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 18 + 10,
    delay: Math.random() * -20,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  return (
    <div className="particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
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

/* ─── Stat card ─── */
function Stat({ num, label }) {
  return (
    <div className="text-center">
      <div className="font-outfit text-3xl md:text-4xl font-black bg-gradient-to-r from-pw-blue to-pw-azure bg-clip-text text-transparent">
        {num}
      </div>
      <div className="text-solar-gray text-sm mt-1">{label}</div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon: Icon, iconBg, iconGlow, title, desc, delay }) {
  // Generate smart watermark abbreviation
  let watermark = '';
  if (title.includes('Matching')) watermark = 'AI';
  else if (title.includes('Roadmap')) watermark = 'CR';
  else if (title.includes('Advisor')) watermark = 'AA';
  else if (title.includes('Analyzer')) watermark = 'SA';

  return (
    <Reveal delay={delay} direction="up">
      <div className="relative bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-pw-blue/30 hover:bg-pw-blue/[0.02] hover:shadow-[0_15px_40px_rgba(0,86,255,0.065)] flex flex-col h-full group overflow-hidden">
        
        {/* Glow bar at top hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pw-blue to-pw-azure opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon & Category Header Watermark */}
        <div className="flex justify-between items-start mb-6">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0"
            style={{ background: iconBg, boxShadow: `0 0 20px ${iconGlow}22` }}
          >
            <Icon className="w-5 h-5" style={{ color: iconGlow }} />
          </div>
          <span className="text-4xl font-extrabold text-white/[0.03] select-none font-outfit transition-colors duration-300 group-hover:text-pw-blue/10">
            {watermark}
          </span>
        </div>

        <h3 className="font-outfit font-extrabold text-solar-white text-lg mb-3 tracking-tight">{title}</h3>
        <p className="text-solar-gray text-sm leading-relaxed">{desc}</p>
      </div>
    </Reveal>
  );
}

/* ─── Audience card ─── */
function AudienceCard({ icon: Icon, title, desc, bullets = [], delay }) {
  // Generate first letters for watermarking
  const splitTitle = title.split(' ');
  const watermark = (splitTitle[0]?.[0] || '') + (splitTitle[1]?.[0] || '');

  return (
    <Reveal delay={delay} direction="up">
      <div className="relative bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:border-pw-blue/30 hover:bg-pw-blue/[0.02] hover:shadow-[0_15px_40px_rgba(0,86,255,0.065)] flex flex-col h-full group overflow-hidden">
        
        {/* Glow bar at top hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pw-blue to-pw-azure opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon & Category Header Watermark */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-pw-blue/10 flex items-center justify-center text-pw-blue transition-all duration-300 group-hover:bg-pw-blue group-hover:text-white group-hover:scale-105 shrink-0">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <span className="text-4xl font-extrabold text-white/[0.03] select-none font-outfit transition-colors duration-300 group-hover:text-pw-blue/10">
            {watermark}
          </span>
        </div>

        <h3 className="font-outfit font-extrabold text-solar-white text-xl mb-3 tracking-tight">{title}</h3>
        <p className="text-solar-gray text-sm leading-relaxed mb-6 flex-grow">{desc}</p>
        
        {/* Bullet benefits */}
        <div className="space-y-3 pt-5 border-t border-white/5">
          {bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs text-solar-gray font-semibold">
              <div className="w-4 h-4 rounded-full bg-pw-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-pw-blue" />
              </div>
              <span className="leading-snug">{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ─── How it works step ─── */
function HowStep({ number, icon: Icon, title, desc, delay }) {
  return (
    <Reveal delay={delay} direction="up">
      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-full bg-pw-blue/10 border-2 border-pw-blue/40 flex items-center justify-center">
            <Icon className="w-7 h-7 text-pw-blue" />
          </div>
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pw-blue text-white text-xs font-black flex items-center justify-center">
            {number}
          </span>
        </div>
        <h3 className="font-outfit font-bold text-solar-white text-lg mb-2">{title}</h3>
        <p className="text-solar-gray text-sm leading-relaxed max-w-xs">{desc}</p>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
const LandingPage = () => {
  const typeRef = useTypewriter(['Perfect Career Path', 'Ideal Future', 'Dream Career', 'Right Direction']);

  const features = [
    {
      icon: Brain, iconBg: 'rgba(0,86,255,0.15)', iconGlow: '#0056FF',
      title: 'AI-Powered Career Matching',
      desc: 'Our weighted scoring algorithm analyzes your academic strengths, interests, skills, and personality across 4 dimensions to calculate your best-fit career match with precision.',
    },
    {
      icon: BookOpen, iconBg: 'rgba(34,119,255,0.15)', iconGlow: '#2277FF',
      title: 'DELSU Course Roadmap',
      desc: 'Get a semester-by-semester course plan aligned with the Delta State University curriculum — from Year 1 all the way to graduation — tailored to your chosen career.',
    },
    {
      icon: MessageSquare, iconBg: 'rgba(0,86,255,0.15)', iconGlow: '#0056FF',
      title: 'AI Career Advisor',
      desc: 'Ask anything, anytime. Our intelligent AI advisor answers your career questions, compares paths, and generates personalized study plans — instantly.',
    },
    {
      icon: BarChart2, iconBg: 'rgba(34,119,255,0.15)', iconGlow: '#2277FF',
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
      {/* Background layers */}
      <div className="mesh-bg" aria-hidden="true" />
      <Particles />

      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-16">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 bg-pw-blue/10 border border-pw-blue/30 text-pw-blue rounded-full px-5 py-2 text-sm font-semibold mb-8"
        >
          <GraduationCap className="w-4 h-4" />
          Built for Delta State University Students
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-outfit font-black text-[clamp(2.8rem,6vw,5rem)] leading-[1.05] max-w-4xl text-solar-white"
        >
          Discover Your<br />
          <span className="bg-gradient-to-r from-pw-blue via-pw-azure to-pw-lavender bg-clip-text text-transparent typewriter-text" ref={typeRef} />
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-solar-gray text-lg max-w-xl leading-relaxed mt-6"
        >
          PathWise is an AI-powered career advisory platform that analyzes your skills, personality,
          and academic strengths to connect you with the career you were born for — and the courses to get you there.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          <Link
            to="/choice"
            className="group inline-flex items-center gap-2 text-white font-bold rounded-full px-8 py-4 text-base hover:-translate-y-1 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #0056FF, #2277FF)', boxShadow: '0 0 30px rgba(0,86,255,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 50px rgba(0,86,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(0,86,255,0.4)'}
          >
            Start Your Assessment <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <a
            href="#what-is"
            className="inline-flex items-center gap-2 bg-transparent text-pw-blue border-2 border-pw-lavender/60 font-semibold rounded-full px-8 py-4 text-base hover:bg-pw-lavender/10 hover:border-pw-lavender hover:-translate-y-1 transition-all duration-300"
          >
            Learn More <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 flex flex-col items-center gap-2 text-solar-gray text-xs"
        >
          <span>Scroll to explore</span>
          <span className="animate-bounce text-lg">↓</span>
        </motion.div>
      </section>

      {/* ── STATS STRIP ──────────────────────────── */}
      <div className="relative z-10 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-wrap items-center justify-center gap-12">
          {[
            { num: '30+', label: 'Career Paths Covered' },
            { num: '6',   label: 'Major Fields' },
            { num: 'AI',  label: 'AI-Powered Advisor' },
            { num: 'DELSU', label: 'Curriculum Aligned' },
          ].map(s => <Stat key={s.label} {...s} />)}
        </div>
      </div>

      {/* ── WHAT IS PATHWISE ─────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-24" id="what-is">
        <div className="text-center mb-16">
          <Reveal>
            <p className="text-pw-blue text-xs font-bold tracking-widest uppercase mb-3">What is PathWise?</p>
            <div className="w-14 h-1 rounded-full mb-6 mx-auto" style={{ background: 'linear-gradient(90deg, #0056FF, #2277FF)' }} />
            <h2 className="font-outfit font-extrabold text-[clamp(1.8rem,4vw,2.8rem)] text-solar-white mb-4">
              Your Intelligent Career Guide,<br />Built for Nigerian Students
            </h2>
            <p className="text-solar-gray text-base leading-relaxed max-w-2xl mx-auto">
              PathWise isn't just another career assessment. It's a full intelligent advisory system that understands you — and maps your future.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 0.1} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="relative z-10 border-t border-white/[0.06] py-24">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <p className="text-pw-blue text-xs font-bold tracking-widest uppercase mb-3">How it works</p>
            <div className="w-14 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #0056FF, #2277FF)' }} />
            <h2 className="font-outfit font-extrabold text-[clamp(1.8rem,4vw,2.8rem)] text-solar-white mb-14">
              From Zero to Career Clarity<br />in 4 Simple Steps
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {howSteps.map((s, i) => <HowStep key={s.title} {...s} delay={i * 0.12} />)}
          </div>
        </div>
      </section>

      {/* ── WHAT IS PATHWISE FOR? ─────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-24">
        <Reveal>
          <p className="text-pw-blue text-xs font-bold tracking-widest uppercase mb-3">What is PathWise for?</p>
          <div className="w-14 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #0056FF, #2277FF)' }} />
          <h2 className="font-outfit font-extrabold text-[clamp(1.8rem,4vw,2.8rem)] text-solar-white mb-14">
            Tailored Solutions for Every Stage
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((a, i) => <AudienceCard key={a.title} {...a} delay={i * 0.12} />)}
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────── */}
      <section className="relative z-10 py-16 border-y border-pw-white/[0.05] bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-10">
          {[
            { icon: Zap, label: 'AI-Powered Advisor' },
            { icon: Shield, label: '100% Free for Students' },
            { icon: GraduationCap, label: 'DELSU Curriculum Aligned' },
            { icon: Compass, label: '30+ Career Paths' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-solar-gray text-sm font-medium">
              <div className="w-8 h-8 rounded-lg bg-pw-blue/10 border border-pw-blue/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-pw-blue" />
              </div>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM ───────────────────────────── */}
      <section className="relative z-10 py-28 px-4 text-center overflow-hidden">
        {/* Ambient glow behind CTA */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: 'rgba(0,86,255,0.08)' }} />
        </div>

        <Reveal>
          <h2 className="font-outfit font-black text-[clamp(2rem,5vw,3.5rem)] text-solar-white mb-5">
            Ready to Find Your Path?
          </h2>
          <p className="text-solar-gray text-lg max-w-md mx-auto leading-relaxed mb-10">
            Take the 5-minute assessment and get your personalized career match, course roadmap, and AI-powered guidance — completely free.
          </p>
          <Link
            to="/choice"
            className="group inline-flex items-center gap-3 text-white font-black rounded-full px-10 py-5 text-lg hover:-translate-y-1 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #0056FF, #2277FF)', boxShadow: '0 0 40px rgba(0,86,255,0.45)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 60px rgba(0,86,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(0,86,255,0.45)'}
          >
            Get Started — It's Free <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5" />
          </Link>
          <p className="text-pw-muted text-xs mt-5">No credit card required · Takes under 5 minutes</p>
        </Reveal>
      </section>
    </>
  );
};

export default LandingPage;
