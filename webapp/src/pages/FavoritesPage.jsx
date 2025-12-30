import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const sampleFavorites = [
  { id: 1, title: "Hidden Temple Morning Walk", guide: "Pemba Sherpa", price: 25, rating: 4.9, reviews: 47, image: "🏛️", duration: "3 hours", category: "Cultural" },
  { id: 2, title: "Street Food Adventure", guide: "Sita Thapa", price: 18, rating: 4.8, reviews: 89, image: "🍜", duration: "4 hours", category: "Food" },
  { id: 4, title: "Traditional Pottery Workshop", guide: "Maya Dangol", price: 35, rating: 4.7, reviews: 23, image: "🏺", duration: "3 hours", category: "Crafts" },
];

function FavoritesPage() {
  const { favorites, toggleFavorite } = useStore();

  // Use sample data for demo
  const favoriteExperiences = sampleFavorites;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">My Favorites</h1>

      {favoriteExperiences.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💝</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-6">Start exploring and save experiences you love!</p>
          <Link to="/explore" className="btn btn-primary">
            Explore Experiences
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteExperiences.map((exp) => (
            <div key={exp.id} className="card group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-6xl">
                  {exp.image}
                </div>
                <button
                  onClick={() => toggleFavorite(exp.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:scale-110 transition-transform"
                >
                  ❤️
                </button>
                <span className="absolute top-3 left-3 badge badge-primary">
                  {exp.category}
                </span>
              </div>

              <div className="p-4">
                <Link to={`/experience/${exp.id}`}>
                  <h3 className="font-semibold text-gray-800 group-hover:text-primary-500 transition-colors">
                    {exp.title}
                  </h3>
                </Link>
                <p className="text-gray-500 text-sm mt-1">with {exp.guide}</p>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>⏱️ {exp.duration}</span>
                  <span>⭐ {exp.rating} ({exp.reviews})</span>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-lg font-bold text-primary-500">${exp.price}</span>
                    <span className="text-gray-500 text-sm"> / person</span>
                  </div>
                  <Link
                    to={`/experience/${exp.id}`}
                    className="btn btn-outline text-sm py-2"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Section */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 5, title: "Sunrise Hike to Nagarkot", price: 45, rating: 4.9, image: "🌄" },
            { id: 6, title: "Nepali Cooking Class", price: 40, rating: 4.8, image: "👨‍🍳" },
          ].map((exp) => (
            <Link
              key={exp.id}
              to={`/experience/${exp.id}`}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-primary-50 flex items-center justify-center text-3xl">
                  {exp.image}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{exp.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <span className="text-primary-500 font-semibold">${exp.price}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">⭐ {exp.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FavoritesPage;
