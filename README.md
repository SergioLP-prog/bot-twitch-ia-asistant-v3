# 🤖 Bot Avanzado de Twitch - Interfaz Electron

Bot profesional de Twitch con interfaz gráfica moderna para monitorear chats en tiempo real.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias Python
pip install twitchio google-genai

# 2. Configurar API Key de Gemini (opcional, para funcionalidad IA)
# Edita twitch_chat_advanced_electron.py línea 89 con tu API Key

# 3. Instalar dependencias Electron
cd electron_app
npm install

# 4. Iniciar aplicación
npm start
```

**⚠️ IMPORTANTE:** Necesitas un **Token OAuth** para usar el bot → [Obtener aquí](https://twitchtokengenerator.com/)

**🤖 NUEVO - IA Opcional:** Para usar el comando `!IA`, configura tu API Key de Gemini → [Obtener aquí](https://aistudio.google.com/app/apikey)

---

## 📋 Requisitos

- **Python 3.7+** → [Descargar](https://www.python.org/)
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

### Paso 2: Guardar Token
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
2. Pega tu **Token OAuth** en el campo correspondiente
3. Haz clic en **"Iniciar Bot"**
4. ✅ ¡Verás los mensajes en tiempo real!

### Terminal

```bash
python twitch_chat_advanced_electron.py CANAL oauth:TU_TOKEN
```

**Ejemplo:**
```bash
python twitch_chat_advanced_electron.py auronplay oauth:xxxxxxxxxxxxxxxxxxxxx
```

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
│   └── README.md              # Documentación técnica
├── twitch_chat_advanced_electron.py  # Bot de Python
├── requirements.txt           # Dependencias Python
├── README.md                  # Este archivo
└── LICENSE                    # Licencia
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

**Causa:** Formato de token incorrecto.

**Solución:**
```
❌ Incorrecto: kchmfz0tyso8p0h5mc4gbgdswslj22
✅ Correcto:   oauth:kchmfz0tyso8p0h5mc4gbgdswslj22
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

### ❌ "TwitchIO no está instalado"

**Causa:** Falta instalar la librería TwitchIO.

**Solución:**
```bash
pip install twitchio
# o
pip install -r requirements.txt
```

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

**Causa:** Dependencias de Node no instaladas.

**Solución:**
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
