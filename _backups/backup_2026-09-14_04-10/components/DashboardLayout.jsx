import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

const DashboardLayout = () => {
  const location = useLocation();
  const isAdvisor = location.pathname === '/advisor';

  return (
    <div className="flex w-full relative min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div
        className={`flex-1 min-w-0 bg-[var(--canvas)] ${
          isAdvisor
            ? 'p-0 pb-16 lg:pb-0'
            : 'p-4 sm:p-5 lg:p-8 pb-24 lg:pb-10'
        }`}
      >
        <Outlet />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
