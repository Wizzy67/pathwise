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
    <div className="max-w-6xl mx-auto w-full pb-8" style={{ fontFamily: 'var(--font-body, "Open Sans")' }}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--lavender)] flex items-center justify-center border border-[var(--blue)]">
          <Bookmark className="w-6 h-6 text-[var(--azure)]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)]" style={{ fontFamily: 'var(--font-heading, "Nunito")' }}>Saved Careers</h1>
          <p className="text-[var(--graphite)]">Your shortlisted career paths and roadmaps.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--blue)]" /></div>
      ) : savedCareers.length === 0 ? (
        <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
          <Bookmark className="w-12 h-12 text-[var(--graphite)] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[var(--ink)] mb-2" style={{ fontFamily: 'var(--font-heading, "Nunito")' }}>No saved careers yet</h3>
          <p className="text-[var(--graphite)] mb-6 max-w-md mx-auto">Take the career assessment or explore the directory to find and save careers that match your profile.</p>
          <Link to="/explore" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--blue)] text-white font-bold hover:bg-[var(--azure)] transition-colors">
            Explore Careers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedCareers.map(career => (
            <div key={career.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col group hover:border-[var(--azure)] transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-heading, "Nunito")' }}>{career.title}</h3>
                <button 
                  onClick={() => handleRemove(career.id)}
                  className="p-2 text-[var(--graphite)] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[var(--graphite)] mb-6 flex-1 line-clamp-2">{career.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[var(--mist)] border border-[var(--border)] rounded-lg text-xs font-bold text-[var(--graphite)]">{career.demand} Demand</span>
                <span className="px-3 py-1 bg-[var(--mist)] border border-[var(--border)] rounded-lg text-xs font-bold text-[var(--graphite)]">{career.salary_range}</span>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                <span className="text-xs text-[var(--graphite)]">Target CGPA: <strong className="text-[var(--blue)]">{career.required_cgpa_hint}</strong></span>
                <Link to={`/career/${career.id}`} className="flex items-center gap-2 text-[var(--azure)] font-bold hover:text-[var(--blue)] transition-colors">
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
