@echo off
REM LM TEK Configurator - Docker Setup Script for Windows

echo ==================================
echo LM TEK Configurator - Docker Setup
echo ==================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    docker compose version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Docker Compose is not installed.
        pause
        exit /b 1
    )
)

echo Docker and Docker Compose are installed
echo.

REM Create .env file for frontend if it doesn't exist
if not exist .env (
    echo Creating .env file for frontend...
    (
        echo VITE_API_URL=http://localhost:3001/api
    ) > .env
    echo Frontend .env file created
) else (
    echo Frontend .env file already exists
)

REM Create .env file for backend if it doesn't exist
if not exist server\.env (
    echo Creating .env file for backend...
    (
        echo DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/lmtek_configurator?schema=public"
        echo JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long-for-production"
        echo JWT_EXPIRES_IN="7d"
        echo PORT=3001
        echo NODE_ENV="production"
        echo ALLOWED_ORIGINS="http://localhost:3000,http://localhost"
        echo ADMIN_EMAIL="admin@lmtek.com"
        echo ADMIN_PASSWORD="admin123"
        echo ADMIN_NAME="System Administrator"
    ) > server\.env
    echo Backend .env file created
) else (
    echo Backend .env file already exists
)

echo.
echo Building and starting Docker containers...
echo.

REM Stop any existing containers
docker-compose down

REM Build and start containers
docker-compose up -d --build

echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo.
    echo ==================================
    echo Setup Complete!
    echo ==================================
    echo.
    echo Application URLs:
    echo    Frontend:  http://localhost:3000
    echo    Backend:   http://localhost:3001
    echo    Database:  localhost:5432
    echo.
    echo Default Admin Credentials:
    echo    Email:     admin@lmtek.com
    echo    Password:  admin123
    echo.
    echo Useful Commands:
    echo    View logs:        docker-compose logs -f
    echo    Stop services:    docker-compose down
    echo    Restart services: docker-compose restart
    echo    View status:      docker-compose ps
    echo.
) else (
    echo.
    echo ERROR: Something went wrong. Check logs with:
    echo    docker-compose logs
    echo.
)

pause
