import { useState, useEffect } from 'react';
import { Calendar, Save, Trash2, Plus, Loader2 } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../lib/axios';

const Availability = () => {
  const [schedule, setSchedule] = useState({
    monday: { isAvailable: false, timeSlots: [] },
    tuesday: { isAvailable: false, timeSlots: [] },
    wednesday: { isAvailable: false, timeSlots: [] },
    thursday: { isAvailable: false, timeSlots: [] },
    friday: { isAvailable: false, timeSlots: [] },
    saturday: { isAvailable: false, timeSlots: [] },
    sunday: { isAvailable: false, timeSlots: [] },
  });
  
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/api/therapist/my/availability');
        if (res.data.data) {
          if (res.data.data.weeklySchedule) setSchedule(res.data.data.weeklySchedule);
          if (res.data.data.blockedDates) setBlockedDates(res.data.data.blockedDates);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleDayToggle = (day) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], isAvailable: !schedule[day].isAvailable }
    });
  };

  const handleSlotChange = (day, newSlotsStr) => {
    // Basic validation could be added here
    const slotsArray = newSlotsStr.split(',').map(s => s.trim()).filter(Boolean);
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], timeSlots: slotsArray }
    });
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates([...blockedDates, newBlockedDate]);
      setNewBlockedDate('');
    }
  };

  const removeBlockedDate = (date) => {
    setBlockedDates(blockedDates.filter(d => d !== date));
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      await api.post('/api/therapist/my/availability', {
        weeklySchedule: schedule,
        blockedDates
      });
      alert('Availability saved successfully!');
    } catch (error) {
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (loading) return <div className="min-h-screen bg-bg flex pl-64 pt-20 justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-text mb-1 flex items-center gap-2">
                <Calendar className="w-8 h-8 text-primary" /> Availability
              </h1>
              <p className="text-muted">Set your weekly schedule and manage time off.</p>
            </div>
            <button 
              onClick={saveAvailability}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>} Save Changes
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* WEEKLY SCHEDULE */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
               <h2 className="text-lg font-bold text-accent mb-6 border-b border-border pb-2">Regular Weekly Schedule</h2>
               <div className="space-y-4">
                 {days.map(day => (
                   <div key={day} className={`p-4 rounded-xl border transition-colors ${schedule[day].isAvailable ? 'border-primary/30 bg-primary/5' : 'border-border bg-bg/50'}`}>
                      <div className="flex items-center justify-between mb-3">
                         <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 text-primary rounded border-border focus:ring-primary"
                             checked={schedule[day].isAvailable}
                             onChange={() => handleDayToggle(day)}
                           />
                           <span className="font-bold text-text capitalize">{day}</span>
                         </label>
                         <span className="text-xs font-semibold px-2 py-1 rounded bg-surface border border-border text-muted">
                           {schedule[day].isAvailable ? 'Available' : 'Unavailable'}
                         </span>
                      </div>
                      
                      {schedule[day].isAvailable && (
                        <div className="mt-2 pl-8">
                          <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Time Slots (comma separated, e.g. 09:00, 10:00)</label>
                          <input 
                            type="text" 
                            className="w-full text-sm font-medium p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                            value={schedule[day].timeSlots.join(', ')}
                            onChange={(e) => handleSlotChange(day, e.target.value)}
                            placeholder="e.g. 09:00, 10:00, 14:00"
                          />
                        </div>
                      )}
                   </div>
                 ))}
               </div>
            </div>

            {/* BLOCKED DATES */}
            <div>
              <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-lg font-bold text-danger mb-2 border-b border-border pb-2">Time Off / Blocked Dates</h2>
                <p className="text-sm text-muted mb-4 pb-2">Select specific dates where you will be unavailable for sessions.</p>
                
                <div className="flex gap-2 mb-6">
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-border font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <button 
                    onClick={addBlockedDate}
                    className="px-4 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Add
                  </button>
                </div>

                {blockedDates.length === 0 ? (
                  <div className="text-center py-6 bg-bg rounded-xl border border-border/50 border-dashed text-muted text-sm font-medium">
                    No dates are currently blocked.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedDates.sort().map(date => (
                      <div key={date} className="flex items-center justify-between p-3 rounded-xl bg-danger/5 border border-danger/20 text-danger font-medium">
                        <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <button 
                          onClick={() => removeBlockedDate(date)}
                          className="p-1.5 hover:bg-danger/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Availability;
