@echo off
echo ============================================
echo PostgreSQL Database Setup for Report Management System
echo ============================================

echo.
echo Step 1: Starting PostgreSQL service...
net start "postgresql-x64-17" 2>nul
if %errorlevel% neq 0 (
    echo Could not start PostgreSQL service. Please start it manually as Administrator.
    echo.
    echo To start manually:
    echo 1. Open Command Prompt as Administrator
    echo 2. Run: net start "postgresql-x64-17"
    echo.
)

echo.
echo Step 2: Creating database if it doesn't exist...
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='wct_report_db'" 2>nul
if %errorlevel% neq 0 (
    echo Database not found. Creating wct_report_db...
    psql -U postgres -c "CREATE DATABASE wct_report_db;" 2>nul
    if %errorlevel% equ 0 (
        echo Database created successfully!
    ) else (
        echo Failed to create database. Please create it manually.
        echo Run: psql -U postgres -c "CREATE DATABASE wct_report_db;"
    )
) else (
    echo Database wct_report_db already exists.
)

echo.
echo Step 3: Running Prisma migrations...
cd /d "%~dp0"
npx prisma migrate dev --name init

echo.
echo Step 4: Verifying database connection...
node check-db.js

echo.
echo ============================================
echo Setup complete! If there were no errors, your database is ready.
echo ============================================
pause
