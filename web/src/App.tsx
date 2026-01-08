import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

const API_URL = 'http://localhost:4000/api';

// Google OAuth Client ID - Replace with your actual client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id';
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || 'your_facebook_app_id';

// ==================== AUTH API ====================

const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    return res.json();
  },

  register: async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role: 'TRAVELER' }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }
    return res.json();
  },

  googleAuth: async (credential: string) => {
    const res = await fetch(`${API_URL}/oauth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Google login failed');
    }
    return res.json();
  },

  facebookAuth: async (accessToken: string) => {
    const res = await fetch(`${API_URL}/oauth/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Facebook login failed');
    }
    return res.json();
  },
};

// ==================== COMPONENTS ====================

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => {
  const colors: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700',
    trust: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
};

const TrustScore = ({ score }: { score: number }) => (
  <div className="flex items-center gap-1">
    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
      <span className="text-white text-xs font-bold">{score}</span>
    </div>
    <span className="text-xs text-gray-500">Trust Score</span>
  </div>
);

const BottomNav = () => {
  const { activeTab, setActiveTab } = useStore();
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'explore', icon: '🗺️', label: 'Explore' },
    { id: 'bookings', icon: '📅', label: 'Bookings' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-[430px] mx-auto flex justify-around">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={tab.id === 'home' ? '/' : `/${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs mt-1">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

// ==================== AUTH PAGES ====================

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: 'traveler',
        avatar: data.user.avatar,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Initialize Google Sign-In
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            setLoading(true);
            const data = await authApi.googleAuth(response.credential);
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: 'traveler',
              avatar: data.user.avatar,
            });
            navigate('/');
          } catch (err: any) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
      });
      google.accounts.id.prompt();
    } else {
      setError('Google Sign-In not available. Please add your Google Client ID.');
    }
  };

  const handleFacebookLogin = () => {
    if (typeof FB !== 'undefined') {
      FB.login(async (response: any) => {
        if (response.authResponse) {
          try {
            setLoading(true);
            const data = await authApi.facebookAuth(response.authResponse.accessToken);
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: 'traveler',
              avatar: data.user.avatar,
            });
            navigate('/');
          } catch (err: any) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
      }, { scope: 'email,public_profile' });
    } else {
      setError('Facebook Login not available. Please add your Facebook App ID.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌏</div>
          <h1 className="text-3xl font-bold text-white">LocalLink</h1>
          <p className="text-white mt-2">Travel human. Travel safe.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md mx-auto w-full">
          <h2 className="text-xl font-bold text-center mb-6">Welcome Back</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#166FE5] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-medium">Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-500 font-medium">Sign up</Link>
          </p>
        </div>

        {/* Demo Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setUser({ id: '1', email: 'demo@test.com', name: 'Demo User', role: 'traveler' });
              navigate('/');
            }}
            className="text-white/80 underline text-sm"
          >
            Continue as Demo User
          </button>
        </div>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.register(email, password, name);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: 'traveler',
        avatar: data.user.avatar,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌏</div>
          <h1 className="text-3xl font-bold text-white">LocalLink</h1>
          <p className="text-white mt-2">Join our community</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md mx-auto w-full">
          <h2 className="text-xl font-bold text-center mb-6">Create Account</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGES ====================

const HomePage = () => {
  const { experiences, services, user } = useStore();

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/90 text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold">{user?.name || 'Traveler'}</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              🔔
            </button>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              🛡️
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="What would you like to explore?"
            className="w-full px-4 py-3 pl-12 rounded-xl bg-white text-gray-800 placeholder-gray-400"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: '🏛️', label: 'Culture' },
              { icon: '🍜', label: 'Food' },
              { icon: '🏔️', label: 'Adventure' },
              { icon: '🧘', label: 'Wellness' },
            ].map(cat => (
              <Link key={cat.label} to="/explore" className="flex flex-col items-center">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-1">
                  {cat.icon}
                </div>
                <span className="text-xs text-gray-600">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Experiences */}
      <section className="mt-6 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Popular Experiences</h2>
          <Link to="/explore" className="text-orange-500 text-sm">See all</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {experiences.slice(0, 4).map(exp => (
            <Link key={exp.id} to={`/experience/${exp.id}`} className="flex-shrink-0 w-64">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-36">
                  <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <Badge variant="trust">Trust {exp.trustScore}</Badge>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{exp.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">with {exp.guide}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{exp.rating}</span>
                      <span className="text-xs text-gray-400">({exp.reviews})</span>
                    </div>
                    <span className="font-bold text-orange-500">${exp.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Micro-Services */}
      <section className="mt-6 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Need Help?</h2>
          <Link to="/services" className="text-orange-500 text-sm">See all</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {services.slice(0, 6).map(service => (
            <div key={service.id} className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl mb-1">{service.icon}</div>
              <p className="text-xs font-medium">{service.title}</p>
              <p className="text-xs text-orange-500 font-bold">${service.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Guides */}
      <section className="mt-6 px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Top Rated Guides</h2>
          <Link to="/explore" className="text-orange-500 text-sm">See all</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {useStore.getState().guides.slice(0, 4).map(guide => (
            <Link key={guide.id} to={`/guide/${guide.id}`} className="flex-shrink-0 text-center">
              <img
                src={guide.avatar}
                alt={guide.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-500 mb-2"
              />
              <p className="text-xs font-medium">{guide.name.split(' ')[0]}</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-yellow-500 text-xs">★</span>
                <span className="text-xs">{guide.rating}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const ExplorePage = () => {
  const { experiences } = useStore();
  const [category, setCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'culture', label: 'Culture', icon: '🏛️' },
    { id: 'food', label: 'Food', icon: '🍜' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
  ];

  const filtered = category === 'all'
    ? experiences
    : experiences.filter(e => e.category === category);

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-40 px-4 py-4 border-b">
        <h1 className="text-xl font-bold mb-4">Explore</h1>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                category === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filtered.map(exp => (
          <Link key={exp.id} to={`/experience/${exp.id}`}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex">
              <img src={exp.image} alt={exp.title} className="w-28 h-28 object-cover" />
              <div className="flex-1 p-3">
                <div className="flex gap-1 mb-1">
                  {exp.badges.slice(0, 2).map(b => (
                    <Badge key={b} variant="success">{b}</Badge>
                  ))}
                </div>
                <h3 className="font-semibold text-sm mb-1">{exp.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{exp.duration} - {exp.difficulty}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm">{exp.rating}</span>
                    <span className="text-xs text-gray-400">({exp.reviews})</span>
                  </div>
                  <span className="font-bold text-orange-500">${exp.price}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const ExperienceDetailPage = () => {
  const { id } = useParams();
  const { getExperienceById, getGuideById, isAuthenticated } = useStore();
  const navigate = useNavigate();

  const experience = getExperienceById(Number(id));
  const guide = experience ? getGuideById(experience.guideId) : undefined;

  if (!experience) {
    return <div className="p-4">Experience not found</div>;
  }

  return (
    <div className="pb-24">
      {/* Hero Image */}
      <div className="relative h-64">
        <img src={experience.image} alt={experience.title} className="w-full h-full object-cover" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center"
        >
          ←
        </button>
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
          ♡
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Title & Badges */}
        <div className="flex gap-2 mb-2">
          {experience.badges.map(b => (
            <Badge key={b} variant="success">{b}</Badge>
          ))}
        </div>
        <h1 className="text-2xl font-bold mb-2">{experience.title}</h1>

        {/* Rating & Trust */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">{experience.rating}</span>
            <span className="text-gray-400">({experience.reviews} reviews)</span>
          </div>
          <TrustScore score={experience.trustScore} />
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">{experience.description}</p>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg">⏱️</p>
            <p className="text-sm font-medium">{experience.duration}</p>
            <p className="text-xs text-gray-500">Duration</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg">👥</p>
            <p className="text-sm font-medium">{experience.groupSize}</p>
            <p className="text-xs text-gray-500">Group Size</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg">📍</p>
            <p className="text-sm font-medium">{experience.difficulty}</p>
            <p className="text-xs text-gray-500">Difficulty</p>
          </div>
        </div>

        {/* What's Included */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">What's Included</h2>
          <div className="space-y-2">
            {experience.includes.map(item => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guide */}
        {guide && (
          <Link to={`/guide/${guide.id}`} className="block mb-6">
            <h2 className="font-bold mb-3">Your Guide</h2>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
              <img src={guide.avatar} alt={guide.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{guide.name}</p>
                <p className="text-sm text-gray-500">{guide.level}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm">{guide.rating}</span>
                  <span className="text-xs text-gray-400">- {guide.tours} tours</span>
                </div>
              </div>
              <TrustScore score={guide.trustScore} />
            </div>
          </Link>
        )}

        {/* Meeting Point */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">Meeting Point</h2>
          <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center text-gray-400">
            📍 {experience.meetingPoint}
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3 z-40">
        <div className="max-w-[430px] mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="text-2xl font-bold text-orange-500">${experience.price}<span className="text-sm text-gray-400">/person</span></p>
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                navigate(`/book/${experience.id}`);
              }
            }}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

const GuideDetailPage = () => {
  const { id } = useParams();
  const { getGuideById, experiences } = useStore();
  const navigate = useNavigate();

  const guide = getGuideById(Number(id));
  const guideExperiences = experiences.filter(e => e.guideId === Number(id));

  if (!guide) {
    return <div className="p-4">Guide not found</div>;
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4"
        >
          ←
        </button>
      </div>

      <div className="px-4 -mt-16">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <img src={guide.avatar} alt={guide.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{guide.name}</h1>
              <p className="text-orange-500 text-sm font-medium">{guide.level}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{guide.rating}</span>
                <span className="text-gray-400 text-sm">({guide.reviews} reviews)</span>
              </div>
            </div>
            <TrustScore score={guide.trustScore} />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-xl font-bold">{guide.tours}</p>
              <p className="text-xs text-gray-500">Tours</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{guide.reviews}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{guide.memberSince}</p>
              <p className="text-xs text-gray-500">Member Since</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {guide.badges.map(badge => (
            <Badge key={badge} variant="success">{badge}</Badge>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-2">About</h2>
          <p className="text-gray-600">{guide.bio}</p>
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-2">Languages</h2>
          <div className="flex gap-2">
            {guide.languages.map(lang => (
              <span key={lang} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{lang}</span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-2">Specialties</h2>
          <div className="flex gap-2">
            {guide.specialties.map(spec => (
              <span key={spec} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">{spec}</span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-3">Experiences by {guide.name.split(' ')[0]}</h2>
          <div className="space-y-3">
            {guideExperiences.map(exp => (
              <Link key={exp.id} to={`/experience/${exp.id}`}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden flex">
                  <img src={exp.image} alt={exp.title} className="w-24 h-24 object-cover" />
                  <div className="flex-1 p-3">
                    <h3 className="font-semibold text-sm">{exp.title}</h3>
                    <p className="text-xs text-gray-500">{exp.duration}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs">{exp.rating}</span>
                      </div>
                      <span className="font-bold text-orange-500">${exp.price}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingsPage = () => {
  const { bookings, getExperienceById, getGuideById, isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-40 px-4 py-4 border-b">
        <h1 className="text-xl font-bold">My Bookings</h1>
      </div>

      <div className="p-4 space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="font-bold text-lg mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-4">Start exploring experiences!</p>
            <Link to="/explore" className="text-orange-500 font-medium">Browse Experiences</Link>
          </div>
        ) : (
          bookings.map(booking => {
            const exp = getExperienceById(booking.experienceId);
            const guide = exp ? getGuideById(exp.guideId) : undefined;

            return (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex">
                  <img src={exp?.image} alt={exp?.title} className="w-28 h-28 object-cover" />
                  <div className="flex-1 p-3">
                    <div className="flex justify-between">
                      <Badge variant={booking.status === 'upcoming' ? 'primary' : 'default'}>
                        {booking.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{booking.date}</span>
                    </div>
                    <h3 className="font-semibold text-sm mt-1">{exp?.title}</h3>
                    <p className="text-xs text-gray-500">with {guide?.name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs">{booking.time} - {booking.people} guests</span>
                      <span className="font-bold text-orange-500">${booking.total}</span>
                    </div>
                  </div>
                </div>
                {booking.status === 'upcoming' && (
                  <div className="border-t p-3 flex gap-2">
                    <button className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
                      Start Experience
                    </button>
                    <button className="flex-1 py-2 border border-gray-200 rounded-lg text-sm">
                      Message Guide
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const MessagesPage = () => {
  const { guides, isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-40 px-4 py-4 border-b">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      <div className="divide-y">
        {guides.slice(0, 3).map(guide => (
          <div key={guide.id} className="px-4 py-3 flex items-center gap-3">
            <img src={guide.avatar} alt={guide.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-semibold text-sm">{guide.name}</p>
                <p className="text-xs text-gray-400">2h ago</p>
              </div>
              <p className="text-sm text-gray-500 truncate">Looking forward to seeing you tomorrow!</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, setUser, isAuthenticated } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-white/90">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {[
          { icon: '📅', label: 'My Bookings', path: '/bookings' },
          { icon: '❤️', label: 'Saved Experiences' },
          { icon: '💳', label: 'Payment Methods' },
          { icon: '🔔', label: 'Notifications' },
          { icon: '🛡️', label: 'Safety Center' },
          { icon: '❓', label: 'Help & Support' },
          { icon: '⚙️', label: 'Settings' },
        ].map(item => (
          <Link
            key={item.label}
            to={item.path || '#'}
            className="flex items-center justify-between p-4 bg-white rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="w-full mt-4 p-4 text-red-500 bg-white rounded-xl text-center"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const { id } = useParams();
  const { getExperienceById, addBooking, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState('2024-12-26');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const experience = getExperienceById(Number(id));

  if (!experience) {
    return <div className="p-4">Experience not found</div>;
  }

  const total = experience.price * guests + 5;

  const handleBook = () => {
    addBooking({
      experienceId: experience.id,
      date: date,
      time: '9:00 AM',
      status: 'upcoming',
      people: guests,
      total,
    });
    navigate('/bookings');
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-white z-40 px-4 py-4 border-b flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-xl">←</button>
        <h1 className="text-xl font-bold">Confirm Booking</h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex mb-6">
          <img src={experience.image} alt={experience.title} className="w-24 h-24 object-cover" />
          <div className="flex-1 p-3">
            <h3 className="font-semibold">{experience.title}</h3>
            <p className="text-sm text-gray-500">{experience.duration} - {experience.difficulty}</p>
            <p className="text-sm text-gray-500">with {experience.guide}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-3">Select Date</h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-3">Number of Guests</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-10 h-10 border rounded-full"
            >
              -
            </button>
            <span className="text-xl font-bold">{guests}</span>
            <button
              onClick={() => setGuests(Math.min(10, guests + 1))}
              className="w-10 h-10 border rounded-full"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h2 className="font-bold mb-3">Price Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>${experience.price} x {guests} guests</span>
              <span>${experience.price * guests}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>$5</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-500">${total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3 z-40">
        <div className="max-w-[430px] mx-auto">
          <button
            onClick={handleBook}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold"
          >
            Confirm Booking - ${total}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== APP ====================

// Declare global types for OAuth SDKs
declare global {
  interface Window {
    google?: any;
    FB?: any;
  }
}
const google = typeof window !== 'undefined' ? window.google : undefined;
const FB = typeof window !== 'undefined' ? window.FB : undefined;

function App() {
  const { setUser, isAuthenticated } = useStore();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: 'traveler',
          avatar: userData.avatar,
        });
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [setUser]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <SignupPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/experience/:id" element={<ExperienceDetailPage />} />
          <Route path="/guide/:id" element={<GuideDetailPage />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
