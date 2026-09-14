import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Loader2, GraduationCap,
  Settings, Search, Palette, Users, TrendingUp, ClipboardList,
  Coins, Heart, Shield, Award, Compass, Wrench, BookOpen,
  Lightbulb, Flag, CheckCircle2, X, Sparkles, Check
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

// ── RIASEC Dimensions ──────────────────────────────────────────────────
const RIASEC_DIMENSIONS = [
  {
    key: 'R', label: 'Realistic', color: '#FF6B35', icon: Settings,
    desc: 'Practical · Hands-on · Mechanical',
    statements: [
      'I enjoy working with tools, machines, or physical equipment.',
      'I prefer practical, hands-on tasks over theoretical discussions.',
      'I like building, repairing, or operating physical things.',
    ]
  },
  {
    key: 'I', label: 'Investigative', color: '#20428B', icon: Search,
    desc: 'Analytical · Curious · Research-driven',
    statements: [
      'I enjoy researching and solving complex intellectual problems.',
      'I am curious about how and why things work the way they do.',
      'I prefer working with ideas and data rather than people or objects.',
    ]
  },
  {
    key: 'A', label: 'Artistic', color: '#9B59B6', icon: Palette,
    desc: 'Creative · Expressive · Imaginative',
    statements: [
      'I love expressing myself through creative work — writing, art, music, or design.',
      'I thrive in environments where I can innovate without strict rules.',
      'I am drawn to roles that involve imagination and original thinking.',
    ]
  },
  {
    key: 'S', label: 'Social', color: '#27AE60', icon: Users,
    desc: 'Helping · Teaching · Nurturing',
    statements: [
      'I find deep satisfaction in helping, teaching, or counseling others.',
      'I enjoy working as part of a team and building strong relationships.',
      'I am energized by interacting with and understanding people.',
    ]
  },
  {
    key: 'E', label: 'Enterprising', color: '#F39C12', icon: TrendingUp,
    desc: 'Leadership · Persuasion · Ambitious',
    statements: [
      'I enjoy taking charge, leading teams, and influencing decisions.',
      'I am comfortable selling ideas, negotiating, or promoting causes.',
      'I am motivated by competition, achievement, and business success.',
    ]
  },
  {
    key: 'C', label: 'Conventional', color: '#17A589', icon: ClipboardList,
    desc: 'Orderly · Detail-oriented · Structured',
    statements: [
      'I prefer organized, structured tasks with clear rules and procedures.',
      'I take pride in being thorough, accurate, and detail-oriented.',
      'I am comfortable working with records, data, numbers, or schedules.',
    ]
  },
];

// ── SCCT Self-Efficacy fields ──────────────────────────────────────────
const SELF_EFFICACY_ITEMS = [
  { field: 'STEM',            label: 'Technology & Engineering', desc: 'Programming, electronics, data systems, mathematics' },
  { field: 'Medicine',        label: 'Medicine & Healthcare',    desc: 'Clinical care, pharmacology, patient management' },
  { field: 'Law',             label: 'Law & Legal Practice',     desc: 'Legal research, argumentation, corporate law' },
  { field: 'Business',        label: 'Business & Finance',       desc: 'Management, accounting, investment strategy' },
  { field: 'Arts',            label: 'Arts & Creative Media',    desc: 'Design, writing, film, music, journalism' },
  { field: 'Science',         label: 'Natural Sciences',         desc: 'Biology, chemistry, geology, environmental science' },
  { field: 'Social Sciences', label: 'Social Sciences',          desc: 'Psychology, sociology, economics, political science' },
];

// ── SCCT Outcome Expectations ──────────────────────────────────────────
const OUTCOME_ITEMS = [
  { key: 'income',    label: 'Financial Reward',        icon: Coins,    desc: 'High earning potential and wealth creation' },
  { key: 'impact',    label: 'Social Impact',           icon: Heart,    desc: 'Making a meaningful difference in lives' },
  { key: 'creativity',label: 'Creative Expression',     icon: Palette,  desc: 'Freedom to innovate and create original work' },
  { key: 'stability', label: 'Job Security',            icon: Shield,   desc: 'Stable career with reliable employment' },
  { key: 'status',    label: 'Professional Prestige',   icon: Award,    desc: 'Recognition and respect in your field' },
  { key: 'autonomy',  label: 'Autonomy & Independence', icon: Compass,  desc: 'Freedom to work on your own terms' },
];

// ── Constructivist: Prior Experiences ─────────────────────────────────
const PRIOR_EXP = [
  { key: 'coding',      label: 'Coding & Web Dev' },
  { key: 'research',    label: 'Lab & Field Research' },
  { key: 'writing',     label: 'Writing & Journalism' },
  { key: 'healthcare',  label: 'Clinic / Hospital Volunteering' },
  { key: 'design',      label: 'Graphic & UI/UX Design' },
  { key: 'debate',      label: 'Public Speaking & Debate' },
  { key: 'business',    label: 'Sales & Entrepreneurship' },
  { key: 'community',   label: 'Community & NGO Service' },
  { key: 'teaching',    label: 'Tutoring Peers' },
  { key: 'arts',        label: 'Music & Creative Media' },
  { key: 'hands_on',   label: 'Technical / Hands-on Repair' },
  { key: 'math',        label: 'Mathematics Competitions' },
];

// ── Constructivist: Learning Styles ───────────────────────────────────
const LEARNING_STYLES = [
  { key: 'hands_on',     label: 'Hands-on Practice',      icon: Wrench,        desc: 'Learning by doing physical and practical tasks' },
  { key: 'research',     label: 'Research & Reading',      icon: BookOpen,      desc: 'Independent study, books, and deep intellectual analysis' },
  { key: 'creative',     label: 'Creative Exploration',    icon: Lightbulb,     desc: 'Experimenting freely without rigid constraints' },
  { key: 'collaborative',label: 'Group Collaboration',     icon: Users,         desc: 'Learning through team discussions and group work' },
  { key: 'leadership',   label: 'Leading Projects',        icon: Flag,          desc: 'Learning by organizing, pitching, and guiding others' },
  { key: 'structured',   label: 'Structured Study',        icon: ClipboardList, desc: 'Following clear syllabus, guidelines, and schedules' },
];

const STEPS = [
  { id: 1, label: 'Academic' },
  { id: 2, label: 'Personality' },
  { id: 3, label: 'Confidence' },
  { id: 4, label: 'Values' },
  { id: 5, label: 'Review' },
];

// Likert scale definition with touch-friendly emojis
const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree', emoji: '👎', shortLabel: 'Disagree' },
  { value: 2, label: 'Disagree',          emoji: '🙁', shortLabel: 'Slight Disagree' },
  { value: 3, label: 'Neutral',           emoji: '😐', shortLabel: 'Neutral' },
  { value: 4, label: 'Agree',              emoji: '🙂', shortLabel: 'Agree' },
  { value: 5, label: 'Strongly Agree',    emoji: '🌟', shortLabel: 'Strong Agree' },
];

const QuizPage = () => {
  const [step, setStep] = useState(1);
  const [riasecDimIdx, setRiasecDimIdx] = useState(0);

  const [answers, setAnswers] = useState({
    cgpa: '',
    riasec: { R: [], I: [], A: [], S: [], E: [], C: [] },
    selfEfficacy: {},
    outcomeExpectations: {},
    priorExperiences: [],
    learningStyle: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const setRiasecRating = (dimKey, stmtIdx, rating) => {
    setAnswers(prev => {
      const arr = [...(prev.riasec[dimKey] || [])];
      arr[stmtIdx] = rating;
      return { ...prev, riasec: { ...prev.riasec, [dimKey]: arr } };
    });
  };

  const setSelfEfficacy = (field, val) =>
    setAnswers(prev => ({ ...prev, selfEfficacy: { ...prev.selfEfficacy, [field]: val } }));

  const setOutcome = (key, val) =>
    setAnswers(prev => ({ ...prev, outcomeExpectations: { ...prev.outcomeExpectations, [key]: val } }));

  const toggleExp = (key) =>
    setAnswers(prev => ({
      ...prev,
      priorExperiences: prev.priorExperiences.includes(key)
        ? prev.priorExperiences.filter(e => e !== key)
        : [...prev.priorExperiences, key]
    }));

  const previewHolland = useMemo(() => {
    const raw = {};
    RIASEC_DIMENSIONS.forEach(d => {
      raw[d.key] = (answers.riasec[d.key] || []).reduce((s, r) => s + (parseInt(r) || 0), 0);
    });
    const sorted = Object.entries(raw).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([k]) => k).join('');
  }, [answers.riasec]);

  const canProceed = () => {
    if (step === 1) return answers.cgpa !== '' && parseFloat(answers.cgpa) >= 0 && parseFloat(answers.cgpa) <= 5.0;
    if (step === 2) {
      const dim = RIASEC_DIMENSIONS[riasecDimIdx];
      return dim.statements.every((_, i) => answers.riasec[dim.key]?.[i] !== undefined);
    }
    if (step === 3) return SELF_EFFICACY_ITEMS.every(item => answers.selfEfficacy[item.field] !== undefined);
    if (step === 4) {
      const allOutcomes = OUTCOME_ITEMS.every(item => answers.outcomeExpectations[item.key] !== undefined);
      return allOutcomes && answers.learningStyle !== '';
    }
    return true;
  };

  const handleNextInStep2 = () => {
    if (riasecDimIdx < 5) {
      setRiasecDimIdx(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep(3);
      setRiasecDimIdx(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevInStep2 = () => {
    if (riasecDimIdx > 0) {
      setRiasecDimIdx(i => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/quiz/results', { answers });
      addNotification('Assessment complete! Generating your personalized career matches…', 'success');
      navigate('/results');
    } catch (error) {
      console.error('Submit assessment error:', error);
      addNotification('Failed to submit assessment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit the assessment? Your progress will not be saved.")) {
      navigate('/dashboard');
    }
  };

  const currentDim = RIASEC_DIMENSIONS[riasecDimIdx];

  // Overall progress percentage
  const progressPercent = useMemo(() => {
    if (step === 1) return 15;
    if (step === 2) return 20 + Math.round(((riasecDimIdx + 1) / 6) * 35);
    if (step === 3) return 70;
    if (step === 4) return 88;
    return 100;
  }, [step, riasecDimIdx]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--canvas)] select-none">
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

      {/* ── TOP APP ASSESSMENT HEADER (Mobile-Native) ── */}
      <div className="sticky top-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (step === 2) handlePrevInStep2();
              else if (step > 1) { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              else handleExit();
            }}
            className="w-9 h-9 rounded-xl bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--ink)] flex items-center justify-center active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--graphite)]">
              {STEPS[step - 1].label} · Step {step} of 5
            </span>
            {/* Animated Progress Bar */}
            <div className="w-full bg-[var(--mist)] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-[var(--blue)] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleExit}
            className="w-9 h-9 rounded-xl bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--ink)] flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 max-w-xl w-full mx-auto p-4 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${riasecDimIdx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── STEP 1: ACADEMIC BASELINE (CGPA) ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-4 pt-2">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-6 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-black text-[var(--ink)] heading-font">
                    Academic Standing
                  </h2>
                  <p className="text-xs text-[var(--graphite)] mt-1 max-w-xs mx-auto">
                    Your CGPA calibrates course prerequisites and career match feasibility at DELSU.
                  </p>

                  {/* Input Card */}
                  <div className="mt-6 max-w-xs mx-auto">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--graphite)] block mb-2">
                      Current Cumulative GPA (0.00 – 5.00)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="5.0"
                      value={answers.cgpa}
                      onChange={e => setAnswers(p => ({ ...p, cgpa: e.target.value }))}
                      placeholder="e.g. 4.25"
                      className="w-full text-center text-2xl font-black heading-font bg-[var(--mist)] border-2 border-[var(--border)] rounded-2xl py-3 px-4 text-[var(--ink)] focus:outline-none focus:border-[var(--blue)] transition-all"
                    />

                    {/* Quick Preset Pills */}
                    <div className="flex gap-2 justify-center mt-3">
                      {['3.20', '3.80', '4.20', '4.50'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAnswers(p => ({ ...p, cgpa: val }))}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--fog)] text-[var(--graphite)] hover:text-[var(--blue)] hover:bg-[var(--lavender)] transition-all"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-[var(--graphite)] leading-relaxed">
                    <p className="font-bold text-[var(--ink)]">Three-Theory Engine</p>
                    <p className="text-[11px] mt-0.5">
                      PathWise analyzes personality (Holland RIASEC), career self-efficacy (SCCT), and constructivist learning styles to provide explainable DELSU career recommendations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── STEP 2: RIASEC PERSONALITY (3 statements per dimension) ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Trait Header Card */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: currentDim.color + '18', color: currentDim.color }}
                      >
                        <currentDim.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-[var(--ink)] heading-font leading-tight">
                          {currentDim.label}
                        </h2>
                        <p className="text-[11px] text-[var(--graphite)]">
                          {currentDim.desc}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-black px-2.5 py-1 rounded-full heading-font"
                      style={{ backgroundColor: currentDim.color + '18', color: currentDim.color }}
                    >
                      Trait {riasecDimIdx + 1}/6
                    </span>
                  </div>

                  {/* 6 Trait Sub-bars */}
                  <div className="flex gap-1 pt-2">
                    {RIASEC_DIMENSIONS.map((d, i) => (
                      <div
                        key={d.key}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{ backgroundColor: i <= riasecDimIdx ? d.color : 'var(--border)' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Statements Cards */}
                <div className="space-y-3">
                  {currentDim.statements.map((stmt, idx) => {
                    const rating = answers.riasec[currentDim.key]?.[idx];
                    return (
                      <div
                        key={idx}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm space-y-3"
                      >
                        <p className="text-xs sm:text-sm font-bold text-[var(--ink)] leading-relaxed">
                          {idx + 1}. {stmt}
                        </p>

                        {/* Mobile Touch Rating Pills (1 - 5) */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {LIKERT_OPTIONS.map(opt => {
                            const isSelected = rating === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setRiasecRating(currentDim.key, idx, opt.value)}
                                className={`py-2.5 rounded-xl flex flex-col items-center justify-center transition-all border ${
                                  isSelected
                                    ? 'text-white border-transparent shadow-sm'
                                    : 'bg-[var(--mist)] border-[var(--border)] text-[var(--graphite)] hover:border-[var(--blue)]'
                                }`}
                                style={{
                                  backgroundColor: isSelected ? currentDim.color : undefined
                                }}
                              >
                                <span className="text-base">{opt.emoji}</span>
                                <span className="text-[10px] font-black mt-0.5 heading-font">
                                  {opt.value}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {rating && (
                          <p className="text-[10px] text-right font-bold text-[var(--graphite)]">
                            Selected: <span style={{ color: currentDim.color }}>{LIKERT_OPTIONS[rating - 1].label}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── STEP 3: CAREER CONFIDENCE (SCCT SELF-EFFICACY) ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-5 shadow-sm text-center">
                  <h2 className="text-base font-black text-[var(--ink)] heading-font">
                    Career Self-Efficacy
                  </h2>
                  <p className="text-xs text-[var(--graphite)] mt-0.5">
                    How confident do you feel in your ability to master and succeed in these fields?
                  </p>
                </div>

                <div className="space-y-3">
                  {SELF_EFFICACY_ITEMS.map(item => {
                    const rating = answers.selfEfficacy[item.field];
                    return (
                      <div
                        key={item.field}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)] heading-font">
                              {item.label}
                            </h3>
                            <p className="text-[10px] text-[var(--graphite)]">{item.desc}</p>
                          </div>
                          {rating && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 heading-font flex-shrink-0">
                              {rating} / 5
                            </span>
                          )}
                        </div>

                        {/* 1 to 5 Pill Buttons */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map(n => {
                            const isSelected = rating === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setSelfEfficacy(item.field, n)}
                                className={`py-2 rounded-xl text-xs font-black transition-all border ${
                                  isSelected
                                    ? 'bg-[var(--blue)] text-white border-[var(--blue)] shadow-sm'
                                    : 'bg-[var(--mist)] border-[var(--border)] text-[var(--graphite)] hover:border-[var(--blue)]'
                                }`}
                              >
                                {n}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── STEP 4: CAREER VALUES & CONSTRUCTIVIST LEARNING ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 4 && (
              <div className="space-y-4">
                {/* 1. Outcome Expectations */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-[var(--ink)] heading-font">
                      What Matters to You? (Career Values)
                    </h2>
                    <p className="text-[11px] text-[var(--graphite)]">
                      Rate the importance of each factor in your ideal post-graduation career (1 = Low, 5 = Critical)
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {OUTCOME_ITEMS.map(item => {
                      const rating = answers.outcomeExpectations[item.key];
                      const IconComp = item.icon;
                      return (
                        <div key={item.key} className="p-3 rounded-2xl bg-[var(--mist)] border border-[var(--border)] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[var(--surface)] text-[var(--blue)] flex items-center justify-center flex-shrink-0">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[var(--ink)] truncate heading-font">{item.label}</h4>
                              <p className="text-[10px] text-[var(--graphite)] truncate">{item.desc}</p>
                            </div>
                          </div>

                          {/* 1-5 selector */}
                          <div className="flex gap-1 flex-shrink-0">
                            {[1, 2, 3, 4, 5].map(n => {
                              const isSelected = rating === n;
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setOutcome(item.key, n)}
                                  className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                                    isSelected
                                      ? 'bg-[var(--blue)] text-white shadow-sm'
                                      : 'bg-[var(--surface)] text-[var(--graphite)] hover:text-[var(--ink)]'
                                  }`}
                                >
                                  {n}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Learning Style */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-[var(--ink)] heading-font">
                      Preferred Learning Style
                    </h2>
                    <p className="text-[11px] text-[var(--graphite)]">
                      How do you learn technical concepts and syllabus materials best?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {LEARNING_STYLES.map(s => {
                      const isSelected = answers.learningStyle === s.key;
                      const IconComp = s.icon;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => setAnswers(p => ({ ...p, learningStyle: s.key }))}
                          className={`p-3 rounded-2xl text-left transition-all border flex items-center gap-3 ${
                            isSelected
                              ? 'bg-[var(--lavender)] border-[var(--blue)] shadow-sm'
                              : 'bg-[var(--mist)] border-[var(--border)] hover:border-[var(--blue)]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-[var(--blue)] text-white' : 'bg-[var(--surface)] text-[var(--graphite)]'
                          }`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold heading-font ${isSelected ? 'text-[var(--blue)]' : 'text-[var(--ink)]'}`}>
                              {s.label}
                            </p>
                            <p className="text-[10px] text-[var(--graphite)] truncate">{s.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Prior Experiences */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-[var(--ink)] heading-font">
                      Prior Practical Experiences
                    </h2>
                    <p className="text-[11px] text-[var(--graphite)]">
                      Tap all that you have participated in (prior projects, volunteering, or hobbies):
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap pt-1">
                    {PRIOR_EXP.map(exp => {
                      const isSelected = answers.priorExperiences.includes(exp.key);
                      return (
                        <button
                          key={exp.key}
                          type="button"
                          onClick={() => toggleExp(exp.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-[var(--blue)] text-white border-[var(--blue)] shadow-sm'
                              : 'bg-[var(--mist)] text-[var(--graphite)] border-[var(--border)] hover:border-[var(--blue)]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{exp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── STEP 5: REVIEW & FINAL SUBMISSION ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-6 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-black text-[var(--ink)] heading-font">
                    Assessment Completed!
                  </h2>
                  <p className="text-xs text-[var(--graphite)] mt-0.5">
                    Your answers are ready for the DELSU Career Matching Engine.
                  </p>

                  {/* Predicted Holland Code Card */}
                  <div className="mt-5 p-4 rounded-2xl bg-[var(--lavender)] border border-[var(--border)] inline-block w-full max-w-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--blue)] block mb-1">
                      Derived Holland Code Preview
                    </span>
                    <div className="text-3xl font-black text-[var(--blue)] heading-font tracking-wider">
                      {previewHolland || 'IRA'}
                    </div>
                    <p className="text-[11px] text-[var(--graphite)] mt-1">
                      Based on your 18 personality statement ratings
                    </p>
                  </div>
                </div>

                {/* Summary Details Card */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-5 shadow-sm space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                    <span className="text-[var(--graphite)]">Academic CGPA</span>
                    <span className="font-bold text-[var(--ink)]">{answers.cgpa} / 5.00</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                    <span className="text-[var(--graphite)]">Personality Dimensions</span>
                    <span className="font-bold text-[var(--blue)]">18 Statements Rated</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                    <span className="text-[var(--graphite)]">Self-Efficacy Fields</span>
                    <span className="font-bold text-[var(--ink)]">7 Disciplines Rated</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                    <span className="text-[var(--graphite)]">Learning Style</span>
                    <span className="font-bold text-[var(--ink)] capitalize">{answers.learningStyle.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[var(--graphite)]">Prior Experience Tags</span>
                    <span className="font-bold text-[var(--ink)]">{answers.priorExperiences.length} selected</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── STICKY BOTTOM ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] p-4">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              if (step === 2) handlePrevInStep2();
              else if (step > 1) { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              else handleExit();
            }}
            className="px-4 py-3 rounded-2xl bg-[var(--mist)] text-[var(--graphite)] font-bold text-xs hover:text-[var(--ink)] active:scale-95 transition-all"
          >
            {step === 1 ? 'Exit' : 'Back'}
          </button>

          {/* Primary Action Button */}
          {step < 5 ? (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => {
                if (step === 2) handleNextInStep2();
                else { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              }}
              className="flex-1 py-3 px-5 rounded-2xl bg-[var(--blue)] text-white font-bold text-xs shadow-sm hover:bg-[var(--azure)] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              <span>{step === 2 && riasecDimIdx < 5 ? `Next Trait (${riasecDimIdx + 2}/6)` : 'Continue'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[var(--blue)] to-[var(--azure)] text-white font-extrabold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 heading-font"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Matches...</span>
                </>
              ) : (
                <>
                  <span>Generate Career Matches</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
