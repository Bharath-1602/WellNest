import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Mood from './pages/user/Mood';
import Assessments from './pages/user/Assessments';
import TakeAssessment from './pages/user/TakeAssessment';
import AssessmentResult from './pages/user/AssessmentResult';
import TherapistDirectory from './pages/user/TherapistDirectory';
import Sessions from './pages/user/Sessions';

// Therapist Pages
import TherapistDashboard from './pages/therapist/TherapistDashboard';
import TherapistSessions from './pages/therapist/TherapistSessions';
import Availability from './pages/therapist/Availability';

// Admin Page
import AdminDashboard from './pages/admin/AdminDashboard';

// Components
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/take/:type" element={<TakeAssessment />} />
          <Route path="/assessments/result/:id" element={<AssessmentResult />} />
          <Route path="/therapists" element={<TherapistDirectory />} />
          <Route path="/sessions" element={<Sessions />} />
        </Route>

        {/* Therapist Routes */}
        <Route element={<ProtectedRoute allowedRoles={['therapist']} />}>
          <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
          <Route path="/therapist/sessions" element={<TherapistSessions />} />
          <Route path="/therapist/availability" element={<Availability />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
