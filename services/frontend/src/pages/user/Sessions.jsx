import { useState, useEffect } from 'react';
import { Calendar as CalIcon, Clock, MapPin, Video, Phone, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../lib/axios';

const CancelModal = ({ session, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onConfirm(session._id, reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 bg-danger/10 border-b border-danger/20 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-danger mb-4" />
          <h2 className="text-xl font-bold text-danger">Cancel Session</h2>
          <p className="text-danger/80 text-sm mt-1">Are you sure you want to cancel this session?</p>
        </div>
        
        <div className="p-6">
          <div className="bg-bg rounded-xl p-4 mb-6 border border-border">
             <div className="flex justify-between items-center text-sm font-bold text-text mb-2">
               <span>{session.therapistName}</span>
               <span>{new Date(session.scheduledDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
             </div>
             <div className="text-xs text-muted">Time: {session.scheduledTime}</div>
          </div>

          <label className="block text-sm font-bold text-text mb-2">Reason (Optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-4 rounded-xl border border-border bg-bg focus:ring-2 focus:ring-primary/20 resize-none h-24 mb-6"
            placeholder="Brief reason for cancellation..."
          ></textarea>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border font-bold text-text hover:bg-bg transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-danger text-white font-bold hover:bg-danger/90 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Confirm Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/therapist/sessions/my');
      setSessions(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCancelConfirm = async (id, reason) => {
    try {
      await api.patch(`/api/therapist/sessions/${id}/cancel`, { reason });
      setCancelTarget(null);
      fetchSessions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel session');
    }
  };

  const statusStyles = {
    'pending': 'bg-warning/10 text-warning border-warning/20',
    'confirmed': 'bg-success/10 text-success border-success/20',
    'completed': 'bg-primary/10 text-primary border-primary/20',
    'cancelled': 'bg-danger/10 text-danger border-danger/20 hover:line-through',
  };

  const modeIcons = {
    'video': Video,
    'audio': Phone,
    'chat': MessageSquare,
    'in-person': MapPin
  };

  if (loading) return <div className="min-h-screen bg-bg flex pl-64 pt-20 justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-text mb-1">My Sessions</h1>
              <p className="text-muted">Manage your upcoming and past therapy appointments</p>
            </div>
          </div>

          <div className="grid gap-6">
            {sessions.length === 0 ? (
              <div className="bg-surface rounded-2xl p-12 border border-border text-center">
                 <CalIcon className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                 <h3 className="text-xl font-bold text-text mb-2">No sessions found</h3>
                 <p className="text-muted">You haven't booked any therapy sessions yet.</p>
              </div>
            ) : (
              sessions.map(s => {
                const ModeIcon = modeIcons[s.mode] || Video;
                const isUpcoming = ['pending', 'confirmed'].includes(s.status);
                
                return (
                  <div key={s._id} className={`bg-surface rounded-2xl p-6 border ${isUpcoming ? 'border-primary/20 shadow-md' : 'border-border shadow-sm'} flex flex-col md:flex-row justify-between items-center gap-6 transition-all`}>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="w-16 h-16 bg-accent rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-inner">
                        <span className="text-xs font-bold uppercase tracking-widest leading-none mb-1">
                          {new Date(s.scheduledDate).toLocaleDateString('en-US', {month: 'short'})}
                        </span>
                        <span className="text-2xl font-black leading-none">
                          {new Date(s.scheduledDate).getDate()}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-lg font-bold text-text">{s.therapistName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${statusStyles[s.status]}`}>
                            {s.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted font-medium">
                          <div className="flex items-center gap-1.5 bg-bg px-2 py-1 rounded border border-border">
                            <Clock className="w-3.5 h-3.5" />
                            {s.scheduledTime}
                          </div>
                          <div className="flex items-center gap-1.5 bg-bg px-2 py-1 rounded border border-border capitalize">
                            <ModeIcon className="w-3.5 h-3.5" />
                            {s.mode}
                          </div>
                          <div className="flex items-center gap-1.5 bg-bg px-2 py-1 rounded border border-border text-primary font-bold">
                            ₹{s.sessionFee || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-end gap-3 border-t border-border pt-4 md:border-0 md:pt-0">
                      {s.status === 'confirmed' && (
                        <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm">
                          Join Call
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(s.status) && (
                        <button 
                          onClick={() => setCancelTarget(s)}
                          className="px-5 py-2.5 border border-danger/30 text-danger font-bold rounded-xl hover:bg-danger/10 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
        </div>
      </main>

      {cancelTarget && (
        <CancelModal 
          session={cancelTarget} 
          onClose={() => setCancelTarget(null)} 
          onConfirm={handleCancelConfirm} 
        />
      )}
    </div>
  );
};

export default Sessions;
