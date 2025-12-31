@echo off
echo Starting DigiVault...
echo.

echo Starting Backend Server...
start "DigiVault Backend" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend Server...
start "DigiVault Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
