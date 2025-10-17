// preload.js
// Expone APIs seguras al renderer

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Iniciar el bot con el canal y token especificados
  startBot: (channel, token) => ipcRenderer.invoke('start-bot', channel, token),

  // Detener el bot
  stopBot: () => ipcRenderer.invoke('stop-bot'),

  // Verificar estado del bot
  checkBotStatus: () => ipcRenderer.invoke('check-bot-status'),

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

