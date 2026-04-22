import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Activity, Sun, Clock, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Sidebar from '../../components/shared/Sidebar';
import SeverityBadge from '../../components/shared/SeverityBadge';
import api from '../../lib/axios';

const TrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} 
          axisLine={false} tickLine={false} dy={10} fontSize={12} 
        />
        <YAxis axisLine={false} tickLine={false} fontSize={12} fill="#64748B" />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          labelFormatter={(v) => new Date(v).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}
        />
        <Line 
          type="monotone" 
          dataKey="score" 
          name="Score"
          stroke="var(--primary)" 
          strokeWidth={3} 
          dot={{r: 4, fill: 'var(--surface)', stroke: 'var(--primary)', strokeWidth: 2}} 
          activeDot={{r: 6, fill: 'var(--primary)'}}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const Assessments = () => {
  const [templates, setTemplates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [historyTab, setHistoryTab] = useState('PHQ-9');
  const [historyData, setHistoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Maps DB enum type to specific Lucide icons & color schemes
  const typeMap = {
    'PHQ-9': { icon: Brain, color: 'text-primary bg-primary/10' },
    'GAD-7': { icon: Activity, color: 'text-secondary bg-secondary/10' },
    'WELLNESS': { icon: Sun, color: 'text-warning bg-warning/10' }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [tmps, sum] = await Promise.all([
          api.get('/api/assessment/templates'),
          api.get('/api/assessment/summary')
        ]);
        setTemplates(tmps.data.data);
        setSummary(sum.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [hist, trnd] = await Promise.all([
          api.get(`/api/assessment/history/${historyTab}`),
          api.get(`/api/assessment/trends/${historyTab}`)
        ]);
        setHistoryData(hist.data.data);
        setTrendData(trnd.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, [historyTab]);

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const diff = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  };

  if (loading) return <div className="min-h-screen bg-bg flex pl-64 pt-20 justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="border-b border-border pb-4">
            <h1 className="text-3xl font-bold text-text mb-1">Assessments</h1>
            <p className="text-muted">Clinically validated tools to understand your mental health</p>
          </div>

          {/* ASSESSMENT CARDS */}
          <div className="grid md:grid-cols-3 gap-6">
            {templates.map(tmpl => {
              const Icon = typeMap[tmpl.type].icon;
              const result = summary?.[tmpl.type];

              return (
                <div key={tmpl.type} className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex flex-col group hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${typeMap[tmpl.type].color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {result ? (
                      <div className="text-right">
                        <div className="text-xs text-muted font-medium mb-1">{formatDate(result.takenAt)}</div>
                        <SeverityBadge severity={result.severity} colorClass={result.severityColor} />
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 bg-bg border border-border rounded-lg text-xs font-semibold text-muted">
                        Not taken yet
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-lg font-bold text-text mb-1">{tmpl.name}</h2>
                  <p className="text-sm text-muted mb-4 flex-1 line-clamp-2">{tmpl.shortDescription}</p>
                  
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text bg-bg self-start px-2 py-1 rounded border border-border/50 mb-6">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated: {tmpl.estimatedMinutes} min
                  </div>
                  
                  <Link 
                    to={`/assessments/take/${tmpl.type.toLowerCase()}`}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl text-center hover:bg-primary/90 transition-colors"
                  >
                    Take Assessment
                  </Link>
                </div>
              );
            })}
          </div>

          {/* HISTORY SECTION */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                <History className="w-5 h-5 text-primary" /> Your History
              </h2>
              
              {/* TABS */}
              <div className="flex bg-bg p-1 rounded-lg border border-border/50">
                {templates.map(t => (
                  <button 
                    key={t.type}
                    onClick={() => setHistoryTab(t.type)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                      historyTab === t.type 
                        ? 'bg-white shadow text-primary border border-border/50' 
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    {t.type}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {historyData.length > 0 ? (
                <>
                  <div className="mb-10 w-full">
                    <h3 className="text-sm font-bold text-muted mb-6 uppercase tracking-wider">Score Trend</h3>
                    <TrendChart data={trendData} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-muted mb-4 uppercase tracking-wider">Recent Results</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border text-sm text-muted bg-bg/50">
                            <th className="py-3 px-4 font-semibold rounded-tl-lg">Date</th>
                            <th className="py-3 px-4 font-semibold">Score</th>
                            <th className="py-3 px-4 font-semibold">Severity</th>
                            <th className="py-3 px-4 font-semibold rounded-tr-lg">Time Taken</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {historyData.map(row => (
                            <tr key={row._id} className="hover:bg-bg/30 transition-colors">
                              <td className="py-4 px-4 text-sm font-medium">
                                {new Date(row.takenAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </td>
                              <td className="py-4 px-4 font-bold text-text">{row.totalScore}</td>
                              <td className="py-4 px-4">
                                <SeverityBadge severity={row.severity} colorClass={row.severityColor} />
                              </td>
                              <td className="py-4 px-4 text-sm text-muted">
                                {row.durationSeconds ? `${Math.floor(row.durationSeconds / 60)}m ${row.durationSeconds % 60}s` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                    <History className="w-8 h-8 text-muted/50" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-2">No history yet</h3>
                  <p className="text-muted max-w-sm mx-auto">
                    Take your first {historyTab} assessment above to start tracking your progress over time.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Assessments;
