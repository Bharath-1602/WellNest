import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Activity, Heart, Users, Shield, CheckCircle, ClipboardList, TrendingUp } from 'lucide-react';
import api from '../lib/axios';

const Landing = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await api.get('/api/auth/therapists');
        setTherapists(res.data.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch therapists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  return (
    <div className="min-h-screen font-sans bg-bg text-text">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 transition-all-smooth bg-accent/95 backdrop-blur-sm shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Well<span className="text-secondary">Nest</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6 text-sm font-medium text-white/90">
              <a href="#" className="hover:text-secondary transition-colors">Home</a>
              <a href="#how-it-works" className="hover:text-secondary transition-colors">How It Works</a>
              <a href="#therapists" className="hover:text-secondary transition-colors">Our Therapists</a>
            </div>
            <div className="flex gap-4">
              <Link to="/login" className="px-5 py-2 rounded-full border border-white/50 text-white hover:bg-white/10 transition-all font-medium">
                Sign In
              </Link>
              <Link to="/register" className="px-5 py-2 rounded-full bg-white text-primary hover:bg-bg hover-scale transition-all font-medium shadow-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-accent to-[#0C2340]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <span className="px-4 py-1.5 rounded-full bg-secondary/20 text-border border border-secondary/30 text-sm font-medium mb-8">
            ✦ Mental Wellness Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Your Mental Wellness<br />
            Journey Starts <span className="text-secondary">Here</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-border mb-10 leading-relaxed">
            Evidence-based assessments, daily mood tracking, and access to
            verified therapists — all in one compassionate space.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 mb-16">
            <Link to="/register" className="px-8 py-4 rounded-full bg-white text-accent font-semibold text-lg hover-scale shadow-xl">
              Start Your Journey →
            </Link>
            <a href="#therapists" className="px-8 py-4 rounded-full border border-white text-white font-semibold text-lg hover:bg-white/10 transition-colors">
              Meet Our Therapists
            </a>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-border/80 text-sm font-medium">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-secondary"/> PHQ-9 & GAD-7 Validated</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-secondary"/> Verified Therapists</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-secondary"/> Private & Secure</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-surface py-12 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
            <div className="px-4">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm font-medium text-muted">Users Supported</div>
            </div>
            <div className="px-4">
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <div className="text-sm font-medium text-muted">Expert Therapists</div>
            </div>
            <div className="px-4">
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <div className="text-sm font-medium text-muted">Clinical Tools</div>
            </div>
            <div className="px-4">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm font-medium text-muted">Private & Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">How WellNest Works</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto mb-16">Three simple steps to better mental health</p>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="bg-surface p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative z-10 border border-border/50 text-left">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <span className="text-muted font-bold text-sm tracking-wider mb-2 block">01</span>
              <h3 className="text-xl font-bold text-text mb-4">Assess Your Mental Health</h3>
              <p className="text-muted leading-relaxed">
                Take our clinically validated PHQ-9 and GAD-7 assessments.
                Get instant insights into your depression and anxiety levels
                with personalised recommendations.
              </p>
            </div>
            
            <div className="bg-surface p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative z-10 border border-border/50 text-left">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-lg shadow-secondary/20">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <span className="text-muted font-bold text-sm tracking-wider mb-2 block">02</span>
              <h3 className="text-xl font-bold text-text mb-4">Track Your Daily Mood</h3>
              <p className="text-muted leading-relaxed">
                Log your mood, emotions, activities, and sleep every day.
                Visualise your patterns with beautiful charts and discover
                what impacts your wellbeing most.
              </p>
            </div>
            
            <div className="bg-surface p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative z-10 border border-border/50 text-left">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
                <Users className="w-8 h-8 text-white" />
              </div>
              <span className="text-muted font-bold text-sm tracking-wider mb-2 block">03</span>
              <h3 className="text-xl font-bold text-text mb-4">Connect With a Therapist</h3>
              <p className="text-muted leading-relaxed">
                Browse our verified mental health professionals, check their
                availability, and book a session that fits your schedule and
                budget. Your first step toward healing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ASSESSMENTS PREVIEW */}
      <section className="py-24 bg-surface border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 inline-block">Clinical Tools</span>
              <h2 className="text-3xl md:text-4xl font-bold text-accent mb-6 leading-tight">
                Validated Assessments You Can Trust
              </h2>
              <p className="text-muted text-lg leading-relaxed mb-8">
                WellNest uses globally recognised mental health screening
                tools. These assessments are used by clinicians worldwide
                and provide reliable insight into your current mental state.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4 bg-bg p-4 rounded-xl border border-border/50">
                  <div className="text-2xl">🧠</div>
                  <div>
                    <div className="font-bold text-text">PHQ-9 — Depression Screening</div>
                    <div className="text-sm text-primary font-medium mt-1">Takes ~3 minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-bg p-4 rounded-xl border border-border/50">
                  <div className="text-2xl">💭</div>
                  <div>
                    <div className="font-bold text-text">GAD-7 — Anxiety Screening</div>
                    <div className="text-sm text-primary font-medium mt-1">Takes ~2 minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-bg p-4 rounded-xl border border-border/50">
                  <div className="text-2xl">✨</div>
                  <div>
                    <div className="font-bold text-text">Daily Wellness Check</div>
                    <div className="text-sm text-primary font-medium mt-1">Takes ~2 minutes</div>
                  </div>
                </div>
              </div>
              
              <Link to="/register" className="inline-block px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Take a Free Assessment
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-3xl transform rotate-3 scale-105"></div>
              <div className="bg-surface border border-border shadow-2xl rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-4 right-4 rotate-12 bg-warning/20 text-warning px-3 py-1 text-xs font-bold rounded-full border border-warning/30">Preview Only</div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center">Patient Health Questionnaire</h3>
                <div className="w-full bg-bg h-2 rounded-full mb-8 overflow-hidden">
                  <div className="bg-primary w-1/9 h-full"></div>
                </div>
                <p className="text-center font-semibold text-lg mb-8 text-text">
                  1. Little interest or pleasure in doing things
                </p>
                <div className="space-y-3">
                  {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((opt, i) => (
                    <div key={i} className={`p-4 rounded-xl border font-medium text-center transition-colors ${i === 1 ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-text'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THERAPIST SHOWCASE */}
      <section id="therapists" className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">Meet Our Therapists</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">All therapists are verified mental health professionals</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl p-6 shadow-sm border border-border/50 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))
            ) : therapists.length > 0 ? (
              therapists.map((therapist) => (
                <div key={therapist._id} className="bg-surface rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border/50 flex flex-col hover:-translate-y-1 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-accent to-primary p-8 flex flex-col items-center text-center relative">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-accent text-2xl font-bold shadow-lg mb-4">
                      {therapist.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {therapist.name} <CheckCircle className="w-4 h-4 text-secondary fill-secondary/20" />
                    </h3>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                      {therapist.therapistProfile.specializations.slice(0, 3).map(spec => (
                        <span key={spec} className="px-2.5 py-1 bg-bg text-primary text-xs font-semibold rounded-md border border-primary/10">
                          {spec.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-3 text-sm text-text flex-1">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <span className="text-muted flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Experience</span>
                        <span className="font-semibold">{therapist.therapistProfile.experienceYears} years</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <span className="text-muted flex items-center gap-2"><Users className="w-4 h-4"/> Rating</span>
                        <span className="font-semibold flex items-center gap-1 text-warning">
                          ★ {therapist.therapistProfile.rating} <span className="text-muted font-normal text-xs">({therapist.therapistProfile.totalReviews})</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-muted">Session Fee</span>
                        <span className="font-bold text-primary text-lg">₹{therapist.therapistProfile.sessionPrice}</span>
                      </div>
                    </div>
                    <Link to="/login" className="w-full mt-4 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold rounded-xl text-center transition-colors">
                      Sign in to Book
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-muted">No therapists found.</div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/login" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors">
              View All Therapists <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY WELLNEST */}
      <section className="bg-gradient-to-b from-accent to-[#0C2340] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose WellNest?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl">
              <Shield className="w-10 h-10 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">100% Private</h3>
              <p className="text-white/70">Your data is encrypted and never shared without your explicit consent.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Verified Professionals</h3>
              <p className="text-white/70">Every therapist is manually verified for credentials by our admin team before listing.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl">
              <ClipboardList className="w-10 h-10 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Clinical Grade Tools</h3>
              <p className="text-white/70">PHQ-9 and GAD-7 are the gold standard in global mental health screening.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl">
              <Activity className="w-10 h-10 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
              <p className="text-white/70">Visualise your mental health journey with detailed historical charts and insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-primary py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Wellness Journey?</h2>
          <p className="text-white/90 text-xl mb-10">Join hundreds of people taking charge of their mental health.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register" className="px-10 py-4 rounded-full bg-white text-primary font-bold text-lg hover-scale shadow-xl w-full sm:w-auto">
              Create Free Account
            </Link>
            <Link to="/login" className="text-white font-medium hover:text-border transition-colors">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0C2340] pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-6 w-6 text-white" />
                <span className="text-xl font-bold text-white">Well<span className="text-secondary">Nest</span></span>
              </div>
              <p className="text-white/60 mb-6">Your mental wellness companion.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/60">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><a href="#therapists" className="hover:text-white transition-colors">Find a Therapist</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/40">
            © {new Date().getFullYear()} WellNest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
