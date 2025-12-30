import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ExperienceCard from '../components/ExperienceCard';

const guides = [
  { id: 1, name: "Pemba Sherpa", level: "Professional", avatar: "👨‍🦱", rating: 4.9, reviews: 127, tours: 342, languages: ["English", "Nepali"], badges: ["Platform Trained", "Female-Safe", "First Aid"], trustScore: 98, bio: "12 years guiding through Nepal. I love sharing hidden stories of my homeland.", responseTime: "1 hour" },
  { id: 2, name: "Sita Thapa", level: "Trained", avatar: "👩", rating: 4.8, reviews: 89, tours: 156, languages: ["English", "Nepali"], badges: ["GPS-Verified", "First Aid"], trustScore: 95, bio: "Lifelong Kathmandu resident and food enthusiast.", responseTime: "2 hours" },
  { id: 3, name: "Tenzin Lama", level: "Master", avatar: "👴", rating: 5.0, reviews: 203, tours: 1205, languages: ["English", "Nepali", "Tibetan"], badges: ["Master Guide", "Heritage Expert", "Mentor"], trustScore: 99, bio: "30 years of mountain guiding. Trained 50+ guides.", responseTime: "30 min" },
  { id: 4, name: "Maya Gurung", level: "Professional", avatar: "👩‍🍳", rating: 4.9, reviews: 156, tours: 423, languages: ["English", "Nepali", "Japanese"], badges: ["Female-Safe", "Platform Trained"], trustScore: 97, bio: "Third-generation cook from Gorkha.", responseTime: "1 hour" },
  { id: 5, name: "Ram Tamang", level: "Trained", avatar: "👨‍🎨", rating: 4.7, reviews: 64, tours: 98, languages: ["English", "Nepali"], badges: ["Heritage Expert"], trustScore: 92, bio: "Traditional Thangka painter for 20 years.", responseTime: "3 hours" },
  { id: 6, name: "Dawa Lama", level: "Professional", avatar: "🧘", rating: 4.9, reviews: 145, tours: 312, languages: ["English", "Nepali", "Tibetan"], badges: ["Platform Trained", "Female-Safe"], trustScore: 97, bio: "Buddhist meditation teacher at Kopan Monastery.", responseTime: "2 hours" },
];

const experiences = [
  { id: 1, title: "Hidden Temple Morning Walk", guide: "Pemba Sherpa", guideId: 1, price: 25, duration: "3h", rating: 4.9, reviews: 127, image: "🏛️", category: "culture", badges: ["GPS-Verified", "Female-Safe"] },
  { id: 2, title: "Street Food Adventure", guide: "Sita Thapa", guideId: 2, price: 18, duration: "2h", rating: 4.8, reviews: 89, image: "🍜", category: "food", badges: ["GPS-Verified"] },
];

function GuideProfilePage() {
  const { id } = useParams();
  const guide = guides.find(g => g.id === parseInt(id));
  const guideExperiences = experiences.filter(e => e.guideId === parseInt(id));

  if (!guide) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><h2>Guide not found</h2></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center sticky top-24">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary-100 flex items-center justify-center text-5xl mb-4">
              {guide.avatar}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{guide.name}</h1>
            <p className="text-primary-500 font-medium">{guide.level} Guide</p>

            <div className="flex justify-center gap-6 my-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{guide.rating}</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{guide.reviews}</div>
                <div className="text-sm text-gray-500">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{guide.tours}</div>
                <div className="text-sm text-gray-500">Tours</div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="text-3xl font-bold text-green-600">{guide.trustScore}%</div>
              <div className="text-sm text-green-700">Trust Score</div>
            </div>

            <button className="btn btn-primary w-full mb-3">Contact Guide</button>
            <p className="text-sm text-gray-500">Usually responds in {guide.responseTime}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">{guide.bio}</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">Badges & Certifications</h2>
            <div className="flex flex-wrap gap-3">
              {guide.badges.map((badge, i) => (
                <span key={i} className="badge badge-success px-4 py-2">✓ {badge}</span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">Languages</h2>
            <div className="flex flex-wrap gap-3">
              {guide.languages.map((lang, i) => (
                <span key={i} className="badge bg-gray-100 text-gray-700 px-4 py-2">{lang}</span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">Experiences by {guide.name}</h2>
            {guideExperiences.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {guideExperiences.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
              </div>
            ) : (
              <p className="text-gray-500">No experiences listed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideProfilePage;
