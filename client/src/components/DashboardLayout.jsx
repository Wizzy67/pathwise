import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

const DashboardLayout = () => {
  const location = useLocation();
  const isAdvisor = location.pathname === '/advisor';

  return (
    <div className="flex w-full relative">
      <Sidebar />
      <div className={`flex-1 w-full max-w-full lg:max-w-[calc(100%-16rem)] min-h-[calc(100vh-4rem)] bg-[var(--canvas)] ${isAdvisor ? 'p-0 pb-16 lg:pb-0' : 'p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8'}`}>
        <Outlet />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
