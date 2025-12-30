import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const experiences = [
  { id: 1, title: "Hidden Temple Morning Walk", guide: "Pemba Sherpa", guideId: 1, price: 25, duration: "3h", rating: 4.9, reviews: 127, image: "🏛️", category: "culture", badges: ["GPS-Verified", "Female-Safe"], trustScore: 98, lat: 27.7045, lng: 85.3066, meetingPoint: "Durbar Square", desc: "Discover ancient temples hidden in Kathmandu's backstreets. Walk through narrow alleys, meet local artisans, and learn the stories behind centuries-old shrines.", includes: ["Expert guide", "Chai tea stops", "Temple offerings", "Photo opportunities"] },
  { id: 2, title: "Street Food Adventure", guide: "Sita Thapa", guideId: 2, price: 18, duration: "2h", rating: 4.8, reviews: 89, image: "🍜", category: "food", badges: ["GPS-Verified", "First Aid Ready"], trustScore: 95, lat: 27.7152, lng: 85.3123, meetingPoint: "Thamel Chowk", desc: "Taste authentic momos, chatamari, and sel roti at family-run stalls. Experience the flavors that locals love.", includes: ["5 food tastings", "Bottled water", "Recipe cards", "Vegetarian options"] },
  { id: 3, title: "Sunrise Hike to Nagarkot", guide: "Tenzin Lama", guideId: 3, price: 45, duration: "6h", rating: 5.0, reviews: 203, image: "🌄", category: "adventure", badges: ["Master Guide", "First Aid Ready"], trustScore: 99, lat: 27.7156, lng: 85.5167, meetingPoint: "Hotel Pickup", desc: "Watch the sun rise over the Himalayas from one of the best viewpoints near Kathmandu. See Mt. Everest on clear days.", includes: ["Hotel pickup", "Breakfast", "Hiking poles", "Packed lunch"] },
  { id: 4, title: "Traditional Cooking Class", guide: "Maya Gurung", guideId: 4, price: 35, duration: "4h", rating: 4.9, reviews: 156, image: "👩‍🍳", category: "food", badges: ["Female-Safe", "Platform Trained"], trustScore: 97, lat: 27.6722, lng: 85.3240, meetingPoint: "Patan", desc: "Learn to cook dal bhat, momos, and traditional Nepali dishes in a local home kitchen.", includes: ["All ingredients", "Recipe booklet", "Full meal", "Take-home spices"] },
  { id: 5, title: "Artisan Craft Workshop", guide: "Ram Tamang", guideId: 5, price: 30, duration: "3h", rating: 4.7, reviews: 64, image: "🎨", category: "culture", badges: ["Heritage Expert"], trustScore: 92, lat: 27.6763, lng: 85.3285, meetingPoint: "Patan Craft Center", desc: "Create traditional Thangka paintings with master craftspeople in historic Patan.", includes: ["All materials", "Expert instruction", "Your artwork", "Certificate"] },
  { id: 6, title: "Meditation Retreat", guide: "Dawa Lama", guideId: 6, price: 28, duration: "3h", rating: 4.9, reviews: 145, image: "🧘", category: "wellness", badges: ["Platform Trained", "Female-Safe"], trustScore: 97, lat: 27.7394, lng: 85.3622, meetingPoint: "Kopan Monastery", desc: "Find inner peace at an ancient monastery with guided meditation and Buddhist teachings.", includes: ["Yoga mat", "Herbal tea", "Monk's blessing", "Meditation guide"] },
];

function ExperienceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, favorites, addToFavorites, removeFromFavorites } = useStore();
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('9:00 AM');
  const [guests, setGuests] = useState(2);
  const mapRef = useRef(null);

  const experience = experiences.find(e => e.id === parseInt(id));
  const isFavorite = favorites.some(f => f.id === experience?.id);

  useEffect(() => {
    if (!mapRef.current || !experience || !window.L) return;

    const map = window.L.map(mapRef.current).setView([experience.lat, experience.lng], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    window.L.marker([experience.lat, experience.lng]).addTo(map)
      .bindPopup(`📍 Meeting Point: ${experience.meetingPoint}`).openPopup();

    return () => map.remove();
  }, [experience]);

  if (!experience) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Experience not found</h2>
        <Link to="/explore" className="btn btn-primary mt-4">Browse Experiences</Link>
      </div>
    );
  }

  const toggleFavorite = () => {
    if (isFavorite) removeFromFavorites(experience.id);
    else addToFavorites(experience);
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    alert(`Booking confirmed for ${selectedDate} at ${selectedTime} for ${guests} guests!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero */}
          <div className="relative h-80 md:h-96 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center">
            <span className="text-[120px]">{experience.image}</span>
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Title */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {experience.badges.map((badge, i) => (
                <span key={i} className="badge badge-success">✓ {badge}</span>
              ))}
            </div>
            <h1 className="font-display text-4xl font-bold text-gray-800 mb-4">
              {experience.title}
            </h1>
            <div className="flex items-center gap-6 text-gray-600">
              <span className="flex items-center gap-1">⭐ {experience.rating} ({experience.reviews} reviews)</span>
              <span>⏱️ {experience.duration}</span>
              <span>📍 {experience.meetingPoint}</span>
            </div>
          </div>

          {/* Guide */}
          <Link to={`/guide/${experience.guideId}`} className="card p-4 flex items-center gap-4 hover:shadow-md">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{experience.guide}</h3>
              <p className="text-sm text-gray-500">Trust Score: {experience.trustScore}%</p>
            </div>
            <span className="text-primary-500">View Profile →</span>
          </Link>

          {/* Description */}
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">About this experience</h2>
            <p className="text-gray-600 leading-relaxed">{experience.desc}</p>
          </div>

          {/* What's Included */}
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">What's included</h2>
            <div className="grid grid-cols-2 gap-3">
              {experience.includes.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Point Map */}
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">Meeting Point</h2>
            <div ref={mapRef} className="h-64 rounded-xl overflow-hidden" />
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-gray-800">${experience.price}</span>
              <span className="text-gray-500">/ person</span>
            </div>

            {/* Date Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <div className="grid grid-cols-4 gap-2">
                {['Today', 'Tomorrow', 'Dec 26', 'Dec 27'].map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedDate === date
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
              <div className="grid grid-cols-3 gap-2">
                {['7:00 AM', '9:00 AM', '2:00 PM'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  -
                </button>
                <span className="text-xl font-semibold">{guests}</span>
                <button
                  onClick={() => setGuests(guests + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-4 border-t border-gray-200 mb-6">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-800">
                ${experience.price * guests}
              </span>
            </div>

            <button onClick={handleBook} className="btn btn-primary w-full text-lg">
              Book Now
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Free cancellation up to 24 hours before
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExperienceDetailPage;
