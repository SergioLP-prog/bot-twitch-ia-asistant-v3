# Solución: Error de Dependencias al Abrir el .exe

## Problema Identificado

Al abrir la aplicación instalada, aparecen estos errores:
```
Advertencia: google-genai no esta instalado
Advertencia: pygame, requests, sounddevice o pydub no esta instalado
Advertencia: soundfile no esta instalado
Error fatal: Bot.__init__() missing 3 required keyword-only arguments: 'client_id', 'client_secret', and 'bot_id'
```

## Causa

Las dependencias de Python no se están instalando correctamente durante el proceso de instalación del .exe.

## Soluciones Implementadas

### 1. Corrección del Script de Instalación

Se actualizó `electron_app/installer.nsh` para:
- Instalar correctamente todas las dependencias desde `requirements.txt`
- Verificar que Python embebido esté disponible
- Actualizar pip antes de instalar dependencias

### 2. Actualización de Versiones de Dependencias

Se actualizó `requirements.txt` con versiones estables:
```txt
twitchio==2.6.1              # Versión estable que no requiere client_id/client_secret
pygame==2.5.2
requests==2.31.0
sounddevice==0.4.6
pydub==0.25.1
numpy==1.24.3
soundfile==0.12.1
gtts==2.5.1
pywin32==306
google-genai==0.2.0
```

### 3. Script de Instalación Manual

Se creó `electron_app/install-python-deps.bat` para instalar dependencias manualmente si el instalador falla.

## Pasos para Regenerar el Instalador

### Paso 1: Actualizar Dependencias
```bash
cd electron_app
npm install
```

### Paso 2: Compilar
```bash
npm run build:win
# O ejecutar build.bat
```

### Paso 3: Generar el .exe
El instalador se generará en: `electron_app/dist/Bot Twitch IA Assistant Setup 1.0.0.exe`

## Solución Rápida para Usuarios Finales

Si ya instalaste la aplicación y ves este error:

1. **Opción A: Ejecutar el script de instalación manual**
   - Ve a la carpeta donde instalaste la aplicación (ej: `C:\Program Files\Bot Twitch IA Assistant\`)
   - Busca el archivo `install-python-deps.bat`
   - Haz doble clic para ejecutar
   - Espera a que termine la instalación

2. **Opción B: Reinstalar la aplicación**
   - Desinstala la versión actual
   - Descarga la nueva versión con las correcciones
   - Instala nuevamente

3. **Opción C: Instalar dependencias manualmente**
   ```bash
   # Abre PowerShell como administrador
   cd "C:\Program Files\Bot Twitch IA Assistant"
   .\python\python.exe -m pip install -r requirements.txt
   ```

## Verificación

Después de aplicar la solución, verifica que las dependencias están instaladas:

```bash
python -c "import twitchio; print('TwitchIO: OK')"
python -c "import google.genai; print('Google Genai: OK')"
python -c "import pygame; print('Pygame: OK')"
python -c "import requests; print('Requests: OK')"
python -c "import sounddevice; print('Sounddevice: OK')"
python -c "import pydub; print('Pydub: OK')"
python -c "import soundfile; print('Soundfile: OK')"
```

## Cambios Realizados

1. ✅ Actualizado `electron_app/installer.nsh` - Script de instalación corregido
2. ✅ Actualizado `requirements.txt` - Versiones estables especificadas
3. ✅ Creado `electron_app/install-python-deps.bat` - Script de instalación manual
4. ✅ Actualizado `electron_app/package.json` - Incluye nuevos archivos en el instalador
5. ✅ Creado documentación - Instrucciones claras para regenerar el instalador

## Próximos Pasos

1. Compilar el nuevo instalador con las correcciones
2. Probar el instalador en un sistema limpio
3. Distribuir la nueva versión a los usuarios

