import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { Mail, Eye, EyeOff, Lock, ArrowRight, User, Compass, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

/* ─── MODERN AUTH LOADING SCREEN ─────────────────────────────────── */
const AuthenticatingScreen = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Smooth, snappy 1.4-second authentication sequence
    const timers = [
      setTimeout(() => { setCurrentStep(1); setProgress(45); }, 300),
      setTimeout(() => { setCurrentStep(2); setProgress(80); }, 700),
      setTimeout(() => { setCurrentStep(3); setProgress(100); setIsSuccess(true); }, 1100),
      setTimeout(() => { if (onSuccess) onSuccess(); }, 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onSuccess]);

  const steps = [
    { label: 'Verifying credentials', sub: 'Matriculation validation' },
    { label: 'Securing session', sub: 'JWT token generation' },
    { label: 'Loading workspace', sub: 'DELSU student profile' },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-4 bg-[var(--canvas)] relative overflow-hidden select-none">
      <style>{`
        .heading-font { font-family: 'Nunito', sans-serif; }
        .body-font { font-family: 'Open Sans', sans-serif; }
      `}</style>

      {/* Ambient background glow orbs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[var(--blue)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[var(--azure)]/10 blur-3xl pointer-events-none" />

      {/* Floating Center Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative z-10 space-y-6"
      >
        {/* Top Institutional Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--mist)] border border-[var(--border)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--graphite)]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>DELSU Secure Gateway</span>
        </div>

        {/* Center Animated Icon Emblem */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          {/* Orbital Spinner Ring */}
          {!isSuccess ? (
            <div className="absolute inset-0 rounded-full border-3 border-[var(--lavender)] border-t-[var(--blue)] animate-spin" />
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute inset-0 rounded-full bg-emerald-50 border-2 border-emerald-500/30"
            />
          )}

          {/* Inner Icon Box */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md ${
            isSuccess
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-[var(--blue)] text-white shadow-[var(--blue)]/30'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-7 h-7 text-white" />
            ) : (
              <Compass className="w-7 h-7 text-white animate-pulse" />
            )}
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black heading-font text-[var(--ink)] tracking-tight">
            {isSuccess ? 'Welcome Back!' : 'Authenticating...'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--graphite)] body-font">
            {isSuccess ? 'Session verified. Opening your dashboard...' : 'Verifying your institutional credentials'}
          </p>
        </div>

        {/* Sleek Gradient Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2 rounded-full bg-[var(--mist)] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--blue)] to-[var(--azure)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[var(--ash)] font-bold">
            <span>Authentication</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Step Checkpoints List */}
        <div className="space-y-2 text-left bg-[var(--mist)] border border-[var(--border)] rounded-2xl p-3.5">
          {steps.map((s, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-[var(--surface)] text-[var(--blue)] shadow-2xs font-bold'
                    : isDone
                    ? 'text-[var(--ink)] font-semibold'
                    : 'text-[var(--ash)] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-[var(--lavender)] text-[var(--blue)]'
                      : 'bg-[var(--border)] text-[var(--ash)]'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className="text-xs truncate">{s.label}</span>
                </div>
                <span className="text-[10px] text-[var(--graphite)] font-medium">
                  {isDone ? 'Done' : isCurrent ? 'Verifying...' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Encryption Assurance */}
        <div className="pt-2 text-[10px] text-[var(--ash)] font-medium flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-[var(--ash)]" />
          <span>256-Bit Encrypted Academic Portal</span>
        </div>
      </motion.div>
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

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

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
    <>
      <style>{`
        /* ─── FULL-PAGE BACKGROUND + GLASS PANEL ─────────── */
        .lp-wrapper {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          font-family: 'Inter', 'Open Sans', sans-serif;
          color: #ffffff;
          background-color: #0A0C16;
        }

        .lp-bg {
          position: absolute;
          inset: -10%;
          background:
            url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')
            center / cover no-repeat;
          z-index: 0;
          animation: kenBurns 20s ease-in-out infinite alternate;
        }

        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }

        .lp-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(10, 12, 22, 0.05) 0%,
            rgba(10, 12, 22, 0.25) 30%,
            rgba(10, 12, 22, 0.75) 65%,
            rgba(10, 12, 22, 0.98) 100%
          );
        }

        /* ── Right Container (formerly glass panel) ── */
        .lp-glass {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          min-height: 100dvh;
          width: 50%;
          max-width: 650px;
          margin-left: auto; /* Anchors content to the right side */
          display: flex;
          flex-direction: column;
        }

        /* ── Full-width Header ── */
        .lp-header {
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

        .lp-logo {
          flex: 1;
        }

        .lp-nav-center {
          flex: 1;
          display: flex;
          justify-content: center;
          gap: 3rem;
        }
        .lp-nav-center a {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .lp-nav-center a:hover { color: #fff; }
        .lp-nav-center a.active { color: #fff; font-weight: 700; }

        .lp-header-right {
          flex: 1; /* Balances the flex layout so nav stays perfectly centered */
        }

        /* ── Form area ── */
        .lp-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 4rem 4rem 2rem;
          max-width: 460px;
          margin: 0 auto; /* Centers it nicely inside the right half */
        }

        .lp-heading {
          font-family: 'Nunito', 'Outfit', sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.15;
          margin-bottom: 0.6rem;
        }

        .lp-switch {
          font-size: 0.84rem;
          color: rgba(255,255,255,0.35);
          margin-bottom: 2.2rem;
        }
        .lp-switch a {
          color: #20428B;
          text-decoration: none;
          font-weight: 600;
        }
        .lp-switch a:hover { text-decoration: underline; }

        /* ── Inputs ── */
        .lp-form {
          display: flex;
          flex-direction: column;
          gap: 1.35rem;
        }

        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .lp-field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.15rem;
        }

        .lp-field-label {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.92);
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .lp-field-hint {
          font-size: 0.73rem;
          color: rgba(255, 255, 255, 0.45);
          font-weight: 400;
        }

        .lp-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .lp-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 12px;
          padding: 0.95rem 1.2rem;
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .lp-input.lp-input-has-left {
          padding-left: 2.85rem;
        }
        .lp-input.lp-input-has-right {
          padding-right: 2.85rem;
        }
        .lp-input::placeholder {
          color: rgba(255, 255, 255, 0.38);
          font-size: 0.88rem;
          font-weight: 400;
        }
        .lp-input:focus {
          border-color: #20428B;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 3px rgba(32, 66, 139, 0.2);
        }

        .lp-icon-left {
          position: absolute;
          left: 0.95rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.45);
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .lp-input-wrap:focus-within .lp-icon-left {
          color: #20428B;
        }

        .lp-icon-right {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.2s ease;
        }
        .lp-icon-right.click {
          pointer-events: auto;
          cursor: pointer;
        }
        .lp-icon-right.click:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }

        /* ── Submit button ── */
        .lp-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
        }

        .lp-btn-fill {
          width: 100%;
          padding: 0.95rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .lp-btn-fill:hover {
          background: #20428B;
          border-color: #20428B;
          color: #ffffff;
          box-shadow: 0 8px 35px rgba(67,97,238,0.5);
          transform: translateY(-2px) scale(1.02);
        }
        .lp-btn-fill:active {
          transform: scale(0.98);
        }
        .lp-btn-fill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Security footer */
        .lp-security {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.4rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.72rem;
          margin-top: 2.5rem;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .lp-glass {
            width: 100%;
            max-width: 100%;
            background: rgba(13, 15, 28, 0.85);
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
          }
          .lp-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: max(1.25rem, env(safe-area-inset-top)) 1.5rem 0.5rem;
            z-index: 10;
          }
          .lp-nav-center {
            display: none; /* Hide on mobile */
          }
          .lp-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: max(4.5rem, env(safe-area-inset-top)) 1.5rem max(2rem, env(safe-area-inset-bottom));
            max-width: 440px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
          }
          .lp-heading {
            font-size: 1.85rem;
          }
          .lp-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 420px) {
          .lp-header { padding: max(1rem, env(safe-area-inset-top)) 1.25rem 0.5rem; }
          .lp-content { padding: max(4rem, env(safe-area-inset-top)) 1.25rem max(1.5rem, env(safe-area-inset-bottom)); }
          .lp-heading { font-size: 1.7rem; }
        }
      `}</style>

      <div className="lp-wrapper">
        {/* Background image */}
        <div className="lp-bg"></div>
        
        {/* Full-width Header */}
        <header className="lp-header">
          <div className="lp-logo">
            <PathWiseLogo href="/" size={28} textColor="#ffffff" />
          </div>
          <nav className="lp-nav-center">
            <Link to="/">Home</Link>
            <Link to="/register">Join</Link>
          </nav>
          <div className="lp-header-right"></div>
        </header>

        {/* Right Container */}
        <motion.div
          className="lp-glass"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Form content */}
          <div className="lp-content">

            <motion.h1
              className="lp-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              style={{ marginBottom: '2rem' }}
            >
              Welcome back.
            </motion.h1>

            <form className="lp-form" onSubmit={handleLogin}>
              {/* Student ID / Email */}
              <motion.div
                className="lp-field"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <div className="lp-field-header">
                  <label className="lp-field-label">Student ID or Email</label>
                  <span className="lp-field-hint">Matric / Email</span>
                </div>
                <div className="lp-input-wrap">
                  <div className="lp-icon-left">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="FOS/22/23/... or email"
                    className="lp-input lp-input-has-left"
                    autoComplete="username"
                    required
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                className="lp-field"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="lp-field-header">
                  <label className="lp-field-label">Password</label>
                </div>
                <div className="lp-input-wrap">
                  <div className="lp-icon-left">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="lp-input lp-input-has-left lp-input-has-right"
                    autoComplete="current-password"
                    required
                  />
                  <div className="lp-icon-right click" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
              </motion.div>

              {/* Action buttons & Switch */}
              <motion.div
                className="lp-actions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                style={{ flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}
              >
                <button type="submit" className="lp-btn-fill" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Log In'}
                </button>
                
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  Don't have an account? <Link to="/register" style={{ color: '#20428B', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
                </div>
              </motion.div>
            </form>

            <motion.div
              className="lp-security"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <Lock size={11} /> Secured with end-to-end encryption
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
