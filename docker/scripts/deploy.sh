#!/bin/bash

# Deployment script for Sportsmanship App
# This script deploys the application to production

set -e

echo "Starting deployment of Sportsmanship App..."

# Check if production environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$SECRET_KEY" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: Required environment variables are not set."
    echo "Please set DATABASE_URL, SECRET_KEY, and OPENAI_API_KEY"
    exit 1
fi

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Stop existing services
echo "Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# Build new images
echo "Building new images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Health check
echo "Performing health check..."
if curl -f http://localhost/health; then
    echo "Deployment successful!"
else
    echo "Health check failed. Rolling back..."
    docker-compose -f docker-compose.prod.yml down
    exit 1
fi

# Show status
echo "Deployment complete! Service status:"
docker-compose -f docker-compose.prod.yml ps