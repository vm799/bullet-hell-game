#!/bin/bash
# Build iOS app and submit to App Store
set -e

echo "Building iOS app..."
cd "$(dirname "$0")/../mobile"

# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Build with EAS
eas build --platform ios --auto-submit

echo "iOS build submitted!"
