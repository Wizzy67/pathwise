import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pw-black">
        <div className="w-12 h-12 border-4 border-white/10 border-t-pw-azure rounded-full animate-spin"></div>
      </div>
    );
  }

  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/secure-admin-access" replace />;
};

export default AdminRoute;
