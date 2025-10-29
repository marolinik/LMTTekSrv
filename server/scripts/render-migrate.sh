#!/bin/bash
# Database migration script for Render.com deployment
# This script runs database migrations and seeds data for production

set -e  # Exit on error

echo "========================================="
echo " LM TEK Configurator - Database Migration"
echo "========================================="
echo ""

echo "[1/3] Running Prisma migrations..."
npx prisma migrate deploy

echo ""
echo "[2/3] Generating Prisma Client..."
npx prisma generate

echo ""
echo "[3/3] Seeding database with initial data..."
if [ -f "prisma/seed.prod.js" ]; then
  node prisma/seed.prod.js || echo "Warning: Seed script failed or data already exists"
else
  echo "No seed file found, skipping..."
fi

echo ""
echo "========================================="
echo " Migration Complete!"
echo "========================================="
echo ""
echo "Database is ready for production use."
