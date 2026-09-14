import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, BookOpen, GraduationCap, Calculator, Loader2, Save,
  Phone, Globe, ExternalLink, HelpCircle, ShieldCheck, Award,
  Sparkles, Compass, CheckCircle2, ChevronRight, Copy, Check,
  Briefcase, Bookmark, RotateCcw, AlertCircle, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { setCache } from '../services/db';
import { motion, AnimatePresence } from 'framer-motion';

const LEVELS = ['100', '200', '300', '400', '500'];

const getCgpaClass = (cgpa) => {
  const val = parseFloat(cgpa);
  if (isNaN(val) || val <= 0) return null;
  if (val >= 4.50) return { label: 'First Class Honours', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (val >= 3.50) return { label: 'Second Class Upper (2:1)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  if (val >= 2.40) return { label: 'Second Class Lower (2:2)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (val >= 1.50) return { label: 'Third Class', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  return { label: 'Pass / Remedial', color: 'text-red-700 bg-red-50 border-red-200' };
};

const MyProfile = () => {
  const { user, setUser, logout } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addNotification('You have been logged out.', 'info');
    navigate('/');
  };
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    faculty: user?.faculty || '',
    department: user?.department || '',
    level: user?.level || '100',
    cgpa: user?.cgpa || ''
  });
  
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'career' | 'advisory'
  const [isSaving, setIsSaving] = useState(false);
  const [copiedMatric, setCopiedMatric] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        faculty: user.faculty || '',
        department: user.department || '',
        level: user.level || '100',
        cgpa: user.cgpa ?? ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setLevel = (lvl) => {
    setFormData(prev => ({ ...prev, level: lvl }));
  };

  const copyMatric = () => {
    if (user?.matricNo) {
      navigator.clipboard.writeText(user.matricNo);
      setCopiedMatric(true);
      setTimeout(() => setCopiedMatric(false), 2000);
      addNotification('Matriculation number copied to clipboard', 'success');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const name = formData.fullName.trim();
    const fac = formData.faculty.trim();
    const dept = formData.department.trim();
    
    if (!name || !fac || !dept) {
      addNotification('Please fill in your name, faculty, and department.', 'error');
      return;
    }

    if (formData.cgpa !== '') {
      const parsedCgpa = parseFloat(formData.cgpa);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 5) {
        addNotification('CGPA must be on the standard 5.00 scale (0.00 - 5.00).', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await api.put('/users/profile', {
        fullName: name,
        faculty: fac,
        department: dept,
        level: formData.level,
        cgpa: formData.cgpa === '' ? null : parseFloat(formData.cgpa)
      });
      if (res.data) {
        setUser(res.data);
        await setCache('userProfile', res.data);
        addNotification('Profile credentials updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      addNotification(err.response?.data?.error || 'Failed to update profile credentials.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const cgpaClassification = getCgpaClass(formData.cgpa);
  const initials = (formData.fullName || user?.fullName || 'Student')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-4xl lg:max-w-none mx-auto w-full px-3.5 sm:px-6 py-4 space-y-4 pb-28 md:pb-12" style={{ fontFamily: 'var(--font-body, "Open Sans")' }}>
      <style>{`
        h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading, 'Nunito'); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Top Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--ink)]">
            Student Profile
          </h1>
          <p className="text-xs text-[var(--graphite)]">
            Verified Delta State University Academic Identity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Matric Verified</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="Log out of PathWise"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* ── Modern DELSU Student Credential Card ───────────────────────── */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 relative overflow-hidden shadow-sm">
        {/* Subtle background ambient mesh */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: 'var(--blue)' }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 relative z-10">
          {/* Avatar with Status Ping */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[var(--blue)] to-[var(--azure)] text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md border-2 border-white">
              {initials || 'U'}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs"
              title="Active Student Account"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Student Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-lg sm:text-xl font-black text-[var(--ink)] truncate">
                {formData.fullName || 'DELSU Student'}
              </h2>
            </div>

            {/* Matriculation Number Pill with Copy */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--lavender)] border border-[var(--border)] text-xs font-bold text-[var(--blue)] mb-2">
              <span className="font-mono tracking-wider">{user?.matricNo || 'Matriculation Pending'}</span>
              <button
                type="button"
                onClick={copyMatric}
                className="hover:text-[var(--ink)] transition-colors p-0.5"
                title="Copy Matriculation Number"
              >
                {copiedMatric ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <p className="text-xs text-[var(--graphite)]">
              {formData.department ? `${formData.department}` : 'Department unassigned'}
              {formData.faculty ? ` • Faculty of ${formData.faculty}` : ''}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 sm:flex sm:flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
            <div className="p-2.5 rounded-2xl bg-[var(--mist)] text-center min-w-[84px]">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--graphite)]">Level</p>
              <p className="text-sm font-black text-[var(--ink)]">{formData.level}L</p>
            </div>

            <div className="p-2.5 rounded-2xl bg-[var(--mist)] text-center min-w-[84px]">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--graphite)]">CGPA</p>
              <p className="text-sm font-black text-[var(--blue)]">
                {formData.cgpa ? parseFloat(formData.cgpa).toFixed(2) : '—'}
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-[var(--mist)] text-center min-w-[84px]">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--graphite)]">Holland</p>
              <p className="text-sm font-black text-amber-600">
                {user?.hollandCode || 'IRC'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Segmented Navigation Tabs ──────────────────────────────────── */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xs">
        {[
          { id: 'academic', label: 'Academic Details', icon: BookOpen },
          { id: 'career', label: 'Career Footprint', icon: Compass },
          { id: 'advisory', label: 'DELSU Support', icon: Phone }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'text-[var(--graphite)] hover:text-[var(--ink)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: ACADEMIC CREDENTIALS FORM ───────────────────────────── */}
      {activeTab === 'academic' && (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[var(--ink)]">
                  Academic Credentials
                </h3>
                <p className="text-xs text-[var(--graphite)]">
                  These parameters calibrate your DELSU course roadmaps and career matching weights.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--graphite)] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[var(--blue)]" /> Full Legal Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Oghenekaro Wisdom"
                  className="w-full bg-[var(--fog)] border border-[var(--border)] text-[var(--ink)] rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent outline-none transition-all placeholder-[var(--ash)]"
                />
              </div>

              {/* Matric Number (Read-Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--graphite)] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DELSU Matric Number
                  </span>
                  <span className="text-[10px] text-[var(--graphite)] bg-[var(--mist)] px-2 py-0.5 rounded-md">
                    Institutional ID
                  </span>
                </label>
                <input
                  type="text"
                  value={user?.matricNo || ''}
                  disabled
                  className="w-full bg-[var(--mist)] border border-[var(--border)] text-[var(--graphite)] rounded-xl p-3 text-xs sm:text-sm font-mono cursor-not-allowed"
                />
              </div>

              {/* Faculty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--graphite)] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--blue)]" /> Academic Faculty
                </label>
                <input
                  type="text"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  placeholder="e.g. Computing, Science, Management"
                  className="w-full bg-[var(--fog)] border border-[var(--border)] text-[var(--ink)] rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent outline-none transition-all placeholder-[var(--ash)]"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--graphite)] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[var(--blue)]" /> Academic Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-[var(--fog)] border border-[var(--border)] text-[var(--ink)] rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent outline-none transition-all placeholder-[var(--ash)]"
                />
              </div>
            </div>

            {/* Academic Level Selector (Pill Buttons) */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[var(--graphite)] flex items-center justify-between">
                <span>Current Academic Standing (Level)</span>
                <span className="text-[11px] font-extrabold text-[var(--blue)]">{formData.level} Level</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {LEVELS.map((lvl) => {
                  const isSelected = formData.level === lvl;
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                        isSelected
                          ? 'bg-[var(--blue)] text-white border-[var(--blue)] shadow-xs'
                          : 'bg-[var(--fog)] text-[var(--ink)] border-[var(--border)] hover:border-[var(--blue)]'
                      }`}
                    >
                      {lvl}L
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CGPA with Dynamic Honours Classification */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--graphite)] flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-[var(--blue)]" /> Cumulative Grade Point Average (CGPA)
                </label>
                {cgpaClassification && (
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${cgpaClassification.color}`}>
                    {cgpaClassification.label}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5.0"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 4.25 (5.00 Scale)"
                  className="w-full bg-[var(--fog)] border border-[var(--border)] text-[var(--ink)] rounded-xl p-3 pr-14 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent outline-none transition-all placeholder-[var(--ash)]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--ash)]">
                  / 5.00
                </span>
              </div>
              <p className="text-[11px] text-[var(--graphite)]">
                DELSU uses the standard 5-point grading system. Updating this automatically recalibrates your career suitability indices.
              </p>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-2xl bg-[var(--blue)] hover:bg-[var(--azure)] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Updating Profile...' : 'Save Academic Credentials'}</span>
          </button>
        </form>
      )}

      {/* ── TAB 2: PSYCHOMETRIC & CAREER FOOTPRINT ─────────────────────── */}
      {activeTab === 'career' && (
        <div className="space-y-4">
          {/* Holland Code Card */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--ink)]">
                  Holland Code Diagnostics
                </h3>
                <p className="text-xs text-[var(--graphite)]">
                  Based on your 18-item RIASEC psychometric survey
                </p>
              </div>
              <Link
                to="/quiz"
                className="flex items-center gap-1 text-xs font-bold text-[var(--blue)] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--mist)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(user?.hollandCode || 'IRC').split('').map((letter, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-xl bg-[var(--blue)] text-white font-black text-base flex items-center justify-center shadow-xs"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[var(--ink)]">
                  {user?.hollandLabel || 'Investigative · Realistic · Conventional'}
                </p>
                <Link
                  to="/results"
                  className="text-[11px] text-[var(--blue)] font-bold inline-flex items-center gap-1 mt-0.5"
                >
                  View Radar Breakdown <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Top Recommendation & Bookmarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[var(--blue)]">
                <Briefcase className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">Top Recommendation</span>
              </div>
              <p className="text-base font-black text-[var(--ink)]">
                {user?.quizResults?.[0]?.careerId ? user.quizResults[0].careerId.replace(/-/g, ' ').toUpperCase() : 'Software Engineer'}
              </p>
              <p className="text-xs text-[var(--graphite)]">
                Match Index: <span className="font-bold text-emerald-600">{user?.quizResults?.[0]?.score || 88}%</span>
              </p>
              <Link
                to="/results"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--blue)] pt-1"
              >
                View Matches <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <Bookmark className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">Bookmarked Pathways</span>
              </div>
              <p className="text-2xl font-black text-[var(--ink)]">
                {user?.savedCareers?.length || 0}
              </p>
              <p className="text-xs text-[var(--graphite)]">
                Saved career roadmaps for offline study
              </p>
              <Link
                to="/saved-careers"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--blue)] pt-1"
              >
                Open Bookmarks <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: DELSU ADVISORY & INSTITUTIONAL SUPPORT ──────────────── */}
      {activeTab === 'advisory' && (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--ink)]">
                DELSU Career Services & Advisory Desk
              </h3>
              <p className="text-xs text-[var(--graphite)]">
                Official contacts for academic planning, SIWES, and student counseling.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href="tel:+2348031234567"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--mist)] border border-[var(--border)] hover:border-[var(--blue)] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--surface)] text-[var(--blue)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--blue)] group-hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--ink)]">Advisory Helpline</p>
                <p className="text-[11px] text-[var(--graphite)] truncate">+234 803 123 4567</p>
              </div>
            </a>

            <a
              href="mailto:support@pathwise.delsu.edu.ng"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--mist)] border border-[var(--border)] hover:border-[var(--blue)] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--surface)] text-[var(--blue)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--blue)] group-hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--ink)]">Advisory Email</p>
                <p className="text-[11px] text-[var(--graphite)] truncate">support@pathwise.delsu.edu.ng</p>
              </div>
            </a>

            <a
              href="https://delsu.edu.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--mist)] border border-[var(--border)] hover:border-[var(--blue)] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--surface)] text-[var(--blue)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--blue)] group-hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                  DELSU Main Portal <ExternalLink className="w-3 h-3 text-[var(--ash)]" />
                </p>
                <p className="text-[11px] text-[var(--graphite)] truncate">delsu.edu.ng</p>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--mist)] border border-[var(--border)]">
              <div className="w-9 h-9 rounded-xl bg-[var(--surface)] text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--ink)]">Office Location</p>
                <p className="text-[11px] text-[var(--graphite)] truncate">Directorate of Academic Planning, Abraka</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Account & Session Management (Mobile & Desktop) ──────── */}
      <div className="rounded-3xl border border-red-100 bg-[var(--surface)] p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[var(--ink)]">
                Account & Session
              </h3>
              <p className="text-xs text-[var(--graphite)]">
                Signed in as <span className="font-bold text-[var(--ink)]">{user?.matricNo || user?.email || 'Active Student'}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of PathWise</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
