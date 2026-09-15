import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Database, Settings, ShieldCheck, Search, Loader2,
  TrendingUp, Award, Download, RefreshCw, UserCheck, UserX, KeyRound,
  Trash2, ExternalLink, FileText, Filter, CheckCircle2, AlertTriangle,
  X, ChevronRight, LogOut, Bell, Send, Calendar, GraduationCap,
  Building2, Activity, BarChart2, Mail, Lock, Sparkles, HelpCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useModal } from '../contexts/ModalContext';

const RIASEC_META = {
  R: { name: 'Realistic', color: '#FF6B35', bg: '#FFF5F0', border: '#FFD4C2' },
  I: { name: 'Investigative', color: '#20428B', bg: '#EEF2F9', border: '#C5D4F3' },
  A: { name: 'Artistic', color: '#8E44AD', bg: '#F6EFF9', border: '#E4CCEF' },
  S: { name: 'Social', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  E: { name: 'Enterprising', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  C: { name: 'Conventional', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
};

const FACULTIES = [
  'All Faculties',
  'Faculty of Computing',
  'Faculty of Science',
  'Faculty of Clinical Sciences',
  'Faculty of Basic Medical Sciences',
  'Faculty of Law',
  'Faculty of Management Sciences',
  'Faculty of Social Sciences',
  'Faculty of Arts',
  'Faculty of Agriculture',
  'Faculty of Engineering',
  'Faculty of Education'
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();
  const { confirm } = useModal();

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'careers' | 'activity' | 'broadcasts'

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [careers, setCareers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);

  // Filter & Search states for Students tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'completed' | 'pending' | 'active' | 'suspended'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter & Search states for Careers tab
  const [careerSearch, setCareerSearch] = useState('');
  const [careerField, setCareerField] = useState('All Fields');

  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null); // Dossier modal
  const [dossierLoading, setDossierLoading] = useState(false);
  const [dossierData, setDossierData] = useState(null);

  const [passwordModalStudent, setPasswordModalStudent] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTargetFaculty, setBroadcastTargetFaculty] = useState('All');
  const [broadcastTargetLevel, setBroadcastTargetLevel] = useState('All');
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);

  // Initial Load
  const fetchAllData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, usersRes, careersRes, activityRes, broadcastRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/careers').catch(() => ({ data: [] })),
        api.get('/admin/activity').catch(() => ({ data: [] })),
        api.get('/admin/broadcasts').catch(() => ({ data: [] })),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (Array.isArray(usersRes.data)) setUsers(usersRes.data);
      if (Array.isArray(careersRes.data)) setCareers(careersRes.data);
      if (Array.isArray(activityRes.data)) setActivities(activityRes.data);
      if (Array.isArray(broadcastRes.data)) setBroadcasts(broadcastRes.data);

      if (isRefresh) addNotification('Admin data refreshed successfully', 'success');
    } catch (err) {
      console.error('[ADMIN] Error loading dashboard data:', err);
      addNotification('Failed to load some admin data.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered Students
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.matricNo && u.matricNo.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      const matchFaculty = selectedFaculty === 'All Faculties' || u.faculty === selectedFaculty;
      
      const userLvl = u.level ? (u.level.endsWith('L') ? u.level : `${u.level}L`) : '100L';
      const matchLevel = selectedLevel === 'All' || userLvl === selectedLevel;

      let matchStatus = true;
      if (selectedStatus === 'completed') matchStatus = !!u.hasCompletedQuiz;
      if (selectedStatus === 'pending') matchStatus = !u.hasCompletedQuiz;
      if (selectedStatus === 'active') matchStatus = !u.disabled;
      if (selectedStatus === 'suspended') matchStatus = !!u.disabled;

      return matchQuery && matchFaculty && matchLevel && matchStatus;
    });
  }, [users, searchQuery, selectedFaculty, selectedLevel, selectedStatus]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  // Filtered Careers
  const careerFieldsList = useMemo(() => {
    const fields = new Set();
    careers.forEach(c => { if (c.field) fields.add(c.field); });
    return ['All Fields', ...Array.from(fields)];
  }, [careers]);

  const filteredCareers = useMemo(() => {
    return careers.filter(c => {
      const q = careerSearch.toLowerCase().trim();
      const matchQ = !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.core_skills && c.core_skills.some(s => s.toLowerCase().includes(q)));
      const matchF = careerField === 'All Fields' || c.field === careerField;
      return matchQ && matchF;
    });
  }, [careers, careerSearch, careerField]);

  // Handlers
  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Exit Admin Portal?',
      message: 'You will be signed out of the administrator session and redirected to the login portal.',
      confirmText: 'Sign Out',
      cancelText: 'Stay',
      variant: 'brand'
    });
    if (ok) {
      await logout();
      navigate('/login');
    }
  };

  const handleToggleStatus = async (student) => {
    const actionWord = student.disabled ? 'reactivate' : 'suspend';
    const ok = await confirm({
      title: `${actionWord.toUpperCase()} Student Account?`,
      message: `Are you sure you want to ${actionWord} account for ${student.fullName} (${student.matricNo})?`,
      confirmText: student.disabled ? 'Reactivate' : 'Suspend',
      cancelText: 'Cancel',
      variant: student.disabled ? 'brand' : 'danger'
    });
    if (!ok) return;

    try {
      const res = await api.put(`/admin/users/${student.id}/status`, { disabled: !student.disabled });
      setUsers(prev => prev.map(u => u.id === student.id ? { ...u, disabled: res.data.disabled } : u));
      addNotification(`Student account ${res.data.disabled ? 'suspended' : 'reactivated'}.`, 'success');
      if (selectedStudent?.user?.id === student.id) {
        setSelectedStudent(prev => ({ ...prev, user: { ...prev.user, disabled: res.data.disabled } }));
      }
    } catch (err) {
      addNotification('Failed to update student account status.', 'error');
    }
  };

  const handleDeleteStudent = async (student) => {
    const ok = await confirm({
      title: 'Delete Student Permanently?',
      message: `WARNING: This will permanently remove all profile data, quiz records, and chat history for ${student.fullName} (${student.matricNo}). This cannot be undone.`,
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      await api.delete(`/admin/users/${student.id}`);
      setUsers(prev => prev.filter(u => u.id !== student.id));
      addNotification(`Student ${student.matricNo} deleted permanently.`, 'success');
      if (selectedStudent?.user?.id === student.id) {
        setSelectedStudent(null);
      }
    } catch (err) {
      addNotification('Failed to delete student record.', 'error');
    }
  };

  const handleOpenDossier = async (student) => {
    setSelectedStudent({ user: student, loading: true });
    setDossierLoading(true);
    try {
      const res = await api.get(`/admin/users/${student.id}`);
      setDossierData(res.data);
      setSelectedStudent(res.data);
    } catch (err) {
      addNotification('Failed to load full student dossier.', 'error');
    } finally {
      setDossierLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      addNotification('Password must be at least 6 characters.', 'error');
      return;
    }
    setPasswordSubmitting(true);
    try {
      await api.put(`/admin/users/${passwordModalStudent.id}/reset-password`, { newPassword: newPassword.trim() });
      addNotification(`Password updated for ${passwordModalStudent.matricNo}`, 'success');
      setPasswordModalStudent(null);
      setNewPassword('');
    } catch (err) {
      addNotification('Failed to reset student password.', 'error');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPassword(pass);
  };

  const handleExportCSV = async () => {
    try {
      addNotification('Preparing institutional CSV report…', 'info');
      const res = await api.get('/admin/export/csv', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PathWise_Student_Registry_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addNotification('Student registry CSV downloaded successfully!', 'success');
    } catch (err) {
      addNotification('Failed to download CSV export.', 'error');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setBroadcastSubmitting(true);
    try {
      const res = await api.post('/admin/broadcast', {
        title: broadcastTitle,
        message: broadcastMsg,
        targetFaculty: broadcastTargetFaculty,
        targetLevel: broadcastTargetLevel
      });
      setBroadcasts(prev => [res.data, ...prev]);
      addNotification('Campus announcement broadcasted successfully!', 'success');
      setBroadcastTitle('');
      setBroadcastMsg('');
      setBroadcastTargetFaculty('All');
      setBroadcastTargetLevel('All');
    } catch (err) {
      addNotification('Failed to broadcast announcement.', 'error');
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col font-['Open_Sans',sans-serif]">
      {/* ── TOP ADMIN HEADER ── */}
      <header className="sticky top-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--lavender)] border border-[var(--border)] flex items-center justify-center text-[var(--blue)] shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Nunito',sans-serif] font-black text-xl text-[var(--ink)] tracking-tight">PathWise Admin</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[var(--lavender)] text-[var(--blue)] border border-[var(--border)]">
                  DELSU Coordinator
                </span>
              </div>
              <p className="text-xs text-[var(--graphite)]">Delta State University · Academic Guidance & Registry Console</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--mist)] transition-all active:scale-95 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[var(--blue)]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--mist)] border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--lavender)] hover:text-[var(--blue)] transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <div className="h-6 w-px bg-[var(--border)] hidden sm:block" />

            <div className="flex items-center gap-2 text-xs text-[var(--graphite)] bg-[var(--mist)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[var(--ink)] hidden sm:inline">System Active</span>
              <span className="text-[var(--ash)] hidden sm:inline">|</span>
              <span className="truncate max-w-[120px] font-mono text-[11px]">{user?.email || 'admin@pathwise.app'}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all active:scale-95 cursor-pointer"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── ADMIN NAVIGATION TABS ── */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-1 pt-2">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: BarChart2, count: null },
            { id: 'students', label: 'Student Registry', icon: Users, count: users.length },
            { id: 'careers', label: 'Career Knowledge Base', icon: BookOpen, count: careers.length || 50 },
            { id: 'activity', label: 'Audit Trail', icon: Activity, count: activities.length },
            { id: 'broadcasts', label: 'Announcements', icon: Bell, count: broadcasts.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[var(--blue)] text-[var(--blue)] bg-[var(--lavender)]/40 rounded-t-xl'
                    : 'border-transparent text-[var(--graphite)] hover:text-[var(--ink)] hover:border-[var(--border)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--blue)]' : 'text-[var(--ash)]'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-[var(--blue)] text-white' : 'bg-[var(--mist)] text-[var(--graphite)]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT BODY ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--blue)] mx-auto" />
            <p className="text-sm font-semibold text-[var(--graphite)]">Loading administrative records…</p>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB 1: OVERVIEW & ANALYTICS                                      */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-[var(--graphite)]">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Registered Students</span>
                      <div className="w-8 h-8 rounded-lg bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black font-['Nunito',sans-serif] text-[var(--ink)]">{stats?.totalStudents ?? users.length}</span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        +{stats?.recentRegistrations ?? 0} this week
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--graphite)]">Active DELSU undergraduate profiles</p>
                  </div>

                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-[var(--graphite)]">
                      <span className="text-xs font-bold uppercase tracking-wider">Assessments Completed</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black font-['Nunito',sans-serif] text-[var(--ink)]">{stats?.completedAssessments ?? 0}</span>
                      <span className="text-xs font-bold text-[var(--blue)] bg-[var(--lavender)] px-2 py-0.5 rounded-full">
                        {stats?.assessmentRate ?? 0}% rate
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--graphite)]">Completed 18-item RIASEC & SCCT profile</p>
                  </div>

                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-[var(--graphite)]">
                      <span className="text-xs font-bold uppercase tracking-wider">Average Student CGPA</span>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black font-['Nunito',sans-serif] text-[var(--ink)]">{stats?.avgCgpa ?? '0.00'}</span>
                      <span className="text-xs font-mono font-bold text-[var(--graphite)]">/ 5.0 scale</span>
                    </div>
                    <p className="text-[11px] text-[var(--graphite)]">Based on self-declared academic standing</p>
                  </div>

                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-[var(--graphite)]">
                      <span className="text-xs font-bold uppercase tracking-wider">Knowledge Base Records</span>
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black font-['Nunito',sans-serif] text-[var(--ink)]">{stats?.careersCount ?? 50}</span>
                      <span className="text-xs font-semibold text-[var(--graphite)]">
                        {stats?.coursesCount ?? 0} Courses
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--graphite)]">7 Disciplinary Domains · 50 DELSU Careers</p>
                  </div>
                </div>

                {/* Analytical Distributions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* RIASEC Averages Radar / Bar distribution (5 cols) */}
                  <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-['Nunito',sans-serif] font-bold text-base text-[var(--ink)]">
                          RIASEC Trait Breakdown
                        </h2>
                        <p className="text-xs text-[var(--graphite)]">Aggregated vocational personality averages across students</p>
                      </div>
                      <Sparkles className="w-5 h-5 text-[var(--blue)]" />
                    </div>

                    <div className="space-y-3.5 pt-2">
                      {Object.entries(RIASEC_META).map(([dim, meta]) => {
                        const score = stats?.riasecAverage?.[dim] ?? 0;
                        return (
                          <div key={dim} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] text-white font-mono font-bold" style={{ backgroundColor: meta.color }}>
                                  {dim}
                                </span>
                                <span className="text-[var(--ink)]">{meta.name}</span>
                              </span>
                              <span className="font-mono text-[var(--graphite)]">{score} / 100</span>
                            </div>
                            <div className="w-full bg-[var(--mist)] h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${score}%`, backgroundColor: meta.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Matched Careers Leaderboard (7 cols) */}
                  <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-['Nunito',sans-serif] font-bold text-base text-[var(--ink)]">
                          Top Matched Career Paths
                        </h2>
                        <p className="text-xs text-[var(--graphite)]">Most frequent #1 recommendation across all student assessments</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-[var(--blue)]" />
                    </div>

                    {(!stats?.topCareers || stats.topCareers.length === 0) ? (
                      <div className="py-12 text-center text-xs text-[var(--graphite)]">
                        No career matches recorded yet. Once students complete the assessment, ranking insights will populate here.
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        {stats.topCareers.map((c, idx) => (
                          <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--mist)]/70 border border-[var(--border)] hover:bg-[var(--lavender)]/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs font-black text-[var(--blue)] font-mono">
                                #{idx + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-[var(--ink)]">{c.title}</h4>
                                <span className="text-[10px] text-[var(--graphite)] uppercase tracking-wider font-semibold">{c.field}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-[var(--blue)] font-mono">{c.count} match{c.count !== 1 ? 'es' : ''}</span>
                              <p className="text-[10px] text-[var(--graphite)] font-medium">{c.percentage}% of cohort</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Faculty & Level Distribution Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Faculty Breakdown */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-['Nunito',sans-serif] font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--blue)]" />
                      <span>Enrollment by Faculty</span>
                    </h3>
                    <div className="space-y-2.5">
                      {Object.entries(stats?.facultyCounts || {}).length === 0 ? (
                        <p className="text-xs text-[var(--graphite)]">No faculty data available.</p>
                      ) : (
                        Object.entries(stats.facultyCounts).map(([fac, count]) => {
                          const total = stats?.totalStudents || 1;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={fac} className="space-y-1 text-xs">
                              <div className="flex justify-between font-medium">
                                <span className="truncate max-w-[280px] text-[var(--ink)]">{fac}</span>
                                <span className="font-mono text-[var(--graphite)]">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-[var(--mist)] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[var(--azure)] h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Level Breakdown */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-['Nunito',sans-serif] font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[var(--blue)]" />
                      <span>Academic Level Distribution</span>
                    </h3>
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {['100L', '200L', '300L', '400L', '500L'].map(lvl => {
                        const count = stats?.levelCounts?.[lvl] || 0;
                        return (
                          <div key={lvl} className="p-3 rounded-2xl bg-[var(--mist)] border border-[var(--border)] text-center flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-[var(--graphite)]">{lvl}</span>
                            <span className="text-xl font-black font-['Nunito',sans-serif] text-[var(--ink)] my-1">{count}</span>
                            <span className="text-[9px] text-[var(--ash)]">students</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-[var(--graphite)] pt-2 leading-relaxed">
                      Senior students (300L–500L) receive a seniority calibration bonus in PathWise matching logic to reflect academic maturity and proximity to SIWES / graduation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB 2: STUDENT REGISTRY & OPERATIONS                             */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'students' && (
              <div className="space-y-5">
                {/* Search & Filter Controls Bar */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                    {/* Search Input */}
                    <div className="lg:col-span-5 relative">
                      <Search className="w-4 h-4 text-[var(--graphite)] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search student name, matric no, email, or dept..."
                        className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--ink)] placeholder-[var(--ash)] focus:outline-none focus:border-[var(--blue)] transition-all"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-3 text-[var(--graphite)] hover:text-[var(--ink)]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Faculty Select */}
                    <div className="lg:col-span-3">
                      <select
                        value={selectedFaculty}
                        onChange={e => { setSelectedFaculty(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--blue)] transition-all cursor-pointer"
                      >
                        {FACULTIES.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                      </select>
                    </div>

                    {/* Level Select */}
                    <div className="lg:col-span-2">
                      <select
                        value={selectedLevel}
                        onChange={e => { setSelectedLevel(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--blue)] transition-all cursor-pointer"
                      >
                        <option value="All">All Levels</option>
                        <option value="100L">100L</option>
                        <option value="200L">200L</option>
                        <option value="300L">300L</option>
                        <option value="400L">400L</option>
                        <option value="500L">500L</option>
                      </select>
                    </div>

                    {/* Status Select */}
                    <div className="lg:col-span-2">
                      <select
                        value={selectedStatus}
                        onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--blue)] transition-all cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        <option value="completed">Assessment Done</option>
                        <option value="pending">Assessment Pending</option>
                        <option value="active">Active Account</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-[var(--graphite)] pt-1">
                    <span>
                      Showing <strong>{filteredUsers.length}</strong> matching students (Page {currentPage} of {totalPages})
                    </span>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="text-xs font-bold text-[var(--blue)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full Registry (.CSV)
                    </button>
                  </div>
                </div>

                {/* Students Table */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-[var(--graphite)]">
                      <thead className="text-[11px] uppercase tracking-wider bg-[var(--mist)] border-b border-[var(--border)] font-bold text-[var(--ink)]">
                        <tr>
                          <th className="px-5 py-3.5">Student Details</th>
                          <th className="px-5 py-3.5">Matric No</th>
                          <th className="px-5 py-3.5">Academic Standing</th>
                          <th className="px-5 py-3.5">Assessment Status</th>
                          <th className="px-5 py-3.5">Top Recommendation</th>
                          <th className="px-5 py-3.5">Account</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {paginatedUsers.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-5 py-12 text-center text-xs text-[var(--graphite)]">
                              No students found matching your filters.
                            </td>
                          </tr>
                        ) : (
                          paginatedUsers.map(u => {
                            const topCareerObj = u.topCareer ? careers.find(c => c.id === u.topCareer) : null;
                            const isSuspended = !!u.disabled;
                            return (
                              <tr key={u.id} className="hover:bg-[var(--mist)]/60 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="font-bold text-[var(--ink)] text-xs">{u.fullName || 'Unnamed Student'}</div>
                                  <div className="text-[10px] text-[var(--ash)] truncate max-w-[160px]">{u.email}</div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="font-mono font-bold text-[var(--ink)] bg-[var(--mist)] px-2 py-0.5 rounded border border-[var(--border)]">
                                    {u.matricNo}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="font-medium text-[var(--ink)]">{u.department || '—'}</div>
                                  <div className="text-[10px] text-[var(--graphite)]">
                                    Level: <strong>{u.level ? (u.level.endsWith('L') ? u.level : `${u.level}L`) : '100L'}</strong> · CGPA: <strong>{u.cgpa ? u.cgpa.toFixed(2) : '—'}</strong>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  {u.hasCompletedQuiz ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Code: {u.hollandCode || 'Completed'}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                      <span>Not Taken</span>
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5">
                                  {topCareerObj ? (
                                    <div>
                                      <div className="font-bold text-[var(--ink)]">{topCareerObj.title}</div>
                                      <span className="text-[10px] text-[var(--blue)] font-semibold">{u.topScore ? `${u.topScore}% Match` : ''}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[var(--ash)]">—</span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5">
                                  {isSuspended ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Suspended</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Active</span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDossier(u)}
                                      className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--graphite)] hover:text-[var(--blue)] hover:border-[var(--blue)] transition-all cursor-pointer"
                                      title="View Student Dossier & Results"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => { setPasswordModalStudent(u); setNewPassword(''); }}
                                      className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--graphite)] hover:text-amber-600 hover:border-amber-400 transition-all cursor-pointer"
                                      title="Reset Student Password"
                                    >
                                      <KeyRound className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleStatus(u)}
                                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                        isSuspended
                                          ? 'border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                          : 'border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100'
                                      }`}
                                      title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                                    >
                                      {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStudent(u)}
                                      className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                                      title="Delete Student Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--graphite)]">
                      <span>Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} students</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] font-semibold disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <span className="font-mono px-2 font-bold text-[var(--ink)]">{currentPage} / {totalPages}</span>
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] font-semibold disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB 3: CAREER KNOWLEDGE BASE                                     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'careers' && (
              <div className="space-y-5">
                {/* Search & Filter Bar */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="w-full sm:w-80 relative">
                    <Search className="w-4 h-4 text-[var(--graphite)] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={careerSearch}
                      onChange={e => setCareerSearch(e.target.value)}
                      placeholder="Search career title, skill, or keyword..."
                      className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--ink)] placeholder-[var(--ash)] focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={careerField}
                      onChange={e => setCareerField(e.target.value)}
                      className="bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--blue)] cursor-pointer"
                    >
                      {careerFieldsList.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <span className="text-xs font-semibold text-[var(--graphite)] whitespace-nowrap">
                      {filteredCareers.length} career{filteredCareers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Careers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredCareers.map(c => (
                    <div key={c.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-[var(--azure)] transition-all">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--blue)] bg-[var(--lavender)] px-2 py-0.5 rounded-full">
                              {c.field}
                            </span>
                            <h3 className="font-['Nunito',sans-serif] font-bold text-base text-[var(--ink)] mt-1.5">
                              {c.title}
                            </h3>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-[var(--ink)] bg-[var(--mist)] px-2 py-1 rounded border border-[var(--border)]">
                            {Array.isArray(c.holland_code) ? c.holland_code.join('') : (c.holland_code || 'RIA')}
                          </span>
                        </div>

                        <p className="text-xs text-[var(--graphite)] leading-relaxed line-clamp-3">
                          {c.description}
                        </p>

                        <div className="space-y-1.5 pt-2 text-[11px] text-[var(--graphite)]">
                          <div className="flex justify-between">
                            <span>Salary Benchmark:</span>
                            <strong className="text-[var(--ink)]">{c.salary_range || c.salary_range_ngn || '₦1.5M - ₦8M / yr'}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Min CGPA Threshold:</span>
                            <strong className="text-[var(--ink)]">{c.required_cgpa_hint || '2.5+'}</strong>
                          </div>
                        </div>

                        {c.core_skills && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {c.core_skills.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[10px] bg-[var(--mist)] text-[var(--graphite)] px-2 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                            {c.core_skills.length > 3 && (
                              <span className="text-[10px] text-[var(--ash)] px-1 py-0.5">+{c.core_skills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[var(--ash)]">ID: {c.id}</span>
                        <a
                          href={`/career/${c.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--blue)] hover:underline"
                        >
                          <span>Preview Student View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB 4: AUDIT TRAIL & SYSTEM LOGS                                 */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'activity' && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
                  <div>
                    <h2 className="font-['Nunito',sans-serif] font-bold text-lg text-[var(--ink)]">
                      System Activity & Audit Log
                    </h2>
                    <p className="text-xs text-[var(--graphite)]">Live immutable event trail of student assessment completions, logins, and coordinator actions.</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[var(--lavender)] text-[var(--blue)] border border-[var(--border)] self-start sm:self-auto">
                    {activities.length} Recorded Events
                  </span>
                </div>

                {activities.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[var(--graphite)]">
                    No activity logs recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 50).map(act => (
                      <div key={act.id} className="p-3.5 rounded-2xl bg-[var(--mist)]/70 border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--blue)] flex-shrink-0 mt-0.5 sm:mt-0">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-[var(--ink)] flex items-center gap-2">
                              <span>{act.action.replace(/_/g, ' ').toUpperCase()}</span>
                              <span className="font-mono text-[10px] text-[var(--blue)] font-bold bg-[var(--lavender)] px-2 py-0.5 rounded">
                                {act.matricNo || '—'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--graphite)] mt-0.5">
                              Student: <strong>{act.studentName}</strong>
                              {act.metadata?.topCareer && ` · Top Matched Career: ${act.metadata.topCareer}`}
                              {act.metadata?.hollandCode && ` · Code: ${act.metadata.hollandCode}`}
                              {act.metadata?.title && ` · Title: ${act.metadata.title}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-[var(--ash)] self-end sm:self-center whitespace-nowrap">
                          {act.timestamp ? new Date(act.timestamp).toLocaleString() : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB 5: BROADCAST NOTICES & ANNOUNCEMENTS                         */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'broadcasts' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Send Notice Form (5 cols) */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
                  <div>
                    <h2 className="font-['Nunito',sans-serif] font-bold text-lg text-[var(--ink)]">
                      Broadcast Announcement
                    </h2>
                    <p className="text-xs text-[var(--graphite)]">Publish institutional bulletins directly to students.</p>
                  </div>

                  <form onSubmit={handleSendBroadcast} className="space-y-3.5 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">Notice Title</label>
                      <input
                        type="text"
                        value={broadcastTitle}
                        onChange={e => setBroadcastTitle(e.target.value)}
                        placeholder="e.g. 2025/2026 SIWES Placement Orientation"
                        className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--blue)]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">Message Body</label>
                      <textarea
                        rows={4}
                        value={broadcastMsg}
                        onChange={e => setBroadcastMsg(e.target.value)}
                        placeholder="Type announcement details for DELSU students…"
                        className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--blue)] resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">Target Faculty</label>
                        <select
                          value={broadcastTargetFaculty}
                          onChange={e => setBroadcastTargetFaculty(e.target.value)}
                          className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--ink)]"
                        >
                          <option value="All">All Faculties</option>
                          {FACULTIES.slice(1).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">Target Level</label>
                        <select
                          value={broadcastTargetLevel}
                          onChange={e => setBroadcastTargetLevel(e.target.value)}
                          className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--ink)]"
                        >
                          <option value="All">All Levels</option>
                          <option value="100L">100L Only</option>
                          <option value="200L">200L Only</option>
                          <option value="300L">300L Only</option>
                          <option value="400L">400L Only</option>
                          <option value="500L">500L Only</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={broadcastSubmitting}
                      className="w-full py-3 rounded-xl bg-[var(--blue)] text-white text-xs font-bold shadow-md hover:bg-[var(--azure)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {broadcastSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Publish Broadcast</span>
                    </button>
                  </form>
                </div>

                {/* Broadcast History (7 cols) */}
                <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
                  <h2 className="font-['Nunito',sans-serif] font-bold text-lg text-[var(--ink)]">
                    Announcement Archive
                  </h2>

                  {broadcasts.length === 0 ? (
                    <div className="py-16 text-center text-xs text-[var(--graphite)]">
                      No broadcast notices sent yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {broadcasts.map(b => (
                        <div key={b.id} className="p-4 rounded-2xl bg-[var(--mist)] border border-[var(--border)] space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-xs text-[var(--ink)]">{b.title}</h4>
                            <span className="text-[10px] font-mono text-[var(--ash)] whitespace-nowrap">
                              {new Date(b.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--graphite)] leading-relaxed">{b.message}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--blue)] font-semibold pt-1">
                            <span>Faculty: {b.targetFaculty}</span>
                            <span>·</span>
                            <span>Level: {b.targetLevel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: STUDENT DOSSIER MODAL                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--blue)] bg-[var(--lavender)] px-2 py-0.5 rounded-full">
                  Student Academic Dossier
                </span>
                <h3 className="font-['Nunito',sans-serif] font-black text-xl text-[var(--ink)] mt-1">
                  {selectedStudent.user?.fullName || 'Student Profile'}
                </h3>
                <p className="text-xs text-[var(--graphite)]">
                  Matric: <strong className="font-mono text-[var(--ink)]">{selectedStudent.user?.matricNo}</strong> · {selectedStudent.user?.department} ({selectedStudent.user?.faculty})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--ink)] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {dossierLoading ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--blue)] mx-auto" />
                <p className="text-xs text-[var(--graphite)]">Retrieving academic and assessment records…</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Academic Standing Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-[var(--mist)] text-center">
                    <span className="text-[10px] font-bold text-[var(--graphite)] uppercase">Academic Level</span>
                    <p className="font-['Nunito',sans-serif] font-black text-lg text-[var(--ink)] mt-0.5">
                      {selectedStudent.user?.level ? (selectedStudent.user.level.endsWith('L') ? selectedStudent.user.level : `${selectedStudent.user.level}L`) : '100L'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--mist)] text-center">
                    <span className="text-[10px] font-bold text-[var(--graphite)] uppercase">Declared CGPA</span>
                    <p className="font-['Nunito',sans-serif] font-black text-lg text-[var(--ink)] mt-0.5">
                      {selectedStudent.user?.cgpa ? selectedStudent.user.cgpa.toFixed(2) : '—'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--mist)] text-center">
                    <span className="text-[10px] font-bold text-[var(--graphite)] uppercase">Holland Code</span>
                    <p className="font-['Nunito',sans-serif] font-black text-lg text-[var(--blue)] mt-0.5">
                      {selectedStudent.user?.hollandCode || 'Pending'}
                    </p>
                  </div>
                </div>

                {/* RIASEC Profile Breakdown */}
                {selectedStudent.user?.riasecScores && (
                  <div className="space-y-3 bg-[var(--mist)]/60 p-4 rounded-2xl border border-[var(--border)]">
                    <h4 className="font-bold text-xs text-[var(--ink)]">RIASEC Dimension Scores (0–100)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(selectedStudent.user.riasecScores).map(([dim, score]) => (
                        <div key={dim} className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--ink)]">{RIASEC_META[dim]?.name || dim}</span>
                          <span className="font-mono text-xs font-bold text-[var(--blue)]">{score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Matched Career Recommendations */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-xs text-[var(--ink)]">Top 5 Recommended Careers</h4>
                  {(!selectedStudent.quizResults || selectedStudent.quizResults.length === 0) ? (
                    <p className="text-xs text-[var(--graphite)] italic">Student has not taken the career assessment yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedStudent.quizResults.slice(0, 5).map((r, i) => (
                        <div key={r.careerId} className="flex items-center justify-between p-3 rounded-xl bg-[var(--mist)] border border-[var(--border)] text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-[var(--surface)] font-mono font-bold text-[10px] text-[var(--blue)] flex items-center justify-center border border-[var(--border)]">
                              #{i + 1}
                            </span>
                            <div>
                              <strong className="text-[var(--ink)]">{r.title}</strong>
                              <span className="text-[10px] text-[var(--graphite)] ml-2">({r.field})</span>
                            </div>
                          </div>
                          <span className="font-bold font-mono text-[var(--blue)] bg-[var(--lavender)] px-2 py-0.5 rounded">
                            {r.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Details & Status */}
                <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[var(--graphite)]">
                    Joined: <strong>{new Date(selectedStudent.user?.createdAt || Date.now()).toLocaleDateString()}</strong> · Status:{' '}
                    <strong className={selectedStudent.user?.disabled ? 'text-red-600' : 'text-emerald-600'}>
                      {selectedStudent.user?.disabled ? 'Suspended' : 'Active'}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedStudent.user)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-[var(--surface)] hover:bg-[var(--mist)]"
                    >
                      {selectedStudent.user?.disabled ? 'Reactivate' : 'Suspend Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordModalStudent(selectedStudent.user);
                        setNewPassword('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--blue)] text-white text-xs font-bold hover:bg-[var(--azure)] transition-all cursor-pointer"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: RESET PASSWORD MODAL                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {passwordModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-['Nunito',sans-serif] font-bold text-lg text-[var(--ink)]">
                  Reset Student Password
                </h3>
                <p className="text-xs text-[var(--graphite)]">
                  Matric: <strong>{passwordModalStudent.matricNo}</strong> ({passwordModalStudent.fullName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalStudent(null)}
                className="w-7 h-7 rounded-full bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--ink)] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[var(--ink)]">New Password</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-[var(--blue)] hover:underline cursor-pointer"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  className="w-full bg-[var(--fog)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--blue)]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold hover:bg-[var(--mist)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--blue)] text-white text-xs font-bold hover:bg-[var(--azure)] disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {passwordSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  <span>Set Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
