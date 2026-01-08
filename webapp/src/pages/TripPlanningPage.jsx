import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { Skeleton } from '../components/Skeleton';

// Mock trip data
const mockTrips = [
  {
    id: 1,
    destination: 'Pokhara',
    country: 'Nepal',
    flag: '🇳🇵',
    dates: 'Jan 15 - Jan 20',
    image: '🏔️',
    travelers: 8,
    groupChat: true,
    interests: ['Hiking', 'Paragliding', 'Lake Views'],
    description: 'Adventure seekers heading to Pokhara for hiking and paragliding!',
  },
  {
    id: 2,
    destination: 'Chitwan',
    country: 'Nepal',
    flag: '🇳🇵',
    dates: 'Jan 22 - Jan 25',
    image: '🐘',
    travelers: 5,
    groupChat: true,
    interests: ['Safari', 'Wildlife', 'Nature'],
    description: 'Wildlife enthusiasts exploring Chitwan National Park.',
  },
  {
    id: 3,
    destination: 'Lumbini',
    country: 'Nepal',
    flag: '🇳🇵',
    dates: 'Feb 1 - Feb 3',
    image: '🙏',
    travelers: 3,
    groupChat: true,
    interests: ['Spirituality', 'History', 'Peace'],
    description: 'Peaceful pilgrimage to the birthplace of Buddha.',
  },
];

const popularDestinations = [
  { name: 'Pokhara', image: '🏔️', travelers: 24 },
  { name: 'Chitwan', image: '🐘', travelers: 12 },
  { name: 'Everest Region', image: '⛰️', travelers: 18 },
  { name: 'Lumbini', image: '🙏', travelers: 8 },
  { name: 'Annapurna', image: '🥾', travelers: 15 },
];

function TripPlanningPage() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setTrips(mockTrips);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-500 via-primary-500 to-primary-600 text-white px-6 py-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Trip Planning</h1>
        <p className="text-white/80 text-sm mt-1">Find travel buddies for your next adventure</p>

        {/* Search/Add Trip */}
        <div className="mt-6 flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Where are you going?"
              className="w-full px-4 py-3 pl-11 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-3 bg-white text-primary-500 rounded-xl font-medium hover:bg-white/90 transition-colors"
          >
            + Add Trip
          </button>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="px-6 py-6">
        <h2 className="font-bold text-gray-900 mb-4">Popular Destinations</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {popularDestinations.map((dest) => (
            <button
              key={dest.name}
              className="flex-shrink-0 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm hover:shadow-md transition-shadow">
                {dest.image}
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2">{dest.name}</p>
              <p className="text-xs text-gray-400">{dest.travelers} travelers</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Upcoming Group Trips</h2>
          <span className="text-sm text-primary-500">See all</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Destination image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                      {trip.image}
                    </div>

                    {/* Trip info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{trip.destination}</h3>
                        <span>{trip.flag}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{trip.dates}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{trip.description}</p>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {trip.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Bottom section */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {/* Traveler avatars */}
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(4, trip.travelers) }).map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs"
                          >
                            {['👩', '👨', '🧑', '👧'][i]}
                          </div>
                        ))}
                        {trip.travelers > 4 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-500">
                            +{trip.travelers - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{trip.travelers} travelers</span>
                    </div>

                    {trip.groupChat && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        💬 Active Chat
                      </span>
                    )}
                  </div>
                </div>

                {/* Join button */}
                <button className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium hover:opacity-90 transition-opacity">
                  Join Trip Group
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Planned Trips Section */}
      <div className="px-6 mt-8">
        <h2 className="font-bold text-gray-900 mb-4">My Planned Trips</h2>
        {myTrips.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="font-semibold text-gray-900 mb-2">No trips planned yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Add your future trips to find travel buddies
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Planned trips would go here */}
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="px-6 mt-8 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
              ✨
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Travel Recommendations</h3>
              <p className="text-white/80 text-sm mt-1">
                Get personalized trip suggestions based on your interests and travel style
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                Get Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Plan a Trip</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What are you looking for?
                </label>
                <textarea
                  placeholder="Describe your ideal travel companions or activities..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
                Create Trip & Find Buddies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripPlanningPage;
