import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { Shield, AlertTriangle, Lock, Eye, EyeOff, Mail, LockOpen, Info } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;
  const [clock, setClock] = useState('');
  
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-GB', { hour12: false }) + ' · ' +
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password || attempts >= MAX_ATTEMPTS) return;

    setIsSubmitting(true);
    try {
      // The API uses authRoutes
      const res = await api.post('/auth/admin-login', { username, password });
      await login(res.data.token, res.data.user);
      addNotification('Admin login successful!', 'success');
      navigate('/admin');
    } catch (error) {
      setAttempts(prev => prev + 1);
      const remaining = MAX_ATTEMPTS - (attempts + 1);
      if (remaining <= 0) {
        addNotification('Account locked. Too many failed attempts.', 'error');
      } else {
        addNotification(error.response?.data?.error || `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .admin-page-container {
          background: var(--bg); color: var(--white); font-family: 'Inter', sans-serif;
          height: 100vh; display: flex; overflow: hidden; width: 100%;
        }

        /* ── GRID LINES ── */
        .grid-lines {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }

        /* ── FLOATING ORBS ── */
        .orb {
          position: fixed; border-radius: 50%; filter: blur(80px);
          pointer-events: none; z-index: 0; animation: orbFloat ease-in-out infinite;
        }
        .orb-1 { width: 400px; height: 400px; background: rgba(0,86,255,0.06); top: -100px; left: -100px; animation-duration: 12s; }
        .orb-2 { width: 350px; height: 350px; background: rgba(34,119,255,0.06); bottom: -100px; right: -100px; animation-duration: 15s; animation-delay: -5s; }
        .orb-3 { width: 250px; height: 250px; background: rgba(34,119,255,0.04); top: 50%; left: 50%; transform: translate(-50%,-50%); animation-duration: 10s; animation-delay: -3s; }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 33%{transform:translate(30px,-20px)} 66%{transform:translate(-20px,30px)} }

        /* ── LEFT PANEL ── */
        .left-panel {
          position: relative; z-index: 1;
          width: 45%; display: flex; flex-direction: column;
          justify-content: center; align-items: flex-start;
          padding: 4rem 4rem 4rem 5rem;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        @media (max-width: 900px) { .left-panel { display: none; } }

        .shield-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(0,86,255,0.15), rgba(34,119,255,0.15));
          border: 1px solid rgba(0,86,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin-bottom: 2rem;
          box-shadow: 0 0 40px rgba(0,86,255,0.12);
          animation: shieldPulse 4s ease-in-out infinite;
        }
        @keyframes shieldPulse {
          0%,100% { box-shadow: 0 0 40px rgba(0,86,255,0.12); }
          50%      { box-shadow: 0 0 70px rgba(0,86,255,0.25), 0 0 120px rgba(34,119,255,0.08); }
        }

        .left-tag {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--blue);
          background: rgba(0,86,255,0.08); border: 1px solid rgba(0,86,255,0.2);
          border-radius: 50px; padding: 0.35rem 1rem;
          margin-bottom: 1.8rem;
        }

        .left-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900; line-height: 1.15;
          margin-bottom: 1.2rem;
        }
        .left-title .gradient-text {
          background: linear-gradient(135deg, var(--blue), var(--azure));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .left-sub { color: var(--gray); font-size: 0.95rem; line-height: 1.75; max-width: 400px; margin-bottom: 3rem; }

        .access-levels { display: flex; flex-direction: column; gap: 0.9rem; width: 100%; max-width: 380px; }
        .access-item { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1rem 1.2rem; transition: all 0.3s; }
        .access-item:hover { border-color: rgba(0,86,255,0.25); transform: translateX(4px); }
        .access-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; animation: dotPulse 2s ease-in-out infinite; }
        .access-dot.orange { background: var(--blue); box-shadow: 0 0 10px rgba(0,86,255,0.5); }
        .access-dot.teal   { background: var(--azure);   box-shadow: 0 0 10px rgba(34,119,255,0.5);  animation-delay: 0.5s; }
        .access-dot.violet { background: var(--blue); box-shadow: 0 0 10px rgba(0,86,255,0.5); animation-delay: 1s; }
        @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .access-text strong { display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 0.15rem; }
        .access-text span { color: var(--gray); font-size: 0.78rem; }

        .warning-strip {
          display: flex; align-items: flex-start; gap: 0.7rem;
          background: rgba(0,86,255,0.04); border: 1px solid rgba(0,86,255,0.12);
          border-radius: 12px; padding: 1rem 1.2rem;
          margin-top: 3rem; max-width: 380px;
        }
        .warning-strip p { color: rgba(148,163,184,0.8); font-size: 0.78rem; line-height: 1.6; }
        .warning-strip span { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }

        /* ── RIGHT PANEL ── */
        .right-panel {
          position: relative; z-index: 1;
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 3rem 2rem;
        }
        .form-wrap { width: 100%; max-width: 420px; }

        .secure-badge { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--teal); font-size: 0.78rem; font-weight: 600; margin-bottom: 2.5rem; }
        .secure-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--teal); animation: dotPulse 1.5s ease-in-out infinite; }
        .secure-line { flex: 1; max-width: 60px; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,212,170,0.4)); }
        .secure-line.r { background: linear-gradient(270deg, transparent, rgba(0,212,170,0.4)); }

        .form-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px; padding: 2.8rem;
          backdrop-filter: blur(30px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset;
          position: relative; overflow: hidden;
          animation: cardIn 0.7s ease both;
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .form-card::before {
          content: ''; position: absolute; inset: -1px;
          background: linear-gradient(135deg, rgba(0,86,255,0.2), transparent 40%, rgba(34,119,255,0.2));
          border-radius: 28px; z-index: -1;
        }

        .lock-wrap {
          width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, rgba(0,86,255,0.15), rgba(34,119,255,0.15));
          border: 1px solid rgba(0,86,255,0.25);
          display: flex; align-items: center; justify-content: center; font-size: 1.8rem;
          box-shadow: 0 0 30px rgba(0,86,255,0.2);
          animation: lockPulse 3s ease-in-out infinite;
        }
        @keyframes lockPulse { 0%,100%{box-shadow:0 0 30px rgba(0,86,255,0.2)} 50%{box-shadow:0 0 60px rgba(0,86,255,0.4)} }

        .form-card h2 { font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 900; text-align: center; margin-bottom: 0.4rem; }
        .form-card .subtitle { color: var(--gray); font-size: 0.88rem; text-align: center; margin-bottom: 2rem; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); margin-bottom: 2rem; }

        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.3rem; }
        .form-label { font-size: 0.8rem; font-weight: 600; color: #CBD5E1; letter-spacing: 0.04em; }
        .input-wrap { position: relative; }
        .admin-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 0.9rem 3rem 0.9rem 1.1rem;
          color: var(--white); font-size: 0.92rem; font-family: 'Inter', sans-serif;
          transition: all 0.3s; outline: none;
        }
        .admin-input::placeholder { color: rgba(148,163,184,0.5); }
        .admin-input:focus { border-color: var(--blue); background: rgba(0,86,255,0.07); box-shadow: 0 0 0 4px rgba(0,86,255,0.1); }

        .field-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: var(--gray); font-size: 1rem; transition: color 0.3s; }
        .field-icon.clickable { cursor: pointer; pointer-events: all; }
        .field-icon.clickable:hover { color: var(--white); }
        .admin-input:focus ~ .field-icon { color: var(--blue); }

        .attempts-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; }
        .attempts-info { display: flex; align-items: center; gap: 0.4rem; color: rgba(148,163,184,0.6); font-size: 0.75rem; }
        .attempts-dots { display: flex; gap: 3px; }
        .attempt-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.15); }
        .attempt-dot.used { background: var(--blue); }
        .forgot-text { color: var(--azure); font-size: 0.78rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
        .forgot-text:hover { opacity: 0.7; }

        .submit-btn {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, var(--blue), var(--azure));
          color: #fff; border: none; border-radius: 14px;
          font-size: 0.95rem; font-weight: 700; cursor: pointer;
          transition: all 0.3s; font-family: 'Inter', sans-serif;
          box-shadow: 0 0 30px rgba(0,86,255,0.35);
          position: relative; overflow: hidden;
        }
        .submit-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent); opacity: 0; transition: opacity 0.3s; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(0,86,255,0.55); }
        .submit-btn:hover::before { opacity: 1; }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { pointer-events: none; opacity: 0.6; cursor: not-allowed; }

        .security-note { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: rgba(148,163,184,0.45); font-size: 0.73rem; margin-top: 1.8rem; text-align: center; }
        .session-info { margin-top: 1.5rem; background: rgba(34,119,255,0.05); border: 1px solid rgba(34,119,255,0.15); border-radius: 12px; padding: 0.9rem 1.1rem; display: flex; align-items: center; gap: 0.8rem; }
        .session-info p { color: rgba(148,163,184,0.7); font-size: 0.78rem; line-height: 1.5; }
        .session-info p strong { color: var(--blue); }

        .version-tag { position: fixed; bottom: 1.5rem; right: 1.5rem; color: rgba(148,163,184,0.25); font-size: 0.7rem; font-family: 'Outfit', sans-serif; letter-spacing: 0.05em; z-index: 10; }
        .clock { position: fixed; top: 1.5rem; right: 2rem; z-index: 10; color: rgba(148,163,184,0.4); font-size: 0.78rem; font-family: 'Outfit', sans-serif; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem; }
        .clock-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); animation: dotPulse 2s ease-in-out infinite; }
      `}</style>
      
      <div className="mesh-bg"></div>

      <div className="admin-page-container">
        <div className="grid-lines"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        {/* CLOCK */}
        <div className="clock">
          <div className="clock-dot"></div>
          <span>{clock}</span>
        </div>

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="shield-icon text-pw-blue">
            <Shield className="w-8 h-8" />
          </div>
          <div className="left-tag">⬡ System Administration</div>
          <h2 className="left-title">
            Authorized<br/>Personnel<br/>
            <span className="gradient-text">Only.</span>
          </h2>
          <p className="left-sub">
            This area is restricted to system administrators. Unauthorized access attempts are logged, monitored, and may result in account suspension.
          </p>

          <div className="access-levels">
            <div className="access-item">
              <div className="access-dot orange"></div>
              <div className="access-text">
                <strong>Full System Control</strong>
                <span>Manage all student accounts &amp; data</span>
              </div>
            </div>
            <div className="access-item">
              <div className="access-dot teal"></div>
              <div className="access-text">
                <strong>Analytics &amp; Reporting</strong>
                <span>View platform-wide insights &amp; logs</span>
              </div>
            </div>
            <div className="access-item">
              <div className="access-dot violet"></div>
              <div className="access-text">
                <strong>Content Management</strong>
                <span>Update careers, courses &amp; notifications</span>
              </div>
            </div>
          </div>

          <div className="warning-strip flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-pw-blue flex-shrink-0" />
            <p>All login attempts to this portal are recorded with IP address, device info, and timestamp. Repeated failed attempts will trigger an automatic lockout.</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-wrap">
            <div className="secure-badge">
              <div className="secure-line"></div>
              <div className="secure-dot"></div>
              <span>Encrypted Secure Connection</span>
              <div className="secure-dot"></div>
              <div className="secure-line r"></div>
            </div>

            <div className="form-card">
              <div className="lock-wrap flex items-center justify-center text-pw-blue">
                <Lock className="w-6 h-6" />
              </div>
              <h2>Restricted Access</h2>
              <p className="subtitle">Enter your administrator credentials to continue</p>

              <div className="divider"></div>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">ADMINISTRATOR USERNAME</label>
                  <div className="input-wrap">
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin" 
                      autoComplete="off" 
                      className="admin-input" 
                      required
                    />
                    <span className="field-icon flex items-center justify-center"><Mail className="w-4 h-4 text-pw-gray" /></span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">ACCESS PASSWORD</label>
                  <div className="input-wrap">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter secure password" 
                      autoComplete="off" 
                      className="admin-input" 
                      required
                    />
                    <span className="field-icon clickable flex items-center justify-center" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4 text-pw-gray" /> : <Eye className="w-4 h-4 text-pw-gray" />}
                    </span>
                  </div>
                </div>

                <div className="attempts-row">
                  <div className="attempts-info">
                    <span>Attempts:</span>
                    <div className="attempts-dots">
                      {[1, 2, 3, 4, 5].map(dot => (
                        <div key={dot} className={`attempt-dot ${dot <= attempts ? 'used' : ''}`}></div>
                      ))}
                    </div>
                    <span>{Math.max(0, MAX_ATTEMPTS - attempts)} remaining</span>
                  </div>
                  <a className="forgot-text" href="#">Recovery Access</a>
                </div>

                <button type="submit" className="submit-btn flex items-center justify-center gap-2" disabled={isSubmitting || attempts >= MAX_ATTEMPTS}>
                  {isSubmitting ? 'Authenticating...' : <><LockOpen className="w-4 h-4" /> Authenticate & Enter</>}
                </button>
              </form>

              <div className="security-note flex items-center justify-center gap-1.5 text-xs text-pw-gray">
                <Lock className="w-3.5 h-3.5" /> 256-bit AES encrypted · JWT authenticated · Rate limited
              </div>

              <div className="session-info flex items-start gap-2">
                <Info className="w-4 h-4 text-pw-blue flex-shrink-0 mt-0.5" />
                <p>Sessions expire after <strong>2 hours</strong> of inactivity. You will be automatically logged out to protect system security.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="version-tag">PathWise Admin · v1.0.0</div>
      </div>
    </>
  );
};

export default AdminLogin;
