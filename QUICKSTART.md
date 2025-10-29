# 🚀 Quick Start Guide

Get the LM TEK Server Configurator running in 5 minutes!

## Step 1: Prerequisites

Make sure you have Docker installed:
- **Windows/Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux:** Docker Engine + Docker Compose

## Step 2: Start the Application

### Windows (Easiest)

Simply double-click `docker-setup.bat` or run in Command Prompt:
```cmd
docker-setup.bat
```

### Linux/Mac

```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

## Step 3: Access the Application

After 30-60 seconds, open your browser:

🌐 **Frontend:** http://localhost:3000

## Step 4: Test the Application

### As a Regular User:

1. Click **"Sign Up"** in the header
2. Register a new account with your details
3. Configure a server with your desired components
4. Click **"Get Quote"** at the bottom
5. Submit the quote request
6. View your quotes at **"My Quotes"** (in user dropdown menu)

### As an Admin:

1. Click **"Login"** in the header
2. Use these credentials:
   - **Email:** `admin@lmtek.com`
   - **Password:** `admin123`
3. Click **"Admin"** button in the header
4. Manage components (add, edit, delete)
5. Click **"Manage Quotes"** to view all customer quotes
6. Update quote status and add admin notes

## What You Should See

### Home Page (Configurator)
- Interactive server configuration interface
- 8 component categories (GPU, CPU, RAM, Storage, Power, Network, Motherboard, Cooling)
- Real-time price calculation
- "Get Quote" button in footer

### After Login
- User avatar in header (shows initials)
- Dropdown menu with "My Quotes" and "Logout"
- For admins: "Admin" button visible

### My Quotes Page
- List of all your quote requests
- Status badges (Pending, Reviewed, Approved, etc.)
- Click on any quote to see details

### Admin Dashboard
- Component management tabs
- Add/Edit/Delete components
- "Manage Quotes" button

### Admin Quotes Page
- Statistics dashboard
- All customer quotes
- Filter by status
- Update quote status
- Add admin notes for customers

## Useful Commands

### View Logs
```bash
docker-compose logs -f
```

### Stop Everything
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Start Again
```bash
docker-compose up -d
```

## Troubleshooting

### Port Already in Use?

**Check what's using the port:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3000
lsof -i :3001
```

**Solution:** Stop the process or change ports in `docker-compose.yml`

### Can't Access the Application?

1. Check if containers are running:
   ```bash
   docker-compose ps
   ```

2. All three services should show "Up":
   - lmtek-postgres
   - lmtek-backend
   - lmtek-frontend

3. If any service is not up, check logs:
   ```bash
   docker-compose logs [service-name]
   ```

### Database Issues?

Reset everything:
```bash
docker-compose down -v
docker-compose up -d --build
```

### Frontend Not Loading?

Wait a bit longer (first build can take 2-3 minutes) or rebuild:
```bash
docker-compose up -d --build frontend
```

## Testing Checklist

- [ ] Can access frontend at http://localhost:3000
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Can configure a server
- [ ] Can submit a quote
- [ ] Can view quotes in "My Quotes"
- [ ] Can login as admin (admin@lmtek.com)
- [ ] Can access Admin Dashboard
- [ ] Can add/edit components
- [ ] Can view all quotes in Admin Quotes
- [ ] Can update quote status
- [ ] Can add admin notes to quotes

## Default Test Accounts

### Admin Account
- **Email:** admin@lmtek.com
- **Password:** admin123

### Create Your Own Test Accounts
Just register through the UI!

## Next Steps

Once everything is working:

1. ✅ Change admin password
2. ✅ Update JWT_SECRET in `server/.env`
3. ✅ Explore all features
4. ✅ Customize components
5. ✅ Test the complete workflow

## Need Help?

Check these files:
- `DOCKER_SETUP.md` - Detailed Docker guide
- `PROJECT_CONTEXT.md` - Full project documentation
- `README.md` - Project overview

---

**Enjoy configuring servers! 🎉**
