#!/bin/bash

# Database backup script for Sportsmanship App
# Usage: ./backup.sh [backup_name]

BACKUP_NAME=${1:-$(date +%Y%m%d_%H%M%S)}
BACKUP_DIR="./backups"
DB_NAME="sportsmanship"
DB_USER="user"
DB_HOST="localhost"
DB_PORT="5432"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup: ${BACKUP_NAME}.sql"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > "${BACKUP_DIR}/${BACKUP_NAME}.sql"

if [ $? -eq 0 ]; then
    echo "Backup created successfully: ${BACKUP_DIR}/${BACKUP_NAME}.sql"
    
    # Compress backup
    gzip "${BACKUP_DIR}/${BACKUP_NAME}.sql"
    echo "Backup compressed: ${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
    
    # Remove backups older than 30 days
    find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi