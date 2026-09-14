import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import {
  Search,
  Sparkles,
  Brain,
  BookmarkCheck,
  GraduationCap,
  Target,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Bookmark,
  CheckCircle2,
  Clock,
  Compass,
  Briefcase,
  Send,
  SlidersHorizontal,
  Award,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user, setUser, refreshUser } = useAuth();
  const { addNotification } = useNotification();
  const [savedCareers, setSavedCareers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [careersList, setCareersList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartTab, setChartTab] = useState('riasec'); // 'riasec' | 'skills'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [freshUser, careersRes, activityRes, jobsRes] = await Promise.all([
          refreshUser(),
          api.get('/data/careers'),
          api.get('/users/activity'),
          api.get('/jobs?limit=4').catch(() => ({ data: { jobs: [] } }))
        ]);

        const latestUser = freshUser || user;

        if (careersRes.data) {
          setCareersList(careersRes.data);
          const savedIds = latestUser?.savedCareers || [];
          const userSaved = careersRes.data.filter(c => savedIds.includes(c.id));
          const mapped = userSaved.map(c => ({
            id: c.id,
            title: c.title,
            field: c.field,
            salary: c.salary_entry || 'Competitive'
          }));
          setSavedCareers(mapped);
        }
        if (activityRes.data) {
          setActivityLog(activityRes.data);
        }
        if (jobsRes.data && jobsRes.data.jobs) {
          setJobsList(jobsRes.data.jobs);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    if (user) fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const displayName = user?.fullName?.split(' ')[0] || 'Student';
  const matricNo = user?.matricNo || 'Matric Number';
  const dept = user?.department || '';
  const rawLevel = user?.level || '100';
  const levelText = String(rawLevel).includes('L') ? rawLevel : `${rawLevel}L`;
  const cgpa = user?.cgpa ?? 0;

  const xp = user?.xp || 0;
  const level = Math.floor(xp / 100) + 1;

  const assessmentDone = user?.quizResults && user.quizResults.length > 0;
  const topMatch = assessmentDone ? user.quizResults[0] : null;
  const topMatchScore = topMatch ? `${topMatch.score}%` : '0%';
  const topCareerDetail = topMatch ? careersList.find(c => c.id === topMatch.id) : null;
  const careersSavedCount = user?.savedCareers?.length || savedCareers.length;

  const hollandCode = user?.hollandCode || null;
  const hollandLabel = user?.hollandLabel || null;

  // RIASEC Dimension Chart Data
  const riasecScores = user?.riasecScores || { R: 65, I: 85, A: 50, S: 70, E: 60, C: 45 };
  const riasecChartData = [
    { name: 'R', label: 'Realistic', score: riasecScores.R || 0, color: '#FF6B35', gradId: 'barGrad-R' },
    { name: 'I', label: 'Investigative', score: riasecScores.I || 0, color: '#20428B', gradId: 'barGrad-I' },
    { name: 'A', label: 'Artistic', score: riasecScores.A || 0, color: '#9B59B6', gradId: 'barGrad-A' },
    { name: 'S', label: 'Social', score: riasecScores.S || 0, color: '#27AE60', gradId: 'barGrad-S' },
    { name: 'E', label: 'Enterprising', score: riasecScores.E || 0, color: '#F39C12', gradId: 'barGrad-E' },
    { name: 'C', label: 'Conventional', score: riasecScores.C || 0, color: '#17A589', gradId: 'barGrad-C' },
  ];

  // Top Matches List
  const matchedCareers = (user?.quizResults || []).slice(0, 3).map(match => {
    const detail = careersList.find(c => c.id === match.id);
    return {
      id: match.id,
      title: detail?.title || match.id,
      field: detail?.field || 'General',
      score: match.score,
      salary: detail?.salary_entry || '₦3.5M – ₦7M/yr'
    };
  });

  return (
    <div className="w-full space-y-4 pb-4 select-none lg:max-w-none lg:space-y-5">
      <style>{`
        :root {
          --canvas: #f5f3f3;
          --surface: #ffffff;
          --border: #dddcdc;
          --blue: #20428b;
          --azure: #2a52a8;
          --lavender: #eef2f9;
          --ink: #111111;
          --graphite: #707070;
          --ash: #adadad;
          --fog: #ededed;
          --mist: #f2f2f2;
        }
        .heading-font { font-family: 'Nunito', sans-serif; }
        .body-font { font-family: 'Open Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── TOP APP HEADER ── */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[var(--blue)] text-white flex items-center justify-center font-black text-base heading-font shadow-sm flex-shrink-0 lg:hidden">
            {displayName.charAt(0)}
          </div>
          <div>
            <h1 className="text-base sm:text-lg lg:text-2xl font-black text-[var(--ink)] heading-font leading-tight">
              Hello, {displayName}! 👋
            </h1>
            <p className="text-[11px] lg:text-xs text-[var(--graphite)] font-medium">
              {dept ? `${dept} · ` : ''}{levelText} · DELSU
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full shadow-sm">
            <Award className="w-3.5 h-3.5 text-[var(--blue)]" />
            <span className="text-xs font-extrabold text-[var(--ink)] heading-font">
              Lvl {level}
            </span>
          </div>
          {/* Search: only show on desktop in the top bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers, skills..."
              className="bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] placeholder-[var(--ash)] text-xs rounded-2xl pl-4 pr-10 py-2 focus:outline-none focus:border-[var(--blue)] transition-all shadow-sm w-56"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--blue)] hover:bg-[var(--lavender)] flex items-center justify-center transition-all"
            >
              <Search className="w-3 h-3" />
            </button>
          </form>
          <Link
            to="/activity"
            className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--graphite)] hover:text-[var(--blue)] shadow-sm"
          >
            <Bell className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* â”€â”€ SEARCH BAR (mobile only) â”€â”€ */}
      <form onSubmit={handleSearchSubmit} className="relative w-full lg:hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search careers, electives, skills..."
          className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] placeholder-[var(--ash)] text-xs sm:text-sm rounded-2xl pl-4 pr-11 py-2.5 sm:py-3 focus:outline-none focus:border-[var(--blue)] transition-all shadow-sm"
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--blue)] hover:bg-[var(--lavender)] flex items-center justify-center transition-all"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* â”€â”€ STAT CARDS â€” 2Ã—2 mobile, 4Ã—1 desktop â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
        {/* Card 1: Top Career Match */}
        <Link to={assessmentDone ? "/results" : "/quiz"}>
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 sm:p-3.5 lg:p-4 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-24 sm:h-28 lg:h-32"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-2.5 h-2.5" />
                {assessmentDone ? 'Match' : 'Pending'}
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--ink)] heading-font tracking-tight">
                {topMatchScore}
              </div>
              <p className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-[var(--graphite)] truncate">
                {topCareerDetail ? topCareerDetail.title : 'Top Career Fit'}
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 2: Holland Code */}
        <Link to={assessmentDone ? "/results" : "/quiz"}>
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 sm:p-3.5 lg:p-4 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-24 sm:h-28 lg:h-32"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-[#F4ECF7] text-[#9B59B6] flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">
                {hollandCode ? 'RIASEC' : '5 mins'}
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--ink)] heading-font tracking-tight">
                {hollandCode || 'Pending'}
              </div>
              <p className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-[var(--graphite)] truncate">
                {hollandLabel ? hollandLabel.split(' Â· ')[0] : 'Take Assessment'}
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 3: Saved Careers */}
        <Link to="/saved">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 sm:p-3.5 lg:p-4 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-24 sm:h-28 lg:h-32"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-[#E8F8F5] text-[#17A589] flex items-center justify-center flex-shrink-0">
                <BookmarkCheck className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">
                Active
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--ink)] heading-font tracking-tight">
                {careersSavedCount}
              </div>
              <p className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-[var(--graphite)] truncate">
                Saved Careers
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 4: Academic Standing */}
        <Link to="/profile">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 sm:p-3.5 lg:p-4 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-24 sm:h-28 lg:h-32"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-[#FEF9E7] text-[#F39C12] flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">
                CGPA: {cgpa > 0 ? cgpa.toFixed(2) : '--'}
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--ink)] heading-font tracking-tight">
                {levelText}
              </div>
              <p className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-[var(--graphite)] truncate">
                Academic Standing
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* ── ASSESSMENT CALLOUT (Clean Card Style) ── */}
      {!assessmentDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold heading-font text-[var(--ink)] leading-tight">
                Career Assessment Pending
              </h3>
              <p className="text-xs text-[var(--graphite)] leading-relaxed mt-0.5">
                Answer 18 quick questions to unlock your personalized DELSU career matches and course roadmaps.
              </p>
            </div>
          </div>

          <Link
            to="/quiz"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--blue)] text-white font-bold text-xs hover:bg-[var(--azure)] active:scale-95 transition-all shadow-sm flex-shrink-0"
          >
            <span>Take Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* â”€â”€ MAIN CONTENT GRID: stacked on mobile, 2-col on desktop â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:gap-6 lg:items-start">

        {/* LEFT COLUMN: Chart + Top Recommendations */}
        <div className="space-y-4">

          {/* â”€â”€ CAREER FIT ANALYTICS CHART â”€â”€ */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--ink)] heading-font">
                  {chartTab === 'riasec' ? 'Personality Trait Fit' : 'Top Career Alignment'}
                </h2>
                <p className="text-[10px] sm:text-xs text-[var(--graphite)]">
                  {chartTab === 'riasec' ? 'RIASEC dimensional distribution' : 'Top predicted options'}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center p-0.5 bg-[var(--mist)] rounded-full border border-[var(--border)]">
                <button
                  onClick={() => setChartTab('riasec')}
                  className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all ${
                    chartTab === 'riasec'
                      ? 'bg-[var(--surface)] text-[var(--blue)] shadow-sm'
                      : 'text-[var(--graphite)] hover:text-[var(--ink)]'
                  }`}
                >
                  RIASEC
                </button>
                <button
                  onClick={() => setChartTab('skills')}
                  className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all ${
                    chartTab === 'skills'
                      ? 'bg-[var(--surface)] text-[var(--blue)] shadow-sm'
                      : 'text-[var(--graphite)] hover:text-[var(--ink)]'
                  }`}
                >
                  Matches
                </button>
              </div>
            </div>

            {/* Chart View */}
            <div className="h-44 sm:h-52 lg:h-60 w-full">
              {chartTab === 'riasec' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riasecChartData} margin={{ top: 12, right: 8, left: -22, bottom: 4 }}>
                    <defs>
                      <linearGradient id="barGrad-R" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF7A45" stopOpacity={1} />
                        <stop offset="100%" stopColor="#EA3815" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="barGrad-I" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5D7DF8" stopOpacity={1} />
                        <stop offset="100%" stopColor="#20428B" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="barGrad-A" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C084FC" stopOpacity={1} />
                        <stop offset="100%" stopColor="#7E22CE" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="barGrad-S" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="barGrad-E" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FBBF24" stopOpacity={1} />
                        <stop offset="100%" stopColor="#D97706" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="barGrad-C" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
                        <stop offset="100%" stopColor="#0284C7" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'var(--ink)', fontWeight: 800 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fontSize: 9, fill: 'var(--ash)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(32, 66, 139, 0.04)', radius: 10 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl shadow-xl text-xs backdrop-blur-md min-w-[145px]">
                              <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[var(--border)]">
                                <span className="font-extrabold text-[var(--ink)] heading-font flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                  {data.label}
                                </span>
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-[var(--mist)] text-[var(--graphite)]">
                                  {data.name}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between pt-0.5">
                                <span className="text-[11px] text-[var(--graphite)] font-medium">Affinity</span>
                                <span className="text-base font-black text-[var(--blue)] heading-font">{data.score}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[var(--mist)] mt-1.5 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${data.score}%`, backgroundColor: data.color }}
                                />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="score"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={36}
                      background={{ fill: 'rgba(0, 0, 0, 0.035)', radius: [8, 8, 0, 0] }}
                      isAnimationActive={true}
                      animationDuration={1300}
                      animationEasing="ease-out"
                    >
                      {riasecChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#${entry.gradId})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-2 pt-1">
                  {matchedCareers.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[var(--graphite)]">
                      Complete the assessment to view career alignment.
                    </div>
                  ) : (
                    matchedCareers.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--mist)]">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[var(--ink)] truncate">{item.title}</p>
                          <p className="text-[10px] text-[var(--graphite)]">{item.field} · {item.salary}</p>
                        </div>
                        <span className="text-xs font-black text-[var(--blue)] heading-font ml-3">
                          {item.score}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RIASEC Dimension Pill Summary Strip */}
            {chartTab === 'riasec' && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3.5 border-t border-[var(--border)] mt-3">
                {riasecChartData.map((d) => {
                  const isTopHolland = hollandCode && hollandCode.includes(d.name);
                  return (
                    <div
                      key={d.name}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isTopHolland
                          ? 'bg-[var(--lavender)] border-[var(--blue)]/30 shadow-2xs'
                          : 'bg-[var(--mist)] border-transparent hover:border-[var(--border)]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-[10px] font-extrabold text-[var(--ink)] heading-font truncate">
                          {d.name} · {d.label.slice(0, 4)}
                        </span>
                      </div>
                      <span className={`text-xs font-black heading-font ${isTopHolland ? 'text-[var(--blue)]' : 'text-[var(--graphite)]'}`}>
                        {d.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* â”€â”€ TOP RECOMMENDATIONS â”€â”€ */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--ink)] heading-font">
                  Top Recommendations
                </h2>
                <p className="text-[10px] sm:text-xs text-[var(--graphite)]">
                  Tailored to your DELSU profile
                </p>
              </div>
              <Link
                to="/explore"
                className="text-xs font-bold text-[var(--blue)] hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {matchedCareers.length === 0 ? (
              <div className="text-center py-5">
                <Compass className="w-7 h-7 text-[var(--ash)] mx-auto mb-1.5 opacity-60" />
                <p className="text-xs text-[var(--graphite)] mb-2.5">No career matches calculated yet.</p>
                <Link
                  to="/quiz"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--blue)] text-white text-xs font-bold shadow-sm"
                >
                  <span>Take 5-Min Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              /* Mobile: horizontal swipe / Desktop: vertical list */
              <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none no-scrollbar -mx-1 px-1 pb-1 lg:mx-0 lg:px-0 lg:pb-0">
                {matchedCareers.map((c) => (
                  <Link
                    key={c.id}
                    to={`/career/${c.id}`}
                    className="w-[220px] lg:w-full snap-start bg-[var(--mist)] border border-[var(--border)] rounded-2xl p-3 hover:border-[var(--blue)] active:scale-[0.98] lg:active:scale-100 transition-all flex flex-col lg:flex-row lg:items-center justify-between flex-shrink-0 lg:flex-shrink group"
                  >
                    <div className="lg:min-w-0 lg:flex-1">
                      <div className="flex items-center justify-between mb-1.5 lg:mb-0.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[var(--lavender)] text-[var(--blue)] heading-font">
                          {c.score}% Match
                        </span>
                        <span className="text-[9px] text-[var(--graphite)] truncate max-w-[85px] lg:hidden">
                          {c.field}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[var(--ink)] truncate group-hover:text-[var(--blue)] transition-colors heading-font">
                        {c.title}
                      </h4>
                      <p className="text-[10px] text-[var(--graphite)] mt-0.5 truncate hidden lg:block">
                        {c.field} Â· {c.salary}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[var(--border)] lg:border-0 lg:mt-0 lg:pt-0 flex items-center justify-between lg:justify-end text-[10px] font-bold text-[var(--blue)] lg:pl-3">
                      <span className="lg:hidden">View Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (desktop only) */}
        <div className="space-y-4 hidden lg:flex lg:flex-col">

          {/* â”€â”€ QUICK AI ADVISOR â”€â”€ */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--ink)] heading-font">Ask AI Career Advisor</h3>
                <p className="text-[10px] text-[var(--graphite)]">DELSU-specific career guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Which electives fit my RIASEC?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate('/advisor', { state: { initialQuery: e.target.value.trim() } });
                  }
                }}
                id="advisor-quick-input-desktop"
                className="flex-1 bg-[var(--mist)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] placeholder-[var(--ash)] focus:outline-none focus:border-[var(--blue)] transition-all"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('advisor-quick-input-desktop');
                  if (input && input.value.trim()) {
                    navigate('/advisor', { state: { initialQuery: input.value.trim() } });
                  } else {
                    navigate('/advisor');
                  }
                }}
                className="w-8 h-8 rounded-xl bg-[var(--blue)] text-white flex items-center justify-center hover:bg-[var(--azure)] active:scale-95 transition-all flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick prompt chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {['SIWES placements', 'Best 300L electives', 'CGPA strategy'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => navigate('/advisor', { state: { initialQuery: chip } })}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--mist)] border border-[var(--border)] text-[var(--graphite)] hover:border-[var(--blue)] hover:text-[var(--blue)] transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* â”€â”€ QUICK ACTIONS â”€â”€ */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--ink)] heading-font mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Career Assessment', to: '/quiz', icon: Target, color: 'bg-[var(--lavender)] text-[var(--blue)]' },
                { label: 'Explore Careers', to: '/explore', icon: Compass, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Results Analysis', to: '/results-analysis', icon: SlidersHorizontal, color: 'bg-amber-50 text-amber-600' },
                { label: 'My Profile', to: '/profile', icon: Briefcase, color: 'bg-[#F4ECF7] text-[#9B59B6]' },
              ].map(({ label, to, icon: Icon, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[var(--mist)] hover:bg-[var(--fog)] border border-[var(--border)] hover:border-[var(--blue)] transition-all group text-center"
                >
                  <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* â”€â”€ RECENT ACTIVITY (desktop sidebar panel) â”€â”€ */}
          {activityLog.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[var(--ink)] heading-font">Recent Activity</h3>
                <Link to="/activity" className="text-[10px] font-bold text-[var(--blue)] hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {activityLog.slice(0, 4).map((log, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-[var(--lavender)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-3 h-3 text-[var(--blue)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--ink)] truncate capitalize">
                        {(log.action || '').replace(/_/g, ' ')}
                      </p>
                      <p className="text-[10px] text-[var(--graphite)]">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ QUICK CONSULT (mobile only) â”€â”€ */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-[var(--ink)] heading-font">
              Ask AI Career Advisor
            </h3>
            <p className="text-[10px] text-[var(--graphite)] truncate">
              Ask about 300L electives, SIWES, or careers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. Which electives fit my RIASEC code?"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate('/advisor', { state: { initialQuery: e.target.value.trim() } });
              }
            }}
            id="advisor-quick-input"
            className="flex-1 bg-[var(--mist)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] placeholder-[var(--ash)] focus:outline-none focus:border-[var(--blue)] transition-all"
          />
          <button
            onClick={() => {
              const input = document.getElementById('advisor-quick-input');
              if (input && input.value.trim()) {
                navigate('/advisor', { state: { initialQuery: input.value.trim() } });
              } else {
                navigate('/advisor');
              }
            }}
            className="w-8 h-8 rounded-xl bg-[var(--blue)] text-white flex items-center justify-center hover:bg-[var(--azure)] active:scale-95 transition-all flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
