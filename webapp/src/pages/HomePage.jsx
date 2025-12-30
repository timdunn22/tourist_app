import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExperienceCard from '../components/ExperienceCard';

// Demo data
const experiences = [
  { id: 1, title: "Hidden Temple Morning Walk", guide: "Pemba Sherpa", guideId: 1, price: 25, duration: "3h", rating: 4.9, reviews: 127, image: "🏛️", category: "culture", badges: ["GPS-Verified", "Female-Safe"], trustScore: 98, lat: 27.7045, lng: 85.3066 },
  { id: 2, title: "Street Food Adventure", guide: "Sita Thapa", guideId: 2, price: 18, duration: "2h", rating: 4.8, reviews: 89, image: "🍜", category: "food", badges: ["GPS-Verified", "First Aid Ready"], trustScore: 95, lat: 27.7152, lng: 85.3123 },
  { id: 3, title: "Sunrise Hike to Nagarkot", guide: "Tenzin Lama", guideId: 3, price: 45, duration: "6h", rating: 5.0, reviews: 203, image: "🌄", category: "adventure", badges: ["Master Guide", "First Aid Ready"], trustScore: 99, lat: 27.7156, lng: 85.5167 },
  { id: 4, title: "Traditional Cooking Class", guide: "Maya Gurung", guideId: 4, price: 35, duration: "4h", rating: 4.9, reviews: 156, image: "👩‍🍳", category: "food", badges: ["Female-Safe", "Platform Trained"], trustScore: 97, lat: 27.6722, lng: 85.3240 },
  { id: 5, title: "Artisan Craft Workshop", guide: "Ram Tamang", guideId: 5, price: 30, duration: "3h", rating: 4.7, reviews: 64, image: "🎨", category: "culture", badges: ["Heritage Expert"], trustScore: 92, lat: 27.6763, lng: 85.3285 },
  { id: 6, title: "Meditation Retreat", guide: "Dawa Lama", guideId: 6, price: 28, duration: "3h", rating: 4.9, reviews: 145, image: "🧘", category: "wellness", badges: ["Platform Trained", "Female-Safe"], trustScore: 97, lat: 27.7394, lng: 85.3622 },
];

const categories = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'culture', label: 'Culture', icon: '🏛️' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'adventure', label: 'Adventure', icon: '🌄' },
  { id: 'wellness', label: 'Wellness', icon: '🧘' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
];

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperiences = experiences.filter(exp => {
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.guide.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-400 to-accent-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              Discover Authentic Local Experiences
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Connect with verified local guides in Kathmandu for unforgettable adventures.
              Travel human. Travel safe.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl">
              <div className="flex-1 flex items-center gap-3 px-4">
                <span className="text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search experiences, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 text-gray-800 outline-none"
                />
              </div>
              <div className="flex items-center gap-3 px-4 border-t sm:border-t-0 sm:border-l border-gray-200">
                <span className="text-gray-400">📍</span>
                <span className="text-gray-600">Kathmandu, Nepal</span>
              </div>
              <Link to="/explore" className="btn btn-primary">
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Verified Guides</div>
                <div className="text-sm text-gray-500">Background checked</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📍</span>
              <div className="text-left">
                <div className="font-semibold text-gray-800">GPS Tracking</div>
                <div className="text-sm text-gray-500">Real-time safety</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Secure Payments</div>
                <div className="text-sm text-gray-500">Money-back guarantee</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">💬</span>
              <div className="text-left">
                <div className="font-semibold text-gray-800">24/7 Support</div>
                <div className="text-sm text-gray-500">Always here to help</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-8">
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-800">
              Popular Experiences
            </h2>
            <Link to="/explore" className="text-primary-500 font-semibold hover:text-primary-600">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold mb-6">
            Become a Local Guide
          </h2>
          <p className="text-xl text-secondary-200 mb-8">
            Share your knowledge, earn income, and connect with travelers from around the world.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn bg-white text-secondary-600 hover:bg-gray-100">
              Learn More
            </button>
            <button className="btn border-2 border-white text-white hover:bg-secondary-400">
              Apply Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
