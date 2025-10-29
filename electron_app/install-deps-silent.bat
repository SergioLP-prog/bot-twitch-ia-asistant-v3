@echo off
REM Script de instalación silenciosa de dependencias
REM Este script se ejecuta sin mostrar ventana de consola

if exist "python\python.exe" (
    python\python.exe -m pip install --upgrade pip --quiet --no-warn-script-location >nul 2>&1
    python\python.exe -m pip install -r requirements.txt --quiet --no-warn-script-location >nul 2>&1
) else (
    python -m pip install --upgrade pip --quiet --no-warn-script-location >nul 2>&1
    python -m pip install -r requirements.txt --quiet --no-warn-script-location >nul 2>&1
)

exit /b %ERRORLEVEL%

