// main.js
// Proceso principal de Electron para el Bot de Twitch

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let pythonProcess = null;

// Crea la ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Twitch Chat Reader",
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: true,
    autoHideMenuBar: true,
  });

  mainWindow.loadFile('index.html');

  // Abrir DevTools en modo desarrollo
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    // Detener el proceso Python si está ejecutándose
    if (pythonProcess) {
      pythonProcess.kill();
    }
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handler: Iniciar el bot de Twitch
ipcMain.handle('start-bot', async (event, channel, token, audioDevice, voice, geminiKey, elevenlabsKey, botPersonality) => {
  if (pythonProcess) {
    return { status: 'error', message: 'El bot ya está ejecutándose' };
  }

  // Validar que se proporcione token
  if (!token) {
    return { 
      status: 'error', 
      message: 'Token OAuth es REQUERIDO. Obtén uno en: https://twitchtokengenerator.com/' 
    };
  }

  // Validar formato del token
  if (!token.startsWith('oauth:')) {
    return { 
      status: 'error', 
      message: 'El token debe empezar con "oauth:". Formato: oauth:xxxxxxxxxxxxx' 
    };
  }

  // Usar el bot de Twitch
  const scriptPath = path.join(__dirname, '..', 'chatbot.py');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  try {
    // Crear proceso Python pasando el canal, token, dispositivo de audio, voz, API keys y personalidad
    const args = [scriptPath, channel, token];
    if (audioDevice && audioDevice !== '') {
      args.push(audioDevice);
    }
    if (voice && voice !== '') {
      args.push('--voice', voice);
    }
    if (geminiKey && geminiKey !== '') {
      args.push('--gemini-key', geminiKey);
    }
    if (elevenlabsKey && elevenlabsKey !== '') {
      args.push('--elevenlabs-key', elevenlabsKey);
    }
    if (botPersonality && botPersonality !== '') {
      args.push('--bot-personality', botPersonality);
    }
    
    pythonProcess = spawn(pythonCmd, args, {
      cwd: path.join(__dirname, '..'),
      env: process.env,
    });

    // Buffer para acumular líneas incompletas
    let stdoutBuffer = '';
    let stderrBuffer = '';

    // Capturar stdout y procesar línea por línea
    pythonProcess.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      const lines = stdoutBuffer.split('\n');
      
      // La última línea podría estar incompleta, guardarla en el buffer
      stdoutBuffer = lines.pop() || '';
      
      // Procesar cada línea completa
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && mainWindow) {
          mainWindow.webContents.send('bot-output', {
            type: 'info',
            message: trimmedLine
          });
        }
      });
    });

    // Capturar stderr
    pythonProcess.stderr.on('data', (data) => {
      stderrBuffer += data.toString();
      const lines = stderrBuffer.split('\n');
      
      stderrBuffer = lines.pop() || '';
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && mainWindow) {
          mainWindow.webContents.send('bot-output', {
            type: 'error',
            message: trimmedLine
          });
        }
      });
    });

    // Cuando el proceso termine
    pythonProcess.on('close', (code) => {
      if (mainWindow) {
        mainWindow.webContents.send('bot-output', {
          type: 'system',
          message: `Proceso finalizado (código: ${code})`
        });
        mainWindow.webContents.send('bot-stopped');
      }
      pythonProcess = null;
    });

    // Error al iniciar
    pythonProcess.on('error', (err) => {
      if (mainWindow) {
        mainWindow.webContents.send('bot-output', {
          type: 'error',
          message: `Error al iniciar: ${err.message}`
        });
        mainWindow.webContents.send('bot-stopped');
      }
      pythonProcess = null;
    });

    return { status: 'success', message: 'Bot iniciado correctamente' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

// IPC Handler: Listar dispositivos de audio
ipcMain.handle('list-audio-devices', async () => {
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const scriptPath = path.join(__dirname, '..', 'chatbot.py');
  
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const pythonProcess = spawn(pythonCmd, [scriptPath, '--list-audio-devices']);
    
    let output = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Buscar la linea que contiene el JSON válido (empieza con [ y termina con ])
          const lines = output.split('\n');
          const jsonLine = lines.find(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('[') && trimmed.endsWith(']') && 
                   !trimmed.includes('[TTS]') && 
                   !trimmed.includes('[AUDIO]') &&
                   !trimmed.includes('pygame') &&
                   !trimmed.includes('Hello from the pygame');
          });
          
          if (jsonLine) {
            const devices = JSON.parse(jsonLine);
            resolve(devices);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.error('Error parsing audio devices:', e);
          resolve([]);
        }
      } else {
        resolve([]);
      }
    });
  });
});

// IPC Handler: Listar voces de ElevenLabs
ipcMain.handle('list-voices', async (event, elevenlabsKey) => {
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const scriptPath = path.join(__dirname, '..', 'chatbot.py');
  
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const args = [scriptPath, '--list-voices'];
    
    // Agregar API key si se proporciona
    if (elevenlabsKey && elevenlabsKey !== '') {
      args.push('--elevenlabs-key', elevenlabsKey);
    }
    
    const pythonProcess = spawn(pythonCmd, args);
    
    let output = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Buscar la linea que contiene el JSON válido (empieza con [ y termina con ])
          const lines = output.split('\n');
          const jsonLine = lines.find(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('[') && trimmed.endsWith(']') && 
                   !trimmed.includes('[TTS]') && 
                   !trimmed.includes('[AUDIO]') &&
                   !trimmed.includes('pygame') &&
                   !trimmed.includes('Hello from the pygame');
          });
          
          if (jsonLine) {
            const voices = JSON.parse(jsonLine);
            resolve(voices);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.error('Error parsing voices:', e);
          resolve([]);
        }
      } else {
        resolve([]);
      }
    });
  });
});

// IPC Handler: Detener el bot
ipcMain.handle('stop-bot', async () => {
  if (!pythonProcess) {
    return { status: 'error', message: 'El bot no está ejecutándose' };
  }

  try {
    pythonProcess.kill('SIGTERM');
    pythonProcess = null;
    return { status: 'success', message: 'Bot detenido' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

// IPC Handler: Verificar si el bot está ejecutándose
ipcMain.handle('check-bot-status', async () => {
  return { running: pythonProcess !== null };
});

// IPC Handler: Cambiar voz en tiempo real
ipcMain.handle('change-voice', async (event, voiceId) => {
  if (!pythonProcess) {
    return { status: 'error', message: 'El bot no está ejecutándose' };
  }

  try {
    // Enviar comando al proceso Python a través de stdin
    pythonProcess.stdin.write(`CHANGE_VOICE:${voiceId}\n`);
    return { status: 'success', message: 'Voz cambiada correctamente' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

// IPC Handler: Actualizar API Keys, personalidad y dispositivo de audio en tiempo real
ipcMain.handle('update-api-keys', async (event, geminiKey, elevenlabsKey, botPersonality, audioDevice) => {
  if (!pythonProcess) {
    return { status: 'error', message: 'El bot no está ejecutándose' };
  }

  try {
    // Enviar comandos al proceso Python a través de stdin
    if (geminiKey !== undefined) {
      pythonProcess.stdin.write(`UPDATE_GEMINI_KEY:${geminiKey}\n`);
    }
    if (elevenlabsKey !== undefined) {
      pythonProcess.stdin.write(`UPDATE_ELEVENLABS_KEY:${elevenlabsKey}\n`);
    }
    if (botPersonality !== undefined) {
      pythonProcess.stdin.write(`UPDATE_PERSONALITY:${botPersonality}\n`);
    }
    if (audioDevice !== undefined) {
      pythonProcess.stdin.write(`UPDATE_AUDIO_DEVICE:${audioDevice}\n`);
    }
    return { status: 'success', message: 'Configuracion actualizada correctamente' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

