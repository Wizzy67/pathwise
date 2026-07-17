import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { Compass, GraduationCap, Eye, EyeOff, Info, Briefcase, Stethoscope, Scale, Ruler, Palette, Lock } from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

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
            setTimeout(() => {
              setShowRedirect(true);
            }, 500);
          }, 600);
        }
      }, s.delay)
    );
    
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (showRedirect && onSuccess) {
      const t = setTimeout(() => {
        onSuccess();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [showRedirect, onSuccess]);

  return (
    <div style={{ background: 'var(--black)', color: 'var(--white)', fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', alignItems: 'center', justifycontent: 'center', overflow: 'hidden', width: '100%' }}>
      <style>{`
        .auth-card { position: relative; z-index: 1; width: 100%; max-width: 440px; text-align: center; padding: 3rem 2rem; }
        .rings { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; }
        .ring { position: absolute; border-radius: 50%; border: 1px solid; animation: ripple 3s ease-out infinite; }
        .ring:nth-child(1) { width: 200px; height: 200px; border-color: rgba(0,86,255,0.3); animation-delay: 0s; }
        .ring:nth-child(2) { width: 320px; height: 320px; border-color: rgba(0,86,255,0.18); animation-delay: 0.6s; }
        .ring:nth-child(3) { width: 460px; height: 460px; border-color: rgba(0,86,255,0.1); animation-delay: 1.2s; }
        .ring:nth-child(4) { width: 600px; height: 600px; border-color: rgba(0,86,255,0.05); animation-delay: 1.8s; }
        @keyframes ripple { 0%{opacity:0.8; transform:scale(0.6)} 100%{opacity:0; transform:scale(1)} }
        
        .spinner-ring { position: absolute; inset: -8px; border-radius: 50%; border: 3px solid transparent; border-top-color: var(--blue); border-right-color: var(--azure); animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner-wrap { position: relative; width: 90px; height: 90px; margin: 0 auto 2rem; }
        .spinner-inner { width: 90px; height: 90px; border-radius: 26px; background: linear-gradient(135deg,var(--blue),var(--azure)); display:flex; align-items:center; justify-content:center; font-size:2.4rem; box-shadow:0 0 50px rgba(0,86,255,0.5); transition:all 0.8s; }
        .spinner-inner.success { background:linear-gradient(135deg,var(--blue),var(--azure)); box-shadow:0 0 50px rgba(0,86,255,0.3); }

        .auth-title { font-family:'Outfit',sans-serif; font-size:1.6rem; font-weight:900; margin-bottom:0.6rem; transition:all 0.5s; }
        .auth-sub { color:var(--gray); font-size:0.9rem; margin-bottom:2rem; transition:all 0.5s; }

        .progress-wrap { background:rgba(15,23,42,0.08); border-radius:50px; height:6px; overflow:hidden; margin-bottom:2rem; }
        .progress-fill { height:100%; border-radius:50px; background:linear-gradient(90deg,var(--blue),var(--azure)); transition:width 0.4s ease; }
        
        .auth-steps { display:flex; flex-direction:column; gap:0.7rem; text-align:left; background:rgba(0,86,255,0.02); border:1px solid rgba(0,86,255,0.08); border-radius:16px; padding:1.4rem; }
        .auth-step { display:flex; align-items:center; gap:0.9rem; font-size:0.88rem; color:var(--gray); transition:all 0.4s; }
        .auth-step.done  { color:var(--white); }
        .auth-step.active{ color:var(--blue); }
        .step-icon { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; flex-shrink:0; background:rgba(0,86,255,0.03); border:1px solid rgba(0,86,255,0.08); transition:all 0.4s; }
        .auth-step.done  .step-icon { background:rgba(0,86,255,0.1); border-color:var(--blue); color:var(--blue); }
        .auth-step.active .step-icon { background:rgba(0,86,255,0.2); border-color:var(--blue); animation:pulse-step 1s ease-in-out infinite; }
        @keyframes pulse-step { 0%,100%{box-shadow:0 0 0 0 rgba(0,86,255,0.4)} 50%{box-shadow:0 0 0 6px rgba(0,86,255,0)} }

        .success-msg { display:none; flex-direction:column; align-items:center; gap:0.5rem; }
        .success-msg.show { display:flex; animation:fadeUp 0.6s ease both; }
        .celebrate { font-size:1.5rem; animation:bounce 0.8s ease infinite; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

        .redirect-btn { display:none; margin-top:1.5rem; width:100%; padding:0.9rem; border:none; border-radius:14px; background:linear-gradient(135deg,var(--blue),var(--azure)); color:#fff; font-size:1rem; font-weight:700; cursor:pointer; box-shadow:0 0 30px rgba(0,86,255,0.3); transition:all 0.3s; text-decoration:none; text-align:center; }
        .redirect-btn.show { display:block; animation:fadeUp 0.6s ease 0.3s both; }
        .redirect-btn:hover { transform:translateY(-2px); box-shadow:0 0 50px rgba(0,86,255,0.5); }
      `}</style>

      <div className="mesh-bg"></div>
      <div className="rings"><div className="ring"></div><div className="ring"></div><div className="ring"></div><div className="ring"></div></div>
      
      <div className="auth-card">
        <div className="spinner-wrap">
          {!isSuccess && <div className="spinner-ring"></div>}
          <div className={`spinner-inner ${isSuccess ? 'success' : ''}`}>{isSuccess ? '✓' : '🚀'}</div>
        </div>

        <h2 className="auth-title">{isSuccess ? 'Login Successful! 🎉' : 'Authenticating...'}</h2>
        <p className="auth-sub" style={isSuccess ? { color: 'var(--lavender)' } : {}}>
          {isSuccess ? 'Welcome back to PathWise!' : 'Please wait while we verify your credentials'}
        </p>

        <div className="progress-wrap">
          <div className="progress-fill" style={{ width: `${progress}%`, background: isSuccess ? 'linear-gradient(90deg, var(--lavender), #c7d0f8)' : '' }}></div>
        </div>

        {!isSuccess && (
          <div className="auth-steps">
            {['Checking matric number...', 'Validating credentials...', 'Generating JWT token...', 'Loading your profile...'].map((text, i) => {
              const isActive = currentStep === i + 1;
              const isDone = currentStep > i + 1;
              return (
                <div key={i} className={`auth-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="step-icon">{isDone ? '✓' : isActive ? '⟳' : '○'}</div>
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        )}

        {isSuccess && (
          <div className="success-msg show">
            <div className="celebrate">🎉</div>
            <p style={{ color: 'var(--lavender)', fontWeight: 700, fontSize: '1rem' }}>Login Successful!</p>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Redirecting you to your dashboard...</p>
          </div>
        )}

        {showRedirect && (
          <button onClick={onSuccess} className="redirect-btn show">Continue to Dashboard →</button>
        )}
      </div>

      <div className="step-bar">
        <span className="step-label">Step</span>
        <div className="step-dot done" style={{ background: 'rgba(0,86,255,0.5)' }}></div>
        <div className="step-dot done" style={{ background: 'rgba(0,86,255,0.5)' }}></div>
        <div className="step-dot done" style={{ background: 'rgba(0,86,255,0.5)' }}></div>
        <div className="step-dot active"></div>
        <div className="step-dot"></div>
        <div className="step-dot"></div>
      </div>
    </div>
  );
};

const DEPARTMENTS = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Accounting', 'Economics', 'Law', 'Medicine', 'Engineering',
  'Mass Communication', 'Education', 'Agriculture', 'Business Admin',
];

const LoginPage = () => {
  const [matricNo, setMatricNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  // Google OAuth States
  const [googleToken, setGoogleToken] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [googleMatric, setGoogleMatric] = useState('');
  const [googleLevel, setGoogleLevel] = useState('');
  const [googleFaculty, setGoogleFaculty] = useState('');
  const [googleDepartment, setGoogleDepartment] = useState('');
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const hasGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== '771576409748-placeholder.apps.googleusercontent.com';

  // Initialize Google Sign-In
  useEffect(() => {
    if (!hasGoogleClientId) return;

    const initGsi = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-container'),
          { theme: 'outline', size: 'large', width: 340 }
        );
      }
    };

    const interval = setInterval(() => {
      if (window.google) {
        initGsi();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [hasGoogleClientId]);

  const handleGoogleCredentialResponse = async (response) => {
    const idToken = response.credential;
    setGoogleToken(idToken);
    
    try {
      const res = await api.post('/auth/google-login', { idToken });
      if (res.data.isNewUser) {
        setShowProfileModal(true);
      } else {
        await login(res.data.token, res.data.user);
        setShowAuthScreen(true);
      }
    } catch (error) {
      addNotification(error.response?.data?.error || 'Google login failed.', 'error');
    }
  };

  const handleGoogleMockClick = () => {
    const email = prompt(
      "Simulate Google Account Chooser\n\nEnter the Google email address you want to simulate signing in with:",
      "ifeanyiwisdom67@gmail.com"
    );
    if (!email) return;
    handleGoogleCredentialResponse({ credential: `MOCK_GOOGLE_TOKEN_${email}_${Date.now()}` });
  };

  const handleCompleteGoogleProfile = async (e) => {
    e.preventDefault();
    setIsSubmittingGoogle(true);
    
    try {
      const res = await api.post('/auth/google-register', {
        idToken: googleToken,
        matricNo: googleMatric,
        level: googleLevel,
        faculty: googleFaculty,
        department: googleDepartment
      });
      
      await login(res.data.token, res.data.user);
      setShowProfileModal(false);
      setShowAuthScreen(true);
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to complete registration.', 'error');
      setIsSubmittingGoogle(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await api.post('/auth/login', { matricNo, password });
      await login(res.data.token, res.data.user);
      
      // If API succeeds quickly, we show the auth screen animation for 3.5s
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
        .login-body {
          display: grid; grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        /* ── LEFT VISUAL ── */
        .left-vis {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 4rem 3rem; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }

        .network-svg { width: 320px; height: 320px; margin-bottom: 2rem; animation: rotateSlow 40s linear infinite; }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .vis-logo { font-family:'Outfit',sans-serif; font-size:1.8rem; font-weight:900; margin-bottom:0.8rem; display:flex; align-items:center; gap:0.5rem; }
        .vis-logo .logo-icon { width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,var(--blue),var(--azure)); display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:0 0 24px rgba(0,86,255,0.45); }
        .vis-logo span { background:linear-gradient(135deg,var(--blue),var(--azure)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }

        .vis-title { font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:800; margin-bottom:0.7rem; }
        .vis-sub { color: var(--gray); font-size:0.9rem; line-height:1.7; max-width:320px; }

        .vis-nodes { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
        .node { position:absolute; border-radius:50%; animation: nodeFloat ease-in-out infinite; }
        @keyframes nodeFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(var(--tx),var(--ty)); } }

        /* ── RIGHT (FORM) ── */
        .right-form {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 3rem 2rem; min-height: 100vh;
        }

        .form-card {
          width: 100%; max-width: 420px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 28px; padding: 2.8rem 2.5rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0,86,255,0.06);
          animation: cardIn 0.7s ease both;
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

        .card-header { text-align:center; margin-bottom:2rem; }
        .card-logo-icon { width:56px; height:56px; border-radius:16px; background:linear-gradient(135deg,var(--blue),var(--azure)); display:flex; align-items:center; justify-content:center; font-size:1.6rem; margin:0 auto 1.2rem; box-shadow:0 0 30px rgba(0,86,255,0.4); animation:pulseLogo 3s ease-in-out infinite; }
        .card-header h2 { font-family:'Outfit',sans-serif; font-size:1.6rem; font-weight:900; margin-bottom:0.4rem; }
        .card-header p { color:var(--gray); font-size:0.88rem; }

        .form-group { display:flex; flex-direction:column; gap:0.45rem; margin-bottom:1.2rem; }
        .form-label { font-size:0.82rem; font-weight:600; color:var(--white); text-align: left; }
        .input-wrap { position:relative; }
        .form-input {
          width:100%; background: var(--surface2);
          border:1px solid var(--border); border-radius:12px;
          padding:0.85rem 2.8rem 0.85rem 1rem; color:var(--white);
          font-size:0.92rem; font-family:'Inter',sans-serif;
          transition:all 0.3s; outline:none; box-sizing: border-box;
        }
        .form-input::placeholder { color: var(--muted); opacity: 0.7; }
        .form-input:focus { border-color:var(--blue); background:rgba(0,86,255,0.04); box-shadow:0 0 0 3px rgba(0,86,255,0.1); }
        .input-icon { position:absolute; right:1rem; top:50%; transform:translateY(-50%); color:var(--gray); font-size:1rem; }
        .input-icon.clickable { pointer-events:all; cursor:pointer; transition:color 0.2s; }
        .input-icon.clickable:hover { color:var(--white); }

        .matric-info { font-size:0.76rem; color:var(--gray); margin-top:0.3rem; display:flex; align-items:center; gap:0.3rem; }

        .form-row-inline { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
        .remember-wrap { display:flex; align-items:center; gap:0.5rem; font-size:0.83rem; color:var(--gray); cursor:pointer; }
        .toggle-switch { width:36px; height:20px; border-radius:10px; background:rgba(15,23,42,0.1); position:relative; cursor:pointer; transition:background 0.3s; }
        .toggle-switch.on { background:var(--azure); }
        .toggle-switch::after { content:''; position:absolute; top:3px; left:3px; width:14px; height:14px; border-radius:50%; background:#fff; transition:left 0.3s; }
        .toggle-switch.on::after { left:19px; }
        .forgot-link { color:var(--azure); font-size:0.83rem; text-decoration:none; font-weight:600; transition:opacity 0.2s; }
        .forgot-link:hover { opacity:0.8; }

        .login-btn { width:100%; padding:0.95rem; background:linear-gradient(135deg,var(--blue),var(--azure)); color:#fff; border:none; border-radius:14px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.3s; box-shadow:0 0 30px rgba(0,86,255,0.35); margin-bottom:1.5rem; }
        .login-btn:hover { transform:translateY(-2px); box-shadow:0 0 50px rgba(0,86,255,0.55); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .or-divider { display:flex; align-items:center; gap:0.8rem; margin-bottom:1.2rem; color:var(--gray); font-size:0.8rem; }
        .or-line { flex:1; height:1px; background:var(--muted); opacity: 0.3; }

        .google-btn { width:100%; padding:0.85rem; background:var(--surface2); border:1px solid var(--border); border-radius:14px; color:var(--white); font-size:0.92rem; font-weight:600; cursor:pointer; transition:all 0.3s; display:flex; align-items:center; justify-content:center; gap:0.7rem; margin-bottom:1.5rem; }
        .google-btn:hover { background:rgba(0,86,255,0.03); border-color:rgba(0,86,255,0.3); transform:translateY(-1px); }

        .signup-link { text-align:center; color:var(--gray); font-size:0.87rem; }
        .signup-link a { color:var(--blue); text-decoration:none; font-weight:600; }

        .modal-form-input {
          width: 100%;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 0.75rem 0.85rem;
          color: var(--white);
          font-size: 0.88rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s;
          outline: none;
          box-sizing: border-box;
        }
        .modal-form-input:focus {
          border-color: var(--blue);
          background: var(--surface);
          box-shadow: 0 0 0 3px rgba(0,86,255,0.1);
        }

        .security-note { display:flex; align-items:center; justify-content:center; gap:0.5rem; color:rgba(148,163,184,0.5); font-size:0.75rem; margin-top:1.5rem; }

        /* ── RESPONSIVE OVERRIDES ── */
        @media (max-width: 850px) {
          .login-body { grid-template-columns: 1fr; }
          .left-vis { display: none !important; }
        }
      `}</style>
      <div className="mesh-bg"></div>

      <div className="login-body">
        {/* LEFT VISUAL */}
        <motion.div 
          className="left-vis"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="vis-nodes" id="vis-nodes"></div>
          <svg className="network-svg" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="160" y1="160" x2="80"  y2="80"  stroke="rgba(0,86,255,0.3)" strokeWidth="1.5" strokeDasharray="5,4"/>
            <line x1="160" y1="160" x2="240" y2="80"  stroke="rgba(227,231,252,0.3)"  strokeWidth="1.5" strokeDasharray="5,4"/>
            <line x1="160" y1="160" x2="60"  y2="200" stroke="rgba(34,119,255,0.3)" strokeWidth="1.5" strokeDasharray="5,4"/>
            <line x1="160" y1="160" x2="260" y2="200" stroke="rgba(34,119,255,0.3)" strokeWidth="1.5" strokeDasharray="5,4"/>
            <line x1="160" y1="160" x2="160" y2="270" stroke="rgba(0,86,255,0.3)" strokeWidth="1.5" strokeDasharray="5,4"/>
            <line x1="80"  y1="80"  x2="240" y2="80"  stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <line x1="60"  y1="200" x2="260" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <circle cx="160" cy="160" r="28" fill="rgba(0,86,255,0.15)" stroke="#0056FF" strokeWidth="2"/>
            <circle cx="160" cy="160" r="18" fill="rgba(0,86,255,0.25)"/>
            <g transform="translate(148, 148)"><Compass size={24} stroke="#0056FF" strokeWidth={2} /></g>
            <circle cx="80"  cy="80"  r="20" fill="rgba(0,86,255,0.12)"  stroke="#0056FF" strokeWidth="1.5"/><g transform="translate(71, 71)"><Briefcase size={18} stroke="#0056FF" strokeWidth={1.5} /></g>
            <circle cx="240" cy="80"  r="20" fill="rgba(0,86,255,0.12)"   stroke="#0056FF" strokeWidth="1.5"/><g transform="translate(231, 71)"><Stethoscope size={18} stroke="#0056FF" strokeWidth={1.5} /></g>
            <circle cx="60"  cy="200" r="20" fill="rgba(34,119,255,0.12)"  stroke="#2277FF" strokeWidth="1.5"/><g transform="translate(51, 191)"><Scale size={18} stroke="#2277FF" strokeWidth={1.5} /></g>
            <circle cx="260" cy="200" r="20" fill="rgba(34,119,255,0.12)"  stroke="#2277FF" strokeWidth="1.5"/><g transform="translate(251, 191)"><Ruler size={18} stroke="#2277FF" strokeWidth={1.5} /></g>
            <circle cx="160" cy="270" r="20" fill="rgba(0,86,255,0.12)"   stroke="#0056FF" strokeWidth="1.5"/><g transform="translate(151, 261)"><Palette size={18} stroke="#0056FF" strokeWidth={1.5} /></g>
          </svg>

          <div className="vis-logo">
            <PathWiseLogo size={36} />
          </div>
          <div className="vis-title">Welcome Back!</div>
          <p className="vis-sub">Your career journey is waiting. Log in to access your personalized matches, roadmaps, and AI advisor.</p>
        </motion.div>

        <motion.div 
          className="right-form"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="form-card">
            <div className="card-header">
              <div className="flex justify-center mb-4">
                <PathWiseLogo size={52} text={false} />
              </div>
              <h2>Welcome Back</h2>
              <p>Log in to continue your career journey</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Matric Number</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    placeholder="e.g. FOS/19/20/248102"
                    autoComplete="username"
                    required
                    className="form-input text-sm"
                  />
                  <span className="input-icon"><GraduationCap className="w-4 h-4 text-pw-gray" /></span>
                </div>
                <div className="matric-info flex items-center gap-1"><Info className="w-3.5 h-3.5 text-pw-blue" /> Use the matric number you registered with</div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="form-input"
                  />
                  <span className="input-icon clickable" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4 text-pw-gray" /> : <Eye className="w-4 h-4 text-pw-gray" />}
                  </span>
                </div>
              </div>

              <div className="form-row-inline">
                <div className="remember-wrap" onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`toggle-switch ${rememberMe ? 'on' : ''}`}></div>
                  Remember me
                </div>
                <Link to="#" className="forgot-link">Forgot Password?</Link>
              </div>

              <button type="submit" className="login-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Authenticating...' : 'Log In to PathWise →'}
              </button>
            </form>

            <p className="signup-link">New to PathWise? <Link to="/register">Create an account</Link></p>

            <div className="security-note"><Lock className="w-3 h-3" /> Secured with JWT end-to-end encryption</div>
          </div>
        </motion.div>

        <div className="step-bar">
          <span className="step-label">Step</span>
          <div className="step-dot done" style={{ background: 'rgba(0,86,255,0.5)' }}></div>
          <div className="step-dot done" style={{ background: 'rgba(0,86,255,0.5)' }}></div>
          <div className="step-dot active"></div>
          <div className="step-dot"></div>
          <div className="step-dot"></div>
          <div className="step-dot"></div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
