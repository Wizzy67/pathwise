import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { Mail, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

/* ─── AUTH LOADING SCREEN ─────────────────────────────────── */
const AuthenticatingScreen = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(5);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);

  useEffect(() => {
    const steps = [
      { delay: 800, prog: 25 },
      { delay: 1600, prog: 50 },
      { delay: 2400, prog: 75 },
      { delay: 3200, prog: 100 },
    ];
    const timers = steps.map((s, i) =>
      setTimeout(() => {
        setCurrentStep(i + 1);
        setProgress(s.prog);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setIsSuccess(true);
            setTimeout(() => setShowRedirect(true), 500);
          }, 600);
        }
      }, s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (showRedirect && onSuccess) {
      const t = setTimeout(() => onSuccess(), 1000);
      return () => clearTimeout(t);
    }
  }, [showRedirect, onSuccess]);

  return (
    <div className="auth-loading-screen">
      <style>{`
        .auth-loading-screen {
          background: #0D0D14; color: #fff;
          font-family: 'Inter','Open Sans',sans-serif;
          min-height: 100vh; display: flex; align-items: center;
          justify-content: center; overflow: hidden; width: 100%;
        }
        .auth-card { position:relative; z-index:1; width:100%; max-width:420px; text-align:center; padding:3rem 2rem; }
        .rings { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; z-index:0; }
        .ring { position:absolute; border-radius:50%; border:1px solid; animation:ripple 3s ease-out infinite; }
        .ring:nth-child(1) { width:200px; height:200px; border-color:rgba(67,97,238,0.3); }
        .ring:nth-child(2) { width:320px; height:320px; border-color:rgba(67,97,238,0.18); animation-delay:0.6s; }
        .ring:nth-child(3) { width:460px; height:460px; border-color:rgba(67,97,238,0.1); animation-delay:1.2s; }
        @keyframes ripple { 0%{opacity:0.8;transform:scale(0.6)} 100%{opacity:0;transform:scale(1)} }
        .spinner-wrap { position:relative; width:90px; height:90px; margin:0 auto 2rem; }
        .spinner-ring { position:absolute; inset:-8px; border-radius:50%; border:3px solid transparent; border-top-color:#4361EE; animation:spin 1.2s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner-inner { width:90px; height:90px; border-radius:26px; background:linear-gradient(135deg,#4361EE,#3651D4); display:flex; align-items:center; justify-content:center; font-size:2.4rem; box-shadow:0 0 50px rgba(67,97,238,0.4); }
        .auth-title { font-family:'Nunito',sans-serif; font-size:1.6rem; font-weight:900; margin-bottom:0.6rem; }
        .auth-sub { color:rgba(255,255,255,0.5); font-size:0.9rem; margin-bottom:2rem; }
        .progress-wrap { background:rgba(255,255,255,0.06); border-radius:50px; height:6px; overflow:hidden; margin-bottom:2rem; }
        .progress-fill { height:100%; border-radius:50px; background:linear-gradient(90deg,#4361EE,#3651D4); transition:width 0.4s ease; }
        .auth-steps { display:flex; flex-direction:column; gap:0.7rem; text-align:left; background:rgba(67,97,238,0.03); border:1px solid rgba(67,97,238,0.08); border-radius:16px; padding:1.4rem; }
        .auth-step { display:flex; align-items:center; gap:0.9rem; font-size:0.88rem; color:rgba(255,255,255,0.4); transition:all 0.4s; }
        .auth-step.done { color:#fff; }
        .auth-step.active { color:#4361EE; }
        .step-icon { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; flex-shrink:0; background:rgba(67,97,238,0.03); border:1px solid rgba(67,97,238,0.08); transition:all 0.4s; }
        .auth-step.done .step-icon { background:rgba(67,97,238,0.1); border-color:#4361EE; color:#4361EE; }
        .auth-step.active .step-icon { background:rgba(67,97,238,0.15); border-color:#4361EE; animation:pulse-s 1s ease-in-out infinite; }
        @keyframes pulse-s { 0%,100%{box-shadow:0 0 0 0 rgba(67,97,238,0.4)} 50%{box-shadow:0 0 0 6px rgba(67,97,238,0)} }
        .success-msg { display:none; flex-direction:column; align-items:center; gap:0.5rem; }
        .success-msg.show { display:flex; animation:fadeUp 0.6s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .celebrate { font-size:1.5rem; animation:bounce 0.8s ease infinite; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .redirect-btn { display:none; margin-top:1.5rem; width:100%; padding:0.9rem; border:none; border-radius:14px; background:#4361EE; color:#fff; font-size:1rem; font-weight:700; cursor:pointer; box-shadow:0 0 30px rgba(67,97,238,0.25); }
        .redirect-btn.show { display:block; animation:fadeUp 0.6s ease 0.3s both; }
        .redirect-btn:hover { background:#3651D4; }
      `}</style>
      <div className="rings"><div className="ring"></div><div className="ring"></div><div className="ring"></div></div>
      <div className="auth-card">
        <div className="spinner-wrap">
          {!isSuccess && <div className="spinner-ring"></div>}
          <div className="spinner-inner">{isSuccess ? '✓' : '🚀'}</div>
        </div>
        <h2 className="auth-title">{isSuccess ? 'Login Successful! 🎉' : 'Authenticating...'}</h2>
        <p className="auth-sub">{isSuccess ? 'Welcome back to PathWise!' : 'Verifying your credentials'}</p>
        <div className="progress-wrap"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
        {!isSuccess && (
          <div className="auth-steps">
            {['Verifying credentials...','Validating session...','Generating token...','Loading profile...'].map((text, i) => (
              <div key={i} className={`auth-step ${currentStep === i + 1 ? 'active' : ''} ${currentStep > i + 1 ? 'done' : ''}`}>
                <div className="step-icon">{currentStep > i + 1 ? '✓' : currentStep === i + 1 ? '⟳' : '○'}</div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        )}
        {isSuccess && (
          <div className="success-msg show">
            <div className="celebrate">🎉</div>
            <p style={{ color:'#4361EE', fontWeight:700 }}>Login Successful!</p>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem' }}>Redirecting to dashboard...</p>
          </div>
        )}
        {showRedirect && <button onClick={onSuccess} className="redirect-btn show">Continue to Dashboard →</button>}
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

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', { matricNo: email, password });
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
          color: #4361EE;
          text-decoration: none;
          font-weight: 600;
        }
        .lp-switch a:hover { text-decoration: underline; }

        /* ── Inputs ── */
        .lp-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .lp-field-label {
          font-size: 0.78rem;
          color: #ffffff;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding-left: 0.2rem;
        }

        .lp-input-wrap {
          position: relative;
        }

        .lp-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.08); /* Frosted white glass fill */
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 12px;
          padding: 0.9rem 3.5rem 0.9rem 1.2rem;
          color: #ffffff;
          font-size: 16px; /* 16px prevents iOS Safari auto-zoom on focus */
          font-weight: 500;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .lp-input::placeholder {
          color: rgba(255, 255, 255, 0.55);
        }
        .lp-input:focus {
          border-color: #ffffff;
          background: rgba(255, 255, 255, 0.14);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
        }

        .lp-icon {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.75);
          pointer-events: none;
          transition: all 0.2s ease;
        }
        .lp-input:focus + .lp-icon {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .lp-icon.click {
          pointer-events: auto;
          cursor: pointer;
        }
        .lp-icon.click:hover {
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
          background: #4361EE;
          border-color: #4361EE;
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
              {/* Email */}
              <motion.div
                className="lp-field"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <label className="lp-field-label">Email</label>
                <div className="lp-input-wrap">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@pathwise.com"
                    className="lp-input"
                    autoComplete="username"
                    required
                  />
                  <div className="lp-icon">
                    <Mail size={14} />
                  </div>
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                className="lp-field"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <label className="lp-field-label">Password</label>
                <div className="lp-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="lp-input"
                    autoComplete="current-password"
                    required
                  />
                  <div className="lp-icon click" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
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
                  Don't have an account? <Link to="/register" style={{ color: '#4361EE', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
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
