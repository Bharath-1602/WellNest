import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access unauthorized route
    const redirectPath = user.role === 'admin' ? '/admin' : 
                         user.role === 'therapist' ? '/therapist/dashboard' : 
                         '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
