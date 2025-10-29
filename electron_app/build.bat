@echo off
echo ========================================
echo   Bot Twitch IA Assistant - Build
echo ========================================
echo.

:: Verificar que estamos en el directorio correcto
if not exist "main.js" (
    echo Error: Este script debe ejecutarse desde electron_app/
    pause
    exit /b 1
)

:: Verificar si node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo Error al instalar dependencias
        pause
        exit /b 1
    )
)

:: Verificar si electron-builder está instalado
if not exist "node_modules\electron-builder" (
    echo Instalando electron-builder...
    call npm install electron-builder --save-dev
    if errorlevel 1 (
        echo Error al instalar electron-builder
        pause
        exit /b 1
    )
)

:: Verificar si existe el icono
if not exist "assets\icon.ico" (
    echo.
    echo ========================================
    echo   ADVERTENCIA: No se encontró icon.ico
    echo ========================================
    echo.
    echo Necesitas crear un archivo icon.ico en:
    echo electron_app\assets\icon.ico
    echo.
    echo Puedes usar:
    echo - https://icoconvert.com/
    echo - https://cloudconvert.com/png-to-ico
    echo.
    echo ¿Deseas continuar sin icono? (S/N)
    set /p continue="> "
    if /i not "%continue%"=="S" (
        echo Build cancelado
        pause
        exit /b 1
    )
)

echo.
echo Compilando instalador...
echo.

:: Compilar
call npm run build:win

if errorlevel 1 (
    echo.
    echo Error durante la compilación
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build completado exitosamente!
echo ========================================
echo.
echo El instalador se encuentra en:
echo dist\Bot Twitch IA Assistant Setup 1.0.0.exe
echo.

pause




