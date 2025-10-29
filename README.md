# 🤖 Bot Avanzado de Twitch - Interfaz Electron

Bot profesional de Twitch con interfaz gráfica moderna para monitorear chats en tiempo real, con instalador completo para Windows.

---

## 🚀 Inicio Rápido

### 📦 Opción 1: Instalador .exe (Recomendado para Usuarios)

Si eres un usuario final y solo quieres usar el bot:

1. **Descarga el instalador** `Bot Twitch IA Assistant Setup 1.0.0.exe`
2. **Ejecuta el instalador** - Todo se configura automáticamente:
   - ✅ Python embebido incluido
   - ✅ Todas las dependencias se instalan automáticamente
   - ✅ No necesitas instalar nada manualmente
3. **Abre la aplicación** desde el menú de inicio o escritorio
4. **Ingresa tu Token OAuth** (se agrega `oauth:` automáticamente)
5. **¡Listo!** El bot está listo para usar

**💡 Nota:** El instalador instala las dependencias de Python de forma silenciosa (sin ventanas CMD).

---

### 🔧 Opción 2: Desarrollo desde Código

Si quieres desarrollar o modificar el bot:

```bash
# 1. Instalar dependencias Python
pip install -r requirements.txt

# 2. Instalar dependencias Electron
cd electron_app
npm install

# 3. Iniciar aplicación en modo desarrollo
npm start
```

**⚠️ IMPORTANTE:** Necesitas un **Token OAuth** para usar el bot → [Obtener aquí](https://twitchtokengenerator.com/)

**🤖 IA Opcional:** Para usar el comando `!IA`, configura tu API Key de Gemini en la pestaña de configuración → [Obtener aquí](https://aistudio.google.com/app/apikey)

---

## 🏗️ Construir el Instalador

Si quieres generar tu propio instalador desde el código fuente:

```bash
cd electron_app
npm run build:win
```

El instalador se generará en: `electron_app/dist/Bot Twitch IA Assistant Setup 1.0.0.exe`

**📋 Requisitos previos:**
- Node.js 16+ instalado
- Todas las dependencias npm instaladas (`npm install`)
- Python embebido incluido en `electron_app/python_embebido/`

Ver `electron_app/INSTRUCCIONES_BUILD.md` para más detalles.

---

## 📋 Requisitos

### Para Usuarios Finales (Instalador .exe):
- ✅ **Windows 10/11** (64-bit)
- ✅ **Token OAuth de Twitch** (obligatorio) → [Obtener aquí](https://twitchtokengenerator.com/)
- ✅ **Canal debe estar EN VIVO** para recibir mensajes
- ✅ **API Key de Gemini** (opcional, solo para IA) → [Obtener](https://aistudio.google.com/app/apikey)

**📦 Todo lo demás está incluido** (Python y dependencias se instalan automáticamente)

### Para Desarrolladores (Código Fuente):
- **Python 3.12+** → [Descargar](https://www.python.org/)
- **Node.js 16+** → [Descargar](https://nodejs.org/)
- **Token OAuth de Twitch** (obligatorio)
- **Canal debe estar EN VIVO** para recibir mensajes
- **API Key de Gemini** (opcional, solo para IA) → [Obtener](https://aistudio.google.com/app/apikey)

---

## 🔑 Obtener Token OAuth

### Paso 1: Generar Token
1. Ve a: **https://twitchtokengenerator.com/**
2. Selecciona **"Custom Scope Token"**
3. Marca los permisos:
   - ✅ `chat:read` (leer mensajes)
   - ✅ `chat:edit` (enviar mensajes)
4. Haz clic en **"Generate Token"**
5. Autoriza con tu cuenta de Twitch
6. **Copia el token** (formato: `oauth:xxxxxxxxxxxxx`)

### Paso 2: Usar Token en la Aplicación
- ✅ **Simplificado:** Solo pega el token en el campo (puedes incluir o no el prefijo `oauth:`)
- ✅ **Automático:** La aplicación agrega `oauth:` automáticamente si falta
- 🔒 **Seguro:** El token se guarda localmente en tu equipo (nunca se envía a servidores externos)

### Paso 3: Guardar Token
🔒 **Guarda tu token en un lugar seguro** (nunca lo compartas públicamente)

---

## 🤖 Configurar IA con Gemini

### ¿Qué hace la IA?

Responde a comandos `!IA` en el chat de Twitch usando Google Gemini.

**Ejemplo:**
```
Usuario: !IA cuéntame un chiste
Bot: ¿Por qué los programadores prefieren la noche? Porque la luz del día causa bugs 😄
```

### Configuración Rápida:

**Paso 1: Obtener API Key**
1. Ve a: https://aistudio.google.com/app/apikey
2. Crea una API Key
3. Cópiala (formato: `AIzaSy...`)

**Paso 2: Configurar en pestaña de configuracion**
1. Abre Pestaña de configuracion haciendo click en ventana con simbolo de tuerca
2. Ve al apartado de Api key
3. y pega tus credenciales
   ```

**Paso 3: Instalar Dependencia**
```bash
pip install google-genai
```

**¡Listo!** Ahora puedes usar `!IA` en el chat.

📖 **Guía completa:** `CONFIGURAR_IA.md`

---

## 💻 Uso

### Interfaz Gráfica (Recomendado)

```bash
cd electron_app
npm start
```

1. Ingresa el **nombre del canal** (ej: `auronplay`, `ibai`)
2. Pega tu **Token OAuth** en el campo correspondiente (se agrega `oauth:` automáticamente)
3. **(Opcional)** Configura tu API Key de Gemini en la pestaña de configuración
4. Haz clic en **"Iniciar Bot"**
5. ✅ ¡Verás los mensajes en tiempo real!

**💡 Atajos de teclado:**
- `Ctrl + Shift + I` o `Ctrl + Shift + J`: Abrir/cerrar consola de desarrollador

### Terminal (No recomendado - Usa la Interfaz Gráfica)

Si necesitas ejecutar desde línea de comandos:

```bash
python chatbot.py CANAL oauth:TU_TOKEN
```

**Ejemplo:**
```bash
python chatbot.py auronplay oauth:xxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Nota:** El archivo se llama `chatbot.py`, no `twitch_chat_advanced_electron.py`

---

## ✨ Características

### 🎨 Interfaz Moderna
- ✅ Diseño inspirado en Twitch
- ✅ Tema oscuro profesional
- ✅ Visualización de mensajes en tiempo real
- ✅ Sistema de logs integrado
- ✅ 🤖 **Integración con IA Gemini**
- ✅ 🧠 **Sistema de Memoria por Usuario** (NUEVO)

### 📊 Estadísticas en Vivo
- 📨 **Mensajes**: Contador total
- 👥 **Usuarios**: Usuarios únicos
- 🤖 **Comandos**: Mensajes que empiezan con `!`

### 🏆 Detección Avanzada
- 🔴 **Badges**: MOD, SUB, VIP
- 🎨 **Colores**: Colores de usuario de Twitch
- 🤖 **Comandos**: Destacados automáticamente
- ⭐ **Usuarios Especiales**: Sistema de resaltado

### 🎯 Comandos del Bot
- `!stats` - Muestra estadísticas del chat
- `!block <usuario>` - Bloquea un usuario
- `!unblock <usuario>` - Desbloquea un usuario
- `!highlight <usuario>` - Resalta un usuario
- `!IA <pregunta>` - 🤖 Interactúa con IA Gemini (con memoria)
- `!memoria` - 🧠 **NUEVO**: Ver cuántas interacciones tienes en memoria
- `!resetmemoria [usuario]` - 🔄 **NUEVO**: Resetear memoria (solo moderadores)
- `!memstats` - 📊 **NUEVO**: Estadísticas de memoria (solo moderadores)

### 🧠 Sistema de Memoria

El bot ahora tiene un sistema de memoria que recuerda las conversaciones con cada usuario durante la sesión actual.

**Características:**
- ✅ El bot recuerda hasta 10 interacciones por usuario
- ✅ La memoria se mantiene durante toda la sesión
- ✅ Se resetea automáticamente cuando el bot se apaga o reinicia
- ✅ Permite conversaciones contextuales y naturales

**Ejemplo de uso:**
```
Usuario: !IA tengo 25 años
Bot: ¡Genial! Veo que tienes 25 años...

[Más tarde en la misma sesión]
Usuario: !IA cuántos años tengo?
Bot: Tienes 25 años, me lo dijiste antes.
```

**Comandos de Memoria:**
- `!memoria` - Cualquier usuario puede ver cuántas interacciones tiene en memoria
- `!resetmemoria` - Solo moderadores pueden resetear toda la memoria
- `!resetmemoria usuario123` - Solo moderadores pueden resetear la memoria de un usuario específico
- `!memstats` - Solo moderadores pueden ver estadísticas generales de memoria

📖 **Documentación adicional:**
- [MEMORIA.md](MEMORIA.md) - Documentación técnica completa del sistema de memoria
- [EJEMPLOS_MEMORIA.md](EJEMPLOS_MEMORIA.md) - Ejemplos prácticos de uso

---

## 📁 Estructura del Proyecto

```
bot_ia_v3/
├── electron_app/               # Interfaz Electron
│   ├── index.html             # Interfaz HTML
│   ├── main.js                # Proceso principal
│   ├── renderer.js            # Lógica del frontend
│   ├── style.css              # Estilos
│   ├── package.json           # Dependencias Node
│   ├── installer.nsh          # Script de instalador NSIS
│   ├── python_embebido/       # Python embebido para el instalador
│   ├── install-python-deps.bat      # Instalación manual de dependencias
│   ├── install-deps-silent.bat      # Instalación silenciosa (usado por instalador)
│   ├── build.bat              # Script para construir instalador
│   ├── README.md              # Documentación técnica
│   └── INSTRUCCIONES_BUILD.md # Instrucciones para construir instalador
├── chatbot.py                 # Bot de Python (principal)
├── requirements.txt           # Dependencias Python
├── INSTALADOR.md              # Documentación del instalador
├── README.md                  # Este archivo
└── LICENSE                    # Licencia (si existe)
```

---

## 🔧 Solución de Problemas (FAQs)

### ❌ "Token OAuth es REQUERIDO"

**Causa:** No se proporcionó un token o está vacío.

**Solución:**
1. Obtén un token en: https://twitchtokengenerator.com/
2. Pégalo en el campo "Token OAuth"
3. Asegúrate de que empiece con `oauth:`

---

### ❌ "El token debe empezar con 'oauth:'"

**Causa:** Formato de token incorrecto (ya no debería ocurrir).

**Solución Automática:**
- La aplicación ahora agrega `oauth:` automáticamente si falta
- Solo pega el token sin preocuparte del prefijo

**Si tienes problemas:**
```
❌ Incorrecto: kchmfz0tyso8p0h5mc4gbgdswslj22
✅ Correcto:   oauth:kchmfz0tyso8p0h5mc4gbgdswslj22
✅ También OK: kchmfz0tyso8p0h5mc4gbgdswslj22 (se agrega automáticamente)
```

---

### ❌ No aparecen mensajes en el chat

**Causa 1: Canal no está en vivo**
- Verifica en https://www.twitch.tv/[canal] que esté transmitiendo
- Solo funciona con canales en vivo (círculo rojo "EN VIVO")

**Causa 2: Token inválido o expirado**
- Genera un nuevo token en https://twitchtokengenerator.com/
- Verifica que tenga los permisos correctos

**Causa 3: Chat sin actividad**
- El chat puede estar vacío (nadie escribiendo)
- Prueba con un canal grande: `auronplay`, `ibai`, `elrubius`

**Solución - Verificar conexión:**
```bash
# Abre DevTools en Electron: Ctrl + Shift + I
# Revisa la consola y busca:
✅ [DEBUG] Mensaje recibido: ...
✅ 📨 [MAIN] Python stdout data: ...
✅ 📥 [RENDERER] Recibido: ...
```

---

### ❌ "TwitchIO no está instalado" (Solo en desarrollo)

**Causa:** Si usas el código fuente, falta instalar dependencias.

**Solución para Desarrollo:**
```bash
pip install -r requirements.txt
```

**Si usas el instalador .exe:**
- Las dependencias se instalan automáticamente durante la instalación
- Si hay problemas, ejecuta manualmente: `install-python-deps.bat` desde la carpeta de instalación

---

### ❌ Error: "Invalid or unauthorized Access Token"

**Causa:** Token inválido, expirado o sin permisos correctos.

**Solución:**
1. Genera un **nuevo token**
2. Asegúrate de marcar los permisos:
   - ✅ `chat:read`
   - ✅ `chat:edit`
3. Copia el token completo (incluye `oauth:`)

---

### ❌ La aplicación Electron no inicia

**Si usas el instalador .exe:**
- Verifica que la instalación se completó correctamente
- Revisa los logs del instalador
- Reinstala la aplicación si es necesario

**Si desarrollas desde código:**
```bash
cd electron_app
npm install
npm start
```

**Si persiste el error:**
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### ❌ Problemas con dependencias de Python en el instalador

**Si algunas dependencias no se instalaron automáticamente:**

1. Navega a la carpeta de instalación (ej: `C:\Users\TuUsuario\AppData\Local\Programs\Bot Twitch IA Assistant`)
2. Ejecuta `install-python-deps.bat` como administrador
3. Espera a que termine la instalación
4. Reinicia la aplicación

---

### ❌ Caracteres raros en la consola (Windows)

**Causa:** Problemas de encoding en Windows.

**Solución:** Ya está configurado automáticamente con UTF-8.

Si aún tienes problemas:
```bash
# En PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
python twitch_chat_advanced_electron.py CANAL oauth:TOKEN
```

---

### 🐛 Debugging / Logs de Depuración

**Ver logs en Electron:**
1. Abre DevTools: `Ctrl + Shift + I` (Windows/Linux) o `Cmd + Option + I` (Mac)
2. Ve a la pestaña **Console**
3. Observa el flujo de mensajes:
   ```
   [DEBUG] Mensaje recibido: username: mensaje
   📨 [MAIN] Python stdout data: ...
   📥 [RENDERER] Recibido: ...
   🔍 [PARSER] Parseando: ...
   ✅ [PARSER] Match encontrado: ...
   💬 [PARSER] Agregando mensaje: ...
   ```

**Si no ves `[DEBUG] Mensaje recibido`:**
- El canal no está en vivo
- Token inválido
- Problema de conexión

---

### 📞 ¿Necesitas más ayuda?

1. **Revisa los logs** en DevTools (Ctrl + Shift + I)
2. **Verifica que el canal esté en vivo** en twitch.tv
3. **Genera un nuevo token** si el actual no funciona
4. **Prueba con un canal popular** (auronplay, ibai) para descartar problemas del canal

---

## 🔒 Seguridad del Token

### ⚠️ MUY IMPORTANTE:

- 🔒 **NUNCA compartas** tu token públicamente
- 🔒 **NO lo publiques** en GitHub o redes sociales
- 🔒 **Guárdalo de forma segura** (gestor de contraseñas)
- 🔒 **Revócalo si fue comprometido**

### 🔄 Cómo Revocar un Token:

1. Ve a: https://www.twitch.tv/settings/connections
2. Busca la aplicación autorizada
3. Haz clic en **"Disconnect"**
4. Genera un nuevo token

---

## 💡 Casos de Uso

- 🤖 **Bots de chat personalizados**
- 📊 **Análisis de datos** del chat
- 📝 **Registro de mensajes** para moderación
- 🎮 **Overlays** para OBS o Streamlabs
- 🔔 **Alertas** de mensajes específicos
- 📈 **Estadísticas** de actividad del chat

---

## 🎯 Ventajas del Bot

| Característica | Descripción |
|----------------|-------------|
| 🆓 **Gratuito** | Sin costos ni suscripciones |
| 🚀 **Rápido** | Mensajes en tiempo real |
| 🎨 **Moderno** | Interfaz profesional |
| 📊 **Estadísticas** | En tiempo real |
| 🔧 **Personalizable** | Código abierto |
| 🔒 **Seguro** | Token OAuth oficial |

---

## 📚 Recursos Adicionales

- **TwitchIO Docs**: https://twitchio.dev/
- **Twitch IRC Docs**: https://dev.twitch.tv/docs/irc
- **Token Generator**: https://twitchtokengenerator.com/
- **Twitch Dev Console**: https://dev.twitch.tv/console
- **Electron Docs**: https://www.electronjs.org/

---

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una sugerencia, no dudes en crear un issue o pull request.

---

## ⭐ Créditos

Desarrollado con:
- **Python** + **TwitchIO** (Backend)
- **Electron** + **JavaScript** (Frontend)
- **HTML/CSS** (Interfaz)

---

**¡Disfruta monitoreando chats de Twitch con estilo!** 🎮💬✨
