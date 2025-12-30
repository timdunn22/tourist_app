# LocalLink - Tourism Super App

> A tourism super-app that turns local knowledge into income and makes travel safer, more human, and more trustworthy.

## The Big Idea

This is a tourism app that allows any local person to earn money by offering experiences, guidance, help, or stays — while allowing any traveler to safely discover, book, navigate, and experience a destination through verified locals, trusted AI-powered reviews, in-app payments, maps, and safety tools.

At the same time, the platform upskills and professionalizes local guides, creating a trusted ecosystem that improves tourism quality, safety, and income — starting in Nepal and scalable globally.

## The Core Problem

**Travelers face:**
- Unsafe or uncomfortable interactions
- Fake or unreliable reviews
- Fragmented apps (maps, booking, guides, chats, payments)
- No easy access to real local knowledge
- High risk for solo & female travelers

**Locals & guides face:**
- No structured way to earn from local knowledge
- Tourism income limited to a few licensed operators
- No trust system to prove quality

## The Solution

- Discover places, people, and experiences on a map
- Book locals as guides or helpers
- Pay securely in-app
- Navigate with live routes
- Stay safe with real-time tools
- Trust reviews validated by AI
- Help locals grow from informal to professional guides

## 🏗️ Project Structure

```
tourist_app/
├── mobile/                    # React Native mobile app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # App screens (auth, traveler, guide, shared)
│   │   ├── navigation/        # Navigation configuration
│   │   ├── store/             # Zustand state management
│   │   ├── services/          # API services
│   │   └── theme/             # Design system & theming
│   ├── ios/
│   ├── android/
│   └── package.json
│
├── admin/                     # Admin dashboard (React + Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/        # Dashboard components
│   │   ├── pages/             # Admin pages
│   │   ├── services/          # API services
│   │   └── store/             # State management
│   └── package.json
│
├── backend/                   # Node.js API server
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helpers & utilities
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeding
│   └── package.json
│
├── docker-compose.yml         # Docker setup
├── .env.example               # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or use Docker)
- Redis (for sessions/caching)

### 1. Start Database (Docker)
```bash
docker-compose up -d postgres redis
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
# API running at http://localhost:3000
```

### 3. Setup Admin Panel
```bash
cd admin
npm install
npm run dev
# Open http://localhost:3001
```

### 4. Setup Mobile App
```bash
cd mobile
npm install
npx pod-install ios
npm run ios  # or npm run android
```

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@locallink.app | LocalLink2024! |
| Guide | pemba@locallink.app | guide123 |
| Traveler | sarah@email.com | traveler123 |

## 📱 Features

### For Travelers
- **Experiences**: Walking tours, food tours, cooking classes, hikes, workshops
- **Micro-Services**: SIM setup, airport help, translation, bargaining, emergency support
- **Stays**: Hotels, homestays, hostels with female-friendly options
- **Safety Tools**: Panic button, GPS tracking, unsafe area alerts, check-ins
- **Trust System**: AI-validated reviews, verified guides, GPS-verified experiences

### For Local Guides
- **Earn Income**: List experiences, offer micro-services, host stays
- **Training System**: Complete modules to level up and earn badges
- **Guide Levels**:
  - Level 0: Community Local (verified ID, basic rules)
  - Level 1: Platform Trained (completed training, better visibility)
  - Level 2: Professional Guide (licensed/certified, first aid trained)
  - Level 3: Master Guide (high trust score, mentor role)
- **Badges**: Platform Trained, Female-Safe, First Aid Ready, Heritage Expert

### For Admins
- **Dashboard**: Analytics, revenue, bookings, activity
- **User Management**: Travelers, guides, verification
- **Content**: Experiences, stays, services, categories
- **Training**: Create and manage training modules
- **Safety**: Monitor alerts, manage safety zones
- **Settings**: Commission rates, features, support

## 🛡️ Safety & Trust System

- **Verified Identities**: ID verification for all guides
- **Live GPS Tracking**: During all active bookings
- **Panic Button**: Instant alert to support + trusted contacts
- **Unsafe Area Alerts**: Geofenced warnings for risky zones
- **Incident Reporting**: Report issues directly in-app
- **Check-In System**: Regular safety check-ins for solo travelers

## 🤖 AI-Powered Review Validation

Reviews are validated based on:
- Booking verification
- GPS & time validation
- Text pattern analysis
- Reviewer behavior history
- Repetition detection

Each review shows:
- Confidence score
- Trust badges (Verified Experience, GPS-Validated, High-Trust Reviewer)
- Fake reviews are quietly down-weighted, not deleted

## 💰 Monetization

| Revenue Stream | Commission |
|---------------|------------|
| Experiences | 10-15% |
| Stays | 8-12% |
| Micro-Services | 10-20% |
| Featured Listings | Premium |
| Traveler Subscriptions | Monthly |
| Safety Add-ons | Per use |

## 📊 Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, TypeScript, Zustand |
| Admin | React, Vite, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Auth | JWT, bcrypt |
| Files | AWS S3 / Cloudinary |
| Maps | Google Maps API |
| Payments | Stripe |
| Push | Firebase Cloud Messaging |
| Real-time | Socket.io |

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Experiences
- `GET /api/experiences` - List experiences
- `GET /api/experiences/:id` - Get experience
- `POST /api/experiences` - Create experience (guide)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user bookings
- `PUT /api/bookings/:id/status` - Update status

### Safety
- `POST /api/safety/panic` - Trigger panic alert
- `GET /api/safety/zones` - Get safety zones
- `POST /api/safety/checkin` - Check-in

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/guides` - List guides
- Full CRUD for all entities

## 🚀 MVP Launch Model

- **One city** (Kathmandu)
- **50-100 locals** registered
- **10 hotels**, **10 food spots**
- **30-50 experiences** available
- **Core**: booking, maps, payments, safety

## 📈 Why This Can Be Big

- Tourism is massive & fragmented
- No major player owns local trust + safety + guide development
- Scales globally with the same model
- Strong sustainability & impact narrative
- Clear path from MVP → regional → global

## 📄 License

Proprietary - LocalLink Inc.
# tourist_app
