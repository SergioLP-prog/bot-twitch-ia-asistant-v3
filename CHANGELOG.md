# 📋 Changelog - Bot IA v3

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [v3.1.0] - 2025-10-19

### 🧠 NUEVO - Sistema de Memoria por Usuario

#### ✨ Características Agregadas

**Sistema de Memoria Contextual**
- Implementado sistema de memoria que permite al bot recordar conversaciones con cada usuario durante la sesión
- Cada usuario tiene su propia memoria independiente (hasta 10 interacciones)
- La memoria se utiliza como contexto en las respuestas de la IA para conversaciones más naturales
- Reseteo automático al apagar o reiniciar el bot (privacidad por diseño)
- Almacenamiento en memoria RAM (no persiste en disco)

**Nuevos Comandos**
- `!memoria` - Permite a cualquier usuario ver cuántas interacciones tiene en memoria
- `!resetmemoria` - Permite a moderadores resetear toda la memoria del bot
- `!resetmemoria <usuario>` - Permite a moderadores resetear la memoria de un usuario específico
- `!memstats` - Permite a moderadores ver estadísticas generales de memoria

**Logs del Sistema**
- `[MEMORIA] Sistema de memoria de usuario activado` - Al iniciar el bot
- `[MEMORIA] Guardada interacción para <usuario> (N en memoria)` - Al guardar una interacción
- `[MEMORIA] Usando contexto de memoria para <usuario>` - Al usar memoria en una respuesta
- `[MEMORIA] Memoria de <usuario> eliminada` - Al resetear memoria de un usuario
- `[MEMORIA] Memoria de todos los usuarios eliminada` - Al resetear toda la memoria

#### 📄 Documentación Agregada

**Actualizaciones de Documentación**
- `README.md` actualizado con sección "🧠 Sistema de Memoria"
- Agregados 4 nuevos comandos a la lista de comandos
- Agregada sección de características del sistema de memoria
- Ejemplos de uso incluidos en README

**Nuevo Archivo**
- `CHANGELOG.md` - Este archivo de registro de cambios

#### 🔧 Cambios Técnicos

**Archivo `chatbot.py`**
- **Línea 127-128:** Agregado diccionario `user_memory` y variable `max_memory_per_user`
- **Líneas 513-524:** Nuevo método `_get_user_memory_context()` para obtener contexto de memoria
- **Líneas 526-541:** Nuevo método `_save_to_memory()` para guardar interacciones
- **Líneas 543-553:** Nuevo método `clear_user_memory()` para limpiar memoria
- **Líneas 555-560:** Nuevo método `get_memory_stats()` para estadísticas
- **Líneas 562-597:** Modificado `get_gemini_response()` para incluir contexto de memoria
- **Línea 321:** Agregado log al iniciar indicando activación del sistema de memoria
- **Líneas 777-811:** Agregados comandos `!memoria`, `!resetmemoria`, y `!memstats`

#### 💡 Beneficios

**Para Usuarios**
- Conversaciones más naturales y contextuales con la IA
- El bot recuerda información personal y preferencias durante la sesión
- Respuestas más relevantes y personalizadas
- Experiencia conversacional mejorada

**Para Streamers**
- Mayor engagement con la audiencia
- Interacciones más dinámicas e interesantes
- Control total sobre la memoria (resetear cuando sea necesario)
- Estadísticas de uso de memoria

**Para Desarrolladores**
- Código bien documentado y modular
- Fácil de extender o modificar
- Sin dependencias adicionales
- Estructura de datos simple (Dict + List)

#### 🔒 Privacidad

- ✅ Memoria solo en RAM (no persiste en disco)
- ✅ Reseteo automático al cerrar el bot
- ✅ Aislamiento completo entre usuarios
- ✅ Control de moderadores sobre la memoria
- ✅ Sin bases de datos ni archivos de logs persistentes
- ✅ Total transparencia en el manejo de datos

#### ⚙️ Configuración

**Parámetros Configurables**
```python
self.max_memory_per_user = 10  # Máximo de interacciones a recordar
```

**Valores recomendados:**
- 5 interacciones: Para chats muy activos (menor uso de API)
- 10 interacciones: Valor por defecto balanceado
- 20 interacciones: Para conversaciones más profundas (mayor uso de API)

#### 📊 Impacto en Rendimiento

**Memoria RAM**
- Por usuario: ~500 bytes - 2 KB
- 100 usuarios activos: ~50-200 KB
- Impacto: Mínimo

**Consumo de API de Gemini**
- Sin memoria: ~50-100 caracteres por solicitud
- Con memoria (10 interacciones): ~300-500 caracteres por solicitud
- Impacto: 3-5x más caracteres (pero respuestas mucho mejores)

#### 🧪 Testing

**Escenarios Probados**
- ✅ Memoria de usuario único
- ✅ Memoria de múltiples usuarios simultáneos
- ✅ Límite de 10 interacciones
- ✅ Reseteo de memoria individual
- ✅ Reseteo de memoria completa
- ✅ Comandos de visualización
- ✅ Logs del sistema
- ✅ Integración con Gemini API

#### 🚀 Próximas Mejoras Planificadas

- [ ] Persistencia opcional en SQLite
- [ ] Sistema de similitud de preguntas (fuzzy matching)
- [ ] Exportar/importar memoria en JSON
- [ ] Análisis de sentimiento en conversaciones
- [ ] Resumen automático de conversaciones largas
- [ ] Configuración de límite de memoria desde la interfaz

---

## [v3.0.0] - 2025-10-17

### 🎵 Mejoras de Audio y Manejo de Errores

#### ✨ Agregado

**Sistema de Audio Mejorado**
- Implementado sistema inteligente de reproducción con sounddevice + pydub
- Soporte para selección de dispositivos de audio específicos
- Fallback automático a pygame si sounddevice falla
- Actualización de dispositivo de audio en tiempo real (sin reiniciar el bot)

**Manejo de Errores de Gemini API**
- Detección y mensajes informativos para error 429 (RESOURCE_EXHAUSTED - cuota diaria agotada)
- Detección y mensajes informativos para error 401 (UNAUTHENTICATED - API key inválida)
- Detección y mensajes informativos para error 403 (PERMISSION_DENIED - sin permisos)
- Mensajes de ayuda con enlaces a documentación oficial

**Contador de Uso de Gemini**
- Contador visual de solicitudes de IA en tiempo real
- Indicador de límite diario (50 solicitudes en plan gratuito)
- Cambio de color según proximidad al límite (verde → naranja → rojo)
- Almacenamiento local del contador por día
- Reseteo automático diario

**Información de Límites**
- Sección informativa sobre límites de cuota de Gemini en la interfaz
- Enlaces directos a documentación de rate limits
- Contador de uso diario visible en configuración

#### 🔧 Cambiado

**Archivos Modificados**
- `electron_app/index.html` - Agregada sección de contador de uso de Gemini
- `electron_app/main.js` - Mejorado manejo de actualización de dispositivo de audio
- `electron_app/preload.js` - Ajustado para nuevas funciones
- `electron_app/renderer.js` - Implementado sistema de contador de uso
- `electron_app/style.css` - Estilos para indicadores de uso

**Mejoras de UX**
- Mensajes más informativos cuando se alcanza la cuota de API
- Indicadores visuales de estado de servicios
- Feedback inmediato al cambiar configuraciones

#### 🐛 Corregido

- Problema de dispositivos de audio (usaba archivo incorrecto)
- Mejora en la reproducción de TTS con dispositivos específicos
- Manejo correcto de errores de cuota de Gemini

#### 📦 Dependencias

- Agregado `numpy` a requirements.txt para soporte de sounddevice
- Actualizado `pydub` para mejor manejo de audio

---

## [v2.0.0] - 2025-10-17

### 🔧 Refactor Completo - API Keys Configurables

#### ✨ Agregado

**Sistema de Configuración Dinámica**
- API Keys configurables desde la interfaz (sin hardcode)
- Actualización en tiempo real de configuraciones (sin reiniciar el bot)
- Almacenamiento local de configuraciones (localStorage)
- Guardado automático de campos al escribir

**Nuevas Configuraciones**
- Gemini API Key configurable
- ElevenLabs API Key configurable
- Personalidad del bot configurable
- Dispositivo de audio configurable
- Configuración de voz de ElevenLabs

**Interfaz de Configuración**
- Vista dedicada de configuración
- Sección de Audio y Voz
- Sección de API Keys
- Sección de Personalidad de la IA
- Botones de guardar y restablecer

**Sistema de Voces Mejorado**
- Carga dinámica de voces desde ElevenLabs API
- Botón de recarga de voces
- Información detallada de cada voz (género, acento, categoría)
- Fallback a voces predefinidas si falla la API

**Guardado Automático**
- Todos los campos se guardan automáticamente al cambiar
- Indicador visual de guardado
- Persistencia de datos entre sesiones
- Recuperación automática al reabrir

#### 🔧 Cambiado

**Estructura del Proyecto**
- Renombrado `twitch_chat_advanced_electron.py` → `chatbot.py`
- Creado `config.example.json` para configuración de ejemplo
- Eliminado hardcode de API keys del código

**Mejoras de Código**
- Métodos para actualizar API keys en tiempo real
- Métodos para cambiar voz sin reiniciar
- Métodos para actualizar personalidad del bot
- Sistema modular de configuración

**Interfaz Electron**
- Navegación entre vista principal y configuración
- Diseño mejorado de formularios
- Mejor organización de controles
- Tooltips y ayudas contextuales

#### ❌ Eliminado

- `GUIA_GITHUB.md` - Movido a documentación externa
- `LICENSE` - Simplificado
- API keys hardcodeadas en el código

#### 📄 Documentación

- Actualizado README con instrucciones de configuración
- Agregadas secciones sobre API keys
- Mejorada documentación de instalación

---

## [v1.0.0] - 2025-10-17

### 🎉 Lanzamiento Inicial

#### ✨ Características Principales

**Bot de Twitch**
- Conexión a canales de Twitch usando TwitchIO
- Lectura de mensajes en tiempo real
- Sistema de autenticación con OAuth token
- Detección de badges (MOD, SUB, VIP)
- Colores de usuario de Twitch
- Filtrado de usuarios (bloquear/destacar)

**Integración con IA**
- Comando `!IA` para interactuar con Google Gemini
- Respuestas inteligentes usando Gemini AI
- Procesamiento de lenguaje natural
- Límite de 150 caracteres por respuesta

**Text-to-Speech (TTS)**
- Integración con ElevenLabs para síntesis de voz
- Reproducción de respuestas de IA con voz
- Soporte para múltiples voces
- Control de volumen

**Interfaz Electron**
- Aplicación de escritorio moderna
- Tema oscuro inspirado en Twitch
- Visualización de chat en tiempo real
- Panel de logs del sistema
- Estadísticas en vivo (mensajes, comandos)

**Comandos del Bot**
- `!stats` - Mostrar estadísticas del chat
- `!block <usuario>` - Bloquear un usuario
- `!unblock <usuario>` - Desbloquear un usuario
- `!highlight <usuario>` - Destacar un usuario
- `!IA <pregunta>` - Interactuar con la IA

**Sistema de Logs**
- Logs de sistema en tiempo real
- Timestamps en todos los mensajes
- Diferentes tipos de log (info, error, success, warning)
- Botón de limpiar logs
- Límite de 100 logs (auto-limpieza)

#### 🛠️ Tecnologías Utilizadas

**Backend (Python)**
- `twitchio` - Cliente de Twitch IRC
- `google-genai` - Integración con Gemini AI
- `pygame` - Reproducción de audio
- `requests` - Peticiones HTTP
- `sounddevice` - Manejo de dispositivos de audio
- `pydub` - Procesamiento de audio

**Frontend (Electron)**
- `electron` v27.0.0 - Framework de aplicación de escritorio
- HTML5 + CSS3 - Interfaz de usuario
- JavaScript (ES6+) - Lógica del frontend

#### 📁 Estructura del Proyecto

```
bot_ia_v3/
├── electron_app/
│   ├── index.html           # Interfaz HTML
│   ├── main.js              # Proceso principal de Electron
│   ├── renderer.js          # Lógica del frontend
│   ├── preload.js           # Script de precarga
│   ├── style.css            # Estilos CSS
│   ├── package.json         # Dependencias de Node.js
│   ├── install.bat          # Script de instalación (Windows)
│   ├── install.sh           # Script de instalación (Linux/Mac)
│   ├── start.bat            # Script de inicio (Windows)
│   └── start.sh             # Script de inicio (Linux/Mac)
├── twitch_chat_advanced_electron.py  # Bot principal
├── requirements.txt         # Dependencias de Python
└── README.md                # Documentación
```

#### 🔐 Seguridad

- Token OAuth requerido para conexión a Twitch
- Validación de formato de token
- Validación de longitud mínima
- Mensajes de error informativos

#### 📊 Características de la Interfaz

**Panel de Control**
- Input para nombre del canal
- Input para token OAuth
- Botones de iniciar/detener bot
- Información de requisitos
- Indicador de estado (conectado/desconectado)

**Visualización de Chat**
- Mensajes en tiempo real
- Indicadores de comandos
- Colores de usuario
- Timestamps
- Scroll automático
- Mensaje de bienvenida

**Estadísticas en Vivo**
- Contador de mensajes
- Contador de comandos
- Actualización en tiempo real

**Logs del Sistema**
- Diferentes tipos de mensajes
- Timestamps
- Botón de limpiar
- Auto-scroll

#### 🚀 Scripts de Instalación

**Windows**
- `install.bat` - Instala dependencias de Node.js
- `start.bat` - Inicia la aplicación

**Linux/Mac**
- `install.sh` - Instala dependencias de Node.js
- `start.sh` - Inicia la aplicación

#### 📝 Documentación Inicial

- README.md con guía de instalación
- Guía de obtención de token OAuth
- Requisitos del sistema
- Ejemplos de uso
- FAQ (Preguntas Frecuentes)
- Solución de problemas

---

## 📊 Resumen de Evolución

### Estadísticas Generales

| Versión | Fecha | Archivos | Características Principales |
|---------|-------|----------|---------------------------|
| v1.0.0 | 2025-10-17 | 19 archivos | Bot básico + Interfaz Electron |
| v2.0.0 | 2025-10-17 | 11 modificados | API Keys configurables + Refactor |
| v3.0.0 | 2025-10-17 | 5 modificados | Mejoras de audio + Errores Gemini |
| v3.1.0 | 2025-10-19 | 5 modificados + 1 nuevo | Sistema de Memoria |

### Líneas de Código

| Versión | Líneas Agregadas | Líneas Eliminadas | Total Neto |
|---------|-----------------|-------------------|------------|
| v1.0.0 | +3,712 | 0 | +3,712 |
| v2.0.0 | +1,780 | -1,514 | +266 |
| v3.0.0 | +128 | -17 | +111 |
| v3.1.0 | ~+300 | 0 | +300 |

### Evolución de Características

**v1.0.0 → v2.0.0**
- ✨ Configuración dinámica
- ✨ Guardado automático
- 🔧 Eliminación de hardcode
- 🔧 Refactor de código

**v2.0.0 → v3.0.0**
- ✨ Audio mejorado
- ✨ Contador de uso de API
- 🔧 Manejo de errores mejorado

**v3.0.0 → v3.1.0**
- ✨ Sistema de memoria
- ✨ Comandos de memoria
- 🔧 Conversaciones contextuales

---

## 🎯 Tipos de Cambios

### Leyenda

- **✨ Agregado** - Para nuevas características
- **🔧 Cambiado** - Para cambios en funcionalidades existentes
- **⚠️ Obsoleto** - Para características que serán eliminadas
- **❌ Eliminado** - Para características eliminadas
- **🐛 Corregido** - Para corrección de bugs
- **🔒 Seguridad** - Para vulnerabilidades corregidas
- **📄 Documentación** - Para cambios en documentación
- **🎨 Estilo** - Para cambios de formato/estilo
- **⚡ Rendimiento** - Para mejoras de rendimiento
- **🧪 Testing** - Para pruebas

---

## 📞 Información del Proyecto

- **Repositorio:** bot_ia_v3
- **Autor:** Sergio
- **Lenguaje:** Python + JavaScript
- **Framework:** Electron + TwitchIO
- **Licencia:** MIT (implícito)

---

**Versión actual:** v3.1.0 - Sistema de Memoria Implementado ✅

**Última actualización:** 2025-10-19
