import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, Target, Brain, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      matchExact: true
    },
    {
      label: 'Explore',
      path: '/explore',
      icon: Compass,
      matchExact: false,
      extraPaths: ['/career']
    },
    {
      label: 'Assessment',
      path: '/quiz',
      icon: Target,
      matchExact: true,
      extraPaths: ['/results-analysis']
    },
    {
      label: 'AI Advisor',
      path: '/advisor',
      icon: Brain,
      matchExact: true
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: User,
      matchExact: false,
      extraPaths: ['/saved', '/activity']
    },
  ];

  const isItemActive = (item) => {
    if (item.matchExact && location.pathname === item.path) return true;
    if (!item.matchExact && location.pathname.startsWith(item.path)) return true;
    if (item.extraPaths?.some(p => location.pathname.startsWith(p))) return true;
    return false;
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] select-none backdrop-blur-lg bg-opacity-95"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center py-1 relative group touch-manipulation active:scale-95 transition-transform"
            >
              {/* Icon Container with subtle active pill */}
              <div
                className={`relative px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  active
                    ? 'bg-[var(--lavender)] text-[var(--blue)]'
                    : 'text-[var(--graphite)] group-hover:text-[var(--ink)]'
                }`}
              >
                <Icon
                  className="w-5 h-5 transition-transform duration-200"
                  strokeWidth={active ? 2.3 : 1.8}
                />
                {active && (
                  <motion.span
                    layoutId="mobileNavIndicator"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--blue)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors duration-200 ${
                  active
                    ? 'font-bold text-[var(--blue)]'
                    : 'font-medium text-[var(--graphite)] group-hover:text-[var(--ink)]'
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;