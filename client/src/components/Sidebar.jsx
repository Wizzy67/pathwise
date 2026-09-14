import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Compass,
  Target,
  Brain,
  Bookmark,
  History,
  User,
  LogOut,
  Sun,
  Moon,
  Calculator,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const mainLinks = [
    { name: 'Dashboard',        path: '/dashboard',         icon: LayoutDashboard },
    { name: 'Explore Careers',  path: '/explore',           icon: Compass },
    { name: 'AI Advisor',       path: '/advisor',           icon: Brain },
  ];

  const academicLinks = [
    { name: 'Career Assessment', path: '/quiz',             icon: Target },
    { name: 'Results Analysis',  path: '/results-analysis', icon: Calculator },
    { name: 'Saved Careers',     path: '/saved',            icon: Bookmark },
  ];

  const accountLinks = [
    { name: 'Activity Log',      path: '/activity',         icon: History },
    { name: 'My Profile',        path: '/profile',          icon: User },
  ];

  const displayName = user?.fullName || 'Student';
  const firstName = displayName.split(' ')[0];
  const initial = displayName.charAt(0).toUpperCase();
  const cgpa = user?.cgpa ?? null;
  const xp = user?.xp || 0;
  const level = Math.floor(xp / 100) + 1;

  const getCgpaColor = (v) => {
    if (!v) return 'text-[var(--graphite)]';
    const n = parseFloat(v);
    if (n >= 4.5) return 'text-emerald-600';
    if (n >= 3.5) return 'text-[var(--blue)]';
    if (n >= 2.4) return 'text-amber-600';
    return 'text-red-500';
  };

  const NavLink = ({ link }) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.path;
    return (
      <Link
        to={link.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold relative group ${
          isActive
            ? 'bg-[var(--lavender)] text-[var(--blue)]'
            : 'text-[var(--graphite)] hover:bg-[var(--fog)] hover:text-[var(--ink)]'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[var(--blue)]" />
        )}
        <Icon
          className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[var(--blue)]' : 'text-current'}`}
        />
        <span className="truncate">{link.name}</span>
      </Link>
    );
  };

  const SectionLabel = ({ label }) => (
    <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--ash)] px-3 pt-4 pb-1.5">
      {label}
    </p>
  );

  return (
    <>
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
      `}</style>

      <aside className="w-64 hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto body-font flex-shrink-0">

        {/* ── STUDENT IDENTITY ── */}
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 bg-[var(--blue)]">
              {initial}
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className="text-sm font-bold text-[var(--ink)] heading-font truncate">{firstName}</h3>
              <p className="text-[10px] truncate text-[var(--graphite)]">{user?.matricNo || 'DELSU Student'}</p>
            </div>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="px-4 py-3 border-b border-[var(--border)] grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--mist)]">
            <span className={`text-sm font-black heading-font ${getCgpaColor(cgpa)}`}>
              {cgpa ? parseFloat(cgpa).toFixed(2) : '--'}
            </span>
            <span className="text-[9px] text-[var(--graphite)] font-semibold mt-0.5">CGPA</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--mist)]">
            <span className="text-sm font-black heading-font text-[var(--blue)]">Lvl {level}</span>
            <span className="text-[9px] text-[var(--graphite)] font-semibold mt-0.5">XP</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--mist)]">
            <span className="text-sm font-black heading-font text-[var(--ink)]">
              {user?.level ? String(user.level).replace('L','') + 'L' : '--'}
            </span>
            <span className="text-[9px] text-[var(--graphite)] font-semibold mt-0.5">Level</span>
          </div>
        </div>

        {/* ── NAV GROUPS ── */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <SectionLabel label="Main" />
          {mainLinks.map(link => <NavLink key={link.path} link={link} />)}

          <SectionLabel label="Academic Tools" />
          {academicLinks.map(link => <NavLink key={link.path} link={link} />)}

          <SectionLabel label="Account" />
          {accountLinks.map(link => <NavLink key={link.path} link={link} />)}
        </nav>

        {/* ── FOOTER: Theme + Logout ── */}
        <div className="p-3 border-t border-[var(--border)] space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl transition-all font-semibold text-sm text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--fog)]"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[var(--blue)]" /> : <Moon className="w-4 h-4 text-[var(--blue)]" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl transition-all font-semibold text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
