#!/bin/bash

echo "========================================"
echo "Instalador de Twitch Chat Reader - GUI"
echo "========================================"
echo ""

echo "[1/2] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado!"
    echo "Por favor, instala Node.js desde: https://nodejs.org/"
    exit 1
fi
echo "Node.js detectado correctamente!"
echo ""

echo "[2/2] Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "Instalación completada con éxito!"
    echo "========================================"
    echo ""
    echo "Para iniciar la aplicación, ejecuta:"
    echo "  npm start"
    echo ""
    echo "o simplemente ejecuta: ./start.sh"
    echo ""
else
    echo ""
    echo "ERROR: Hubo un problema durante la instalación"
    echo ""
fi

