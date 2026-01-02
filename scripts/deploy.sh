#!/bin/bash

# DevOps Monitoring Dashboard - Deployment Script

set -e

echo "========================================"
echo "🚀 DevOps Monitoring Dashboard"
echo "   AWS Deployment Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running in nix shell
if [ -z "$IN_NIX_SHELL" ]; then
    echo -e "${RED}❌ Not in Nix shell!${NC}"
    echo "Please run: nix develop"
    echo "Then run this script again."
    exit 1
fi

# Check required tools
echo -e "${BLUE}📋 Checking required tools...${NC}"
for cmd in node npm ansible terraform; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}❌ $cmd not found${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ $cmd${NC}"
    fi
done

# Check SSH key
if [ ! -f "ansible/devops-key-pair.pem" ]; then
    echo -e "${RED}❌ SSH key not found: ansible/devops-key-pair.pem${NC}"
    exit 1
fi
chmod 600 ansible/devops-key-pair.pem
echo -e "${GREEN}✓ SSH key${NC}"

echo ""
echo -e "${BLUE}📦 Installing Backend Dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${YELLOW}⚠ Backend node_modules exists, skipping install${NC}"
fi
cd ..

echo ""
echo -e "${BLUE}📦 Installing Frontend Dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${YELLOW}⚠ Frontend node_modules exists, skipping install${NC}"
fi
cd ..

echo ""
echo -e "${BLUE}🔍 Testing Ansible Connection...${NC}"
cd ansible
if ansible -i inventory.ini webservers -m ping --private-key devops-key-pair.pem -u ubuntu > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ansible connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to server${NC}"
    exit 1
fi
cd ..

echo ""
echo "========================================"
echo -e "${GREEN}✅ Pre-deployment checks passed!${NC}"
echo "========================================"
echo ""
echo "Ready to deploy to:"
echo "  Server IP: $(grep -v '^\[' ansible/inventory.ini | grep -v '^$')"
echo ""
read -p "Continue with deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "========================================"
echo -e "${BLUE}🚀 Starting Deployment...${NC}"
echo "========================================"
echo ""

cd ansible
ansible-playbook -i inventory.ini playbook.yml \
    --private-key devops-key-pair.pem \
    -u ubuntu \
    -v

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo "========================================"
    echo ""
    SERVER_IP=$(grep -v '^\[' inventory.ini | grep -v '^$')
    echo "Dashboard URL: http://$SERVER_IP"
    echo "Backend API: http://$SERVER_IP/api/health"
    echo ""
    echo "Test the deployment:"
    echo "  curl http://$SERVER_IP/api/health"
    echo ""
else
    echo ""
    echo "========================================"
    echo -e "${RED}❌ Deployment Failed!${NC}"
    echo "========================================"
    exit 1
fi
