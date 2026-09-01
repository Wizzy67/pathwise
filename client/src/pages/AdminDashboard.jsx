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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8" style={{ fontFamily: 'var(--font-body, "Open Sans")' }}>
      
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--lavender)] flex items-center justify-center border border-[var(--border)]">
          <ShieldCheck className="w-8 h-8 text-[var(--azure)]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-heading, "Nunito")' }}>Admin Dashboard</h1>
          <p className="text-[var(--graphite)]">Welcome, {user?.username}. System status and analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[var(--graphite)] font-medium">Total Students</h3>
            <Users className="w-5 h-5 text-[var(--azure)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--ink)]">{loading ? '-' : stats.users}</p>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[var(--graphite)] font-medium">Career Profiles</h3>
            <BookOpen className="w-5 h-5 text-[var(--blue)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--ink)]">{loading ? '-' : stats.careers}</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[var(--graphite)] font-medium">Course Data</h3>
            <Database className="w-5 h-5 text-[var(--azure)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--ink)]">{loading ? '-' : stats.courses}</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[var(--graphite)] font-medium">Questions</h3>
            <Settings className="w-5 h-5 text-[var(--blue)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--ink)]">{loading ? '-' : stats.questions}</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-heading, "Nunito")' }}>Recent Students</h2>
          <div className="relative">
            <input type="text" placeholder="Search students..." className="bg-[var(--fog)] border border-[var(--border)] text-[var(--ink)] text-sm rounded-xl pl-10 p-2.5 focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent w-full sm:w-64" />
            <Search className="w-4 h-4 text-[var(--graphite)] absolute left-3 top-3" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[var(--graphite)]">
            <thead className="text-xs uppercase bg-[var(--mist)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 font-medium text-[var(--ink)]">Name</th>
                <th className="px-6 py-4 font-medium text-[var(--ink)]">Matric No</th>
                <th className="px-6 py-4 font-medium text-[var(--ink)]">Department</th>
                <th className="px-6 py-4 font-medium text-[var(--ink)]">Level</th>
                <th className="px-6 py-4 font-medium text-[var(--ink)]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--azure)] mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">No students registered yet.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="bg-[var(--surface)] border-b border-[var(--border)] hover:bg-[var(--mist)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--ink)]">{u.fullName}</td>
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
