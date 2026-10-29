import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import toast from 'react-hot-toast';
import {
  BusIcon,
  TicketIcon,
  UserIcon,
  ShieldIcon,
  ArrowRightIcon,
  RefreshIcon,
  CheckCircleIcon,
} from '../../components/Icons';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            Transit Operations
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time overview of users, bookings, routes, and campus bus fleets.
          </p>
        </div>

        <button
          onClick={fetchSummary}
          className="self-start md:self-auto p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Refresh summary"
        >
          <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading system metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Total Users
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {summary?.total_users || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <UserIcon className="w-6 h-6" />
              </div>
            </div>
            <Link
              to="/admin/users"
              className="mt-4 text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
            >
              <span>Manage users</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Total Bookings
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {summary?.total_bookings || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TicketIcon className="w-6 h-6" />
              </div>
            </div>
            <Link
              to="/admin/bookings"
              className="mt-4 text-xs font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center space-x-1"
            >
              <span>View all bookings</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Active Routes
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {summary?.total_routes || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <BusIcon className="w-6 h-6" />
              </div>
            </div>
            <Link
              to="/admin/routes"
              className="mt-4 text-xs font-medium text-amber-400 hover:text-amber-300 inline-flex items-center space-x-1"
            >
              <span>Manage routes</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Active Buses
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {summary?.total_buses || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <ShieldIcon className="w-6 h-6" />
              </div>
            </div>
            <Link
              to="/admin/buses"
              className="mt-4 text-xs font-medium text-violet-400 hover:text-violet-300 inline-flex items-center space-x-1"
            >
              <span>Manage fleet</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Action Navigator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/buses"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex items-center justify-between group transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BusIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                Bus Fleet Management
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Register new buses, adjust seating capacities, and toggle fleet availability.
              </p>
            </div>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          to="/admin/routes"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex items-center justify-between group transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TicketIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                Route & Schedule Configuration
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Create pickup points, set departures and arrival schedules, and update seat fares.
              </p>
            </div>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
        </Link>
      </div>
    </div>
  );
}
