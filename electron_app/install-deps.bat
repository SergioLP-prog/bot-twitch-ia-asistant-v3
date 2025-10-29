@echo off
echo ========================================
echo   Instalando Dependencias
echo ========================================
echo.

:: Verificar Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js no está instalado
    echo Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo Instalando dependencias de Node.js...
call npm install

if errorlevel 1 (
    echo Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo Instalando electron-builder...
call npm install electron-builder --save-dev

echo.
echo ========================================
echo   Dependencias instaladas correctamente
echo ========================================
echo.
pause




