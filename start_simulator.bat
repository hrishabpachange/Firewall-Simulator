@echo off
title Firewall Simulator Launcher
color 0b
echo ==============================================
echo       Firewall Simulator - Boot Sequence
echo ==============================================
echo.

:: Start Backend API
echo [1/3] Starting Backend API (FastAPI)...
start "Firewall Backend Server" cmd /c "cd backend && call venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

:: Start Frontend Server
echo [2/3] Starting Frontend UI (Python HTTP)...
start "Firewall Frontend Server" cmd /c "cd frontend && python -m http.server 3000"

:: Wait for servers to wake up
echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak > NUL

:: Open the default web browser to the SPA
echo Opening http://localhost:3000 in your browser!
start http://localhost:3000

echo.
echo ==============================================
echo  ALL SYSTEMS ONLINE! 
echo  Close the two new terminal windows to quit.
echo ==============================================
pause
