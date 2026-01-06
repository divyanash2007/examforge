import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import LoadingFallback from './components/LoadingFallback';

// Static Imports (Critical Paths / Safety Rules)
import Login from './pages/Login';
import Register from './pages/Register';
import StudentAttemptPage from './pages/StudentAttemptPage'; // Exam Interface MUST NOT be lazy loaded

// Lazy Imports (Dashboards, Analytics, Reports)
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const RoomPage = lazy(() => import('./pages/RoomPage'));
const AttemptPage = lazy(() => import('./pages/AttemptPage')); // Legacy/Fallback attempt page
const ReportPage = lazy(() => import('./pages/ReportPage'));
const TeacherRoomPage = lazy(() => import('./pages/TeacherRoomPage'));
const TeacherAssessmentPage = lazy(() => import('./pages/TeacherAssessmentPage'));
const StudentRoomPage = lazy(() => import('./pages/StudentRoomPage'));
const StudentReviewPage = lazy(() => import('./pages/StudentReviewPage'));
const StudentPracticeSetupPage = React.lazy(() => import('./pages/StudentPracticeSetupPage'));
const StudentPracticeHistoryPage = React.lazy(() => import('./pages/StudentPracticeHistoryPage'));
const TeacherAnalyticsPage = lazy(() => import('./pages/TeacherAnalyticsPage'));
const TeacherMonitorPage = lazy(() => import('./pages/TeacherMonitorPage'));

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'teacher' ? <Navigate to="/teacher" /> : <Navigate to="/student" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalErrorBoundary>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Redirect */}
              <Route path="/" element={<Home />} />

              {/* Teacher Routes */}
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

              {/* Student Routes */}
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

              {/* CRITICAL: Exam Page is Static Loaded (No Suspense Boundary interference inside) */}
              <Route path="/student/assessments/:assessmentId/attempt" element={
                <ProtectedRoute role="student">
                  <StudentAttemptPage />
                </ProtectedRoute>
              } />
              <Route path="/student/attempts/:attemptId/review" element={
                <ProtectedRoute role="student">
                  <StudentReviewPage />
                </ProtectedRoute>
              } />
              <Route path="/student/assessments/:assessmentId/review" element={
                <ProtectedRoute role="student">
                  <StudentReviewPage />
                </ProtectedRoute>
              } />
              <Route path="/student/practice/setup" element={
                <ProtectedRoute role="student">
                  <StudentPracticeSetupPage />
                </ProtectedRoute>
              } />
              <Route path="/student/practice/history" element={
                <ProtectedRoute role="student">
                  <StudentPracticeHistoryPage />
                </ProtectedRoute>
              } />

              {/* Shared / Legacy Routes */}
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
          </Suspense>
        </AuthProvider>
      </GlobalErrorBoundary>
    </BrowserRouter>
  );
}
