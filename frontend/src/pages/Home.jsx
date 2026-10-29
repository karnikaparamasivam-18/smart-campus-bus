import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BusIcon, QrIcon, TicketIcon, ShieldIcon, ArrowRightIcon } from '../components/Icons';

export default function Home() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'scanner') return <Navigate to="/scanner" replace />;
    return <Navigate to="/student" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Campus Transit Digitized</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Smart Campus Bus <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              Booking & Management
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Reserve your campus bus seats seamlessly, verify tickets instantly with QR codes,
            and monitor transit fleets in real-time.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
            >
              <span>Student Registration</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold transition-all hover:text-white"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <TicketIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Booking</h3>
            <p className="text-sm text-slate-400">
              Browse available bus routes, pick travel dates, and reserve seats in just a few taps with secure Razorpay checkout.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <QrIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">QR Ticket Validation</h3>
            <p className="text-sm text-slate-400">
              Board buses paperlessly. Bus coordinators verify signed QR tickets instantly using built-in camera scanning.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
              <ShieldIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fleet Administration</h3>
            <p className="text-sm text-slate-400">
              Campus transport administrators manage bus capacities, optimize routes, and view live passenger reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

