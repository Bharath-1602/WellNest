import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'therapist') navigate('/therapist/dashboard');
      else navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-accent text-white flex-col relative overflow-hidden">
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
              Welcome back.<br/>Your wellness journey continues.
            </h1>
            
            <div className="space-y-6 mt-12 text-white/80">
              <div className="flex items-center gap-4 text-lg">
                <div className="bg-secondary/20 p-2 rounded-full"><span className="text-secondary">✓</span></div>
                <span>Track your mood and progress</span>
              </div>
              <div className="flex items-center gap-4 text-lg">
                <div className="bg-secondary/20 p-2 rounded-full"><span className="text-secondary">✓</span></div>
                <span>Access clinical assessments</span>
              </div>
              <div className="flex items-center gap-4 text-lg">
                <div className="bg-secondary/20 p-2 rounded-full"><span className="text-secondary">✓</span></div>
                <span>Connect with verified therapists</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 xl:px-24 bg-white relative">
        <Link to="/" className="absolute top-8 left-6 sm:left-12 text-sm font-medium text-muted hover:text-primary transition-colors flex items-center gap-2">
          ← Back to Home
        </Link>

        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10 mt-10">
            <h2 className="text-3xl font-bold text-accent mb-2">Sign In</h2>
            <p className="text-muted">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-4 top-3.5 text-sm font-medium text-primary hover:text-accent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-10 text-muted font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-accent transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
