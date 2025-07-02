#!/bin/bash

# Setup script for Sportsmanship App
# This script sets up the development environment

echo "Setting up Sportsmanship App development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your configuration before continuing."
    exit 1
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down

# Build and start containers
echo "Building and starting containers..."
docker-compose up -d --build

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose exec backend alembic upgrade head

# Seed database with sample data
echo "Seeding database with sample data..."
docker-compose exec postgres psql -U user -d sportsmanship -f /docker-entrypoint-initdb.d/init.sql

# Show status
echo "Setup complete! Application status:"
docker-compose ps

echo ""
echo "Application URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo ""
echo "Sample login credentials:"
echo "- Email: coach@demo.com"
echo "- Password: password123"