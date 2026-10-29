import React, { useState, useEffect } from 'react';
import { routesApi } from '../../api/routes';
import { busesApi } from '../../api/buses';
import toast from 'react-hot-toast';
import { BusIcon, PlusIcon, TrashIcon, RefreshIcon, ClockIcon } from '../../components/Icons';

export default function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // Form State
  const [routeName, setRouteName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('08:00:00');
  const [arrivalTime, setArrivalTime] = useState('09:00:00');
  const [fare, setFare] = useState(50);
  const [availableSeats, setAvailableSeats] = useState(40);
  const [busId, setBusId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [routesData, busesData] = await Promise.all([
        routesApi.getRoutes(),
        busesApi.getBuses(),
      ]);
      setRoutes(routesData);
      setBuses(busesData);
      if (busesData.length > 0 && !busId) {
        setBusId(busesData[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load routes and fleet data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRoute(null);
    setRouteName('');
    setOrigin('');
    setDestination('');
    setDepartureTime('08:00:00');
    setArrivalTime('09:00:00');
    setFare(50);
    setAvailableSeats(40);
    if (buses.length > 0) setBusId(buses[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingRoute(r);
    setRouteName(r.route_name);
    setOrigin(r.origin);
    setDestination(r.destination);
    setDepartureTime(r.departure_time || '08:00:00');
    setArrivalTime(r.arrival_time || '09:00:00');
    setFare(r.fare);
    setAvailableSeats(r.available_seats);
    setBusId(r.bus_id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!routeName || !origin || !destination || !busId) {
      toast.error('Please complete all route fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        route_name: routeName,
        origin,
        destination,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        fare: parseFloat(fare),
        available_seats: parseInt(availableSeats, 10),
        bus_id: parseInt(busId, 10),
      };

      if (editingRoute) {
        await routesApi.updateRoute(editingRoute.id, payload);
        toast.success('Route updated successfully');
      } else {
        await routesApi.createRoute(payload);
        toast.success('New route created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to save route';
      toast.error(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      await routesApi.deleteRoute(id);
      toast.success('Route deleted');
      fetchData();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to delete route';
      toast.error(detail);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Route & Schedule Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure transit lines, departure/arrival schedules, bus allocations, and seat fares.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create New Route</span>
          </button>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading routes...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="py-16 text-center">
            <BusIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Routes Found</h3>
            <p className="text-sm text-slate-400 mb-4">Click "Create New Route" to establish your first bus line.</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500"
            >
              Add First Route
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase font-mono tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">Route Name</th>
                  <th className="py-4 px-6">Origin → Destination</th>
                  <th className="py-4 px-6">Timings</th>
                  <th className="py-4 px-6">Seats Left</th>
                  <th className="py-4 px-6">Fare</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {routes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      {r.route_name}
                      <span className="block text-[11px] text-slate-500 font-mono">Bus #{r.bus_id}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      <span className="text-white font-medium">{r.origin}</span>
                      <span className="text-slate-500 mx-2">→</span>
                      <span className="text-white font-medium">{r.destination}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {r.departure_time} - {r.arrival_time}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {r.available_seats} seats
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white font-mono">₹{r.fare}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(r)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoute(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Route"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {editingRoute ? 'Edit Campus Route' : 'Configure New Route'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Define transit stations, schedules, and bus capacity.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Route Name</label>
                <input
                  type="text"
                  required
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g. North Gate Express"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Origin Point</label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Hostel Block A"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Destination Point</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Main Campus Auditorium"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Departure Time</label>
                  <input
                    type="text"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="08:00:00"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Arrival Time</label>
                  <input
                    type="text"
                    required
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="08:45:00"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Bus</label>
                  <select
                    value={busId}
                    onChange={(e) => setBusId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  >
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bus_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={availableSeats}
                    onChange={(e) => setAvailableSeats(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fare (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={fare}
                    onChange={(e) => setFare(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingRoute ? 'Update Route' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

