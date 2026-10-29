import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { routesApi } from '../../api/routes';
import { bookingsApi } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { BusIcon, CalendarIcon, ClockIcon, ArrowRightIcon } from '../../components/Icons';

export default function BookTicket() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [route, setRoute] = useState(null);
  const [travelDate, setTravelDate] = useState(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const data = await routesApi.getRouteById(routeId);
        setRoute(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to retrieve route details');
        navigate('/student/routes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [routeId, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!travelDate) {
      toast.error('Please select a valid travel date');
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects travel_date in ISO datetime format
      const formattedDate = new Date(`${travelDate}T${route.departure_time || '08:00:00'}`).toISOString();

      const booking = await bookingsApi.createBooking(parseInt(routeId, 10), formattedDate);
      toast.success('Seat reserved! Proceeding to payment confirmation.');
      navigate(`/student/payment/${booking.id}`);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Unable to book seat. Please try again.';
      toast.error(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Loading route booking...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/student/routes"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
        >
          <span>← Back to Routes</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
          Reserve Campus Bus Seat
        </h1>
        <p className="text-sm text-slate-400">
          Confirm your travel schedule and passenger information.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Route Details Card */}
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-semibold">
              Selected Route
            </span>
            <span className="text-sm font-extrabold text-white">
              Fare: ₹{route?.fare}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{route?.route_name}</h2>

          <div className="flex items-center space-x-3 text-sm text-slate-300 py-3 border-y border-slate-800 my-4 font-mono">
            <span className="font-semibold text-white">{route?.origin}</span>
            <ArrowRightIcon className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">{route?.destination}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-indigo-400" />
              <span>Departure: <strong className="text-white">{route?.departure_time}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-violet-400" />
              <span>Arrival: <strong className="text-white">{route?.arrival_time}</strong></span>
            </div>
          </div>
        </div>

        {/* Passenger Information */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase font-semibold text-slate-400 tracking-wider">
            Passenger Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Name</span>
              <span className="text-sm font-semibold text-white">{user?.full_name}</span>
            </div>
            <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Email</span>
              <span className="text-sm font-semibold text-white">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Form: Date Selection */}
        <form onSubmit={handleBooking} className="space-y-6 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Date of Travel
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={today}
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any future scheduled date for your transit.
            </p>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-indigo-300 font-medium">Total Amount Payable</span>
            <span className="text-2xl font-extrabold text-white">₹{route?.fare}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirm & Proceed to Payment</span>
                <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
