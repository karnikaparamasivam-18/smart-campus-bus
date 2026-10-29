import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { routesApi } from '../../api/routes';
import toast from 'react-hot-toast';
import { BusIcon, ClockIcon, ArrowRightIcon, RefreshIcon } from '../../components/Icons';

export default function ViewRoutes() {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const data = await routesApi.getRoutes();
      setRoutes(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load campus bus routes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const filteredRoutes = routes.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.route_name?.toLowerCase().includes(term) ||
      r.origin?.toLowerCase().includes(term) ||
      r.destination?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Available Bus Routes</h1>
          <p className="text-sm text-slate-400 mt-1">
            Check real-time route schedules, bus capacities, and reserve your seat.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by origin, destination..."
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          />
          <button
            onClick={fetchRoutes}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh routes"
          >
            <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching active bus routes...</p>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <BusIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Routes Found</h3>
          <p className="text-sm text-slate-400">
            {searchTerm
              ? `No routes match "${searchTerm}". Try a different keyword.`
              : 'There are currently no active routes scheduled. Please check back later.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-indigo-500/5 group"
            >
              <div>
                {/* Route Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Route #{route.id}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      route.available_seats > 5
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : route.available_seats > 0
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {route.available_seats > 0
                      ? `${route.available_seats} seats left`
                      : 'Sold Out'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {route.route_name}
                </h3>

                {/* Origin to Destination */}
                <div className="space-y-2 py-3 px-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-4 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">From:</span>
                    <span className="font-semibold text-white">{route.origin}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">To:</span>
                    <span className="font-semibold text-white">{route.destination}</span>
                  </div>
                </div>

                {/* Times & Bus info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-6">
                  <div className="flex items-center space-x-1.5">
                    <ClockIcon className="w-4 h-4 text-indigo-400" />
                    <span>Departs: <strong className="text-white">{route.departure_time}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <ClockIcon className="w-4 h-4 text-violet-400" />
                    <span>Arrives: <strong className="text-white">{route.arrival_time}</strong></span>
                  </div>
                </div>
              </div>

              {/* Bottom Fare & Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-mono">Fare</span>
                  <span className="text-xl font-extrabold text-white">
                    ₹{route.fare}
                  </span>
                </div>

                <Link
                  to={`/student/book/${route.id}`}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all hover:scale-105"
                >
                  <span>Select & Book</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
