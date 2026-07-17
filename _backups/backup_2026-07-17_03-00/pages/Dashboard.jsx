import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Bell, LayoutGrid, Star, BookmarkCheck, CheckCircle2, Map, X, Bookmark, GraduationCap, Target } from 'lucide-react';

const STUDY_PLAN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const STUDY_COLORS = ['#0056FF','#0056FF','',  '#2277FF','','','#2277FF'];

const Dashboard = () => {
  const { user, setUser, refreshUser } = useAuth();
  const { addNotification } = useNotification();
  const [savedCareers, setSavedCareers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [careersList, setCareersList] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Always refresh the user profile to get latest savedCareers + quizResults from DB
        const [freshUser, careersRes, activityRes] = await Promise.all([
          refreshUser(),
          api.get('/data/careers'),
          api.get('/users/activity')
        ]);

        const latestUser = freshUser || user;

        if (careersRes.data) {
          setCareersList(careersRes.data);
          const savedIds = latestUser?.savedCareers || [];
          const userSaved = careersRes.data.filter(c => savedIds.includes(c.id));
          const mapped = userSaved.map(c => ({
            id: c.id,
            title: c.title,
            score: 0,
            icon: <Bookmark className="w-4 h-4 text-pw-blue" />
          }));
          setSavedCareers(mapped);
        }
        if (activityRes.data) {
          setActivityLog(activityRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      }
    };
    if (user) fetchDashboardData();
  }, []);                // run once on mount with latest server data

  const displayName = user?.fullName?.split(' ')[0] || 'User';
  const matricNo = user?.matricNo || 'Your Matric No';
  const dept = user?.department || 'Department';
  const rawLevel = user?.level || '100';
  const levelText = String(rawLevel).includes('Level') || String(rawLevel).includes('L')
    ? rawLevel
    : `${rawLevel} Level`;
  const cgpa = user?.cgpa ?? 0;
  
  const xp = user?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpMax = level * 100;

  const removeSaved = async (id) => {
    try {
      const res = await api.delete(`/users/save-career/${id}`);
      const updatedSaved = res.data.savedCareers || [];
      setUser(prev => ({ ...prev, savedCareers: updatedSaved }));
      setSavedCareers(prev => prev.filter(c => c.id !== id));
      addNotification('Career removed from saved list.', 'info');
    } catch (err) {
      addNotification('Failed to remove career.', 'error');
    }
  };

  const topMatchScore = user?.quizResults && user.quizResults.length > 0 ? `${user.quizResults[0].score}%` : '0%';
  const careersSavedCount = user?.savedCareers?.length ?? savedCareers.length;
  const assessmentDone = user?.quizResults && user.quizResults.length > 0;
  const assessmentStatus = assessmentDone ? 'Completed' : 'Pending';
  const roadmapsExploredCount = activityLog.filter(a => a.action === 'roadmap_viewed').length;
  const hollandCode = user?.hollandCode || null;
  const hollandLabel = user?.hollandLabel || null;

  const topCareerId = user?.quizResults && user.quizResults.length > 0 ? user.quizResults[0].id : null;
  const topCareerDetail = topCareerId ? careersList.find(c => c.id === topCareerId) : null;

  // Deterministic Skill Gap Generator
  const getSkillGapData = (careerDetail) => {
    if (!careerDetail) {
      return [
        { skill: 'Core Skills', Current: 40, Required: 80 },
        { skill: 'Specialization', Current: 50, Required: 75 },
        { skill: 'Execution', Current: 60, Required: 85 },
        { skill: 'Communication', Current: 45, Required: 90 }
      ];
    }
    const skills = careerDetail.core_skills || ['Skills', 'Strategy', 'Execution', 'Leadership'];
    const seed = user?.fullName || 'PathWise Student';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return skills.map((skill, idx) => {
      const currentVal = 55 + (Math.abs(hash >> (idx * 3)) % 25);
      const reqVal = Math.max(currentVal + 10, 75 + (Math.abs(hash >> (idx * 4)) % 15));
      return {
        skill,
        Current: currentVal,
        Required: reqVal
      };
    });
  };

  const skillGapData = getSkillGapData(topCareerDetail);

  // Time formatting helper
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const diff = new Date() - new Date(isoString);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Dynamic Recent Activity mappings
  const recentActivities = activityLog.slice(0, 4).map(activity => {
    let text = '';
    let boldText = '';
    let active = true;

    if (activity.action === 'quiz_completed') {
      text = 'Completed';
      boldText = 'Career Assessment';
    } else if (activity.action === 'career_saved') {
      text = 'Saved';
      const c = careersList.find(item => item.id === activity.metadata?.careerId);
      boldText = c ? c.title : 'Career';
    } else if (activity.action === 'career_unsaved') {
      text = 'Removed';
      const c = careersList.find(item => item.id === activity.metadata?.careerId);
      boldText = c ? c.title : 'Career';
      active = false;
    } else if (activity.action === 'roadmap_viewed') {
      text = 'Viewed';
      const c = careersList.find(item => item.id === activity.metadata?.careerId);
      boldText = c ? c.title : 'Career';
    } else if (activity.action === 'profile_updated') {
      text = 'Updated';
      boldText = 'Profile Details';
    } else {
      text = 'Logged';
      boldText = activity.action;
    }

    return {
      text,
      bold: boldText,
      time: formatTimeAgo(activity.timestamp),
      active
    };
  });

  if (recentActivities.length === 0) {
    recentActivities.push({
      text: 'Joined',
      bold: 'PathWise Platform',
      time: 'Just now',
      active: true
    });
  }

  return (
    <div className="space-y-6 pb-8">

      {/* Mandatory Quiz Notice Banner — hidden once assessment is complete */}
      {!assessmentDone && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-pw-blue/5 border border-pw-blue/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,86,255,0.02)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pw-blue/10 flex items-center justify-center text-pw-blue shrink-0">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-pw-white mb-0.5">Mandatory Career Assessment</h4>
              <p className="text-xs text-pw-gray leading-relaxed">
                You must complete the career assessment to activate custom DELSU academic match reports and course advisory updates.
              </p>
            </div>
          </div>
          <Link
            to="/quiz"
            className="text-xs font-bold text-white bg-pw-blue hover:bg-pw-azure px-4 py-2.5 rounded-xl transition-all shadow-[0_0_12px_rgba(0,86,255,0.3)] hover:shadow-[0_0_18px_rgba(0,86,255,0.45)] text-center shrink-0"
          >
            Take Assessment Now →
          </Link>
        </motion.div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-pw-white/5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(0,86,255,0.3)]" style={{ background: 'linear-gradient(135deg, #0056FF, #2277FF)' }}>
            {displayName.charAt(0)}
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-[#000000]" />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-pw-white tracking-tight">Welcome, {displayName}!</h2>
            {hollandCode && (
              <Link to="/results"
                title="View your career personality results"
                className="flex gap-1 px-2 py-1 rounded-xl border border-pw-blue/30 bg-pw-blue/8 hover:bg-pw-blue/15 transition-all"
              >
                {hollandCode.split('').map((letter, i) => {
                  const colors = { R:'#FF6B35', I:'#0056FF', A:'#9B59B6', S:'#27AE60', E:'#F39C12', C:'#17A589' };
                  return (
                    <span key={i} className="text-sm font-extrabold" style={{ color: colors[letter] || '#0056FF' }}>
                      {letter}
                    </span>
                  );
                })}
              </Link>
            )}
          </div>
          <p className="text-pw-gray text-sm mt-1">{dept} · {levelText}</p>
          <span className="inline-block mt-3 px-3 py-1 rounded-full bg-pw-blue/10 text-pw-blue text-xs font-bold border border-pw-blue/20">
            CGPA: {cgpa.toFixed(2)}
          </span>
        </div>

        {/* XP Progress */}
        <div className="w-full md:w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-pw-gray text-sm font-medium">XP Progress</span>
            <span className="text-pw-blue font-bold text-sm">{xp}/{xpMax} XP</span>
          </div>
          <div className="w-full bg-pw-white/10 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-pw-blue transition-all"
              style={{ width: `${(xp / xpMax) * 100}%` }}
            />
          </div>
          <p className="text-right text-pw-gray text-xs mt-1">Level {level} Explorer</p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Match */}
        <Link to="/results">
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl p-5 bg-gradient-to-br from-pw-blue to-blue-800 cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl font-extrabold text-white">{topMatchScore}</span>
              <Star className="w-5 h-5 text-white/70" />
            </div>
            <p className="text-white/80 text-sm font-medium">Top Match</p>
          </motion.div>
        </Link>

        {/* Careers Saved — live count from user.savedCareers */}
        <Link to="/saved">
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl p-5 bg-gradient-to-br from-pw-azure to-blue-700 cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl font-extrabold text-white">{careersSavedCount}</span>
              <BookmarkCheck className="w-5 h-5 text-white/70" />
            </div>
            <p className="text-white/80 text-sm font-medium">Careers Saved</p>
          </motion.div>
        </Link>

        {/* Assessment — green when done, blue-pending otherwise */}
        <Link to={assessmentDone ? '/results' : '/quiz'}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-2xl p-5 cursor-pointer bg-gradient-to-br ${
              assessmentDone
                ? 'from-emerald-600 to-emerald-800'
                : 'from-pw-azure to-blue-700'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl font-extrabold text-white leading-none">{assessmentStatus}</span>
              <CheckCircle2 className="w-5 h-5 text-white/70 flex-shrink-0" />
            </div>
            <p className="text-white/80 text-sm font-medium">Assessment</p>
          </motion.div>
        </Link>

        {/* Roadmaps Explored — from activity log */}
        <Link to="/explore">
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl p-5 bg-gradient-to-br from-pw-blue to-blue-800 cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl font-extrabold text-white">{roadmapsExploredCount}</span>
              <Map className="w-5 h-5 text-white/70" />
            </div>
            <p className="text-white/80 text-sm font-medium">Roadmaps Explored</p>
          </motion.div>
        </Link>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Saved Careers */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-4">Your Saved Careers</h2>
            <div className="space-y-2">
              {savedCareers.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-pw-blue/10 flex items-center justify-center text-base">
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-pw-white text-sm font-medium truncate">{c.title}</p>
                    <p className="text-pw-gray text-xs">View insights</p>
                  </div>
                  <Link to={`/career/${c.id}`} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-pw-blue/10 text-pw-blue hover:bg-pw-blue/20 transition-all border border-pw-blue/20">
                    View
                  </Link>
                  <button onClick={() => removeSaved(c.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Career Roadmap Progress */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-1">Your Career Roadmap Progress</h2>
            {(() => {
              const topCareerId = user?.quizResults && user.quizResults.length > 0 ? user.quizResults[0].id : null;
              const topCareerDetail = topCareerId ? careersList.find(c => c.id === topCareerId) : null;
              const topCareerTitle = topCareerDetail ? topCareerDetail.title : (user?.quizResults && user.quizResults.length > 0 ? 'Loading matched career...' : 'Take assessment to unlock roadmap');
              
              const getRoadmapSteps = (levelText) => {
                const cleaned = String(levelText || '100').toLowerCase();
                if (cleaned.includes('200')) {
                  return [
                    { label: '100L Passed', status: 'completed' },
                    { label: '200L Sem-1', status: 'completed' },
                    { label: '200L Sem-2', status: 'current' },
                    { label: '300L Sem-1', status: 'upcoming' }
                  ];
                } else if (cleaned.includes('300')) {
                  return [
                    { label: '200L Passed', status: 'completed' },
                    { label: '300L Sem-1', status: 'completed' },
                    { label: '300L Sem-2', status: 'current' },
                    { label: '400L Sem-1', status: 'upcoming' }
                  ];
                } else if (cleaned.includes('400')) {
                  return [
                    { label: '300L Passed', status: 'completed' },
                    { label: '400L Sem-1', status: 'completed' },
                    { label: '400L Sem-2', status: 'current' },
                    { label: 'Graduate Done', status: 'upcoming' }
                  ];
                } else if (cleaned.includes('500')) {
                  return [
                    { label: '400L Passed', status: 'completed' },
                    { label: '500L Sem-1', status: 'completed' },
                    { label: '500L Sem-2', status: 'current' },
                    { label: 'Graduate Done', status: 'upcoming' }
                  ];
                } else if (cleaned.includes('grad') || cleaned.includes('nysc')) {
                  return [
                    { label: 'Completed Semester', status: 'completed' },
                    { label: 'Completed Semester', status: 'completed' },
                    { label: 'Completed Semester', status: 'completed' },
                    { label: 'Completed Semester', status: 'completed' }
                  ];
                } else {
                  // 100 Level default
                  return [
                    { label: '100L Sem-1', status: 'completed' },
                    { label: '100L Sem-2', status: 'current' },
                    { label: '200L Sem-1', status: 'upcoming' },
                    { label: '200L Sem-2', status: 'upcoming' }
                  ];
                }
              };
              
              const roadmapSteps = getRoadmapSteps(user?.level);
              
              const getProgressWidth = (steps) => {
                const currentIdx = steps.findIndex(s => s.status === 'current');
                if (currentIdx === -1) {
                  if (steps.every(s => s.status === 'completed')) return '100%';
                  return '0%';
                }
                const percentages = ['0%', '35%', '68%', '100%'];
                return percentages[currentIdx] || '35%';
              };
              const progressWidth = getProgressWidth(roadmapSteps);

              return (
                <>
                  <p className="text-pw-gray text-xs mb-6">{topCareerTitle}</p>

                  <div className="relative pt-4 pb-10">
                    {/* Track */}
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-pw-white/10 rounded-full -translate-y-1/2" />
                    <div className="absolute top-1/2 left-0 h-1.5 rounded-full -translate-y-1/2 transition-all duration-500" style={{ width: progressWidth, background: 'linear-gradient(to right, #2277FF, #0056FF)' }} />

                    <div className="relative flex justify-between">
                      {roadmapSteps.map((step, idx) => {
                        if (step.status === 'completed') {
                          return (
                            <div key={idx} className="flex flex-col items-center relative">
                              <div className="w-8 h-8 rounded-full bg-pw-blue flex items-center justify-center shadow-[0_0_12px_rgba(0,86,255,0.4)] z-10">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                              <span className="absolute top-10 text-xs text-pw-blue font-medium whitespace-nowrap text-center leading-tight mt-1">{step.label.split(' ')[0]}<br/>{step.label.split(' ')[1]}</span>
                            </div>
                          );
                        } else if (step.status === 'current') {
                          return (
                            <div key={idx} className="flex flex-col items-center relative">
                              <div className="absolute -top-7 bg-pw-blue text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(0,86,255,0.4)]">
                                Current Semester
                              </div>
                              <div className="w-8 h-8 rounded-full bg-pw-blue flex items-center justify-center shadow-[0_0_16px_rgba(0,86,255,0.5)] ring-4 ring-pw-blue/20 z-10">
                                <div className="w-3 h-3 rounded-full bg-white" />
                              </div>
                              <span className="absolute top-10 text-xs text-pw-blue font-medium whitespace-nowrap text-center leading-tight mt-1">{step.label.split(' ')[0]}<br/>{step.label.split(' ')[1]}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div key={idx} className="flex flex-col items-center relative">
                              <div className="w-8 h-8 rounded-full bg-pw-white/10 border border-pw-white/20 flex items-center justify-center z-10" />
                              <span className="absolute top-10 text-xs text-pw-gray whitespace-nowrap text-center leading-tight mt-1">{step.label.split(' ')[0]}<br/>{step.label.split(' ')[1]}</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Skill Gap Report */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-1">Skill Gap Report</h2>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-pw-gray">
                <div className="w-3 h-3 rounded-sm bg-pw-blue" /> Current
              </div>
              <div className="flex items-center gap-1.5 text-xs text-pw-gray">
                <div className="w-3 h-3 rounded-sm bg-white/30" /> {topCareerDetail ? topCareerDetail.title : 'Target Career'}
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGapData} barSize={12} barGap={2}>
                  <XAxis dataKey="skill" stroke="#8B9CC8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#8B9CC8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#080818', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="Current"  fill="#0056FF" radius={[3,3,0,0]} />
                  <Bar dataKey="Required" fill="rgba(255,255,255,0.2)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-pw-gray">
                <div className="w-3 h-3 rounded-sm bg-pw-blue" /> Current
              </div>
              <div className="flex items-center gap-1.5 text-xs text-pw-gray">
                <div className="w-3 h-3 rounded-sm bg-white/30" /> Required
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${a.active ? 'bg-pw-blue shadow-[0_0_8px_rgba(0,86,255,0.5)]' : 'bg-white/20'}`} />
                  <div>
                    <p className="text-pw-gray text-sm leading-snug">
                      {a.text} <span className="text-pw-white font-bold">{a.bold}</span>
                    </p>
                    <p className="text-pw-muted text-xs mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Plan */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-pw-white font-bold text-lg">Study Plan</h2>
              <select className="bg-pw-white/5 border border-pw-white/10 text-pw-gray text-xs rounded-lg px-3 py-1.5 focus:outline-none">
                <option>Overview</option>
                <option>This Week</option>
              </select>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {STUDY_PLAN.map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-pw-gray text-xs font-medium">{day}</span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: STUDY_COLORS[i] ? STUDY_COLORS[i] + '22' : 'rgba(255,255,255,0.04)',
                      color: STUDY_COLORS[i] || '#8B9CC8',
                      border: `1px solid ${STUDY_COLORS[i] ? STUDY_COLORS[i] + '44' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {STUDY_COLORS[i] ? day.substring(0, 3) : '–'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
