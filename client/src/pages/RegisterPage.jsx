import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { Sparkles, BookOpen, Brain, BarChart2, Mail, GraduationCap, Info, Eye, EyeOff, Check } from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

const DEPARTMENTS = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Accounting', 'Economics', 'Law', 'Medicine', 'Engineering',
  'Mass Communication', 'Education', 'Agriculture', 'Business Admin',
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '',
    email: '',
    matricNo: '', faculty: '', department: '', level: '',
    password: '', confirmPassword: '', terms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const rightPanelRef = useRef(null);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();



  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const getStrengthScore = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };
  const strengthScore = getStrengthScore(formData.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addNotification('Passwords do not match.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        matricNo: formData.matricNo,
        password: formData.password,
        faculty: formData.faculty,
        department: formData.department,
        level: formData.level,
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
        .register-body { background: var(--black); color: var(--white); font-family: 'Inter', sans-serif; min-height: 100vh; overflow-x: hidden; }
        .page-wrap { position: relative; z-index: 1; display: grid; grid-template-columns: 380px 1fr; min-height: 100vh; }
        .left-panel { background: rgba(0,86,255,0.04); border-right: 1px solid rgba(0,86,255,0.12); padding: 3rem 2.5rem; display: flex; flex-direction: column; gap: 2rem; position: sticky; top: 0; height: 100vh; overflow: hidden; }
        .left-logo { display: flex; align-items: center; gap: 0.7rem; font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, var(--blue), var(--azure)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-decoration: none; }
        .left-logo-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, var(--blue), var(--azure)); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: 0 0 20px rgba(0,86,255,0.4); }
        .left-headline { font-family: 'Outfit', sans-serif; font-size: 1.9rem; font-weight: 900; line-height: 1.2; }
        .left-headline span { background: linear-gradient(135deg,var(--blue),var(--azure)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .left-sub { color: var(--gray); font-size: 0.92rem; line-height: 1.7; margin-top:0.8rem; }
        
        .perks-list { display: flex; flex-direction: column; gap: 1.1rem; margin-top: 0.5rem; }
        .perk-item { display: flex; align-items: start; gap: 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 1.1rem 1.25rem; transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); backdrop-filter: blur(8px); }
        .perk-item:hover { border-color: rgba(0,86,255,0.25); background: rgba(0,86,255,0.03); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,86,255,0.05); }
        .perk-icon-wrap { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(0,86,255,0.08); border: 1px solid rgba(0,86,255,0.15); color: var(--blue); transition: all 0.35s; flex-shrink: 0; }
        .perk-item:hover .perk-icon-wrap { background: var(--blue); color: #fff; border-color: var(--blue); box-shadow: 0 0 14px rgba(0,86,255,0.3); }
        .perk-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .perk-title { font-size: 0.92rem; font-weight: 700; color: var(--white); }
        .perk-desc { font-size: 0.82rem; color: var(--gray); opacity: 0.85; line-height: 1.4; }
        
        .left-quote { margin-top: auto; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-left: 3px solid var(--blue); border-radius: 0 14px 14px 0; padding: 1.1rem 1.3rem; font-size: 0.85rem; color: var(--gray); font-style: italic; line-height: 1.6; backdrop-filter: blur(8px); }
        .right-panel { padding: 3rem 4rem 4rem; display: flex; flex-direction: column; overflow-y: auto; }
        .form-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .back-btn { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.45rem 1rem 0.45rem 0.75rem; border-radius: 50px; border: 1.5px solid rgba(0,86,255,0.2); background: rgba(0,86,255,0.06); color: var(--blue); text-decoration: none; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.01em; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .back-btn:hover { background: rgba(0,86,255,0.14); border-color: rgba(0,86,255,0.5); box-shadow: 0 0 16px rgba(0,86,255,0.2); transform: translateX(-2px); }
        .back-btn .arrow { display: inline-block; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .back-btn:hover .arrow { transform: translateX(-3px); }
        .step-pill { background: rgba(0,86,255,0.12); border: 1px solid rgba(0,86,255,0.25); color: var(--blue); border-radius: 50px; padding: 0.35rem 1rem; font-size: 0.8rem; font-weight: 600; }
        .form-title { font-family: 'Outfit', sans-serif; font-size: clamp(1.8rem,4vw,2.4rem); font-weight: 900; margin-bottom: 0.8rem; }
        .form-sub { color: var(--gray); font-size: 1rem; line-height: 1.6; margin-bottom: 3.5rem; max-width: 580px; }
        .form { display: flex; flex-direction: column; gap: 1.4rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.45rem; }
        .form-label { font-size: 0.82rem; font-weight: 600; color: var(--white); display: flex; align-items: center; gap: 0.4rem; }
        .form-label .required { color: var(--blue); }
        .input-wrap { position: relative; }
        .form-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 0.85rem 1rem; color: var(--white); font-size: 0.92rem; font-family: 'Inter', sans-serif; transition: all 0.3s; outline: none; box-sizing: border-box; }
        .form-input::placeholder { color: var(--muted); opacity: 0.7; }
        .form-input:focus { border-color: var(--blue); background: rgba(0,86,255,0.04); box-shadow: 0 0 0 3px rgba(0,86,255,0.1); }
        select.form-input option { background: var(--surface); color: var(--white); }
        .input-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: var(--gray); font-size: 1rem; pointer-events: none; }
        .matric-hint { font-size: 0.76rem; color: var(--gray); display: flex; align-items: center; gap: 0.3rem; margin-top: 0.25rem; }
        .strength-bar { display: flex; gap: 4px; margin-top: 0.5rem; }
        .strength-seg { flex: 1; height: 4px; border-radius: 2px; background: rgba(15,23,42,0.1); transition: background 0.3s; }
        .strength-seg.weak { background: #ef4444; }
        .strength-seg.medium { background: var(--azure); }
        .strength-seg.strong { background: var(--blue); }
        .strength-label { font-size: 0.76rem; margin-top: 0.3rem; }
        .checkbox-group { display: flex; align-items: flex-start; gap: 0.75rem; }
        .checkbox-group input[type="checkbox"] { width: 18px; height: 18px; min-width: 18px; border-radius: 5px; border: 1.5px solid rgba(0,86,255,0.3); background: var(--input-bg); cursor: pointer; accent-color: var(--blue); margin-top: 2px; }
        .checkbox-group label { font-size: 0.86rem; color: var(--gray); font-weight: 400; cursor: pointer; }
        .checkbox-group label a { color: var(--blue); text-decoration: none; }
        .submit-btn { width: 100%; padding: 1rem; background: linear-gradient(135deg, var(--blue), var(--azure)); color: #fff; border: none; border-radius: 14px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 30px rgba(0,86,255,0.35); margin-top: 0.5rem; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(0,86,255,0.55); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-link { text-align: center; color: var(--gray); font-size: 0.88rem; margin-top: 1rem; }
        .login-link a { color: var(--azure); text-decoration: none; font-weight: 600; }
        @media (max-width: 900px) { .page-wrap { grid-template-columns: 1fr; } .left-panel { display: none !important; } }
        @media (max-width: 700px) { .right-panel { padding: 2rem 1.5rem; } }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
      
      <div className="mesh-bg"></div>

      <div className="page-wrap">
        {/* LEFT PANEL */}
        <motion.div
          className="left-panel"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <PathWiseLogo href="/" size={32} />

          <div>
            <div className="left-headline">Start Your <span>Career Journey</span> Today</div>
            <p className="left-sub">Create your free account and unlock AI-powered career guidance built specifically for DELSU students.</p>
          </div>

          <motion.div
            className="perks-list"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
            }}
          >
            {[
              { icon: Sparkles, title: 'Personalized Career Match', desc: 'AI analysis across 30+ career directions at DELSU.' },
              { icon: BookOpen, title: 'DELSU Course Roadmap', desc: 'Semester-by-semester plan custom mapped to your department.' },
              { icon: Brain, title: 'AI Advisor', desc: 'Ask career or academic questions, get instant tailored guidance.' },
              { icon: BarChart2, title: 'Skill Gap Analyzer', desc: 'Identify exactly what skills and certifications you need next.' },
            ].map((perk, idx) => {
              const IconComp = perk.icon;
              return (
                <motion.div
                  key={idx}
                  className="perk-item"
                  variants={{
                    hidden: { opacity: 0, x: -16 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } }
                  }}
                >
                  <div className="perk-icon-wrap">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="perk-info">
                    <span className="perk-title">{perk.title}</span>
                    <span className="perk-desc">{perk.desc}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="left-quote">
            "PathWise helped me realize I was perfectly suited for Data Science, not just Computer Science. The roadmap changed how I approach my studies." — DELSU Student
          </div>
        </motion.div>

        {/* RIGHT PANEL (FORM) */}
        <motion.div
          ref={rightPanelRef}
          className="right-panel"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="form-nav">
            <div className="md:hidden">
              <PathWiseLogo href="/" size={28} />
            </div>
            <Link to="/choice" className="back-btn"><span className="arrow">←</span> Back</Link>
            <span className="step-pill hidden md:inline-block">Step 3 of 6 — Create Account</span>
          </div>

          <div className="flex md:hidden justify-start mb-6">
            <span className="step-pill">Step 3 of 6 — Create Account</span>
          </div>

          <div className="lg:hidden mb-6 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pw-blue/5 border border-pw-blue/10">
              <Sparkles className="w-4 h-4 text-pw-blue flex-shrink-0" />
              <span className="text-[10px] font-bold text-pw-gray leading-tight">Career Match</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pw-blue/5 border border-pw-blue/10">
              <BookOpen className="w-4 h-4 text-pw-blue flex-shrink-0" />
              <span className="text-[10px] font-bold text-pw-gray leading-tight">DELSU Roadmap</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pw-blue/5 border border-pw-blue/10">
              <Brain className="w-4 h-4 text-pw-blue flex-shrink-0" />
              <span className="text-[10px] font-bold text-pw-gray leading-tight">AI Advisor</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pw-blue/5 border border-pw-blue/10">
              <BarChart2 className="w-4 h-4 text-pw-blue flex-shrink-0" />
              <span className="text-[10px] font-bold text-pw-gray leading-tight">Skill Analyzer</span>
            </div>
          </div>

          <h1 className="form-title">Create Your Account</h1>
          <p className="form-sub">Fill in your details to get your personalized career guidance. All fields are required.</p>

          <form className="form gap-6" onSubmit={handleRegister}>
            <div className="space-y-3">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g. Chukwuemeka" className="form-input" required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g. Okafor" className="form-input" required/>
                </div>
              </div>

              <div className="form-group pt-1">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <div className="input-wrap">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. name@gmail.com" className="form-input" required/>
                  <span className="input-icon"><Mail className="w-4 h-4 text-pw-gray" /></span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-pw-white/5">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Matric Number <span className="required">*</span></label>
                  <div className="input-wrap">
                    <input type="text" name="matricNo" value={formData.matricNo} onChange={handleChange} placeholder="e.g. FOS/19/20/248102" className="form-input" required/>
                    <span className="input-icon"><GraduationCap className="w-4 h-4 text-pw-gray" /></span>
                  </div>
                  <div className="matric-hint flex items-center gap-1"><Info className="w-3.5 h-3.5 text-pw-blue" /> Format: FOS/SESSION/NUMBER (e.g. FOS/19/20/248102)</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Current Level <span className="required">*</span></label>
                  <select name="level" value={formData.level} onChange={handleChange} className="form-input" required>
                    <option value="" disabled>Select Level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                    <option value="Graduate">Graduate / NYSC</option>
                  </select>
                </div>
              </div>

              <div className="form-row pt-1">
                <div className="form-group">
                  <label className="form-label">Faculty <span className="required">*</span></label>
                  <select name="faculty" value={formData.faculty} onChange={handleChange} className="form-input" required>
                    <option value="" disabled>Select Faculty</option>
                    <option>Science</option>
                    <option>Engineering</option>
                    <option>Arts &amp; Social Sciences</option>
                    <option>Law</option>
                    <option>Medicine &amp; Health Sciences</option>
                    <option>Agriculture &amp; Forestry</option>
                    <option>Education</option>
                    <option>Management Sciences</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department <span className="required">*</span></label>
                  <select name="department" value={formData.department} onChange={handleChange} className="form-input" required>
                    <option value="" disabled>Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-pw-white/5">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password <span className="required">*</span></label>
                  <div className="input-wrap">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" className="form-input" required/>
                    <span className="input-icon" style={{pointerEvents:'all', cursor:'pointer'}} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4 text-pw-gray" /> : <Eye className="w-4 h-4 text-pw-gray" />}
                    </span>
                  </div>
                  <div className="strength-bar">
                    <div className={`strength-seg ${strengthScore > 0 ? (strengthScore <= 1 ? 'weak' : strengthScore <= 2 ? 'medium' : 'strong') : ''}`}></div>
                    <div className={`strength-seg ${strengthScore > 1 ? (strengthScore <= 2 ? 'medium' : 'strong') : ''}`}></div>
                    <div className={`strength-seg ${strengthScore > 2 ? 'strong' : ''}`}></div>
                    <div className={`strength-seg ${strengthScore > 3 ? 'strong' : ''}`}></div>
                  </div>
                  <div className="strength-label" style={{ color: strengthScore <= 1 ? '#ef4444' : strengthScore <= 2 ? 'var(--azure)' : 'var(--blue)' }}>
                    {strengthScore === 0 ? 'Enter a password' : strengthScore <= 1 ? 'Weak password' : strengthScore <= 2 ? 'Fair password' : strengthScore <= 3 ? 'Good password' : 'Strong password ✓'}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password <span className="required">*</span></label>
                  <div className="input-wrap">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" className="form-input" required/>
                    <span className="input-icon" style={{pointerEvents:'all', cursor:'pointer'}} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 text-pw-gray" /> : <Eye className="w-4 h-4 text-pw-gray" />}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-pw-white/5">
              <div className="checkbox-group">
                <input type="checkbox" id="terms" name="terms" checked={formData.terms} onChange={handleChange} required/>
                <label htmlFor="terms">I agree to PathWise's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. I understand my data will be used to personalize my career recommendations.</label>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Create My Account — Start My Journey'}
              </button>

              <p className="login-link">Already have an account? <Link to="/login">Log in here</Link></p>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
