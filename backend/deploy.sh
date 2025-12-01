#!/bin/bash

# Deployment script for backend to AWS EC2
# Run this script on your EC2 instance after initial setup

set -e  # Exit on error

echo "🚀 Starting backend deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/citron-documents/backend"
APP_NAME="citron-backend"

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
git pull origin main

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production=false

# Build application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Restart PM2 process
echo -e "${YELLOW}🔄 Restarting application...${NC}"
pm2 restart $APP_NAME

# Show status
echo -e "${GREEN}✅ Deployment complete!${NC}"
pm2 status

# Show logs
echo -e "${YELLOW}📋 Recent logs:${NC}"
pm2 logs $APP_NAME --lines 20 --nostream

echo -e "${GREEN}🎉 Backend deployed successfully!${NC}"
