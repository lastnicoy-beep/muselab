#!/bin/sh
set -e

echo "Waiting for database..."
sleep 5

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema ./prisma/schema.prisma || echo "Migration skipped or already applied"

echo "Starting MuseLab backend server..."
exec node src/index.js

