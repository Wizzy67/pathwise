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
    <aside className="w-64 hidden lg:flex flex-col border-r border-pw-white/5 bg-pw-surface h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">

      {/* User chip */}
      <div className="p-5 border-b border-pw-white/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0056FF, #2277FF)', boxShadow: '0 0 18px rgba(0,86,255,0.4)' }}>
            {initial}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-pw-white truncate">{user?.fullName || 'Student'}</h3>
            <p className="text-xs truncate text-pw-gray">{user?.matricNo || 'No Matric'}</p>
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
                background: 'rgba(0,86,255,0.08)',
                color: 'var(--blue)',
              } : {
                color: 'var(--gray)',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(0,86,255,0.04)'; e.currentTarget.style.color = 'var(--white)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray)'; } }}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #0056FF, #2277FF)' }} />
              )}
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#2277FF' : 'inherit' }} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & Logout */}
      <div className="p-4 border-t border-pw-white/5 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-xl transition-all font-medium text-sm text-pw-gray hover:text-pw-white hover:bg-pw-blue/5"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-pw-blue" /> : <Moon className="w-4 h-4 text-pw-blue" />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-xl transition-all font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-400/8"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
