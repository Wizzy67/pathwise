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
          background: var(--canvas); color: var(--ink); font-family: 'Open Sans', sans-serif;
          height: 100vh; display: flex; overflow: hidden; width: 100%;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          position: relative; z-index: 1;
          width: 45%; display: flex; flex-direction: column;
          justify-content: center; align-items: flex-start;
          padding: 4rem 4rem 4rem 5rem;
          border-right: 1px solid var(--border);
          background: var(--surface);
        }
        @media (max-width: 900px) { .left-panel { display: none; } }

        .shield-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: var(--lavender);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin-bottom: 2rem;
          color: var(--blue);
        }

        .left-tag {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--blue);
          background: var(--mist); border: 1px solid var(--border);
          border-radius: 50px; padding: 0.35rem 1rem;
          margin-bottom: 1.8rem;
        }

        .left-title {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900; line-height: 1.15;
          margin-bottom: 1.2rem; color: var(--ink);
        }
        .left-title .gradient-text {
          color: var(--blue);
        }
        .left-sub { color: var(--graphite); font-size: 0.95rem; line-height: 1.75; max-width: 400px; margin-bottom: 3rem; }

        .access-levels { display: flex; flex-direction: column; gap: 0.9rem; width: 100%; max-width: 380px; }
        .access-item { display: flex; align-items: center; gap: 1rem; background: var(--mist); border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.2rem; transition: all 0.3s; }
        .access-item:hover { border-color: var(--blue); transform: translateX(4px); }
        .access-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; background: var(--blue); }
        .access-text strong { display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 0.15rem; color: var(--ink); }
        .access-text span { color: var(--graphite); font-size: 0.78rem; }

        .warning-strip {
          display: flex; align-items: flex-start; gap: 0.7rem;
          background: var(--lavender); border: 1px solid var(--border);
          border-radius: 12px; padding: 1rem 1.2rem;
          margin-top: 3rem; max-width: 380px;
        }
        .warning-strip p { color: var(--graphite); font-size: 0.78rem; line-height: 1.6; }
        .warning-strip span { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }

        /* ── RIGHT PANEL ── */
        .right-panel {
          position: relative; z-index: 1;
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 3rem 2rem;
          background: var(--canvas);
        }
        .form-wrap { width: 100%; max-width: 420px; }

        .secure-badge { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--blue); font-size: 0.78rem; font-weight: 600; margin-bottom: 2.5rem; }
        .secure-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); }
        .secure-line { flex: 1; max-width: 60px; height: 1px; background: var(--border); }
        .secure-line.r { background: var(--border); }

        .form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 28px; padding: 2.8rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          position: relative; overflow: hidden;
        }

        .lock-wrap {
          width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 1.5rem;
          background: var(--mist);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; font-size: 1.8rem;
          color: var(--blue);
        }

        .form-card h2 { font-family: 'Nunito', sans-serif; font-size: 1.6rem; font-weight: 900; text-align: center; margin-bottom: 0.4rem; color: var(--ink); }
        .form-card .subtitle { color: var(--graphite); font-size: 0.88rem; text-align: center; margin-bottom: 2rem; }
        .divider { height: 1px; background: var(--border); margin-bottom: 2rem; }

        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.3rem; }
        .form-label { font-size: 0.8rem; font-weight: 600; color: var(--graphite); letter-spacing: 0.04em; }
        .input-wrap { position: relative; }
        .admin-input {
          width: 100%;
          background: var(--fog);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 0.9rem 3rem 0.9rem 1.1rem;
          color: var(--ink); font-size: 0.92rem; font-family: 'Open Sans', sans-serif;
          transition: all 0.3s; outline: none;
        }
        .admin-input::placeholder { color: var(--ash); }
        .admin-input:focus { border-color: var(--blue); background: var(--mist); }

        .field-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: var(--graphite); font-size: 1rem; transition: color 0.3s; }
        .field-icon.clickable { cursor: pointer; pointer-events: all; }
        .field-icon.clickable:hover { color: var(--ink); }
        .admin-input:focus ~ .field-icon { color: var(--blue); }

        .attempts-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; }
        .attempts-info { display: flex; align-items: center; gap: 0.4rem; color: var(--graphite); font-size: 0.75rem; }
        .attempts-dots { display: flex; gap: 3px; }
        .attempt-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--border); }
        .attempt-dot.used { background: var(--blue); }
        .forgot-text { color: var(--blue); font-size: 0.78rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
        .forgot-text:hover { opacity: 0.7; }

        .submit-btn {
          width: 100%; padding: 1rem;
          background: var(--blue);
          color: #fff; border: none; border-radius: 14px;
          font-size: 0.95rem; font-weight: 700; cursor: pointer;
          transition: all 0.3s; font-family: 'Open Sans', sans-serif;
        }
        .submit-btn:hover { transform: translateY(-2px); background: var(--azure); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { pointer-events: none; opacity: 0.6; cursor: not-allowed; }

        .security-note { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--ash); font-size: 0.73rem; margin-top: 1.8rem; text-align: center; }
        .session-info { margin-top: 1.5rem; background: var(--mist); border: 1px solid var(--border); border-radius: 12px; padding: 0.9rem 1.1rem; display: flex; align-items: center; gap: 0.8rem; }
        .session-info p { color: var(--graphite); font-size: 0.78rem; line-height: 1.5; }
        .session-info p strong { color: var(--blue); }

        .version-tag { position: fixed; bottom: 1.5rem; right: 1.5rem; color: var(--ash); font-size: 0.7rem; font-family: 'Nunito', sans-serif; letter-spacing: 0.05em; z-index: 10; }
        .clock { position: fixed; top: 1.5rem; right: 2rem; z-index: 10; color: var(--ash); font-size: 0.78rem; font-family: 'Nunito', sans-serif; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem; }
        .clock-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); }
      `}</style>
      
      <div className="admin-page-container">

        {/* CLOCK */}
        <div className="clock">
          <div className="clock-dot"></div>
          <span>{clock}</span>
        </div>

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="shield-icon">
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
              <div className="access-dot"></div>
              <div className="access-text">
                <strong>Full System Control</strong>
                <span>Manage all student accounts &amp; data</span>
              </div>
            </div>
            <div className="access-item">
              <div className="access-dot"></div>
              <div className="access-text">
                <strong>Analytics &amp; Reporting</strong>
                <span>View platform-wide insights &amp; logs</span>
              </div>
            </div>
            <div className="access-item">
              <div className="access-dot"></div>
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
              <div className="lock-wrap">
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
                    <span className="field-icon flex items-center justify-center"><Mail className="w-4 h-4" /></span>
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
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
