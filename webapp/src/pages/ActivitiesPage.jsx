import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  getActivities,
  createActivity,
  rsvpActivity,
  cancelRsvp,
  getMyActivities
} from '../services/api';

const ACTIVITY_TYPES = [
  { value: 'HIKING', label: 'Hiking', icon: 'mountain' },
  { value: 'DINING', label: 'Dining', icon: 'food' },
  { value: 'NIGHTLIFE', label: 'Nightlife', icon: 'party' },
  { value: 'CULTURAL', label: 'Cultural', icon: 'museum' },
  { value: 'SPORTS', label: 'Sports', icon: 'sports' },
  { value: 'PHOTOGRAPHY', label: 'Photography', icon: 'camera' },
  { value: 'WORKSHOP', label: 'Workshop', icon: 'workshop' },
  { value: 'GUIDED_TOUR', label: 'Guided Tour', icon: 'guide' },
  { value: 'FOOD_CRAWL', label: 'Food Crawl', icon: 'food' },
  { value: 'PARTY', label: 'Party', icon: 'party' },
  { value: 'MEETUP', label: 'Meetup', icon: 'group' },
  { value: 'OTHER', label: 'Other', icon: 'star' },
];

const STATUS_COLORS = {
  APPROVED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  DECLINED: 'bg-red-100 text-red-800',
};

function ActivitiesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useStore();
  const [view, setView] = useState('browse'); // 'browse', 'my', 'create'
  const [activities, setActivities] = useState([]);
  const [myActivities, setMyActivities] = useState({ created: [], participating: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');

  // Create form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MEETUP',
    location: '',
    city: '',
    country: '',
    meetingPoint: '',
    startDate: '',
    startTime: '',
    duration: 120,
    maxParticipants: 10,
    requiresApproval: false,
    verifiedOnly: false,
    isFree: true,
    price: '',
  });

  useEffect(() => {
    fetchActivities();
  }, [filterType, filterCity]);

  useEffect(() => {
    if (view === 'my' && isAuthenticated) {
      fetchMyActivities();
    }
  }, [view, isAuthenticated]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {
        status: 'ACTIVE',
        ...(filterType && { type: filterType }),
        ...(filterCity && { city: filterCity }),
      };
      const res = await getActivities(params);
      setActivities(res.data.activities || []);
    } catch (err) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyActivities = async () => {
    setLoading(true);
    try {
      const res = await getMyActivities('all');
      setMyActivities({
        created: res.data.created || [],
        participating: res.data.participating || [],
      });
    } catch (err) {
      setError('Failed to load your activities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);

      await createActivity({
        ...formData,
        startDate: startDateTime.toISOString(),
        duration: parseInt(formData.duration),
        maxParticipants: parseInt(formData.maxParticipants),
        price: formData.isFree ? null : parseFloat(formData.price),
      });

      setSuccess('Activity created successfully!');
      setFormData({
        title: '',
        description: '',
        type: 'MEETUP',
        location: '',
        city: '',
        country: '',
        meetingPoint: '',
        startDate: '',
        startTime: '',
        duration: 120,
        maxParticipants: 10,
        requiresApproval: false,
        verifiedOnly: false,
        isFree: true,
        price: '',
      });

      // Switch to browse view and refresh
      setView('browse');
      fetchActivities();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create activity');
    }
  };

  const handleRsvp = async (activityId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await rsvpActivity(activityId);
      setSuccess('RSVP sent!');
      fetchActivities();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to RSVP');
    }
  };

  const handleCancelRsvp = async (activityId) => {
    try {
      await cancelRsvp(activityId);
      setSuccess('RSVP cancelled');
      fetchMyActivities();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel RSVP');
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Activities</h1>

            <div className="flex gap-2">
              <button
                onClick={() => setView('browse')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'browse'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Browse
              </button>
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => setView('my')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      view === 'my'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    My Activities
                  </button>
                  <button
                    onClick={() => setView('create')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      view === 'create'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    + Create
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
            <button onClick={() => setError('')} className="float-right">&times;</button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4">
            {success}
            <button onClick={() => setSuccess('')} className="float-right">&times;</button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {view === 'browse' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input"
                  >
                    <option value="">All Types</option>
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="input"
                    placeholder="Search by city"
                  />
                </div>
              </div>
            </div>

            {/* Activities List */}
            {loading ? (
              <div className="text-center py-20">Loading...</div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/activities/${activity.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                            {ACTIVITY_TYPES.find(t => t.value === activity.type)?.label || activity.type}
                          </span>
                          {activity.verifiedOnly && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Verified Only
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>{formatDateTime(activity.startDate)}</span>
                          <span>{activity.location}, {activity.city}</span>
                          <span>
                            {activity.currentParticipants || activity._count?.participants || 0}/{activity.maxParticipants} spots
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        {activity.isFree ? (
                          <span className="text-green-600 font-medium">Free</span>
                        ) : (
                          <span className="text-gray-900 font-medium">
                            ${activity.price}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRsvp(activity.id);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          RSVP
                        </button>
                      </div>
                    </div>

                    {/* Host info */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        {activity.creator?.avatar ? (
                          <img
                            src={activity.creator.avatar}
                            alt={activity.creator.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                            {activity.creator?.name?.[0]}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        Hosted by {activity.creator?.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">Calendar</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No activities found</h2>
                <p className="text-gray-600 mb-6">
                  Be the first to create an activity in your area!
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => setView('create')}
                    className="btn btn-primary"
                  >
                    Create Activity
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {view === 'my' && (
          <>
            {/* Created Activities */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activities You Created</h2>
              {myActivities.created.length > 0 ? (
                <div className="space-y-4">
                  {myActivities.created.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md"
                      onClick={() => navigate(`/activities/${activity.id}`)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(activity.startDate)} - {activity._count?.participants || 0} participants
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">You haven't created any activities yet.</p>
              )}
            </div>

            {/* Participating Activities */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activities You're Attending</h2>
              {myActivities.participating.length > 0 ? (
                <div className="space-y-4">
                  {myActivities.participating.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white rounded-xl shadow p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate(`/activities/${activity.id}`)}
                        >
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(activity.startDate)} - Hosted by {activity.creator?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            STATUS_COLORS[activity.participationStatus] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {activity.participationStatus}
                          </span>
                          <button
                            onClick={() => handleCancelRsvp(activity.id)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">You're not attending any activities.</p>
              )}
            </div>
          </>
        )}

        {view === 'create' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Create New Activity</h2>

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="e.g., Sunset Hiking at Mount Wilson"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Describe what you'll be doing..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    className="input"
                    min="2"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input"
                  min="30"
                  step="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                  placeholder="e.g., Central Park"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input"
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input"
                    placeholder="USA"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Point
                </label>
                <input
                  type="text"
                  value={formData.meetingPoint}
                  onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                  className="input"
                  placeholder="Specific meeting instructions"
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Require approval for RSVPs</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.verifiedOnly}
                    onChange={(e) => setFormData({ ...formData, verifiedOnly: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Verified users only</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">This is a free activity</span>
                </label>
                {!formData.isFree && (
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    placeholder="Price per person"
                    min="0"
                    step="0.01"
                  />
                )}
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Create Activity
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivitiesPage;
