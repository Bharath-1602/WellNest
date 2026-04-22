import { useState, useEffect } from 'react';
import { X, Search, FileText, CheckCircle, Brain, SmilePlus } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../lib/axios';
import SeverityBadge from '../../components/shared/SeverityBadge';

// --- Client Info Modal Overlay --- //
const ClientInfoModal = ({ userId, userName, sessionNotes, onSaveNotes, onClose }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Note fields
  const [observations, setObservations] = useState(sessionNotes?.observations || '');
  const [diagnosis, setDiagnosis] = useState(sessionNotes?.presentingIssues?.join(', ') || '');
  
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get(`/api/therapist/my/client/${userId}`);
        setInfo(res.data.data);
      } catch (error) {
        console.error("Failed to fetch client info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSaveNotes({ observations, presentingIssues: diagnosis.split(',').map(s=>s.trim()) });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface w-full max-w-4xl rounded-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        
        <div className="px-6 py-5 border-b border-border bg-accent text-white flex justify-between items-center">
          <h2 className="font-bold text-xl">{userName}'s Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 bg-bg">
          {/* LEFT: Client Data (Consent Gated) */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h3 className="font-bold text-accent text-lg flex items-center gap-2 border-b border-border pb-2">
              <Search className="w-5 h-5 text-primary" /> Shared Data
            </h3>
            
            {loading ? (
              <div className="p-6 text-center text-muted">Loading data...</div>
            ) : info ? (
              <div className="space-y-6">
                
                {/* ASSESSMENTS */}
                <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
                  <h4 className="font-bold text-text mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-primary"/> Assessment Summary</h4>
                  {info.consent.shareAssessmentsWithTherapist && info.assessments ? (
                    <div className="space-y-4">
                      {Object.keys(info.assessments).length > 0 ? (
                        Object.entries(info.assessments).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border/50">
                            <div>
                               <div className="font-bold text-sm text-text">{key}</div>
                               <div className="text-xs text-muted mt-0.5">{new Date(val.takenAt).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                               <div className="text-lg font-black text-primary leading-none">{val.totalScore}</div>
                               <SeverityBadge severity={val.severity} colorClass={val.severityColor} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted italic">No assessments taken yet.</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-danger/5 border border-danger/20 rounded-xl text-danger text-sm font-medium text-center">
                      User has not consented to share clinical assessments.
                    </div>
                  )}
                </div>

                {/* MOOD */}
                <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
                  <h4 className="font-bold text-text mb-4 flex items-center gap-2"><SmilePlus className="w-4 h-4 text-secondary"/> Recent Mood</h4>
                  {info.consent.shareMoodWithTherapist && info.mood ? (
                    <div className="flex items-center gap-4 bg-bg p-4 rounded-xl border border-border/50">
                      <div className="text-4xl">{info.mood.moodEmoji}</div>
                      <div>
                        <div className="font-bold text-text mb-1">Score: {info.mood.moodScore}/10</div>
                        <div className="text-sm text-muted capitalize">Emotions: {info.mood.emotions?.join(', ') || 'none'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-danger/5 border border-danger/20 rounded-xl text-danger text-sm font-medium text-center">
                      User has not consented to share mood logs.
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-6 text-center text-muted">Failed to load data.</div>
            )}
          </div>

          <div className="hidden lg:block w-px bg-border my-2 block"></div>

          {/* RIGHT: Session Notes */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h3 className="font-bold text-accent text-lg flex items-center gap-2 border-b border-border pb-2 mb-6">
              <FileText className="w-5 h-5 text-secondary" /> Clinical Notes
            </h3>
            
            <form onSubmit={handleSave} className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-bold text-text mb-1">Presenting Issues / Tags</label>
                  <input 
                    type="text" 
                    value={diagnosis} 
                    onChange={e => setDiagnosis(e.target.value)} 
                    placeholder="e.g. generalized anxiety, conflict resolution"
                    className="w-full p-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex-1 flex flex-col h-full min-h-[300px]">
                  <label className="block text-sm font-bold text-text mb-1">Session Observations</label>
                  <textarea 
                    value={observations} 
                    onChange={e => setObservations(e.target.value)} 
                    placeholder="Write clinical notes here..."
                    className="w-full flex-1 p-4 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary/20 resize-none font-sans text-sm block"
                  />
                  <p className="text-xs text-muted mt-2">These notes are strictly private and never shared with the user.</p>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="mt-6 w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle className="w-5 h-5"/> Save Notes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page --- //
const TherapistSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionForNotes, setSelectedSessionForNotes] = useState(null);
  const [sessionNotesCache, setSessionNotesCache] = useState({});

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/therapist/my/sessions');
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

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      if (newStatus === 'confirmed') await api.patch(`/api/therapist/sessions/${sessionId}/confirm`);
      if (newStatus === 'completed') await api.patch(`/api/therapist/sessions/${sessionId}/complete`);
      if (newStatus === 'cancelled') await api.patch(`/api/therapist/sessions/${sessionId}/cancel`, { reason: 'Therapist cancelled' });
      fetchSessions();
    } catch (err) {
      alert('Failed to update session status');
    }
  };

  const handleOpenNotes = async (session) => {
    if (!sessionNotesCache[session._id]) {
      try {
        const res = await api.get(`/api/therapist/sessions/${session._id}/notes`);
        if (res.data.data) {
           setSessionNotesCache(prev => ({...prev, [session._id]: res.data.data}));
        }
      } catch (err) {
        // No notes yet
      }
    }
    setSelectedSessionForNotes(session);
  };

  const saveNotes = async (notesData) => {
    try {
      const res = await api.post(`/api/therapist/sessions/${selectedSessionForNotes._id}/notes`, notesData);
      setSessionNotesCache(prev => ({...prev, [selectedSessionForNotes._id]: res.data.data}));
      setSelectedSessionForNotes(null);
    } catch (err) {
      alert('Failed to save notes');
    }
  };

  const statusStyles = {
    'pending': 'bg-warning/10 text-warning border-warning/20',
    'confirmed': 'bg-success/10 text-success border-success/20',
    'completed': 'bg-primary/10 text-primary border-primary/20',
    'cancelled': 'bg-danger/10 text-danger border-danger/20',
  };

  if (loading) return <div className="min-h-screen bg-bg flex pl-64 pt-20 justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="border-b border-border pb-4">
            <h1 className="text-3xl font-bold text-text mb-1">Session Management</h1>
            <p className="text-muted">Review, confirm, and take notes for your client appointments.</p>
          </div>

          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg text-sm font-bold text-muted border-b border-border uppercase tracking-wider">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessions.map(s => (
                  <tr key={s._id} className="hover:bg-bg/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-text">{new Date(s.scheduledDate).toLocaleDateString()}</div>
                      <div className="text-xs font-semibold text-muted bg-border/50 px-2 py-0.5 rounded inline-block mt-1">
                        {s.scheduledTime} ({s.mode})
                      </div>
                    </td>
                    <td className="p-4 font-bold text-accent">{s.userName}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${statusStyles[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {s.status === 'pending' && (
                          <>
                            <button onClick={()=>handleStatusChange(s._id, 'confirmed')} className="px-3 py-1.5 bg-success text-white text-xs font-bold rounded hover:bg-success/90">Confirm</button>
                            <button onClick={()=>handleStatusChange(s._id, 'cancelled')} className="px-3 py-1.5 border border-danger/30 text-danger text-xs font-bold rounded hover:bg-danger/10">Deny</button>
                          </>
                        )}
                        {s.status === 'confirmed' && (
                           <>
                              <button onClick={() => handleOpenNotes(s)} className="px-3 py-1.5 bg-secondary text-white text-xs font-bold rounded hover:bg-secondary/90">View Client / Notes</button>
                              <button onClick={()=>handleStatusChange(s._id, 'completed')} className="px-3 py-1.5 border border-primary text-primary text-xs font-bold rounded hover:bg-primary/5">Mark Complete</button>
                           </>
                        )}
                        {['completed', 'cancelled'].includes(s.status) && (
                           <button onClick={() => handleOpenNotes(s)} className="px-3 py-1.5 border border-border bg-surface text-text text-xs font-bold rounded hover:bg-bg shadow-sm">View Notes</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sessions.length === 0 && (
              <div className="p-10 text-center text-muted">No sessions generated yet.</div>
            )}
          </div>
        </div>
      </main>

      {selectedSessionForNotes && (
        <ClientInfoModal 
          userId={selectedSessionForNotes.userId}
          userName={selectedSessionForNotes.userName}
          sessionNotes={sessionNotesCache[selectedSessionForNotes._id]}
          onSaveNotes={saveNotes}
          onClose={() => setSelectedSessionForNotes(null)}
        />
      )}
    </div>
  );
};

export default TherapistSessions;
