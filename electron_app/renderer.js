// renderer.js
// Lógica del frontend (interfaz de usuario)

// Elementos del DOM
const channelInput = document.getElementById('channel-input');
const tokenInput = document.getElementById('token-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');

// Vistas
const mainView = document.getElementById('main-view');
const settingsView = document.getElementById('settings-view');
const settingsBtn = document.getElementById('settings-btn');
const backBtn = document.getElementById('back-btn');

// Configuracion
const settingsAudioDevice = document.getElementById('settings-audio-device');
const voiceSelect = document.getElementById('voice-select');
const reloadVoicesBtn = document.getElementById('reload-voices-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const settingsGeminiKey = document.getElementById('settings-gemini-key');
const settingsElevenlabsKey = document.getElementById('settings-elevenlabs-key');
const settingsBotPersonality = document.getElementById('settings-bot-personality');
const geminiUsageCount = document.getElementById('gemini-usage-count');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
const statusIndicator = document.getElementById('status-indicator');
const statusText = statusIndicator.querySelector('.status-text');
const chatDisplay = document.getElementById('chat-display');
const systemLogs = document.getElementById('system-logs');
const clearChatBtn = document.getElementById('clear-chat');
const clearLogsBtn = document.getElementById('clear-logs');

// Contadores de estadísticas
let messageCount = 0;
let commandCount = 0;

// Estado de la aplicación
let isRunning = false;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar datos guardados
  loadMainFormData();
  loadSettings();
  
  // Actualizar contador de uso de Gemini
  updateGeminiUsageDisplay();
  
  // Configurar guardado automático
  setupAutoSave();
  
  // Verificar estado inicial del bot
  const status = await window.electronAPI.checkBotStatus();
  if (status.running) {
    updateUIState(true);
  }

  // Configurar listeners
  setupEventListeners();
  await loadAudioDevices();
  await loadVoices();
  addSystemLog('Aplicacion iniciada correctamente', 'system');
});

// Cargar dispositivos de audio
async function loadAudioDevices() {
  try {
    const devices = await window.electronAPI.listAudioDevices();
    
    if (devices && devices.length > 0) {
      devices.forEach(device => {
        const option1 = document.createElement('option');
        option1.value = device.id;
        option1.textContent = device.name;
        settingsAudioDevice.appendChild(option1);
      });
      addSystemLog(`Cargados ${devices.length} dispositivos de audio`, 'info');
    }
  } catch (error) {
    console.log('Error al cargar dispositivos de audio:', error);
  }
}

// Cargar voces de ElevenLabs
async function loadVoices() {
  try {
    // Obtener la API key guardada
    const savedConfig = localStorage.getItem('botConfig');
    const config = savedConfig ? JSON.parse(savedConfig) : {};
    const elevenlabsKey = config.elevenlabsKey || '';
    
    const voices = await window.electronAPI.listVoices(elevenlabsKey);
    
    // Limpiar opciones existentes
    voiceSelect.innerHTML = '';
    
    if (voices.length > 0) {
      // Agregar voces disponibles
      voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voice_id;
        
        // Crear etiqueta descriptiva
        let label = voice.name;
        
        // Agregar información de género
        if (voice.labels && voice.labels.gender) {
          const gender = voice.labels.gender === 'male' ? 'Masculina' : 'Femenina';
          label += ` (${gender})`;
        }
        
        // Agregar información de acento
        if (voice.labels && voice.labels.accent) {
          label += ` - ${voice.labels.accent}`;
        }
        
        // Agregar información de categoría
        if (voice.category && voice.category !== 'Unknown') {
          const categoryLabels = {
            'default': '[Nueva]',
            'legacy': '[Clásica]',
            'premium': '[Premium]',
            'premade': '[Predefinida]'
          };
          label += ` ${categoryLabels[voice.category] || `[${voice.category}]`}`;
        }
        
        // Agregar información de descripción si está disponible
        if (voice.description && voice.description.length > 0) {
          label += ` - ${voice.description.substring(0, 40)}${voice.description.length > 40 ? '...' : ''}`;
        }
        
        option.textContent = label;
        voiceSelect.appendChild(option);
      });
      
      addSystemLog(`${voices.length} voces de ElevenLabs cargadas`, 'info');
    } else {
      // Fallback a voces básicas si no se pueden cargar
      const fallbackVoices = [
        { value: '21m00Tcm4TlvDq8ikWAM', text: 'Rachel (Femenina) - American' },
        { value: 'EXAVITQu4vr4xnSDxMaL', text: 'Bella (Femenina) - American' },
        { value: 'MF3mGyEYCl7XYWbV9V6O', text: 'Elli (Femenina) - American' },
        { value: 'TxGEqnHWrfWFTfGW9XjX', text: 'Josh (Masculina) - American' },
        { value: 'VR6AewLTigWG4xSOukaG', text: 'Arnold (Masculina) - American' },
        { value: 'pNInz6obpgDQGcFmaJgB', text: 'Adam (Masculina) - American' }
      ];
      
      fallbackVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.value;
        option.textContent = voice.text;
        voiceSelect.appendChild(option);
      });
      
      addSystemLog('Usando voces predeterminadas (API no disponible)', 'warning');
    }
  } catch (error) {
    console.log('Error al cargar voces:', error);
    
    // Fallback a voces básicas
    const fallbackVoices = [
      { value: '21m00Tcm4TlvDq8ikWAM', text: 'Rachel (Femenina) - American' },
      { value: 'EXAVITQu4vr4xnSDxMaL', text: 'Bella (Femenina) - American' },
      { value: 'MF3mGyEYCl7XYWbV9V6O', text: 'Elli (Femenina) - American' },
      { value: 'TxGEqnHWrfWFTfGW9XjX', text: 'Josh (Masculina) - American' },
      { value: 'VR6AewLTigWG4xSOukaG', text: 'Arnold (Masculina) - American' },
      { value: 'pNInz6obpgDQGcFmaJgB', text: 'Adam (Masculina) - American' }
    ];
    
    fallbackVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.value;
      option.textContent = voice.text;
      voiceSelect.appendChild(option);
    });
    
    addSystemLog('Usando voces predeterminadas (Error al cargar)', 'warning');
  }
}

// Cambiar vistas
function showMainView() {
  if (mainView && settingsView) {
    mainView.classList.add('active');
    mainView.classList.remove('hidden');
    settingsView.classList.remove('active');
    settingsView.classList.add('hidden');
  }
}

function showSettingsView() {
  if (mainView && settingsView) {
    mainView.classList.remove('active');
    mainView.classList.add('hidden');
    settingsView.classList.add('active');
    settingsView.classList.remove('hidden');
    loadSettings();
  }
}

// Guardar configuracion
async function saveSettings() {
  const config = {
    audioDevice: settingsAudioDevice.value,
    voice: voiceSelect.value,
    volume: volumeSlider.value,
    geminiKey: settingsGeminiKey.value,
    elevenlabsKey: settingsElevenlabsKey.value,
    botPersonality: settingsBotPersonality.value
  };
  
  localStorage.setItem('botConfig', JSON.stringify(config));
  addSystemLog('Configuracion guardada', 'success');
  
  // Si el bot está corriendo, actualizar API keys, personalidad y dispositivo de audio en tiempo real
  if (isRunning) {
    try {
      const result = await window.electronAPI.updateApiKeys(config.geminiKey, config.elevenlabsKey, config.botPersonality, config.audioDevice);
      if (result.status === 'success') {
        addSystemLog('Configuracion actualizada en tiempo real', 'success');
      }
    } catch (error) {
      console.log('Error al actualizar configuracion:', error);
    }
  }
  
  showMainView();
}

// Mostrar indicador de guardado automático
function showAutoSaveIndicator() {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: var(--success);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  indicator.textContent = '💾 Guardado automático';
  document.body.appendChild(indicator);
  
  // Mostrar indicador
  setTimeout(() => {
    indicator.style.opacity = '1';
  }, 10);
  
  // Ocultar después de 2 segundos
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(indicator);
    }, 300);
  }, 2000);
}

// Guardar datos del formulario principal automáticamente
function saveMainFormData() {
  const mainConfig = {
    channel: channelInput.value,
    token: tokenInput.value,
    voice: voiceSelect.value
  };
  
  localStorage.setItem('mainFormConfig', JSON.stringify(mainConfig));
  showAutoSaveIndicator();
}

// Cargar datos del formulario principal
function loadMainFormData() {
  const savedConfig = localStorage.getItem('mainFormConfig');
  if (savedConfig) {
    const config = JSON.parse(savedConfig);
    channelInput.value = config.channel || '';
    tokenInput.value = config.token || '';
    voiceSelect.value = config.voice || '21m00Tcm4TlvDq8ikWAM';
    
    // Mostrar mensaje si hay datos guardados
    if (config.channel || config.token) {
      addSystemLog('Datos anteriores cargados automáticamente', 'info');
    }
  }
}

// Guardar datos antes de cerrar la aplicación
function saveOnClose() {
  saveMainFormData();
  addSystemLog('Datos guardados antes de cerrar', 'info');
}

// Configurar guardado al cerrar
window.addEventListener('beforeunload', saveOnClose);
window.addEventListener('unload', saveOnClose);

// Guardar automáticamente cuando cambien los valores
function setupAutoSave() {
  // Guardar datos del formulario principal
  channelInput.addEventListener('input', saveMainFormData);
  tokenInput.addEventListener('input', saveMainFormData);
  voiceSelect.addEventListener('change', saveMainFormData);
  
  // Guardar datos de configuración
  settingsAudioDevice.addEventListener('change', () => {
    const config = JSON.parse(localStorage.getItem('botConfig') || '{}');
    config.audioDevice = settingsAudioDevice.value;
    localStorage.setItem('botConfig', JSON.stringify(config));
    showAutoSaveIndicator();
  });
  
  voiceSelect.addEventListener('change', async () => {
    const config = JSON.parse(localStorage.getItem('botConfig') || '{}');
    config.voice = voiceSelect.value;
    localStorage.setItem('botConfig', JSON.stringify(config));
    showAutoSaveIndicator();
    
    // Si el bot está corriendo, cambiar la voz en tiempo real
    if (isRunning) {
      try {
        const result = await window.electronAPI.changeVoice(voiceSelect.value);
        if (result.status === 'success') {
          addSystemLog('Voz cambiada en tiempo real', 'success');
        }
      } catch (error) {
        console.log('Error al cambiar voz:', error);
      }
    }
  });
  
  volumeSlider.addEventListener('input', () => {
    const config = JSON.parse(localStorage.getItem('botConfig') || '{}');
    config.volume = volumeSlider.value;
    localStorage.setItem('botConfig', JSON.stringify(config));
    volumeValue.textContent = `${volumeSlider.value}%`;
    showAutoSaveIndicator();
  });
  
  settingsGeminiKey.addEventListener('input', () => {
    const config = JSON.parse(localStorage.getItem('botConfig') || '{}');
    config.geminiKey = settingsGeminiKey.value;
    localStorage.setItem('botConfig', JSON.stringify(config));
    showAutoSaveIndicator();
  });
  
  settingsElevenlabsKey.addEventListener('input', () => {
    const config = JSON.parse(localStorage.getItem('botConfig') || '{}');
    config.elevenlabsKey = settingsElevenlabsKey.value;
    localStorage.setItem('botConfig', JSON.stringify(config));
    showAutoSaveIndicator();
  });
  
  settingsBotPersonality.addEventListener('input', () => {
    const config = JSON.parse(localStorage.getItem('botConfig') || '{}');
    config.botPersonality = settingsBotPersonality.value;
    localStorage.setItem('botConfig', JSON.stringify(config));
    showAutoSaveIndicator();
  });
}

// Cargar configuracion
function loadSettings() {
  const savedConfig = localStorage.getItem('botConfig');
  if (savedConfig) {
    const config = JSON.parse(savedConfig);
    settingsAudioDevice.value = config.audioDevice || '';
    voiceSelect.value = config.voice || '21m00Tcm4TlvDq8ikWAM';
    volumeSlider.value = config.volume || 70;
    volumeValue.textContent = `${config.volume || 70}%`;
    settingsGeminiKey.value = config.geminiKey || '';
    settingsElevenlabsKey.value = config.elevenlabsKey || '';
    settingsBotPersonality.value = config.botPersonality || '';
  }
}

// Restablecer configuracion
function resetSettings() {
  localStorage.removeItem('botConfig');
  localStorage.removeItem('mainFormConfig');
  settingsAudioDevice.value = '';
  voiceSelect.value = '21m00Tcm4TlvDq8ikWAM';
  volumeSlider.value = 70;
  volumeValue.textContent = '70%';
  settingsGeminiKey.value = '';
  settingsElevenlabsKey.value = '';
  settingsBotPersonality.value = '';
  
  // También limpiar formulario principal
  channelInput.value = '';
  tokenInput.value = '';
  
  addSystemLog('Configuracion restablecida', 'info');
}

// Configurar event listeners
function setupEventListeners() {
  // Botones de navegacion
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      console.log('Botón de configuración clickeado');
      showSettingsView();
    });
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showMainView();
    });
  }
  
  // Guardar configuracion
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      saveSettings();
    });
  }
  
  // Restablecer configuracion
  resetSettingsBtn.addEventListener('click', () => {
    resetSettings();
  });
  
  // Recargar voces
  if (reloadVoicesBtn) {
    reloadVoicesBtn.addEventListener('click', async () => {
      reloadVoicesBtn.disabled = true;
      reloadVoicesBtn.innerHTML = '⏳';
      addSystemLog('Recargando voces...', 'info');
      
      try {
        await loadVoices();
        addSystemLog('Voces recargadas correctamente', 'success');
      } catch (error) {
        addSystemLog('Error al recargar voces', 'error');
      } finally {
        reloadVoicesBtn.disabled = false;
        reloadVoicesBtn.innerHTML = '🔄';
      }
    });
  }
  
  // Actualizar valor del volumen
  volumeSlider.addEventListener('input', (e) => {
    volumeValue.textContent = `${e.target.value}%`;
  });
  
  // Botón de inicio
  startBtn.addEventListener('click', async () => {
    const channel = channelInput.value.trim();
    const token = tokenInput.value.trim();
    
    // Obtener configuracion guardada
    const savedConfig = localStorage.getItem('botConfig');
    const audioDevice = savedConfig ? JSON.parse(savedConfig).audioDevice : '';
    
    if (!channel) {
      addSystemLog('Por favor, ingresa un nombre de canal', 'error');
      channelInput.focus();
      return;
    }

    // Validar que el token sea proporcionado (REQUERIDO)
    if (!token) {
      addSystemLog('Token OAuth es REQUERIDO para usar el bot', 'error');
      addSystemLog('Obten uno en: https://twitchtokengenerator.com/', 'info');
      tokenInput.focus();
      return;
    }

    // Validar formato del token
    if (!token.startsWith('oauth:')) {
      addSystemLog('El token debe empezar con "oauth:"', 'error');
      addSystemLog('Formato correcto: oauth:xxxxxxxxxxxxx', 'info');
      tokenInput.focus();
      return;
    }

    // Validar longitud minima del token
    if (token.length < 15) {
      addSystemLog('Token invalido. Debe tener al menos 15 caracteres', 'error');
      tokenInput.focus();
      return;
    }

    // Deshabilitar botón mientras se inicia
    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="btn-icon">⏳</span> Iniciando...';

    try {
      // Obtener configuración guardada
      const savedConfig = localStorage.getItem('botConfig');
      const config = savedConfig ? JSON.parse(savedConfig) : {};
      const voice = config.voice || '21m00Tcm4TlvDq8ikWAM';
      const geminiKey = config.geminiKey || '';
      const elevenlabsKey = config.elevenlabsKey || '';
      const botPersonality = config.botPersonality || '';
      
      const result = await window.electronAPI.startBot(channel, token, audioDevice, voice, geminiKey, elevenlabsKey, botPersonality);
      
      if (result.status === 'success') {
        addSystemLog(`Bot conectado al canal: ${channel}`, 'success');
        addSystemLog('Autenticado con token OAuth', 'success');
        if (audioDevice) {
          addSystemLog(`Dispositivo de audio: ID ${audioDevice}`, 'info');
        }
        if (geminiKey) {
          addSystemLog('IA de Gemini activada', 'success');
        }
        if (elevenlabsKey) {
          addSystemLog('TTS de ElevenLabs activado', 'success');
        }
        updateUIState(true);
        clearWelcomeMessage();
      } else {
        addSystemLog(`Error: ${result.message}`, 'error');
        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="btn-icon">▶️</span> Iniciar Bot';
      }
    } catch (error) {
      addSystemLog(`Error al iniciar el bot: ${error}`, 'error');
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
        addSystemLog('Bot detenido correctamente', 'info');
        updateUIState(false);
      } else {
        addSystemLog(`Error: ${result.message}`, 'error');
        stopBtn.disabled = false;
        stopBtn.innerHTML = '<span class="btn-icon">⏹️</span> Detener Bot';
      }
    } catch (error) {
      addSystemLog(`Error al detener el bot: ${error}`, 'error');
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
    addSystemLog('Chat limpiado', 'info');
  });

  // Limpiar logs
  clearLogsBtn.addEventListener('click', () => {
    systemLogs.innerHTML = '';
    addSystemLog('Logs limpiados', 'system');
  });

  // Escuchar salida del bot
  window.electronAPI.onBotOutput((data) => {
    processBotOutput(data);
  });

  // Escuchar cuando el bot se detiene
  window.electronAPI.onBotStopped(() => {
    updateUIState(false);
    addSystemLog('El bot se ha detenido', 'info');
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

  // Manejar respuesta de IA
  if (type === 'ia_response') {
    handleIAResponse(data);
    return;
  }

  // Agregar a logs del sistema
  addSystemLog(message, type);

  // Intentar parsear mensajes de chat
  if (type === 'info' && message.includes(':')) {
    // Ignorar mensajes del sistema
    const systemPatterns = /^(Conectando|Conectado|═|║|╔|╚|Leyendo|Deteniendo|Bot|Hora|Modo|📊|🤖|🕐|\[DEBUG\]|\[IA\])/;
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

// Manejar respuestas de IA
function handleIAResponse(data) {
  const { username, question, response } = data;
  
  // Incrementar contador de uso de Gemini
  incrementGeminiUsage();
  
  // Mostrar en logs del sistema con formato especial
  const logEl = document.createElement('div');
  logEl.className = 'log-entry log-ia';
  logEl.style.borderLeft = '3px solid #9b59b6';
  logEl.style.backgroundColor = 'rgba(155, 89, 182, 0.1)';
  
  const timestamp = new Date().toLocaleTimeString();
  logEl.innerHTML = `
    <div style="font-weight: bold; color: #9b59b6;">[${timestamp}] 🤖 IA RESPUESTA</div>
    <div style="margin-left: 1rem; margin-top: 0.25rem;">
      <div style="color: #8e44ad;">👤 ${username} preguntó: ${question}</div>
      <div style="color: #9b59b6; margin-top: 0.25rem;">💬 Respuesta: ${response}</div>
    </div>
  `;
  
  systemLogs.appendChild(logEl);
  systemLogs.scrollTop = systemLogs.scrollHeight;
  
  // También agregar al chat como mensaje especial
  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message';
  messageEl.style.backgroundColor = 'rgba(155, 89, 182, 0.1)';
  messageEl.style.borderLeft = '3px solid #9b59b6';
  messageEl.style.padding = '0.5rem';
  
  messageEl.innerHTML = `
    <div style="color: #9b59b6; font-weight: bold;">🤖 IA respondiendo a ${username}:</div>
    <div style="color: #ecf0f1; margin-top: 0.25rem;">${response}</div>
  `;
  
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
  document.getElementById('cmd-count').textContent = commandCount;
}

// Limpiar mensaje de bienvenida
function clearWelcomeMessage() {
  const welcomeMsg = chatDisplay.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }
}

// Funciones para manejar el contador de uso de Gemini
function incrementGeminiUsage() {
  const today = new Date().toDateString();
  const usageData = JSON.parse(localStorage.getItem('geminiUsage') || '{}');
  
  if (!usageData[today]) {
    usageData[today] = 0;
  }
  
  usageData[today]++;
  localStorage.setItem('geminiUsage', JSON.stringify(usageData));
  updateGeminiUsageDisplay();
}

function updateGeminiUsageDisplay() {
  if (!geminiUsageCount) return;
  
  const today = new Date().toDateString();
  const usageData = JSON.parse(localStorage.getItem('geminiUsage') || '{}');
  const todayUsage = usageData[today] || 0;
  
  geminiUsageCount.textContent = todayUsage;
  
  // Cambiar color según el uso
  const usageCounter = document.getElementById('gemini-usage-counter');
  if (usageCounter) {
    if (todayUsage >= 45) {
      usageCounter.style.color = '#e74c3c'; // Rojo - cerca del límite
    } else if (todayUsage >= 35) {
      usageCounter.style.color = '#f39c12'; // Naranja - moderado
    } else {
      usageCounter.style.color = 'var(--text-secondary)'; // Normal
    }
  }
}

function resetGeminiUsage() {
  localStorage.removeItem('geminiUsage');
  updateGeminiUsageDisplay();
}

// Función de utilidad para formatear tiempo
function formatTime(date) {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

