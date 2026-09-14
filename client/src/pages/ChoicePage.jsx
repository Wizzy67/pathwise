import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

const ChoicePage = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX - touchEndX;
    if (swipeDistance > 50) {
      setActiveTab('login');
    } else if (swipeDistance < -50) {
      setActiveTab('register');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-[#0F172A] flex flex-col relative overflow-hidden font-sans selection:bg-[#EEF2F9] selection:text-[#20428B]">
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-down {
          animation: fadeInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .anim-up-1 {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .anim-up-2 {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        .choice-card-shadow {
          box-shadow: 0 4px 20px -4px rgba(32, 66, 139, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .choice-card-shadow:hover {
          box-shadow: 0 16px 36px -8px rgba(32, 66, 139, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* Subtle Ambient Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-b from-[#EEF2F9]/80 via-[#EEF2F9]/30 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 right-0 w-[450px] h-[350px] bg-[#EEF2F9]/40 blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <PathWiseLogo href="/" size={32} textColor="#0F172A" />

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#20428B] bg-[#EEF2F9] hover:bg-[#E0E7F5] border border-[#CBD5E1]/60 transition-all duration-200 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-5xl mx-auto w-full z-10">
        
        {/* Step / Portal Badge */}
        <div className="anim-down inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2F9] border border-[#CBD5E1]/80 text-[#20428B] text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
          <GraduationCap className="w-4 h-4 text-[#20428B]" />
          <span>DELSU Career & Academic Portal</span>
        </div>

        {/* Headings */}
        <h1 className="anim-down font-outfit text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] text-center tracking-tight max-w-xl leading-tight mb-3">
          How would you like to get started?
        </h1>
        <p className="anim-down text-[#64748B] text-sm sm:text-base text-center max-w-md mb-8 sm:mb-12 leading-relaxed">
          Select an option below to take the career assessment or pick up right where you left off.
        </p>

        {/* ─── DESKTOP DUAL CARDS (Hidden on small mobile) ─── */}
        <div className="hidden md:grid grid-cols-2 gap-6 lg:gap-8 w-full max-w-4xl">
          
          {/* Card 1: Register (New Student) */}
          <Link
            to="/register"
            className="anim-up-1 choice-card-shadow group relative flex flex-col bg-white border border-[#E2E8F0] hover:border-[#20428B] rounded-2xl p-7 lg:p-8 transition-all duration-300 hover:-translate-y-1 text-left no-underline"
          >
            {/* Top Row: Badge */}
            <div className="flex items-center justify-start mb-6">
              <span className="inline-flex items-center text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#20428B] text-white shadow-xs">
                New Student
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="font-outfit text-xl lg:text-2xl font-bold text-[#0F172A] group-hover:text-[#20428B] transition-colors duration-200 mb-2">
              New to PathWise?
            </h2>
            <p className="text-xs lg:text-sm text-[#64748B] leading-relaxed mb-6">
              Create your student profile to discover high-affinity career paths, explore your RIASEC code, and map out your degree.
            </p>

            {/* Value Proposition Perks */}
            <div className="flex flex-col gap-2.5 mb-8 flex-1">
              <div className="flex items-center gap-2.5 text-xs lg:text-sm text-[#334155]">
                <div className="w-4 h-4 rounded-full bg-[#EEF2F9] text-[#20428B] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>15-Minute RIASEC Career Matching</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs lg:text-sm text-[#334155]">
                <div className="w-4 h-4 rounded-full bg-[#EEF2F9] text-[#20428B] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>DELSU Semester Course Roadmap</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs lg:text-sm text-[#334155]">
                <div className="w-4 h-4 rounded-full bg-[#EEF2F9] text-[#20428B] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>24/7 AI Academic & Career Advisor</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs lg:text-sm text-[#334155]">
                <div className="w-4 h-4 rounded-full bg-[#EEF2F9] text-[#20428B] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Save, compare, and track dream roles</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="w-full py-3 px-4 rounded-xl bg-[#20428B] group-hover:bg-[#2A52A8] text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-sm transition-all duration-200">
              <span>Create Free Student Account</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Login (Returning Student) */}
          <Link
            to="/login"
            className="anim-up-2 choice-card-shadow group relative flex flex-col bg-white border border-[#E2E8F0] hover:border-[#20428B] rounded-2xl p-7 lg:p-8 transition-all duration-300 hover:-translate-y-1 text-left no-underline"
          >
            {/* Top Row: Icon and Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF2F9] border border-[#CBD5E1]/60 flex items-center justify-center text-[#20428B] group-hover:bg-[#20428B] group-hover:text-white transition-colors duration-300 shadow-sm">
                <UserCheck className="w-7 h-7" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#EEF2F9] text-[#20428B] border border-[#CBD5E1]/80">
                Welcome Back
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="font-outfit text-xl lg:text-2xl font-bold text-[#0F172A] group-hover:text-[#20428B] transition-colors duration-200 mb-2">
              Already have an account?
            </h2>
            <p className="text-xs lg:text-sm text-[#64748B] leading-relaxed mb-6">
              Sign in with your matric number or email to access your personal dashboard, saved career analysis, and study tools.
            </p>

            {/* Value Proposition Perks */}
            <div className="flex flex-col gap-2.5 mb-8 flex-1">
              <div className="flex items-center gap-2.5 text-xs lg:text-sm text-[#334155]">
                <div className="w-4 h-4 rounded-full bg-[#EEF2F9] text-[#20428B] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Access your saved RIASEC matches</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs lg:text-sm text-[#334155]">
                <div className="w-4 h-4 rounded-full bg-[#EEF2F9] text-[#20428B] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Resume ongoing chats with AI Advisor</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs lg:text-sm text-[#334155]">
                <div className="w-4 h-4 rounded-full bg-[#EEF2F9] text-[#20428B] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Monitor CGPA progress & targets</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs lg:text-sm text-[#334155]">
                <div className="w-4 h-4 rounded-full bg-[#EEF2F9] text-[#20428B] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Export comprehensive Career Report PDF</span>
              </div>
            </div>

            {/* Secondary Action Button */}
            <div className="w-full py-3 px-4 rounded-xl bg-[#EEF2F9] hover:bg-[#E0E7F5] border border-[#CBD5E1]/80 text-[#20428B] font-bold text-sm text-center flex items-center justify-center gap-2 transition-all duration-200">
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </Link>

        </div>

        {/* ─── MOBILE VIEW (Single Focused Card with Interactive Slider) ─── */}
        <div className="md:hidden flex flex-col items-center w-full max-w-[360px]">
          
          {/* Sliding Tab Switcher */}
          <div className="flex p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-full mb-5 w-full relative shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-300 relative z-10 flex items-center justify-center ${
                activeTab === 'register' ? 'text-white' : 'text-[#64748B]'
              }`}
            >
              <span>Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-300 relative z-10 flex items-center justify-center ${
                activeTab === 'login' ? 'text-white' : 'text-[#64748B]'
              }`}
            >
              <span>Sign In</span>
            </button>

            {/* Active Pill Slider */}
            <div
              className="absolute top-1 bottom-1 bg-[#20428B] rounded-full transition-all duration-300 shadow-sm"
              style={{
                width: 'calc(50% - 4px)',
                left: activeTab === 'register' ? '4px' : 'calc(50%)',
              }}
            />
          </div>

          {/* Touch Swipeable Card Wrapper */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full"
          >
            {activeTab === 'register' ? (
              <Link
                to="/register"
                className="choice-card-shadow block bg-white border border-[#20428B]/30 rounded-2xl p-6 text-left no-underline"
              >
                <div className="flex items-center justify-start mb-4">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#20428B] text-white">
                    New Student
                  </span>
                </div>

                <h3 className="font-outfit text-lg font-bold text-[#0F172A] mb-1.5">
                  New to PathWise?
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Create your profile to start your RIASEC career assessment and build your semester-by-semester roadmap.
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-[#334155]">
                    <Check className="w-3.5 h-3.5 text-[#20428B] stroke-[3]" />
                    <span>AI-powered career matching</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#334155]">
                    <Check className="w-3.5 h-3.5 text-[#20428B] stroke-[3]" />
                    <span>DELSU semester course roadmap</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#334155]">
                    <Check className="w-3.5 h-3.5 text-[#20428B] stroke-[3]" />
                    <span>24/7 AI Academic Advisor</span>
                  </div>
                </div>

                <div className="w-full py-2.5 px-4 rounded-xl bg-[#20428B] text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm">
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ) : (
              <Link
                to="/login"
                className="choice-card-shadow block bg-white border border-[#CBD5E1] rounded-2xl p-6 text-left no-underline"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EEF2F9] text-[#20428B] flex items-center justify-center shadow-xs">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EEF2F9] text-[#20428B] border border-[#CBD5E1]/70">
                    Welcome Back
                  </span>
                </div>

                <h3 className="font-outfit text-lg font-bold text-[#0F172A] mb-1.5">
                  Already have an account?
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Sign in with your matric number or email to access your saved career assessment and track progress.
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-[#334155]">
                    <Check className="w-3.5 h-3.5 text-[#20428B] stroke-[3]" />
                    <span>View your RIASEC matches</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#334155]">
                    <Check className="w-3.5 h-3.5 text-[#20428B] stroke-[3]" />
                    <span>Resume your course roadmap</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#334155]">
                    <Check className="w-3.5 h-3.5 text-[#20428B] stroke-[3]" />
                    <span>Continue AI Advisor chats</span>
                  </div>
                </div>

                <div className="w-full py-2.5 px-4 rounded-xl bg-[#EEF2F9] border border-[#CBD5E1] text-[#20428B] font-bold text-xs text-center flex items-center justify-center gap-1.5">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            )}
          </div>

          {/* Swipe indicator dots */}
          <div className="flex gap-2 justify-center mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeTab === 'register' ? 'bg-[#20428B] w-5' : 'bg-[#CBD5E1]'
              }`}
              aria-label="New Student tab"
            />
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeTab === 'login' ? 'bg-[#20428B] w-5' : 'bg-[#CBD5E1]'
              }`}
              aria-label="Sign In tab"
            />
          </div>

        </div>

        {/* Micro Trust / Security Footer */}
        <div className="mt-12 sm:mt-16 flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
          <ShieldCheck className="w-4 h-4 text-[#20428B]" />
          <span>Secure student portal • Delta State University, Abraka</span>
        </div>

      </main>
    </div>
  );
};

export default ChoicePage;

