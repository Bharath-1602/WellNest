import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';

const TakeAssessment = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { qNum: selectedVal }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const startTime = useRef(Date.now());

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await api.get(`/api/assessment/templates/${type}`);
        setTemplate(res.data.data);
      } catch (error) {
        console.error(error);
        navigate('/assessments');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
    startTime.current = Date.now();
  }, [type, navigate]);

  const handleSelect = (val) => {
    setAnswers({ ...answers, [template.questions[currentQ].questionNumber]: val });
  };

  const handleNext = () => {
    if (currentQ < template.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime.current) / 1000);
    
    // Format answers array for API: [{ questionNumber, selectedValue }]
    const formattedAnswers = Object.keys(answers).map(qNum => ({
      questionNumber: Number(qNum),
      selectedValue: answers[qNum]
    }));

    try {
      const res = await api.post('/api/assessment/submit', {
        assessmentType: template.type,
        answers: formattedAnswers,
        durationSeconds
      });
      navigate(`/assessments/result/${res.data.data._id}`, { state: { result: res.data.data } });
    } catch (error) {
      setSubmitting(false);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  if (loading || !template) return <div className="min-h-screen bg-bg flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const currentQuestion = template.questions[currentQ];
  const hasAnsweredCurrent = answers[currentQuestion.questionNumber] !== undefined;
  const isLastQuestion = currentQ === template.questions.length - 1;
  const progressPercent = ((currentQ + 1) / template.questions.length) * 100;

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-bg to-surface pointer-events-none"></div>
      
      {/* Loading Overlay for Submit */}
      {submitting && (
        <div className="absolute inset-0 z-50 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-bold text-accent">Analyzing results...</h2>
        </div>
      )}

      {/* TOP BAR */}
      <header className="relative z-10 bg-surface border-b border-border py-4 sticky top-0 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 w-full grid grid-cols-3 items-center">
          <div>
            <Link to="/assessments" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Assessments
            </Link>
          </div>
          <div className="text-center font-bold text-accent truncate px-4">
            {template.name}
          </div>
          <div className="text-right text-sm font-semibold text-muted">
            Question {currentQ + 1} of {template.questions.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-bg">
          <div 
            className="h-full bg-secondary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </header>

      {/* CENTER CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl transform transition-all">
          <div className="text-center mb-10 text-primary font-bold tracking-wider text-sm">
            QUESTION {currentQ + 1}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-accent text-center mb-12 leading-relaxed">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.questionNumber] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full p-5 rounded-2xl border-2 text-left font-semibold text-lg transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5 text-primary shadow-sm flex items-center justify-between scale-[1.01]' 
                      : 'border-border bg-surface text-text hover:border-border/80 hover:bg-bg/50 hover:scale-[1.01]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <CheckCircle2 className="w-6 h-6 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <button
              onClick={handleBack}
              disabled={currentQ === 0}
              className="px-6 py-3 rounded-xl border-2 border-border text-muted font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${
                !hasAnsweredCurrent 
                  ? 'bg-muted/20 text-muted/50 cursor-not-allowed' 
                  : isLastQuestion 
                    ? 'bg-secondary text-white hover:bg-secondary/90 hover:shadow-md'
                    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
              }`}
            >
              {isLastQuestion ? 'Submit Assessment' : 'Next'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TakeAssessment;
