# LM TEK Server Configurator - Docker Setup Guide

This guide will help you run the LM TEK Server Configurator using Docker.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
  - Download from: https://www.docker.com/products/docker-desktop
  - Minimum version: Docker 20.10+
- **Docker Compose** (usually included with Docker Desktop)
  - Minimum version: 2.0+

## Quick Start

### Windows

1. Open Command Prompt or PowerShell as Administrator
2. Navigate to the project directory:
   ```cmd
   cd D:\Projects\grando-lmtek-fusion-main
   ```
3. Run the setup script:
   ```cmd
   docker-setup.bat
   ```

### Linux/Mac

1. Open Terminal
2. Navigate to the project directory:
   ```bash
   cd /path/to/grando-lmtek-fusion-main
   ```
3. Make the setup script executable:
   ```bash
   chmod +x docker-setup.sh
   ```
4. Run the setup script:
   ```bash
   ./docker-setup.sh
   ```

## Manual Setup

If you prefer to set up manually:

1. **Create environment files:**

   Create `.env` in the root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

   Create `server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/lmtek_configurator?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long-for-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="production"
   ALLOWED_ORIGINS="http://localhost:3000,http://localhost"
   ADMIN_EMAIL="admin@lmtek.com"
   ADMIN_PASSWORD="admin123"
   ADMIN_NAME="System Administrator"
   ```

2. **Build and start containers:**
   ```bash
   docker-compose up -d --build
   ```

3. **Wait for services to start** (about 30 seconds)

## Accessing the Application

Once the containers are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **PostgreSQL Database:** localhost:5432

## Default Credentials

**Admin Account:**
- Email: `admin@lmtek.com`
- Password: `admin123`

⚠️ **Important:** Change these credentials in production!

## Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Containers
```bash
docker-compose up -d --build
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

## Architecture

The Docker setup includes:

1. **PostgreSQL Database** (postgres:14-alpine)
   - Port: 5432
   - Database: lmtek_configurator
   - Volume: postgres_data (persistent storage)

2. **Backend API** (Node.js 18)
   - Port: 3001
   - Express + TypeScript + Prisma
   - Auto-runs migrations and seeds on startup

3. **Frontend** (Nginx + React)
   - Port: 3000
   - Vite build served by Nginx
   - Optimized for production

## Troubleshooting

### Port Already in Use

If you see an error about ports already in use:

**Option 1: Stop the conflicting service**
- Windows: Check Task Manager
- Linux/Mac: `sudo lsof -i :3000` or `sudo lsof -i :3001`

**Option 2: Change ports in docker-compose.yml**
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 3000 to 8080
  backend:
    ports:
      - "4001:3001"  # Change 3001 to 4001
```

### Database Connection Issues

If the backend can't connect to the database:

1. Check if PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```

2. View PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

3. Restart all services:
   ```bash
   docker-compose restart
   ```

### Frontend Not Loading

1. Check if the frontend container is running:
   ```bash
   docker-compose ps frontend
   ```

2. View frontend logs:
   ```bash
   docker-compose logs frontend
   ```

3. Rebuild the frontend:
   ```bash
   docker-compose up -d --build frontend
   ```

### Backend API Errors

1. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

2. Ensure database migrations ran:
   ```bash
   docker-compose exec backend npx prisma migrate status
   ```

3. Manually run migrations if needed:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

### Clear Everything and Start Fresh

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up -d --build
```

## Database Management

### Access PostgreSQL directly
```bash
docker-compose exec postgres psql -U postgres -d lmtek_configurator
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres lmtek_configurator > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres lmtek_configurator
```

### Run Prisma Studio (Database GUI)
```bash
docker-compose exec backend npx prisma studio
```
Access at: http://localhost:5555

## Production Deployment

For production deployment:

1. **Update environment variables:**
   - Change `JWT_SECRET` to a strong random value
   - Change `ADMIN_PASSWORD`
   - Update `ALLOWED_ORIGINS` to your domain
   - Set `NODE_ENV=production`

2. **Use a proper PostgreSQL instance:**
   - Consider managed database (AWS RDS, Google Cloud SQL, etc.)
   - Update `DATABASE_URL` accordingly

3. **Enable HTTPS:**
   - Use a reverse proxy (Nginx, Traefik, Caddy)
   - Add SSL certificates (Let's Encrypt)

4. **Configure resource limits in docker-compose.yml:**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 1G
   ```

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Ensure Docker is running: `docker version`
3. Check Docker Compose version: `docker-compose version`
4. Review this documentation
5. Check GitHub issues

## License

[Your License Here]
