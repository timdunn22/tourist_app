# LocalLink - iOS & Android Build Guide

## 📱 Building for iOS (App Store)

### Prerequisites
- macOS computer with Xcode 15+
- Apple Developer Account ($99/year)
- Certificates and provisioning profiles configured

### Steps

#### 1. Set Up Signing
```bash
# Open Xcode
cd ios && open LocalLink.xcworkspace

# In Xcode:
# - Select LocalLink target
# - Go to Signing & Capabilities
# - Select your Team
# - Let Xcode manage signing automatically
```

#### 2. Configure App Store Connect
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with Bundle ID: `com.locallink.app`
3. Fill in app information, screenshots, description

#### 3. Build Archive
```bash
# Clean build
xcodebuild clean -workspace ios/LocalLink.xcworkspace -scheme LocalLink

# Build archive
xcodebuild -workspace ios/LocalLink.xcworkspace \
  -scheme LocalLink \
  -configuration Release \
  -archivePath build/LocalLink.xcarchive \
  archive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/LocalLink.xcarchive \
  -exportPath build/AppStore \
  -exportOptionsPlist ios/ExportOptions.plist
```

#### 4. Upload to App Store
- Open Xcode Organizer (Window > Organizer)
- Select archive and click "Distribute App"
- Choose "App Store Connect" and follow prompts

### TestFlight Beta Testing
1. In App Store Connect, go to TestFlight tab
2. Add internal/external testers
3. Upload new builds and enable for testing

---

## 🤖 Building for Android (Play Store)

### Prerequisites
- Android Studio with SDK 34+
- Google Play Developer Account ($25 one-time)
- Keystore for signing

### Steps

#### 1. Create Keystore (first time only)
```bash
cd android

keytool -genkey -v -keystore locallink-release.keystore \
  -alias locallink \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

#### 2. Configure Signing
Create/edit `android/gradle.properties`:
```properties
LOCALLINK_RELEASE_STORE_FILE=locallink-release.keystore
LOCALLINK_RELEASE_KEY_ALIAS=locallink
LOCALLINK_RELEASE_STORE_PASSWORD=your_password
LOCALLINK_RELEASE_KEY_PASSWORD=your_password
```

Edit `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file(LOCALLINK_RELEASE_STORE_FILE)
            storePassword LOCALLINK_RELEASE_STORE_PASSWORD
            keyAlias LOCALLINK_RELEASE_KEY_ALIAS
            keyPassword LOCALLINK_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

#### 3. Build Release APK
```bash
cd android

# Clean
./gradlew clean

# Build APK
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

#### 4. Build AAB (for Play Store)
```bash
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### 5. Upload to Play Store
1. Log in to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Go to Release > Production
4. Upload AAB file
5. Complete store listing with screenshots, description

### Internal Testing
1. In Play Console, go to Testing > Internal testing
2. Create new release and upload AAB
3. Add tester email addresses
4. Share opt-in link with testers

---

## 🔧 Environment Configuration

### Create `.env` file
```env
# API Configuration
API_URL=https://api.locallink.app
API_VERSION=v1

# Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Payments
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_MERCHANT_ID=merchant.com.locallink

# Push Notifications
FIREBASE_PROJECT_ID=locallink-app
ONESIGNAL_APP_ID=xxx

# Analytics
MIXPANEL_TOKEN=xxx
SENTRY_DSN=xxx
```

---

## 📊 App Store Optimization (ASO)

### iOS App Store
**Title:** LocalLink - Local Guides & Tours

**Subtitle:** Authentic travel experiences

**Keywords:** travel, local guide, tours, experiences, authentic, safety, tourism, adventure, food tours, cultural

**Description:**
```
Discover authentic travel experiences with verified local guides.

🌏 AUTHENTIC EXPERIENCES
Connect with locals who share real stories, hidden gems, and cultural insights you won't find in guidebooks.

🛡️ TRAVEL SAFELY  
• GPS tracking during every experience
• Verified guide IDs and background checks
• 24/7 emergency support
• Secure in-app payments

👥 MEET LOCAL GUIDES
• Browse verified local experts
• See trust scores and reviews
• Message guides directly
• Book instantly

🎯 POPULAR EXPERIENCES
• Cultural walking tours
• Street food adventures
• Hiking and nature
• Cooking classes
• Meditation retreats
• And much more!

💰 SUPPORT LOCAL COMMUNITIES
Your money goes directly to local people, creating sustainable tourism income.

Download LocalLink and travel like a local!
```

### Google Play Store
Similar content with additional Play Store specific fields.

---

## 🚀 CI/CD with GitHub Actions

Create `.github/workflows/build.yml`:
```yaml
name: Build Apps

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: cd ios && pod install
      - run: xcodebuild -workspace ios/LocalLink.xcworkspace -scheme LocalLink -configuration Release build

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - run: npm install
      - run: cd android && ./gradlew assembleRelease
```

---

## 📝 Checklist Before Submission

### iOS
- [ ] App icons (all sizes)
- [ ] Launch screen
- [ ] Screenshots (6.7", 6.5", 5.5" iPhones + iPad)
- [ ] App Preview video (optional)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire
- [ ] Export compliance
- [ ] Test on physical devices

### Android
- [ ] App icon (adaptive icon)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone + tablet)
- [ ] Promo video (optional)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target API level 34
- [ ] Test on multiple devices

---

## 🆘 Common Issues

### iOS Build Fails
```bash
# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reinstall pods
cd ios && rm -rf Pods && pod install
```

### Android Build Fails
```bash
# Clean gradle cache
cd android && ./gradlew clean

# Clear React Native cache
npx react-native start --reset-cache
```

### Metro Bundler Issues
```bash
# Clear all caches
watchman watch-del-all
rm -rf node_modules
rm -rf /tmp/metro-*
npm install
```

---

## 📞 Support

For build issues or questions:
- GitHub Issues: [repo-url]/issues
- Email: dev@locallink.app
- Discord: LocalLink Developers
