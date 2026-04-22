import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, AlertCircle, Loader2, UserRound, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    // Therapist fields
    licenseNumber: '', experienceYears: '', sessionPrice: '', bio: '', languages: ''
  });
  
  const [specializations, setSpecializations] = useState([]);
  const [approachMethods, setApproachMethods] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const specOptions = ['Anxiety', 'Depression', 'Trauma & PTSD', 'Addiction', 'Grief', 'OCD'];
  const approachOptions = ['CBT', 'DBT', 'EMDR', 'Mindfulness', 'Psychoeducation', 'Solution-Focused'];

  const handleToggleArr = (arr, setter, val) => {
    const stringVal = val.toLowerCase().replace(/ /g, '-');
    if (arr.includes(stringVal)) {
      setter(arr.filter(a => a !== stringVal));
    } else {
      setter([...arr, stringVal]);
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role,
      phone: formData.phone
    };

    if (role === 'therapist') {
      if (!formData.licenseNumber) return setError('License number is required for therapists');
      payload.therapistProfile = {
        licenseNumber: formData.licenseNumber,
        experienceYears: Number(formData.experienceYears) || 0,
        sessionPrice: Number(formData.sessionPrice) || 0,
        bio: formData.bio,
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
        specializations,
        approachMethods
      };
    }

    setIsLoading(true);
    const result = await register(payload);
    setIsLoading(false);

    if (result.success) {
      navigate(result.role === 'therapist' ? '/therapist/dashboard' : '/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-accent text-white flex-col fixed h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0C2340]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
        
        <div className="relative z-10 p-12 flex flex-col h-full justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-20 inline-flex">
              <BrainCircuit className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold tracking-tight text-white">
                Well<span className="text-secondary">Nest</span>
              </span>
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Begin your wellness<br/>journey today.
            </h1>
            
            <div className="space-y-6 mt-12 text-white/80">
              <div className="flex items-center gap-4 text-lg">
                <div className="bg-secondary/20 p-2 rounded-full"><span className="text-secondary">✓</span></div>
                <span>Take clinically validated assessments</span>
              </div>
              <div className="flex items-center gap-4 text-lg">
                <div className="bg-secondary/20 p-2 rounded-full"><span className="text-secondary">✓</span></div>
                <span>Log your daily mood</span>
              </div>
              <div className="flex items-center gap-4 text-lg">
                <div className="bg-secondary/20 p-2 rounded-full"><span className="text-secondary">✓</span></div>
                <span>Book sessions with verified therapists</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - SCROLLABLE FORM */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] px-6 py-12 sm:px-12 xl:px-24 bg-white min-h-screen">
        <div className="max-w-xl w-full mx-auto">
          <div className="mb-10 lg:mt-8">
            <h2 className="text-3xl font-bold text-accent mb-2">Create Account</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            {/* ROLE SELECTOR */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-4 rounded-xl border text-left transition-all ${role === 'user' ? 'border-primary ring-1 ring-primary bg-bg' : 'border-border bg-surface hover:bg-bg/50'}`}
              >
                <div className="flex items-center gap-2 font-bold text-accent mb-1">
                  <UserRound className={`w-5 h-5 ${role==='user'?'text-primary':'text-muted'}`} />
                  I need support
                </div>
                <div className="text-xs text-muted">Take assessments, track mood, book therapy</div>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('therapist')}
                className={`p-4 rounded-xl border text-left transition-all ${role === 'therapist' ? 'border-primary ring-1 ring-primary bg-bg' : 'border-border bg-surface hover:bg-bg/50'}`}
              >
                <div className="flex items-center gap-2 font-bold text-accent mb-1">
                  <Stethoscope className={`w-5 h-5 ${role==='therapist'?'text-primary':'text-muted'}`} />
                  I am a therapist
                </div>
                <div className="text-xs text-muted">Manage sessions, help clients grow</div>
              </button>
            </div>

            {/* COMMON FIELDS */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Password</label>
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Confirm Password</label>
                  <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Phone (Optional)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>

            {/* THERAPIST FIELDS */}
            {role === 'therapist' && (
              <div className="space-y-6 pt-6 border-t border-border">
                <h3 className="text-xl font-bold text-accent">Therapist Details</h3>
                
                <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl flex gap-3 text-secondary text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Your account will be reviewed by our admin team before you can receive session bookings.</p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-text mb-2">License Number <span className="text-danger">*</span></label>
                    <input required type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Years of Experience</label>
                    <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Session Price (₹)</label>
                    <input type="number" name="sessionPrice" value={formData.sessionPrice} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Specializations</label>
                  <div className="grid grid-cols-2 gap-2">
                    {specOptions.map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary w-4 h-4" 
                          checked={specializations.includes(opt.toLowerCase().replace(/ /g, '-'))}
                          onChange={() => handleToggleArr(specializations, setSpecializations, opt)}
                        /> {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Approach Methods</label>
                  <div className="grid grid-cols-2 gap-2">
                    {approachOptions.map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary w-4 h-4" 
                          checked={approachMethods.includes(opt.toLowerCase().replace(/ /g, '-'))}
                          onChange={() => handleToggleArr(approachMethods, setApproachMethods, opt)}
                        /> {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Languages Spoken (comma separated)</label>
                  <input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, Hindi" className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Professional Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} maxLength={500} className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white resize-none" />
                  <div className="text-right text-xs text-muted mt-1">{formData.bio.length} / 500</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center pb-8 text-muted font-medium border-t border-border pt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-accent transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
