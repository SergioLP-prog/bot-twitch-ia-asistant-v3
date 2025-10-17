#!/bin/bash

echo "========================================"
echo "Twitch Chat Reader - Iniciando GUI..."
echo "========================================"
echo ""

if [ ! -d "node_modules" ]; then
    echo "ERROR: Dependencias no instaladas!"
    echo "Por favor, ejecuta primero: ./install.sh"
    echo ""
    exit 1
fi

echo "Iniciando aplicación..."
npm start

