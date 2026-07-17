import { useState, useEffect } from 'react';
import { User, Mail, BookOpen, GraduationCap, Calculator, Loader2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { setCache } from '../services/db';

// Update user details and persist changes to the database
const MyProfile = () => {
  const { user, setUser } = useAuth();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    faculty: user?.faculty || '',
    department: user?.department || '',
    level: user?.level || '100',
    cgpa: user?.cgpa || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        faculty: user.faculty || '',
        department: user.department || '',
        level: user.level || '100',
        cgpa: user.cgpa ?? ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const name = formData.fullName.trim();
    const fac = formData.faculty.trim();
    const dept = formData.department.trim();
    
    if (!name || !fac || !dept) {
      addNotification('Please fill all fields properly.', 'error');
      return;
    }

    if (formData.cgpa !== '') {
      const parsedCgpa = parseFloat(formData.cgpa);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 5) {
        addNotification('CGPA must be between 0.00 and 5.00.', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await api.put('/users/profile', {
        fullName: name,
        faculty: fac,
        department: dept,
        level: formData.level,
        cgpa: formData.cgpa === '' ? null : parseFloat(formData.cgpa)
      });
      if (res.data) {
        setUser(res.data);
        await setCache('userProfile', res.data);
        addNotification('Profile updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      addNotification(err.response?.data?.error || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-pw-blue/10 flex items-center justify-center border border-pw-blue/20">
          <User className="w-6 h-6 text-pw-azure" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-pw-white">My Profile</h1>
          <p className="text-pw-gray">Manage your academic details and personal information.</p>
        </div>
      </div>

      <div className="bg-pw-surface border border-pw-white/10 rounded-3xl p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pw-blue to-pw-azure flex items-center justify-center text-4xl font-bold text-white shadow-lg shrink-0">
              {formData.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-pw-gray">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  className="w-full bg-pw-black border border-pw-white/10 text-pw-white rounded-xl p-3 focus:ring-2 focus:ring-pw-blue focus:border-transparent" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-pw-gray">Matric Number (Read Only)</label>
                <input 
                  type="text" 
                  value={user?.matricNo || ''} 
                  disabled 
                  className="w-full bg-pw-black/50 border border-pw-white/5 text-pw-gray rounded-xl p-3 cursor-not-allowed" 
                />
              </div>
            </div>
          </div>

          <hr className="border-pw-white/5" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-pw-gray flex items-center gap-2"><BookOpen className="w-4 h-4" /> Faculty</label>
              <input 
                type="text" 
                name="faculty" 
                value={formData.faculty} 
                onChange={handleChange} 
                className="w-full bg-pw-black border border-pw-white/10 text-pw-white rounded-xl p-3 focus:ring-2 focus:ring-pw-blue focus:border-transparent" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pw-gray">Department</label>
              <input 
                type="text" 
                name="department" 
                value={formData.department} 
                onChange={handleChange} 
                className="w-full bg-pw-black border border-pw-white/10 text-pw-white rounded-xl p-3 focus:ring-2 focus:ring-pw-blue focus:border-transparent" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pw-gray flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Level</label>
              <select 
                name="level" 
                value={formData.level} 
                onChange={handleChange} 
                className="w-full bg-pw-black border border-pw-white/10 text-pw-white rounded-xl p-3 focus:ring-2 focus:ring-pw-blue focus:border-transparent appearance-none"
              >
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="Graduate">Graduate / NYSC</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pw-gray flex items-center gap-2"><Calculator className="w-4 h-4" /> CGPA</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                max="5.0" 
                name="cgpa" 
                value={formData.cgpa} 
                onChange={handleChange} 
                className="w-full bg-pw-black border border-pw-white/10 text-pw-white rounded-xl p-3 focus:ring-2 focus:ring-pw-blue focus:border-transparent" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pw-blue text-white font-bold hover:bg-pw-azure transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
