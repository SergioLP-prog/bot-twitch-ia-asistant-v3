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
ipcMain.handle('start-bot', async (event, channel, token) => {
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

  // Usar el bot avanzado de Twitch
  const scriptPath = path.join(__dirname, '..', 'twitch_chat_advanced_electron.py');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  try {
    // Crear proceso Python pasando el canal y token como argumentos
    const args = [scriptPath, channel, token];
    
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

