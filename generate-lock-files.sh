#!/bin/bash
# Script to generate package-lock.json files
# Run this on a machine with Node.js installed

set -e

echo "Generating package-lock.json files..."

echo "📦 Backend..."
cd backend
npm install
echo "✅ backend/package-lock.json created"

cd ../frontend
echo "📦 Frontend..."
npm install
echo "✅ frontend/package-lock.json created"

cd ..
echo ""
echo "✅ Done! Now commit and push:"
echo "   git add backend/package-lock.json frontend/package-lock.json"
echo "   git commit -m 'chore: add package-lock.json files for npm ci'"
echo "   git push"
