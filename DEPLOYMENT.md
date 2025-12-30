# LocalLink Deployment Guide

## Table of Contents
1. [Google Play Store Deployment](#google-play-store-deployment)
2. [Apple App Store Deployment](#apple-app-store-deployment)
3. [Backend Hosting Options](#backend-hosting-options)

---

## Google Play Store Deployment

### Prerequisites
- Google Play Developer Account ($25 one-time fee)
- Android Studio installed
- JDK 11 or higher

### Step 1: Generate a Signing Key

```bash
cd /Users/timdunn/tourist_app/mobile/android/app

# Generate a keystore (keep this file safe!)
keytool -genkeypair -v -storetype PKCS12 -keystore locallink-release.keystore -alias locallink -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for:
- Keystore password (save this!)
- Your name, organization, city, etc.

### Step 2: Configure Gradle for Signing

Create `android/gradle.properties` or add to existing:

```properties
MYAPP_RELEASE_STORE_FILE=locallink-release.keystore
MYAPP_RELEASE_KEY_ALIAS=locallink
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Build the Release APK/AAB

```bash
cd /Users/timdunn/tourist_app/mobile

# Clean and build
cd android && ./gradlew clean

# Build AAB (recommended for Play Store)
./gradlew bundleRelease

# Or build APK
./gradlew assembleRelease
```

Output locations:
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

### Step 4: Upload to Google Play Console

1. Go to https://play.google.com/console
2. Create new app
3. Fill in app details:
   - App name: LocalLink
   - Default language: English
   - App type: App
   - Category: Travel & Local
4. Complete the store listing:
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (phone, tablet)
   - Feature graphic (1024x500)
   - App icon (512x512)
5. Upload AAB in Release > Production
6. Complete content rating questionnaire
7. Set up pricing & distribution
8. Submit for review

### App Store Listing Recommendations

**Short Description:**
"Connect with local guides for authentic travel experiences in Nepal"

**Full Description:**
```
LocalLink connects travelers with verified local guides for authentic, personalized experiences. Discover hidden temples, secret food spots, and local culture through the eyes of someone who calls it home.

Features:
• Verified Local Guides - Trust scores and GPS-validated reviews
• Unique Experiences - Tours, food adventures, cultural workshops
• Secure Booking - Easy payment with traveler protection
• Real-time Chat - Message your guide directly
• Micro-Services - SIM setup, airport pickup, translation help
• Local Stays - Authentic homestays and accommodations

Whether you're seeking adventure, culture, or local cuisine, LocalLink ensures your journey is genuine, safe, and unforgettable.
```

---

## Apple App Store Deployment

### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode installed
- Valid iOS Distribution Certificate

### Step 1: Configure Xcode Project

```bash
cd /Users/timdunn/tourist_app/mobile/ios
pod install
open LocalLink.xcworkspace
```

In Xcode:
1. Select your team in Signing & Capabilities
2. Set Bundle Identifier: `com.locallink.app`
3. Set version and build number

### Step 2: Create Archive

1. Select "Any iOS Device" as build target
2. Product > Archive
3. Once archived, click "Distribute App"
4. Select "App Store Connect"
5. Upload

### Step 3: App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Create new app with matching Bundle ID
3. Fill in metadata and upload screenshots
4. Submit for review

---

## Backend Hosting Options

### Option 1: Railway (Recommended for Startups)

**Pros:** Easy deployment, auto-scaling, PostgreSQL included
**Cost:** ~$5-20/month for small apps

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and init
railway login
cd /Users/timdunn/tourist_app/backend
railway init

# Deploy
railway up

# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis
```

### Option 2: Render

**Pros:** Free tier available, easy setup
**Cost:** Free tier or $7+/month for production

1. Connect GitHub repo at https://render.com
2. Create Web Service for backend
3. Create PostgreSQL database
4. Create Redis instance
5. Set environment variables

### Option 3: DigitalOcean App Platform

**Pros:** Predictable pricing, good performance
**Cost:** $5-25/month

```bash
# Install doctl
brew install doctl

# Create app
doctl apps create --spec .do/app.yaml
```

Create `.do/app.yaml`:
```yaml
name: locallink
services:
  - name: api
    github:
      repo: your-username/tourist_app
      branch: main
      deploy_on_push: true
    source_dir: backend
    run_command: node src/index.js
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: ${db.DATABASE_URL}
databases:
  - name: db
    engine: PG
    version: "15"
```

### Option 4: AWS (Production Scale)

**Pros:** Full control, scales to millions
**Cost:** $20-100+/month depending on usage

Components needed:
- EC2 or ECS for backend
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for file storage
- CloudFront for CDN

### Option 5: Docker + VPS (Most Control)

**Pros:** Full control, cost-effective
**Cost:** $5-40/month for VPS

```bash
# On your VPS
git clone <your-repo>
cd tourist_app

# Create .env file with production values
cp .env.example .env
nano .env

# Start with Docker
docker-compose up -d
```

### Environment Variables for Production

Ensure these are set in your hosting environment:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/locallink
REDIS_URL=redis://host:6379
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=locallink-uploads
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
```

### Recommended Architecture for Production

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   (CDN + DNS)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐
        │  Web App  │  │   Admin   │  │    API    │
        │  (Vercel) │  │  (Vercel) │  │ (Railway) │
        └───────────┘  └───────────┘  └─────┬─────┘
                                            │
                            ┌───────────────┼───────────────┐
                            │               │               │
                      ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
                      │ PostgreSQL│   │   Redis   │   │    S3     │
                      │ (Railway) │   │ (Railway) │   │   (AWS)   │
                      └───────────┘   └───────────┘   └───────────┘
```

### Quick Deploy Script

```bash
#!/bin/bash
# deploy-production.sh

echo "Building frontend apps..."
cd webapp && npm run build
cd ../admin && npm run build

echo "Deploying to Vercel..."
npx vercel --prod ./webapp
npx vercel --prod ./admin

echo "Deploying backend to Railway..."
cd ../backend
railway up

echo "Done!"
```

---

## SSL Certificates

For custom domains, use Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d locallink.app -d api.locallink.app -d admin.locallink.app

# Certificates saved to /etc/letsencrypt/live/locallink.app/
```

---

## Monitoring & Logging

Recommended services:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Infrastructure monitoring
- **UptimeRobot** - Uptime monitoring (free tier available)

---

## Next Steps

1. Set up Google Play Developer Account
2. Choose a hosting provider (Railway recommended for starting)
3. Set up production database
4. Configure environment variables
5. Deploy backend
6. Deploy web apps
7. Build and submit mobile app
8. Set up monitoring

Need help with any specific step? Let me know!
