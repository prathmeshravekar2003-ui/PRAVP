import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import MainLayout from './layouts/MainLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';

// Protected Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/ExamList';
import CreateExam from './pages/CreateExam';
import ExamAttempt from './pages/ExamAttempt';
import ResultPage from './pages/ResultPage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ManageExams from './pages/ManageExams';
import ManageBatches from './pages/ManageBatches';
import ExamAttempts from './pages/ExamAttempts';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 italic-none">
          <Routes>
            {/* Public Routes with MainLayout */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/about" element={<MainLayout><About /></MainLayout>} />
            <Route path="/features" element={<MainLayout><Features /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />

            {/* Auth Routes (no footer) */}
            <Route path="/login" element={<MainLayout showFooter={false}><Login /></MainLayout>} />
            <Route path="/register" element={<MainLayout showFooter={false}><Register /></MainLayout>} />

            {/* Protected Routes with DashboardLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}>
                  <DashboardLayout>
                    <ExamList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-exam"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <DashboardLayout>
                    <CreateExam />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-exams"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <DashboardLayout>
                    <ManageExams />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-exams/:examId/attempts"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <DashboardLayout>
                    <ExamAttempts />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-batches"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout>
                    <ManageBatches />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/attempt/:examId"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ExamAttempt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ResultPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/monitoring"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout>
                    <UserManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
