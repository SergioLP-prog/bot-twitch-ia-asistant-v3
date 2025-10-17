@echo off
echo ========================================
echo Twitch Chat Reader - Iniciando GUI...
echo ========================================
echo.

if not exist "node_modules\" (
    echo ERROR: Dependencias no instaladas!
    echo Por favor, ejecuta primero: install.bat
    echo.
    pause
    exit /b 1
)

echo Iniciando aplicacion...
call npm start

