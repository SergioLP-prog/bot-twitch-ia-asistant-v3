# 🚀 Guía para Crear el Instalador del Bot Twitch IA Assistant

## 📦 Opción 1: Electron Builder (RECOMENDADO)

### Requisitos Previos
1. **Node.js** (v18 o superior)
2. **Python 3.11+** instalado
3. **Git** instalado

### Paso 1: Instalar Electron Builder

Desde la carpeta `electron_app/`:
```bash
cd electron_app
npm install electron-builder --save-dev
```

### Paso 2: Crear el Icono

Necesitas crear un archivo `icon.ico` de 256x256 píxeles en:
```
electron_app/assets/icon.ico
```

**Herramientas para crear el icono:**
- [CloudConvert](https://cloudconvert.com/png-to-ico) - Conversor online PNG → ICO
- [ICO Convert](https://icoconvert.com/) - Multiplataforma
- Paint.NET, GIMP, Photoshop

### Paso 3: Generar el Instalador

```bash
# Desde electron_app/
npm run build:win
```

El instalador se generará en:
```
electron_app/dist/Bot Twitch IA Assistant Setup 1.0.0.exe
```

### Paso 4: Distribuir

- El `.exe` es el instalador completo
- Al ejecutarlo se instalará todo el bot
- Creará un acceso directo en el escritorio
- Incluirá chatbot.py y requirements.txt

---

## 🔧 Opción 2: Auto-py-to-exe (Alternativa Simple)

### Instalación

```bash
pip install auto-py-to-exe
```

### Uso

```bash
auto-py-to-exe
```

**Configuración:**
- **Script Location:** `chatbot.py`
- **Onefile:** Yes
- **Console Window:** Windowed (hidden)
- **Icon:** Tu icono .ico
- **Additional Files:** Incluir `electron_app/` folder

---

## 📋 Opción 3: Inno Setup (Tradicional)

### Instalación

Descargar desde: https://jrsoftware.org/isdl.php

### Crear Archivo .iss

Crear `setup.iss` en la raíz del proyecto:

```iss
[Setup]
AppName=Bot Twitch IA Assistant
AppVersion=1.0.0
DefaultDirName={pf}\TwitchBot
DefaultGroupName=TwitchBot
OutputDir=dist
OutputBaseFilename=TwitchBotInstaller
Compression=lzma
SolidCompression=yes
LicenseFile=LICENSE.txt

[Files]
Source: "electron_app\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs
Source: "chatbot.py"; DestDir: "{app}"
Source: "requirements.txt"; DestDir: "{app}"
Source: "uninstall_dependencies.bat"; DestDir: "{app}"

[Icons]
Name: "{commondesktop}\Bot Twitch IA"; Filename: "{app}\electron_app.exe"
Name: "{group}\Bot Twitch IA"; Filename: "{app}\electron_app.exe"
Name: "{group}\Uninstall"; Filename: "{uninstallexe}"

[Run]
Filename: "python"; Parameters: "-m pip install -r requirements.txt"; StatusMsg: "Instalando dependencias..."; Check: IsAdminLoggedOn
```

### Compilar

1. Abrir Inno Setup Compiler
2. Cargar `setup.iss`
3. Build → Compile

---

## 🎯 Recomendación Final

**Usa Electron Builder** porque:
- ✅ Es el estándar para apps Electron
- ✅ Incluye auto-actualizaciones
- ✅ Soporta Squirrel.Windows
- ✅ Genera instaladores más modernos
- ✅ Incluye Python automáticamente si lo configuras

---

## 📝 Comandos Rápidos

```bash
# Desarrollar
npm start

# Compilar instalador
npm run build:win

# Compilar para producción
npm run dist
```

---

## ⚙️ Configuración Adicional

### Si quieres incluir Python en el instalador:

Edita `package.json` y agrega:

```json
"build": {
  "extraResources": [
    {
      "from": "python/",
      "to": "python",
      "filter": ["**/*"]
    }
  ]
}
```

Esto incluirá Python portable en el instalador.

---

## 🔍 Verificación

Después de generar el instalador:

1. **Instalar** en una máquina limpia
2. **Verificar** que se crea el acceso directo
3. **Probar** que abre la interfaz
4. **Comprobar** que el bot Python funciona

---

## 📦 Distribución

El archivo `.exe` es todo lo que necesitas. Los usuarios:
- No necesitan instalar Node.js
- No necesitan instalar Python manualmente (si lo incluyes)
- Solo ejecutan el `.exe` y todo se instala automáticamente




