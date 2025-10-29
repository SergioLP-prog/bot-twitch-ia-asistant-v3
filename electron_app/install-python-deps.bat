@echo off
echo ========================================
echo   Instalando Dependencias de Python
echo ========================================
echo.

:: Verificar si Python embebido existe
if not exist "python\python.exe" (
    echo ERROR: Python embebido no encontrado!
    echo Por favor, reinstala la aplicacion.
    pause
    exit /b 1
)

echo [1/3] Actualizando pip...
python\python.exe -m pip install --upgrade pip --quiet

if errorlevel 1 (
    echo Error al actualizar pip
    pause
    exit /b 1
)

echo [2/3] Instalando dependencias desde requirements.txt...
python\python.exe -m pip install -r requirements.txt --quiet

if errorlevel 1 (
    echo Error al instalar dependencias
    pause
    exit /b 1
)

echo [3/3] Verificando instalacion...
python\python.exe -c "import twitchio; print('TwitchIO: OK')" 2>nul
python\python.exe -c "import google.genai; print('Google Genai: OK')" 2>nul
python\python.exe -c "import pygame; print('Pygame: OK')" 2>nul
python\python.exe -c "import requests; print('Requests: OK')" 2>nul
python\python.exe -c "import sounddevice; print('Sounddevice: OK')" 2>nul
python\python.exe -c "import pydub; print('Pydub: OK')" 2>nul
python\python.exe -c "import soundfile; print('Soundfile: OK')" 2>nul
python\python.exe -c "import gtts; print('gTTS: OK')" 2>nul

echo.
echo ========================================
echo   Instalacion completada!
echo ========================================
echo.
pause

