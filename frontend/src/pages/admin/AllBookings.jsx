import React, { useState, useEffect } from 'react';
import { bookingsApi } from '../../api/bookings';
import toast from 'react-hot-toast';
import { TicketIcon, CalendarIcon, RefreshIcon } from '../../components/Icons';

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingsApi.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load master booking registry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      b.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      b.booking_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.student_id?.toString().includes(searchQuery) ||
      b.route_id?.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'used':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Master Bookings Registry</h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete log of student seat reservations, payment statuses, and boarding timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference #..."
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="USED">Boarded / Used</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={fetchBookings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading all bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <TicketIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Bookings Found</h3>
            <p className="text-sm text-slate-400">No bookings match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase font-mono tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Student ID</th>
                  <th className="py-4 px-6">Route ID</th>
                  <th className="py-4 px-6">Travel Date</th>
                  <th className="py-4 px-6">Created On</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-white">
                      #{b.booking_reference}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      User #{b.student_id}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-indigo-400">
                      Route #{b.route_id}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300 font-mono">
                      {new Date(b.travel_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold border ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
