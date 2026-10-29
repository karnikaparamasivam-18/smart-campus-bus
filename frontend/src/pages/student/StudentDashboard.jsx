import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi } from '../../api/bookings';
import { routesApi } from '../../api/routes';
import { BusIcon, TicketIcon, QrIcon, ArrowRightIcon, CalendarIcon, ClockIcon } from '../../components/Icons';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [routesCount, setRoutesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookingsData, routesData] = await Promise.all([
          bookingsApi.getMyBookings(),
          routesApi.getRoutes(),
        ]);
        setRecentBookings(bookingsData.slice(0, 3));
        setRoutesCount(routesData.length);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-3">
            Student Transit Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Welcome, {user?.full_name}!
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-6">
            Book your campus rides effortlessly, view interactive route schedules, and access your digital QR boarding passes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/student/routes"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
            >
              <BusIcon className="w-4 h-4" />
              <span>Explore Routes</span>
            </Link>
            <Link
              to="/student/bookings"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <TicketIcon className="w-4 h-4" />
              <span>View My Bookings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics & Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Active Routes
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">{routesCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BusIcon className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/student/routes"
            className="mt-4 text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
          >
            <span>Book a seat</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                My Bookings
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">{recentBookings.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TicketIcon className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/student/bookings"
            className="mt-4 text-xs font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center space-x-1"
          >
            <span>View passes & QR</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Digital Boarding
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">QR Pass</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <QrIcon className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Show QR code to the coordinator upon boarding
          </p>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <Link
            to="/student/bookings"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading bookings...</p>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <TicketIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-medium text-sm">No bookings found yet.</p>
            <p className="text-slate-500 text-xs mt-1">Book your first campus bus ride today!</p>
            <Link
              to="/student/routes"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Browse Routes
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentBookings.map((b) => (
              <div key={b.id} className="py-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-semibold text-white text-sm">
                    Booking #{b.booking_reference}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
                    <span className="flex items-center space-x-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>{new Date(b.travel_date).toLocaleDateString()}</span>
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full uppercase font-mono font-semibold ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : b.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {b.status}
                  </span>
                  <Link
                    to="/student/bookings"
                    className="text-xs font-medium text-slate-300 hover:text-white underline"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

