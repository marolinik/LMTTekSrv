#!/bin/bash

# LM TEK Configurator - Docker Setup Script
echo "=================================="
echo "LM TEK Configurator - Docker Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file for frontend if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file for frontend..."
    cat > .env << EOL
VITE_API_URL=http://localhost:3001/api
EOL
    echo "✅ Frontend .env file created"
else
    echo "ℹ️  Frontend .env file already exists"
fi

# Create .env file for backend if it doesn't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating .env file for backend..."
    cat > server/.env << EOL
DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/lmtek_configurator?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long-for-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="production"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost"
ADMIN_EMAIL="admin@lmtek.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="System Administrator"
EOL
    echo "✅ Backend .env file created"
else
    echo "ℹ️  Backend .env file already exists"
fi

echo ""
echo "🐳 Building and starting Docker containers..."
echo ""

# Stop any existing containers
docker-compose down

# Build and start containers
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "=================================="
    echo "✅ Setup Complete!"
    echo "=================================="
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:3001"
    echo "   Database:  localhost:5432"
    echo ""
    echo "👤 Default Admin Credentials:"
    echo "   Email:     admin@lmtek.com"
    echo "   Password:  admin123"
    echo ""
    echo "📊 Useful Commands:"
    echo "   View logs:        docker-compose logs -f"
    echo "   Stop services:    docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   View status:      docker-compose ps"
    echo ""
else
    echo ""
    echo "❌ Something went wrong. Check logs with:"
    echo "   docker-compose logs"
fi
