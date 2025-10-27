@echo off
echo ========================================
echo Desinstalando Dependencias del Bot
echo ========================================
echo.

echo [1/2] Desinstalando paquetes de Python...
python -m pip uninstall -y twitchio google-genai pygame sounddevice pydub soundfile gtts numpy requests pywin32 2>nul

echo.
echo [2/2] Limpiando caché de pip...
python -m pip cache purge

echo.
echo ========================================
echo Desinstalacion completa!
echo ========================================
echo.
echo Ahora puedes reinstalar las dependencias desde la aplicacion.
echo.
pause

