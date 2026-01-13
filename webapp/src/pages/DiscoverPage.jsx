import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  getMatches,
  performMatchAction,
  getConnections
} from '../services/api';

const VERIFICATION_BADGES = {
  ID_VERIFIED: { label: 'ID Verified', color: 'bg-blue-100 text-blue-800' },
  FULLY_VERIFIED: { label: 'Fully Verified', color: 'bg-green-100 text-green-800' },
};

function DiscoverPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useStore();
  const [view, setView] = useState('discover'); // 'discover' or 'connections'
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [canMessage, setCanMessage] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, view]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (view === 'discover') {
        const res = await getMatches({ limit: 20 });

        if (res.data.redirectTo) {
          navigate(res.data.redirectTo);
          return;
        }

        setMatches(res.data.matches || []);
        setCanMessage(res.data.canMessage);
        setCurrentIndex(0);
      } else {
        const res = await getConnections();
        setConnections(res.data.connections || []);
        setCanMessage(res.data.canMessage);
      }
    } catch (err) {
      if (err.response?.data?.redirectTo) {
        navigate(err.response.data.redirectTo);
        return;
      }
      setError(err.response?.data?.error || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    const currentMatch = matches[currentIndex];
    if (!currentMatch) return;

    setActionLoading(true);
    try {
      const res = await performMatchAction(currentMatch.id, action);

      if (res.data.isMutual) {
        setMatchedUser(currentMatch);
        setShowMatch(true);
      }

      // Move to next card
      setCurrentIndex((prev) => prev + 1);

      // Fetch more matches if running low
      if (currentIndex >= matches.length - 3) {
        const moreRes = await getMatches({ limit: 20, offset: matches.length });
        if (moreRes.data.matches?.length > 0) {
          setMatches((prev) => [...prev, ...moreRes.data.matches]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const currentMatch = matches[currentIndex];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in to discover</h1>
          <p className="text-gray-600 mb-6">Find travel buddies and make connections</p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Match Modal */}
      {showMatch && matchedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-bounce-in">
            <div className="text-6xl mb-4">Match</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">It's a Match!</h2>
            <p className="text-gray-600 mb-6">
              You and {matchedUser.name} both liked each other
            </p>

            {canMessage ? (
              <button
                onClick={() => {
                  setShowMatch(false);
                  navigate(`/messages?user=${matchedUser.id}`);
                }}
                className="btn btn-primary w-full mb-3"
              >
                Send a Message
              </button>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg mb-3">
                <p className="text-yellow-800 text-sm">
                  Upgrade to Basic to message your matches
                </p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="text-primary-600 font-semibold text-sm mt-2"
                >
                  View Plans
                </button>
              </div>
            )}

            <button
              onClick={() => setShowMatch(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Discover</h1>

            <div className="flex gap-2">
              <button
                onClick={() => setView('discover')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'discover'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setView('connections')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'connections'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Connections
                {connections.length > 0 && (
                  <span className="ml-1 bg-primary-500 text-white text-xs rounded-full px-2">
                    {connections.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl animate-pulse">Loading...</div>
          </div>
        ) : view === 'discover' ? (
          /* Discovery Cards */
          currentMatch ? (
            <div className="relative">
              {/* Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Photo */}
                <div className="h-96 bg-gradient-to-br from-primary-400 to-accent-400 relative">
                  {currentMatch.avatar ? (
                    <img
                      src={currentMatch.avatar}
                      alt={currentMatch.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-8xl">
                      {currentMatch.name?.[0]?.toUpperCase()}
                    </div>
                  )}

                  {/* Verification Badge */}
                  {currentMatch.verificationLevel && VERIFICATION_BADGES[currentMatch.verificationLevel] && (
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${VERIFICATION_BADGES[currentMatch.verificationLevel].color}`}>
                      {VERIFICATION_BADGES[currentMatch.verificationLevel].label}
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <h2 className="text-2xl font-bold text-white">
                      {currentMatch.name}
                      {currentMatch.age && <span className="font-normal">, {currentMatch.age}</span>}
                    </h2>
                    {currentMatch.currentCity && (
                      <p className="text-white/80">
                        {currentMatch.currentCity}, {currentMatch.currentCountry}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  {currentMatch.bio && (
                    <p className="text-gray-700 mb-4">{currentMatch.bio}</p>
                  )}

                  {/* Interests */}
                  {currentMatch.activityInterests?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentMatch.activityInterests.slice(0, 8).map((interest) => (
                          <span
                            key={interest}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                          >
                            {interest.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compatibility Score */}
                  {currentMatch.compatibilityScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Compatibility:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${currentMatch.compatibilityScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(currentMatch.compatibilityScore)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-6 mt-6">
                <button
                  onClick={() => handleAction('PASS')}
                  disabled={actionLoading}
                  className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform disabled:opacity-50"
                  title="Pass"
                >
                  X
                </button>
                <button
                  onClick={() => handleAction('SUPER_LIKE')}
                  disabled={actionLoading}
                  className="w-16 h-16 rounded-full bg-blue-500 shadow-lg flex items-center justify-center text-2xl text-white hover:scale-110 transition-transform disabled:opacity-50"
                  title="Super Like"
                >
                  Star
                </button>
                <button
                  onClick={() => handleAction('LIKE')}
                  disabled={actionLoading}
                  className="w-16 h-16 rounded-full bg-green-500 shadow-lg flex items-center justify-center text-2xl text-white hover:scale-110 transition-transform disabled:opacity-50"
                  title="Like"
                >
                  Heart
                </button>
              </div>

              {/* Remaining Cards Indicator */}
              <p className="text-center text-gray-500 text-sm mt-4">
                {matches.length - currentIndex - 1} more people to discover
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">Search</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No more matches</h2>
              <p className="text-gray-600 mb-6">
                Check back later or update your preferences
              </p>
              <button
                onClick={() => navigate('/profile/preferences')}
                className="btn btn-outline"
              >
                Update Preferences
              </button>
            </div>
          )
        ) : (
          /* Connections List */
          connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="bg-white rounded-xl shadow p-4 flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 overflow-hidden flex-shrink-0">
                    {connection.avatar ? (
                      <img
                        src={connection.avatar}
                        alt={connection.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {connection.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {connection.name}
                      </h3>
                      {connection.verificationLevel && VERIFICATION_BADGES[connection.verificationLevel] && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${VERIFICATION_BADGES[connection.verificationLevel].color}`}>
                          Verified
                        </span>
                      )}
                    </div>
                    {connection.currentCity && (
                      <p className="text-sm text-gray-500 truncate">
                        {connection.currentCity}
                      </p>
                    )}
                    {connection.matchedAt && (
                      <p className="text-xs text-gray-400">
                        Matched {new Date(connection.matchedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {canMessage ? (
                    <button
                      onClick={() => navigate(`/messages?user=${connection.id}`)}
                      className="btn btn-primary btn-sm"
                    >
                      Message
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/subscription')}
                      className="btn btn-outline btn-sm"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">Users</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No connections yet</h2>
              <p className="text-gray-600 mb-6">
                Start swiping to find your travel buddies
              </p>
              <button
                onClick={() => setView('discover')}
                className="btn btn-primary"
              >
                Start Discovering
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default DiscoverPage;
