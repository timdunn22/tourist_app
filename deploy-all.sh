#!/bin/bash

# LocalLink Complete Deployment Script
# This script deploys all components of LocalLink

set -e

echo "============================================="
echo "     LocalLink Complete Deployment"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Node.js $(node -v)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} npm $(npm -v)"

    echo ""
}

# Deploy Backend to Railway
deploy_backend() {
    echo -e "${YELLOW}Deploying Backend to Railway...${NC}"

    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi

    cd backend

    # Check if logged in
    if ! railway whoami &> /dev/null; then
        echo -e "${YELLOW}Please login to Railway:${NC}"
        railway login
    fi

    # Deploy
    railway up

    echo -e "${GREEN}✓ Backend deployed to Railway${NC}"
    cd ..
}

# Deploy Web Apps to Vercel
deploy_webapp() {
    echo -e "${YELLOW}Deploying Web App to Vercel...${NC}"

    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi

    cd webapp

    # Build first
    npm run build

    # Deploy
    vercel --prod --yes

    echo -e "${GREEN}✓ Web App deployed to Vercel${NC}"
    cd ..
}

deploy_admin() {
    echo -e "${YELLOW}Deploying Admin Panel to Vercel...${NC}"

    cd admin

    # Build first
    npm run build

    # Deploy
    vercel --prod --yes

    echo -e "${GREEN}✓ Admin Panel deployed to Vercel${NC}"
    cd ..
}

# Build Android APK
build_android() {
    echo -e "${YELLOW}Building Android APK...${NC}"

    cd mobile

    # Check if Android SDK is set up
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${RED}ANDROID_HOME is not set. Please install Android Studio and set up the SDK.${NC}"
        echo "See: https://reactnative.dev/docs/environment-setup"
        return 1
    fi

    # Install dependencies
    npm install --legacy-peer-deps

    # Build release APK
    cd android
    ./gradlew assembleRelease

    echo -e "${GREEN}✓ Android APK built${NC}"
    echo "APK location: mobile/android/app/build/outputs/apk/release/app-release.apk"
    cd ../..
}

# Main menu
show_menu() {
    echo "What would you like to deploy?"
    echo ""
    echo "1) Everything (Backend + Web Apps)"
    echo "2) Backend only (Railway)"
    echo "3) Web App only (Vercel)"
    echo "4) Admin Panel only (Vercel)"
    echo "5) Build Android APK"
    echo "6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice

    case $choice in
        1)
            check_prerequisites
            deploy_backend
            deploy_webapp
            deploy_admin
            ;;
        2)
            check_prerequisites
            deploy_backend
            ;;
        3)
            check_prerequisites
            deploy_webapp
            ;;
        4)
            check_prerequisites
            deploy_admin
            ;;
        5)
            check_prerequisites
            build_android
            ;;
        6)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            show_menu
            ;;
    esac
}

# Run
show_menu

echo ""
echo "============================================="
echo "           Deployment Complete!"
echo "============================================="
echo ""
echo "Next steps:"
echo "1. Set up environment variables in Railway dashboard"
echo "2. Configure custom domains in Vercel"
echo "3. Upload APK to Google Play Console"
echo ""
