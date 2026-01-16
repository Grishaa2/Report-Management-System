# Deployment Guide for Report Management System

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** with a repository created
2. **Vercel Account** (free tier works)
3. **PostgreSQL Database** (local or cloud):
   - Local: PostgreSQL installed and running
   - Cloud: Supabase, Railway, Neon, or Render

---

## Step 1: Push to GitHub

Run these commands in your project directory:

```bash
# Rename branch to main (if needed)
git branch -M main

# Add your remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

---

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL (Development)

1. Start PostgreSQL service (as Administrator):
```cmd
net start "postgresql-x64-17"
```

2. Create database:
```bash
psql -U postgres -c "CREATE DATABASE wct_report_db;"
```

3. Run database setup:
```bash
# Double-click setup-database.bat OR run:
npx prisma migrate dev --name init
```

### Option B: Cloud PostgreSQL (Production)

Recommended services:
- **Supabase** (free tier available) - https://supabase.com
- **Neon** (free tier available) - https://neon.tech
- **Railway** (pay-as-you-go) - https://railway.app
- **Render** (free tier available) - https://render.com

1. Create a new PostgreSQL database on your chosen platform
2. Get your connection string (DATABASE_URL)
3. Update `.env` with your production database URL

---

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Connect GitHub Repository:**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**
   In Vercel dashboard, go to Settings → Environment Variables and add:

   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secure-secret-key-min-32-chars
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel --prod
```

---

## Step 4: Set Up Production Database

After deployment, run Prisma migrations on your production database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push
```

Or use Prisma Migrate for more control:

```bash
npx prisma migrate deploy
```

---

## Step 5: Verify Deployment

Test these features in production:

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Login with Google/GitHub
- [ ] Forgot password flow
- [ ] Password reset

### Data Features
- [ ] Upload CSV file
- [ ] View data visualization
- [ ] Data Understanding Assistant displays
- [ ] Q&A feature works
- [ ] View saved reports

### Error Handling
- [ ] Invalid email shows error
- [ ] Wrong password shows error
- [ ] Non-existent user shows friendly message
- [ ] Console has no errors

---

## Troubleshooting

### Prisma Client Generation Error
```bash
# Regenerate Prisma client
npx prisma generate
```

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check firewall settings
- Ensure database accepts connections from Vercel

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASSWORD
- For Gmail, use App Password (not regular password)
- Generate app password: https://myaccount.google.com/apppasswords

### NextAuth Errors
- Ensure NEXTAUTH_SECRET is set (32+ characters)
- NEXTAUTH_URL must match your deployment URL exactly

---

## Production Checklist

- [ ] PostgreSQL database created and accessible
- [ ] All environment variables set in Vercel
- [ ] Prisma schema deployed to production
- [ ] Email credentials configured
- [ ] OAuth credentials configured (optional)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] No 404 errors on any page
- [ ] No console errors in browser
- [ ] Data upload works correctly
- [ ] AI insights generate properly
- [ ] Mobile responsive

---

## File Structure

```
Report-Management-System/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── reports/   # Report CRUD endpoints
│   │   │   └── user/      # User profile endpoints
│   │   ├── dashboard/     # Dashboard page
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── components/
│   │   ├── data-understanding-assistant.jsx
│   │   ├── dashboard-layout.jsx
│   │   ├── login-form.jsx
│   │   ├── register-form.jsx
│   │   └── ui/            # Shadcn UI components
│   └── lib/
│       ├── data-analysis.js
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
├── .env                   # Environment variables
└── package.json
```

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection locally first
4. Check browser console for errors
