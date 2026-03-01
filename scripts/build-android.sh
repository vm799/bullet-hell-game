#!/bin/bash
# Build Android app and submit to Play Store
set -e

echo "Building Android app..."
cd "$(dirname "$0")/../mobile"

# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Build with EAS
eas build --platform android --auto-submit

echo "Android build submitted!"
