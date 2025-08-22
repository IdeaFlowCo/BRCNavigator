#!/bin/bash

echo "🔨 Building Android Release AAB for BRC Navigator"
echo ""

# Build the web app first
echo "📦 Building web assets..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Build the AAB
echo "🏗️ Building Android App Bundle..."
cd android
./gradlew clean
./gradlew bundleRelease

echo ""
echo "✅ Build complete!"
echo "📁 AAB location: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📤 Next steps:"
echo "1. Upload the AAB to Google Play Console"
echo "2. Create your app listing (screenshots, description, etc.)"
echo "3. Submit for review"