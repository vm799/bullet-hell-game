#!/bin/bash
# Deploy backend API
set -e

echo "Deploying API..."
cd "$(dirname "$0")/.."

# Option 1: Firebase Functions
if [ "$DEPLOY_TARGET" = "firebase" ]; then
  echo "Deploying to Firebase Functions..."
  cd api && npm run build && cd ..
  firebase deploy --only functions
  echo "Deployed to Firebase Functions!"
  exit 0
fi

# Option 2: Docker (Railway, Fly.io, AWS, etc.)
echo "Building Docker image..."
cd api
docker build -t bullet-hell-api .
echo "Docker image built: bullet-hell-api"
echo ""
echo "To push to a registry:"
echo "  docker tag bullet-hell-api your-registry/bullet-hell-api:latest"
echo "  docker push your-registry/bullet-hell-api:latest"
