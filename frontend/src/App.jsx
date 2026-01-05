import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import RoomPage from './pages/RoomPage';
import AttemptPage from './pages/AttemptPage';
import ReportPage from './pages/ReportPage';
import TeacherRoomPage from './pages/TeacherRoomPage';
import TeacherAssessmentPage from './pages/TeacherAssessmentPage';
import StudentRoomPage from './pages/StudentRoomPage';
import StudentAttemptPage from './pages/StudentAttemptPage';
import TeacherAnalyticsPage from './pages/TeacherAnalyticsPage';
import TeacherMonitorPage from './pages/TeacherMonitorPage';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'teacher' ? <Navigate to="/teacher" /> : <Navigate to="/student" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/teacher" element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/rooms/:roomId" element={
            <ProtectedRoute role="teacher">
              <TeacherRoomPage />
            </ProtectedRoute>
          } />
          <Route path="/teacher/assessments/:assessmentId" element={
            <ProtectedRoute role="teacher">
              <TeacherAssessmentPage />
            </ProtectedRoute>
          } />
          <Route path="/teacher/assessments/:assessmentId/analytics" element={
            <ProtectedRoute role="teacher">
              <TeacherAnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/teacher/assessments/:assessmentId/monitor" element={
            <ProtectedRoute role="teacher">
              <TeacherMonitorPage />
            </ProtectedRoute>
          } />
          <Route path="/student" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/rooms/:roomId" element={
            <ProtectedRoute role="student">
              <StudentRoomPage />
            </ProtectedRoute>
          } />
          <Route path="/student/assessments/:assessmentId/attempt" element={
            <ProtectedRoute role="student">
              <StudentAttemptPage />
            </ProtectedRoute>
          } />
          <Route path="/room/:roomId" element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          } />
          <Route path="/attempt/:assessmentId" element={
            <ProtectedRoute role="student">
              <AttemptPage />
            </ProtectedRoute>
          } />
          <Route path="/report/:assessmentId" element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
