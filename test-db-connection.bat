@echo off
echo ============================================
echo Testing Supabase Database Connection
echo ============================================

echo.
echo Step 1: Testing if Supabase host is reachable...
ping -n 2 db.pbteuczmpwknljjhaqth.supabase.co >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Host is reachable
) else (
    echo [FAIL] Cannot reach host
    echo.
    echo Possible causes:
    echo 1. Supabase project is PAUSED
    echo 2. Network/firewall issue
    echo 3. Wrong project reference
    echo.
    echo Please check:
    echo 1. Go to https://supabase.com
    echo 2. Sign in and check if your project is Active (not Paused)
    echo 3. If paused, click "Resume Project"
)

echo.
echo Step 2: Checking Prisma connection...
cd /d "%~dp0"
npx prisma db push 2>&1

echo.
echo ============================================
echo If connection fails:
echo 1. Check Supabase project status at https://supabase.com
echo 2. Resume paused project if needed
echo 3. Wait 2-3 minutes after resuming
echo 4. Try again
echo ============================================
pause
