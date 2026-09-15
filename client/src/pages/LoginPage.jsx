import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useModal } from '../contexts/ModalContext';
import api from '../services/api';
import {
  Mail, Eye, EyeOff, Lock, ArrowRight, ArrowLeft,
  User, Compass, CheckCircle2, ShieldCheck
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

/* ─── AUTHENTICATING OVERLAY ─────────────────────────────── */
const AuthenticatingScreen = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => { setCurrentStep(1); setProgress(45); }, 300),
      setTimeout(() => { setCurrentStep(2); setProgress(80); }, 700),
      setTimeout(() => { setCurrentStep(3); setProgress(100); setIsSuccess(true); }, 1100),
      setTimeout(() => { if (onSuccess) onSuccess(); }, 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onSuccess]);

  const steps = [
    { label: 'Verifying credentials',  sub: 'Matriculation validation' },
    { label: 'Securing session',        sub: 'JWT token generation' },
    { label: 'Loading workspace',       sub: 'DELSU student profile' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFBFD] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#EEF2F9]/80 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[350px] h-[250px] bg-[#EEF2F9]/50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-lg text-center space-y-6 relative z-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2F9] border border-[#CBD5E1]/70 text-[10px] font-extrabold uppercase tracking-wider text-[#20428B]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DELSU Secure Gateway</span>
        </div>

        {/* Animated emblem */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          {!isSuccess ? (
            <div
              className="absolute inset-0 rounded-full border-[3px] border-[#EEF2F9] animate-spin"
              style={{ borderTopColor: '#20428B' }}
            />
          ) : (
            <div className="absolute inset-0 rounded-full bg-emerald-50 border-2 border-emerald-400/40 transition-all duration-300" />
          )}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all duration-500 ${
            isSuccess ? 'bg-emerald-500 text-white' : 'bg-[#20428B] text-white'
          }`}>
            {isSuccess
              ? <CheckCircle2 className="w-7 h-7 text-white" />
              : <Compass className="w-7 h-7 text-white animate-pulse" />
            }
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold font-outfit text-[#0F172A] tracking-tight">
            {isSuccess ? 'Welcome Back!' : 'Authenticating...'}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            {isSuccess ? 'Session verified. Opening your dashboard...' : 'Verifying your institutional credentials'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-2 rounded-full bg-[#EEF2F9] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#20428B] to-[#2A52A8] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#94A3B8] font-bold">
            <span>Authentication</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2 text-left bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5">
          {steps.map((s, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-white text-[#20428B] shadow-sm font-bold'
                    : isDone
                    ? 'text-[#0F172A] font-semibold'
                    : 'text-[#94A3B8] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-[#EEF2F9] text-[#20428B]'
                      : 'bg-[#E2E8F0] text-[#94A3B8]'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className="text-xs truncate">{s.label}</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium">
                  {isDone ? 'Done' : isCurrent ? 'Verifying...' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-[10px] text-[#94A3B8] flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-[#20428B]" />
          <span>256-Bit Encrypted Academic Portal</span>
        </div>
      </div>
    </div>
  );
};

/* ─── LOGIN PAGE ──────────────────────────────────────────── */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const { alert } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('forgot') === 'true') {
      setShowForgotModal(true);
    }
  }, [searchParams]);

  const handleTerms = () => {
    alert({
      title: 'Terms of Service',
      message: 'PathWise is an academic career advisory system designed for DELSU students. All recommendations and RIASEC matches are guidance recommendations to assist your studies.',
      confirmText: 'I Understand',
      variant: 'brand',
      icon: 'info',
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const trimmed = email.trim();
      const res = await api.post('/auth/login', { matricNo: trimmed, email: trimmed, password });
      await login(res.data.token, res.data.user);
      setShowAuthScreen(true);
    } catch (error) {
      addNotification(error.response?.data?.error || 'Login failed. Check your credentials.', 'error');
      setIsSubmitting(false);
    }
  };

  if (showAuthScreen) {
    return <AuthenticatingScreen onSuccess={() => navigate('/dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .log-field-anim { animation: fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .log-input {
          width: 100%;
          padding: 0.75rem 2.8rem 0.75rem 2.75rem;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #0F172A;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .log-input::placeholder { color: #94A3B8; }
        .log-input:focus {
          border-color: #20428B;
          box-shadow: 0 0 0 3px rgba(32,66,139,0.1);
        }
        .log-icon-left {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }
        .log-input-wrap:focus-within .log-icon-left { color: #20428B; }
        .log-icon-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .log-icon-btn:hover { color: #20428B; }
        .left-panel-pattern {
          background-color: #1A346C;
          background-image:
            radial-gradient(circle at 15% 15%, rgba(255,255,255,0.07) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(32,66,139,0.9) 0%, transparent 55%);
        }
      `}</style>

      {/* ── Split Panel ── */}
      <div className="flex flex-1 min-h-screen">

        {/* Left — Blue Branding */}
        <aside className="hidden lg:flex lg:w-[42%] xl:w-[38%] left-panel-pattern flex-col justify-between px-10 xl:px-14 py-12 min-h-screen">
          <div>
            <div className="mb-10">
              <PathWiseLogo href="/" size={28} textColor="#ffffff" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold tracking-wide uppercase mb-8">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DELSU Secure Portal</span>
            </div>

            <h2 className="text-white font-outfit text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Welcome back<br />
              <span className="text-[#93B4E8]">to PathWise.</span>
            </h2>

            <p className="text-white/65 text-sm leading-relaxed mb-10 max-w-xs">
              Sign in to continue your career journey, review your RIASEC results, and get personalised academic guidance.
            </p>

            {/* What awaits them */}
            <div className="flex flex-col gap-3.5">
              {[
                'Your saved career matches & RIASEC scores',
                'Ongoing AI Advisor conversations',
                'DELSU semester course roadmap progress',
                'CGPA tracking & degree milestones',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/15 pt-6 mt-8">
            <p className="text-white/45 text-xs leading-relaxed">
              B.Sc. Final Year Degree Project<br />
              <span className="text-white/65 font-medium">Dept. of Computer Science — DELSU, Abraka</span>
            </p>
          </div>
        </aside>

        {/* Right — Login Form */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10 bg-[#FAFBFD]">
          <div className="w-full max-w-md">

            {/* Top Bar above card */}
            <div className="flex items-center justify-between mb-5">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#20428B] transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Back to Home</span>
              </Link>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#20428B] bg-[#EEF2F9] border border-[#CBD5E1]/50">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure Portal</span>
              </span>
            </div>

            {/* Elevated White Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-7 sm:p-8 shadow-[0_4px_24px_rgba(32,66,139,0.06)]">

              {/* Heading */}
              <div className="mb-6">
                <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-1.5">
                  Sign in to PathWise
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Enter your student credentials to access your dashboard.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">

                {/* Matric No. or Email */}
                <div className="log-field-anim flex flex-col gap-1.5" style={{ animationDelay: '0.05s' }}>
                  <label className="text-xs font-semibold text-[#374151] tracking-wide">
                    Matric No. or Email
                  </label>
                  <div className="relative log-input-wrap">
                    <span className="log-icon-left"><User className="w-4 h-4" /></span>
                    <input
                      type="text"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. FOS/22/23/0001 or email"
                      className="log-input"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="log-field-anim flex flex-col gap-1.5" style={{ animationDelay: '0.1s' }}>
                  <label className="text-xs font-semibold text-[#374151] tracking-wide">Password</label>
                  <div className="relative log-input-wrap">
                    <span className="log-icon-left"><Lock className="w-4 h-4" /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="log-input"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="log-icon-btn"
                      onClick={() => setShowPassword(p => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-semibold text-[#20428B] hover:text-[#2A52A8] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="log-field-anim mt-1" style={{ animationDelay: '0.15s' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-[#20428B] hover:bg-[#2A52A8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-[#94A3B8] leading-relaxed">
                  By signing in you agree to our{' '}
                  <button
                    type="button"
                    onClick={handleTerms}
                    className="text-[#20428B] cursor-pointer hover:underline font-semibold"
                  >
                    Terms of Service
                  </button>.
                </p>
              </form>

              {/* Dedicated Account Switcher Footer inside Card */}
              <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
                <p className="text-xs text-[#64748B]">
                  New to PathWise?{' '}
                  <Link to="/register" className="text-[#20428B] font-bold hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>

            </div>

            {/* Security footer below card */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#20428B]" />
              <span>Secured with end-to-end encryption</span>
            </div>

          </div>
        </main>
      </div>

      {/* Centered Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => {
          setShowForgotModal(false);
          if (searchParams.get('forgot') === 'true') {
            searchParams.delete('forgot');
            setSearchParams(searchParams, { replace: true });
          }
        }}
        onSuccess={(matricOrEmail) => {
          if (matricOrEmail) {
            setEmail(matricOrEmail);
          }
        }}
      />
    </div>
  );
};

export default LoginPage;
