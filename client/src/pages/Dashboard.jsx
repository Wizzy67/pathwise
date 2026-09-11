import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
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
  const dept = user?.department || 'Department';
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
    { name: 'R', label: 'Realistic', score: riasecScores.R || 0, color: '#FF6B35' },
    { name: 'I', label: 'Investigative', score: riasecScores.I || 0, color: '#1944f1' },
    { name: 'A', label: 'Artistic', score: riasecScores.A || 0, color: '#9B59B6' },
    { name: 'S', label: 'Social', score: riasecScores.S || 0, color: '#27AE60' },
    { name: 'E', label: 'Enterprising', score: riasecScores.E || 0, color: '#F39C12' },
    { name: 'C', label: 'Conventional', score: riasecScores.C || 0, color: '#17A589' },
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
    <div className="max-w-4xl mx-auto w-full space-y-4 pb-4 select-none">
      <style>{`
        :root {
          --canvas: #f5f3f3;
          --surface: #ffffff;
          --border: #dddcdc;
          --blue: #1944f1;
          --azure: #4d6ff5;
          --lavender: #eef1fe;
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
          <div className="w-10 h-10 rounded-2xl bg-[var(--blue)] text-white flex items-center justify-center font-black text-base heading-font shadow-sm flex-shrink-0">
            {displayName.charAt(0)}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[var(--ink)] heading-font leading-tight">
              Hello, {displayName}! 👋
            </h1>
            <p className="text-[11px] text-[var(--graphite)] font-medium">
              {dept} · {levelText}
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
          <Link
            to="/activity"
            className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--graphite)] hover:text-[var(--blue)] shadow-sm"
          >
            <Bell className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
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

      {/* ── 2×2 STAT CARDS GRID (Compact Mobile Density) ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* Card 1: Top Career Match */}
        <Link to={assessmentDone ? "/results" : "/quiz"}>
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 sm:p-3.5 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-24 sm:h-28"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-2.5 h-2.5" />
                {assessmentDone ? 'Match' : 'Pending'}
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[var(--ink)] heading-font tracking-tight">
                {topMatchScore}
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--graphite)] truncate">
                {topCareerDetail ? topCareerDetail.title : 'Top Career Fit'}
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 2: Holland Code / Assessment Status */}
        <Link to={assessmentDone ? "/results" : "/quiz"}>
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 sm:p-3.5 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-24 sm:h-28"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#F4ECF7] text-[#9B59B6] flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">
                {hollandCode ? 'RIASEC' : '5 mins'}
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[var(--ink)] heading-font tracking-tight">
                {hollandCode || 'Pending'}
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--graphite)] truncate">
                {hollandLabel ? hollandLabel.split(' · ')[0] : 'Take Assessment'}
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 3: Saved Careers */}
        <Link to="/saved">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 sm:p-3.5 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-24 sm:h-28"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#E8F8F5] text-[#17A589] flex items-center justify-center flex-shrink-0">
                <BookmarkCheck className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">
                Active
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[var(--ink)] heading-font tracking-tight">
                {careersSavedCount}
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--graphite)] truncate">
                Saved Careers
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 4: DELSU Academic Standing */}
        <Link to="/profile">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 sm:p-3.5 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-24 sm:h-28"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#FEF9E7] text-[#F39C12] flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">
                CGPA: {cgpa > 0 ? cgpa.toFixed(2) : '--'}
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[var(--ink)] heading-font tracking-tight">
                {levelText}
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--graphite)] truncate">
                {dept}
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* ── ASSESSMENT CALLOUT (If pending) ── */}
      {!assessmentDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[var(--blue)] to-[var(--azure)] text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black heading-font text-white truncate">
                Career Assessment Pending
              </h3>
              <p className="text-[10px] text-white/85 truncate">
                18 quick questions to unlock custom DELSU matches
              </p>
            </div>
          </div>

          <Link
            to="/quiz"
            className="px-3.5 py-2 rounded-xl bg-white text-[var(--blue)] font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Start</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* ── CAREER FIT ANALYTICS CHART (Compact) ── */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm">
        {/* Section Header with Pill Toggles */}
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
        <div className="h-36 sm:h-40 w-full">
          {chartTab === 'riasec' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riasecChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--graphite)', fontWeight: 600 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: 'var(--ash)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--mist)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[var(--surface)] border border-[var(--border)] p-2 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-[var(--ink)]">{data.label} ({data.name})</p>
                          <p className="text-[var(--blue)] font-extrabold">{data.score}% fit</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {riasecChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[var(--mist)]">
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
      </div>

      {/* ── TOP RECOMMENDATIONS (HORIZONTAL SWIPE CAROUSEL) ── */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[var(--ink)] heading-font">
              Top Recommendations
            </h2>
            <p className="text-[10px] sm:text-xs text-[var(--graphite)]">
              Swipe across recommendations tailored to your DELSU profile
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
          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-1 px-1 pb-1">
            {matchedCareers.map((c) => (
              <Link
                key={c.id}
                to={`/career/${c.id}`}
                className="w-[220px] sm:w-[240px] snap-start bg-[var(--mist)] border border-[var(--border)] rounded-2xl p-3 hover:border-[var(--blue)] active:scale-[0.98] transition-all flex flex-col justify-between flex-shrink-0 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[var(--lavender)] text-[var(--blue)] heading-font">
                      {c.score}% Match
                    </span>
                    <span className="text-[9px] text-[var(--graphite)] truncate max-w-[85px]">
                      {c.field}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--ink)] truncate group-hover:text-[var(--blue)] transition-colors heading-font">
                    {c.title}
                  </h4>
                  <p className="text-[10px] text-[var(--graphite)] mt-0.5 truncate">
                    {c.salary}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-bold text-[var(--blue)]">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── QUICK CONSULT WITH AI ADVISOR ── */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm">
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
