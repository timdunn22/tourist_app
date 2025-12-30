import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Demo registration
    setUser({ id: Date.now(), name: formData.name, email: formData.email, role: 'traveler' });
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
          <h1 className="text-2xl font-bold text-gray-800">Create an account</h1>
          <p className="text-gray-500">Start your journey with LocalLink</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="input" placeholder="John Doe" required
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input" placeholder="you@example.com" required
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="input" placeholder="••••••••" required
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" className="input" placeholder="••••••••" required
              value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary w-full">Create Account</button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
