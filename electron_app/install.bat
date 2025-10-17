@echo off
echo ========================================
echo Instalador de Twitch Chat Reader - GUI
echo ========================================
echo.

echo [1/2] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado!
    echo Por favor, instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js detectado correctamente!
echo.

echo [2/2] Instalando dependencias...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Instalacion completada con exito!
    echo ========================================
    echo.
    echo Para iniciar la aplicacion, ejecuta:
    echo   npm start
    echo.
    echo o simplemente ejecuta: start.bat
    echo.
) else (
    echo.
    echo ERROR: Hubo un problema durante la instalacion
    echo.
)

pause

