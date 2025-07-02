#!/bin/bash

# Database restore script for Sportsmanship App
# Usage: ./restore.sh backup_file.sql[.gz]

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 20240115_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="sportsmanship"
DB_USER="user"
DB_HOST="localhost"
DB_PORT="5432"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if file is compressed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" > temp_restore.sql
    RESTORE_FILE="temp_restore.sql"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Confirm restore
echo "WARNING: This will replace all data in database '$DB_NAME'"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    [ -f "temp_restore.sql" ] && rm temp_restore.sql
    exit 1
fi

# Drop and recreate database
echo "Dropping existing database..."
dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME

# Restore database
echo "Restoring database from backup..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$RESTORE_FILE"

if [ $? -eq 0 ]; then
    echo "Database restored successfully!"
else
    echo "Restore failed!"
    exit 1
fi

# Clean up temporary file
[ -f "temp_restore.sql" ] && rm temp_restore.sql