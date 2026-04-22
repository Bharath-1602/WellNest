import { useState, useEffect } from 'react';
import { Search, Globe, BriefcaseIcon, Star, Filter, CalendarDays, Video, Phone, MessageSquare, MapPin, X } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import BookSessionModal from '../../components/therapist/BookSessionModal';
import api from '../../lib/axios';

const TherapistDirectory = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ specialization: '', language: '', maxPrice: 5000 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  const specOptions = ['anxiety', 'depression', 'trauma', 'ptsd', 'addiction', 'grief', 'ocd', 'stress-management'];

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      try {
        let url = '/api/therapist/directory?';
        if (filters.specialization) url += `specialization=${filters.specialization}&`;
        if (filters.language) url += `language=${filters.language}&`;
        if (filters.maxPrice) url += `maxPrice=${filters.maxPrice}&`;
        
        const res = await api.get(url);
        setTherapists(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    // Add small debounce for slider
    const timer = setTimeout(fetchTherapists, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleBookClick = (therapist) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="border-b border-border pb-4">
            <h1 className="text-3xl font-bold text-text mb-1">Find a Therapist</h1>
            <p className="text-muted">All therapists on WellNest are verified mental health professionals</p>
          </div>

          {/* FILTER BAR */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center sticky top-0 z-10">
            <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-lg border border-border w-full md:w-1/3">
              <Filter className="w-5 h-5 text-muted shrink-0" />
              <select 
                value={filters.specialization}
                onChange={(e) => setFilters({...filters, specialization: e.target.value})}
                className="bg-transparent border-none outline-none w-full text-sm font-medium text-text cursor-pointer"
              >
                <option value="">All Specializations</option>
                {specOptions.map(opt => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-lg border border-border w-full md:w-1/3">
              <Globe className="w-5 h-5 text-muted shrink-0" />
              <input 
                type="text" 
                placeholder="Filter by language..." 
                value={filters.language}
                onChange={(e) => setFilters({...filters, language: e.target.value})}
                className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-muted"
              />
            </div>

            <div className="flex items-center gap-4 px-3 py-2 bg-bg rounded-lg border border-border w-full md:w-1/3">
              <span className="text-sm font-bold text-text whitespace-nowrap">₹0 - ₹{filters.maxPrice}</span>
              <input 
                type="range" min="500" max="5000" step="100"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {(filters.specialization || filters.language || filters.maxPrice < 5000) && (
              <button 
                onClick={() => setFilters({ specialization: '', language: '', maxPrice: 5000 })}
                className="p-2 rounded-lg hover:bg-bg text-muted hover:text-danger transition-colors shrink-0"
                title="Clear Filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* THERAPIST GRID */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-surface rounded-2xl p-6 border border-border h-72 animate-pulse flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-bg rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-bg w-3/4 rounded"></div>
                      <div className="h-3 bg-bg w-1/2 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-bg rounded w-full"></div>
                    <div className="h-4 bg-bg rounded w-4/5"></div>
                  </div>
                  <div className="mt-6 h-10 bg-bg rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          ) : therapists.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 border border-border text-center">
               <Search className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
               <h3 className="text-xl font-bold text-text mb-2">No therapists found</h3>
               <p className="text-muted">Try adjusting your filters to see more results.</p>
               <button 
                onClick={() => setFilters({ specialization: '', language: '', maxPrice: 5000 })}
                className="mt-6 px-6 py-2 border border-border rounded-xl text-primary font-bold hover:bg-bg"
               >
                 Reset Filters
               </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapists.map(t => (
                <div key={t._id} className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border flex flex-col hover:-translate-y-1 transition-transform group">
                  <div className="bg-accent p-6 flex items-start gap-4 h-32 relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIvPjwvc3ZnPg==')]"></div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-accent text-xl font-black shadow-md border-2 border-surface shrink-0 z-10 relative">
                      {t.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <div className="z-10 mt-1">
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{t.name}</h3>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/20 text-white text-xs font-semibold border border-secondary/30">
                        <CheckCircle2 className="w-3 h-3 text-secondary fill-secondary/20" /> Verified
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-5 h-16 overflow-hidden content-start">
                      {t.therapistProfile.specializations?.map(spec => (
                        <span key={spec} className="px-2.5 py-1 bg-bg text-primary text-xs font-bold rounded border border-primary/10 tracking-wide">
                          {spec.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    
                    <div className="space-y-3.5 text-sm flex-1 mb-6">
                      <div className="flex items-center justify-between text-text">
                        <span className="flex items-center gap-2 text-muted font-medium"><BriefcaseIcon className="w-4 h-4"/> Experience</span>
                        <span className="font-bold">{t.therapistProfile.experienceYears} years</span>
                      </div>
                      <div className="flex items-center justify-between text-text">
                        <span className="flex items-center gap-2 text-muted font-medium"><Globe className="w-4 h-4"/> Languages</span>
                        <span className="font-semibold text-right max-w-[150px] truncate">{t.therapistProfile.languages?.join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-text">
                        <span className="flex items-center gap-2 text-muted font-medium"><Star className="w-4 h-4 text-warning fill-warning/20"/> Rating</span>
                        <span className="font-bold">{t.therapistProfile.rating} <span className="text-muted font-normal text-xs">({t.therapistProfile.totalReviews})</span></span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between mb-5">
                      <div className="text-xs font-bold text-muted uppercase tracking-wider">Per Session</div>
                      <div className="text-xl font-black text-primary">₹{t.therapistProfile.sessionPrice}</div>
                    </div>

                    <button 
                      onClick={() => handleBookClick(t)}
                      className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <CalendarDays className="w-4 h-4" /> Book a Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <BookSessionModal 
          therapist={selectedTherapist} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default TherapistDirectory;
