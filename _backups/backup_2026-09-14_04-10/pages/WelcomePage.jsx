import { useState } from 'react';
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
  Briefcase
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

const ONBOARDING_STEPS = [
  {
    badge: 'Welcome to PathWise',
    title: 'Your Personal Career Companion',
    subtitle: 'Calibrated for Delta State University (DELSU) students',
    description: 'PathWise connects your academic profile, vocational personality, and career goals to help you choose the right path and course electives with confidence.',
    icon: Compass,
    accentColor: '#20428B',
    features: [
      'Tailored to DELSU departmental curricula',
      'Instant career-to-course mapping',
      'Built specifically for mobile accessibility'
    ]
  },
  {
    badge: 'Step 1 · Assessment',
    title: 'Discover Your Holland Code',
    subtitle: 'Multi-Theory RIASEC & Self-Efficacy Engine',
    description: 'Take our 5-minute vocational assessment. Our 100-point algorithm scores your interests across 6 dimensions and pairs you with high-affinity Nigerian careers.',
    icon: Target,
    accentColor: '#FF6B35',
    features: [
      '18 quick, practical Likert statements',
      'Evaluates CGPA, skills, and work values',
      'Outputs your official 3-letter Holland Code'
    ]
  },
  {
    badge: 'Step 2 · Exploration',
    title: 'Explore Careers & Jobs',
    subtitle: 'Curated Nigerian Graduate Opportunities',
    description: 'Browse over 50 structured career profiles and explore entry-level job postings from top Nigerian companies with salary benchmarks and required skills.',
    icon: Briefcase,
    accentColor: '#17A589',
    features: [
      'Realistic Nigerian entry-level salary ranges',
      'Verified corporate and public sector roles',
      'Bookmark and compare your top choices'
    ]
  },
  {
    badge: 'Step 3 · AI Advisor',
    title: '24/7 Academic Guidance',
    subtitle: 'Speak in Standard English or Nigerian Pidgin',
    description: 'Chat with your AI advisor about SIWES, project topics, elective choices, or exam prep. Grounded in DELSU course outlines with offline fallback support.',
    icon: Brain,
    accentColor: '#9B59B6',
    features: [
      'Bilingual support (English & Pidgin)',
      'Generates custom weekly study plans',
      'Multi-session chat history saved to your account'
    ]
  },
  {
    badge: 'Step 4 · Navigation',
    title: 'One-Thumb Mobile Experience',
    subtitle: 'Everything right at your fingertips',
    description: 'Use the new Mobile Bottom Bar to jump between your Dashboard, Explore, Assessment, and AI Advisor seamlessly without digging through menus.',
    icon: Sparkles,
    accentColor: '#20428B',
    features: [
      'Persistent bottom navigation on mobile',
      'Fast, lightweight PWA performance',
      'Clean light theme with high-contrast text'
    ]
  }
];

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

  const displayName = user?.fullName?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-[100dvh] bg-[var(--canvas)] text-[var(--ink)] flex flex-col justify-between select-none relative overflow-hidden">
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

      {/* Top Header Bar */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between z-10 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0">
        <PathWiseLogo href="/welcome" size={28} />
        
        <button
          onClick={handleComplete}
          className="text-xs font-bold text-[var(--graphite)] hover:text-[var(--blue)] px-3 py-1.5 rounded-full hover:bg-[var(--lavender)] transition-all"
        >
          Skip to Dashboard
        </button>
      </header>

      {/* Main Slide Card Area */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 max-w-lg mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col relative overflow-hidden"
          >
            {/* Ambient subtle glow blob */}
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-20 blur-2xl pointer-events-none"
              style={{ backgroundColor: step.accentColor }}
            />

            {/* Step Counter Badge */}
            <div className="flex items-center justify-between mb-6">
              <span
                className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border"
                style={{
                  color: step.accentColor,
                  borderColor: `${step.accentColor}33`,
                  backgroundColor: `${step.accentColor}10`
                }}
              >
                {step.badge}
              </span>
              <span className="text-xs font-bold text-[var(--ash)]">
                {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>

            {/* Icon Graphic */}
            <div className="mb-5 flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{
                  backgroundColor: `${step.accentColor}18`,
                  color: step.accentColor
                }}
              >
                <StepIcon className="w-8 h-8" strokeWidth={2.2} />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] heading-font leading-tight">
                  {currentStep === 0 ? `Hello, ${displayName}!` : step.title}
                </h1>
                <p className="text-xs font-semibold text-[var(--graphite)] mt-1">
                  {step.subtitle}
                </p>
              </div>
            </div>

            {/* Description Body */}
            <p className="text-sm text-[var(--graphite)] leading-relaxed mb-6 body-font">
              {step.description}
            </p>

            {/* Feature Checklist */}
            <div className="space-y-2.5 bg-[var(--mist)] p-4 rounded-2xl border border-[var(--border)] mb-2">
              {step.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-[var(--ink)]">
                  <CheckCircle2
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: step.accentColor }}
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Controls Bar */}
      <footer className="px-5 pb-6 pt-2 max-w-lg mx-auto w-full z-10 flex flex-col gap-4">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {ONBOARDING_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-8 bg-[var(--blue)]'
                  : 'w-2 bg-[var(--ash)] opacity-40 hover:opacity-80'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--fog)] active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {isLast ? (
            <div className="flex-1 flex gap-2">
              <button
                onClick={handleComplete}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] font-bold text-sm hover:bg-[var(--fog)] active:scale-95 transition-all text-center"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[var(--blue)] text-white font-bold text-sm hover:bg-[var(--azure)] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Start Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[var(--blue)] text-white font-bold text-sm hover:bg-[var(--azure)] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;