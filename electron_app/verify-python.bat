@echo off
echo ========================================
echo   Verificacion de Python
echo ========================================
echo.

:: Buscar Python 3.11+
python --version >nul 2>nul
if errorlevel 1 (
    echo Python no encontrado en PATH
    echo.
    echo Buscando instalaciones de Python...
    
    :: Buscar en rutas comunes
    if exist "C:\Python311\python.exe" (
        echo Encontrado Python 3.11 en C:\Python311\
        set PYTHON_PATH=C:\Python311\python.exe
    ) else if exist "C:\Python312\python.exe" (
        echo Encontrado Python 3.12 en C:\Python312\
        set PYTHON_PATH=C:\Python312\python.exe
    ) else (
        echo.
        echo ERROR: Python no encontrado en el sistema
        echo.
        echo Instala Python desde:
        echo https://www.python.org/downloads/
        echo.
        pause
        exit /b 1
    )
) else (
    python --version
    echo Python encontrado correctamente
)

echo.
echo ========================================
echo   Verificacion completada
echo ========================================
echo.
pause




