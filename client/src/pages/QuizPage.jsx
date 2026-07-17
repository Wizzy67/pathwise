import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Loader2, GraduationCap,
  Settings, Search, Palette, Users, TrendingUp, ClipboardList,
  Coins, Heart, Shield, Award, Compass, Wrench, BookOpen,
  Lightbulb, Flag, CheckCircle2, X
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
    key: 'I', label: 'Investigative', color: '#0056FF', icon: Search,
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
  { key: 'coding',      label: 'Coding / App Development' },
  { key: 'research',    label: 'Research / Lab Work' },
  { key: 'writing',     label: 'Writing / Journalism / Blogging' },
  { key: 'healthcare',  label: 'Healthcare / Clinic Volunteering' },
  { key: 'design',      label: 'Graphic Design / Digital Art' },
  { key: 'debate',      label: 'Public Speaking / Debate' },
  { key: 'business',    label: 'Business / Entrepreneurship' },
  { key: 'community',   label: 'Community Service / NGO Work' },
  { key: 'teaching',    label: 'Teaching / Tutoring Peers' },
  { key: 'arts',        label: 'Music / Performance / Film' },
  { key: 'hands_on',   label: 'Technical / Hands-on Projects' },
  { key: 'math',        label: 'Mathematics / Statistics Competitions' },
];

// ── Constructivist: Learning Styles ───────────────────────────────────
const LEARNING_STYLES = [
  { key: 'hands_on',     label: 'Hands-on practice',      icon: Wrench,        desc: 'Learning by doing physical tasks' },
  { key: 'research',     label: 'Research & Reading',      icon: BookOpen,      desc: 'Independent study and deep analysis' },
  { key: 'creative',     label: 'Creative exploration',    icon: Lightbulb,     desc: 'Experimenting and innovating freely' },
  { key: 'collaborative',label: 'Group collaboration',     icon: Users,         desc: 'Learning through discussion and teamwork' },
  { key: 'leadership',   label: 'Leading projects',        icon: Flag,          desc: 'Learning by organizing and directing others' },
  { key: 'structured',   label: 'Structured study',        icon: ClipboardList, desc: 'Following clear guidelines and schedules' },
];

const STEPS = [
  { id: 1, label: 'About You' },
  { id: 2, label: 'Personality' },
  { id: 3, label: 'Confidence' },
  { id: 4, label: 'Preferences' },
  { id: 5, label: 'Review' },
];

// Rating labels for Likert scale
const RATING_LABELS = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

const QuizPage = () => {
  const [step, setStep] = useState(1);
  // Sub-screen within Step 2 (0-5 = each RIASEC dimension)
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

  // ── Helpers ──────────────────────────────────────────────────────────
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

  // ── Preview Holland Code (for review step) ────────────────────────
  const previewHolland = useMemo(() => {
    const raw = {};
    RIASEC_DIMENSIONS.forEach(d => {
      raw[d.key] = (answers.riasec[d.key] || []).reduce((s, r) => s + (parseInt(r) || 0), 0);
    });
    const sorted = Object.entries(raw).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([k]) => k).join('');
  }, [answers.riasec]);

  // ── Validation ────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return answers.cgpa !== '';
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
    } else {
      setStep(3);
      setRiasecDimIdx(0);
    }
  };

  const handlePrevInStep2 = () => {
    if (riasecDimIdx > 0) {
      setRiasecDimIdx(i => i - 1);
    } else {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/quiz/results', { answers });
      addNotification('Assessment complete! Generating your personalised career matches…', 'success');
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

  // ── Current RIASEC dimension data ────────────────────────────────
  const currentDim = RIASEC_DIMENSIONS[riasecDimIdx];

  return (
    <div className="min-h-screen bg-pw-black flex flex-col items-center py-10 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(0,86,255,0.04)' }} />

      {/* Header bar with Back / Exit */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 px-2 z-20">
        <PathWiseLogo size={32} />
        
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pw-white/10 bg-pw-surface hover:bg-pw-surface2 text-pw-gray hover:text-pw-white text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <X className="w-3.5 h-3.5" /> Exit Assessment
        </button>
      </div>



      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-10 w-full max-w-2xl px-2">
        {STEPS.map((s, i) => {
          const isActive    = s.id === step;
          const isCompleted = s.id < step;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs z-10 transition-all ${
                  isCompleted ? 'bg-pw-blue text-white shadow-[0_0_10px_rgba(0,86,255,0.3)]' :
                  isActive    ? 'bg-pw-blue text-white shadow-[0_0_18px_rgba(0,86,255,0.5)] ring-4 ring-pw-blue/15' :
                  'bg-pw-surface border border-pw-white/10 text-pw-gray'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className={`absolute -bottom-6 text-[9px] whitespace-nowrap tracking-wider uppercase font-bold ${
                  isActive ? 'text-pw-blue' : 'text-pw-gray/40'
                }`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-2 transition-all duration-500 ${isCompleted ? 'bg-pw-blue' : 'bg-pw-white/5'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Personality sub-progress bar (only in step 2) */}
      {step === 2 && (
        <div className="w-full max-w-2xl mb-4 px-2">
          <div className="flex gap-1">
            {RIASEC_DIMENSIONS.map((d, i) => (
              <div key={d.key} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{ backgroundColor: i <= riasecDimIdx ? d.color : 'rgba(255,255,255,0.07)' }} />
            ))}
          </div>
          <p className="text-[10px] text-pw-gray mt-2 text-center">
            Trait {riasecDimIdx + 1} of 6 — <span className="font-bold" style={{ color: currentDim.color }}>{currentDim.label}</span>
          </p>
        </div>
      )}

      {/* Card Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${riasecDimIdx}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="w-full max-w-2xl bg-pw-surface border border-pw-white/8 rounded-2xl p-6 sm:p-8 shadow-xl mt-4"
        >

          {/* ── STEP 1: Academic Profile ───────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="text-pw-white text-xl font-bold text-center mb-1 flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5 text-pw-blue" /> Academic Profile
              </h2>
              <p className="text-pw-gray text-xs text-center mb-8">
                Your CGPA calibrates career match scores against DELSU course pre-requisites.
              </p>
              <div className="max-w-xs mx-auto space-y-4">
                <div>
                  <label className="text-pw-gray text-xs font-semibold uppercase tracking-wider block mb-2">Current CGPA (0.00 – 5.00)</label>
                  <input
                    type="number" step="0.01" min="0" max="5"
                    value={answers.cgpa}
                    onChange={e => setAnswers(p => ({ ...p, cgpa: e.target.value }))}
                    placeholder="e.g. 4.20"
                    className="w-full bg-pw-black/40 border border-pw-white/10 focus:border-pw-blue rounded-xl px-4 py-3 text-sm text-pw-white placeholder-pw-gray/30 focus:outline-none transition-all"
                  />
                </div>
                <div className="mt-6 p-4 rounded-xl bg-pw-blue/5 border border-pw-blue/15">
                  <p className="text-xs text-pw-gray leading-relaxed">
                    PathWise uses a <span className="text-pw-blue font-bold">multi-dimensional intelligence engine</span> that analyses your personality, confidence levels, core values, and background — giving you the most accurate career match possible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: RIASEC Dimensions (3 statements per sub-screen) ── */}
          {step === 2 && (
            <div>
              {/* Dimension header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: currentDim.color + '20', border: `1.5px solid ${currentDim.color}55` }}>
                  {<currentDim.icon className="w-5 h-5" style={{ color: currentDim.color }} />}
                </div>
                <div>
                  <h2 className="text-pw-white text-lg font-bold leading-tight">{currentDim.label}</h2>
                  <p className="text-pw-gray text-xs">{currentDim.desc}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: currentDim.color + '22', color: currentDim.color }}>
                    Trait {riasecDimIdx + 1}/6
                  </span>
                </div>
              </div>

              <p className="text-pw-gray text-xs text-center mb-6 border-b border-pw-white/5 pb-4">
                Rate each statement from <span className="text-red-400 font-bold">1 (Strongly Disagree)</span> to <span className="text-pw-blue font-bold">5 (Strongly Agree)</span>
              </p>

              <div className="space-y-6">
                {currentDim.statements.map((stmt, idx) => {
                  const rating = answers.riasec[currentDim.key]?.[idx];
                  return (
                    <div key={idx}>
                      <p className="text-pw-white text-sm font-medium leading-relaxed mb-3">{stmt}</p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRiasecRating(currentDim.key, idx, n)}
                            title={RATING_LABELS[n]}
                            className="flex-1 py-3 rounded-xl text-sm font-extrabold transition-all border"
                            style={{
                              backgroundColor: rating === n ? currentDim.color : 'rgba(255,255,255,0.03)',
                              borderColor: rating === n ? currentDim.color : 'rgba(255,255,255,0.08)',
                              color: rating === n ? '#fff' : '#8B9CC8',
                              boxShadow: rating === n ? `0 0 14px ${currentDim.color}55` : 'none',
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      {rating && (
                        <p className="text-[10px] text-pw-gray mt-1.5 text-right">{RATING_LABELS[rating]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 3: SCCT Self-Efficacy ────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="text-pw-white text-xl font-bold text-center mb-1">Career Confidence</h2>
              <p className="text-pw-gray text-xs text-center mb-2">
                How confident do you feel in your ability to succeed in each of these fields?
              </p>
              <p className="text-pw-gray/60 text-[10px] text-center mb-6">1 = Not at all confident · 5 = Very confident</p>
              <div className="space-y-5">
                {SELF_EFFICACY_ITEMS.map(item => {
                  const rating = answers.selfEfficacy[item.field];
                  return (
                    <div key={item.field}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-pw-white text-sm font-bold">{item.label}</p>
                          <p className="text-pw-gray text-xs">{item.desc}</p>
                        </div>
                        {rating && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 ml-2 flex-shrink-0">{rating}/5</span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setSelfEfficacy(item.field, n)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all border"
                            style={{
                              backgroundColor: rating === n ? '#27AE60' : 'rgba(255,255,255,0.03)',
                              borderColor: rating === n ? '#27AE60' : 'rgba(255,255,255,0.08)',
                              color: rating === n ? '#fff' : '#8B9CC8',
                              boxShadow: rating === n ? '0 0 12px #27AE6055' : 'none',
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 4: Career Values + Constructivist ────────────────── */}
          {step === 4 && (
            <div className="space-y-8">
              {/* Outcome Expectations */}
              <div>
                <h2 className="text-pw-white text-lg font-bold mb-1">What Matters to You</h2>
                <p className="text-pw-gray text-xs mb-5">
                  What do you most value in a career? Rate each from 1 (not important) to 5 (essential).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OUTCOME_ITEMS.map(item => {
                    const val = answers.outcomeExpectations[item.key];
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="p-4 rounded-xl border border-pw-white/8 bg-pw-black/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-lg bg-pw-blue/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-pw-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-pw-white text-xs font-bold truncate">{item.label}</p>
                            <p className="text-pw-gray text-[10px] truncate">{item.desc}</p>
                          </div>
                          {val && <span className="text-xs font-bold text-pw-blue flex-shrink-0">{val}/5</span>}
                        </div>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setOutcome(item.key, n)}
                              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                              style={{
                                backgroundColor: val === n ? '#0056FF' : 'rgba(255,255,255,0.05)',
                                color: val === n ? '#fff' : '#8B9CC8',
                                boxShadow: val === n ? '0 0 10px #0056FF44' : 'none',
                              }}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prior Experiences */}
              <div>
                <h3 className="text-pw-white text-base font-bold mb-1">Your Background</h3>
                <p className="text-pw-gray text-xs mb-4">
                  Which of these have you explored or tried before? Select all that apply.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRIOR_EXP.map(exp => {
                    const sel = answers.priorExperiences.includes(exp.key);
                    return (
                      <button
                        key={exp.key}
                        type="button"
                        onClick={() => toggleExp(exp.key)}
                        className="p-3 rounded-xl border text-xs font-bold text-left transition-all"
                        style={{
                          borderColor: sel ? '#9B59B6' : 'rgba(255,255,255,0.08)',
                          backgroundColor: sel ? '#9B59B611' : 'rgba(255,255,255,0.02)',
                          color: sel ? '#9B59B6' : '#8B9CC8',
                          boxShadow: sel ? '0 0 10px #9B59B633' : 'none',
                        }}
                      >
                        {exp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Learning Style */}
              <div>
                <h3 className="text-pw-white text-base font-bold mb-1">How Do You Learn Best?</h3>
                <p className="text-pw-gray text-xs mb-4">
                  Choose the style that best describes how you absorb and apply new knowledge.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LEARNING_STYLES.map(ls => {
                    const Icon = ls.icon;
                    const sel = answers.learningStyle === ls.key;
                    return (
                      <button
                        key={ls.key}
                        type="button"
                        onClick={() => setAnswers(p => ({ ...p, learningStyle: ls.key }))}
                        className="p-3.5 rounded-xl border transition-all flex flex-col gap-2"
                        style={{
                          borderColor: sel ? '#9B59B6' : 'rgba(255,255,255,0.08)',
                          backgroundColor: sel ? '#9B59B611' : 'rgba(255,255,255,0.02)',
                          boxShadow: sel ? '0 0 12px #9B59B633' : 'none',
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: sel ? '#9B59B6' : '#8B9CC8' }} />
                        <div>
                          <p className="text-xs font-bold text-left" style={{ color: sel ? '#9B59B6' : '#fff' }}>{ls.label}</p>
                          <p className="text-[10px] text-pw-gray text-left leading-tight mt-0.5">{ls.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Review & Submit ───────────────────────────────── */}
          {step === 5 && (
            <div>
              <h2 className="text-pw-white text-xl font-bold text-center mb-1">Almost There!</h2>
              <p className="text-pw-gray text-xs text-center mb-6">Review your profile before we generate your personalised career matches.</p>

              {/* Career Type Preview */}
              <div className="text-center mb-6 p-5 rounded-2xl border border-pw-blue/20 bg-pw-blue/5">
                <p className="text-pw-gray text-xs mb-2 uppercase tracking-wider font-bold">Your Career Personality Type</p>
                <div className="flex justify-center gap-2 mb-2">
                  {previewHolland.split('').map((letter, i) => {
                    const dim = RIASEC_DIMENSIONS.find(d => d.key === letter);
                    return (
                      <div key={i} className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-extrabold text-white"
                        style={{ background: `linear-gradient(135deg, ${dim?.color || '#0056FF'}, ${dim?.color || '#0056FF'}99)`, boxShadow: `0 0 18px ${dim?.color || '#0056FF'}44` }}>
                        {letter}
                      </div>
                    );
                  })}
                </div>
                <p className="text-pw-gray text-xs">
                  {previewHolland.split('').map(k => RIASEC_DIMENSIONS.find(d => d.key === k)?.label).join(' · ')}
                </p>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-pw-white/3 border border-pw-white/8">
                  <p className="text-pw-gray text-xs">CGPA</p>
                  <p className="text-pw-white font-bold">{answers.cgpa || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-pw-white/3 border border-pw-white/8">
                  <p className="text-pw-gray text-xs">Learning Style</p>
                  <p className="text-pw-white font-bold capitalize">{answers.learningStyle?.replace('_', ' ') || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-pw-white/3 border border-pw-white/8">
                  <p className="text-pw-gray text-xs">Prior Experiences</p>
                  <p className="text-pw-white font-bold">{answers.priorExperiences.length} selected</p>
                </div>
                <div className="p-3 rounded-xl bg-pw-white/3 border border-pw-white/8">
                  <p className="text-pw-gray text-xs">Top Career Value</p>
                  <p className="text-pw-white font-bold capitalize">
                    {Object.entries(answers.outcomeExpectations).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
                  </p>
                </div>
              </div>

              <p className="text-pw-gray text-xs text-center">
                Submitting will run PathWise's intelligence engine to generate your personalised career matches and personality profile.
              </p>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex justify-between w-full max-w-2xl mt-6 px-2">
        <button
          onClick={() => {
            if (step === 2) handlePrevInStep2();
            else setStep(s => Math.max(1, s - 1));
          }}
          disabled={step === 1 && riasecDimIdx === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-pw-white/10 bg-pw-surface text-pw-gray text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none hover:text-pw-white hover:border-pw-white/20 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {step < 5 ? (
          <button
            onClick={() => {
              if (step === 2) handleNextInStep2();
              else setStep(s => s + 1);
            }}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pw-blue text-white text-xs font-bold hover:bg-pw-azure disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(0,86,255,0.25)] hover:shadow-[0_0_22px_rgba(0,86,255,0.4)] disabled:pointer-events-none active:scale-95"
          >
            {step === 2 && riasecDimIdx < 5 ? `Next: ${RIASEC_DIMENSIONS[riasecDimIdx + 1]?.label}` : 'Next Step'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-pw-blue text-white text-xs font-bold hover:bg-pw-azure disabled:opacity-60 transition-all shadow-[0_0_15px_rgba(0,86,255,0.25)] hover:shadow-[0_0_22px_rgba(0,86,255,0.4)] disabled:pointer-events-none active:scale-95"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Profile…</>
            ) : (
              'Generate My Career Matches'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
