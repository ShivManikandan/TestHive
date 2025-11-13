@echo off
title Healthcare User Story Bot - Launcher
echo ====================================
echo Healthcare User Story QA Bot
echo ====================================
echo.

echo [1/4] Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1

echo [2/4] Starting Backend Server...
start "Backend Server (Port 4000)" cmd /k "cd /d %~dp0backend && node_modules\.bin\tsx watch src/index.ts"

echo [3/4] Starting Frontend Server...
timeout /t 2 /nobreak >nul
start "Frontend Server (Port 3000)" cmd /k "cd /d %~dp0frontend && node_modules\.bin\vite"

echo [4/4] Opening application...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ✅ Applications launched successfully!
echo.
echo 🖥️  Backend: http://localhost:4000 
echo 🌐 Frontend: http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo You can close this window now.
echo.
pause