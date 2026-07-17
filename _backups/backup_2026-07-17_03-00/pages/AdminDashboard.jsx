import { useState, useEffect } from 'react';
import { Users, BookOpen, Database, Settings, ShieldCheck, Search, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, careers: 0, courses: 0, questions: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats')
        ]);
        setUsers(usersRes.data);
        setStats(statsRes.data);
      } catch (error) {
        addNotification('Failed to load admin dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [addNotification]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-pw-azure/10 flex items-center justify-center border border-pw-azure/30">
          <ShieldCheck className="w-8 h-8 text-pw-azure" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-pw-white">Admin Dashboard</h1>
          <p className="text-pw-gray">Welcome, {user?.username}. System status and analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-pw-gray font-medium">Total Students</h3>
            <Users className="w-5 h-5 text-pw-azure" />
          </div>
          <p className="text-3xl font-bold text-pw-white">{loading ? '-' : stats.users}</p>
        </div>
        
        <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-pw-gray font-medium">Career Profiles</h3>
            <BookOpen className="w-5 h-5 text-pw-blue" />
          </div>
          <p className="text-3xl font-bold text-pw-white">{loading ? '-' : stats.careers}</p>
        </div>

        <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-pw-gray font-medium">Course Data</h3>
            <Database className="w-5 h-5 text-pw-azure" />
          </div>
          <p className="text-3xl font-bold text-pw-white">{loading ? '-' : stats.courses}</p>
        </div>

        <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-pw-gray font-medium">Questions</h3>
            <Settings className="w-5 h-5 text-pw-blue" />
          </div>
          <p className="text-3xl font-bold text-pw-white">{loading ? '-' : stats.questions}</p>
        </div>
      </div>

      <div className="bg-pw-surface border border-pw-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-pw-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-xl font-bold text-pw-white">Recent Students</h2>
          <div className="relative">
            <input type="text" placeholder="Search students..." className="bg-pw-black border border-pw-white/10 text-pw-white text-sm rounded-xl pl-10 p-2.5 focus:ring-2 focus:ring-pw-blue focus:border-transparent w-full sm:w-64" />
            <Search className="w-4 h-4 text-pw-gray absolute left-3 top-3" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-pw-gray">
            <thead className="text-xs uppercase bg-pw-black border-b border-pw-white/5">
              <tr>
                <th className="px-6 py-4 font-medium text-pw-white">Name</th>
                <th className="px-6 py-4 font-medium text-pw-white">Matric No</th>
                <th className="px-6 py-4 font-medium text-pw-white">Department</th>
                <th className="px-6 py-4 font-medium text-pw-white">Level</th>
                <th className="px-6 py-4 font-medium text-pw-white">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-pw-azure mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">No students registered yet.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="bg-pw-surface border-b border-pw-white/5 hover:bg-pw-black transition-colors">
                    <td className="px-6 py-4 font-medium text-pw-white">{u.fullName}</td>
                    <td className="px-6 py-4">{u.matricNo}</td>
                    <td className="px-6 py-4">{u.department}</td>
                    <td className="px-6 py-4">{u.level}</td>
                    <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
