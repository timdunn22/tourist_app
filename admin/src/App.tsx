import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

// API Setup
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Context
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized');
    }
    localStorage.setItem('admin_token', data.accessToken);
    localStorage.setItem('admin_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
};

// Query Client
const queryClient = new QueryClient();

// ==================== COMPONENTS ====================

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/users', icon: '👥', label: 'Users' },
    { path: '/guides', icon: '🎯', label: 'Guides' },
    { path: '/experiences', icon: '🌍', label: 'Experiences' },
    { path: '/bookings', icon: '📅', label: 'Bookings' },
    { path: '/reviews', icon: '⭐', label: 'Reviews' },
    { path: '/categories', icon: '📁', label: 'Categories' },
    { path: '/services', icon: '🛎️', label: 'Services' },
    { path: '/stays', icon: '🏠', label: 'Stays' },
    { path: '/training', icon: '📚', label: 'Training' },
    { path: '/locations', icon: '📍', label: 'Locations' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
    { path: '/tickets', icon: '🎫', label: 'Support' },
    { path: '/reports', icon: '📈', label: 'Reports' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌏</span>
          <div>
            <h1 className="text-xl font-bold">LocalLink</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-orange-500 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Header = ({ user }: { user: any }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
    <div>
      <h2 className="text-lg font-semibold text-gray-800">Welcome back!</h2>
      <p className="text-sm text-gray-500">Here's what's happening today</p>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-gray-100 rounded-full relative">
        🔔
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <span>👤</span>
        </div>
        <div>
          <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
      </div>
    </div>
  </header>
);

const StatCard = ({ icon, label, value, change, color }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const DataTable = ({ columns, data, onRowClick }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col: any) => (
            <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data?.map((row: any, i: number) => (
          <tr 
            key={row.id || i} 
            className="hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col: any) => (
              <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ==================== PAGES ====================

const LoginPage = ({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) => {
  const [email, setEmail] = useState('admin@locallink.app');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🌏</span>
          <h1 className="text-2xl font-bold mt-4">LocalLink Admin</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Demo: admin@locallink.app / LocalLink2024!
        </p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  // Mock data for demo
  const stats = {
    totalUsers: 12847,
    totalGuides: 342,
    totalExperiences: 1256,
    totalBookings: 8934,
    totalRevenue: 284750,
    pendingApprovals: 23,
    activeBookings: 47,
  };

  const recentBookings = [
    { id: 1, traveler: 'Sarah M.', experience: 'Temple Walk', guide: 'Pemba S.', date: 'Today', status: 'confirmed', total: '$55' },
    { id: 2, traveler: 'John D.', experience: 'Food Tour', guide: 'Sita T.', date: 'Tomorrow', status: 'pending', total: '$36' },
    { id: 3, traveler: 'Emma L.', experience: 'Sunrise Hike', guide: 'Tenzin L.', date: 'Dec 26', status: 'confirmed', total: '$90' },
  ];

  const pendingGuides = [
    { id: 1, name: 'Ram K.', email: 'ram@email.com', applied: '2 days ago', experiences: 3 },
    { id: 2, name: 'Sunita P.', email: 'sunita@email.com', applied: '5 days ago', experiences: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers.toLocaleString()} change={12} color="bg-blue-100" />
        <StatCard icon="🎯" label="Active Guides" value={stats.totalGuides} change={8} color="bg-green-100" />
        <StatCard icon="🌍" label="Experiences" value={stats.totalExperiences} change={15} color="bg-purple-100" />
        <StatCard icon="💰" label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} change={23} color="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard icon="📅" label="Total Bookings" value={stats.totalBookings.toLocaleString()} color="bg-pink-100" />
        <StatCard icon="⏳" label="Pending Approvals" value={stats.pendingApprovals} color="bg-yellow-100" />
        <StatCard icon="🎬" label="Live Experiences" value={stats.activeBookings} color="bg-teal-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold">Recent Bookings</h3>
          </div>
          <DataTable
            columns={[
              { key: 'traveler', label: 'Traveler' },
              { key: 'experience', label: 'Experience' },
              { key: 'guide', label: 'Guide' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status', render: (row: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  row.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {row.status}
                </span>
              )},
              { key: 'total', label: 'Total' },
            ]}
            data={recentBookings}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold">Pending Guide Approvals</h3>
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
              {pendingGuides.length} pending
            </span>
          </div>
          <div className="divide-y">
            {pendingGuides.map((guide) => (
              <div key={guide.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">👤</div>
                  <div>
                    <p className="font-medium">{guide.name}</p>
                    <p className="text-sm text-gray-500">{guide.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'TRAVELER', password: '' });

  // Mock users
  const [users, setUsers] = useState([
    { id: 1, name: 'Sarah Miller', email: 'sarah@email.com', role: 'TRAVELER', status: 'ACTIVE', trips: 5, joined: '2024-01-15' },
    { id: 2, name: 'John Davis', email: 'john@email.com', role: 'TRAVELER', status: 'ACTIVE', trips: 12, joined: '2023-11-20' },
    { id: 3, name: 'Pemba Sherpa', email: 'pemba@email.com', role: 'GUIDE', status: 'ACTIVE', trips: 342, joined: '2019-03-10' },
    { id: 4, name: 'Emma Lee', email: 'emma@email.com', role: 'TRAVELER', status: 'SUSPENDED', trips: 0, joined: '2024-02-01' },
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...users.map(u => u.id)) + 1;
    const today = new Date().toISOString().split('T')[0];
    setUsers([...users, { ...newUser, id: newId, status: 'ACTIVE', trips: 0, joined: today }]);
    setNewUser({ name: '', email: '', role: 'TRAVELER', password: '' });
    setIsModalOpen(false);
    toast.success('User added successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Roles</option>
            <option value="TRAVELER">Travelers</option>
            <option value="GUIDE">Guides</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
        
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (row: any) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">
                  {row.name.charAt(0)}
                </div>
                <span>{row.name}</span>
              </div>
            )},
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.role === 'GUIDE' ? 'bg-blue-100 text-blue-700' : 
                row.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {row.role}
              </span>
            )},
            { key: 'status', label: 'Status', render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {row.status}
              </span>
            )},
            { key: 'trips', label: 'Trips' },
            { key: 'joined', label: 'Joined' },
            { key: 'actions', label: 'Actions', render: () => (
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">✏️</button>
                <button className="p-1 hover:bg-gray-100 rounded">🗑️</button>
              </div>
            )},
          ]}
          data={users}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add User">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="john@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="TRAVELER">Traveler</option>
              <option value="GUIDE">Guide</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Add User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const GuidesPage = () => {
  const guides = [
    { id: 1, name: 'Pemba Sherpa', level: 'PROFESSIONAL', verified: true, trustScore: 98, rating: 4.9, tours: 342, earnings: 15420 },
    { id: 2, name: 'Sita Thapa', level: 'TRAINED', verified: true, trustScore: 95, rating: 4.8, tours: 156, earnings: 8340 },
    { id: 3, name: 'Tenzin Lama', level: 'MASTER', verified: true, trustScore: 99, rating: 5.0, tours: 1205, earnings: 67890 },
    { id: 4, name: 'Ram Tamang', level: 'COMMUNITY', verified: false, trustScore: 75, rating: 4.2, tours: 23, earnings: 1150 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Guides</h1>
        <div className="flex gap-2">
          <button className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">Export</button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
            + Add Guide
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'name', label: 'Guide', render: (row: any) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">👤</div>
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.level}</p>
                </div>
              </div>
            )},
            { key: 'verified', label: 'Verified', render: (row: any) => (
              <span className={row.verified ? 'text-green-500' : 'text-gray-400'}>
                {row.verified ? '✓ Verified' : '○ Pending'}
              </span>
            )},
            { key: 'trustScore', label: 'Trust Score', render: (row: any) => (
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${row.trustScore >= 90 ? 'bg-green-500' : row.trustScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${row.trustScore}%` }}
                  />
                </div>
                <span className="text-sm">{row.trustScore}%</span>
              </div>
            )},
            { key: 'rating', label: 'Rating', render: (row: any) => `⭐ ${row.rating}` },
            { key: 'tours', label: 'Tours' },
            { key: 'earnings', label: 'Earnings', render: (row: any) => `$${row.earnings.toLocaleString()}` },
            { key: 'actions', label: 'Actions', render: (row: any) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">View</button>
                <button className="px-2 py-1 bg-gray-100 rounded text-xs">Edit</button>
              </div>
            )},
          ]}
          data={guides}
        />
      </div>
    </div>
  );
};

const ExperiencesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [experiences, setExperiences] = useState([
    { id: 1, title: 'Hidden Temple Walk', guide: 'Pemba S.', category: 'Culture', price: 25, status: 'PUBLISHED', bookings: 127, rating: 4.9 },
    { id: 2, title: 'Street Food Adventure', guide: 'Sita T.', category: 'Food', price: 18, status: 'PUBLISHED', bookings: 89, rating: 4.8 },
    { id: 3, title: 'Sunrise Hike', guide: 'Tenzin L.', category: 'Adventure', price: 45, status: 'PUBLISHED', bookings: 203, rating: 5.0 },
    { id: 4, title: 'Night Market Tour', guide: 'Ram T.', category: 'Food', price: 15, status: 'PENDING_REVIEW', bookings: 0, rating: 0 },
  ]);

  const handleEdit = (exp: any) => {
    setEditingExp({...exp});
    setIsModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setExperiences(experiences.map(exp => exp.id === editingExp.id ? editingExp : exp));
    setIsModalOpen(false);
    setEditingExp(null);
    toast.success('Experience updated successfully!');
  };

  const handleApprove = (id: number) => {
    setExperiences(experiences.map(exp => exp.id === id ? {...exp, status: 'PUBLISHED'} : exp));
    toast.success('Experience approved!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Experiences</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'title', label: 'Experience' },
            { key: 'guide', label: 'Guide' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price', render: (row: any) => `$${row.price}` },
            { key: 'status', label: 'Status', render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                row.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {row.status.replace('_', ' ')}
              </span>
            )},
            { key: 'bookings', label: 'Bookings' },
            { key: 'rating', label: 'Rating', render: (row: any) => row.rating ? `⭐ ${row.rating}` : '-' },
            { key: 'actions', label: 'Actions', render: (row: any) => (
              <div className="flex gap-2">
                {row.status === 'PENDING_REVIEW' && (
                  <button onClick={() => handleApprove(row.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                )}
                <button onClick={() => handleEdit(row)} className="px-2 py-1 bg-gray-100 rounded text-xs">Edit</button>
              </div>
            )},
          ]}
          data={experiences}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingExp(null); }} title="Edit Experience">
        {editingExp && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={editingExp.title}
                onChange={(e) => setEditingExp({...editingExp, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={editingExp.category}
                onChange={(e) => setEditingExp({...editingExp, category: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Culture">Culture</option>
                <option value="Food">Food</option>
                <option value="Adventure">Adventure</option>
                <option value="Wellness">Wellness</option>
                <option value="Arts">Arts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                value={editingExp.price}
                onChange={(e) => setEditingExp({...editingExp, price: Number(e.target.value)})}
                className="w-full px-4 py-2 border rounded-lg"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editingExp.status}
                onChange={(e) => setEditingExp({...editingExp, status: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="PUBLISHED">Published</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="DRAFT">Draft</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingExp(null); }} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    commissionRate: 15,
    minBookingAdvance: 24,
    maxGroupSize: 15,
    supportEmail: 'support@locallink.app',
    currency: 'USD',
    enableGPS: true,
    enableReviews: true,
    autoApproveGuides: false,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Commission & Pricing</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Commission (%)</label>
              <input
                type="number"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NPR">NPR (₨)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Booking Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Booking Advance (hours)</label>
              <input
                type="number"
                value={settings.minBookingAdvance}
                onChange={(e) => setSettings({ ...settings, minBookingAdvance: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Group Size</label>
              <input
                type="number"
                value={settings.maxGroupSize}
                onChange={(e) => setSettings({ ...settings, maxGroupSize: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Features</h3>
          <div className="space-y-4">
            {[
              { key: 'enableGPS', label: 'GPS Tracking' },
              { key: 'enableReviews', label: 'Reviews & Ratings' },
              { key: 'autoApproveGuides', label: 'Auto-approve Guides' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <button
                  onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings[item.key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Support</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            toast.success('Settings saved successfully!');
          }}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

// ==================== BOOKINGS PAGE ====================

const BookingsPage = () => {
  const [filter, setFilter] = useState('all');

  const bookings = [
    { id: 1, bookingNumber: 'BK-2024-001', traveler: 'Sarah M.', experience: 'Hidden Temple Walk', guide: 'Pemba S.', date: '2024-12-24', time: '9:00 AM', status: 'CONFIRMED', total: 55, payment: 'COMPLETED' },
    { id: 2, bookingNumber: 'BK-2024-002', traveler: 'John D.', experience: 'Street Food Tour', guide: 'Sita T.', date: '2024-12-25', time: '6:00 PM', status: 'PENDING', total: 36, payment: 'PENDING' },
    { id: 3, bookingNumber: 'BK-2024-003', traveler: 'Emma L.', experience: 'Sunrise Hike', guide: 'Tenzin L.', date: '2024-12-26', time: '5:00 AM', status: 'CONFIRMED', total: 90, payment: 'COMPLETED' },
    { id: 4, bookingNumber: 'BK-2024-004', traveler: 'Mike R.', experience: 'Cooking Class', guide: 'Maya G.', date: '2024-12-20', time: '10:00 AM', status: 'COMPLETED', total: 70, payment: 'COMPLETED' },
    { id: 5, bookingNumber: 'BK-2024-005', traveler: 'Lisa K.', experience: 'Artisan Workshop', guide: 'Ram T.', date: '2024-12-18', time: '2:00 PM', status: 'CANCELLED', total: 60, payment: 'REFUNDED' },
  ];

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex gap-2">
          {['all', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-sm ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'bookingNumber', label: 'Booking #' },
            { key: 'traveler', label: 'Traveler' },
            { key: 'experience', label: 'Experience' },
            { key: 'guide', label: 'Guide' },
            { key: 'date', label: 'Date' },
            { key: 'time', label: 'Time' },
            { key: 'status', label: 'Status', render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                row.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                row.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                row.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {row.status}
              </span>
            )},
            { key: 'total', label: 'Total', render: (row: any) => `$${row.total}` },
            { key: 'payment', label: 'Payment', render: (row: any) => (
              <span className={`text-xs ${row.payment === 'COMPLETED' ? 'text-green-600' : row.payment === 'REFUNDED' ? 'text-gray-500' : 'text-yellow-600'}`}>
                {row.payment}
              </span>
            )},
            { key: 'actions', label: 'Actions', render: () => (
              <button className="px-2 py-1 bg-gray-100 rounded text-xs">View</button>
            )},
          ]}
          data={filteredBookings}
        />
      </div>
    </div>
  );
};

// ==================== REVIEWS PAGE ====================

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([
    { id: 1, traveler: 'Sarah M.', experience: 'Hidden Temple Walk', rating: 5, content: 'Amazing experience! Pemba was incredibly knowledgeable.', verified: true, gpsValidated: true, status: 'PUBLISHED', date: '2024-12-20' },
    { id: 2, traveler: 'John D.', experience: 'Street Food Tour', rating: 5, content: 'Best food tour ever! Tried so many delicious things.', verified: true, gpsValidated: true, status: 'PUBLISHED', date: '2024-12-19' },
    { id: 3, traveler: 'Emma L.', experience: 'Sunrise Hike', rating: 4, content: 'Beautiful views but quite challenging.', verified: true, gpsValidated: false, status: 'PUBLISHED', date: '2024-12-18' },
    { id: 4, traveler: 'Unknown', experience: 'Cooking Class', rating: 1, content: 'Never did this tour but leaving review.', verified: false, gpsValidated: false, status: 'PENDING', date: '2024-12-17' },
  ]);

  const handleApprove = (id: number) => {
    setReviews(reviews.map(r => r.id === id ? {...r, status: 'PUBLISHED'} : r));
    toast.success('Review approved!');
  };

  const handleHide = (id: number) => {
    setReviews(reviews.map(r => r.id === id ? {...r, status: 'HIDDEN'} : r));
    toast.success('Review hidden!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <div className="flex gap-4">
          <div className="bg-green-100 px-3 py-1 rounded-lg text-sm text-green-700">
            {reviews.filter(r => r.verified).length} Verified
          </div>
          <div className="bg-yellow-100 px-3 py-1 rounded-lg text-sm text-yellow-700">
            {reviews.filter(r => r.status === 'PENDING').length} Pending Review
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'traveler', label: 'Traveler' },
            { key: 'experience', label: 'Experience' },
            { key: 'rating', label: 'Rating', render: (row: any) => '⭐'.repeat(row.rating) },
            { key: 'content', label: 'Review', render: (row: any) => (
              <span className="truncate max-w-xs block">{row.content}</span>
            )},
            { key: 'verified', label: 'Trust', render: (row: any) => (
              <div className="flex gap-1">
                {row.verified && <span className="text-green-500 text-xs">✓ Verified</span>}
                {row.gpsValidated && <span className="text-blue-500 text-xs">📍 GPS</span>}
                {!row.verified && <span className="text-red-500 text-xs">⚠️ Unverified</span>}
              </div>
            )},
            { key: 'status', label: 'Status', render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs ${
                row.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {row.status}
              </span>
            )},
            { key: 'actions', label: 'Actions', render: (row: any) => (
              <div className="flex gap-1">
                {row.status === 'PENDING' && (
                  <button onClick={() => handleApprove(row.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                )}
                {row.status !== 'HIDDEN' && (
                  <button onClick={() => handleHide(row.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Hide</button>
                )}
              </div>
            )},
          ]}
          data={reviews}
        />
      </div>
    </div>
  );
};

// ==================== CATEGORIES PAGE ====================

const CategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { id: 1, name: 'Culture & History', slug: 'culture', icon: '🏛️', experiences: 45, active: true },
    { id: 2, name: 'Food & Drink', slug: 'food', icon: '🍜', experiences: 32, active: true },
    { id: 3, name: 'Adventure', slug: 'adventure', icon: '🏔️', experiences: 28, active: true },
    { id: 4, name: 'Wellness', slug: 'wellness', icon: '🧘', experiences: 15, active: true },
    { id: 5, name: 'Arts & Crafts', slug: 'crafts', icon: '🎨', experiences: 12, active: true },
    { id: 6, name: 'Nightlife', slug: 'nightlife', icon: '🌙', experiences: 8, active: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className={`bg-white rounded-xl p-6 border ${cat.active ? 'border-gray-100' : 'border-red-200 bg-red-50'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-sm text-gray-500">/{cat.slug}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${cat.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {cat.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">{cat.experiences} experiences</span>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">✏️</button>
                <button className="p-1 hover:bg-gray-100 rounded">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Category">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Category name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="category-slug" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="🎯" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full px-4 py-2 border rounded-lg" rows={3} placeholder="Category description" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ==================== SERVICES PAGE ====================

const ServicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ title: '', icon: '', price: 0, duration: '', active: true });
  const [services, setServices] = useState([
    { id: 1, title: 'SIM Card Setup', icon: '📱', price: 5, duration: '30 min', bookings: 234, active: true },
    { id: 2, title: 'Airport Pickup', icon: '✈️', price: 15, duration: '1 hour', bookings: 189, active: true },
    { id: 3, title: 'Translation Help', icon: '🗣️', price: 8, duration: '1 hour', bookings: 156, active: true },
    { id: 4, title: 'Bargaining Helper', icon: '🛍️', price: 10, duration: '2 hours', bookings: 98, active: true },
    { id: 5, title: 'Hospital Support', icon: '🏥', price: 20, duration: 'As needed', bookings: 23, active: true },
    { id: 6, title: 'Emergency Support', icon: '🆘', price: 25, duration: 'Immediate', bookings: 12, active: true },
  ]);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...services.map(s => s.id)) + 1;
    setServices([...services, { ...newService, id: newId, bookings: 0 }]);
    setNewService({ title: '', icon: '', price: 0, duration: '', active: true });
    setIsModalOpen(false);
    toast.success('Service added successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Micro-Services</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          + Add Service
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'title', label: 'Service', render: (row: any) => (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{row.icon}</span>
                <span>{row.title}</span>
              </div>
            )},
            { key: 'price', label: 'Price', render: (row: any) => `$${row.price}` },
            { key: 'duration', label: 'Duration' },
            { key: 'bookings', label: 'Total Bookings' },
            { key: 'active', label: 'Status', render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs ${row.active ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                {row.active ? 'Active' : 'Inactive'}
              </span>
            )},
            { key: 'actions', label: 'Actions', render: () => (
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">✏️</button>
                <button className="p-1 hover:bg-gray-100 rounded">🗑️</button>
              </div>
            )},
          ]}
          data={services}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Service">
        <form onSubmit={handleAddService} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input
              type="text"
              value={newService.title}
              onChange={(e) => setNewService({...newService, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Currency Exchange Help"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={newService.icon}
              onChange={(e) => setNewService({...newService, icon: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="💱"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price ($)</label>
            <input
              type="number"
              value={newService.price}
              onChange={(e) => setNewService({...newService, price: Number(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input
              type="text"
              value={newService.duration}
              onChange={(e) => setNewService({...newService, duration: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., 30 min, 1 hour"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Add Service</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ==================== STAYS PAGE ====================

const StaysPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStay, setNewStay] = useState({ title: '', type: 'HOMESTAY', host: '', price: 0 });
  const [stays, setStays] = useState([
    { id: 1, title: "Maya's Homestay", type: 'HOMESTAY', host: 'Maya Tamang', price: 28, rating: 4.9, bookings: 67, status: 'PUBLISHED', verified: true },
    { id: 2, title: 'Himalayan View Hotel', type: 'HOTEL', host: 'Hotel Staff', price: 65, rating: 4.7, bookings: 234, status: 'PUBLISHED', verified: true },
    { id: 3, title: "Backpacker's Haven", type: 'HOSTEL', host: 'Raj Shakya', price: 12, rating: 4.6, bookings: 456, status: 'PUBLISHED', verified: true },
    { id: 4, title: 'Mountain Lodge', type: 'LODGE', host: 'Karma Sherpa', price: 45, rating: 0, bookings: 0, status: 'PENDING_REVIEW', verified: false },
  ]);

  const handleAddStay = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...stays.map(s => s.id)) + 1;
    setStays([...stays, { ...newStay, id: newId, rating: 0, bookings: 0, status: 'PENDING_REVIEW', verified: false }]);
    setNewStay({ title: '', type: 'HOMESTAY', host: '', price: 0 });
    setIsModalOpen(false);
    toast.success('Stay added successfully!');
  };

  const handleApprove = (id: number) => {
    setStays(stays.map(s => s.id === id ? {...s, status: 'PUBLISHED', verified: true} : s));
    toast.success('Stay approved!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stays & Accommodations</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          + Add Stay
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'title', label: 'Property' },
            { key: 'type', label: 'Type', render: (row: any) => (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{row.type}</span>
            )},
            { key: 'host', label: 'Host' },
            { key: 'price', label: 'Price/Night', render: (row: any) => `$${row.price}` },
            { key: 'rating', label: 'Rating', render: (row: any) => row.rating ? `⭐ ${row.rating}` : '-' },
            { key: 'bookings', label: 'Bookings' },
            { key: 'status', label: 'Status', render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs ${
                row.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {row.status.replace('_', ' ')}
              </span>
            )},
            { key: 'verified', label: 'Verified', render: (row: any) => (
              row.verified ? <span className="text-green-500">✓</span> : <span className="text-gray-400">○</span>
            )},
            { key: 'actions', label: 'Actions', render: (row: any) => (
              <div className="flex gap-1">
                {row.status === 'PENDING_REVIEW' && (
                  <button onClick={() => handleApprove(row.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                )}
                <button className="px-2 py-1 bg-gray-100 rounded text-xs">Edit</button>
              </div>
            )},
          ]}
          data={stays}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Stay">
        <form onSubmit={handleAddStay} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Property Name</label>
            <input
              type="text"
              value={newStay.title}
              onChange={(e) => setNewStay({...newStay, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Sunrise Guesthouse"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={newStay.type}
              onChange={(e) => setNewStay({...newStay, type: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="HOMESTAY">Homestay</option>
              <option value="HOTEL">Hotel</option>
              <option value="HOSTEL">Hostel</option>
              <option value="LODGE">Lodge</option>
              <option value="GUESTHOUSE">Guesthouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Host Name</label>
            <input
              type="text"
              value={newStay.host}
              onChange={(e) => setNewStay({...newStay, host: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Host or property manager name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price per Night ($)</label>
            <input
              type="number"
              value={newStay.price}
              onChange={(e) => setNewStay({...newStay, price: Number(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Add Stay</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ==================== TRAINING PAGE ====================

const TrainingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', icon: '', duration: 30, required: false, badge: '' });
  const [modules, setModules] = useState([
    { id: 1, title: 'Guest Etiquette', icon: '🤝', duration: 30, required: true, completions: 234, badge: 'Platform Trained' },
    { id: 2, title: 'Female Traveler Safety', icon: '👩', duration: 45, required: true, completions: 198, badge: 'Female-Safe' },
    { id: 3, title: 'First Aid Basics', icon: '🏥', duration: 60, required: true, completions: 156, badge: 'First Aid Ready' },
    { id: 4, title: 'Storytelling for Guides', icon: '📖', duration: 45, required: false, completions: 89, badge: 'Master Storyteller' },
    { id: 5, title: 'Heritage Expert Certification', icon: '🏛️', duration: 120, required: false, completions: 45, badge: 'Heritage Expert' },
  ]);

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...modules.map(m => m.id)) + 1;
    setModules([...modules, { ...newModule, id: newId, completions: 0 }]);
    setNewModule({ title: '', icon: '', duration: 30, required: false, badge: '' });
    setIsModalOpen(false);
    toast.success('Module created successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Guide Training</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          + Create Module
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(mod => (
          <div key={mod.id} className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{mod.icon}</span>
              <div>
                <h3 className="font-semibold">{mod.title}</h3>
                <p className="text-sm text-gray-500">{mod.duration} min</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completions</span>
                <span className="font-medium">{mod.completions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Badge Awarded</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{mod.badge}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Required</span>
                <span>{mod.required ? '✓ Yes' : 'Optional'}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Edit</button>
              <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">View Content</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Training Module">
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Module Title</label>
            <input
              type="text"
              value={newModule.title}
              onChange={(e) => setNewModule({...newModule, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Cultural Sensitivity Training"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={newModule.icon}
              onChange={(e) => setNewModule({...newModule, icon: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="🎯"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={newModule.duration}
              onChange={(e) => setNewModule({...newModule, duration: Number(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg"
              min="5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Badge Name</label>
            <input
              type="text"
              value={newModule.badge}
              onChange={(e) => setNewModule({...newModule, badge: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Certified Expert"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={newModule.required}
              onChange={(e) => setNewModule({...newModule, required: e.target.checked})}
              className="w-4 h-4"
            />
            <label htmlFor="required" className="text-sm">Required for all guides</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Create Module</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ==================== LOCATIONS PAGE ====================

const LocationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', type: 'city', parent: '', featured: false });
  const [locations, setLocations] = useState([
    { id: 1, name: 'Nepal', type: 'country', parent: '', experiences: 156, guides: 89, featured: true },
    { id: 2, name: 'Kathmandu', type: 'city', parent: 'Nepal', experiences: 78, guides: 45, featured: true },
    { id: 3, name: 'Pokhara', type: 'city', parent: 'Nepal', experiences: 42, guides: 28, featured: true },
    { id: 4, name: 'Chitwan', type: 'city', parent: 'Nepal', experiences: 23, guides: 12, featured: true },
    { id: 5, name: 'Bhaktapur', type: 'city', parent: 'Nepal', experiences: 13, guides: 4, featured: false },
  ]);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...locations.map(l => l.id)) + 1;
    setLocations([...locations, { ...newLocation, id: newId, experiences: 0, guides: 0 }]);
    setNewLocation({ name: '', type: 'city', parent: '', featured: false });
    setIsModalOpen(false);
    toast.success('Location added successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Locations</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          + Add Location
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'name', label: 'Location', render: (row: any) => (
              <div className="flex items-center gap-2">
                <span>{row.type === 'country' ? '🌍' : '📍'}</span>
                <span className="font-medium">{row.name}</span>
              </div>
            )},
            { key: 'type', label: 'Type', render: (row: any) => (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">{row.type}</span>
            )},
            { key: 'parent', label: 'Parent', render: (row: any) => row.parent || '-' },
            { key: 'experiences', label: 'Experiences' },
            { key: 'guides', label: 'Guides' },
            { key: 'featured', label: 'Featured', render: (row: any) => (
              row.featured ? <span className="text-yellow-500">⭐</span> : <span className="text-gray-300">☆</span>
            )},
            { key: 'actions', label: 'Actions', render: () => (
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">✏️</button>
                <button className="p-1 hover:bg-gray-100 rounded">🗑️</button>
              </div>
            )},
          ]}
          data={locations}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Location">
        <form onSubmit={handleAddLocation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location Name</label>
            <input
              type="text"
              value={newLocation.name}
              onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Patan"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={newLocation.type}
              onChange={(e) => setNewLocation({...newLocation, type: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="country">Country</option>
              <option value="city">City</option>
              <option value="region">Region</option>
              <option value="neighborhood">Neighborhood</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent Location</label>
            <select
              value={newLocation.parent}
              onChange={(e) => setNewLocation({...newLocation, parent: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">None (Top Level)</option>
              {locations.filter(l => l.type === 'country' || l.type === 'city').map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={newLocation.featured}
              onChange={(e) => setNewLocation({...newLocation, featured: e.target.checked})}
              className="w-4 h-4"
            />
            <label htmlFor="featured" className="text-sm">Featured Location</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Add Location</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ==================== SUPPORT TICKETS PAGE ====================

const TicketsPage = () => {
  const tickets = [
    { id: 1, ticketNumber: 'TK-001', subject: 'Payment not received', user: 'Pemba S.', category: 'Payment', priority: 'HIGH', status: 'OPEN', created: '2 hours ago' },
    { id: 2, ticketNumber: 'TK-002', subject: 'Cannot update profile', user: 'Sarah M.', category: 'Account', priority: 'MEDIUM', status: 'IN_PROGRESS', created: '5 hours ago' },
    { id: 3, ticketNumber: 'TK-003', subject: 'Report inappropriate guide', user: 'John D.', category: 'Safety', priority: 'URGENT', status: 'OPEN', created: '1 day ago' },
    { id: 4, ticketNumber: 'TK-004', subject: 'Booking cancellation request', user: 'Emma L.', category: 'Booking', priority: 'LOW', status: 'RESOLVED', created: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm">
            {tickets.filter(t => t.status === 'OPEN').length} Open
          </span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">
            {tickets.filter(t => t.priority === 'URGENT').length} Urgent
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'ticketNumber', label: 'Ticket #' },
            { key: 'subject', label: 'Subject' },
            { key: 'user', label: 'User' },
            { key: 'category', label: 'Category' },
            { key: 'priority', label: 'Priority', render: (row: any) => (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                row.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                row.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                row.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {row.priority}
              </span>
            )},
            { key: 'status', label: 'Status', render: (row: any) => (
              <span className={`px-2 py-1 rounded-full text-xs ${
                row.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                row.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {row.status.replace('_', ' ')}
              </span>
            )},
            { key: 'created', label: 'Created' },
            { key: 'actions', label: 'Actions', render: () => (
              <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">View</button>
            )},
          ]}
          data={tickets}
        />
      </div>
    </div>
  );
};

// ==================== REPORTS PAGE ====================

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Revenue Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <span className="text-gray-400">Revenue Chart</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">$28,475</p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold">$245,890</p>
              <p className="text-sm text-gray-500">This Year</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">+23%</p>
              <p className="text-sm text-gray-500">Growth</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Bookings Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <span className="text-gray-400">Bookings Chart</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">342</p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold">8,934</p>
              <p className="text-sm text-gray-500">This Year</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">+15%</p>
              <p className="text-sm text-gray-500">Growth</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Top Experiences</h3>
          <div className="space-y-3">
            {[
              { name: 'Hidden Temple Walk', bookings: 127, revenue: 3175 },
              { name: 'Sunrise Hike to Nagarkot', bookings: 89, revenue: 4005 },
              { name: 'Street Food Adventure', bookings: 76, revenue: 1368 },
              { name: 'Traditional Cooking Class', bookings: 54, revenue: 1890 },
            ].map((exp, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{exp.name}</p>
                  <p className="text-sm text-gray-500">{exp.bookings} bookings</p>
                </div>
                <p className="font-semibold text-green-600">${exp.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Top Guides</h3>
          <div className="space-y-3">
            {[
              { name: 'Tenzin Lama', level: 'MASTER', earnings: 8945, rating: 5.0 },
              { name: 'Pemba Sherpa', level: 'PROFESSIONAL', earnings: 4567, rating: 4.9 },
              { name: 'Maya Gurung', level: 'PROFESSIONAL', earnings: 3890, rating: 4.9 },
              { name: 'Sita Thapa', level: 'TRAINED', earnings: 2345, rating: 4.8 },
            ].map((guide, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">👤</div>
                  <div>
                    <p className="font-medium">{guide.name}</p>
                    <p className="text-xs text-gray-500">{guide.level} • ⭐ {guide.rating}</p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">${guide.earnings}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          Export Revenue Report
        </button>
        <button className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
          Export Bookings Report
        </button>
        <button className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
          Export User Report
        </button>
      </div>
    </div>
  );
};

// ==================== APP ====================

function AppContent() {
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={logout} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/stays" element={<StaysPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
