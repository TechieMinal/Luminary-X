import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { PageLoader } from './components/common/Spinner';
import AppLayout from './layouts/AppLayout';
import Landing from './pages/landing/Landing';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student
import StudentDashboard from './pages/student/Dashboard';
import Skills           from './pages/student/Skills';
import Projects         from './pages/student/Projects';
import Mentors          from './pages/student/Mentors';
import StudentSessions  from './pages/student/Sessions';

// Mentor
import MentorDashboard from './pages/mentor/Dashboard';
import Mentees         from './pages/mentor/Mentees';
import MentorSessions  from './pages/mentor/Sessions';
import MentorProfile   from './pages/mentor/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers     from './pages/admin/Users';
import Approvals      from './pages/admin/Approvals';

// Shared
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={`/${user?.role}/dashboard`} replace />;
  return children;
}

export default function App() {
  const { fetchMe } = useAuthStore();
  useEffect(() => { fetchMe(); }, []);

  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="skills"    element={<Skills />} />
        <Route path="projects"  element={<Projects />} />
        <Route path="mentors"   element={<Mentors />} />
        <Route path="sessions"  element={<StudentSessions />} />
        <Route path="messages"  element={<Messages />} />
      </Route>

      {/* Mentor */}
      <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MentorDashboard />} />
        <Route path="mentees"   element={<Mentees />} />
        <Route path="sessions"  element={<MentorSessions />} />
        <Route path="messages"  element={<Messages />} />
        <Route path="profile"   element={<MentorProfile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users"     element={<AdminUsers />} />
        <Route path="approvals" element={<Approvals />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
