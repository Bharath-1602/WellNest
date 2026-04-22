import { useState, useEffect } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react';
import api from '../../lib/axios';
import SeverityBadge from '../../components/shared/SeverityBadge';

const AssessmentResult = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    // If entered directly via URL without state, we would fetch it.
    // Assuming backend endpoint exists for getting specific result, 
    // but the design says we usually pass via state. 
    // For safety, if no result, redirect to history.
    if (!result && loading) {
      // In a real app we'd fetch GET /api/assessment/result/:id 
      // Since that endpoint wasn't specifically requested in the prompt, redirect fallback
      navigate('/assessments');
    }
  }, [result, loading, navigate]);

  if (loading || !result) return null;

  const colorMap = {
    'green': 'border-success text-success',
    'yellow': 'border-warning text-warning',
    'orange': 'border-moderate text-moderate',
    'red': 'border-danger text-danger',
    'blue': 'border-secondary text-secondary'
  };

  const bgMap = {
    'green': 'bg-success/10',
    'yellow': 'bg-warning/10',
    'orange': 'bg-moderate/10',
    'red': 'bg-danger/10',
    'blue': 'bg-secondary/10'
  };

  const circleColorClass = colorMap[result.severityColor] || colorMap['gray'];
  const bgColorClass = bgMap[result.severityColor] || bgMap['gray'];

  return (
    <div className="min-h-screen bg-bg py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        
        <div className="text-center mb-8">
          <Link to="/dashboard" className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full text-primary shadow-sm mb-6 border border-border hover:scale-110 transition-transform">
            <BrainCircuit className="w-6 h-6" />
          </Link>
          <h1 className="text-sm font-bold text-muted uppercase tracking-widest mb-2">Assessment Results</h1>
          <h2 className="text-3xl font-extrabold text-accent">{result.assessmentType}</h2>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border border-b-4 relative overflow-hidden">
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30 -mr-20 -mt-20 pointer-events-none ${bgColorClass}`}></div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Score Circle */}
            <div className={`w-48 h-48 rounded-full border-8 bg-surface shadow-inner flex flex-col items-center justify-center mb-6 relative ${circleColorClass}`}>
              <span className="text-6xl font-black">{result.totalScore}</span>
              <span className="text-sm font-bold mt-1 text-muted absolute bottom-6">Points</span>
            </div>

            <div className="mb-8 scale-110">
               <SeverityBadge severity={result.severity} colorClass={result.severityColor} />
            </div>

            <p className="text-center text-lg text-text font-medium mb-10 leading-relaxed max-w-md">
              {result.description}
            </p>

            <div className="w-full">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 border-b border-border pb-2">
                What you can do next
              </h3>
              <ul className="space-y-4">
                {result.recommendations?.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-text font-medium">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Warning Callout for Abnormal results */}
        {result.isAbnormal && (
          <div className="mt-6 bg-secondary/10 border-2 border-primary/20 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-white rounded-full text-primary shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-accent mb-2">Consider speaking with a therapist</h4>
              <p className="text-text mb-4 text-sm leading-relaxed">
                Your score indicates you might benefit from professional support. Our verified therapists specialize in helping people navigate these exact challenges.
              </p>
              <Link to="/therapists" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-primary/20 transition-all">
                Find a Therapist <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/assessments" className="px-6 py-3 rounded-xl border border-border bg-white text-text font-bold text-center hover:bg-bg transition-colors w-full sm:w-auto">
            Take Another Assessment
          </Link>
          <Link to="/dashboard" className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-center hover:bg-primary/90 transition-colors shadow-md w-full sm:w-auto">
            Go to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AssessmentResult;
