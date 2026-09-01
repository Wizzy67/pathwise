import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Moon, Sun, Globe, Menu, X, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import PathWiseLogo from './PathWiseLogo';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('pathwise_notifs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: '🎓 Welcome to PathWise! Complete your profile to get started.', read: false, time: 'Just now' },
      { id: 2, text: '💡 Recommendation: Software Engineering matches your CGPA.', read: false, time: '2 hours ago' },
      { id: 3, text: '📅 DELSU Academic Calendar: First semester exam schedules updated.', read: true, time: '1 day ago' },
      { id: 4, text: '🚀 AI Advisor: New curriculum course advisory is now online.', read: true, time: '2 days ago' },
    ];
  });

  const saveNotifications = (newNotifs) => {
    setNotifications(newNotifs);
    localStorage.setItem('pathwise_notifs', JSON.stringify(newNotifs));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const toggleRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    saveNotifications(updated);
  };

  const deleteNotif = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const publicLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Advisor', path: '/advisor' },
  ];

  const desktopAuthedLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Explore', path: '/explore' },
    { name: 'Advisor', path: '/advisor' },
  ];

  const mobileAuthedLinks = [
    { name: 'Dashboard',         path: '/dashboard' },
    { name: 'Explore Careers',   path: '/explore' },
    { name: 'Career Assessment', path: '/quiz' },
    { name: 'Results Analysis',  path: '/results-analysis' },
    { name: 'AI Advisor',        path: '/advisor' },
    { name: 'Saved Careers',     path: '/saved' },
    { name: 'Activity Log',      path: '/activity' },
    { name: 'My Profile',        path: '/profile' }
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin' },
  ];

  const desktopNavLinks = user?.role === 'admin' ? adminLinks : user ? desktopAuthedLinks : publicLinks;
  const mobileNavLinks = user?.role === 'admin' ? adminLinks : user ? mobileAuthedLinks : publicLinks;

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
      <nav className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] body-font">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Logo */}
            <PathWiseLogo href={user ? '/dashboard' : '/'} size={32} />

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-[var(--blue)]'
                      : 'text-[var(--graphite)] hover:text-[var(--ink)]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={toggleLanguage} className="text-[var(--graphite)] hover:bg-[var(--fog)] hover:text-[var(--ink)] rounded-md transition-colors p-2">
                <Globe className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className="text-[var(--graphite)] hover:bg-[var(--fog)] hover:text-[var(--ink)] rounded-md transition-colors p-2">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`text-[var(--graphite)] hover:bg-[var(--fog)] hover:text-[var(--ink)] transition-colors p-2 relative rounded-lg ${showNotifications ? 'bg-[var(--fog)] text-[var(--ink)]' : ''}`}
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showNotifications && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg overflow-hidden z-50 p-1"
                          >
                            <div className="flex justify-between items-center p-3 border-b border-[var(--border)]">
                              <span className="text-xs font-bold text-[var(--ink)] heading-font">Notifications ({unreadCount})</span>
                              {unreadCount > 0 && (
                                <button 
                                  onClick={markAllAsRead}
                                  className="text-[10px] text-[var(--blue)] hover:underline font-semibold"
                                >
                                  Mark all as read
                                </button>
                              )}
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                              {notifications.length === 0 ? (
                                <div className="p-8 text-center text-[var(--ash)] text-xs">
                                  All caught up! 🎉
                                </div>
                              ) : (
                                <div className="divide-y divide-[var(--border)]">
                                  {notifications.map(n => (
                                    <div 
                                      key={n.id} 
                                      className={`p-3 text-xs leading-relaxed flex items-start gap-2.5 transition-colors group/item relative ${n.read ? 'text-[var(--graphite)]' : 'text-[var(--ink)] bg-[var(--lavender)]'}`}
                                    >
                                      {!n.read && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)] mt-1.5 shrink-0" />
                                      )}
                                      <div className="flex-1 cursor-pointer" onClick={() => toggleRead(n.id)}>
                                        <p>{n.text}</p>
                                        <span className="text-[10px] text-[var(--ash)] block mt-1">{n.time}</span>
                                      </div>
                                      <button 
                                        onClick={() => deleteNotif(n.id)}
                                        className="text-[var(--ash)] hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-1"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link to="/profile">
                    <div className="w-9 h-9 rounded-full bg-[var(--blue)] flex items-center justify-center text-white font-bold text-sm">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="text-[var(--graphite)] hover:bg-red-50 hover:text-red-500 rounded-md transition-colors p-2">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-[var(--ink)] hover:text-[var(--blue)] transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-full bg-[var(--blue)] text-white font-bold text-sm hover:bg-[var(--azure)] transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-[var(--ink)] p-2 hover:bg-[var(--fog)] rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[var(--surface)] border-b border-[var(--border)] overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-medium py-2 ${location.pathname === link.path ? 'text-[var(--blue)]' : 'text-[var(--graphite)] hover:text-[var(--ink)]'}`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px bg-[var(--border)] my-2" />
                {user ? (
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium py-2">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 rounded-xl border border-[var(--border)] text-center font-bold text-[var(--ink)] hover:bg-[var(--fog)]">Login</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="py-3 rounded-xl bg-[var(--blue)] text-white text-center font-bold hover:bg-[var(--azure)]">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
