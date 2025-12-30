import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { login } from '../services/api';

function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      setToken(response.data.token);
      setUser(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUser({
      id: 1,
      name: 'Sarah Miller',
      email: 'sarah@email.com',
      role: 'traveler',
    });
    setToken('demo-token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🌍</span>
            <span className="font-display text-2xl font-bold text-secondary-500">LocalLink</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
          <p className="text-gray-500">Sign in to continue your journey</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={handleDemoLogin}
          className="btn btn-outline w-full"
        >
          Continue as Demo User
        </button>

        <p className="text-center text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 font-semibold hover:text-primary-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
