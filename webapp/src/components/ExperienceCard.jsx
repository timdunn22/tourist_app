import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

function ExperienceCard({ experience }) {
  const navigate = useNavigate();
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

  const handleCardClick = () => {
    navigate(`/experience/${experience.id}`);
  };

  const handleGuideClick = (e) => {
    e.stopPropagation();
    navigate(`/guide/${experience.guideId}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="card group cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`${experience.title} - $${experience.price} per person`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
        <span className="text-7xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
          {experience.image}
        </span>
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
        {experience.badges?.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-2 pointer-events-none">
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
            <span aria-hidden="true">⭐</span>
            <span className="font-semibold">{experience.rating}</span>
            <span className="text-gray-400">({experience.reviews})</span>
          </div>
        </div>

        <button
          onClick={handleGuideClick}
          className="text-gray-500 text-sm hover:text-primary-500 hover:underline text-left"
        >
          with {experience.guide}
        </button>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span aria-hidden="true">⏱️</span>
            <span>{experience.duration}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary-500">${experience.price}</span>
            <span className="text-gray-400 text-sm"> /person</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ExperienceCard;
