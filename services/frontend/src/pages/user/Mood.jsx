import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SmilePlus, Save } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../lib/axios';

const Mood = () => {
  const location = useLocation();
  const presetScore = location.state?.presetScore || 5;

  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [moodScore, setMoodScore] = useState(presetScore);
  const [emotions, setEmotions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sleepHours, setSleepHours] = useState(7);
  const [journalNote, setJournalNote] = useState('');
  
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [activeTab, setActiveTab] = useState('week');
  const [loading, setLoading] = useState(true);

  const emotionList = ['anxious', 'hopeful', 'stressed', 'calm', 'grateful', 'sad', 'angry', 'excited', 'lonely', 'content', 'overwhelmed', 'peaceful'];
  const activityList = ['exercise', 'meditation', 'reading', 'social', 'work', 'therapy', 'nature-walk', 'creative', 'family-time', 'self-care'];

  const fetchHistory = async () => {
    try {
      const [wRes, mRes] = await Promise.all([
        api.get('/api/assessment/mood/week'),
        api.get('/api/assessment/mood/month')
      ]);
      setWeekData(wRes.data.data.reverse()); // old to new for recharts
      setMonthData(mRes.data.data.reverse());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await api.get('/api/assessment/mood/today');
        if (res.data.data) {
          const l = res.data.data;
          setHasLoggedToday(true);
          setMoodScore(l.moodScore);
          setEmotions(l.emotions || []);
          setActivities(l.activities || []);
          setSleepHours(l.sleepHours || 7);
          setJournalNote(l.journalNote || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchToday();
    fetchHistory();
  }, []);

  const getEmoji = (score) => {
    if (score <= 2) return '😔';
    if (score <= 4) return '😕';
    if (score <= 6) return '😐';
    if (score <= 8) return '🙂';
    return '😊';
  };

  const getLabel = (score) => {
    if (score <= 2) return 'Very Low';
    if (score <= 4) return 'Low';
    if (score <= 6) return 'Neutral';
    if (score <= 8) return 'Good';
    return 'Great';
  };

  const toggleArrayItem = (arr, setter, item) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleSubmit = async () => {
    const payload = { moodScore, emotions, activities, sleepHours, journalNote };
    try {
      if (hasLoggedToday && isEditMode) {
        await api.patch('/api/assessment/mood/today', payload);
        setIsEditMode(false);
      } else {
        await api.post('/api/assessment/mood', payload);
        setHasLoggedToday(true);
      }
      fetchHistory(); // Refresh charts
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save mood');
    }
  };

  if (loading) return <div className="min-h-screen bg-bg flex pl-64 pt-20 justify-center">Loading...</div>;

  const showForm = !hasLoggedToday || isEditMode;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-lg text-sm text-text">
          <p className="font-bold mb-1">{data.date}</p>
          {data.moodScore !== null ? (
            <p className="flex items-center gap-2">
              <span className="text-xl">{data.moodEmoji}</span>
              Score: <span className="font-bold text-primary">{data.moodScore}/10</span>
            </p>
          ) : (
            <p className="text-muted italic">No data</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="border-b border-border pb-4">
            <h1 className="text-3xl font-bold text-text mb-1">Mood Tracker</h1>
            <p className="text-muted">Understand your daily emotional patterns.</p>
          </div>

          {/* TOP SECTION: LOGGER OR SUMMARY */}
          {showForm ? (
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
              <h2 className="text-xl font-bold text-text mb-8">{isEditMode ? "Edit Today's Log" : "Log Today's Mood"}</h2>
              
              <div className="mb-10 text-center">
                <div className="text-7xl mb-4 transition-transform scale-110">{getEmoji(moodScore)}</div>
                <input 
                  type="range" min="1" max="10" 
                  className="w-full max-w-sm h-3 bg-bg rounded-lg appearance-none cursor-pointer accent-primary border border-border/50"
                  value={moodScore} onChange={(e) => setMoodScore(Number(e.target.value))}
                />
                <div className="mt-3 font-bold text-primary tracking-wide uppercase text-sm">
                  {getLabel(moodScore)} ({moodScore}/10)
                </div>
              </div>

              <div className="space-y-8 mb-8">
                <div>
                  <h3 className="font-bold text-text mb-4">How are you feeling?</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {emotionList.map(emp => (
                      <button key={emp} 
                        onClick={() => toggleArrayItem(emotions, setEmotions, emp)}
                        className={`px-4 py-2 rounded-full border transition-colors ${emotions.includes(emp) ? 'bg-primary border-primary text-white font-medium' : 'bg-surface border-border hover:bg-bg/50'}`}>
                        {emp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-text mb-4">What have you been doing?</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {activityList.map(act => (
                      <button key={act} 
                        onClick={() => toggleArrayItem(activities, setActivities, act)}
                        className={`px-4 py-2 rounded-full border transition-colors ${activities.includes(act) ? 'bg-secondary border-secondary text-white font-medium' : 'bg-surface border-border hover:bg-bg/50'}`}>
                        {act.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-bg/50 p-6 rounded-xl border border-border/30">
                  <h3 className="font-bold text-text">Sleep last night (hours)</h3>
                  <div className="flex items-center gap-4 bg-white rounded-lg border border-border px-2 py-1">
                    <button onClick={() => setSleepHours(Math.max(0, sleepHours - 1))} className="w-8 h-8 flex items-center justify-center text-text hover:bg-bg rounded-md text-xl font-bold bg-transparent border-none">-</button>
                    <span className="w-8 text-center font-bold text-primary text-lg">{sleepHours}</span>
                    <button onClick={() => setSleepHours(Math.min(24, sleepHours + 1))} className="w-8 h-8 flex items-center justify-center text-text hover:bg-bg rounded-md text-xl font-bold bg-transparent border-none">+</button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-text mb-2">Anything on your mind? (optional)</h3>
                  <textarea 
                    rows={3} maxLength={1000}
                    className="w-full p-4 rounded-xl border border-border bg-bg/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted/60"
                    placeholder="Jot down your thoughts, a highlight of the day, or something you are grateful for..."
                    value={journalNote} onChange={(e) => setJournalNote(e.target.value)}
                  />
                  <div className="text-right text-xs text-muted mt-1">{journalNote.length} / 1000</div>
                </div>
              </div>

              <div className="flex gap-4">
                {isEditMode && (
                  <button onClick={() => setIsEditMode(false)} className="px-6 py-4 rounded-xl border border-border text-text font-bold hover:bg-bg transition-colors">
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleSubmit} 
                  className="flex-1 py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save Today's Mood
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-primary/5 rounded-2xl shadow-sm border border-primary/20 p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white shadow-sm border border-border/50 rounded-full flex items-center justify-center text-5xl mb-4">
                {todayMood?.moodEmoji}
              </div>
              <h2 className="text-2xl font-bold text-text mb-2">Your mood is logged for today</h2>
              <p className="text-muted mb-6">Great job keeping up with your daily tracking habit.</p>
              <button 
                onClick={() => setIsEditMode(true)}
                className="px-6 py-2 border border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors"
              >
                Edit Today's Log
              </button>
            </div>
          )}

          {/* BOTTOM SECTION: HISTORY */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mt-8">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-text">Mood History</h2>
              <div className="flex p-1 bg-bg rounded-lg border border-border/50">
                <button 
                  onClick={() => setActiveTab('week')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'week' ? 'bg-white shadow border border-border/50 text-primary' : 'text-muted hover:text-text'}`}
                >
                  This Week
                </button>
                <button 
                  onClick={() => setActiveTab('month')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'month' ? 'bg-white shadow border border-border/50 text-primary' : 'text-muted hover:text-text'}`}
                >
                  This Month
                </button>
              </div>
            </div>

            <div className="h-80 w-full mb-8">
              {activeTab === 'week' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', {weekday:'short'})} axisLine={false} tickLine={false} dy={10} fontSize={12} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} axisLine={false} tickLine={false} fontSize={12} fill="#64748B" />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#F0F9FF'}} />
                    <Bar dataKey="moodScore" radius={[4, 4, 0, 0]}>
                      {
                        weekData.map((entry, index) => (
                          <cell key={`cell-${index}`} fill={entry.moodScore === null ? '#E2E8F0' : 'var(--secondary)'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickFormatter={(v) => v.split('-')[2]} axisLine={false} tickLine={false} dy={10} fontSize={12} minTickGap={20} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} axisLine={false} tickLine={false} fontSize={12} fill="#64748B" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="moodScore" stroke="var(--primary)" strokeWidth={3} dot={{r: 4, fill: 'var(--secondary)', strokeWidth: 0}} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* List View Details for Week Tab */}
            {activeTab === 'week' && (
              <div className="grid grid-cols-7 gap-2">
                {weekData.map((d, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-bg/50 border border-border/30">
                    <div className="text-xs font-semibold text-muted mb-2 uppercase">{new Date(d.date).toLocaleDateString('en-US', {weekday:'short'})}</div>
                    {d.moodScore ? (
                      <>
                        <div className="text-2xl mb-1">{d.moodEmoji}</div>
                        <div className="text-xs font-bold text-text">{d.moodScore}/10</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl mb-1 opacity-20">➖</div>
                        <div className="text-xs text-muted/50 font-medium">-</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mood;
