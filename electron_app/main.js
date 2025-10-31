// main.js
// Proceso principal de Electron para el Bot de Twitch

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let pythonProcess = null;

// Función helper para obtener la ruta correcta de chatbot.py
function getChatbotPath() {
  const fs = require('fs');
  
  // En desarrollo, __dirname apunta a electron_app/
  // En producción:
  // - __dirname apunta a resources/app.asar/main.js (dentro del asar)
  // - app.getAppPath() apunta al directorio de la app
  // - process.resourcesPath apunta a resources/
  
  // Intentar ruta de desarrollo primero
  const devPath = path.join(__dirname, '..', 'chatbot.py');
  if (fs.existsSync(devPath)) {
    return devPath;
  }
  
  // En producción: extraFiles se coloca en la raíz de la app instalada
  const appPath = app.getAppPath();
  const packagedPath = path.join(appPath, '..', '..', 'chatbot.py');
  if (fs.existsSync(packagedPath)) {
    return packagedPath;
  }
  
  // Alternativa: buscar desde process.resourcesPath
  const resourcesPath = process.resourcesPath || __dirname;
  const resourcesRootPath = path.join(resourcesPath, '..', 'chatbot.py');
  if (fs.existsSync(resourcesRootPath)) {
    return resourcesRootPath;
  }
  
  // Fallback: intentar en app.asar.unpacked
  const unpackedPath = path.join(resourcesPath, '..', 'resources', 'app.asar.unpacked', 'chatbot.py');
  if (fs.existsSync(unpackedPath)) {
    return unpackedPath;
  }
  
  return devPath; // Devolver la ruta predeterminada si nada funciona
}

// Función helper para obtener la ruta de Python (embebido o del sistema)
function getPythonPath() {
  const fs = require('fs');
  const os = require('os');
  
  // Rutas a verificar en orden de prioridad
  const pythonPaths = [];
  
  // 1. Python embebido en la raíz de la app instalada (desde extraFiles, copiado como "python")
  const appPath = app.getAppPath();
  const rootPythonPath = path.join(appPath, '..', '..', 'python', 'python.exe');
  pythonPaths.push(rootPythonPath);
  
  // 2. Python embebido en desarrollo (electron_app/python_embebido) - solo en desarrollo
  // Solo verificar si no estamos dentro de app.asar
  if (!__dirname.includes('app.asar')) {
    const devEmbeddedPath = path.join(__dirname, 'python_embebido', 'python.exe');
    pythonPaths.push(devEmbeddedPath);
  }
  
  // 3. Python embebido en app.asar.unpacked (cuando está empaquetado)
  const unpackedPythonPath = path.join(__dirname, '..', '..', '..', 'resources', 'app.asar.unpacked', 'python', 'python.exe');
  pythonPaths.push(unpackedPythonPath);
  
  // 4. Python embebido relativo desde process.resourcesPath
  if (process.resourcesPath) {
    pythonPaths.push(path.join(process.resourcesPath, 'app.asar.unpacked', 'python', 'python.exe'));
    pythonPaths.push(path.join(process.resourcesPath, '..', 'python', 'python.exe'));
  }
  
  // Verificar todas las rutas en orden
  for (const pythonPath of pythonPaths) {
    if (fs.existsSync(pythonPath)) {
      return pythonPath;
    }
  }
  
  // Fallback: buscar Python en rutas comunes de instalación del sistema
  const commonPaths = [
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'python.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
    path.join('C:', 'Program Files', 'Python312', 'python.exe'),
    path.join('C:', 'Program Files', 'Python311', 'python.exe'),
    path.join('C:', 'Program Files (x86)', 'Python312', 'python.exe'),
    path.join('C:', 'Program Files (x86)', 'Python311', 'python.exe')
  ];
  
  for (const pythonPath of commonPaths) {
    if (fs.existsSync(pythonPath)) {
      return pythonPath;
    }
  }
  
  // Último fallback: usar 'python' del PATH del sistema
  return process.platform === 'win32' ? 'python' : 'python3';
}

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

  // Atajo de teclado: Ctrl+Shift+I o Ctrl+Shift+J para abrir/cerrar DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && (input.key.toLowerCase() === 'i' || input.key.toLowerCase() === 'j')) {
      mainWindow.webContents.toggleDevTools();
    }
  });

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

// FUNCIÓN DE SANITIZACIÓN DE INPUTS PARA PREVENIR INYECCIÓN
function sanitizeInput(input) {
  if (!input) return '';
  // Remover caracteres peligrosos que podrían usarse para inyección de comandos
  return input.replace(/[;&|`$(){}[\]<>"]/g, '');
}

// IPC Handler: Iniciar el bot de Twitch
ipcMain.handle('start-bot', async (event, channel, token, audioDevice, voice, volume, geminiKey, elevenlabsKey, botPersonality, iaCommand) => {
  if (pythonProcess) {
    return { status: 'error', message: 'El bot ya está ejecutándose' };
  }

  // Sanitizar todos los inputs antes de procesarlos
  channel = sanitizeInput(channel);
  audioDevice = sanitizeInput(audioDevice);
  voice = sanitizeInput(voice);
  geminiKey = sanitizeInput(geminiKey);
  elevenlabsKey = sanitizeInput(elevenlabsKey);
  botPersonality = sanitizeInput(botPersonality);
  iaCommand = sanitizeInput(iaCommand);

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
  
  // Validar longitud del token
  if (token.length < 15 || token.length > 50) {
    return {
      status: 'error',
      message: 'Token inválido. Longitud incorrecta.'
    };
  }

  // Usar el bot de Twitch
  const scriptPath = getChatbotPath();
  const pythonCmd = getPythonPath();

  try {
    // Crear proceso Python pasando el canal, token, dispositivo de audio, voz, API keys y personalidad
    // NOTA: El token no se sanitiza ya que contiene caracteres especiales válidos (oauth:)
    const args = [scriptPath, channel, token];
    
    // Solo agregar argumentos si tienen contenido válido
    if (audioDevice && audioDevice !== '' && /^\d+$/.test(audioDevice)) {
      args.push(audioDevice);
    }
    if (voice && voice !== '' && voice.length < 100) {
      args.push('--voice', voice);
    }
    if (volume && volume !== '' && /^\d+$/.test(volume) && parseInt(volume) >= 0 && parseInt(volume) <= 100) {
      args.push('--volume', volume);
    }
    if (geminiKey && geminiKey !== '' && geminiKey.length < 100) {
      args.push('--gemini-key', geminiKey);
    }
    if (elevenlabsKey && elevenlabsKey !== '' && elevenlabsKey.length < 100) {
      args.push('--elevenlabs-key', elevenlabsKey);
    }
    if (botPersonality && botPersonality !== '' && botPersonality.length < 1000) {
      args.push('--bot-personality', botPersonality);
    }
    if (iaCommand && iaCommand !== '' && iaCommand.length < 20) {
      args.push('--ia-command', iaCommand);
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
  const pythonCmd = getPythonPath();
  const scriptPath = getChatbotPath();
  
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
  const pythonCmd = getPythonPath();
  const scriptPath = getChatbotPath();
  
  return new Promise((resolve, reject) => {
    // Validar API key antes de intentar
    if (!elevenlabsKey || elevenlabsKey.trim() === '') {
      resolve({
        error: true,
        message: 'API Key de ElevenLabs no proporcionada',
        voices: []
      });
      return;
    }
    
    const { spawn } = require('child_process');
    const args = [scriptPath, '--list-voices'];
    
    // Agregar API key
    args.push('--elevenlabs-key', elevenlabsKey.trim());
    
    const pythonProcess = spawn(pythonCmd, args);
    
    let stdout = '';
    let stderr = '';
    
    // Capturar stdout
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    // Capturar stderr por separado
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Timeout de 30 segundos
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      resolve({
        error: true,
        message: 'Timeout: La operación tardó demasiado',
        voices: []
      });
    }, 30000);
    
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      try {
        // Buscar el JSON entre los marcadores especiales
        const jsonMatch = stdout.match(/VOICES_JSON_START:(.+?):VOICES_JSON_END/);
        
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[1]);
          
          // Si es un objeto con error
          if (jsonData.error) {
            resolve({
              error: true,
              message: jsonData.message || 'Error desconocido',
              code: jsonData.code,
              voices: []
            });
          } 
          // Si es un array de voces
          else if (Array.isArray(jsonData)) {
            resolve(jsonData);
          }
          // Formato inesperado
          else {
            resolve({
              error: true,
              message: 'Formato de respuesta inesperado',
              voices: []
            });
          }
        } else {
          // Si no se encuentra el marcador, intentar parsear como antes (backward compatibility)
          const lines = stdout.split('\n');
          const jsonLine = lines.find(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('[') && trimmed.endsWith(']') && 
                   !trimmed.includes('[TTS]') && 
                   !trimmed.includes('[AUDIO]');
          });
          
          if (jsonLine) {
            const voices = JSON.parse(jsonLine);
            resolve(Array.isArray(voices) ? voices : []);
          } else {
            // Si hay stderr, incluirlo en el mensaje de error
            const errorMsg = stderr.trim() ? 
              `Error de Python: ${stderr.substring(0, 200)}` : 
              'No se pudo obtener las voces de ElevenLabs';
            
            resolve({
              error: true,
              message: errorMsg,
              voices: [],
              exitCode: code
            });
          }
        }
      } catch (e) {
        console.error('Error parsing voices:', e);
        console.error('Stdout:', stdout.substring(0, 500));
        console.error('Stderr:', stderr.substring(0, 500));
        
        resolve({
          error: true,
          message: `Error al parsear respuesta: ${e.message}`,
          voices: []
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        error: true,
        message: `Error al ejecutar Python: ${error.message}`,
        voices: []
      });
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

// IPC Handler: Verificar dependencias de Python
ipcMain.handle('check-dependencies', async () => {
  const { exec } = require('child_process');
  const pythonCmd = getPythonPath();
  
  return new Promise((resolve) => {
    // Verificar si Python está instalado
    exec(`${pythonCmd} --version`, (error) => {
      const pythonInstalled = !error;
      
      if (!pythonInstalled) {
        resolve({
          allInstalled: false,
          pythonInstalled: false,
          missingPackages: []
        });
        return;
      }
      
      // Verificar dependencias leyendo requirements.txt
      const fs = require('fs');
      const path = require('path');
      
      // Intentar ruta de desarrollo
      let requirementsPath = path.join(__dirname, '..', 'requirements.txt');
      
      // Si no existe en desarrollo, buscar en producción
      if (!fs.existsSync(requirementsPath)) {
        const appPath = app.getAppPath();
        const packagedPath = path.join(appPath, '..', '..', 'requirements.txt');
        if (fs.existsSync(packagedPath)) {
          requirementsPath = packagedPath;
        } else {
          const resourcesPath = process.resourcesPath || __dirname;
          const resourcesRootPath = path.join(resourcesPath, '..', 'requirements.txt');
          if (fs.existsSync(resourcesRootPath)) {
            requirementsPath = resourcesRootPath;
          }
        }
      }
      
      let requiredPackages = [];
      try {
        const requirementsContent = fs.readFileSync(requirementsPath, 'utf8');
        requiredPackages = requirementsContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'))
          .map(line => {
            // Remover versiones y operadores: >=, <=, ==, >, <
            line = line.replace(/\s*(>=|<=|==|>|<)\s*.+$/, '');
            // Remover espacios finales
            return line.trim();
          })
          .filter(pkg => pkg); // Filtrar líneas vacías
      } catch (e) {
        resolve({
          allInstalled: false,
          pythonInstalled: true,
          missingPackages: []
        });
        return;
      }
      
      // Mapear nombres de paquetes a comandos de verificación
      const packageToCheck = {
        'google-genai': 'from google import genai',
        'pywin32': 'import win32',
        'soundfile': 'import soundfile',
        'sounddevice': 'import sounddevice',
        'pydub': 'import pydub',
        'gtts': 'import gtts',
        'twitchio': 'import twitchio',
        'pygame': 'import pygame',
        'requests': 'import requests',
        'numpy': 'import numpy'
      };
      
      // Paquetes que pueden fallar y son tolerables (no críticos)
      // Se marcan como instalados para no bloquear la app, pero se siguen mostrando en verificaciones
      const tolerantPackages = [];  // Ningún paquete es completamente ignorado
      
      // Verificar cada paquete
      const checkPromises = requiredPackages.map(pkg => {
        const importCommand = packageToCheck[pkg] || `import ${pkg.replace(/-/g, '_')}`;
        
        return new Promise((resolve) => {
          exec(`${pythonCmd} -c "${importCommand}" 2>&1`, (error) => {
            // Verificar si realmente está instalado
            const installed = !error;
            resolve({ pkg, installed });
          });
        });
      });
      
      Promise.all(checkPromises).then(results => {
        const missingPackages = results
          .filter(r => !r.installed)
          .map(r => r.pkg);
        
        resolve({
          allInstalled: missingPackages.length === 0,
          pythonInstalled: true,
          missingPackages
        });
      });
    });
  });
});

// IPC Handler: Instalar dependencias
ipcMain.handle('install-dependencies', async (event) => {
  const { exec } = require('child_process');
  const pythonCmd = getPythonPath();
  const fs = require('fs');
  const path = require('path');
  
  // Buscar requirements.txt en diferentes ubicaciones
  let actualPath = path.join(__dirname, '..', 'requirements.txt');
  
  if (!fs.existsSync(actualPath)) {
    const appPath = app.getAppPath();
    const packagedPath = path.join(appPath, '..', '..', 'requirements.txt');
    if (fs.existsSync(packagedPath)) {
      actualPath = packagedPath;
    } else {
      const resourcesPath = process.resourcesPath || __dirname;
      const resourcesRootPath = path.join(resourcesPath, '..', 'requirements.txt');
      if (fs.existsSync(resourcesRootPath)) {
        actualPath = resourcesRootPath;
      }
    }
  }
  
  return new Promise((resolve) => {
    let step = 0;
    const totalSteps = 3;
    
    const updateProgress = (stepNumber, message) => {
      const percentage = Math.min(100, (stepNumber / totalSteps) * 100);
      // Verificar que la ventana no esté destruida antes de enviar
      if (!mainWindow || mainWindow.isDestroyed()) {
        return;
      }
      mainWindow.webContents.send('install-progress', { percentage, message });
    };
    
    // Paso 1: Actualizar pip
    step++;
    updateProgress(step, 'Actualizando pip...');
    
    exec(`${pythonCmd} -m pip install --upgrade pip --quiet`, (pipError) => {
      // Ignorar errores de actualización de pip
      
      step++;
      updateProgress(step, 'Limpiando caché de pip...');
      
      // Paso 2: Limpiar caché de pip
      exec(`${pythonCmd} -m pip cache purge`, (cacheError) => {
        // Ignorar errores de limpieza de caché
        
        step++;
        updateProgress(step, 'Instalando dependencias...');
        
        // Paso 3: Leer requirements.txt e instalar una por una
        let packagesToInstall = [];
        
        try {
          const requirementsContent = fs.readFileSync(actualPath, 'utf8');
          packagesToInstall = requirementsContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
        } catch (e) {
          resolve({ 
            success: false, 
            message: 'No se pudo leer requirements.txt'
          });
          return;
        }
        
        // Función auxiliar para instalar paquetes uno por uno
        function installPackagesIndividually(packages, index, updateProgress, callback) {
          if (index >= packages.length) {
            callback(null, true);
            return;
          }
          
          const packageLine = packages[index];
          const packageName = packageLine.split(/\s*(>=|<=|==|>|<)/)[0].trim();
          
          updateProgress(2 + (index / packages.length), `Instalando ${packageName}...`);
          
          // Solo instalar paquetes principales (ignorar comentarios y líneas vacías)
          if (!packageLine || packageLine === '' || !packageName || packageName === '') {
            installPackagesIndividually(packages, index + 1, updateProgress, callback);
            return;
          }
          
          // Instalar con la versión especificada (ej: twitchio==2.9.0)
          const command = `${pythonCmd} -m pip install "${packageLine}" --quiet`;
          
          exec(command, (error) => {
            // Continuar instalando aunque una falle
            installPackagesIndividually(packages, index + 1, updateProgress, callback);
          });
        }
        
        // Instalar una por una para evitar conflictos del resolver
        installPackagesIndividually(packagesToInstall, 0, updateProgress, (finalError, finalSuccess) => {
          if (finalError) {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('install-progress', { percentage: 100, message: 'Instalación parcial' });
            }
            resolve({ 
              success: false, 
              message: `No se pudieron instalar todas las dependencias.\n\nInstala manualmente:\npip install ${packagesToInstall.join(' ')}`
            });
            return;
          }
          
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('install-progress', { percentage: 100, message: 'Instalación completa' });
          }
          resolve({ success: true, message: 'Dependencias instaladas correctamente' });
        });
      });
    });
  });
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
ipcMain.handle('update-api-keys', async (event, geminiKey, elevenlabsKey, botPersonality, audioDevice, volume, iaCommand) => {
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
    if (volume !== undefined) {
      pythonProcess.stdin.write(`UPDATE_VOLUME:${volume}\n`);
    }
    if (iaCommand !== undefined) {
      pythonProcess.stdin.write(`UPDATE_IA_COMMAND:${iaCommand}\n`);
    }
    return { status: 'success', message: 'Configuracion actualizada correctamente' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

