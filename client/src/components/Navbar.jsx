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
    <nav className="sticky top-0 z-50 bg-pw-black/90 backdrop-blur-xl border-b border-pw-white/5">
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
                    ? 'text-pw-blue'
                    : 'text-pw-gray hover:text-pw-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleLanguage} className="text-pw-gray hover:text-pw-white transition-colors p-2">
              <Globe className="w-5 h-5" />
            </button>
            <button onClick={toggleTheme} className="text-pw-gray hover:text-pw-white transition-colors p-2">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`text-pw-gray hover:text-pw-white transition-colors p-2 relative rounded-lg ${showNotifications ? 'bg-pw-white/5 text-pw-white' : ''}`}
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
                          className="absolute right-0 mt-2 w-80 bg-pw-surface border border-pw-white/10 rounded-2xl shadow-xl overflow-hidden z-50 p-1"
                        >
                          <div className="flex justify-between items-center p-3 border-b border-pw-white/5">
                            <span className="text-xs font-bold text-pw-white">Notifications ({unreadCount})</span>
                            {unreadCount > 0 && (
                              <button 
                                onClick={markAllAsRead}
                                className="text-[10px] text-pw-blue hover:underline font-semibold"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>

                          <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-pw-gray text-xs">
                                All caught up! 🎉
                              </div>
                            ) : (
                              <div className="divide-y divide-pw-white/5">
                                {notifications.map(n => (
                                  <div 
                                    key={n.id} 
                                    className={`p-3 text-xs leading-relaxed flex items-start gap-2.5 transition-colors group/item relative ${n.read ? 'text-pw-gray/70' : 'text-pw-white bg-pw-blue/5'}`}
                                  >
                                    {!n.read && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-pw-blue mt-1.5 shrink-0" />
                                    )}
                                    <div className="flex-1 cursor-pointer" onClick={() => toggleRead(n.id)}>
                                      <p>{n.text}</p>
                                      <span className="text-[10px] text-pw-gray/50 block mt-1">{n.time}</span>
                                    </div>
                                    <button 
                                      onClick={() => deleteNotif(n.id)}
                                      className="text-pw-gray hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-1"
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
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pw-blue to-pw-azure flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(0,86,255,0.3)]">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-pw-gray hover:text-red-400 transition-colors p-2">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-pw-white hover:text-pw-blue transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full bg-pw-blue text-white font-bold text-sm hover:bg-pw-azure transition-all shadow-[0_0_15px_rgba(0,86,255,0.35)] hover:shadow-[0_0_20px_rgba(0,86,255,0.5)]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-pw-white p-2"
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
            className="md:hidden bg-pw-surface border-b border-pw-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 ${location.pathname === link.path ? 'text-pw-blue' : 'text-pw-gray'}`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-pw-white/5 my-2" />
              {user ? (
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 font-medium">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 rounded-xl border border-pw-gray/30 text-center font-bold text-pw-white">Login</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="py-3 rounded-xl bg-pw-blue text-white text-center font-bold">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
