import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const location = useLocation();
  const isAdvisor = location.pathname === '/advisor';

  return (
    <div className="flex w-full">
      <Sidebar />
      <div className={`flex-1 w-full max-w-full lg:max-w-[calc(100%-16rem)] min-h-[calc(100vh-4rem)] bg-pw-black ${isAdvisor ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
