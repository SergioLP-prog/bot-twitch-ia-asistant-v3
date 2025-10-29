@echo off
echo ========================================
echo   Creador de Instalador Simple
echo ========================================
echo.

:: Crear carpeta de distribución
if not exist "dist" mkdir dist
if not exist "dist\BotSetup" mkdir dist\BotSetup

echo Copiando archivos...
xcopy /E /I /Y "electron_app\*" "dist\BotSetup\electron_app\"
copy "chatbot.py" "dist\BotSetup\"
copy "requirements.txt" "dist\BotSetup\"
copy "uninstall_dependencies.bat" "dist\BotSetup\"

echo.
echo Creando accesos directos...
echo.

:: Crear script de inicio
echo @echo off > "dist\BotSetup\Iniciar Bot.bat"
echo cd /d "%%~dp0electron_app" >> "dist\BotSetup\Iniciar Bot.bat"
echo start "" "%%LOCALAPPDATA\Programs\npm\npm.cmd" start >> "dist\BotSetup\Iniciar Bot.bat"
echo pause >> "dist\BotSetup\Iniciar Bot.bat"

echo.
echo ========================================
echo   Instalador simple creado
echo ========================================
echo.
echo Carpeta de distribución: dist\BotSetup
echo.
echo El usuario solo necesita:
echo 1. Copiar esta carpeta a su PC
echo 2. Instalar Python 3.11+
echo 3. Instalar dependencias: pip install -r requirements.txt
echo 4. Ejecutar: Iniciar Bot.bat
echo.
pause




