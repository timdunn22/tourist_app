import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { TravelerSkeleton } from '../components/Skeleton';

// Mock nearby travelers data
const mockTravelers = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: '👩‍💼',
    country: 'USA',
    flag: '🇺🇸',
    distance: '0.5 km',
    interests: ['Culture', 'Food', 'Photography'],
    bio: 'Digital nomad exploring Asia. Love meeting fellow travelers!',
    lookingFor: 'Dinner companion tonight',
    verified: true,
    online: true,
  },
  {
    id: 2,
    name: 'Marcus Weber',
    avatar: '👨‍🎨',
    country: 'Germany',
    flag: '🇩🇪',
    distance: '1.2 km',
    interests: ['Hiking', 'Adventure', 'Local Food'],
    bio: 'Backpacker on a 6-month journey. Always up for an adventure!',
    lookingFor: 'Hiking partner for tomorrow',
    verified: true,
    online: true,
  },
  {
    id: 3,
    name: 'Yuki Tanaka',
    avatar: '👩‍🎤',
    country: 'Japan',
    flag: '🇯🇵',
    distance: '2.1 km',
    interests: ['Temples', 'Meditation', 'Tea'],
    bio: 'Seeking peaceful experiences and cultural immersion.',
    lookingFor: 'Temple visit tomorrow morning',
    verified: true,
    online: false,
  },
  {
    id: 4,
    name: 'Carlos Rodriguez',
    avatar: '👨‍💻',
    country: 'Spain',
    flag: '🇪🇸',
    distance: '3.5 km',
    interests: ['Nightlife', 'Music', 'Food Tours'],
    bio: 'Remote worker who loves to explore after work hours.',
    lookingFor: 'Evening food tour group',
    verified: false,
    online: true,
  },
];

// Mock activities
const mockActivities = [
  {
    id: 1,
    title: 'Sunset Drinks at Rooftop Bar',
    host: 'Sarah Chen',
    hostAvatar: '👩‍💼',
    time: 'Today, 6:00 PM',
    location: 'Thamel District',
    spots: 4,
    spotsLeft: 2,
    attendees: ['👨‍🎨', '👩‍🎤'],
  },
  {
    id: 2,
    title: 'Morning Temple Walk',
    host: 'Yuki Tanaka',
    hostAvatar: '👩‍🎤',
    time: 'Tomorrow, 7:00 AM',
    location: 'Pashupatinath Temple',
    spots: 6,
    spotsLeft: 4,
    attendees: ['👨‍💻', '👩‍💼'],
  },
  {
    id: 3,
    title: 'Street Food Adventure',
    host: 'Marcus Weber',
    hostAvatar: '👨‍🎨',
    time: 'Tomorrow, 12:00 PM',
    location: 'Asan Market',
    spots: 5,
    spotsLeft: 3,
    attendees: ['👩‍💼', '🧑‍🎓'],
  },
];

function NearbyTravelersPage() {
  const [loading, setLoading] = useState(true);
  const [travelers, setTravelers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('nearby');
  const [filter, setFilter] = useState('all');
  const { isAuthenticated, user } = useStore();

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setTravelers(mockTravelers);
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredTravelers = travelers.filter(t => {
    if (filter === 'all') return true;
    return t.interests.some(i => i.toLowerCase() === filter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 text-white px-6 py-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Nearby Travelers</h1>
            <p className="text-white/80 text-sm mt-1">Connect with fellow explorers</p>
          </div>
          <div className="relative">
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
              {user?.avatar || '👤'}
            </div>
          </div>
        </div>

        {/* Location indicator */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
          <span className="text-xl">📍</span>
          <div>
            <p className="text-sm font-medium">Kathmandu, Nepal</p>
            <p className="text-xs text-white/70">{travelers.length} travelers nearby</p>
          </div>
          <button className="ml-auto text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
            Change
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'nearby'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Travelers
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'activities'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎉 Activities
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Culture', 'Food', 'Adventure', 'Hiking', 'Nightlife'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.toLowerCase()
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <TravelerSkeleton key={i} />
            ))}
          </div>
        ) : activeTab === 'nearby' ? (
          <div className="space-y-4">
            {filteredTravelers.map((traveler) => (
              <div
                key={traveler.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-2xl">
                      {traveler.avatar}
                    </div>
                    {traveler.online && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{traveler.name}</h3>
                      {traveler.verified && (
                        <span className="text-blue-500 text-sm" title="Verified">✓</span>
                      )}
                      <span className="text-sm">{traveler.flag}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{traveler.distance} away</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{traveler.bio}</p>

                    {/* Interests */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {traveler.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>

                    {/* Looking for */}
                    <div className="mt-3 p-2 bg-accent-50 rounded-lg">
                      <p className="text-xs text-accent-700">
                        <span className="font-medium">Looking for:</span> {traveler.lookingFor}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                    👋 Say Hi
                  </button>
                  <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{activity.time}</span>
                      <span>•</span>
                      <span>📍 {activity.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-500">
                      {activity.spotsLeft} spots left
                    </p>
                  </div>
                </div>

                {/* Host and attendees */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Hosted by</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{activity.hostAvatar}</span>
                      <span className="text-sm font-medium">{activity.host}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {activity.attendees.map((a, i) => (
                        <span
                          key={i}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm border-2 border-white"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-2">
                      +{activity.spots - activity.spotsLeft}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  Join Activity
                </button>
              </div>
            ))}

            {/* Create activity button */}
            <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-primary-300 hover:text-primary-500 transition-colors">
              + Create New Activity
            </button>
          </div>
        )}
      </div>

      {/* Floating action button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform">
        ✨
      </button>
    </div>
  );
}

export default NearbyTravelersPage;
