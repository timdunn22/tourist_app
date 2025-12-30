import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

function ProfilePage() {
  const { user, logout } = useStore();
  const [activeTab, setActiveTab] = useState('profile');

  const profileData = {
    name: user?.name || "Alex Johnson",
    email: user?.email || "alex@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    memberSince: "December 2024",
    avatar: "👤",
    bio: "Adventure seeker and cultural enthusiast. Love exploring new places and meeting local guides!",
    languages: ["English", "Spanish"],
    verifications: ["Email", "Phone", "ID"],
  };

  const stats = [
    { label: "Experiences", value: 12 },
    { label: "Countries", value: 4 },
    { label: "Reviews", value: 8 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-6xl">
            {profileData.avatar}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display text-3xl font-bold text-gray-800">{profileData.name}</h1>
            <p className="text-gray-500 mt-1">📍 {profileData.location}</p>
            <p className="text-gray-600 mt-3">{profileData.bio}</p>

            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {profileData.verifications.map((v) => (
                <span key={v} className="badge badge-success text-xs">
                  ✓ {v} Verified
                </span>
              ))}
            </div>
          </div>

          <button className="btn btn-outline">Edit Profile</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary-500">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { id: 'profile', label: 'Profile Info' },
            { id: 'settings', label: 'Settings' },
            { id: 'payment', label: 'Payment Methods' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={profileData.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue={profileData.email}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                defaultValue={profileData.phone}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              defaultValue={profileData.bio}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
            <div className="flex flex-wrap gap-2">
              {profileData.languages.map((lang) => (
                <span key={lang} className="badge badge-secondary">{lang}</span>
              ))}
              <button className="badge bg-gray-100 text-gray-600 hover:bg-gray-200">+ Add</button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button className="btn btn-ghost">Cancel</button>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Notifications</h3>
            <div className="space-y-3">
              {[
                { label: "Email notifications for new messages", checked: true },
                { label: "Push notifications for booking updates", checked: true },
                { label: "Marketing emails and promotions", checked: false },
                { label: "Weekly digest of new experiences", checked: true },
              ].map((setting, i) => (
                <label key={i} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={setting.checked}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{setting.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Privacy</h3>
            <div className="space-y-3">
              {[
                { label: "Show my profile to other travelers", checked: true },
                { label: "Allow guides to see my booking history", checked: false },
              ].map((setting, i) => (
                <label key={i} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={setting.checked}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{setting.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
            <button className="btn bg-red-50 text-red-600 hover:bg-red-100">
              Delete Account
            </button>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800">Saved Payment Methods</h3>
            <button className="btn btn-outline text-sm">+ Add New</button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/26</p>
              </div>
              <span className="badge badge-success">Default</span>
              <button className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                MC
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">•••• •••• •••• 8888</p>
                <p className="text-sm text-gray-500">Expires 08/25</p>
              </div>
              <button className="text-sm text-primary-500 hover:text-primary-600">Set Default</button>
              <button className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Link to="/bookings" className="card p-4 hover:shadow-md transition-shadow text-center">
          <span className="text-3xl">📅</span>
          <p className="font-medium text-gray-800 mt-2">My Bookings</p>
        </Link>
        <Link to="/favorites" className="card p-4 hover:shadow-md transition-shadow text-center">
          <span className="text-3xl">❤️</span>
          <p className="font-medium text-gray-800 mt-2">Favorites</p>
        </Link>
        <Link to="/messages" className="card p-4 hover:shadow-md transition-shadow text-center">
          <span className="text-3xl">💬</span>
          <p className="font-medium text-gray-800 mt-2">Messages</p>
        </Link>
      </div>

      {/* Logout */}
      <div className="text-center mt-8">
        <button
          onClick={logout}
          className="btn btn-ghost text-red-500 hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
