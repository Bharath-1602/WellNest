import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const currentClass = fullScreen 
    ? "flex items-center justify-center min-h-screen bg-bg" 
    : "flex items-center justify-center p-4 w-full h-full";

  return (
    <div className={currentClass}>
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
