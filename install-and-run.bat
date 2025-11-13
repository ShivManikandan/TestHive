@echo off
title Healthcare User Story Bot - Auto Installer
echo ====================================
echo Healthcare User Story QA Bot
echo Auto-Installation Script
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found!
    echo Please ensure npm is installed with Node.js
    pause
    exit /b 1
)

echo [OK] npm found: 
npm --version
echo.

echo [1/5] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed!
    pause
    exit /b 1
)
cd ..

echo [2/5] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b 1
)
cd ..

echo [3/5] Creating environment files...
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env" >nul
    echo [OK] Created backend/.env from template
)

if not exist "frontend\.env" (
    copy "frontend\env.example" "frontend\.env" >nul
    echo [OK] Created frontend/.env from template
)

echo [4/5] Testing installation...
echo Testing backend build...
cd backend
call npm run type-check
if %errorlevel% neq 0 (
    echo [ERROR] Backend has compilation errors!
    cd ..
    pause
    exit /b 1
)
cd ..

echo Testing frontend build...
cd frontend
call npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Frontend build warning (but continuing...)
)
cd ..

echo.
echo [OK] Installation Complete!
echo.
echo [5/5] Starting Applications...
timeout /t 2 /nobreak >nul

REM Start the applications
call start.bat

echo.
echo [SUCCESS] Healthcare User Story QA Bot is ready!
echo.
echo If you encounter any issues:
echo 1. Check that Node.js 18+ is installed
echo 2. Ensure internet connection for package downloads
echo 3. Run as Administrator if permission errors occur
echo.
pause