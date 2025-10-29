# Instrucciones para Compilar el Instalador

## Pasos para Generar el Instalador .exe

### 1. Verificar Dependencias
Asegúrate de tener instalado:
- Node.js (v16 o superior)
- Python 3.12 embebido en `electron_app/python_embebido/`

### 2. Instalar Python Embebido
Si no tienes Python embebido:
```bash
cd electron_app
# Descarga Python 3.12 desde python.org
# Extrae a: electron_app/python_embebido/
```

### 3. Instalar Dependencias de Node.js
```bash
cd electron_app
npm install
```

### 4. Compilar el Instalador
```bash
# Desde electron_app/
npm run build:win

# O ejecutar el script:
build.bat
```

### 5. El instalador se generará en:
```
electron_app/dist/Bot Twitch IA Assistant Setup 1.0.0.exe
```

## Importante

- El instalador instalará automáticamente las dependencias de Python desde `requirements.txt`
- Las dependencias se instalan durante el proceso de instalación del .exe
- Si el instalador falla, puedes ejecutar manualmente `install-python-deps.bat`

## Solución de Problemas

### Error: "Bot.__init__() missing 3 required keyword-only arguments"
Este error se debe a que las dependencias de Python no se instalaron correctamente. Solución:
1. Ejecuta manualmente `install-python-deps.bat` desde el directorio de instalación
2. O reinstala la aplicación

### Error: Dependencias faltantes
Si ves errores de dependencias faltantes:
1. Abre PowerShell como administrador
2. Ve al directorio de instalación
3. Ejecuta: `.\install-python-deps.bat`

## Estructura del Proyecto

```
electron_app/
├── main.js                    # Proceso principal de Electron
├── index.html                 # Interfaz de usuario
├── renderer.js                # Lógica del renderer
├── preload.js                 # Script de preload
├── chatbot.py                 # Bot de Twitch (copiado desde la raíz)
├── requirements.txt           # Dependencias de Python
├── package.json               # Configuración de Electron Builder
├── installer.nsh              # Script de instalación personalizado
├── build.bat                  # Script de compilación
├── install-python-deps.bat    # Script de instalación de dependencias
└── python_embebido/           # Python 3.12 portátil
```

## Verificación de la Versión de TwitchIO

La versión actual de twitchio es **2.6.1** (estable). Si experimentas problemas:
1. Verifica que `requirements.txt` contiene: `twitchio==2.6.1`
2. Recompila el instalador después de cualquier cambio a requirements.txt

