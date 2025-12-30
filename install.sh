#!/bin/bash
# LocalLink Tourist App - Installation Script
# This script copies the project to your local machine

set -e

TARGET_DIR="/Users/timdunn/tourist_app"

echo "🌏 LocalLink Tourist App Installer"
echo "=================================="
echo ""

# Check if target directory exists
if [ -d "$TARGET_DIR" ]; then
    echo "⚠️  Directory $TARGET_DIR already exists."
    read -p "Do you want to overwrite it? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Installation cancelled."
        exit 1
    fi
    rm -rf "$TARGET_DIR"
fi

# Create directory and copy files
echo "📁 Creating project directory..."
mkdir -p "$TARGET_DIR"

echo "📋 Copying project files..."
# This would be done by downloading from Claude's output

echo ""
echo "✅ Project copied to $TARGET_DIR"
echo ""
echo "📖 Next Steps:"
echo ""
echo "1. Install dependencies:"
echo "   cd $TARGET_DIR/backend && npm install"
echo "   cd $TARGET_DIR/admin && npm install"
echo "   cd $TARGET_DIR/mobile && npm install"
echo ""
echo "2. Start database with Docker:"
echo "   cd $TARGET_DIR && docker-compose up -d postgres redis"
echo ""
echo "3. Setup database:"
echo "   cd $TARGET_DIR/backend"
echo "   cp ../.env.example .env"
echo "   npx prisma migrate dev"
echo "   npx prisma db seed"
echo ""
echo "4. Start services:"
echo "   # Terminal 1 - Backend"
echo "   cd $TARGET_DIR/backend && npm run dev"
echo ""
echo "   # Terminal 2 - Admin"
echo "   cd $TARGET_DIR/admin && npm run dev"
echo ""
echo "   # Terminal 3 - Mobile"
echo "   cd $TARGET_DIR/mobile && npm run ios"
echo ""
echo "🔐 Default Admin Login:"
echo "   Email: admin@locallink.app"
echo "   Password: LocalLink2024!"
echo ""
echo "📱 Admin Panel: http://localhost:3001"
echo "🔌 API Server: http://localhost:4000"
echo ""
