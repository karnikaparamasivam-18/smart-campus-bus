import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ViewRoutes from './pages/student/ViewRoutes';
import BookTicket from './pages/student/BookTicket';
import Payment from './pages/student/Payment';
import MyBookings from './pages/student/MyBookings';

// Scanner Pages
import QRScanner from './pages/scanner/QRScanner';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBuses from './pages/admin/ManageBuses';
import ManageRoutes from './pages/admin/ManageRoutes';
import AllBookings from './pages/admin/AllBookings';
import AllUsers from './pages/admin/AllUsers';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/routes"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ViewRoutes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/book/:routeId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <BookTicket />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/payment/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/bookings"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Scanner Route */}
              <Route
                path="/scanner"
                element={
                  <ProtectedRoute allowedRoles={['scanner', 'admin']}>
                    <QRScanner />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/buses"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageBuses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/routes"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageRoutes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AllBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AllUsers />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Toast Notification Provider */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #1e293b',
                borderRadius: '0.875rem',
                fontSize: '0.875rem',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}
