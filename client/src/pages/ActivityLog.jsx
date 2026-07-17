import { useState, useEffect } from 'react';
import { History, Clock, Brain, Target, User, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';

const ActionIcon = ({ action }) => {
  switch (action) {
    case 'login': return <User className="w-4 h-4 text-pw-blue" />;
    case 'quiz_taken': return <Target className="w-4 h-4 text-pw-blue" />;
    case 'career_saved': return <Brain className="w-4 h-4 text-pw-azure" />;
    case 'ai_chat': return <Sparkles className="w-4 h-4 text-pw-azure" />;
    default: return <Clock className="w-4 h-4 text-pw-gray" />;
  }
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/users/activity');
        setLogs(res.data);
      } catch (error) {
        console.error("Failed to load activity logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-pw-gray/10 flex items-center justify-center border border-pw-white/10">
          <History className="w-6 h-6 text-pw-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-pw-white">Activity Log</h1>
          <p className="text-pw-gray">Track your engagement and history on PathWise.</p>
        </div>
      </div>

      <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-pw-blue" /></div>
        ) : logs.length === 0 ? (
          <p className="text-center text-pw-gray py-10">No recent activity found.</p>
        ) : (
          <div className="relative border-l border-pw-white/10 ml-4 space-y-8 pb-4">
            {logs.map((log, idx) => (
              <div key={log.id} className="relative pl-8">
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-pw-black border-2 border-pw-white/10 flex items-center justify-center z-10">
                  <ActionIcon action={log.action} />
                </div>
                <div className="bg-pw-black border border-pw-white/10 rounded-2xl p-4 hover:border-pw-white/20 transition-colors">
                  <h4 className="text-sm font-bold text-pw-white capitalize mb-1">
                    {log.action === 'quiz_completed' ? 'assessment completed' : log.action.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-pw-gray mb-2">
                    {log.details || 'Performed action on the platform.'}
                  </p>
                  <p className="text-xs text-pw-muted font-medium">
                    {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
