# 🚀 Bot Twitch IA Assistant - Guía de Compilación

## 📋 Requisitos

- **Node.js** v18+
- **Python** 3.11+
- **Git**

## 🛠️ Instalación

```bash
# Instalar dependencias de Node
npm install

# El proyecto ya incluye electron-builder en package.json
```

## 🎨 Crear Icono

**IMPORTANTE:** Antes de compilar, crea un archivo `icon.ico`:

1. Ve a `assets/icon.ico`
2. O crea uno en: https://icoconvert.com/
3. Tamaño recomendado: 256x256 píxeles

## 🔨 Compilar Instalador

### Opción 1: Script Automático (Fácil)

```bash
# Desde electron_app/
.\build.bat
```

### Opción 2: Comandos Manuales

```bash
# Compilar para Windows
npm run build:win

# O compilar todo
npm run dist
```

El instalador se generará en:
```
dist/Bot Twitch IA Assistant Setup 1.0.0.exe
```

## 📦 Lo que incluye el Instalador

- ✅ Interfaz Electron completa
- ✅ Script chatbot.py
- ✅ requirements.txt
- ✅ Script de desinstalación
- ✅ Acceso directo en el escritorio
- ✅ Acceso directo en el menú inicio

## 🎯 Características del Instalador

- **Tipo:** NSIS (Nullsoft Scriptable Install System)
- **Tamaño:** ~150-200 MB
- **Permite:** Elegir directorio de instalación
- **Crea:** Accesos directos automáticos
- **Incluye:** Todas las dependencias

## 🧪 Probar el Instalador

1. Ejecuta `Bot Twitch IA Assistant Setup 1.0.0.exe`
2. Instala en una ubicación temporal
3. Verifica que se crea el acceso directo
4. Ejecuta el acceso directo
5. Verifica que la interfaz se abre correctamente

## 📝 Distribución

- El archivo `.exe` es TODO lo que necesitas
- Los usuarios NO necesitan instalar nada más
- Solo ejecutan el `.exe` y listo

## 🔧 Solución de Problemas

### Error: "electron-builder not found"
```bash
npm install electron-builder --save-dev
```

### Error: "No se puede encontrar el icono"
- Crea `assets/icon.ico` o compila sin icono temporalmente

### El instalador es muy grande
- Considera usar `electron-builder` con `compression=maximum`
- O usa `"compression": "lzma2"` en el build

### Python no se detecta en el instalador
- El instalador verifica Python pero NO lo instala
- Los usuarios deben tener Python pre-instalado
- Para incluir Python portable, configura `extraResources`

## 🎨 Personalizar

### Cambiar Nombre
Edita `package.json`:
```json
{
  "productName": "Tu Nombre Aquí",
  "name": "tu-bot-name"
}
```

### Cambiar Icono
Reemplaza `assets/icon.ico` con tu icono

### Cambiar Versión
```json
{
  "version": "2.0.0"
}
```

## 📊 Tamaños Esperados

- **Con Python portable:** ~300-400 MB
- **Sin Python:** ~150-200 MB
- **Comprimido ZIP:** ~50-70 MB




