// preload.js
// Expone APIs seguras al renderer

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Iniciar el bot con el canal, token, dispositivo de audio, voz, API keys y personalidad
  startBot: (channel, token, audioDevice, voice, geminiKey, elevenlabsKey, botPersonality) => ipcRenderer.invoke('start-bot', channel, token, audioDevice, voice, geminiKey, elevenlabsKey, botPersonality),

  // Listar dispositivos de audio
  listAudioDevices: () => ipcRenderer.invoke('list-audio-devices'),

  // Listar voces de ElevenLabs
  listVoices: (elevenlabsKey) => ipcRenderer.invoke('list-voices', elevenlabsKey),

  // Detener el bot
  stopBot: () => ipcRenderer.invoke('stop-bot'),

  // Verificar estado del bot
  checkBotStatus: () => ipcRenderer.invoke('check-bot-status'),

  // Cambiar voz en tiempo real
  changeVoice: (voiceId) => ipcRenderer.invoke('change-voice', voiceId),

  // Actualizar API Keys, personalidad y dispositivo de audio en tiempo real
  updateApiKeys: (geminiKey, elevenlabsKey, botPersonality, audioDevice) => ipcRenderer.invoke('update-api-keys', geminiKey, elevenlabsKey, botPersonality, audioDevice),

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

