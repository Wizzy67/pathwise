import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Compass,
  Target,
  LayoutDashboard,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  MessageSquare,
  Briefcase,
  TrendingUp,
  Award,
  Send,
  SlidersHorizontal,
  Bookmark,
  Check
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

const ONBOARDING_STEPS = [
  {
    badge: 'Welcome to PathWise',
    stepNavTitle: 'Overview',
    title: 'Your Personal Career Companion',
    subtitle: 'Calibrated for Delta State University (DELSU) students',
    description: 'PathWise connects your academic profile, vocational personality, and career goals to help you choose the right path and course electives with total empirical confidence.',
    icon: Compass,
    accentColor: '#20428B',
    features: [
      'Tailored directly to DELSU departmental curricula (100L–400L)',
      'Instant career-to-course mapping and prerequisite bottleneck warnings',
      'Engineered for both high-resolution desktop and one-thumb mobile'
    ]
  },
  {
    badge: 'Step 1 · Assessment',
    stepNavTitle: 'Assessment',
    title: 'Discover Your Holland Code',
    subtitle: 'Multi-Theory RIASEC & Self-Efficacy Engine',
    description: 'Take our 5-minute vocational assessment. Our multi-theory decision engine scores your interests across 6 Holland dimensions and pairs you with high-affinity Nigerian careers.',
    icon: Target,
    accentColor: '#FF6B35',
    features: [
      '18 calibrated, practical Likert-scale statements',
      'Evaluates vocational inclinations, SCCT self-efficacy, and work values',
      'Outputs your official 3-letter Holland Code (e.g. IRC, RIA)'
    ]
  },
  {
    badge: 'Step 2 · Exploration',
    stepNavTitle: 'Careers & Jobs',
    title: 'Explore Careers & Industry Salaries',
    subtitle: 'Curated Nigerian & Global Tech Opportunities',
    description: 'Browse over 50 structured career profiles and explore entry-level roles from leading Nigerian companies with realistic salary benchmarks, required tools, and skill readiness metrics.',
    icon: Briefcase,
    accentColor: '#17A589',
    features: [
      'Realistic Nigerian entry-level salary ranges (₦3.5M – ₦8.5M/yr)',
      'Verified corporate tech, public sector, and remote global roles',
      'Bookmark, compare compatibility scores, and download career dossiers'
    ]
  },
  {
    badge: 'Step 3 · AI Advisor',
    stepNavTitle: 'AI Advisor',
    title: '24/7 Academic & SIWES Guidance',
    subtitle: 'Speak in Standard English or Nigerian Pidgin',
    description: 'Consult with your specialized AI career advisor regarding SIWES industrial placements, final year project topics, departmental electives, and CGPA optimization strategies.',
    icon: Brain,
    accentColor: '#9B59B6',
    features: [
      'Full bilingual communication support (Standard English & Nigerian Pidgin)',
      'Context-aware recommendations grounded in DELSU course catalogs',
      'Multi-session chat histories securely saved to your student account'
    ]
  },
  {
    badge: 'Step 4 · Navigation',
    stepNavTitle: 'Dashboard',
    title: 'Your All-in-One Student Ecosystem',
    subtitle: 'Real-Time Academic & Career Intelligence',
    description: 'Monitor your academic standing, view live RIASEC affinity distributions, track saved career roadmaps, and receive proactive campus notifications in one unified dashboard.',
    icon: Sparkles,
    accentColor: '#20428B',
    features: [
      'Interactive RIASEC dimension distribution bar charts',
      'Personalized semester-by-semester DELSU course roadmaps',
      'Seamless synchronization between desktop and mobile PWA'
    ]
  }
];

/* ─── DESKTOP INTERACTIVE VISUAL PREVIEWS (COMPACT STUDIO) ─── */
const StepVisualPreview = ({ stepIndex, user }) => {
  const displayName = user?.fullName ? user.fullName.split(' ')[0] : 'Ifeanyi';
  const fullName = user?.fullName || 'Ifeanyi Wisdom';
  const matricNo = user?.matricNo || 'FOS/22/23/289652';
  const dept = user?.department || 'Computer Science';
  const faculty = user?.faculty || 'Faculty of Computing';
  const levelText = user?.level ? (String(user.level).toUpperCase().includes('L') ? String(user.level).toUpperCase() : `${user.level}L`) : '400L';

  // Step 0: Welcome & Student Credential Card
  if (stepIndex === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-[#1A346C] via-[#20428B] to-[#2A52A8] text-white shadow-lg relative overflow-hidden">
        {/* Luminous Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Student Identity Badge */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-[#20428B] flex items-center justify-center font-black text-lg heading-font shadow-sm uppercase">
                {displayName.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-sm heading-font text-white leading-tight">
                  {fullName}
                </h4>
                <p className="text-[11px] text-white/80 font-mono mt-0.5">
                  {matricNo}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/30 text-[9.5px] font-black uppercase tracking-wider text-white heading-font">
              DELSU · {levelText}
            </span>
          </div>

          <div className="mt-3 space-y-0.5 text-[11px] text-white/85 font-medium">
            <p>{faculty} · Dept. of {dept}</p>
            <p className="text-[10px] text-white/65">Delta State University, Abraka</p>
          </div>
        </div>

        {/* Highlight Chips */}
        <div className="space-y-2 my-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11.5px] font-bold text-white">96% Career Compatibility Matching Engine</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-[11.5px] font-bold text-white">DELSU Course Syllabi Integrated (100L–400L)</span>
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-[10.5px] text-white/70">
          <span>PathWise · Career Decision Support</span>
          <span className="font-bold text-white">Ready to Explore →</span>
        </div>
      </div>
    );
  }

  // Step 1: Holland RIASEC & Assessment Engine Visual
  if (stepIndex === 1) {
    const riasecData = [
      { key: 'R', label: 'Realistic', val: 78, color: '#FF7A45' },
      { key: 'I', label: 'Investigative', val: 92, color: '#20428B', top: true },
      { key: 'A', label: 'Artistic', val: 50, color: '#9B59B6' },
      { key: 'S', label: 'Social', val: 55, color: '#27AE60' },
      { key: 'E', label: 'Enterprising', val: 68, color: '#D97706' },
      { key: 'C', label: 'Conventional', val: 84, color: '#0284C7', top: true },
    ];

    return (
      <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-[var(--ink)] heading-font">
                Holland RIASEC Profile
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-black heading-font">
              Derived Code: IRC
            </span>
          </div>

          {/* Sample Statement Pill */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-[var(--mist)] border border-[var(--border)]">
            <span className="text-[9.5px] font-bold text-[var(--graphite)] uppercase tracking-wider block mb-1">
              Sample Calibrated Statement:
            </span>
            <p className="text-[11.5px] font-semibold text-[var(--ink)] leading-snug">
              "I enjoy designing mathematical algorithms and systems logic to solve complex data challenges."
            </p>
            <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-[var(--border)]">
              {['1. Disagree', '2', '3', '4', '5. Agree'].map((opt, i) => (
                <span
                  key={i}
                  className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                    i === 4
                      ? 'bg-[var(--blue)] text-white shadow-2xs'
                      : 'bg-[var(--surface)] text-[var(--graphite)] border border-[var(--border)]'
                  }`}
                >
                  {opt}
                </span>
              ))}
            </div>
          </div>

          {/* 6 Dimension Visual Distribution */}
          <div className="mt-2.5 space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--graphite)] uppercase tracking-wider block">
              Live Dimension Scoring:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {riasecData.map((d) => (
                <div key={d.key} className="p-1.5 px-2 rounded-lg bg-[var(--mist)] border border-[var(--border)]">
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="font-bold text-[var(--ink)] heading-font flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.key} · {d.label}
                    </span>
                    <span className="font-black text-[var(--blue)]">{d.val}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[var(--surface)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${d.val}%`, backgroundColor: d.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Careers & Salary Dossier Visual
  if (stepIndex === 2) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-[var(--ink)] heading-font">
                Curated Career Profile
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-black heading-font">
              96% Compatibility Match
            </span>
          </div>

          <div className="mt-2.5">
            <h3 className="text-base font-black text-[var(--ink)] heading-font leading-tight">
              AI & Machine Learning Engineer
            </h3>
            <p className="text-[11px] text-[var(--graphite)] mt-0.5">
              STEM / Computing · Holland Code: IRC
            </p>
          </div>

          {/* Salary Card */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-[var(--lavender)] border border-[var(--blue)]/20 flex items-center justify-between">
            <div>
              <span className="text-[9.5px] font-bold text-[var(--graphite)] uppercase tracking-wider block">
                Nigerian Entry Salary
              </span>
              <span className="text-sm font-black text-[var(--blue)] heading-font">
                ₦4,500,000 – ₦8,500,000 / yr
              </span>
            </div>
            <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-lg bg-white text-[var(--blue)] border border-[var(--blue)]/20">
              High Demand
            </span>
          </div>

          {/* Required Skills Chips */}
          <div className="mt-2.5 space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--graphite)] uppercase tracking-wider block">
              Core Competencies & Stack:
            </span>
            <div className="flex flex-wrap gap-1">
              {['Python', 'PyTorch', 'Data Pipelines', 'SQL', 'Linear Algebra', 'Model Evaluation'].map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-[var(--mist)] border border-[var(--border)] text-[10px] font-semibold text-[var(--ink)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* DELSU Electives Footer */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
          <span className="text-[10.5px] text-[var(--graphite)]">DELSU Electives:</span>
          <span className="font-bold text-[var(--blue)] heading-font">CSC 315 & CSC 411 Aligned ✓</span>
        </div>
      </div>
    );
  }

  // Step 3: AI Advisor Chat Demo Visual (Compact Bilingual)
  if (stepIndex === 3) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-[var(--ink)] heading-font">
                AI Career Advisor Console
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Bilingual Active</span>
            </span>
          </div>

          {/* Chat Messages Mockup */}
          <div className="mt-2.5 space-y-2">
            {/* Student English Query */}
            <div className="flex flex-col items-end">
              <div className="max-w-[88%] p-2 px-2.5 rounded-xl rounded-tr-xs bg-[var(--blue)] text-white text-[11px] font-medium shadow-2xs leading-snug">
                Which 300L electives prepare me for Machine Learning?
              </div>
              <span className="text-[8.5px] text-[var(--ash)] mt-0.5 mr-1">10:42 AM</span>
            </div>

            {/* AI Advisor Response */}
            <div className="flex items-start gap-1.5 max-w-[94%]">
              <div className="w-5 h-5 rounded-md bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[9px]">
                AI
              </div>
              <div className="p-2 px-2.5 rounded-xl rounded-tl-xs bg-[var(--mist)] border border-[var(--border)] text-[11px] text-[var(--ink)] leading-snug">
                Register for <strong>CSC 315</strong> (Algorithms) and <strong>MAT 301</strong>. For SIWES, target tech startups in Lagos or Delta!
              </div>
            </div>

            {/* Student Pidgin Query */}
            <div className="flex flex-col items-end">
              <div className="max-w-[88%] p-2 px-2.5 rounded-xl rounded-tr-xs bg-[var(--blue)] text-white text-[11px] font-medium shadow-2xs leading-snug">
                Abeg how I fit balance my CGPA for second semester?
              </div>
              <span className="text-[8.5px] text-[var(--ash)] mt-0.5 mr-1">10:44 AM</span>
            </div>

            {/* AI Advisor Pidgin Response */}
            <div className="flex items-start gap-1.5 max-w-[94%]">
              <div className="w-5 h-5 rounded-md bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[9px]">
                AI
              </div>
              <div className="p-2 px-2.5 rounded-xl rounded-tl-xs bg-[var(--mist)] border border-[var(--border)] text-[11px] text-[var(--ink)] leading-snug">
                No worry! Aim for As in your 3-unit courses like CSC 302. Dat one go raise your CGPA well well! 🚀
              </div>
            </div>
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10.5px]">
          <span className="text-[10px] text-[var(--graphite)]">Quick Prompts:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">SIWES Placement</span>
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">Project Topics</span>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Full Ecosystem & Dashboard Visual
  if (stepIndex === 4) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center">
                <LayoutDashboard className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-[var(--ink)] heading-font">
                PathWise Unified Dashboard
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-black heading-font">
              Live Ecosystem
            </span>
          </div>

          {/* Mini Dashboard Metrics Grid */}
          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
            <div className="p-2 rounded-xl bg-[var(--mist)] border border-[var(--border)]">
              <span className="text-[8.5px] font-bold text-[var(--graphite)] uppercase">Top Career Fit</span>
              <div className="text-base font-black text-[var(--ink)] heading-font leading-tight">96%</div>
              <span className="text-[9.5px] text-emerald-600 font-bold">AI Engineer</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--mist)] border border-[var(--border)]">
              <span className="text-[8.5px] font-bold text-[var(--graphite)] uppercase">Holland Code</span>
              <div className="text-base font-black text-[var(--ink)] heading-font leading-tight">IRC</div>
              <span className="text-[9.5px] text-[var(--graphite)] font-medium">Investigative</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--mist)] border border-[var(--border)]">
              <span className="text-[8.5px] font-bold text-[var(--graphite)] uppercase">Saved Careers</span>
              <div className="text-base font-black text-[var(--ink)] heading-font leading-tight">2</div>
              <span className="text-[9.5px] text-[var(--blue)] font-bold">Active Tracks</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--mist)] border border-[var(--border)]">
              <span className="text-[8.5px] font-bold text-[var(--graphite)] uppercase">Standing</span>
              <div className="text-base font-black text-[var(--ink)] heading-font leading-tight">{levelText}</div>
              <span className="text-[9.5px] text-amber-600 font-bold">{user?.cgpa ? `CGPA: ${user.cgpa}` : 'CGPA: 4.38'}</span>
            </div>
          </div>

          {/* Navigation Quick Actions */}
          <div className="mt-2.5 space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--graphite)] uppercase tracking-wider block">
              Fast Access Workspaces:
            </span>
            <div className="grid grid-cols-3 gap-1 text-center">
              {[
                { label: 'Assessment', icon: Target },
                { label: 'Career Explorer', icon: Compass },
                { label: 'AI Advisor', icon: Brain },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="p-1.5 rounded-lg bg-[var(--mist)] border border-[var(--border)] flex flex-col items-center gap-0.5">
                  <Icon className="w-3 h-3 text-[var(--blue)]" />
                  <span className="text-[9.5px] font-bold text-[var(--ink)] heading-font">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ready Callout */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
          <span className="text-[10px] text-[var(--graphite)]">Everything calibrated:</span>
          <span className="font-bold text-[var(--blue)] heading-font">Click Start Quiz below →</span>
        </div>
      </div>
    );
  }

  return null;
};

const WelcomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = ONBOARDING_STEPS[currentStep];
  const isLast = currentStep === ONBOARDING_STEPS.length - 1;
  const StepIcon = step.icon;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('pathwise_tour_completed', 'true');
    navigate('/dashboard');
  };

  const handleStartQuiz = () => {
    localStorage.setItem('pathwise_tour_completed', 'true');
    navigate('/quiz');
  };

  // Keyboard navigation support for desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isLast]);

  const displayName = user?.fullName?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-[100dvh] bg-[var(--canvas)] text-[var(--ink)] flex flex-col justify-between select-none relative overflow-x-hidden font-['Open_Sans',sans-serif]">
      <style>{`
        :root {
          --canvas: #f5f3f3;
          --surface: #ffffff;
          --border: #dddcdc;
          --blue: #20428b;
          --azure: #2a52a8;
          --lavender: #eef2f9;
          --ink: #111111;
          --graphite: #707070;
          --ash: #adadad;
          --fog: #ededed;
          --mist: #f2f2f2;
        }
        .heading-font { font-family: 'Nunito', sans-serif; }
        .body-font { font-family: 'Open Sans', sans-serif; }
      `}</style>

      {/* ── COMPACT TOP HEADER BAR ── */}
      <header className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between z-20 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md sticky top-0">
        
        {/* Logo & Desktop Project Badge */}
        <div className="flex items-center gap-2.5">
          <PathWiseLogo href="/welcome" size={26} textColor="var(--ink)" />
          <div className="h-3.5 w-[1px] bg-[var(--border)] hidden sm:block" />
          <span className="hidden sm:inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[var(--blue)] bg-[var(--lavender)] px-2 py-0.5 rounded-full border border-[var(--blue)]/20 heading-font">
            <GraduationCap className="w-3 h-3 text-[var(--blue)]" />
            <span>Tour Guide · DELSU</span>
          </span>
        </div>

        {/* Desktop Stepper Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1">
          {ONBOARDING_STEPS.map((s, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 heading-font ${
                  isActive
                    ? 'bg-[var(--blue)] text-white shadow-xs'
                    : isCompleted
                    ? 'bg-[var(--lavender)] text-[var(--blue)] hover:bg-[var(--fog)]'
                    : 'text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--mist)]'
                }`}
              >
                <span>{idx + 1}. {s.stepNavTitle}</span>
                {isCompleted && <Check className="w-2.5 h-2.5 text-[var(--blue)]" />}
              </button>
            );
          })}
        </nav>

        {/* Skip to Dashboard Button */}
        <button
          onClick={handleComplete}
          className="text-xs font-bold text-[var(--graphite)] hover:text-[var(--blue)] px-2.5 py-1 rounded-full hover:bg-[var(--lavender)] transition-all heading-font"
        >
          Skip to Dashboard
        </button>
      </header>

      {/* ── MAIN TOUR STUDIO CONTAINER (FITS THE SCREEN COMFORTABLY) ── */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-3.5 max-w-lg lg:max-w-5xl xl:max-w-[1060px] mx-auto w-full my-auto z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-[0_6px_24px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden"
          >
            {/* Ambient Background Glow Blob */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-2xl pointer-events-none"
              style={{ backgroundColor: step.accentColor }}
            />

            {/* Step Counter Badge on Mobile & Tablet */}
            <div className="flex items-center justify-between mb-2.5 lg:mb-3">
              <span
                className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border heading-font"
                style={{
                  color: step.accentColor,
                  borderColor: `${step.accentColor}33`,
                  backgroundColor: `${step.accentColor}10`
                }}
              >
                {step.badge}
              </span>
              <span className="text-[11px] font-bold text-[var(--graphite)] heading-font">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>

            {/* ── DUAL COLUMN LAYOUT ON DESKTOP ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 sm:gap-5 lg:gap-6 items-stretch">

              {/* LEFT COLUMN: Narrative & Capabilities */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Step Header Graphic + Title */}
                  <div className="mb-2.5 lg:mb-3 flex items-center gap-3">
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: `${step.accentColor}15`,
                        color: step.accentColor
                      }}
                    >
                      <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
                    </div>

                    <div>
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-[var(--ink)] heading-font leading-tight">
                        {currentStep === 0 ? `Hello, ${displayName}!` : step.title}
                      </h1>
                      <p className="text-[11px] sm:text-xs font-bold text-[var(--graphite)] mt-0.5 body-font">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Narrative Body Description */}
                  <p className="text-xs sm:text-[12.5px] text-[var(--graphite)] leading-normal mb-3 body-font font-medium">
                    {step.description}
                  </p>

                  {/* Feature Capabilities Checklist */}
                  <div className="space-y-1.5 bg-[var(--mist)] p-3 sm:p-3.5 rounded-xl border border-[var(--border)] mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--graphite)] block heading-font mb-1">
                      Key System Capabilities:
                    </span>
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11.5px] font-semibold text-[var(--ink)] body-font">
                        <CheckCircle2
                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                          style={{ color: step.accentColor }}
                        />
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Embedded Navigation Controls (Left Column Footer) */}
                <div className="hidden lg:flex items-center justify-between pt-2.5 border-t border-[var(--border)] mt-2">
                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrev}
                        className="py-2 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--fog)] active:scale-95 transition-all flex items-center gap-1 text-xs font-bold heading-font"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                    )}

                    {isLast ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleComplete}
                          className="py-2 px-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] font-bold text-xs hover:bg-[var(--fog)] active:scale-95 transition-all text-center heading-font"
                        >
                          Go to Dashboard
                        </button>
                        <button
                          onClick={handleStartQuiz}
                          className="py-2 px-4 rounded-xl bg-[var(--blue)] text-white font-extrabold text-xs hover:bg-[var(--azure)] active:scale-95 transition-all flex items-center justify-center gap-1 shadow-md heading-font"
                        >
                          <span>Start Assessment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="py-2 px-5 rounded-xl bg-[var(--blue)] text-white font-extrabold text-xs hover:bg-[var(--azure)] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md heading-font"
                      >
                        <span>Continue to {ONBOARDING_STEPS[currentStep + 1].stepNavTitle}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-[var(--ash)] font-mono ml-2 shrink-0">
                    Press → to advance
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive High-Fidelity Feature Canvas (Desktop) */}
              <div className="hidden lg:block h-full">
                <StepVisualPreview stepIndex={currentStep} user={user} />
              </div>

            </div>

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── MOBILE BOTTOM CONTROLS BAR (Retained for Mobile & Tablet) ── */}
      <footer className="lg:hidden px-4 sm:px-6 pb-4 pt-1 max-w-lg mx-auto w-full z-10 flex flex-col gap-2.5">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5">
          {ONBOARDING_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-7 bg-[var(--blue)]'
                  : 'w-1.5 bg-[var(--ash)] opacity-40 hover:opacity-80'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--fog)] active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {isLast ? (
            <div className="flex-1 flex gap-2">
              <button
                onClick={handleComplete}
                className="flex-1 py-3 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] font-bold text-xs hover:bg-[var(--fog)] active:scale-95 transition-all text-center heading-font"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex-1 py-3 px-3.5 rounded-xl bg-[var(--blue)] text-white font-bold text-xs hover:bg-[var(--azure)] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md heading-font"
              >
                <span>Start Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-5 rounded-xl bg-[var(--blue)] text-white font-bold text-xs hover:bg-[var(--azure)] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md heading-font"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </footer>

      {/* ── DESKTOP MINIMAL FOOTER ── */}
      <footer className="hidden lg:flex items-center justify-between px-6 lg:px-8 py-2 border-t border-[var(--border)] bg-[var(--surface)]/80 text-[10.5px] text-[var(--graphite)] z-10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Delta State University · Faculty of Computing · Career Decision Support System</span>
        </div>
        <div className="flex items-center gap-3 text-[var(--ash)] font-mono text-[10px]">
          <span>Navigation: ← Back | → Next | Esc Skip</span>
          <span>·</span>
          <span>Matric: {user?.matricNo || 'FOS/22/23/289652'}</span>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
