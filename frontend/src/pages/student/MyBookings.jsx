import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../../api/bookings';
import { routesApi } from '../../api/routes';
import toast from 'react-hot-toast';
import {
  TicketIcon,
  QrIcon,
  CalendarIcon,
  ClockIcon,
  TrashIcon,
  CreditCardIcon,
  RefreshIcon,
  BusIcon,
} from '../../components/Icons';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [routesMap, setRoutesMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedQR, setSelectedQR] = useState(null); // stores booking for QR modal

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, routesData] = await Promise.all([
        bookingsApi.getMyBookings(),
        routesApi.getRoutes().catch(() => []),
      ]);
      setBookings(bookingsData);
      const map = {};
      routesData.forEach((r) => {
        map[r.id] = r;
      });
      setRoutesMap(map);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsApi.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to cancel booking';
      toast.error(detail);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status?.toLowerCase() === statusFilter.toLowerCase();
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Campus Bus Bookings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Access your QR boarding passes, payment receipts, and manage seat reservations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending Payment</option>
            <option value="USED">Boarded / Used</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={fetchBookings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh bookings"
          >
            <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <TicketIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Bookings Found</h3>
          <p className="text-sm text-slate-400 mb-6">
            {statusFilter !== 'ALL'
              ? `You don't have any ${statusFilter.toLowerCase()} bookings.`
              : "You haven't reserved any campus bus rides yet."}
          </p>
          <Link
            to="/student/routes"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all inline-block"
          >
            Browse Bus Routes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((b) => {
            const routeInfo = routesMap[b.route_id];
            return (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                      #{b.booking_reference}
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold border ${getStatusBadge(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {routeInfo && (
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <BusIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{routeInfo.route_name}</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {routeInfo.origin} → {routeInfo.destination}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 py-3 border-y border-slate-800/80 my-3 text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-400" />
                      <span>
                        Travel Date:{' '}
                        <strong className="text-white">
                          {new Date(b.travel_date).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-violet-400" />
                      <span>
                        Booked On:{' '}
                        <span className="text-slate-400">
                          {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => setSelectedQR(b)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <QrIcon className="w-4 h-4" />
                      <span>View QR Pass</span>
                    </button>
                  )}

                  {b.status === 'pending' && (
                    <Link
                      to={`/student/payment/${b.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <CreditCardIcon className="w-4 h-4" />
                      <span>Pay Now</span>
                    </Link>
                  )}

                  {b.status !== 'cancelled' && b.status !== 'used' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Cancel Booking"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Boarding Pass Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedQR(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                Valid Boarding Ticket
              </span>
              <h3 className="text-xl font-bold text-white mt-3">Campus Bus Pass</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Ref: {selectedQR.booking_reference}
              </p>
              {routesMap[selectedQR.route_id] && (
                <p className="text-xs text-indigo-400 font-semibold mt-1">
                  {routesMap[selectedQR.route_id].route_name}
                </p>
              )}
            </div>

            {/* QR Code container */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              {selectedQR.qr_code ? (
                <img
                  src={`data:image/png;base64,${selectedQR.qr_code}`}
                  alt="QR Boarding Pass"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs font-mono">
                  No QR Generated
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>Show this QR code to the bus coordinator when boarding.</p>
              <p className="font-semibold text-slate-300">
                Date: {new Date(selectedQR.travel_date).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => setSelectedQR(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
