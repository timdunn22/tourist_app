# LocalLink Setup Guide

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Xcode 15+** (for iOS) - Mac App Store
- **Android Studio** (for Android) - [Download](https://developer.android.com/studio)

## 🚀 Quick Start

### Step 1: Copy Project to Your Machine

Download all files from Claude and place them in:
```
/Users/timdunn/tourist_app/
```

### Step 2: Start Database

```bash
cd /Users/timdunn/tourist_app
docker-compose up -d postgres redis
```

Wait for containers to be healthy:
```bash
docker-compose ps
```

### Step 3: Setup Backend

```bash
cd /Users/timdunn/tourist_app/backend

# Install dependencies
npm install

# Copy environment file
cp ../.env.example .env

# Run database migrations
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed

# Start the server
npm run dev
```

The API will be available at `http://localhost:4000`

### Step 4: Setup Admin Panel

```bash
cd /Users/timdunn/tourist_app/admin

# Install dependencies
npm install

# Start development server
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### Step 5: Setup Mobile App

```bash
cd /Users/timdunn/tourist_app/mobile

# Install dependencies
npm install

# Install iOS pods (Mac only)
cd ios && pod install && cd ..

# Start iOS app
npm run ios

# OR start Android app
npm run android
```

## 🔐 Login Credentials

### Admin Panel
- **URL:** http://localhost:3001
- **Email:** admin@locallink.app
- **Password:** LocalLink2024!

### Guide Account
- **Email:** pemba@locallink.app
- **Password:** guide123

### Traveler Account
- **Email:** sarah@email.com
- **Password:** traveler123

## 📁 Project Structure

```
/Users/timdunn/tourist_app/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/        # Database schema & migrations
│   └── package.json
│
├── admin/             # React admin dashboard
│   ├── src/
│   └── package.json
│
├── mobile/            # React Native mobile app
│   ├── src/
│   ├── ios/
│   ├── android/
│   └── package.json
│
├── web/               # React web app
│   └── src/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Configuration

### Environment Variables

Edit `/Users/timdunn/tourist_app/backend/.env`:

```env
# Required
DATABASE_URL=postgresql://locallink:locallink_secret@localhost:5432/locallink
JWT_SECRET=your-secret-key-change-this

# Optional - for full functionality
STRIPE_SECRET_KEY=sk_test_xxx
GOOGLE_MAPS_API_KEY=your-google-maps-key
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Database Management

```bash
# View database in browser
cd backend && npx prisma studio

# Create new migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset
```

## 🛠️ Common Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npx prisma studio    # Open database GUI
```

### Admin
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Mobile
```bash
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm start            # Start Metro bundler only
```

### Docker
```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f backend # View backend logs
docker-compose ps              # Check service status
```

## 📱 Building for Production

### iOS App Store

1. Open Xcode:
   ```bash
   cd mobile/ios && open LocalLink.xcworkspace
   ```

2. Select your Team in Signing & Capabilities

3. Build archive:
   ```bash
   xcodebuild -workspace LocalLink.xcworkspace -scheme LocalLink archive
   ```

4. Upload to App Store Connect

### Google Play Store

1. Create signing key:
   ```bash
   cd mobile/android
   keytool -genkey -v -keystore locallink.keystore -alias locallink -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Build release:
   ```bash
   ./gradlew bundleRelease
   ```

3. Upload AAB to Play Console

## 🆘 Troubleshooting

### Database connection failed
```bash
# Make sure Docker is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres
```

### Pod install fails (iOS)
```bash
cd mobile/ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

### Metro bundler issues
```bash
cd mobile
npm start -- --reset-cache
```

### Admin won't start
```bash
cd admin
rm -rf node_modules
npm install
npm run dev
```

## 📞 Support

For issues or questions:
- Check the README.md in each directory
- Review the API documentation at http://localhost:4000/api/docs
- Open an issue on the project repository

---

Happy coding! 🚀
