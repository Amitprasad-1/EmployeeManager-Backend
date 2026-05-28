@echo off
title Employee Manager Starter
echo ===================================================
echo   Employee Manager Starter - 1-Click Shortcut
echo ===================================================

:: 1. Start Backend in a separate window
echo [1/2] Starting Spring Boot Backend...
start "Spring Boot Backend" cmd /k "cd backend && .\mvnw.cmd spring-boot:run"

:: 2. Start Frontend in this window
echo [2/2] Starting Angular Frontend...
cd frontend
npm run start
