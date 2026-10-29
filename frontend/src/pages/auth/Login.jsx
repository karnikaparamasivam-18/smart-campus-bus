import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { BusIcon, UserIcon } from '../../components/Icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await login(email, password);
      toast.success(`Welcome back, ${profile.full_name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else {
        if (profile.role === 'admin') navigate('/admin');
        else if (profile.role === 'scanner') navigate('/scanner');
        else navigate('/student');
      }
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail || 'Invalid email or password';
      toast.error(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for testing/evaluating
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-4">
          <BusIcon className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            register for a new student account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/30 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Quick Fill Demo Helpers */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Fill Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('student@test.com', 'password123')}
                className="text-xs py-2 px-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors text-center"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('scanner@test.com', 'password123')}
                className="text-xs py-2 px-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors text-center"
              >
                Scanner
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@test.com', 'password123')}
                className="text-xs py-2 px-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 transition-colors text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

