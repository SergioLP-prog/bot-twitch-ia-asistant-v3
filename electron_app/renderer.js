// renderer.js
// Lógica del frontend (interfaz de usuario)

// Elementos del DOM
const channelInput = document.getElementById('channel-input');
const tokenInput = document.getElementById('token-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusIndicator = document.getElementById('status-indicator');
const statusText = statusIndicator.querySelector('.status-text');
const chatDisplay = document.getElementById('chat-display');
const systemLogs = document.getElementById('system-logs');
const clearChatBtn = document.getElementById('clear-chat');
const clearLogsBtn = document.getElementById('clear-logs');

// Contadores de estadísticas
let messageCount = 0;
let userCount = 0;
let commandCount = 0;
const uniqueUsers = new Set();

// Estado de la aplicación
let isRunning = false;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar estado inicial del bot
  const status = await window.electronAPI.checkBotStatus();
  if (status.running) {
    updateUIState(true);
  }

  // Configurar listeners
  setupEventListeners();
  
  addSystemLog('🚀 Aplicación iniciada correctamente', 'system');
});

// Configurar event listeners
function setupEventListeners() {
  // Botón de inicio
  startBtn.addEventListener('click', async () => {
    const channel = channelInput.value.trim();
    const token = tokenInput.value.trim();
    
    if (!channel) {
      addSystemLog('❌ Por favor, ingresa un nombre de canal', 'error');
      channelInput.focus();
      return;
    }

    // Validar que el token sea proporcionado (REQUERIDO)
    if (!token) {
      addSystemLog('❌ Token OAuth es REQUERIDO para usar el bot', 'error');
      addSystemLog('📖 Obtén uno en: https://twitchtokengenerator.com/', 'info');
      tokenInput.focus();
      return;
    }

    // Validar formato del token
    if (!token.startsWith('oauth:')) {
      addSystemLog('❌ El token debe empezar con "oauth:"', 'error');
      addSystemLog('📝 Formato correcto: oauth:xxxxxxxxxxxxx', 'info');
      tokenInput.focus();
      return;
    }

    // Validar longitud mínima del token
    if (token.length < 15) {
      addSystemLog('❌ Token inválido. Debe tener al menos 15 caracteres', 'error');
      tokenInput.focus();
      return;
    }

    // Deshabilitar botón mientras se inicia
    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="btn-icon">⏳</span> Iniciando...';

    try {
      const result = await window.electronAPI.startBot(channel, token);
      
      if (result.status === 'success') {
        addSystemLog(`✅ Bot conectado al canal: ${channel}`, 'success');
        addSystemLog('🔑 Autenticado con token OAuth', 'success');
        updateUIState(true);
        clearWelcomeMessage();
      } else {
        addSystemLog(`❌ Error: ${result.message}`, 'error');
        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="btn-icon">▶️</span> Iniciar Bot';
      }
    } catch (error) {
      addSystemLog(`❌ Error al iniciar el bot: ${error}`, 'error');
      startBtn.disabled = false;
      startBtn.innerHTML = '<span class="btn-icon">▶️</span> Iniciar Bot';
    }
  });

  // Botón de detener
  stopBtn.addEventListener('click', async () => {
    stopBtn.disabled = true;
    stopBtn.innerHTML = '<span class="btn-icon">⏳</span> Deteniendo...';

    try {
      const result = await window.electronAPI.stopBot();
      
      if (result.status === 'success') {
        addSystemLog('⏹️ Bot detenido correctamente', 'info');
        updateUIState(false);
      } else {
        addSystemLog(`❌ Error: ${result.message}`, 'error');
        stopBtn.disabled = false;
        stopBtn.innerHTML = '<span class="btn-icon">⏹️</span> Detener Bot';
      }
    } catch (error) {
      addSystemLog(`❌ Error al detener el bot: ${error}`, 'error');
      stopBtn.disabled = false;
      stopBtn.innerHTML = '<span class="btn-icon">⏹️</span> Detener Bot';
    }
  });

  // Enter en los inputs
  channelInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !startBtn.disabled) {
      startBtn.click();
    }
  });

  tokenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !startBtn.disabled) {
      startBtn.click();
    }
  });

  // Limpiar chat
  clearChatBtn.addEventListener('click', () => {
    chatDisplay.innerHTML = '';
    addSystemLog('🗑️ Chat limpiado', 'info');
  });

  // Limpiar logs
  clearLogsBtn.addEventListener('click', () => {
    systemLogs.innerHTML = '';
    addSystemLog('🗑️ Logs limpiados', 'system');
  });

  // Escuchar salida del bot
  window.electronAPI.onBotOutput((data) => {
    processBotOutput(data);
  });

  // Escuchar cuando el bot se detiene
  window.electronAPI.onBotStopped(() => {
    updateUIState(false);
    addSystemLog('⚠️ El bot se ha detenido', 'info');
  });
}

// Actualizar estado de la UI
function updateUIState(running) {
  isRunning = running;

  if (running) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    channelInput.disabled = true;
    statusIndicator.classList.add('connected');
    statusText.textContent = 'Conectado';
    startBtn.innerHTML = '<span class="btn-icon">▶️</span> Iniciar Bot';
  } else {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    channelInput.disabled = false;
    statusIndicator.classList.remove('connected', 'error');
    statusText.textContent = 'Desconectado';
    stopBtn.innerHTML = '<span class="btn-icon">⏹️</span> Detener Bot';
  }
}

// Procesar salida del bot
function processBotOutput(data) {
  const { type, message } = data;

  // Agregar a logs del sistema
  addSystemLog(message, type);

  // Intentar parsear mensajes de chat
  if (type === 'info' && message.includes(':')) {
    // Ignorar mensajes del sistema
    const systemPatterns = /^(Conectando|Conectado|═|║|╔|╚|Leyendo|Deteniendo|Bot|Hora|Modo|📊|🤖|🕐|\[DEBUG\])/;
    if (!systemPatterns.test(message)) {
      parseChatMessage(message);
    }
  }
}

// Parsear mensajes de chat
function parseChatMessage(text) {
  // Patrón mejorado para detectar mensajes de chat
  // Formato: [badges] (color) username: message
  // También maneja: 🤖 [badges] username: message
  const chatPattern = /^(?:🤖\s*)?(?:⭐\s*)?(?:\[([^\]]+)\]\s*)?(?:\(([^)]+)\)\s*)?([^:]+):\s*(.+)$/;
  const match = text.match(chatPattern);

  if (match) {
    const [, badges, color, username, message] = match;
    
    // Limpiar
    const cleanUsername = username.trim();
    const cleanMessage = message.trim();

    // Validación básica
    if (!cleanUsername || cleanUsername.length > 50) {
      return;
    }

    // Actualizar estadísticas
    messageCount++;
    if (!uniqueUsers.has(cleanUsername)) {
      uniqueUsers.add(cleanUsername);
      userCount++;
    }
    if (cleanMessage.startsWith('!')) {
      commandCount++;
    }

    updateStats();

    // Determinar si es comando
    const isCommand = cleanMessage.startsWith('!');
    
    // Agregar mensaje al chat
    addChatMessage(cleanUsername, cleanMessage, badges, color, isCommand);
  }
}

// Agregar mensaje al chat
function addChatMessage(username, message, badges = '', color = '', isCommand = false) {
  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message';
  
  if (isCommand) {
    messageEl.classList.add('command');
  }

  const authorEl = document.createElement('span');
  authorEl.className = 'message-author';
  authorEl.textContent = username;
  if (color) {
    authorEl.style.color = color;
  }

  const textEl = document.createElement('span');
  textEl.className = 'message-text';
  textEl.textContent = message;

  messageEl.appendChild(authorEl);
  messageEl.appendChild(document.createTextNode(': '));
  messageEl.appendChild(textEl);

  // Agregar metadatos si existen
  if (badges) {
    const metaEl = document.createElement('div');
    metaEl.className = 'message-meta';
    
    const badgeEl = document.createElement('span');
    badgeEl.className = 'message-badge';
    badgeEl.textContent = badges;
    metaEl.appendChild(badgeEl);
    
    // Agregar indicador de comando
    if (isCommand) {
      const commandEl = document.createElement('span');
      commandEl.className = 'message-command-indicator';
      commandEl.textContent = '🤖 Comando';
      metaEl.appendChild(commandEl);
    }
    
    messageEl.appendChild(metaEl);
  } else if (isCommand) {
    // Solo indicador de comando sin badges
    const metaEl = document.createElement('div');
    metaEl.className = 'message-meta';
    
    const commandEl = document.createElement('span');
    commandEl.className = 'message-command-indicator';
    commandEl.textContent = '🤖 Comando';
    metaEl.appendChild(commandEl);
    
    messageEl.appendChild(metaEl);
  }

  chatDisplay.appendChild(messageEl);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Agregar log del sistema
function addSystemLog(message, type = 'info') {
  const logEl = document.createElement('div');
  logEl.className = `log-entry log-${type}`;

  const timeEl = document.createElement('span');
  timeEl.className = 'log-time';
  timeEl.textContent = `[${new Date().toLocaleTimeString()}]`;

  const messageEl = document.createElement('span');
  messageEl.className = 'log-message';
  messageEl.textContent = message;

  logEl.appendChild(timeEl);
  logEl.appendChild(messageEl);

  systemLogs.appendChild(logEl);
  systemLogs.scrollTop = systemLogs.scrollHeight;

  // Limitar número de logs (máximo 100)
  while (systemLogs.children.length > 100) {
    systemLogs.removeChild(systemLogs.firstChild);
  }
}

// Actualizar estadísticas
function updateStats() {
  document.getElementById('msg-count').textContent = messageCount;
  document.getElementById('user-count').textContent = userCount;
  document.getElementById('cmd-count').textContent = commandCount;
}

// Limpiar mensaje de bienvenida
function clearWelcomeMessage() {
  const welcomeMsg = chatDisplay.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }
}

// Función de utilidad para formatear tiempo
function formatTime(date) {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

