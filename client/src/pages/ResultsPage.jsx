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
  I: { label: 'Investigative', color: '#0056FF', icon: Search,       desc: 'Analytical, research-driven, curious' },
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

const Confetti = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 28 }).map((_, i) => (
      <motion.div key={i}
        className="absolute w-2 h-3 rounded-sm"
        style={{
          left: `${Math.random() * 100}%`, top: '-10px',
          backgroundColor: ['#0056FF','#9B59B6','#27AE60','#F39C12','#FF6B35'][i % 5],
          rotate: Math.random() * 360,
        }}
        animate={{ y: 320, opacity: [1, 1, 0], rotate: Math.random() * 720 }}
        transition={{ duration: 2.2 + Math.random() * 2, delay: Math.random() * 1.5, repeat: Infinity, repeatDelay: 3 }}
      />
    ))}
  </div>
);

// ── Holland Code Badge ────────────────────────────────────────────────
const HollandBadge = ({ code }) => {
  if (!code) return null;
  const letters = code.split('');
  return (
    <div className="flex justify-center gap-2 mb-3">
      {letters.map((letter, i) => {
        const meta = RIASEC_META[letter] || { color: '#0056FF', label: letter };
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-extrabold text-white"
              style={{
                background: `linear-gradient(135deg, ${meta.color}, ${meta.color}99)`,
                boxShadow: `0 0 24px ${meta.color}55`
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
    <div className="min-h-screen bg-pw-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-pw-blue" />
        <p className="text-pw-gray text-xs">Running tri-theory analysis…</p>
        <div className="flex gap-2 mt-1">
          {['RIASEC','SCCT','Constructivist'].map((t, i) => (
            <span key={t} className="text-[10px] px-2 py-1 rounded-full font-bold animate-pulse"
              style={{ background: ['#0056FF22','#27AE6022','#9B59B622'][i], color: ['#0056FF','#27AE60','#9B59B6'][i] }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (!results) return (
    <div className="min-h-screen bg-pw-black flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-pw-white text-xl font-bold mb-2">No Results Yet</p>
        <p className="text-pw-gray text-sm mb-6">Complete the career assessment to generate your RIASEC profile and career matches.</p>
        <Link to="/quiz" className="px-6 py-3 rounded-xl bg-pw-blue text-white font-bold hover:bg-pw-azure transition-all">
          Take Assessment →
        </Link>
      </div>
    </div>
  );

  const { topMatch, top5, hollandCode, hollandLabel, radarData, riasecBreakdown, outcomeData, selfEfficacy, skillGap } = results;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-8">

      {/* ── Hero Banner: Holland Code ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative bg-pw-surface border border-pw-white/10 rounded-2xl p-8 text-center overflow-hidden"
      >
        <Confetti />
        <div className="relative z-10">
          {/* Career type preview pill */}
          <p className="text-pw-gray text-xs mb-5 uppercase tracking-widest font-bold">Your Career Personality</p>

          <HollandBadge code={hollandCode} />
          <p className="text-pw-gray text-xs mb-5">{hollandLabel}</p>

          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-pw-gray text-sm">Top Career Match:</p>
            <span className="text-pw-white font-bold">{topMatch?.title}</span>
          </div>
          <div className="text-6xl md:text-7xl font-extrabold text-pw-blue mb-6">{topMatch?.score}%</div>

          <div className="flex justify-center gap-4">
            <Link to={`/career/${topMatch?.id}`}
              className="px-6 py-3 rounded-xl bg-pw-blue text-white font-bold hover:bg-pw-azure transition-all shadow-[0_0_14px_rgba(0,86,255,0.3)]">
              View Roadmap
            </Link>
            <Link to="/explore"
              className="px-6 py-3 rounded-xl bg-pw-white/8 text-pw-white font-bold hover:bg-pw-white/12 transition-all border border-pw-white/10">
              Explore Careers
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Two-Column Row 1 ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top 5 Matches */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
          <h2 className="text-pw-white text-lg font-bold mb-5">Your Top 5 Matches</h2>
          <div className="space-y-3">
            {top5.map((c, i) => {
              const Icon = getCareerIcon(c.icon);
              const codes = c.holland_code || [];
              return (
                <Link to={`/career/${c.id}`} key={i}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-pw-white/5 transition-all">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-pw-blue/10 border border-pw-blue/20 flex-shrink-0">
                      <Icon className="w-4 h-4 text-pw-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-pw-white font-semibold text-sm">{c.title}</span>
                        <div className="flex gap-1">
                          {codes.slice(0, 2).map(k => (
                            <span key={k} className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md"
                              style={{ background: (RIASEC_META[k]?.color || '#0056FF') + '22', color: RIASEC_META[k]?.color || '#0056FF' }}>
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="w-full bg-pw-white/8 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-pw-blue transition-all" style={{ width: `${c.score}%` }} />
                      </div>
                    </div>
                    <span className="text-pw-white font-bold text-sm ml-1 flex-shrink-0">{c.score}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* RIASEC Hexagon Radar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
          <h2 className="text-pw-white text-lg font-bold mb-1">Personality Profile</h2>
          <p className="text-pw-gray text-xs mb-4">How your traits map across six core career dimensions</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B9CC8', fontSize: 11 }} />
                <Radar dataKey="value" stroke="#0056FF" fill="#0056FF" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ backgroundColor: '#080818', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── Trait Breakdown ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
        <h2 className="text-pw-white text-lg font-bold mb-1">Trait Breakdown</h2>
        <p className="text-pw-gray text-xs mb-5">How you scored across six personality dimensions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {riasecBreakdown.map((dim, i) => {
            const Icon = dim.icon;
            const isTop3 = i < 3;
            return (
              <div key={dim.key} className="p-4 rounded-xl border transition-all"
                style={{
                  borderColor: isTop3 ? dim.color + '44' : 'rgba(255,255,255,0.06)',
                  background: isTop3 ? dim.color + '0A' : 'rgba(255,255,255,0.02)'
                }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: dim.color + '22' }}>
                    <Icon className="w-4 h-4" style={{ color: dim.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-pw-white text-sm font-bold">{dim.label}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded" style={{ background: dim.color + '33', color: dim.color }}>{dim.key}</span>
                      {isTop3 && <span className="text-[9px] font-bold text-pw-blue">★ Top {i+1}</span>}
                    </div>
                    <p className="text-pw-gray text-[10px]">{dim.desc}</p>
                  </div>
                </div>
                <div className="w-full bg-pw-white/8 rounded-full h-2 mb-1">
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
            className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white text-lg font-bold mb-1">What Matters to You</h2>
            <p className="text-xs mb-4 text-pw-gray">Career priorities you ranked highest</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeData} barSize={18}>
                  <XAxis dataKey="name" tick={{ fill: '#8B9CC8', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#8B9CC8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#080818', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {outcomeData.map((_, i) => (
                      <Cell key={i} fill={['#0056FF','#27AE60','#9B59B6','#F39C12','#FF6B35','#17A589'][i % 6]} />
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
            className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white text-lg font-bold mb-1">Field Confidence</h2>
            <p className="text-xs mb-5 text-pw-gray">How confident you feel in each career area</p>
            <div className="space-y-3">
              {Object.entries(selfEfficacy)
                .sort((a, b) => b[1] - a[1])
                .map(([field, rating], i) => (
                  <div key={field}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-pw-gray text-xs">{field}</span>
                      <span className="text-xs font-bold text-pw-white">{rating}/5</span>
                    </div>
                    <div className="w-full bg-pw-white/8 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(rating / 5) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }}
                        className="h-2 rounded-full"
                        style={{ background: ['#27AE60','#0056FF','#F39C12','#9B59B6','#FF6B35','#17A589','#E74C3C'][i % 7] }}
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
        className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
        <h2 className="text-pw-white text-lg font-bold mb-1">Skill Development Roadmap</h2>
        <p className="text-pw-gray text-sm mb-5">Key skills to develop for your top career matches</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skillGap.map((sg, i) => {
            const Icon = getCareerIcon(sg.icon);
            return (
              <div key={i} className="bg-pw-black/30 border border-pw-white/6 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-pw-blue/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-pw-blue" />
                  </div>
                  <span className="text-pw-white font-semibold text-sm">{sg.career}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sg.skills.map(skill => (
                    <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
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
