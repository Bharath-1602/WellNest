import { useState, useEffect } from 'react';
import { X, CalendarDays, Loader2, Video, Phone, MessageSquare, MapPin } from 'lucide-react';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

const BookSessionModal = ({ therapist, onClose }) => {
  const [step, setStep] = useState(1); // 1: Date, 2: Slot, 3: Details
  
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  
  const [mode, setMode] = useState('video');
  const [notes, setNotes] = useState('');
  
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await api.get(`/api/therapist/directory/${therapist._id}/slots?date=${selectedDate}`);
          setAvailableSlots(res.data.data);
        } catch (error) {
          console.error(error);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [step, selectedDate, therapist._id]);

  const handleBook = async () => {
    setBooking(true);
    setError('');
    try {
      await api.post('/api/therapist/sessions/book', {
        therapistId: therapist._id,
        scheduledDate: selectedDate,
        scheduledTime: selectedSlot,
        mode,
        userNotes: notes
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/sessions');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book session');
      setBooking(false);
    }
  };

  const modeOptions = [
    { id: 'video', icon: Video, label: 'Video Call' },
    { id: 'audio', icon: Phone, label: 'Audio Call' },
    { id: 'chat',  icon: MessageSquare, label: 'Chat' },
    { id: 'in-person', icon: MapPin, label: 'In Person' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-bg rounded-t-3xl text-text">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Book a Session</h2>
              <p className="text-xs font-semibold text-muted tracking-wide uppercase">with {therapist.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-danger">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">Session Booked!</h3>
              <p className="text-muted">You will be redirected to your sessions page.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Progress Steps Indicator */}
              <div className="flex justify-between relative mb-8 px-4">
                <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-border -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all origin-left" style={{ transform: `scaleX(${(step-1)/2})` }}></div>
                
                {[1, 2, 3].map(num => (
                  <div key={num} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm z-10 bg-surface transition-colors ${step >= num ? 'border-primary text-primary' : 'border-border text-muted'} ${step === num ? 'ring-4 ring-primary/20' : ''}`}>
                    {num}
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="animate-in slide-in-from-right-4">
                  <h3 className="font-bold text-accent mb-4">Select a Date</h3>
                  <div className="bg-bg p-6 rounded-2xl border border-border flex justify-center">
                    <input 
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-3 border border-border rounded-xl text-lg font-medium bg-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in slide-in-from-right-4">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-accent">Available Slots</h3>
                    <span className="text-sm font-medium text-muted bg-bg px-3 py-1 rounded-full border border-border">
                      {new Date(selectedDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {loadingSlots ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center p-8 bg-bg rounded-2xl border border-border">
                      <p className="font-medium text-text mb-2">No availability on this date.</p>
                      <button onClick={() => setStep(1)} className="text-primary text-sm font-bold hover:underline">Try another date</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${
                            selectedSlot === slot 
                              ? 'bg-primary border-primary text-white shadow-md scale-[1.02]' 
                              : 'bg-white border-border text-text hover:border-primary/50 hover:bg-bg'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="animate-in slide-in-from-right-4 space-y-6">
                  <div>
                    <h3 className="font-bold text-text mb-3">Session Mode</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {modeOptions.map(m => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                              mode === m.id 
                                ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                                : 'bg-surface border-border text-muted hover:bg-bg group'
                            }`}
                          >
                            <Icon className={`w-6 h-6 ${mode===m.id?'text-primary':'group-hover:text-text'}`} />
                            <span className={`text-sm font-bold ${mode===m.id?'text-primary':'group-hover:text-text'}`}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-text mb-2">What would you like to discuss? <span className="font-normal text-muted text-sm">(optional)</span></h3>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-bg/50 p-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Briefly describe what brings you to therapy today..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-4 border-t border-border bg-bg rounded-b-3xl">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="text-sm font-semibold text-text">
                Fee: <span className="text-primary text-lg font-black tracking-tight">₹{therapist.therapistProfile.sessionPrice}</span> <span className="text-xs font-normal text-muted">/ session</span>
              </div>
              <div className="text-sm font-bold text-muted text-right">
                {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}
                {selectedSlot && <span className="text-accent ml-2">{selectedSlot}</span>}
              </div>
            </div>
          
            <div className="flex gap-3">
              <button
                onClick={() => step === 1 ? onClose() : setStep(step - 1)}
                className="px-6 py-3 rounded-xl font-bold bg-white border border-border text-text hover:bg-surface transition-colors"
                disabled={booking}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 2 && !selectedSlot}
                  className="flex-1 py-3 rounded-xl font-bold bg-primary text-white disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="flex-1 py-3 rounded-xl font-bold bg-secondary text-white hover:bg-secondary/90 transition-all flex justify-center items-center gap-2 active:scale-[0.98] shadow-md"
                >
                  {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookSessionModal;
