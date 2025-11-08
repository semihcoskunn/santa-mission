@echo off
echo ========================================
echo   Santa'nin Gizli Gorevi - Backend
echo ========================================
echo.

if not exist node_modules (
    echo Bagimliliklari yukleniyor...
    call npm install
    echo.
)

echo Backend baslatiliyor...
echo http://localhost:3000
echo.
call npm start
