#!/bin/bash

echo "Creating Android signing keystore for BRC Navigator"
echo "You'll need to enter:"
echo "1. A keystore password (remember this!)"
echo "2. Your name and organization details"
echo "3. A key password (can be same as keystore password)"
echo ""

cd android
keytool -genkeypair -v \
  -keystore brc-navigator.keystore \
  -alias brc-navigator \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

echo ""
echo "✅ Keystore created! Keep it safe and remember your passwords."
echo "📁 Location: android/brc-navigator.keystore"
echo ""
echo "⚠️  IMPORTANT: Back up this keystore file! You cannot update your app without it."