#!/bin/bash

# Cleanup script for Sportsmanship App
# This script removes all containers, images, and volumes

echo "WARNING: This will remove all Docker containers, images, and volumes for Sportsmanship App"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled"
    exit 1
fi

echo "Stopping and removing containers..."
docker-compose down -v

echo "Removing Docker images..."
docker images | grep sportsmanship | awk '{print $3}' | xargs -r docker rmi -f

echo "Removing unused volumes..."
docker volume prune -f

echo "Removing unused networks..."
docker network prune -f

echo "Cleanup complete!"