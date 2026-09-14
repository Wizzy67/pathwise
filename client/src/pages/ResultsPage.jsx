import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import { useModal } from '../contexts/ModalContext';
import api from '../services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip, BarChart, Bar, XAxis, YAxis, Cell
} from 'recharts';
import * as LucideIcons from 'lucide-react';
import {
  Laptop, Loader2, Settings, Search, Palette, Users, TrendingUp, ClipboardList,
  ChevronRight, Sparkles, Award, Compass, ArrowRight, BookOpen, MessageSquare,
  FileText, RotateCcw, Share2, CheckCircle2, ChevronLeft
} from 'lucide-react';

// ── RIASEC dimension config ───────────────────────────────────────────
const RIASEC_META = {
  R: { label: 'Realistic',     color: '#FF6B35', icon: Settings,      desc: 'Practical, hands-on, mechanical' },
  I: { label: 'Investigative', color: '#20428B', icon: Search,        desc: 'Analytical, research-driven, curious' },
  A: { label: 'Artistic',      color: '#9B59B6', icon: Palette,       desc: 'Creative, expressive, imaginative' },
  S: { label: 'Social',        color: '#27AE60', icon: Users,         desc: 'Helping, teaching, nurturing' },
  E: { label: 'Enterprising',  color: '#F39C12', icon: TrendingUp,    desc: 'Leadership, persuasive, ambitious' },
  C: { label: 'Conventional',  color: '#17A589', icon: ClipboardList, desc: 'Orderly, detail-oriented, structured' },
};

const OUTCOME_LABELS = {
  income: 'Financial Reward',
  impact: 'Social Impact',
  creativity: 'Creativity',
  stability: 'Job Security',
  status: 'Prestige',
  autonomy: 'Autonomy'
};

const getCareerIcon = (iconName) => {
  return LucideIcons[iconName] || Laptop;
};

// ── Compact Holland Code Badge ────────────────────────────────────────
const CompactHollandBadge = ({ code }) => {
  if (!code) return null;
  const letters = code.split('');
  return (
    <div className="flex items-center gap-1.5 justify-center">
      {letters.map((letter, i) => {
        const meta = RIASEC_META[letter] || { color: '#20428B', label: letter };
        return (
          <div
            key={i}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-white font-extrabold text-xs shadow-sm"
            style={{ backgroundColor: meta.color }}
          >
            <span>{letter}</span>
            <span className="text-[10px] font-medium opacity-90 hidden sm:inline">{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { confirm } = useModal();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'personality' | 'skills'
  const [chartView, setChartView] = useState('radar'); // 'radar' | 'bars'

  const handleRetake = async () => {
    const ok = await confirm({
      title: 'Retake Diagnostic?',
      message: 'Starting a new assessment will calculate fresh career recommendations based on your updated answers.',
      confirmText: 'Retake',
      cancelText: 'Cancel',
      variant: 'brand',
      icon: 'rotate',
    });
    if (ok) {
      navigate('/quiz');
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [quizRes, careersRes] = await Promise.all([
          api.get('/quiz/results'),
          api.get('/data/careers')
        ]);

        const { matches, hollandCode, hollandLabel, riasecScores, selfEfficacy, outcomeExpectations } = quizRes.data;
        const careers = careersRes.data;

        if (!matches || matches.length === 0) {
          setResults(null);
          setLoading(false);
          return;
        }

        // Map matches to full career objects
        const mappedMatches = matches.map(m => {
          const c = careers.find(car => car.id === m.careerId);
          return {
            id: m.careerId,
            title: c?.title || m.careerId,
            score: m.score,
            field: c?.field || 'STEM',
            icon: c?.icon || 'Briefcase',
            holland_code: c?.holland_code || [],
            salary: c?.salary_range || 'Competitive',
            demand: c?.demand || 'High'
          };
        });

        // Build RIASEC radar data (6-axis hexagon)
        const radarData = riasecScores
          ? Object.entries(riasecScores).map(([k, v]) => ({
              subject: RIASEC_META[k]?.label || k,
              value: v,
              fullMark: 100
            }))
          : [
              { subject: 'Realistic', value: 60, fullMark: 100 },
              { subject: 'Investigative', value: 75, fullMark: 100 },
              { subject: 'Artistic', value: 40, fullMark: 100 },
              { subject: 'Social', value: 55, fullMark: 100 },
              { subject: 'Enterprising', value: 65, fullMark: 100 },
              { subject: 'Conventional', value: 70, fullMark: 100 },
            ];

        // Build RIASEC dimension breakdown sorted by score
        const riasecBreakdown = riasecScores
          ? Object.entries(riasecScores)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => ({ key: k, ...RIASEC_META[k], score: v }))
          : [];

        // SCCT outcome expectations data
        const outcomeData = outcomeExpectations
          ? Object.entries(outcomeExpectations).map(([k, v]) => ({
              name: OUTCOME_LABELS[k] || k,
              value: parseInt(v) || 0
            }))
          : [];

        // Skill development gaps for top matches
        const skillGap = mappedMatches.slice(0, 3).map(m => {
          const c = careers.find(car => car.id === m.id);
          return {
            career: m.title,
            skills: c?.core_skills?.slice(0, 3) || ['Core Competencies', 'Analytical Problem Solving'],
            icon: m.icon
          };
        });

        setResults({
          topMatch: mappedMatches[0],
          top5: mappedMatches.slice(0, 5),
          hollandCode: hollandCode || 'IRC',
          hollandLabel: hollandLabel || 'Investigative · Realistic · Conventional',
          radarData,
          riasecBreakdown,
          outcomeData,
          selfEfficacy: selfEfficacy || {},
          skillGap
        });
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ backgroundColor: 'var(--canvas)', fontFamily: "'Open Sans', sans-serif" }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--lavender)' }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--blue)' }} />
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Synthesizing Tri-Theory Profile</p>
          <p className="text-xs" style={{ color: 'var(--graphite)' }}>Calibrating Holland Code, SCCT Efficacy, and DELSU Roadmaps…</p>
          <div className="flex gap-1.5 mt-2">
            {['RIASEC', 'SCCT', 'Constructivist'].map((t, i) => (
              <span
                key={t}
                className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
                style={{
                  background: ['#20428B18', '#27AE6018', '#9B59B618'][i],
                  color: ['#20428B', '#27AE60', '#9B59B6'][i]
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ backgroundColor: 'var(--canvas)', fontFamily: "'Open Sans', sans-serif" }}>
        <div className="text-center max-w-sm p-6 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--lavender)' }}>
            <Compass className="w-6 h-6" style={{ color: 'var(--blue)' }} />
          </div>
          <h2 className="text-lg font-extrabold mb-1" style={{ color: 'var(--ink)' }}>No Assessment on Record</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--graphite)' }}>
            Complete the 5-step career diagnostic to generate your verified RIASEC profile and tailored DELSU matches.
          </p>
          <Link
            to="/quiz"
            className="w-full py-3 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            style={{ backgroundColor: 'var(--blue)' }}
          >
            Start Assessment Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { topMatch, top5, hollandCode, hollandLabel, radarData, riasecBreakdown, outcomeData, selfEfficacy, skillGap } = results;
  const TopIcon = getCareerIcon(topMatch?.icon);

  return (
    <div className="max-w-4xl mx-auto w-full px-3.5 sm:px-6 py-4 space-y-4 pb-24" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <style>{`
        h1, h2, h3, h4, h5, h6 { font-family: 'Nunito', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Mobile Top App Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all hover:bg-[var(--mist)]"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold leading-tight" style={{ color: 'var(--ink)' }}>
              Career Diagnostics
            </h1>
            <p className="text-[10px] sm:text-xs" style={{ color: 'var(--graphite)' }}>
              Verified DELSU Psychometric Results
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRetake}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer hover:border-[var(--blue)] hover:text-[var(--blue)]"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--graphite)' }}
            title="Retake diagnostic"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retake</span>
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My PathWise Career Match',
                  text: `I matched ${topMatch?.score}% with ${topMatch?.title} on PathWise!`,
                  url: window.location.href
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                addNotification('Results link copied to clipboard!', 'success');
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all shadow-sm"
            style={{ backgroundColor: 'var(--blue)' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ── Compact Native Hero Card ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 sm:p-5 border relative overflow-hidden shadow-sm"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Subtle decorative background accent */}
        <div
          className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full blur-2xl opacity-15 pointer-events-none"
          style={{ backgroundColor: 'var(--blue)' }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center sm:items-start gap-3.5 text-center sm:text-left">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border"
              style={{ backgroundColor: 'var(--lavender)', borderColor: 'var(--border)' }}
            >
              <TopIcon className="w-7 h-7" style={{ color: 'var(--blue)' }} />
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ★ #1 Primary Recommendation
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black leading-tight" style={{ color: 'var(--ink)' }}>
                {topMatch?.title}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--graphite)' }}>
                Field: <span className="font-semibold" style={{ color: 'var(--ink)' }}>{topMatch?.field}</span> • Average Demand: <span className="font-semibold text-emerald-600">{topMatch?.demand}</span>
              </p>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-row sm:flex-col items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-2xl bg-[var(--mist)] border border-[var(--border)]">
            <span className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--blue)' }}>
              {topMatch?.score}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--graphite)' }}>
              Match Index
            </span>
          </div>
        </div>

        {/* Holland Code Bar & Quick Description */}
        <div className="mt-4 pt-3.5 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: 'var(--graphite)' }}>Holland Code:</span>
            <CompactHollandBadge code={hollandCode} />
            <span className="text-xs hidden md:inline" style={{ color: 'var(--graphite)' }}>({hollandLabel})</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              to={`/career/${topMatch?.id}`}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              style={{ backgroundColor: 'var(--blue)' }}
            >
              <BookOpen className="w-3.5 h-3.5" /> View Roadmap
            </Link>
            <Link
              to={`/advisor?prompt=Explain%20why%20I%20matched%20with%20${encodeURIComponent(topMatch?.title)}%20and%20how%20my%20DELSU%20courses%20apply`}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5"
              style={{ backgroundColor: 'var(--lavender)', color: 'var(--blue)', borderColor: 'var(--border)' }}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Ask Advisor
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile Touch Segmented Tabs (Eliminates Endless Scroll) ─────── */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        {[
          { id: 'matches', label: 'Top Matches', icon: Award, count: 5 },
          { id: 'personality', label: 'RIASEC Profile', icon: Sparkles },
          { id: 'skills', label: 'Values & Skills', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'text-[var(--graphite)] hover:text-[var(--ink)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
              {tab.count && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--mist)] text-[var(--graphite)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: TOP 5 CAREER MATCHES ───────────────────────────────── */}
      {activeTab === 'matches' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold" style={{ color: 'var(--graphite)' }}>
              Ranked against 50 DELSU Career Profiles
            </p>
            <Link to="/explore" className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--blue)' }}>
              Browse All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {top5.map((c, i) => {
              const Icon = getCareerIcon(c.icon);
              const codes = c.holland_code || [];
              const isFirst = i === 0;

              return (
                <Link
                  to={`/career/${c.id}`}
                  key={c.id}
                  className="block rounded-2xl p-3.5 border transition-all hover:border-[var(--blue)] shadow-sm"
                  style={{ backgroundColor: 'var(--surface)', borderColor: isFirst ? 'var(--blue)' : 'var(--border)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isFirst ? 'var(--lavender)' : 'var(--mist)' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: isFirst ? 'var(--blue)' : 'var(--ink)' }} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="font-extrabold text-sm truncate" style={{ color: 'var(--ink)' }}>
                            {c.title}
                          </span>
                          {isFirst && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                              TOP
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--graphite)' }}>
                          <span>{c.field}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            {codes.slice(0, 2).map(k => (
                              <span
                                key={k}
                                className="text-[9px] font-extrabold px-1.5 py-0.2 rounded"
                                style={{
                                  backgroundColor: (RIASEC_META[k]?.color || '#20428B') + '18',
                                  color: RIASEC_META[k]?.color || '#20428B'
                                }}
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black" style={{ color: 'var(--blue)' }}>
                          {c.score}%
                        </div>
                        <div className="w-14 sm:w-20 bg-[var(--border)] rounded-full h-1.5 mt-1">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${c.score}%`,
                              backgroundColor: c.score >= 80 ? '#27AE60' : 'var(--blue)'
                            }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--ash)' }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              Explore Remaining 45 Career Roadmaps <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: RIASEC & SCCT TRAIT PROFILE ────────────────────────── */}
      {activeTab === 'personality' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-2xl p-4 sm:p-5 border shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold" style={{ color: 'var(--ink)' }}>
                  Holland Hexagon & Traits
                </h3>
                <p className="text-xs" style={{ color: 'var(--graphite)' }}>
                  Visual breakdown across the 6 vocational dimensions
                </p>
              </div>

              <div className="flex items-center p-0.5 rounded-lg bg-[var(--mist)] border border-[var(--border)] text-[11px] font-bold">
                <button
                  onClick={() => setChartView('radar')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    chartView === 'radar' ? 'bg-white text-[var(--ink)] shadow-xs' : 'text-[var(--graphite)]'
                  }`}
                >
                  Radar
                </button>
                <button
                  onClick={() => setChartView('bars')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    chartView === 'bars' ? 'bg-white text-[var(--ink)] shadow-xs' : 'text-[var(--graphite)]'
                  }`}
                >
                  Scores
                </button>
              </div>
            </div>

            {chartView === 'radar' ? (
              <div className="h-60 sm:h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#dddcdc" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#555', fontSize: 10, fontWeight: 700 }} />
                    <Radar
                      dataKey="value"
                      stroke="#20428B"
                      fill="#20428B"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd', borderRadius: '8px', fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="space-y-2.5 py-1">
                {riasecBreakdown.map((dim, i) => (
                  <div key={dim.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white"
                          style={{ backgroundColor: dim.color }}
                        >
                          {dim.key}
                        </span>
                        <span className="font-bold" style={{ color: 'var(--ink)' }}>{dim.label}</span>
                        {i < 3 && (
                          <span className="text-[9px] font-bold px-1.5 rounded bg-blue-50 text-[var(--blue)]">
                            Top {i + 1}
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold" style={{ color: dim.color }}>{dim.score}%</span>
                    </div>
                    <div className="w-full bg-[var(--mist)] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6 Dimension Touch Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {riasecBreakdown.map((dim, i) => {
              const DimIcon = dim.icon;
              const isTop3 = i < 3;
              return (
                <div
                  key={dim.key}
                  className="p-3 rounded-xl border transition-all"
                  style={{
                    backgroundColor: isTop3 ? 'var(--surface)' : 'var(--mist)',
                    borderColor: isTop3 ? dim.color : 'var(--border)'
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: dim.color + '20' }}
                    >
                      <DimIcon className="w-3.5 h-3.5" style={{ color: dim.color }} />
                    </div>
                    <span className="text-xs font-black" style={{ color: dim.color }}>
                      {dim.score}%
                    </span>
                  </div>
                  <div className="text-xs font-extrabold truncate" style={{ color: 'var(--ink)' }}>
                    {dim.label}
                  </div>
                  <div className="text-[10px] line-clamp-1 mt-0.5" style={{ color: 'var(--graphite)' }}>
                    {dim.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SCCT Self-Efficacy Confidence */}
          {Object.keys(selfEfficacy).length > 0 && (
            <div className="rounded-2xl p-4 sm:p-5 border shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm sm:text-base font-extrabold mb-1" style={{ color: 'var(--ink)' }}>
                Field Self-Efficacy (SCCT)
              </h3>
              <p className="text-xs mb-3.5" style={{ color: 'var(--graphite)' }}>
                Your confidence levels across academic and industry disciplines
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(selfEfficacy)
                  .sort((a, b) => b[1] - a[1])
                  .map(([field, rating]) => (
                    <div key={field} className="p-2.5 rounded-xl bg-[var(--mist)] flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{field}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <div
                            key={star}
                            className={`w-2 h-2 rounded-full ${
                              star <= rating ? 'bg-[var(--blue)]' : 'bg-[var(--border)]'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-extrabold ml-1.5" style={{ color: 'var(--blue)' }}>
                          {rating}/5
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── TAB 3: VALUES & SKILL GAPS ────────────────────────────────── */}
      {activeTab === 'skills' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Outcome Expectations */}
          {outcomeData.length > 0 && (
            <div className="rounded-2xl p-4 sm:p-5 border shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm sm:text-base font-extrabold mb-1" style={{ color: 'var(--ink)' }}>
                Career Priorities & Outcomes
              </h3>
              <p className="text-xs mb-3" style={{ color: 'var(--graphite)' }}>
                Factors that matter most to your long-term vocational satisfaction
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outcomeData} barSize={16}>
                    <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fill: '#777', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {outcomeData.map((_, i) => (
                        <Cell key={i} fill={['#20428B', '#27AE60', '#9B59B6', '#F39C12', '#FF6B35', '#17A589'][i % 6]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Skill Gap Roadmap */}
          <div className="rounded-2xl p-4 sm:p-5 border shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm sm:text-base font-extrabold mb-1" style={{ color: 'var(--ink)' }}>
              Recommended Skill Acquisitions
            </h3>
            <p className="text-xs mb-3.5" style={{ color: 'var(--graphite)' }}>
              Competencies prioritized by employers for your top matches
            </p>

            <div className="space-y-3">
              {skillGap.map((sg, i) => {
                const CareerIcon = getCareerIcon(sg.icon);
                return (
                  <div key={i} className="p-3 rounded-xl border bg-[var(--mist)] border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[var(--lavender)]">
                        <CareerIcon className="w-3.5 h-3.5" style={{ color: 'var(--blue)' }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>
                        {sg.career}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {sg.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[var(--border)] font-medium text-[var(--ink)] flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="rounded-2xl p-4 border bg-[var(--lavender)] border-[var(--border)] flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold" style={{ color: 'var(--blue)' }}>
                Ready to take action?
              </h4>
              <p className="text-[11px]" style={{ color: 'var(--ink)' }}>
                Consult your personalized semester-by-semester course roadmap.
              </p>
            </div>
            <Link
              to={`/career/${topMatch?.id}`}
              className="px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm flex-shrink-0"
              style={{ backgroundColor: 'var(--blue)' }}
            >
              Go to Roadmap <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Sticky Mobile Quick Advisor Bar ────────────────────────────── */}
      <div className="rounded-2xl p-3 border bg-[var(--surface)] border-[var(--border)] flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 text-[var(--blue)] flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold truncate" style={{ color: 'var(--ink)' }}>
              Discuss Results with AI
            </p>
            <p className="text-[10px] truncate" style={{ color: 'var(--graphite)' }}>
              Llama 3.3 70B knows your Holland Code ({hollandCode})
            </p>
          </div>
        </div>

        <Link
          to={`/advisor?prompt=Based%20on%20my%20Holland%20Code%20${hollandCode}%20and%20top%20match%20${encodeURIComponent(topMatch?.title)},%20what%20should%20I%20focus%20on%20this%20semester?`}
          className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm flex-shrink-0 transition-all"
          style={{ backgroundColor: 'var(--blue)' }}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask</span>
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
