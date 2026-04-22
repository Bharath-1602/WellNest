import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Need to use Auth service for admin viewing therapists
      const thRes = await api.get('/api/auth/internal/therapists'); 
      setTherapists(thRes.data.data || []);
      
      // Assume a stats endpoint exists (we created one in therapist service)
      const stRes = await api.get('/api/therapist/admin/stats');
      setStats(stRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.patch(`/api/auth/admin/verify-therapist/${id}`, { isVerified: status });
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-bg flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-accent text-white p-4 flex justify-between items-center sticky top-0 shadow-md z-10">
        <div className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="w-6 h-6 text-secondary" />
          WellNest Admin Portal
        </div>
        <button onClick={handleLogout} className="px-4 py-2 border border-white/20 hover:bg-white/10 rounded font-medium transition-colors">
          Log Out
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* STATS */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow border border-border">
            <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Total System Sessions</div>
            <div className="text-4xl font-black text-primary">{stats?.totalSessions || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-border">
            <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Completed This Month</div>
            <div className="text-4xl font-black text-secondary">{stats?.completedThisMonth || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-border">
            <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Pending Verification</div>
            <div className="text-4xl font-black text-warning">
              {therapists.filter(t => !t.isVerified).length}
            </div>
          </div>
        </div>

        {/* VERIFICATION QUEUE */}
        <div className="bg-white rounded-2xl shadow border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-bg/50">
            <h2 className="text-xl font-bold text-accent">Therapist Directory Management</h2>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-sm text-muted bg-surface uppercase tracking-wider">
                <th className="p-4 font-bold">Name & Email</th>
                <th className="p-4 font-bold">License</th>
                <th className="p-4 font-bold">Speciality</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {therapists.map(t => (
                <tr key={t._id} className="hover:bg-bg/20 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-text">{t.name}</div>
                    <div className="text-xs text-muted">{t.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-sm bg-bg px-2 py-1 rounded inline-block">
                      {t.therapistProfile?.licenseNumber}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm truncate max-w-[200px]">
                      {t.therapistProfile?.specializations?.join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td className="p-4">
                    {t.isVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-3 py-1 rounded-full w-max border border-success/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-warning bg-warning/10 px-3 py-1 rounded-full w-max border border-warning/20">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!t.isVerified ? (
                      <button 
                        onClick={() => handleVerify(t._id, true)}
                        className="px-4 py-2 bg-success text-white text-xs font-bold rounded-lg shadow hover:bg-success/90"
                      >
                        Approve License
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleVerify(t._id, false)}
                        className="px-4 py-2 border border-danger/30 text-danger text-xs font-bold rounded-lg hover:bg-danger/5"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {therapists.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-muted">No therapists registered.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
      </main>
    </div>
  );
};

export default AdminDashboard;
