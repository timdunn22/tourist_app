# LocalLink - React Native Mobile App

A tourism super-app connecting travelers with verified local guides.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- For iOS: macOS with Xcode 15+
- For Android: Android Studio with SDK 34+

### Installation

```bash
# Clone and install dependencies
cd LocalLinkNative
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android
```

## 📁 Project Structure

```
LocalLinkNative/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # App screens
│   │   ├── auth/         # Login, Signup, Onboarding
│   │   ├── traveler/     # Traveler-specific screens
│   │   ├── guide/        # Local guide screens
│   │   └── shared/       # Shared screens (Chat, Profile)
│   ├── navigation/       # React Navigation setup
│   ├── store/            # State management (Zustand)
│   ├── services/         # API calls, auth, etc.
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── theme/            # Colors, fonts, spacing
│   └── assets/           # Images, icons, fonts
├── ios/                  # iOS native code
├── android/              # Android native code
└── app.json              # App configuration
```

## 🎨 Design System

### Colors
- Primary: #E07A5F (Terracotta)
- Secondary: #3D405B (Dark Blue)
- Accent: #81B29A (Sage Green)
- Warm: #F2CC8F (Golden)
- Background: #FFFCF7 (Cream)

### Typography
- Display: Fraunces (headings)
- Body: DM Sans (text)

## 📱 Features

### For Travelers
- ✅ Onboarding flow
- ✅ Experience discovery
- ✅ Map-based exploration
- ✅ Guide profiles with trust scores
- ✅ Booking system
- ✅ Live GPS tracking
- ✅ In-app messaging
- ✅ Emergency support
- ✅ Stays & micro-services

### For Local Guides
- ✅ Earnings dashboard
- ✅ Experience management
- ✅ Training & certification
- ✅ Booking calendar
- ✅ Level progression

## 🔧 Key Dependencies

```json
{
  "react-native": "0.73.x",
  "react-navigation": "^6.x",
  "react-native-maps": "^1.x",
  "react-native-reanimated": "^3.x",
  "zustand": "^4.x",
  "react-native-mmkv": "^2.x"
}
```

## 📲 Building for Production

### iOS App Store
```bash
# Build release
cd ios
xcodebuild -workspace LocalLink.xcworkspace -scheme LocalLink -configuration Release archive
```

### Android Play Store
```bash
# Build release APK
cd android
./gradlew assembleRelease

# Build AAB for Play Store
./gradlew bundleRelease
```

## 🔐 Environment Variables

Create `.env` file:
```
API_URL=https://api.locallink.app
MAPS_API_KEY=your_google_maps_key
STRIPE_KEY=your_stripe_key
```

## 📞 Support

For development questions, contact the LocalLink team.
