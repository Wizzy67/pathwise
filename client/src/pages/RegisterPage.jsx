import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { Mail, GraduationCap, Eye, EyeOff, User, Lock } from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    matricNo: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addNotification('Passwords do not match.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email,
        matricNo: formData.matricNo,
        password: formData.password,
        faculty: '',
        department: '',
        level: '',
        cgpa: 0
      };
      
      const res = await api.post('/auth/register', payload);
      await login(res.data.token, res.data.user);
      addNotification('Welcome to PathWise!', 'success');
      navigate('/welcome');
    } catch (error) {
      console.error('Registration error:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed.';
      addNotification(`Registration failed: ${errMsg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        /* ─── FULL-PAGE BACKGROUND + GLASS PANEL ─────────── */
        .rp-wrapper {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          font-family: 'Inter', 'Open Sans', sans-serif;
          color: #ffffff;
          background-color: #0A0C16;
        }

        /* Background image layer */
        .rp-bg {
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

        /* Smooth overlay gradient - completely transparent left, smoothly darkening to the right */
        .rp-bg::after {
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
        .rp-glass {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          min-height: 100dvh;
          width: 50%;
          max-width: 650px;
          margin-left: auto; /* Anchors content to the right side */
          display: flex;
          flex-direction: column;
          overflow-y: auto; /* Allows scrolling if form is taller than screen */
        }

        /* ── Full-width Header ── */
        .rp-header {
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

        .rp-logo {
          flex: 1;
        }

        .rp-nav-center {
          flex: 1;
          display: flex;
          justify-content: center;
          gap: 3rem;
        }
        .rp-nav-center a {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .rp-nav-center a:hover { color: #fff; }
        .rp-nav-center a.active { color: #fff; font-weight: 700; }

        .rp-header-right {
          flex: 1;
        }

        /* ── Form area ── */
        .rp-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 4rem 4rem 2rem;
          max-width: 480px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .rp-heading {
          font-family: 'Nunito', 'Outfit', sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.15;
          margin-bottom: 2rem;
        }

        /* ── Inputs ── */
        .rp-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .rp-row {
          display: flex;
          gap: 1.2rem;
        }
        .rp-row .rp-field {
          flex: 1;
        }

        .rp-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .rp-field-label {
          font-size: 0.78rem;
          color: #ffffff;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding-left: 0.2rem;
        }

        .rp-input-wrap {
          position: relative;
        }

        .rp-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
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
        .rp-input::placeholder {
          color: rgba(255, 255, 255, 0.55);
        }
        .rp-input:focus {
          border-color: #ffffff;
          background: rgba(255, 255, 255, 0.14);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
        }

        .rp-icon {
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
        .rp-input:focus + .rp-icon {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .rp-icon.click {
          pointer-events: all;
          cursor: pointer;
        }
        .rp-icon.click:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
        }

        /* ── Buttons ── */
        .rp-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          margin-top: 1.5rem;
        }

        .rp-btn-fill {
          width: 100%;
          padding: 0.95rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }
        .rp-btn-fill::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
          transition: transform 0.6s;
          transform: translateX(-100%);
        }
        .rp-btn-fill:hover::before { transform: translateX(100%); }
        .rp-btn-fill:hover {
          background: #4361EE;
          border-color: #4361EE;
          color: #ffffff;
          box-shadow: 0 8px 35px rgba(67,97,238,0.5);
          transform: translateY(-2px) scale(1.02);
        }
        .rp-btn-fill:active {
          transform: scale(0.98);
        }
        .rp-btn-fill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Security */
        .rp-security {
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
          .rp-glass {
            width: 100%;
            max-width: 100%;
            background: rgba(13, 15, 28, 0.85);
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
          }
          .rp-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: max(1.25rem, env(safe-area-inset-top)) 1.5rem 0.5rem;
            z-index: 10;
          }
          .rp-nav-center {
            display: none;
          }
          .rp-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: max(4.5rem, env(safe-area-inset-top)) 1.5rem max(2rem, env(safe-area-inset-bottom));
            max-width: 500px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
          }
          .rp-heading {
            font-size: 1.85rem;
          }
        }

        @media (max-width: 480px) {
          .rp-row {
            flex-direction: column;
            gap: 1.2rem;
          }
        }

        @media (max-width: 420px) {
          .rp-header { padding: max(1rem, env(safe-area-inset-top)) 1.25rem 0.5rem; }
          .rp-content { padding: max(4rem, env(safe-area-inset-top)) 1.25rem max(1.5rem, env(safe-area-inset-bottom)); }
          .rp-heading { font-size: 1.65rem; }
        }
      `}</style>

      <div className="rp-wrapper">
        <div className="rp-bg"></div>
        
        <header className="rp-header">
          <div className="rp-logo">
            <PathWiseLogo href="/" size={28} textColor="#ffffff" />
          </div>
          <nav className="rp-nav-center">
            <Link to="/">Home</Link>
            <Link to="/register" className="active">Join</Link>
          </nav>
          <div className="rp-header-right"></div>
        </header>

        <motion.div
          className="rp-glass"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rp-content">
            <motion.h1
              className="rp-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              Create account.
            </motion.h1>

            <form className="rp-form" onSubmit={handleRegister}>
              {/* Full Name */}
              <motion.div
                className="rp-field"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <label className="rp-field-label">Full Name</label>
                <div className="rp-input-wrap">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Michal Masiak"
                    className="rp-input"
                    required
                  />
                  <div className="rp-icon">
                    <User size={14} />
                  </div>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                className="rp-field"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <label className="rp-field-label">Email</label>
                <div className="rp-input-wrap">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@pathwise.com"
                    className="rp-input"
                    required
                  />
                  <div className="rp-icon">
                    <Mail size={14} />
                  </div>
                </div>
              </motion.div>

              {/* Matric Number */}
              <motion.div
                className="rp-field"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <label className="rp-field-label">Matric Number</label>
                <div className="rp-input-wrap">
                  <input
                    type="text"
                    name="matricNo"
                    value={formData.matricNo}
                    onChange={handleChange}
                    placeholder="FOS/19/20/0001"
                    className="rp-input"
                    required
                  />
                  <div className="rp-icon">
                    <GraduationCap size={14} />
                  </div>
                </div>
              </motion.div>

              {/* Password Row */}
              <motion.div
                className="rp-row"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
              >
                <div className="rp-field">
                  <label className="rp-field-label">Password</label>
                  <div className="rp-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="rp-input"
                      required
                    />
                    <div className="rp-icon click" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </div>
                  </div>
                </div>

                <div className="rp-field">
                  <label className="rp-field-label">Confirm Password</label>
                  <div className="rp-input-wrap">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="rp-input"
                      required
                    />
                    <div className="rp-icon click" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="rp-actions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <button type="submit" className="rp-btn-fill" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Create Account'}
                </button>
                
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  Already have an account? <Link to="/login" style={{ color: '#4361EE', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
                </div>
              </motion.div>
            </form>

            <motion.div
              className="rp-security"
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

export default RegisterPage;
