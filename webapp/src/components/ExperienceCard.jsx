import React from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Calculate trust score display
  const trustScore = experience.trustScore || Math.floor(85 + Math.random() * 15);
  const isGuestFavorite = experience.rating >= 4.8 && experience.reviews >= 20;
  const isTopRated = experience.rating >= 4.5;

  return (
    <article
      onClick={handleCardClick}
      className="card group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`${experience.title} - $${experience.price} per person`}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center overflow-hidden">
        <span className="text-7xl group-hover:scale-110 transition-transform duration-500 ease-out" aria-hidden="true">
          {experience.image}
        </span>

        {/* Favorite Button with animation */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-10 ${
            isFavorite
              ? 'bg-white scale-110'
              : 'bg-white/90 hover:bg-white hover:scale-110'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className={`transition-transform duration-200 ${isFavorite ? 'animate-scale-in' : ''}`}>
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>

        {/* Trust Score Badge - Airbnb style */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">{trustScore}</span>
          </div>
          <span className="text-xs font-medium text-gray-700">Trust</span>
        </div>

        {/* Guest Favorite Badge - Airbnb style */}
        {isGuestFavorite && (
          <div className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <span className="text-sm">🏆</span>
            <span className="text-xs font-semibold text-gray-800">Guest Favorite</span>
          </div>
        )}

        {/* Verification Badges */}
        {experience.badges?.length > 0 && !isGuestFavorite && (
          <div className="absolute bottom-3 left-3 flex gap-2 pointer-events-none">
            {experience.badges.slice(0, 2).map((badge, i) => (
              <span key={i} className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm flex items-center gap-1">
                <span className="text-green-500">✓</span> {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title and Rating Row */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-primary-500 transition-colors line-clamp-1">
            {experience.title}
          </h3>
          <div className="flex items-center gap-1 text-sm flex-shrink-0 ml-2">
            <span className="text-yellow-500" aria-hidden="true">★</span>
            <span className="font-semibold text-gray-900">{experience.rating}</span>
            <span className="text-gray-400">({experience.reviews})</span>
          </div>
        </div>

        {/* Guide with avatar */}
        <button
          onClick={handleGuideClick}
          className="flex items-center gap-2 text-gray-500 text-sm hover:text-primary-500 transition-colors group/guide"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-200 to-accent-200 flex items-center justify-center text-xs">
            👤
          </div>
          <span className="group-hover/guide:underline">with {experience.guide}</span>
          {isTopRated && (
            <span className="text-blue-500 text-xs" title="Verified Guide">✓</span>
          )}
        </button>

        {/* Social Proof - Recent bookings */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <div className="flex -space-x-1.5">
            {['👩', '👨', '🧑'].map((emoji, i) => (
              <span key={i} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] border border-white">
                {emoji}
              </span>
            ))}
          </div>
          <span>Booked {3 + Math.floor(Math.random() * 8)} times this week</span>
        </div>

        {/* Footer with price and duration */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span aria-hidden="true">⏱️</span>
              <span>{experience.duration}</span>
            </span>
            {experience.difficulty && (
              <span className="flex items-center gap-1">
                <span aria-hidden="true">📊</span>
                <span>{experience.difficulty}</span>
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-primary-500">${experience.price}</span>
            <span className="text-gray-400 text-sm"> /person</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ExperienceCard;
