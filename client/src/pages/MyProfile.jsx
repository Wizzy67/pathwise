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
    <div className="max-w-4xl mx-auto w-full pb-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-pw-white">My Profile</h1>
        <p className="text-pw-gray mt-2">Manage your academic details and personal information.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile Banner Card */}
        <div className="bg-pw-surface border border-pw-white/10 rounded-3xl overflow-hidden relative shadow-lg">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-pw-blue/20 to-pw-azure/10 relative">
            {/* Ambient decoration */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-pw-blue/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          <div className="px-6 sm:px-10 pb-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 sm:-mt-16 mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-pw-blue to-pw-azure flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl border-4 border-pw-surface shrink-0 relative">
                {formData.fullName.charAt(0).toUpperCase() || 'U'}
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-pw-surface rounded-full"></div>
              </div>
              
              <div className="flex-1 pb-2 text-center sm:text-left mt-2 sm:mt-0">
                <h2 className="text-2xl font-black text-pw-white tracking-tight">{formData.fullName || 'Student'}</h2>
                <p className="text-pw-blue font-bold text-sm mt-1 bg-pw-blue/10 w-fit px-3 py-1 rounded-full mx-auto sm:mx-0">
                  {user?.matricNo || 'N/A'}
                </p>
              </div>
              
              <div className="pb-2 w-full sm:w-auto mt-4 sm:mt-0">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-pw-blue text-white font-bold hover:bg-pw-azure transition-all shadow-[0_4px_20px_rgba(0,86,255,0.3)] hover:shadow-[0_6px_25px_rgba(0,86,255,0.4)] disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Personal Info Card */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md hover:border-pw-white/20 transition-all">
            <div className="flex items-center gap-4 border-b border-pw-white/5 pb-5">
              <div className="w-12 h-12 rounded-xl bg-pw-blue/10 flex items-center justify-center text-pw-blue border border-pw-blue/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-pw-white">Personal Info</h3>
                <p className="text-xs text-pw-gray mt-0.5">Your basic identity details.</p>
              </div>
            </div>
            
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-pw-gray ml-1">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  className="w-full bg-pw-black/40 border border-pw-white/10 text-pw-white rounded-xl p-3.5 focus:ring-2 focus:ring-pw-blue focus:border-transparent transition-all placeholder-pw-gray/50" 
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-pw-gray ml-1 flex items-center justify-between">
                  <span>Matric Number</span>
                  <span className="text-pw-blue/50 text-[10px] normal-case tracking-normal font-medium bg-pw-blue/10 px-2 py-0.5 rounded-md">Read Only</span>
                </label>
                <input 
                  type="text" 
                  value={user?.matricNo || ''} 
                  disabled 
                  className="w-full bg-pw-surface2/50 border border-pw-white/5 text-pw-gray/70 rounded-xl p-3.5 cursor-not-allowed" 
                />
              </div>
            </div>
          </div>

          {/* Academic Details Card */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md hover:border-pw-white/20 transition-all">
            <div className="flex items-center gap-4 border-b border-pw-white/5 pb-5">
              <div className="w-12 h-12 rounded-xl bg-pw-blue/10 flex items-center justify-center text-pw-blue border border-pw-blue/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-pw-white">Academic Profile</h3>
                <p className="text-xs text-pw-gray mt-0.5">Used by the AI for roadmap context.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-pw-gray ml-1">Faculty</label>
                <input 
                  type="text" 
                  name="faculty" 
                  value={formData.faculty} 
                  onChange={handleChange} 
                  className="w-full bg-pw-black/40 border border-pw-white/10 text-pw-white rounded-xl p-3.5 focus:ring-2 focus:ring-pw-blue focus:border-transparent transition-all" 
                  placeholder="e.g. Science"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-pw-gray ml-1">Department</label>
                <input 
                  type="text" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  className="w-full bg-pw-black/40 border border-pw-white/10 text-pw-white rounded-xl p-3.5 focus:ring-2 focus:ring-pw-blue focus:border-transparent transition-all" 
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-pw-gray ml-1">Level</label>
                <div className="relative">
                  <select 
                    name="level" 
                    value={formData.level} 
                    onChange={handleChange} 
                    className="w-full bg-pw-black/40 border border-pw-white/10 text-pw-white rounded-xl p-3.5 pr-10 focus:ring-2 focus:ring-pw-blue focus:border-transparent appearance-none transition-all cursor-pointer"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                    <option value="Graduate">Graduate / NYSC</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-pw-gray">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-pw-gray ml-1">CGPA</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="5.0" 
                  name="cgpa" 
                  value={formData.cgpa} 
                  onChange={handleChange} 
                  className="w-full bg-pw-black/40 border border-pw-white/10 text-pw-white rounded-xl p-3.5 focus:ring-2 focus:ring-pw-blue focus:border-transparent transition-all" 
                  placeholder="e.g. 4.50"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;
