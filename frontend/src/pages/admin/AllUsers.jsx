
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import toast from 'react-hot-toast';
import { UserIcon, RefreshIcon } from '../../components/Icons';

const emptyStaff = {
  full_name: '',
  email: '',
  password: '',
  role: 'scanner',
};

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [staff, setStaff] = useState(emptyStaff);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createStaff = async (e) => {
    e.preventDefault();

    if (!staff.full_name.trim()) {
      toast.error('Enter a full name');
      return;
    }

    if (staff.password.length < 12) {
      toast.error('Password must have at least 12 characters');
      return;
    }

    setCreating(true);

    try {
      await adminApi.createStaff({
        ...staff,
        full_name: staff.full_name.trim(),
        email: staff.email.trim().toLowerCase(),
      });

      toast.success('Staff account created successfully');
      setStaff(emptyStaff);
      setShowCreate(false);
      await fetchUsers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(
        typeof detail === 'string'
          ? detail
          : 'Could not create staff account'
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      roleFilter === 'ALL' ||
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    const term = search.toLowerCase();

    const matchesSearch =
      user.full_name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term);

    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'scanner':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const fieldClass =
    'w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            System User Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage students, scanners and administrators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className={fieldClass}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={fieldClass}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="SCANNER">Scanners</option>
            <option value="ADMIN">Admins</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-3 rounded-xl bg-slate-800 text-white"
            title="Refresh users"
          >
            <RefreshIcon
              className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Staff creation */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Staff Account Management
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Create Scanner and Administrator accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            {showCreate ? 'Cancel' : '+ Create Staff Account'}
          </button>
        </div>

        {showCreate && (
          <form
            onSubmit={createStaff}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Full Name
              </label>
              <input
                required
                maxLength={100}
                value={staff.full_name}
                onChange={(e) =>
                  setStaff({ ...staff, full_name: e.target.value })
                }
                placeholder="Enter full name"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={staff.email}
                onChange={(e) =>
                  setStaff({ ...staff, email: e.target.value })
                }
                placeholder="Enter staff email"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Temporary Password
              </label>
              <input
                type="password"
                required
                minLength={12}
                value={staff.password}
                onChange={(e) =>
                  setStaff({ ...staff, password: e.target.value })
                }
                placeholder="Minimum 12 characters"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Account Role
              </label>
              <select
                value={staff.role}
                onChange={(e) =>
                  setStaff({ ...staff, role: e.target.value })
                }
                className={fieldClass}
              >
                <option value="scanner">Scanner / Conductor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold"
              >
                {creating ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="mt-3 text-xs text-amber-300">
                Share temporary passwords privately. A mandatory
                password-change flow must be added before production use.
              </p>
            </div>
          </form>
        )}
      </section>

      {/* User directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <UserIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold">No Users Found</h3>
            <p className="text-sm text-slate-400 mt-1">
              No users match your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Full Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-800/40"
                  >
                    <td className="py-4 px-6">#{user.id}</td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {user.full_name}
                    </td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border uppercase ${getRoleBadge(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={
                          user.is_active
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }
                      >
                        {user.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
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
