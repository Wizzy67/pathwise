import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import {
  Mail, GraduationCap, Eye, EyeOff, User,
  Check, ArrowRight, ArrowLeft, ShieldCheck
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    matricNo: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const perks = [
    'Personalised RIASEC career assessment',
    'DELSU semester-by-semester course roadmap',
    '24/7 AI Academic & Career Advisor',
    'Save, compare & bookmark career paths',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reg-field-anim { animation: fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .reg-input {
          width: 100%;
          padding: 0.75rem 2.8rem 0.75rem 0.9rem;
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
        .reg-input::placeholder { color: #94A3B8; }
        .reg-input:focus {
          border-color: #20428B;
          box-shadow: 0 0 0 3px rgba(32,66,139,0.1);
        }
        .reg-icon-wrap {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .reg-icon-btn {
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
        .reg-icon-btn:hover { color: #20428B; }
        .left-panel-pattern {
          background-color: #20428B;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(26,52,108,0.8) 0%, transparent 60%);
        }
      `}</style>

      {/* Split Panel */}
      <div className="flex flex-1 min-h-screen">

        {/* Left — Blue Branding */}
        <aside className="hidden lg:flex lg:w-[42%] xl:w-[38%] left-panel-pattern flex-col justify-between px-10 xl:px-14 py-12 min-h-screen">
          <div>
            <div className="mb-10">
              <PathWiseLogo href="/" size={28} textColor="#ffffff" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold tracking-wide uppercase mb-8">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>DELSU Student Career Platform</span>
            </div>

            <h2 className="text-white font-outfit text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Start your career<br />
              <span className="text-[#93B4E8]">journey today.</span>
            </h2>

            <p className="text-white/65 text-sm leading-relaxed mb-10 max-w-xs">
              Join DELSU students discovering their ideal career paths with AI-powered guidance and personalised academic planning.
            </p>

            <div className="flex flex-col gap-3.5">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-white/80 text-sm leading-relaxed">{perk}</span>
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

        {/* Right — Form */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10">
          <div className="w-full max-w-md">

            <Link
              to="/"
              className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-[#20428B] mb-6 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back
            </Link>

            <div className="mb-7">
              <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-1.5">
                Create your account
              </h1>
              <p className="text-sm text-[#64748B]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#20428B] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">

              {/* Full Name */}
              <div className="reg-field-anim flex flex-col gap-1.5" style={{ animationDelay: '0.05s' }}>
                <label className="text-xs font-semibold text-[#374151] tracking-wide">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Ifeanyi Wisdom"
                    className="reg-input"
                    required
                  />
                  <span className="reg-icon-wrap"><User className="w-4 h-4" /></span>
                </div>
              </div>

              {/* Email */}
              <div className="reg-field-anim flex flex-col gap-1.5" style={{ animationDelay: '0.1s' }}>
                <label className="text-xs font-semibold text-[#374151] tracking-wide">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="reg-input"
                    required
                  />
                  <span className="reg-icon-wrap"><Mail className="w-4 h-4" /></span>
                </div>
              </div>

              {/* Matric Number */}
              <div className="reg-field-anim flex flex-col gap-1.5" style={{ animationDelay: '0.15s' }}>
                <label className="text-xs font-semibold text-[#374151] tracking-wide">Matric Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="matricNo"
                    value={formData.matricNo}
                    onChange={handleChange}
                    placeholder="FOS/19/20/0001"
                    className="reg-input"
                    required
                  />
                  <span className="reg-icon-wrap"><GraduationCap className="w-4 h-4" /></span>
                </div>
              </div>

              {/* Password Row */}
              <div className="reg-field-anim grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ animationDelay: '0.2s' }}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#374151] tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="reg-input"
                      required
                    />
                    <button type="button" className="reg-icon-btn" onClick={() => setShowPassword(p => !p)} aria-label="Toggle password">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#374151] tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm"
                      className="reg-input"
                      required
                    />
                    <button type="button" className="reg-icon-btn" onClick={() => setShowConfirmPassword(p => !p)} aria-label="Toggle confirm password">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="reg-field-anim mt-2" style={{ animationDelay: '0.25s' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#20428B] hover:bg-[#2A52A8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSubmitting ? <span>Creating account...</span> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>

              <p className="text-center text-[11px] text-[#94A3B8] leading-relaxed">
                By creating an account you agree to our{' '}
                <span className="text-[#20428B] cursor-pointer hover:underline">Terms of Service</span>{' '}
                and{' '}
                <span className="text-[#20428B] cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            </form>

            <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#20428B]" />
              <span>Secured with end-to-end encryption</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterPage;
