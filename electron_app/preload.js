// preload.js
// Expone APIs seguras al renderer

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Iniciar el bot con el canal, token, dispositivo de audio, voz, volumen, API keys, personalidad y comando de IA
  startBot: (channel, token, audioDevice, voice, volume, geminiKey, elevenlabsKey, botPersonality, iaCommand) => ipcRenderer.invoke('start-bot', channel, token, audioDevice, voice, volume, geminiKey, elevenlabsKey, botPersonality, iaCommand),

  // Listar dispositivos de audio
  listAudioDevices: () => ipcRenderer.invoke('list-audio-devices'),

  // Listar voces de ElevenLabs
  listVoices: (elevenlabsKey) => ipcRenderer.invoke('list-voices', elevenlabsKey),

  // Detener el bot
  stopBot: () => ipcRenderer.invoke('stop-bot'),

  // Verificar estado del bot
  checkBotStatus: () => ipcRenderer.invoke('check-bot-status'),

  // Verificar dependencias
  checkDependencies: () => ipcRenderer.invoke('check-dependencies'),

  // Instalar dependencias
  installDependencies: () => ipcRenderer.invoke('install-dependencies'),

  // Escuchar progreso de instalación
  onInstallProgress: (callback) => {
    ipcRenderer.on('install-progress', (event, data) => {
      callback(data);
    });
  },

  // Cambiar voz en tiempo real
  changeVoice: (voiceId) => ipcRenderer.invoke('change-voice', voiceId),

  // Actualizar API Keys, personalidad, dispositivo de audio, volumen y comando de IA en tiempo real
  updateApiKeys: (geminiKey, elevenlabsKey, botPersonality, audioDevice, volume, iaCommand) => ipcRenderer.invoke('update-api-keys', geminiKey, elevenlabsKey, botPersonality, audioDevice, volume, iaCommand),

  // Escuchar salida del bot
  onBotOutput: (callback) => {
    ipcRenderer.on('bot-output', (event, data) => {
      callback(data);
    });
  },

  // Escuchar cuando el bot se detiene
  onBotStopped: (callback) => {
    ipcRenderer.on('bot-stopped', () => {
      callback();
    });
  }
});

