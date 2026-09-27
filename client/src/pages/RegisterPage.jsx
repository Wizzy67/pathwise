import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import {
  Mail, GraduationCap, Eye, EyeOff, User,
  Check, ArrowRight, ArrowLeft, ShieldCheck,
  Building, BookOpen, Layers, AlertCircle
} from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

const FACULTIES_AND_DEPARTMENTS = {
  'Faculty of Science': [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Microbiology',
    'Biochemistry',
    'Animal and Environmental Biology',
    'Plant Biology and Biotechnology',
    'Geology'
  ],
  'Faculty of Engineering': [
    'Electrical/Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Petroleum Engineering',
    'Chemical Engineering'
  ],
  'Faculty of Management Sciences': [
    'Accounting',
    'Banking and Finance',
    'Business Administration',
    'Marketing',
    'Public Administration'
  ],
  'Faculty of Social Sciences': [
    'Economics',
    'Political Science',
    'Sociology',
    'Mass Communication',
    'Psychology',
    'Geography and Regional Planning'
  ],
  'Faculty of Arts': [
    'English and Literary Studies',
    'History and International Studies',
    'Theatre Arts',
    'Music',
    'Languages and Linguistics',
    'Philosophy',
    'Religious Studies'
  ],
  'Faculty of Basic Medical Sciences': [
    'Human Anatomy',
    'Medical Physiology',
    'Medical Biochemistry',
    'Pharmacology'
  ],
  'Faculty of Clinical Sciences': [
    'Medicine and Surgery',
    'Nursing Science',
    'Medical Laboratory Science'
  ],
  'Faculty of Law': [
    'Law'
  ],
  'Faculty of Pharmacy': [
    'Pharmacy'
  ],
  'Faculty of Education': [
    'Science Education',
    'Social Science Education',
    'Arts Education',
    'Educational Management'
  ],
  'Faculty of Agriculture': [
    'Agricultural Economics',
    'Agronomy',
    'Animal Science',
    'Fisheries'
  ]
};

const LEVELS = ['100', '200', '300', '400', '500'];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    matricNo: '',
    faculty: 'Faculty of Science',
    department: 'Computer Science',
    level: '400',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Validate a single field
  const validateField = (name, value, currentForm = formData) => {
    let err = '';
    const trimmed = typeof value === 'string' ? value.trim() : '';

    switch (name) {
      case 'fullName':
        if (!trimmed) err = 'Full name is required';
        else if (trimmed.length < 3) err = 'Please enter your full name (at least 3 characters)';
        break;
      case 'email':
        if (!trimmed) err = 'Email address is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) err = 'Please enter a valid email address';
        break;
      case 'matricNo':
        if (!trimmed) err = 'DELSU Matric Number is required';
        else if (trimmed.length < 5) err = 'Please enter a valid matric number (e.g. FOS/20/21/248900)';
        break;
      case 'faculty':
        if (!trimmed) err = 'Please select your faculty';
        break;
      case 'department':
        if (!trimmed) err = 'Please select your department';
        break;
      case 'level':
        if (!trimmed) err = 'Please select your current level';
        break;
      case 'password':
        if (!value) err = 'Password is required';
        else if (value.length < 6) err = 'Password must be at least 6 characters';
        break;
      case 'confirmPassword':
        if (!value) err = 'Please confirm your password';
        else if (value !== currentForm.password) err = 'Passwords do not match';
        break;
      default:
        break;
    }
    return err;
  };

  // Run full validation across all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key === 'agreeTerms') return;
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must accept the terms to create an account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newVal };

      // If faculty changes, reset department to first department of that faculty
      if (name === 'faculty') {
        const deptList = FACULTIES_AND_DEPARTMENTS[newVal] || [];
        updated.department = deptList[0] || '';
      }

      // Auto-detect faculty from matric prefix if faculty not touched
      if (name === 'matricNo' && !touched.faculty) {
        const upper = value.toUpperCase();
        if (upper.startsWith('FOS/')) {
          updated.faculty = 'Faculty of Science';
          updated.department = 'Computer Science';
        } else if (upper.startsWith('ENG/')) {
          updated.faculty = 'Faculty of Engineering';
          updated.department = 'Electrical/Electronics Engineering';
        } else if (upper.startsWith('LAW/')) {
          updated.faculty = 'Faculty of Law';
          updated.department = 'Law';
        } else if (upper.startsWith('SMS/') || upper.startsWith('FMS/')) {
          updated.faculty = 'Faculty of Management Sciences';
          updated.department = 'Accounting';
        }
      }

      // Live validate if touched
      if (touched[name]) {
        const err = validateField(name, newVal, updated);
        setErrors((prevErr) => ({ ...prevErr, [name]: err }));
      }

      // Live match check for confirmPassword when password changes
      if (name === 'password' && touched.confirmPassword) {
        const confirmErr = validateField('confirmPassword', prev.confirmPassword, updated);
        setErrors((prevErr) => ({ ...prevErr, confirmPassword: confirmErr }));
      }

      return updated;
    });

    if (serverError) setServerError('');
  };

  // Password strength score 0 to 4
  const passwordStrength = useMemo(() => {
    const p = formData.password || '';
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }, [formData.password]);

  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong'];
  const strengthColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');

    // Mark all as touched
    const allTouched = {};
    Object.keys(formData).forEach((k) => { allTouched[k] = true; });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        matricNo: formData.matricNo.trim(),
        password: formData.password,
        faculty: formData.faculty,
        department: formData.department,
        level: formData.level,
        cgpa: null,
      };

      const res = await api.post('/auth/register', payload);
      await login(res.data.token, res.data.user);
      addNotification('Welcome to PathWise! Your account is created.', 'success');
      navigate('/welcome');
    } catch (error) {
      console.error('Registration error:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please check your details.';
      setServerError(errMsg);
      addNotification(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const perks = [
    'Personalised RIASEC career assessment',
    'DELSU course roadmap & syllabus tracking',
    '24/7 AI Academic & Career Advisor',
    'Institutional DELSU career opportunities',
  ];

  const currentDepartments = FACULTIES_AND_DEPARTMENTS[formData.faculty] || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <style>{`
        .reg-input {
          width: 100%;
          padding: 0.72rem 2.6rem 0.72rem 0.85rem;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 0.88rem;
          color: #0F172A;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .reg-input:focus {
          border-color: #20428B;
          box-shadow: 0 0 0 3px rgba(32,66,139,0.08);
        }
        .reg-input.has-error {
          border-color: #EF4444;
          background-color: #FEF2F2;
        }
        .reg-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }
        .reg-select {
          width: 100%;
          padding: 0.72rem 2rem 0.72rem 0.85rem;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 0.88rem;
          color: #0F172A;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          font-family: inherit;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
        }
        .reg-select:focus {
          border-color: #20428B;
          box-shadow: 0 0 0 3px rgba(32,66,139,0.08);
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
          transition: color 0.15s;
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

        {/* Left — Blue Branding (Desktop) */}
        <aside className="hidden lg:flex lg:w-[40%] xl:w-[36%] left-panel-pattern flex-col justify-between px-10 xl:px-12 py-12 min-h-screen">
          <div>
            <div className="mb-10">
              <PathWiseLogo href="/" size={28} textColor="#ffffff" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold tracking-wide uppercase mb-6">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>DELSU Academic Advisory</span>
            </div>

            <h2 className="text-white font-outfit text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Start your career<br />
              <span className="text-[#93B4E8]">journey today.</span>
            </h2>

            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs">
              Join DELSU students discovering their ideal career paths with AI-powered guidance and personalised academic planning.
            </p>

            <div className="flex flex-col gap-3">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-white/85 text-xs sm:text-sm leading-relaxed">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/15 pt-6 mt-8">
            <p className="text-white/50 text-xs leading-relaxed">
              B.Sc. Final Year Degree Project<br />
              <span className="text-white/75 font-medium">Dept. of Computer Science — DELSU, Abraka</span>
            </p>
          </div>
        </aside>

        {/* Right — Form Container */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-10">
          <div className="w-full max-w-lg">

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <PathWiseLogo href="/" size={24} />
              <Link
                to="/choice"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#20428B] group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-1.5">
                Create student account
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Already registered?{' '}
                <Link to="/login" className="text-[#20428B] font-bold hover:underline">
                  Sign in to your account
                </Link>
              </p>
            </div>

            {/* Server Error Alert Banner */}
            {serverError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{serverError}</div>
              </div>
            )}

            <form onSubmit={handleRegister} noValidate className="flex flex-col gap-3.5">

              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#374151] tracking-wide flex items-center justify-between">
                  <span>Full Name</span>
                  {touched.fullName && !errors.fullName && <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-0.5"><Check className="w-3 h-3" /> Valid</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="e.g. Wisdom Ifeanyi"
                    className={`reg-input ${touched.fullName && errors.fullName ? 'has-error' : ''}`}
                    autoComplete="name"
                  />
                  <span className="reg-icon-wrap"><User className="w-4 h-4" /></span>
                </div>
                {touched.fullName && errors.fullName && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email & Matric Number Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#374151] tracking-wide flex items-center justify-between">
                    <span>Email Address</span>
                    {touched.email && !errors.email && <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-0.5"><Check className="w-3 h-3" /> Valid</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      placeholder="student@example.com"
                      className={`reg-input ${touched.email && errors.email ? 'has-error' : ''}`}
                      autoComplete="email"
                    />
                    <span className="reg-icon-wrap"><Mail className="w-4 h-4" /></span>
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Matric Number */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#374151] tracking-wide flex items-center justify-between">
                    <span>DELSU Matric Number</span>
                    {touched.matricNo && !errors.matricNo && <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-0.5"><Check className="w-3 h-3" /> Valid</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="matricNo"
                      value={formData.matricNo}
                      onChange={handleChange}
                      onBlur={() => handleBlur('matricNo')}
                      placeholder="FOS/20/21/248900"
                      className={`reg-input ${touched.matricNo && errors.matricNo ? 'has-error' : ''}`}
                      autoCapitalize="characters"
                    />
                    <span className="reg-icon-wrap"><GraduationCap className="w-4 h-4" /></span>
                  </div>
                  {touched.matricNo && errors.matricNo && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.matricNo}
                    </p>
                  )}
                </div>
              </div>

              {/* Faculty Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#374151] tracking-wide flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#20428B]" />
                  <span>Faculty</span>
                </label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  onBlur={() => handleBlur('faculty')}
                  className="reg-select"
                >
                  {Object.keys(FACULTIES_AND_DEPARTMENTS).map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>

              {/* Department & Level Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Department (2 cols on sm) */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#374151] tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#20428B]" />
                    <span>Department</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    onBlur={() => handleBlur('department')}
                    className="reg-select"
                  >
                    {currentDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Level (1 col on sm) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#374151] tracking-wide flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#20428B]" />
                    <span>Level</span>
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    onBlur={() => handleBlur('level')}
                    className="reg-select"
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl} Level</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#374151] tracking-wide flex items-center justify-between">
                    <span>Password</span>
                    {formData.password && (
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: strengthColors[Math.max(0, passwordStrength - 1)] }}
                      >
                        {strengthLabels[Math.max(0, passwordStrength - 1)]}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      placeholder="Min. 6 characters"
                      className={`reg-input ${touched.password && errors.password ? 'has-error' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="reg-icon-btn"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {formData.password && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className="h-1 flex-1 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: bar <= passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : '#E2E8F0'
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {touched.password && errors.password && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#374151] tracking-wide flex items-center justify-between">
                    <span>Confirm Password</span>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Matches
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Re-enter password"
                      className={`reg-input ${touched.confirmPassword && errors.confirmPassword ? 'has-error' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="reg-icon-btn"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-slate-300 text-[#20428B] focus:ring-[#20428B]"
                  />
                  <span className="text-xs text-[#64748B] leading-relaxed">
                    I agree to the <span className="text-[#20428B] font-semibold hover:underline">Terms of Service</span> and acknowledge that career matches are academic guidance recommendations.
                  </span>
                </label>
                {touched.agreeTerms && errors.agreeTerms && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#20428B] hover:bg-[#1A346C] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Creating your PathWise account...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#20428B]" />
              <span>Secured with 256-Bit SSL Institutional Encryption</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterPage;
