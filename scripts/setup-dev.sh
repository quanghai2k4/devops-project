#!/bin/bash

# DevOps Monitoring Dashboard - Development Setup Script

set -e

echo "========================================"
echo "🚀 DevOps Monitoring Dashboard Setup"
echo "========================================"

# Check if nix is available
if ! command -v nix &> /dev/null; then
    echo "❌ Nix is not installed. Please install Nix first:"
    echo "   sh <(curl -L https://nixos.org/nix/install) --daemon"
    exit 1
fi

# Check if we're in nix develop shell
if [ -z "$IN_NIX_SHELL" ]; then
    echo "⚠️  Not in Nix shell. Running 'nix develop'..."
    nix develop
    exit 0
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   ✓ Backend dependencies already installed"
fi

# Setup backend .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "   ✓ Created backend/.env"
else
    echo "   ✓ backend/.env already exists"
fi

cd ..

echo ""
echo "📦 Installing Frontend Dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   ✓ Frontend dependencies already installed"
fi

# Setup frontend .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "   ✓ Created frontend/.env"
else
    echo "   ✓ frontend/.env already exists"
fi

cd ..

echo ""
echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "To start development:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo "========================================"
