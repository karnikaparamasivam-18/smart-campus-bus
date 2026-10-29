import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BusIcon, QrIcon, TicketIcon, ShieldIcon, UserIcon, LogOutIcon } from './Icons';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const roleBadgeColor = {
    student: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    scanner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    admin: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  }[role] || 'bg-slate-700 text-slate-300 border-slate-600';

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <BusIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">
                CampusBus
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 block -mt-1 font-mono">
                Smart Transit
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated && role === 'student' && (
              <>
                <Link to="/student" className={linkClass('/student')}>
                  Dashboard
                </Link>
                <Link to="/student/routes" className={linkClass('/student/routes')}>
                  View Routes
                </Link>
                <Link to="/student/bookings" className={linkClass('/student/bookings')}>
                  My Bookings
                </Link>
              </>
            )}

            {isAuthenticated && role === 'scanner' && (
              <Link to="/scanner" className={linkClass('/scanner')}>
                <span className="flex items-center space-x-1.5">
                  <QrIcon className="w-4 h-4" />
                  <span>QR Scanner</span>
                </span>
              </Link>
            )}

            {isAuthenticated && role === 'admin' && (
              <>
                <Link to="/admin" className={linkClass('/admin')}>
                  Dashboard
                </Link>
                <Link to="/admin/buses" className={linkClass('/admin/buses')}>
                  Buses
                </Link>
                <Link to="/admin/routes" className={linkClass('/admin/routes')}>
                  Routes
                </Link>
                <Link to="/admin/bookings" className={linkClass('/admin/bookings')}>
                  Bookings
                </Link>
                <Link to="/admin/users" className={linkClass('/admin/users')}>
                  Users
                </Link>
              </>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-none">
                      {user?.full_name || 'User'}
                    </p>
                    <span
                      className={`inline-block text-[10px] px-1.5 py-0.2 rounded-full border font-mono uppercase mt-0.5 ${roleBadgeColor}`}
                    >
                      {role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOutIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm shadow-indigo-600/30 transition-all hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{user?.full_name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase ${roleBadgeColor}`}
                >
                  {role}
                </span>
              </div>

              {role === 'student' && (
                <>
                  <Link
                    to="/student"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/student/routes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                  >
                    View Routes
                  </Link>
                  <Link
                    to="/student/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {role === 'scanner' && (
                <Link
                  to="/scanner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  QR Scanner
                </Link>
              )}

              {role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/buses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                  >
                    Buses
                  </Link>
                  <Link
                    to="/admin/routes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                  >
                    Routes
                  </Link>
                  <Link
                    to="/admin/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                  >
                    Bookings
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                  >
                    Users
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 bg-indigo-600 text-white rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

