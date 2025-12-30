import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useStore();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🗺️' },
    { path: '/bookings', label: 'Bookings', icon: '📅', auth: true },
    { path: '/messages', label: 'Messages', icon: '💬', auth: true },
    { path: '/favorites', label: 'Favorites', icon: '❤️', auth: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <span className="font-display text-2xl font-bold text-secondary-500">LocalLink</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-500"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block font-medium">{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="btn btn-ghost">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary-500 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌍</span>
                <span className="font-display text-2xl font-bold">LocalLink</span>
              </div>
              <p className="text-secondary-200 max-w-md">
                Connect with verified local guides for authentic experiences. Travel human. Travel safe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-secondary-200">
                <li><Link to="/explore" className="hover:text-white">All Experiences</Link></li>
                <li><Link to="/explore?category=culture" className="hover:text-white">Cultural Tours</Link></li>
                <li><Link to="/explore?category=food" className="hover:text-white">Food Tours</Link></li>
                <li><Link to="/explore?category=adventure" className="hover:text-white">Adventure</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-secondary-200">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Safety Info</a></li>
                <li><a href="#" className="hover:text-white">Become a Guide</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-400 mt-8 pt-8 text-center text-secondary-300">
            <p>&copy; 2024 LocalLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
