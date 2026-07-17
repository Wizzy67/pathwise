import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const SavedCareers = () => {
  const [savedCareers, setSavedCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();
  const { addNotification } = useNotification();
  const addNotificationRef = useRef(addNotification);
  addNotificationRef.current = addNotification;

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      try {
        const res = await api.get('/data/careers');
        const saved = res.data.filter(c => user?.savedCareers?.includes(c.id));
        setSavedCareers(saved);
      } catch (error) {
        addNotificationRef.current('Failed to load saved careers.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.savedCareers?.join(',')]);

  const handleRemove = async (id) => {
    try {
      const res = await api.delete(`/users/save-career/${id}`);
      const updatedSaved = res.data.savedCareers || [];
      setUser(prev => ({ ...prev, savedCareers: updatedSaved }));
      setSavedCareers(prev => prev.filter(c => c.id !== id));
      addNotification('Career removed from saved list.', 'success');
    } catch (error) {
      addNotification('Failed to remove career.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-pw-azure/10 flex items-center justify-center border border-pw-azure/20">
          <Bookmark className="w-6 h-6 text-pw-azure" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-pw-white">Saved Careers</h1>
          <p className="text-pw-gray">Your shortlisted career paths and roadmaps.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pw-blue" /></div>
      ) : savedCareers.length === 0 ? (
        <div className="bg-pw-surface border border-dashed border-pw-white/10 rounded-2xl p-12 text-center">
          <Bookmark className="w-12 h-12 text-pw-gray mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-pw-white mb-2">No saved careers yet</h3>
          <p className="text-pw-gray mb-6 max-w-md mx-auto">Take the career assessment or explore the directory to find and save careers that match your profile.</p>
          <Link to="/explore" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pw-blue text-white font-bold hover:bg-pw-azure transition-colors">
            Explore Careers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedCareers.map(career => (
            <div key={career.id} className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6 flex flex-col group hover:border-pw-azure/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-pw-white">{career.title}</h3>
                <button 
                  onClick={() => handleRemove(career.id)}
                  className="p-2 text-pw-gray hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-pw-gray mb-6 flex-1 line-clamp-2">{career.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-pw-black border border-pw-white/5 rounded-lg text-xs font-bold text-pw-gray">{career.demand} Demand</span>
                <span className="px-3 py-1 bg-pw-black border border-pw-white/5 rounded-lg text-xs font-bold text-pw-gray">{career.salary_range}</span>
              </div>
              <div className="pt-4 border-t border-pw-white/5 flex justify-between items-center">
                <span className="text-xs text-pw-gray">Target CGPA: <strong className="text-pw-blue">{career.required_cgpa_hint}</strong></span>
                <Link to={`/career/${career.id}`} className="flex items-center gap-2 text-pw-azure font-bold hover:text-pw-blue transition-colors">
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCareers;
