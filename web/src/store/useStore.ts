import { create } from 'zustand';

export interface Experience {
  id: number;
  title: string;
  guide: string;
  guideId: number;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badges: string[];
  trustScore: number;
  description: string;
  meetingPoint: string;
  includes: string[];
  groupSize: string;
  difficulty: string;
  availability: string[];
}

export interface Guide {
  id: number;
  name: string;
  level: string;
  levelNum: number;
  avatar: string;
  rating: number;
  reviews: number;
  tours: number;
  languages: string[];
  badges: string[];
  trustScore: number;
  bio: string;
  responseTime: string;
  specialties: string[];
  memberSince: string;
}

export interface Service {
  id: number;
  title: string;
  price: number;
  icon: string;
  time: string;
  description: string;
}

export interface Stay {
  id: number;
  title: string;
  type: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  badges: string[];
  description: string;
  amenities: string[];
  location: string;
  host: string;
  hostAvatar: string;
}

export interface Booking {
  id: number;
  experienceId: number;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  people: number;
  total: number;
  guide?: Guide;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'traveler' | 'guide';
  avatar?: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  experiences: Experience[];
  guides: Guide[];
  services: Service[];
  stays: Stay[];
  bookings: Booking[];
  activeTab: string;

  setUser: (user: User | null) => void;
  setActiveTab: (tab: string) => void;
  getExperienceById: (id: number) => Experience | undefined;
  getGuideById: (id: number) => Guide | undefined;
  addBooking: (booking: Omit<Booking, 'id'>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  activeTab: 'home',

  experiences: [
    { id: 1, title: "Hidden Temple Morning Walk", guide: "Pemba Sherpa", guideId: 1, price: 25, duration: "3h", rating: 4.9, reviews: 127, image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400", category: "culture", badges: ["GPS-Verified", "Female-Safe", "Platform Trained"], trustScore: 98, description: "Discover ancient temples hidden in Kathmandu's backstreets. Visit sacred sites locals pray at daily.", meetingPoint: "Durbar Square main gate", includes: ["Local guide", "Temple offerings", "Chai tea", "Photo opportunities"], groupSize: "1-6 people", difficulty: "Easy", availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
    { id: 2, title: "Street Food Adventure", guide: "Sita Thapa", guideId: 2, price: 18, duration: "2h", rating: 4.8, reviews: 89, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", category: "food", badges: ["GPS-Verified", "First Aid Ready", "Heritage Expert"], trustScore: 95, description: "Taste authentic momos, sel roti, and chatamari at family-run stalls.", meetingPoint: "Thamel Chowk", includes: ["5 food tastings", "Bottled water", "Food history", "Recipe cards"], groupSize: "2-8 people", difficulty: "Easy", availability: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    { id: 3, title: "Sunrise Hike to Nagarkot", guide: "Tenzin Lama", guideId: 3, price: 45, duration: "6h", rating: 5.0, reviews: 203, image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400", category: "adventure", badges: ["Master Guide", "First Aid Ready", "GPS-Verified"], trustScore: 99, description: "Watch the sun rise over the Himalayas from Nagarkot viewpoint.", meetingPoint: "Hotel pickup", includes: ["Transport", "Breakfast", "Tea/coffee", "Hiking poles"], groupSize: "2-10 people", difficulty: "Moderate", availability: ["Mon", "Wed", "Fri", "Sat", "Sun"] },
    { id: 4, title: "Traditional Cooking Class", guide: "Maya Gurung", guideId: 4, price: 35, duration: "4h", rating: 4.9, reviews: 156, image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400", category: "food", badges: ["Female-Safe", "Platform Trained", "GPS-Verified"], trustScore: 97, description: "Learn to cook dal bhat, momos, and Nepali desserts in a local home kitchen.", meetingPoint: "Patan Durbar Square", includes: ["All ingredients", "Recipe booklet", "Spice pack", "Full meal"], groupSize: "2-6 people", difficulty: "Easy", availability: ["Mon", "Tue", "Thu", "Sat"] },
    { id: 5, title: "Artisan Craft Workshop", guide: "Ram Tamang", guideId: 5, price: 30, duration: "3h", rating: 4.7, reviews: 64, image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400", category: "culture", badges: ["Heritage Expert", "GPS-Verified"], trustScore: 92, description: "Create traditional Thangka paintings or pottery with master craftspeople.", meetingPoint: "Patan craft center", includes: ["All materials", "Expert instruction", "Your artwork", "Tea"], groupSize: "2-4 people", difficulty: "Easy", availability: ["Mon", "Wed", "Fri"] },
    { id: 6, title: "Meditation & Yoga Retreat", guide: "Dawa Lama", guideId: 6, price: 28, duration: "3h", rating: 4.9, reviews: 145, image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400", category: "wellness", badges: ["Platform Trained", "Female-Safe", "GPS-Verified"], trustScore: 97, description: "Find inner peace at an ancient monastery. Guided meditation and yoga session.", meetingPoint: "Kopan Monastery gate", includes: ["Yoga mat", "Herbal tea", "Meditation guidance", "Blessing"], groupSize: "1-10 people", difficulty: "Easy", availability: ["Daily"] },
  ],

  guides: [
    { id: 1, name: "Pemba Sherpa", level: "Professional Guide", levelNum: 2, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", rating: 4.9, reviews: 127, tours: 342, languages: ["English", "Nepali", "Hindi"], badges: ["Platform Trained", "Female-Safe", "First Aid Ready"], trustScore: 98, bio: "Born in Solukhumbu, I've been guiding travelers through Nepal for 12 years.", responseTime: "Usually responds in 1 hour", specialties: ["Temples", "History", "Photography"], memberSince: "2019" },
    { id: 2, name: "Sita Thapa", level: "Platform Trained", levelNum: 1, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", rating: 4.8, reviews: 89, tours: 156, languages: ["English", "Nepali"], badges: ["GPS-Verified", "First Aid Ready"], trustScore: 95, bio: "A lifelong Kathmandu resident and food enthusiast.", responseTime: "Usually responds in 2 hours", specialties: ["Street Food", "Local Cuisine", "Markets"], memberSince: "2021" },
    { id: 3, name: "Tenzin Lama", level: "Master Guide", levelNum: 3, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", rating: 5.0, reviews: 203, tours: 1205, languages: ["English", "Nepali", "Tibetan", "Mandarin"], badges: ["Master Guide", "Heritage Expert", "First Aid Ready", "Mentor"], trustScore: 99, bio: "30 years of mountain guiding experience. Trained over 50 new guides.", responseTime: "Usually responds in 30 minutes", specialties: ["Trekking", "Mountains", "Meditation"], memberSince: "2018" },
    { id: 4, name: "Maya Gurung", level: "Professional Guide", levelNum: 2, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", rating: 4.9, reviews: 156, tours: 423, languages: ["English", "Nepali", "Japanese"], badges: ["Female-Safe", "Platform Trained", "GPS-Verified", "Heritage Expert"], trustScore: 97, bio: "Third-generation cook from Gorkha district.", responseTime: "Usually responds in 1 hour", specialties: ["Cooking", "Culture", "Women's Tours"], memberSince: "2020" },
    { id: 5, name: "Ram Tamang", level: "Platform Trained", levelNum: 1, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", rating: 4.7, reviews: 64, tours: 89, languages: ["English", "Nepali", "Newari"], badges: ["Heritage Expert", "GPS-Verified"], trustScore: 92, bio: "Master craftsman specializing in traditional Thangka painting.", responseTime: "Usually responds in 3 hours", specialties: ["Art", "Crafts", "History"], memberSince: "2022" },
    { id: 6, name: "Dawa Lama", level: "Professional Guide", levelNum: 2, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100", rating: 4.9, reviews: 145, tours: 678, languages: ["English", "Nepali", "Tibetan"], badges: ["Platform Trained", "Female-Safe", "GPS-Verified"], trustScore: 97, bio: "Buddhist monk and certified yoga instructor.", responseTime: "Usually responds in 1 hour", specialties: ["Meditation", "Yoga", "Spirituality"], memberSince: "2020" },
  ],

  services: [
    { id: 1, title: "SIM Card Setup", price: 5, icon: "📱", time: "30 min", description: "Get a local SIM card with data." },
    { id: 2, title: "Airport Pickup", price: 15, icon: "✈️", time: "1 hour", description: "Safe airport pickup with name board." },
    { id: 3, title: "Translation Help", price: 8, icon: "🗣️", time: "1 hour", description: "Real-time translation for any situation." },
    { id: 4, title: "Bargaining Helper", price: 10, icon: "🛍️", time: "2 hours", description: "Help negotiating fair prices at markets." },
    { id: 5, title: "Hospital Support", price: 20, icon: "🏥", time: "As needed", description: "Medical translation and hospital navigation." },
    { id: 6, title: "Emergency Support", price: 25, icon: "🆘", time: "Immediate", description: "24/7 emergency assistance." },
  ],

  stays: [
    { id: 1, title: "Maya's Homestay", type: "Homestay", price: 28, rating: 4.9, reviews: 67, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", badges: ["Female-Friendly", "Family-Run", "Breakfast Included"], description: "Cozy room in a traditional Newari house.", amenities: ["WiFi", "Hot Water", "Garden", "Kitchen Access"], location: "Patan", host: "Maya Tamang", hostAvatar: "👵" },
    { id: 2, title: "Himalayan View Hotel", type: "Hotel", price: 65, rating: 4.7, reviews: 234, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", badges: ["Mountain View", "WiFi", "Restaurant"], description: "Modern hotel with stunning Himalayan views.", amenities: ["WiFi", "AC", "TV", "Room Service", "Restaurant"], location: "Thamel", host: "Hotel Staff", hostAvatar: "🏨" },
    { id: 3, title: "Backpacker's Haven", type: "Hostel", price: 12, rating: 4.6, reviews: 456, image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400", badges: ["Social", "Budget", "Central"], description: "Vibrant hostel in the heart of Thamel.", amenities: ["WiFi", "Lockers", "Common Room", "Rooftop"], location: "Thamel", host: "Raj Shakya", hostAvatar: "🧑‍🦱" },
  ],

  bookings: [
    { id: 1, experienceId: 1, date: "Today", time: "9:00 AM", status: "upcoming", people: 2, total: 55 },
    { id: 2, experienceId: 3, date: "Dec 26", time: "5:00 AM", status: "upcoming", people: 1, total: 50 },
    { id: 3, experienceId: 2, date: "Dec 20", time: "6:00 PM", status: "completed", people: 2, total: 41 },
  ],

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  getExperienceById: (id) => get().experiences.find(e => e.id === id),
  getGuideById: (id) => get().guides.find(g => g.id === id),
  addBooking: (booking) => set(state => ({
    bookings: [...state.bookings, { ...booking, id: Date.now() }]
  })),
}));
