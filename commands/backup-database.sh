#!/bin/bash

OUTPUT_FILE="./tmp/db_dump.sql"
DB_HOST="db.office.ullasindia.com"
DB_PORT="5432"
DB_NAME="scc"
DB_USER="postgres"

# Create a PostgreSQL database dump
# pg_dump --data-only -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ~/Desktop/db_dump.sql

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -f|--file) OUTPUT_FILE="$2"; shift ;;
        -d|--dbname) DB_NAME="$2"; shift ;;
        -u|--user) DB_USER="$2"; shift ;;
        -h|--host) DB_HOST="$2"; shift ;;
        -p|--port) DB_PORT="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Validate
if [[ -z "$OUTPUT_FILE" ]]; then
    echo "Error: You must specify a file with -f"
    exit 1
fi

pg_dump \
  --no-owner \
  --no-privileges \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  -f $OUTPUT_FILE

echo "Database backup completed successfully to $OUTPUT_FILE"


# unset PGPASSWORD
