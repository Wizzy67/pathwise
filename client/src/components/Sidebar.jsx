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
  Calculator
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const links = [
    { name: 'Dashboard',        path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Careers',  path: '/explore',   icon: Compass },
    { name: 'Career Assessment',path: '/quiz',       icon: Target },
    { name: 'Results Analysis', path: '/results-analysis', icon: Calculator },
    { name: 'AI Advisor',       path: '/advisor',   icon: Brain },
    { name: 'Saved Careers',    path: '/saved',     icon: Bookmark },
    { name: 'Activity Log',     path: '/activity',  icon: History },
    { name: 'My Profile',       path: '/profile',   icon: User },
  ];

  const displayName = user?.fullName || 'Student';
  const initial = displayName.charAt(0).toUpperCase();

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
      <aside className="w-64 hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto body-font">
        {/* User chip */}
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0 bg-[var(--blue)]">
              {initial}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-[var(--ink)] heading-font truncate">{user?.fullName || 'Student'}</h3>
              <p className="text-xs truncate text-[var(--graphite)]">{user?.matricNo || 'No Matric'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm relative"
                style={isActive ? {
                  background: 'var(--lavender)',
                  color: 'var(--blue)',
                } : {
                  color: 'var(--graphite)',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--fog)'; e.currentTarget.style.color = 'var(--ink)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--graphite)'; } }}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[var(--blue)]" />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? 'var(--blue)' : 'inherit' }} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle & Logout */}
        <div className="p-4 border-t border-[var(--border)] space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-xl transition-all font-medium text-sm text-[var(--graphite)] hover:text-[var(--ink)] hover:bg-[var(--fog)]"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[var(--blue)]" /> : <Moon className="w-4 h-4 text-[var(--blue)]" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-xl transition-all font-medium text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
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
