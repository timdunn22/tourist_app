import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

function ExperienceCard({ experience }) {
  const { favorites, addToFavorites, removeFromFavorites } = useStore();
  const isFavorite = favorites.some(f => f.id === experience.id);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(experience.id);
    } else {
      addToFavorites(experience);
    }
  };

  return (
    <Link to={`/experience/${experience.id}`} className="card group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
        <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
          {experience.image}
        </span>
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
        {experience.badges?.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {experience.badges.slice(0, 2).map((badge, i) => (
              <span key={i} className="badge badge-success text-xs">
                ✓ {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-primary-500 transition-colors">
            {experience.title}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <span>⭐</span>
            <span className="font-semibold">{experience.rating}</span>
            <span className="text-gray-400">({experience.reviews})</span>
          </div>
        </div>

        <Link
          to={`/guide/${experience.guideId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-gray-500 text-sm hover:text-primary-500"
        >
          with {experience.guide}
        </Link>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>⏱️ {experience.duration}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary-500">${experience.price}</span>
            <span className="text-gray-400 text-sm"> /person</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ExperienceCard;
