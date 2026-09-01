import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip, BarChart, Bar, XAxis, YAxis, Cell
} from 'recharts';
import * as LucideIcons from 'lucide-react';
import { Laptop, Loader2, Settings, Search, Palette, Users, TrendingUp, ClipboardList } from 'lucide-react';

// ── RIASEC dimension config ───────────────────────────────────────────
const RIASEC_META = {
  R: { label: 'Realistic',     color: '#FF6B35', icon: Settings,     desc: 'Practical, hands-on, mechanical' },
  I: { label: 'Investigative', color: '#1944f1', icon: Search,       desc: 'Analytical, research-driven, curious' },
  A: { label: 'Artistic',      color: '#9B59B6', icon: Palette,      desc: 'Creative, expressive, imaginative' },
  S: { label: 'Social',        color: '#27AE60', icon: Users,        desc: 'Helping, teaching, nurturing' },
  E: { label: 'Enterprising',  color: '#F39C12', icon: TrendingUp,   desc: 'Leadership, persuasive, ambitious' },
  C: { label: 'Conventional',  color: '#17A589', icon: ClipboardList,desc: 'Orderly, detail-oriented, structured' },
};

const OUTCOME_LABELS = {
  income: 'Financial Reward', impact: 'Social Impact',
  creativity: 'Creativity', stability: 'Job Security',
  status: 'Prestige', autonomy: 'Autonomy'
};

const getCareerIcon = (iconName) => {
  if (!iconName) return Laptop;
  return LucideIcons[iconName] || Laptop;
};

// ── Holland Code Badge ────────────────────────────────────────────────
const HollandBadge = ({ code }) => {
  if (!code) return null;
  const letters = code.split('');
  return (
    <div className="flex justify-center gap-2 mb-3">
      {letters.map((letter, i) => {
        const meta = RIASEC_META[letter] || { color: '#1944f1', label: letter };
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-extrabold text-white"
              style={{
                background: meta.color,
              }}
            >
              {letter}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ResultsPage = () => {
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(true);

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
          const c = careers.find(c => c.id === m.careerId);
          return { id: m.careerId, title: c?.title || m.careerId, score: m.score, field: c?.field || 'STEM', icon: c?.icon || 'Briefcase', holland_code: c?.holland_code || [] };
        });

        // Build RIASEC radar data (6-axis hexagon)
        const radarData = riasecScores
          ? Object.entries(riasecScores).map(([k, v]) => ({ subject: RIASEC_META[k]?.label || k, value: v, fullMark: 100 }))
          : [
            { subject: 'Realistic', value: 60, fullMark: 100 },
            { subject: 'Investigative', value: 75, fullMark: 100 },
            { subject: 'Artistic', value: 40, fullMark: 100 },
            { subject: 'Social', value: 55, fullMark: 100 },
            { subject: 'Enterprising', value: 65, fullMark: 100 },
            { subject: 'Conventional', value: 70, fullMark: 100 },
          ];

        // Build RIASEC dimension breakdown
        const riasecBreakdown = riasecScores
          ? Object.entries(riasecScores)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => ({ key: k, ...RIASEC_META[k], score: v }))
          : [];

        // SCCT outcome bar data
        const outcomeData = outcomeExpectations
          ? Object.entries(outcomeExpectations).map(([k, v]) => ({ name: OUTCOME_LABELS[k] || k, value: parseInt(v) || 0 }))
          : [];

        // Skill gap
        const skillGap = mappedMatches.slice(0, 3).map(m => {
          const c = careers.find(c => c.id === m.id);
          return { career: m.title, skills: c?.core_skills?.slice(0, 3) || ['Core Skills'], icon: m.icon };
        });

        setResults({
          topMatch:       mappedMatches[0],
          top5:           mappedMatches.slice(0, 5),
          hollandCode:    hollandCode || 'ISC',
          hollandLabel:   hollandLabel || 'Investigative · Social · Conventional',
          radarData,
          riasecBreakdown,
          outcomeData,
          selfEfficacy:   selfEfficacy || {},
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--canvas)', fontFamily: "'Open Sans', sans-serif" }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--blue)' }} />
        <p className="text-xs" style={{ color: 'var(--graphite)' }}>Running tri-theory analysis…</p>
        <div className="flex gap-2 mt-1">
          {['RIASEC','SCCT','Constructivist'].map((t, i) => (
            <span key={t} className="text-[10px] px-2 py-1 rounded-full font-bold animate-pulse"
              style={{ background: ['#1944f122','#27AE6022','#9B59B622'][i], color: ['#1944f1','#27AE60','#9B59B6'][i] }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (!results) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--canvas)', fontFamily: "'Open Sans', sans-serif" }}>
      <div className="text-center max-w-sm">
        <p className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>No Results Yet</p>
        <p className="text-sm mb-6" style={{ color: 'var(--graphite)' }}>Complete the career assessment to generate your RIASEC profile and career matches.</p>
        <Link to="/quiz" className="px-6 py-3 rounded-xl text-white font-bold transition-all inline-block" style={{ backgroundColor: 'var(--blue)' }}>
          Take Assessment →
        </Link>
      </div>
    </div>
  );

  const { topMatch, top5, hollandCode, hollandLabel, radarData, riasecBreakdown, outcomeData, selfEfficacy, skillGap } = results;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-8" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <style>{`
        h1, h2, h3, h4, h5, h6 { font-family: 'Nunito', sans-serif; }
        .btn-hover:hover { filter: brightness(0.95); }
      `}</style>

      {/* ── Hero Banner: Holland Code ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-8 text-center overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="relative z-10">
          {/* Career type preview pill */}
          <p className="text-xs mb-5 uppercase tracking-widest font-bold" style={{ color: 'var(--graphite)' }}>Your Career Personality</p>

          <HollandBadge code={hollandCode} />
          <p className="text-xs mb-5" style={{ color: 'var(--graphite)' }}>{hollandLabel}</p>

          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-sm" style={{ color: 'var(--graphite)' }}>Top Career Match:</p>
            <span className="font-bold" style={{ color: 'var(--ink)' }}>{topMatch?.title}</span>
          </div>
          <div className="text-6xl md:text-7xl font-extrabold mb-6" style={{ color: 'var(--blue)' }}>{topMatch?.score}%</div>

          <div className="flex justify-center gap-4">
            <Link to={`/career/${topMatch?.id}`}
              className="btn-hover px-6 py-3 rounded-xl text-white font-bold transition-all"
              style={{ backgroundColor: 'var(--blue)' }}>
              View Roadmap
            </Link>
            <Link to="/explore"
              className="btn-hover px-6 py-3 rounded-xl font-bold transition-all border"
              style={{ backgroundColor: 'var(--fog)', color: 'var(--ink)', borderColor: 'var(--border)' }}>
              Explore Careers
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Two-Column Row 1 ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top 5 Matches */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--ink)' }}>Your Top 5 Matches</h2>
          <div className="space-y-3">
            {top5.map((c, i) => {
              const Icon = getCareerIcon(c.icon);
              const codes = c.holland_code || [];
              return (
                <Link to={`/career/${c.id}`} key={i}>
                  <div className="flex items-center gap-3 p-3 rounded-xl transition-all" style={{ backgroundColor: 'var(--mist)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--lavender)' }}>
                      <Icon className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{c.title}</span>
                        <div className="flex gap-1">
                          {codes.slice(0, 2).map(k => (
                            <span key={k} className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md"
                              style={{ background: (RIASEC_META[k]?.color || '#1944f1') + '22', color: RIASEC_META[k]?.color || '#1944f1' }}>
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--border)' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${c.score}%`, backgroundColor: 'var(--blue)' }} />
                      </div>
                    </div>
                    <span className="font-bold text-sm ml-1 flex-shrink-0" style={{ color: 'var(--ink)' }}>{c.score}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* RIASEC Hexagon Radar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>Personality Profile</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--graphite)' }}>How your traits map across six core career dimensions</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#dddcdc" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#707070', fontSize: 11 }} />
                <Radar dataKey="value" stroke="#1944f1" fill="#1944f1" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dddcdc', borderRadius: '8px', color: '#111' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── Trait Breakdown ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>Trait Breakdown</h2>
        <p className="text-xs mb-5" style={{ color: 'var(--graphite)' }}>How you scored across six personality dimensions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {riasecBreakdown.map((dim, i) => {
            const Icon = dim.icon;
            const isTop3 = i < 3;
            return (
              <div key={dim.key} className="p-4 rounded-xl border transition-all"
                style={{
                  borderColor: isTop3 ? dim.color : 'var(--border)',
                  background: isTop3 ? dim.color + '10' : 'var(--mist)'
                }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: dim.color + '22' }}>
                    <Icon className="w-4 h-4" style={{ color: dim.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{dim.label}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded" style={{ background: dim.color + '33', color: dim.color }}>{dim.key}</span>
                      {isTop3 && <span className="text-[9px] font-bold" style={{ color: 'var(--blue)' }}>★ Top {i+1}</span>}
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--graphite)' }}>{dim.desc}</p>
                  </div>
                </div>
                <div className="w-full rounded-full h-2 mb-1" style={{ backgroundColor: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${dim.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                    className="h-2 rounded-full"
                    style={{ background: dim.color }}
                  />
                </div>
                <p className="text-right text-xs font-bold" style={{ color: dim.color }}>{dim.score}%</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Two-Column Row 2: SCCT panels ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SCCT Outcome Expectations */}
        {outcomeData.length > 0 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>What Matters to You</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--graphite)' }}>Career priorities you ranked highest</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeData} barSize={18}>
                  <XAxis dataKey="name" tick={{ fill: '#707070', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#707070', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dddcdc', borderRadius: '8px', color: '#111' }} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {outcomeData.map((_, i) => (
                      <Cell key={i} fill={['#1944f1','#27AE60','#9B59B6','#F39C12','#FF6B35','#17A589'][i % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* SCCT Self-Efficacy */}
        {Object.keys(selfEfficacy).length > 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>Field Confidence</h2>
            <p className="text-xs mb-5" style={{ color: 'var(--graphite)' }}>How confident you feel in each career area</p>
            <div className="space-y-3">
              {Object.entries(selfEfficacy)
                .sort((a, b) => b[1] - a[1])
                .map(([field, rating], i) => (
                  <div key={field}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs" style={{ color: 'var(--graphite)' }}>{field}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{rating}/5</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border)' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(rating / 5) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }}
                        className="h-2 rounded-full"
                        style={{ background: ['#27AE60','#1944f1','#F39C12','#9B59B6','#FF6B35','#17A589','#E74C3C'][i % 7] }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Skill Gap ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>Skill Development Roadmap</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--graphite)' }}>Key skills to develop for your top career matches</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skillGap.map((sg, i) => {
            const Icon = getCareerIcon(sg.icon);
            return (
              <div key={i} className="border rounded-xl p-4" style={{ backgroundColor: 'var(--mist)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--lavender)' }}>
                    <Icon className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{sg.career}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sg.skills.map(skill => (
                    <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
};

export default ResultsPage;
