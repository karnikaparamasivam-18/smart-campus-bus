import React, { useState, useEffect } from 'react';
import { busesApi } from '../../api/buses';
import toast from 'react-hot-toast';
import { BusIcon, PlusIcon, TrashIcon, RefreshIcon } from '../../components/Icons';

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const [busNumber, setBusNumber] = useState('');
  const [totalSeats, setTotalSeats] = useState(40);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBuses = async () => {
    setIsLoading(true);
    try {
      const data = await busesApi.getBuses();
      setBuses(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bus fleet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const openAddModal = () => {
    setEditingBus(null);
    setBusNumber('');
    setTotalSeats(40);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setBusNumber(bus.bus_number);
    setTotalSeats(bus.total_seats);
    setIsActive(bus.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!busNumber.trim()) {
      toast.error('Bus number is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBus) {
        await busesApi.updateBus(editingBus.id, {
          bus_number: busNumber.trim(),
          total_seats: parseInt(totalSeats, 10),
          is_active: isActive,
        });
        toast.success('Bus details updated successfully');
      } else {
        await busesApi.createBus({
          bus_number: busNumber.trim(),
          total_seats: parseInt(totalSeats, 10),
        });
        toast.success('New bus added to fleet');
      }
      setIsModalOpen(false);
      fetchBuses();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to save bus';
      toast.error(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;

    try {
      await busesApi.deleteBus(busId);
      toast.success('Bus deleted successfully');
      fetchBuses();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to delete bus';
      toast.error(detail);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Bus Fleet Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Register and manage campus buses, capacities, and service statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchBuses}
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
            <span>Add New Bus</span>
          </button>
        </div>
      </div>

      {/* Buses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading fleet data...</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="py-16 text-center">
            <BusIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Buses Registered</h3>
            <p className="text-sm text-slate-400 mb-4">Click "Add New Bus" to start building your fleet.</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500"
            >
              Add First Bus
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase font-mono tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Bus Number</th>
                  <th className="py-4 px-6">Total Seats</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">#{bus.id}</td>
                    <td className="py-4 px-6 font-bold text-white flex items-center space-x-2">
                      <BusIcon className="w-4 h-4 text-indigo-400" />
                      <span>{bus.bus_number}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-mono">{bus.total_seats} seats</td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold border ${
                          bus.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {bus.is_active ? 'In Service' : 'Maintenance'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(bus)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBus(bus.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Bus"
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

      {/* Add / Edit Bus Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {editingBus ? 'Edit Bus Fleet Details' : 'Register New Campus Bus'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure license number and seating specifications.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bus Registration / ID
                </label>
                <input
                  type="text"
                  required
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  placeholder="e.g. BUS-101"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Total Seat Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {editingBus && (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="isActive" className="text-xs text-slate-300">
                    Active (Ready for scheduled routes)
                  </label>
                </div>
              )}

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
                  {isSubmitting ? 'Saving...' : editingBus ? 'Update Bus' : 'Create Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
