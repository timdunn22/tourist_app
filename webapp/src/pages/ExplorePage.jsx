import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ExperienceCard from '../components/ExperienceCard';

// Demo data
const experiences = [
  { id: 1, title: "Hidden Temple Morning Walk", guide: "Pemba Sherpa", guideId: 1, price: 25, duration: "3h", rating: 4.9, reviews: 127, image: "🏛️", category: "culture", badges: ["GPS-Verified", "Female-Safe"], trustScore: 98, lat: 27.7045, lng: 85.3066, meetingPoint: "Durbar Square" },
  { id: 2, title: "Street Food Adventure", guide: "Sita Thapa", guideId: 2, price: 18, duration: "2h", rating: 4.8, reviews: 89, image: "🍜", category: "food", badges: ["GPS-Verified", "First Aid Ready"], trustScore: 95, lat: 27.7152, lng: 85.3123, meetingPoint: "Thamel Chowk" },
  { id: 3, title: "Sunrise Hike to Nagarkot", guide: "Tenzin Lama", guideId: 3, price: 45, duration: "6h", rating: 5.0, reviews: 203, image: "🌄", category: "adventure", badges: ["Master Guide", "First Aid Ready"], trustScore: 99, lat: 27.7156, lng: 85.5167, meetingPoint: "Nagarkot" },
  { id: 4, title: "Traditional Cooking Class", guide: "Maya Gurung", guideId: 4, price: 35, duration: "4h", rating: 4.9, reviews: 156, image: "👩‍🍳", category: "food", badges: ["Female-Safe", "Platform Trained"], trustScore: 97, lat: 27.6722, lng: 85.3240, meetingPoint: "Patan" },
  { id: 5, title: "Artisan Craft Workshop", guide: "Ram Tamang", guideId: 5, price: 30, duration: "3h", rating: 4.7, reviews: 64, image: "🎨", category: "culture", badges: ["Heritage Expert"], trustScore: 92, lat: 27.6763, lng: 85.3285, meetingPoint: "Patan Craft Center" },
  { id: 6, title: "Meditation Retreat", guide: "Dawa Lama", guideId: 6, price: 28, duration: "3h", rating: 4.9, reviews: 145, image: "🧘", category: "wellness", badges: ["Platform Trained", "Female-Safe"], trustScore: 97, lat: 27.7394, lng: 85.3622, meetingPoint: "Kopan Monastery" },
];

const categories = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'culture', label: 'Culture', icon: '🏛️' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'adventure', label: 'Adventure', icon: '🌄' },
  { id: 'wellness', label: 'Wellness', icon: '🧘' },
];

function ExplorePage() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const filteredExperiences = experiences.filter(exp => {
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesPrice = exp.price >= priceRange[0] && exp.price <= priceRange[1];
    return matchesCategory && matchesPrice;
  });

  useEffect(() => {
    if (viewMode !== 'map' || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current).setView([27.7172, 85.3240], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    filteredExperiences.forEach(exp => {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-bubble"><span class="marker-emoji">${exp.image}</span><span class="marker-price">$${exp.price}</span></div>`,
        iconSize: [50, 60],
        iconAnchor: [25, 60],
      });

      const marker = L.marker([exp.lat, exp.lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="font-weight: 600; margin-bottom: 4px;">${exp.title}</h4>
          <p style="color: #666; font-size: 14px;">${exp.guide} • ⭐ ${exp.rating}</p>
          <p style="font-weight: 700; color: #E07A5F; margin-top: 8px;">$${exp.price} / ${exp.duration}</p>
          <p style="font-size: 12px; color: #888;">📍 ${exp.meetingPoint}</p>
        </div>
      `);

      marker.on('click', () => setSelectedExperience(exp));
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode, filteredExperiences]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  viewMode === 'map' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                }`}
              >
                🗺️ Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'grid' ? (
          <>
            <p className="text-gray-500 mb-6">
              {filteredExperiences.length} experiences in Kathmandu
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-200px)]">
            {/* Map */}
            <div className="flex-1 rounded-2xl overflow-hidden shadow-lg min-h-[400px] lg:min-h-0">
              <div ref={mapRef} className="w-full h-full" />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-none">
              <h3 className="font-semibold text-gray-800 mb-4">
                {filteredExperiences.length} experiences
              </h3>
              <div className="space-y-4">
                {filteredExperiences.map((exp) => (
                  <Link
                    key={exp.id}
                    to={`/experience/${exp.id}`}
                    className={`block card p-4 ${
                      selectedExperience?.id === exp.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onMouseEnter={() => setSelectedExperience(exp)}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-primary-50 flex items-center justify-center text-3xl">
                        {exp.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">{exp.title}</h4>
                        <p className="text-sm text-gray-500">{exp.guide}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-400">⭐ {exp.rating}</span>
                          <span className="font-bold text-primary-500">${exp.price}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
