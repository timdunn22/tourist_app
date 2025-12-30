import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('LocalLink2024!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@locallink.app' },
    update: {},
    create: {
      email: 'admin@locallink.app',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'culture' },
      update: {},
      create: { name: 'Culture & History', slug: 'culture', icon: '🏛️', description: 'Temples, museums, and historical sites' },
    }),
    prisma.category.upsert({
      where: { slug: 'food' },
      update: {},
      create: { name: 'Food & Drink', slug: 'food', icon: '🍜', description: 'Street food, cooking classes, and food tours' },
    }),
    prisma.category.upsert({
      where: { slug: 'adventure' },
      update: {},
      create: { name: 'Adventure', slug: 'adventure', icon: '🏔️', description: 'Hiking, trekking, and outdoor activities' },
    }),
    prisma.category.upsert({
      where: { slug: 'wellness' },
      update: {},
      create: { name: 'Wellness', slug: 'wellness', icon: '🧘', description: 'Yoga, meditation, and spa experiences' },
    }),
    prisma.category.upsert({
      where: { slug: 'crafts' },
      update: {},
      create: { name: 'Arts & Crafts', slug: 'crafts', icon: '🎨', description: 'Workshops and creative experiences' },
    }),
    prisma.category.upsert({
      where: { slug: 'nightlife' },
      update: {},
      create: { name: 'Nightlife', slug: 'nightlife', icon: '🌙', description: 'Evening tours and entertainment' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create sample guides
  const guidePassword = await bcrypt.hash('guide123', 12);
  
  const pembaUser = await prisma.user.upsert({
    where: { email: 'pemba@locallink.app' },
    update: {},
    create: {
      email: 'pemba@locallink.app',
      passwordHash: guidePassword,
      name: 'Pemba Sherpa',
      role: 'GUIDE',
      status: 'ACTIVE',
      emailVerified: true,
      bio: 'Born in Solukhumbu, I have been guiding travelers through Nepal for 12 years.',
      location: 'Kathmandu, Nepal',
      languages: ['English', 'Nepali', 'Hindi'],
    },
  });

  const pembaGuide = await prisma.guide.upsert({
    where: { userId: pembaUser.id },
    update: {},
    create: {
      userId: pembaUser.id,
      verified: true,
      verifiedAt: new Date(),
      level: 'PROFESSIONAL',
      trustScore: 98,
      completedTours: 342,
      totalEarnings: 15420,
      rating: 4.9,
      reviewCount: 127,
      responseTime: 60,
      specialties: ['Temples', 'History', 'Photography'],
      badges: ['Platform Trained', 'Female-Safe', 'First Aid Ready'],
    },
  });

  const sitaUser = await prisma.user.upsert({
    where: { email: 'sita@locallink.app' },
    update: {},
    create: {
      email: 'sita@locallink.app',
      passwordHash: guidePassword,
      name: 'Sita Thapa',
      role: 'GUIDE',
      status: 'ACTIVE',
      emailVerified: true,
      bio: 'A lifelong Kathmandu resident and food enthusiast.',
      location: 'Kathmandu, Nepal',
      languages: ['English', 'Nepali'],
    },
  });

  const sitaGuide = await prisma.guide.upsert({
    where: { userId: sitaUser.id },
    update: {},
    create: {
      userId: sitaUser.id,
      verified: true,
      verifiedAt: new Date(),
      level: 'TRAINED',
      trustScore: 95,
      completedTours: 156,
      totalEarnings: 8340,
      rating: 4.8,
      reviewCount: 89,
      responseTime: 120,
      specialties: ['Street Food', 'Local Cuisine', 'Markets'],
      badges: ['GPS-Verified', 'First Aid Ready'],
    },
  });

  console.log('✅ Guides created');

  // Create sample experiences
  const cultureCategory = categories.find(c => c.slug === 'culture');
  const foodCategory = categories.find(c => c.slug === 'food');

  await prisma.experience.upsert({
    where: { slug: 'hidden-temple-morning-walk' },
    update: {},
    create: {
      guideId: pembaGuide.id,
      title: 'Hidden Temple Morning Walk',
      slug: 'hidden-temple-morning-walk',
      description: 'Discover ancient temples hidden in Kathmandu backstreets. Visit sacred sites locals pray at daily. Learn about Buddhist and Hindu traditions from someone who grew up with them.',
      shortDescription: 'Explore hidden temples with a local guide',
      categoryId: cultureCategory!.id,
      tags: ['temples', 'culture', 'morning', 'walking'],
      duration: 180,
      price: 25,
      currency: 'USD',
      groupSizeMin: 1,
      groupSizeMax: 6,
      difficulty: 'EASY',
      meetingPoint: 'Durbar Square main gate',
      meetingPointLat: 27.7047,
      meetingPointLng: 85.3066,
      city: 'Kathmandu',
      country: 'Nepal',
      images: [],
      includes: ['Local guide', 'Temple offerings', 'Chai tea', 'Photo opportunities'],
      notIncluded: ['Transportation', 'Lunch'],
      requirements: ['Comfortable walking shoes', 'Modest clothing for temples'],
      instantBook: true,
      advanceNotice: 24,
      status: 'PUBLISHED',
      featured: true,
      bookingCount: 127,
      rating: 4.9,
      reviewCount: 127,
      publishedAt: new Date(),
    },
  });

  await prisma.experience.upsert({
    where: { slug: 'street-food-adventure' },
    update: {},
    create: {
      guideId: sitaGuide.id,
      title: 'Street Food Adventure',
      slug: 'street-food-adventure',
      description: 'Taste authentic momos, sel roti, and chatamari at family-run stalls. Includes 5 food stops with vegetarian options available.',
      shortDescription: 'Taste the best street food with a local foodie',
      categoryId: foodCategory!.id,
      tags: ['food', 'street food', 'momos', 'local'],
      duration: 120,
      price: 18,
      currency: 'USD',
      groupSizeMin: 2,
      groupSizeMax: 8,
      difficulty: 'EASY',
      meetingPoint: 'Thamel Chowk',
      meetingPointLat: 27.7153,
      meetingPointLng: 85.3122,
      city: 'Kathmandu',
      country: 'Nepal',
      images: [],
      includes: ['5 food tastings', 'Bottled water', 'Food history', 'Recipe cards'],
      notIncluded: ['Additional food', 'Alcoholic beverages'],
      requirements: ['Come hungry!'],
      instantBook: true,
      advanceNotice: 12,
      status: 'PUBLISHED',
      featured: false,
      bookingCount: 89,
      rating: 4.8,
      reviewCount: 89,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Experiences created');

  // Create services
  await Promise.all([
    prisma.service.upsert({
      where: { slug: 'sim-card-setup' },
      update: {},
      create: { title: 'SIM Card Setup', slug: 'sim-card-setup', description: 'Get a local SIM card with data', icon: '📱', price: 5, duration: '30 min', sortOrder: 1 },
    }),
    prisma.service.upsert({
      where: { slug: 'airport-pickup' },
      update: {},
      create: { title: 'Airport Pickup', slug: 'airport-pickup', description: 'Safe airport pickup with name board', icon: '✈️', price: 15, duration: '1 hour', sortOrder: 2 },
    }),
    prisma.service.upsert({
      where: { slug: 'translation-help' },
      update: {},
      create: { title: 'Translation Help', slug: 'translation-help', description: 'Real-time translation for any situation', icon: '🗣️', price: 8, duration: '1 hour', sortOrder: 3 },
    }),
    prisma.service.upsert({
      where: { slug: 'emergency-support' },
      update: {},
      create: { title: 'Emergency Support', slug: 'emergency-support', description: '24/7 emergency assistance', icon: '🆘', price: 25, duration: 'Immediate', sortOrder: 6 },
    }),
  ]);
  // More services
  await Promise.all([
    prisma.service.upsert({
      where: { slug: 'bargaining-help' },
      update: {},
      create: { title: 'Bargaining Help', slug: 'bargaining-help', description: 'Help negotiating fair prices at markets', icon: '🛍️', price: 10, duration: '2 hours', sortOrder: 4 },
    }),
    prisma.service.upsert({
      where: { slug: 'hospital-support' },
      update: {},
      create: { title: 'Hospital Support', slug: 'hospital-support', description: 'Medical translation and hospital navigation', icon: '🏥', price: 20, duration: 'As needed', sortOrder: 5 },
    }),
    prisma.service.upsert({
      where: { slug: 'event-companion' },
      update: {},
      create: { title: 'Event Companion', slug: 'event-companion', description: 'Local companion for festivals and events', icon: '🎉', price: 25, duration: '4 hours', sortOrder: 7 },
    }),
    prisma.service.upsert({
      where: { slug: 'shopping-guide' },
      update: {},
      create: { title: 'Shopping Guide', slug: 'shopping-guide', description: 'Navigate local markets and find authentic goods', icon: '🛒', price: 15, duration: '3 hours', sortOrder: 8 },
    }),
    prisma.service.upsert({
      where: { slug: 'scooter-rental-help' },
      update: {},
      create: { title: 'Scooter/Bike Setup', slug: 'scooter-rental-help', description: 'Help renting and setting up transportation', icon: '🛵', price: 10, duration: '1 hour', sortOrder: 9 },
    }),
  ]);
  console.log('✅ Services created');

  // Create stays
  await Promise.all([
    prisma.stay.upsert({
      where: { slug: 'mayas-homestay' },
      update: {},
      create: {
        slug: 'mayas-homestay',
        hostId: sitaUser.id,
        title: "Maya's Homestay",
        description: 'Cozy room in a traditional Newari house. Experience authentic Nepali family life.',
        type: 'HOMESTAY',
        address: 'Patan Durbar Square Area',
        city: 'Lalitpur',
        country: 'Nepal',
        latitude: 27.6722,
        longitude: 85.3240,
        pricePerNight: 28,
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Hot Water', 'Garden', 'Kitchen Access', 'Breakfast Included'],
        houseRules: ['No smoking', 'Quiet hours 10pm-7am', 'Shoes off indoors'],
        badges: ['Female-Friendly', 'Family-Run', 'Breakfast Included'],
        images: [],
        status: 'PUBLISHED',
        verified: true,
        rating: 4.9,
        reviewCount: 67,
      },
    }),
    prisma.stay.upsert({
      where: { slug: 'himalayan-view-hotel' },
      update: {},
      create: {
        slug: 'himalayan-view-hotel',
        hostId: admin.id,
        title: 'Himalayan View Hotel',
        description: 'Modern hotel with stunning Himalayan views. Rooftop restaurant with panoramic mountains.',
        type: 'HOTEL',
        address: 'Thamel Marg',
        city: 'Kathmandu',
        country: 'Nepal',
        latitude: 27.7153,
        longitude: 85.3122,
        pricePerNight: 65,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        amenities: ['WiFi', 'AC', 'TV', 'Room Service', 'Restaurant', 'Bar', 'Laundry'],
        houseRules: ['Check-in after 2pm', 'Check-out by 11am'],
        badges: ['Mountain View', 'WiFi', 'Restaurant'],
        images: [],
        status: 'PUBLISHED',
        verified: true,
        rating: 4.7,
        reviewCount: 234,
      },
    }),
    prisma.stay.upsert({
      where: { slug: 'backpackers-haven' },
      update: {},
      create: {
        slug: 'backpackers-haven',
        hostId: admin.id,
        title: "Backpacker's Haven",
        description: 'Vibrant hostel in the heart of Thamel. Perfect for solo travelers and making friends.',
        type: 'HOSTEL',
        address: 'Thamel Tourist Area',
        city: 'Kathmandu',
        country: 'Nepal',
        latitude: 27.7147,
        longitude: 85.3119,
        pricePerNight: 12,
        maxGuests: 8,
        bedrooms: 1,
        beds: 8,
        bathrooms: 2,
        amenities: ['WiFi', 'Lockers', 'Common Room', 'Rooftop', 'Free Tea', 'Laundry'],
        houseRules: ['Quiet hours 11pm-7am', 'No outside food in dorm'],
        badges: ['Social', 'Budget', 'Central'],
        images: [],
        status: 'PUBLISHED',
        verified: true,
        rating: 4.6,
        reviewCount: 456,
      },
    }),
  ]);
  console.log('✅ Stays created');

  // Create training modules
  await Promise.all([
    prisma.training.upsert({
      where: { slug: 'guest-etiquette' },
      update: {},
      create: {
        title: 'Guest Etiquette',
        slug: 'guest-etiquette',
        description: 'Learn how to provide excellent guest experiences',
        icon: '🤝',
        duration: 30,
        content: { modules: ['Introduction', 'Communication', 'Problem Solving'] },
        required: true,
        badgeAwarded: 'Platform Trained',
        sortOrder: 1,
      },
    }),
    prisma.training.upsert({
      where: { slug: 'female-traveler-safety' },
      update: {},
      create: {
        title: 'Female Traveler Safety',
        slug: 'female-traveler-safety',
        description: 'Best practices for ensuring female traveler safety',
        icon: '👩',
        duration: 45,
        content: { modules: ['Awareness', 'Safe Routes', 'Emergency Response'] },
        required: true,
        badgeAwarded: 'Female-Safe',
        sortOrder: 2,
      },
    }),
    prisma.training.upsert({
      where: { slug: 'first-aid-basics' },
      update: {},
      create: {
        title: 'First Aid Basics',
        slug: 'first-aid-basics',
        description: 'Essential first aid skills for guides',
        icon: '🏥',
        duration: 60,
        content: { modules: ['Basic First Aid', 'CPR', 'Emergency Contacts'] },
        required: true,
        badgeAwarded: 'First Aid Ready',
        sortOrder: 3,
      },
    }),
  ]);
  // More training modules
  await Promise.all([
    prisma.training.upsert({
      where: { slug: 'storytelling' },
      update: {},
      create: {
        title: 'Storytelling for Guides',
        slug: 'storytelling',
        description: 'Learn to engage travelers with compelling stories about your culture and places',
        icon: '📖',
        duration: 45,
        content: { modules: ['Crafting Stories', 'Engaging Delivery', 'Cultural Context'] },
        required: false,
        advanced: true,
        badgeAwarded: 'Master Storyteller',
        levelRequired: 'TRAINED',
        sortOrder: 4,
      },
    }),
    prisma.training.upsert({
      where: { slug: 'cultural-sensitivity' },
      update: {},
      create: {
        title: 'Cultural Sensitivity',
        slug: 'cultural-sensitivity',
        description: 'Understand and respect diverse cultural backgrounds of international travelers',
        icon: '🌍',
        duration: 40,
        content: { modules: ['Cultural Awareness', 'Common Mistakes', 'Communication Tips'] },
        required: true,
        badgeAwarded: 'Culturally Aware',
        sortOrder: 5,
      },
    }),
    prisma.training.upsert({
      where: { slug: 'heritage-expert' },
      update: {},
      create: {
        title: 'Heritage Expert Certification',
        slug: 'heritage-expert',
        description: 'Advanced training on Nepal\'s UNESCO heritage sites and historical knowledge',
        icon: '🏛️',
        duration: 120,
        content: { modules: ['UNESCO Sites', 'Historical Periods', 'Architecture', 'Exam'] },
        required: false,
        advanced: true,
        badgeAwarded: 'Heritage Expert',
        levelRequired: 'PROFESSIONAL',
        sortOrder: 6,
      },
    }),
    prisma.training.upsert({
      where: { slug: 'route-safety' },
      update: {},
      create: {
        title: 'Route Safety & Planning',
        slug: 'route-safety',
        description: 'Learn to plan safe routes and handle unexpected situations during tours',
        icon: '🗺️',
        duration: 50,
        content: { modules: ['Route Planning', 'Risk Assessment', 'Contingency Plans'] },
        required: true,
        badgeAwarded: 'Safety Certified',
        sortOrder: 7,
      },
    }),
    prisma.training.upsert({
      where: { slug: 'language-basics' },
      update: {},
      create: {
        title: 'English for Guides',
        slug: 'language-basics',
        description: 'Essential English phrases and communication skills for guiding tourists',
        icon: '🗣️',
        duration: 60,
        content: { modules: ['Basic Phrases', 'Tour Vocabulary', 'Pronunciation', 'Practice'] },
        required: false,
        sortOrder: 8,
      },
    }),
  ]);
  console.log('✅ Training modules created');

  // Create locations
  const nepal = await prisma.location.upsert({
    where: { slug: 'nepal' },
    update: {},
    create: {
      name: 'Nepal',
      slug: 'nepal',
      type: 'country',
      latitude: 28.3949,
      longitude: 84.1240,
      featured: true,
      active: true,
      description: 'A landlocked country in South Asia, famous for the Himalayas and rich cultural heritage',
    },
  });

  await Promise.all([
    prisma.location.upsert({
      where: { slug: 'kathmandu' },
      update: {},
      create: {
        name: 'Kathmandu',
        slug: 'kathmandu',
        type: 'city',
        parentId: nepal.id,
        latitude: 27.7172,
        longitude: 85.3240,
        featured: true,
        active: true,
        description: 'The capital city, known for ancient temples and vibrant streets',
      },
    }),
    prisma.location.upsert({
      where: { slug: 'pokhara' },
      update: {},
      create: {
        name: 'Pokhara',
        slug: 'pokhara',
        type: 'city',
        parentId: nepal.id,
        latitude: 28.2096,
        longitude: 83.9856,
        featured: true,
        active: true,
        description: 'Gateway to the Annapurna region, known for lakeside beauty',
      },
    }),
    prisma.location.upsert({
      where: { slug: 'chitwan' },
      update: {},
      create: {
        name: 'Chitwan',
        slug: 'chitwan',
        type: 'city',
        parentId: nepal.id,
        latitude: 27.5291,
        longitude: 84.3542,
        featured: true,
        active: true,
        description: 'Famous for Chitwan National Park and wildlife safaris',
      },
    }),
    prisma.location.upsert({
      where: { slug: 'bhaktapur' },
      update: {},
      create: {
        name: 'Bhaktapur',
        slug: 'bhaktapur',
        type: 'city',
        parentId: nepal.id,
        latitude: 27.6710,
        longitude: 85.4298,
        featured: true,
        active: true,
        description: 'Ancient Newari city with preserved medieval architecture',
      },
    }),
  ]);
  console.log('✅ Locations created');

  // Create safety zones
  await Promise.all([
    prisma.safetyZone.create({
      data: {
        name: 'Thamel Tourist Scam Zone',
        description: 'Area known for persistent touts and potential overcharging. Stay alert.',
        type: 'TOURIST_SCAM',
        coordinates: { lat: 27.7155, lng: 85.3120 },
        radius: 300,
        alertTitle: 'Tourist Scam Alert',
        alertMessage: 'This area has reports of aggressive touts. Only use verified guides from the app.',
        severity: 'CAUTION',
        active: true,
      },
    }),
    prisma.safetyZone.create({
      data: {
        name: 'Freak Street Night Zone',
        description: 'Less safe for solo travelers at night, especially after 10pm',
        type: 'NIGHT_ONLY',
        coordinates: { lat: 27.7047, lng: 85.3090 },
        radius: 200,
        alertTitle: 'Night Safety Advisory',
        alertMessage: 'This area is less safe after dark. Consider using a local companion.',
        severity: 'WARNING',
        active: true,
      },
    }),
    prisma.safetyZone.create({
      data: {
        name: 'Restricted Temple Area',
        description: 'Non-Hindu visitors may not be allowed in certain temple areas',
        type: 'RESTRICTED',
        coordinates: { lat: 27.7010, lng: 85.3068 },
        radius: 50,
        alertTitle: 'Restricted Access',
        alertMessage: 'This temple area may restrict non-Hindu visitors. Check with your guide.',
        severity: 'INFO',
        active: true,
      },
    }),
  ]);
  console.log('✅ Safety zones created');

  // Create default settings
  await Promise.all([
    prisma.setting.upsert({
      where: { key: 'commission_rate' },
      update: {},
      create: { key: 'commission_rate', value: 15, category: 'pricing', description: 'Platform commission percentage' },
    }),
    prisma.setting.upsert({
      where: { key: 'min_booking_advance' },
      update: {},
      create: { key: 'min_booking_advance', value: 24, category: 'booking', description: 'Minimum hours before experience' },
    }),
    prisma.setting.upsert({
      where: { key: 'support_email' },
      update: {},
      create: { key: 'support_email', value: 'support@locallink.app', category: 'support', description: 'Support email address' },
    }),
    prisma.setting.upsert({
      where: { key: 'enable_gps_tracking' },
      update: {},
      create: { key: 'enable_gps_tracking', value: true, category: 'features', description: 'Enable GPS tracking during experiences' },
    }),
  ]);
  console.log('✅ Settings created');

  // Create sample traveler
  const travelerPassword = await bcrypt.hash('traveler123', 12);
  await prisma.user.upsert({
    where: { email: 'sarah@email.com' },
    update: {},
    create: {
      email: 'sarah@email.com',
      passwordHash: travelerPassword,
      name: 'Sarah Miller',
      role: 'TRAVELER',
      status: 'ACTIVE',
      emailVerified: true,
      location: 'New York, USA',
      tripsCompleted: 5,
      countriesVisited: ['Nepal', 'Thailand', 'Japan'],
    },
  });
  console.log('✅ Sample traveler created');

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📧 Admin Login:');
  console.log('   Email: admin@locallink.app');
  console.log('   Password: LocalLink2024!');
  console.log('');
  console.log('📧 Guide Login:');
  console.log('   Email: pemba@locallink.app');
  console.log('   Password: guide123');
  console.log('');
  console.log('📧 Traveler Login:');
  console.log('   Email: sarah@email.com');
  console.log('   Password: traveler123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
