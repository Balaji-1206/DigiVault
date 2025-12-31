# DigiVault Startup Script
# This script starts both backend and frontend servers

Write-Host "🚀 Starting DigiVault..." -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "📡 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend Server  
Write-Host "⚛️  Starting Frontend Server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Gray
