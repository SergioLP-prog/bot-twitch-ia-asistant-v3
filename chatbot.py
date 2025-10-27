"""
Bot avanzado de Twitch con interfaz Electron
Versión mejorada con TwitchIO y compatibilidad con GUI + IA con Gemini
"""

import sys
import io
import asyncio
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
import os
import threading
import queue

# Configurar la salida estándar para UTF-8 (soluciona problemas en Windows)
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    from twitchio.ext import commands
except ImportError:
    print("Error: TwitchIO no esta instalado")
    print("Instala con: pip install twitchio")
    sys.exit(1)

try:
    from google import genai
except ImportError:
    print("Advertencia: google-genai no esta instalado")
    print("La funcionalidad de IA no estara disponible")
    print("Instala con: pip install google-genai")
    genai = None

try:
    from gtts import gTTS
except ImportError:
    print("Advertencia: gtts no esta instalado")
    print("El fallback de TTS gratuito no estara disponible")
    print("Instala con: pip install gtts")
    gTTS = None

try:
    # Suprimir mensaje de bienvenida de pygame
    os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'
    import pygame
    import tempfile
    import requests
    import sounddevice as sd
    import numpy as np
    from pydub import AudioSegment
except ImportError as e:
    print("Advertencia: pygame, requests, sounddevice o pydub no esta instalado")
    print("La funcionalidad de TTS no estara disponible")
    print("Instala con: pip install pygame requests sounddevice pydub")
    pygame = None
    requests = None
    sd = None
    np = None
    AudioSegment = None

# Intentar importar soundfile como alternativa a pydub para MP3
try:
    import soundfile as sf
    _soundfile_available = True
except ImportError:
    sf = None
    _soundfile_available = False
    print("Advertencia: soundfile no esta instalado")
    print("Instala con: pip install soundfile")

# Nota: win32gui, win32con ya no se usan - eliminados para reducir dependencias

# Verificar si sounddevice funciona correctamente en Windows
_sounddevice_available = False
if sd is not None:
    try:
        devices = sd.query_devices()
        
        # Intentar una prueba de reproducción simple para verificar que funciona
        import numpy as np
        test_samples = np.zeros((1000, 2), dtype=np.float32)
        try:
            sd.play(test_samples, samplerate=44100)
            sd.stop()
            _sounddevice_available = True
            print(f"[AUDIO] sounddevice disponible - {len(devices)} dispositivos encontrados", flush=True)
        except Exception as test_error:
            print(f"[AUDIO] ⚠️ sounddevice no puede reproducir: {test_error}", flush=True)
            print(f"[AUDIO] Usando pygame como método principal de reproducción", flush=True)
            _sounddevice_available = False
    except Exception as e:
        print(f"[AUDIO] ⚠️ sounddevice no disponible: {e}", flush=True)
        print(f"[AUDIO] Usando pygame (no soporta dispositivos específicos)", flush=True)
        _sounddevice_available = False

# Función auxiliar para reproducir audio en un dispositivo específico usando WASAPI
def _play_audio_on_device(file_path: str, device_id: Optional[int] = None, volume: int = 70):
    """Reproduce audio en un dispositivo específico usando WASAPI a través de sounddevice
    
    Args:
        file_path: Ruta al archivo de audio
        device_id: ID del dispositivo de audio (None para predeterminado)
        volume: Nivel de volumen (0-100), por defecto 70
    """
    try:
        if sd is None or AudioSegment is None or np is None:
            print(f"[AUDIO] ⚠️ Librerías de audio no disponibles", flush=True)
            return False
        
        # Verificar que el archivo existe
        if not os.path.exists(file_path):
            print(f"[AUDIO] ❌ Archivo de audio no existe: {file_path}", flush=True)
            print(f"[AUDIO] Directorio actual: {os.getcwd()}", flush=True)
            print(f"[AUDIO] ¿Es ruta absoluta?: {os.path.isabs(file_path)}", flush=True)
            return False
        
        # Verificar tamaño del archivo
        file_size = os.path.getsize(file_path)
        
        if file_size == 0:
            print(f"[AUDIO] ❌ Archivo está vacío", flush=True)
            return False
        
        # Validar que el dispositivo existe y está disponible
        if device_id is not None:
            try:
                devices = sd.query_devices()
                if device_id >= len(devices):
                    print(f"[AUDIO] ⚠️ Dispositivo {device_id} no encontrado (hay {len(devices)} disponibles), usando predeterminado", flush=True)
                    device_id = None
                else:
                    device_info = devices[device_id]
                    device_name = device_info.get('name', 'Unknown')
                    max_channels = device_info.get('max_output_channels', 0)
                    
                    if max_channels == 0:
                        print(f"[AUDIO] ⚠️ Dispositivo {device_name} no tiene salida de audio, usando predeterminado", flush=True)
                        device_id = None
            except Exception as verify_error:
                print(f"[AUDIO] ⚠️ Error al verificar dispositivo: {verify_error}", flush=True)
                device_id = None
        
        # Cargar audio - intentar con soundfile primero, luego pydub como fallback
        samples = None
        sample_rate = 22050  # Tasa de muestreo por defecto
        
        if _soundfile_available and sf is not None:
            try:
                samples, sample_rate = sf.read(file_path, dtype='float32')
                
                # Asegurar que es 2D (canales x muestras)
                if len(samples.shape) == 1:
                    samples = samples.reshape((-1, 1))
                elif len(samples.shape) == 2 and samples.shape[0] < samples.shape[1]:
                    # Si está transpuesto, corregirlo
                    samples = samples.T
                    
            except Exception as sf_error:
                print(f"[AUDIO] ⚠️ Error con soundfile: {sf_error}, intentando con pydub...", flush=True)
                samples = None
        
        # Fallback a pydub si soundfile falló
        if samples is None and AudioSegment is not None:
            try:
                print(f"[AUDIO] Cargando audio con pydub...", flush=True)
                audio = AudioSegment.from_mp3(file_path)
                sample_rate = audio.frame_rate
                
                # Convertir a numpy array
                samples = np.array(audio.get_array_of_samples())
                
                # Reshape según canales
                if audio.channels == 2:
                    samples = samples.reshape((-1, 2)).astype(np.float32) / (2**15)
                else:
                    samples = samples.reshape((-1, 1)).astype(np.float32) / (2**15)
                
                print(f"[AUDIO] Audio cargado con pydub: {sample_rate}Hz, {samples.shape}", flush=True)
                
            except Exception as load_error:
                print(f"[AUDIO] ❌ Error al cargar archivo de audio: {load_error}", flush=True)
                import traceback
                traceback.print_exc()
                return False
        
        if samples is None:
            print(f"[AUDIO] ❌ No se pudo cargar el archivo de audio", flush=True)
            return False
        
        # Aplicar volumen (0-100) a las muestras
        volume_factor = volume / 100.0
        samples = samples * volume_factor
        
        # Reproducir con sounddevice
        try:
            if device_id is not None:
                # Intentar reproducir en dispositivo específico
                sd.play(samples, samplerate=sample_rate, device=device_id)
            else:
                # Reproducir en dispositivo predeterminado
                sd.play(samples, samplerate=sample_rate)
            
            sd.wait()
            return True
        except Exception as play_error:
            print(f"[AUDIO] ❌ Error al iniciar reproducción con sounddevice: {play_error}", flush=True)
            print(f"[AUDIO] Tipo de error: {type(play_error).__name__}", flush=True)
            return False
            
    except Exception as e:
        print(f"[AUDIO] ❌ Error general al reproducir en dispositivo: {e}", flush=True)
        print(f"[AUDIO] Tipo de error: {type(e).__name__}", flush=True)
        import traceback
        traceback.print_exc()
        return False


class TwitchChatBotAdvanced(commands.Bot):
    """
    Bot avanzado de Twitch con capacidades mejoradas
    Compatible con interfaz Electron
    """
    
    def __init__(self, channel_name: str, token: str, gemini_key: str = "", elevenlabs_key: str = "", bot_personality: str = "", volume: int = 70):
        """
        Inicializa el bot avanzado
        
        Args:
            channel_name (str): Nombre del canal a monitorear
            token (str): Token OAuth de Twitch (REQUERIDO)
            gemini_key (str): API Key de Google Gemini (opcional)
            elevenlabs_key (str): API Key de ElevenLabs (opcional)
            bot_personality (str): Personalidad del bot para respuestas de IA (opcional)
            volume (int): Nivel de volumen (0-100), por defecto 70
        
        Raises:
            ValueError: Si el token no es proporcionado o es inválido
        """
        # Validar token
        if not token:
            raise ValueError("Token OAuth es REQUERIDO. Obten uno en: https://twitchtokengenerator.com/")
        
        if not token.startswith('oauth:'):
            raise ValueError("El token debe empezar con 'oauth:'. Formato: oauth:xxxxxxxxxxxxx")
        
        if len(token) < 15:
            raise ValueError("Token invalido. Debe tener al menos 15 caracteres")
        
        super().__init__(
            token=token,
            prefix='!',
            initial_channels=[channel_name]
        )
        
        self.channel_name = channel_name
        self.message_count = 0
        self.command_count = 0
        
        # Configuración de filtros
        self.blocked_users: List[str] = []
        self.highlighted_users: List[str] = []
        self.filter_mode: Optional[str] = None  # 'allowed_only', 'highlight', None
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Callback para interfaz Electron
        self.electron_callback = None
        
        # API Key de Gemini
        self.gemini_api_key = gemini_key if gemini_key else ""
        self.gemini_enabled = genai is not None and self.gemini_api_key and len(self.gemini_api_key) > 0
        
        # Personalidad del bot
        # Si viene una personalidad, usarla. Si viene vacía o es None, usar la por defecto
        if bot_personality and bot_personality.strip():
            self.bot_personality = bot_personality.strip()
        else:
            self.bot_personality = "Eres un asistente amigable y util que responde de forma clara y concisa."
        
        # API Key de ElevenLabs para TTS
        self.elevenlabs_api_key = elevenlabs_key if elevenlabs_key else ""
        self.elevenlabs_voice_id = "21m00Tcm4TlvDq8ikWAM"
        self.audio_device_id = None
        self.volume = volume if 0 <= volume <= 100 else 70
        self.ia_command = "!IA"  # Comando de IA por defecto
        self.elevenlabs_enabled = pygame is not None and requests is not None and self.elevenlabs_api_key and len(self.elevenlabs_api_key) > 0
        
        # Caché de voces para evitar múltiples peticiones a la API
        self.voices_cache = {}
        
        # Fallback de TTS cuando se agota la cuota de ElevenLabs
        self.elevenlabs_quota_exceeded = False
        self.using_google_tts_fallback = False
        
        # Sistema de memoria por usuario (se resetea al reiniciar el bot)
        self.user_memory: Dict[str, List[Dict[str, str]]] = {}
        self.max_memory_per_user = 10  # Máximo de interacciones a recordar por usuario
        
        # Inicializar pygame mixer para TTS
        if pygame is not None:
            try:
                pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
                print("[TTS] Pygame mixer inicializado correctamente", flush=True)
            except Exception as e:
                print(f"[TTS] Error al inicializar pygame mixer: {e}", flush=True)
                self.elevenlabs_enabled = False
        
    def set_electron_callback(self, callback):
        """Establece callback para comunicación con Electron"""
        self.electron_callback = callback
    
    def set_audio_device(self, device_id: int):
        """Establece el dispositivo de audio para reproducción"""
        self.audio_device_id = device_id
        print(f"[TTS] Dispositivo de audio configurado: {device_id}", flush=True)
    
    def update_audio_device(self, device_id: str):
        """Actualiza el dispositivo de audio en tiempo real"""
        try:
            print(f"[AUDIO] Recibido comando para cambiar dispositivo: '{device_id}'", flush=True)
            
            # Manejar string vacío o None
            if not device_id or device_id == '' or device_id.strip() == '':
                self.audio_device_id = None
                print(f"[AUDIO] Usando dispositivo predeterminado del sistema", flush=True)
            else:
                # Intentar convertir a int
                try:
                    device_id_int = int(device_id)
                    self.audio_device_id = device_id_int
                    
                    # Verificar que el dispositivo existe
                    if sd is not None:
                        try:
                            available_devices = sd.query_devices()
                            device_info = None
                            for i, dev in enumerate(available_devices):
                                if i == device_id_int:
                                    device_info = dev
                                    break
                            
                            if device_info and device_info.get('max_output_channels', 0) > 0:
                                device_name = device_info['name']
                                print(f"[AUDIO] Dispositivo actualizado a: ID {device_id_int} ({device_name})", flush=True)
                                print(f"[AUDIO] ℹ️ Usando dispositivo específico para reproducción de audio", flush=True)
                            else:
                                print(f"[AUDIO] ⚠️ Dispositivo {device_id_int} no es válido o no tiene salida, usando predeterminado", flush=True)
                        except Exception as verify_error:
                            print(f"[AUDIO] Error al verificar dispositivo: {verify_error}", flush=True)
                    else:
                        print(f"[AUDIO] Dispositivo de audio configurado a: {device_id_int}", flush=True)
                except ValueError:
                    # Si no es un número válido, usar None
                    self.audio_device_id = None
                    print(f"[AUDIO] ⚠️ ID de dispositivo inválido: '{device_id}'. Usando predeterminado", flush=True)
        except Exception as e:
            print(f"[AUDIO] ❌ Error al actualizar dispositivo: {e}", flush=True)
            self.audio_device_id = None
    
    def update_volume(self, volume: str):
        """Actualiza el volumen en tiempo real"""
        try:
            volume_int = int(volume)
            # Limitar el volumen entre 0 y 100
            self.volume = max(0, min(100, volume_int))
        except ValueError:
            print(f"[AUDIO] ⚠️ Volumen inválido: '{volume}'", flush=True)
        except Exception as e:
            print(f"[AUDIO] ❌ Error al actualizar volumen: {e}", flush=True)
    
    def update_ia_command(self, ia_command: str):
        """Actualiza el comando de IA en tiempo real"""
        try:
            if ia_command and len(ia_command) <= 20:
                self.ia_command = ia_command.strip()
                print(f"[IA] Comando de IA actualizado a: '{self.ia_command}'", flush=True)
            else:
                print(f"[IA] ⚠️ Comando de IA inválido (máximo 20 caracteres): '{ia_command}'", flush=True)
        except Exception as e:
            print(f"[IA] ❌ Error al actualizar comando de IA: {e}", flush=True)
    
    def get_voice_name(self, voice_id: str) -> str:
        """Obtiene el nombre de una voz por su ID (usa caché)"""
        if not self.elevenlabs_enabled:
            return voice_id
        
        # Verificar si está en caché
        if voice_id in self.voices_cache:
            return self.voices_cache[voice_id]
        
        try:
            url = "https://api.elevenlabs.io/v1/voices"
            headers = {
                "Accept": "application/json",
                "xi-api-key": self.elevenlabs_api_key
            }
            
            # Configurar timeout para evitar que la conexión se cuelgue
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Guardar todas las voces en caché
                for voice in data.get('voices', []):
                    self.voices_cache[voice['voice_id']] = voice['name']
                
                # Retornar el nombre si se encontró
                if voice_id in self.voices_cache:
                    return self.voices_cache[voice_id]
            
            # Si no se encuentra, retornar el ID
            return voice_id
        except Exception as e:
            return voice_id
    
    def set_voice(self, voice_id: str):
        """Cambia la voz de ElevenLabs en tiempo real"""
        self.elevenlabs_voice_id = voice_id
        voice_name = self.get_voice_name(voice_id)
        print(f"[TTS] Voz cambiada a: {voice_name}", flush=True)
    
    def update_gemini_key(self, api_key: str):
        """Actualiza la API Key de Gemini en tiempo real"""
        self.gemini_api_key = api_key if api_key else ""
        self.gemini_enabled = genai is not None and self.gemini_api_key and len(self.gemini_api_key) > 0
        
        if self.gemini_enabled:
            print(f"[IA] API Key de Gemini actualizada correctamente", flush=True)
            print(f"[IA] Servicio de IA activado", flush=True)
        else:
            print(f"[IA] API Key de Gemini eliminada", flush=True)
            print(f"[IA] Servicio de IA desactivado", flush=True)
    
    def update_bot_personality(self, personality: str):
        """Actualiza la personalidad del bot en tiempo real"""
        self.bot_personality = personality if personality else "Eres un asistente amigable y util que responde de forma clara y concisa."
        print(f"[IA] Personalidad del bot actualizada", flush=True)
    
    def update_elevenlabs_key(self, api_key: str):
        """Actualiza la API Key de ElevenLabs en tiempo real"""
        self.elevenlabs_api_key = api_key if api_key else ""
        self.elevenlabs_enabled = pygame is not None and requests is not None and self.elevenlabs_api_key and len(self.elevenlabs_api_key) > 0
        
        # Limpiar caché de voces al cambiar la key
        self.voices_cache = {}
        
        # Resetear flags de cuota al cambiar API key
        self.elevenlabs_quota_exceeded = False
        self.using_google_tts_fallback = False
        
        if self.elevenlabs_enabled:
            print(f"[TTS] API Key de ElevenLabs actualizada correctamente", flush=True)
            print(f"[TTS] Servicio de TTS activado", flush=True)
        else:
            print(f"[TTS] API Key de ElevenLabs eliminada", flush=True)
            print(f"[TTS] Servicio de TTS desactivado", flush=True)
    
    def get_available_voices(self):
        """Obtiene la lista de voces disponibles de ElevenLabs"""
        if not self.elevenlabs_enabled:
            return []
        
        try:
            url = "https://api.elevenlabs.io/v1/voices"
            headers = {
                "Accept": "application/json",
                "xi-api-key": self.elevenlabs_api_key
            }
            
            # Configurar timeout para evitar que la conexión se cuelgue
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                voices = []
                
                print(f"[TTS] Respuesta de API: {len(data.get('voices', []))} voces encontradas", flush=True)
                
                for voice in data.get('voices', []):
                    voice_info = {
                        'voice_id': voice['voice_id'],
                        'name': voice['name'],
                        'category': voice.get('category', 'Unknown'),
                        'description': voice.get('description', ''),
                        'labels': voice.get('labels', {}),
                        'settings': voice.get('settings', {}),
                        'sharing': voice.get('sharing', {}),
                        'high_quality_base_model_ids': voice.get('high_quality_base_model_ids', []),
                        'safety_control': voice.get('safety_control', {}),
                        'voice_verification': voice.get('voice_verification', {}),
                        'permissions': voice.get('permissions', []),
                        'fine_tuning': voice.get('fine_tuning', {}),
                        'samples': voice.get('samples', []),
                        'preview_url': voice.get('preview_url', ''),
                        'available_for_tiers': voice.get('available_for_tiers', [])
                    }
                    voices.append(voice_info)
                
                # Ordenar voces por nombre para mejor organización
                voices.sort(key=lambda x: x['name'].lower())
                
                print(f"[TTS] Voces procesadas: {len(voices)}", flush=True)
                
                print(f"[TTS] Total voces disponibles: {len(voices)}", flush=True)
                return voices
            else:
                print(f"[TTS] Error al obtener voces: {response.status_code} - {response.text}", flush=True)
                return []
                
        except Exception as e:
            print(f"[TTS] Error al obtener voces: {e}", flush=True)
            return []
    
    @staticmethod
    def list_audio_devices():
        """Lista todos los dispositivos de audio válidos (solo salida)"""
        if sd is None:
            print("sounddevice no esta disponible")
            return []
        
        try:
            devices = sd.query_devices()
            output_devices = []
            total_devices = 0
            
            print(f"[AUDIO] Analizando {len(devices)} dispositivos de audio...", flush=True)
            
            for i, device in enumerate(devices):
                total_devices += 1
                # Solo incluir dispositivos con salida válida
                if device['max_output_channels'] > 0:
                    device_info = {
                        'id': i,
                        'name': device['name'],
                        'channels': device['max_output_channels']
                    }
                    output_devices.append(device_info)
                    print(f"[AUDIO] [{i}] {device['name']} ({device['max_output_channels']} canales)", flush=True)
            
            print(f"[AUDIO] Dispositivos válidos: {len(output_devices)} de {total_devices} totales", flush=True)
            return output_devices
            
        except Exception as e:
            print(f"[AUDIO] Error al listar dispositivos: {e}", flush=True)
            return []
        
    async def event_ready(self):
        """Se ejecuta cuando el bot se conecta exitosamente"""
        print("Bot Avanzado de Twitch - Conectado", flush=True)
        print(f"Canal: {self.channel_name}", flush=True)
        print("[MEMORIA] Sistema de memoria de usuario activado (se resetea al reiniciar)", flush=True)
        
        # Mostrar info de TTS fallback
        if self.elevenlabs_enabled:
            if gTTS is None:
                print("[TTS] Fallback no disponible. Instala gtts para tener respaldo automático: pip install gtts", flush=True)
        
        print(flush=True)
        
        # Notificar a Electron
        if self.electron_callback:
            self.electron_callback({
                'type': 'system',
                'message': f'Bot conectado al canal {self.channel_name}'
            })
    
    async def event_message(self, message):
        """
        Se ejecuta cada vez que llega un mensaje al chat
        
        Args:
            message: Objeto mensaje de TwitchIO
        """
        # Ignorar mensajes del propio bot
        if message.echo:
            return
        
        # Incrementar contadores
        self.message_count += 1
        
        # Contar comandos
        if message.content.startswith('!'):
            self.command_count += 1
        
        # Aplicar filtros
        if not self._should_show_message(message):
            return
        
        # Formatear mensaje
        formatted_msg = self.format_message(message)
        print(formatted_msg, flush=True)
        
        # Enviar a Electron
        if self.electron_callback:
            self.electron_callback({
                'type': 'chat',
                'username': message.author.name,
                'message': message.content,
                'badges': self._get_badges(message),
                'color': getattr(message.author, 'color', None),
                'timestamp': datetime.now().strftime('%H:%M:%S'),
                'is_command': message.content.startswith('!'),
                'is_mod': message.author.is_mod,
                'is_subscriber': message.author.is_subscriber
            })
        
        # Detectar comando de IA personalizado (case-insensitive)
        ia_command_with_space = f'{self.ia_command} '
        message_starts_with_command = message.content.upper().startswith(ia_command_with_space.upper())
        
        if message_starts_with_command:
            await self.handle_ia_command(message)
    
    def _should_show_message(self, message) -> bool:
        """Determina si el mensaje debe mostrarse según los filtros"""
        username = message.author.name.lower()
        
        # Usuario bloqueado
        if username in [u.lower() for u in self.blocked_users]:
            return False
        
        # Modo solo usuarios permitidos
        if self.filter_mode == 'allowed_only':
            if username not in [u.lower() for u in self.highlighted_users]:
                return False
        
        return True
    
    def _get_badges(self, message) -> List[str]:
        """Extrae badges del mensaje"""
        badges = []
        if message.author.is_mod:
            badges.append('MOD')
        if message.author.is_subscriber:
            badges.append('SUB')
        if hasattr(message.author, 'badges') and message.author.badges:
            if 'vip' in message.author.badges:
                badges.append('VIP')
        return badges
    
    def format_message(self, message) -> str:
        """
        Formatea un mensaje para mostrar en consola
        
        Args:
            message: Objeto mensaje de TwitchIO
            
        Returns:
            str: Mensaje formateado
        """
        username = message.author.name
        content = message.content
        timestamp = datetime.now().strftime('%H:%M:%S')
        
        # Extraer badges
        badges = self._get_badges(message)
        badge_str = f"[{','.join(badges)}] " if badges else ""
        
        # Resaltar usuarios especiales
        highlight = ""
        if username.lower() in [u.lower() for u in self.highlighted_users]:
            highlight = "[DESTACADO] "
        
        # Obtener color del usuario
        color = getattr(message.author, 'color', None)
        color_str = f"(#{color}) " if color else ""
        
        # Indicar si es comando
        command_indicator = "[CMD] " if content.startswith('!') else ""
        
        return f"{command_indicator}{highlight}{badge_str}{color_str}{username}: {content}"
    
    def add_blocked_user(self, username: str):
        """Agrega un usuario a la lista de bloqueados"""
        if username not in self.blocked_users:
            self.blocked_users.append(username)
            print(f"Usuario bloqueado: {username}")
    
    def remove_blocked_user(self, username: str):
        """Remueve un usuario de la lista de bloqueados"""
        if username in self.blocked_users:
            self.blocked_users.remove(username)
            print(f"Usuario desbloqueado: {username}")
    
    def add_highlighted_user(self, username: str):
        """Agrega un usuario a la lista de resaltados"""
        if username not in self.highlighted_users:
            self.highlighted_users.append(username)
            print(f"Usuario resaltado: {username}")
    
    def remove_highlighted_user(self, username: str):
        """Remueve un usuario de la lista de resaltados"""
        if username in self.highlighted_users:
            self.highlighted_users.remove(username)
            print(f"Usuario sin resaltar: {username}")
    
    def set_filter_mode(self, mode: Optional[str]):
        """Establece el modo de filtro"""
        self.filter_mode = mode
        modes = {
            None: "Sin filtros",
            'allowed_only': "Solo usuarios permitidos",
            'highlight': "Resaltar usuarios especiales"
        }
        print(f"Modo de filtro: {modes.get(mode, 'Desconocido')}")
    
    async def handle_ia_command(self, message):
        """Maneja comandos personalizados enviándolos a Gemini"""
        # Extraer el contenido después del comando personalizado
        command_length = len(self.ia_command)
        content = message.content[command_length:].strip()  # Remover el comando y el espacio
        username = message.author.name
        
        print(f"[IA] Mensaje recibido de {username}: {content}", flush=True)
        
        if not self.gemini_enabled:
            response = "La IA no esta configurada. Configura tu API Key de Gemini en el apartado de Configuracion de la interfaz"
            print(f"[IA] {response}", flush=True)
            print(f"[IA] Obten tu API Key en: https://aistudio.google.com/app/apikey", flush=True)
            return
        
        if not content:
            response = f"Debes incluir un mensaje despues de {self.ia_command}"
            print(f"[IA] {response}", flush=True)
            return
        
        # Obtener respuesta de Gemini
        try:
            response = await self.get_gemini_response(username, content)
            print(f"[IA] Respuesta de Gemini: {response}", flush=True)
            
            # Mostrar en consola de Electron si esta disponible
            if self.electron_callback:
                self.electron_callback({
                    'type': 'ia_response',
                    'username': username,
                    'question': content,
                    'response': response
                })
            
            # Reproducir con TTS si esta habilitado
            if self.elevenlabs_enabled:
                print(f"[TTS] Reproduciendo respuesta con ElevenLabs...", flush=True)
                await self.text_to_speech(response)
            
        except Exception as e:
            error_msg = f"Error al obtener respuesta de IA: {e}"
            print(f"[IA] {error_msg}", flush=True)
    
    def _get_user_memory_context(self, username: str) -> str:
        """Obtiene el contexto de memoria del usuario"""
        if username not in self.user_memory or not self.user_memory[username]:
            return ""
        
        # Construir contexto de memoria
        memory_text = "\n\nHistorial de conversación con este usuario:\n"
        for interaction in self.user_memory[username]:
            memory_text += f"Usuario: {interaction['question']}\n"
            memory_text += f"Tu respuesta: {interaction['answer']}\n"
        
        return memory_text
    
    def _save_to_memory(self, username: str, question: str, answer: str):
        """Guarda una interacción en la memoria del usuario"""
        if username not in self.user_memory:
            self.user_memory[username] = []
        
        # Agregar nueva interacción
        self.user_memory[username].append({
            'question': question,
            'answer': answer
        })
        
        # Limitar el tamaño de la memoria por usuario
        if len(self.user_memory[username]) > self.max_memory_per_user:
            self.user_memory[username] = self.user_memory[username][-self.max_memory_per_user:]
    
    def clear_user_memory(self, username: str = None):
        """Limpia la memoria de un usuario específico o de todos los usuarios"""
        if username:
            if username in self.user_memory:
                del self.user_memory[username]
                print(f"[MEMORIA] Memoria de {username} eliminada", flush=True)
            else:
                print(f"[MEMORIA] No hay memoria para {username}", flush=True)
        else:
            self.user_memory = {}
            print("[MEMORIA] Memoria de todos los usuarios eliminada", flush=True)
    
    def get_memory_stats(self) -> Dict[str, int]:
        """Obtiene estadísticas de la memoria"""
        return {
            'total_users': len(self.user_memory),
            'total_interactions': sum(len(interactions) for interactions in self.user_memory.values())
        }
    
    async def get_gemini_response(self, username: str, content: str) -> str:
        """Obtiene respuesta de la API de Gemini con memoria de usuario"""
        if not self.gemini_enabled:
            return "IA no disponible"
        
        try:
            client = genai.Client(api_key=self.gemini_api_key)
            
            # Usar personalidad configurada por el usuario
            contexto = self.bot_personality
            
            # Obtener memoria del usuario si existe
            memory_context = self._get_user_memory_context(username)
            
            # Mensaje completo con contexto y memoria
            mensaje_completo = f"{username}: {content}"
            if memory_context:
                mensaje_completo = memory_context + "\n\n" + mensaje_completo
                print(f"[MEMORIA] Usando contexto de memoria para {username}", flush=True)
            
            # Llamar a la API de Gemini
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[contexto, mensaje_completo]
            )
            
            # Guardar la interacción en la memoria
            self._save_to_memory(username, content, response.text)
            
            return response.text
            
        except Exception as e:
            error_str = str(e)
            
            # Manejar errores específicos de cuota
            if "429" in error_str and "RESOURCE_EXHAUSTED" in error_str:
                print(f"[IA] Cuota diaria de Gemini agotada (límite: 50 solicitudes/día)", flush=True)
                print(f"[IA] Espera hasta mañana o considera actualizar tu plan en: https://ai.google.dev/gemini-api/docs/rate-limits", flush=True)
                return "Cuota diaria agotada. Intenta mañana o actualiza tu plan de Gemini."
            
            elif "401" in error_str or "UNAUTHENTICATED" in error_str:
                print(f"[IA] API Key de Gemini inválida", flush=True)
                print(f"[IA] Verifica tu API Key en: https://aistudio.google.com/app/apikey", flush=True)
                return "API Key de Gemini inválida. Verifica tu configuración."
            
            elif "403" in error_str or "PERMISSION_DENIED" in error_str:
                print(f"[IA] Sin permisos para usar Gemini API", flush=True)
                print(f"[IA] Verifica que tu API Key tenga los permisos correctos", flush=True)
                return "Sin permisos para usar Gemini API."
            
            else:
                # Error genérico
                self.logger.error(f"Error en Gemini API: {e}")
                print(f"[IA] Error de conexión con Gemini API: {error_str}", flush=True)
                return f"Error de conexión: {error_str}"
    
    async def _google_tts_fallback(self, text: str):
        """TTS de fallback usando Google TTS gratuito cuando se agota la cuota de ElevenLabs"""
        if gTTS is None:
            print("[TTS FALLBACK] gTTS no disponible. Instala: pip install gtts", flush=True)
            return
        
        try:
            # Limpiar texto (remover emojis y caracteres especiales)
            import re
            clean_text = re.sub(r'[^\w\s\.,;:¿?¡!áéíóúñÁÉÍÓÚÑ]', '', text)
            
            # Limitar longitud
            if len(clean_text) > 200:
                clean_text = clean_text[:200]
            
            # Remover espacios extras
            clean_text = ' '.join(clean_text.split())
            
            if not clean_text.strip():
                print("[TTS FALLBACK] Texto vacío después de limpieza", flush=True)
                return
            
            print(f"[TTS FALLBACK] Usando Google TTS gratuito: '{clean_text[:50]}...'", flush=True)
            
            # Generar audio con Google TTS
            tts = gTTS(text=clean_text, lang='es', slow=False)
            
            # Guardar en archivo temporal
            temp_path = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3').name
            tts.save(temp_path)
            
            # Usar la función centralizada para reproducir audio
            if _sounddevice_available:
                success = _play_audio_on_device(temp_path, device_id=self.audio_device_id, volume=self.volume)
                if success:
                    print("[TTS FALLBACK] ✅ Audio reproducido con Google TTS usando sounddevice", flush=True)
                else:
                    # Fallback a pygame
                    print("[TTS FALLBACK] Usando pygame como fallback", flush=True)
                    if pygame is None:
                        print("[TTS FALLBACK] Pygame no disponible", flush=True)
                        return
                    
                    if not pygame.mixer.get_init():
                        pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
                    
                    pygame.mixer.music.load(temp_path)
                    pygame.mixer.music.play()
                    
                    while pygame.mixer.music.get_busy():
                        await asyncio.sleep(0.1)
                    
                    pygame.mixer.music.unload()
                    print("[TTS FALLBACK] ✅ Audio reproducido con Google TTS", flush=True)
            else:
                # Usar pygame si sounddevice no está disponible
                if pygame is None:
                    print("[TTS FALLBACK] Pygame no disponible", flush=True)
                    return
                
                if not pygame.mixer.get_init():
                    pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
                
                pygame.mixer.music.load(temp_path)
                pygame.mixer.music.play()
                
                while pygame.mixer.music.get_busy():
                    await asyncio.sleep(0.1)
                
                pygame.mixer.music.unload()
                print("[TTS FALLBACK] ✅ Audio reproducido con Google TTS", flush=True)
            
            # Limpiar archivo temporal
            try:
                await asyncio.sleep(0.2)
                os.unlink(temp_path)
            except Exception as cleanup_error:
                # Ignorar errores de limpieza
                pass
                
        except Exception as e:
            print(f"[TTS FALLBACK] Error: {e}", flush=True)
    
    async def text_to_speech(self, text: str):
        """Convierte texto a voz usando ElevenLabs con fallback automático a Google TTS"""
        
        # Si ya sabemos que la cuota se agotó, usar fallback directamente
        if self.elevenlabs_quota_exceeded:
            if not self.using_google_tts_fallback:
                print("⚠️ [TTS] Usando Google TTS gratuito (cuota de ElevenLabs agotada)", flush=True)
                self.using_google_tts_fallback = True
            await self._google_tts_fallback(text)
            return
        
        if not self.elevenlabs_enabled:
            print("[TTS] ElevenLabs no esta configurado. Configura tu API Key en el apartado de Configuracion de la interfaz", flush=True)
            print("[TTS] Obten tu API Key en: https://elevenlabs.io/app/settings/api-keys", flush=True)
            return
        
        try:
            # URL de la API de ElevenLabs
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.elevenlabs_voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.elevenlabs_api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5
                }
            }
            
            # Llamar a la API de ElevenLabs con timeout de seguridad
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            if response.status_code != 200:
                # Detectar error de cuota agotada
                if response.status_code == 401:
                    # Cuota agotada o API key inválida
                    response_data = response.json() if response.text else {}
                    error_detail = response_data.get('detail', {})
                    
                    if 'quota' in str(error_detail).lower() or 'character' in str(error_detail).lower():
                        print("🔴 [TTS] ¡CUOTA DE ELEVENLABS AGOTADA!", flush=True)
                        print("🔴 [TTS] Has alcanzado el límite de caracteres de tu plan", flush=True)
                        print("🔴 [TTS] Cambiando automáticamente a Google TTS gratuito...", flush=True)
                        print("💡 [TTS] La cuota se resetea mensualmente", flush=True)
                        print("💡 [TTS] Ver plan en: https://elevenlabs.io/app/subscription", flush=True)
                        
                        # Marcar que la cuota se agotó
                        self.elevenlabs_quota_exceeded = True
                        
                        # Usar fallback
                        await self._google_tts_fallback(text)
                        return
                
                elif response.status_code == 429:
                    # Too many requests
                    print("⚠️ [TTS] Demasiadas requests a ElevenLabs. Cambiando a Google TTS...", flush=True)
                    self.elevenlabs_quota_exceeded = True
                    await self._google_tts_fallback(text)
                    return
                
                # Otros errores
                print(f"[TTS] Error de API ElevenLabs: {response.status_code} - {response.text}", flush=True)
                print("[TTS] Intentando con Google TTS gratuito como fallback...", flush=True)
                await self._google_tts_fallback(text)
                return
            
            # Guardar audio en archivo temporal
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                temp_file.write(response.content)
                temp_file.flush()
                os.fsync(temp_file.fileno())  # Asegurar que se escriba en disco
                temp_path = temp_file.name
            
            # Verificar que el archivo existe después de crearlo
            if not os.path.exists(temp_path):
                print(f"[TTS] ❌ Error: Archivo temporal no se creó correctamente en: {temp_path}", flush=True)
                await self._google_tts_fallback(text)
                return
            
            # Verificar que el archivo no está vacío
            if os.path.getsize(temp_path) == 0:
                print(f"[TTS] ❌ Error: Archivo temporal está vacío", flush=True)
                os.unlink(temp_path)
                await self._google_tts_fallback(text)
                return
            
            # Reproducir audio
            # Nota: pygame no soporta dispositivos específicos, siempre usa el predeterminado de Windows
            # Por eso si sounddevice falla, debemos informar al usuario de esta limitación
            
            # Intentar usar sounddevice solo si está disponible
            if _sounddevice_available and sd is not None and AudioSegment is not None and np is not None:
                if self.audio_device_id is not None:
                    success = _play_audio_on_device(temp_path, device_id=self.audio_device_id, volume=self.volume)
                    
                    if success:
                        print(f"[TTS] ✅ Audio reproducido correctamente en dispositivo específico", flush=True)
                        
                        # Si se reprodujo exitosamente, resetear flag de cuota (por si se había agotado antes)
                        if self.elevenlabs_quota_exceeded:
                            self.elevenlabs_quota_exceeded = False
                            self.using_google_tts_fallback = False
                            print("[TTS] ✅ Cuota de ElevenLabs restaurada, volviendo a usar voces premium", flush=True)
                        
                        # Limpiar archivo temporal
                        try:
                            os.unlink(temp_path)
                        except:
                            pass
                        return
                    else:
                        print(f"[TTS] ❌ No se pudo reproducir en dispositivo específico", flush=True)
                        print(f"[TTS] ℹ️ Se reproducirá en el dispositivo predeterminado de Windows", flush=True)
                else:
                    # No hay dispositivo específico configurado, usar predeterminado
                    print(f"[TTS] Reproduciendo en dispositivo predeterminado", flush=True)
                    success = _play_audio_on_device(temp_path, device_id=None, volume=self.volume)
                    
                    if success:
                        print(f"[TTS] ✅ Audio reproducido correctamente", flush=True)
                        
                        # Si se reprodujo exitosamente, resetear flag de cuota
                        if self.elevenlabs_quota_exceeded:
                            self.elevenlabs_quota_exceeded = False
                            self.using_google_tts_fallback = False
                            print("[TTS] ✅ Cuota de ElevenLabs restaurada, volviendo a usar voces premium", flush=True)
                        
                        # Limpiar archivo temporal
                        try:
                            os.unlink(temp_path)
                        except:
                            pass
                        return
            
            # Si llegamos aquí, usar pygame como fallback
            print(f"[TTS] Usando pygame como método de reproducción", flush=True)
            
            if self.audio_device_id is not None:
                print(f"[TTS] ⚠️ pygame no soporta dispositivos específicos", flush=True)
                print(f"[TTS] El audio se reproducirá en el dispositivo PREDETERMINADO de Windows", flush=True)
                print(f"[TTS] Para cambiar el dispositivo, cambia el predeterminado en: Configuración → Sistema → Sonido → Dispositivo de salida", flush=True)
            
            # Usar pygame para reproducir
            if not pygame.mixer.get_init():
                pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
            
            pygame.mixer.music.load(temp_path)
            pygame.mixer.music.play()
            
            # Esperar a que termine de reproducir
            while pygame.mixer.music.get_busy():
                await asyncio.sleep(0.1)
            
            print(f"[TTS] ✅ Audio reproducido correctamente", flush=True)
            
            # Si se reprodujo exitosamente, resetear flag de cuota (por si se había agotado antes)
            if self.elevenlabs_quota_exceeded:
                self.elevenlabs_quota_exceeded = False
                self.using_google_tts_fallback = False
                print("[TTS] ✅ Cuota de ElevenLabs restaurada, volviendo a usar voces premium", flush=True)
            
            # Limpiar archivo temporal
            try:
                os.unlink(temp_path)
            except:
                pass
            
        except Exception as e:
            print(f"[TTS] Error al reproducir audio: {e}", flush=True)
            # En caso de error inesperado, intentar fallback
            print("[TTS] Intentando fallback a Google TTS...", flush=True)
            await self._google_tts_fallback(text)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtiene estadísticas del chat"""
        return {
            'total_messages': self.message_count,
            'total_commands': self.command_count,
            'blocked_users_count': len(self.blocked_users),
            'highlighted_users_count': len(self.highlighted_users),
            'filter_mode': self.filter_mode
        }
    
    def print_statistics(self):
        """Imprime estadísticas del chat"""
        stats = self.get_statistics()
        
        print("\n" + "=" * 60)
        print("ESTADISTICAS DEL CHAT")
        print("=" * 60)
        print(f"Total de mensajes: {stats['total_messages']}")
        print(f"Total de comandos: {stats['total_commands']}")
        print(f"Usuarios bloqueados: {stats['blocked_users_count']}")
        print(f"Usuarios resaltados: {stats['highlighted_users_count']}")
        print(f"Modo de filtro: {stats['filter_mode'] or 'Sin filtros'}")
        print("=" * 60)
    
    # Comandos del bot
    @commands.command(name='stats')
    async def stats_command(self, ctx):
        """Comando para mostrar estadísticas"""
        stats = self.get_statistics()
        await ctx.send(f"Mensajes: {stats['total_messages']} | Comandos: {stats['total_commands']}")
    
    @commands.command(name='block')
    async def block_command(self, ctx, username: str = None):
        """Comando para bloquear un usuario"""
        if not username:
            await ctx.send("Uso: !block <usuario>")
            return
        
        self.add_blocked_user(username)
        await ctx.send(f"Usuario {username} bloqueado")
    
    @commands.command(name='unblock')
    async def unblock_command(self, ctx, username: str = None):
        """Comando para desbloquear un usuario"""
        if not username:
            await ctx.send("Uso: !unblock <usuario>")
            return
        
        self.remove_blocked_user(username)
        await ctx.send(f"Usuario {username} desbloqueado")
    
    @commands.command(name='highlight')
    async def highlight_command(self, ctx, username: str = None):
        """Comando para resaltar un usuario"""
        if not username:
            await ctx.send("Uso: !highlight <usuario>")
            return
        
        self.add_highlighted_user(username)
        await ctx.send(f"Usuario {username} resaltado")
    
    @commands.command(name='memoria')
    async def memory_command(self, ctx):
        """Comando para ver la memoria del usuario"""
        username = ctx.author.name
        if username in self.user_memory and self.user_memory[username]:
            count = len(self.user_memory[username])
            await ctx.send(f"@{username} tengo {count} interacciones tuyas en memoria")
        else:
            await ctx.send(f"@{username} aun no tengo memoria de ti")
    
    @commands.command(name='resetmemoria')
    async def reset_memory_command(self, ctx, username: str = None):
        """Comando para resetear memoria (solo moderadores)"""
        # Solo permitir a moderadores y broadcaster
        if not ctx.author.is_mod and ctx.author.name.lower() != self.channel_name.lower():
            await ctx.send(f"@{ctx.author.name} solo moderadores pueden resetear la memoria")
            return
        
        if username:
            self.clear_user_memory(username)
            await ctx.send(f"Memoria de {username} reseteada")
        else:
            stats = self.get_memory_stats()
            self.clear_user_memory()
            await ctx.send(f"Memoria completa reseteada ({stats['total_users']} usuarios, {stats['total_interactions']} interacciones)")
    
    @commands.command(name='memstats')
    async def memory_stats_command(self, ctx):
        """Comando para ver estadísticas de memoria (solo moderadores)"""
        # Solo permitir a moderadores y broadcaster
        if not ctx.author.is_mod and ctx.author.name.lower() != self.channel_name.lower():
            return
        
        stats = self.get_memory_stats()
        await ctx.send(f"Memoria: {stats['total_users']} usuarios | {stats['total_interactions']} interacciones totales")


def stdin_listener(bot, command_queue):
    """Thread que escucha comandos desde stdin"""
    try:
        for line in sys.stdin:
            line = line.strip()
            if line:
                command_queue.put(line)
    except:
        pass


async def process_commands(bot, command_queue):
    """Procesa comandos desde la cola"""
    while True:
        try:
            # Verificar si hay comandos en la cola
            if not command_queue.empty():
                command = command_queue.get_nowait()
                
                # Procesar comando
                if command.startswith('CHANGE_VOICE:'):
                    voice_id = command.replace('CHANGE_VOICE:', '').strip()
                    bot.set_voice(voice_id)
                elif command.startswith('UPDATE_GEMINI_KEY:'):
                    gemini_key = command.replace('UPDATE_GEMINI_KEY:', '').strip()
                    bot.update_gemini_key(gemini_key)
                elif command.startswith('UPDATE_ELEVENLABS_KEY:'):
                    elevenlabs_key = command.replace('UPDATE_ELEVENLABS_KEY:', '').strip()
                    bot.update_elevenlabs_key(elevenlabs_key)
                elif command.startswith('UPDATE_PERSONALITY:'):
                    personality = command.replace('UPDATE_PERSONALITY:', '').strip()
                    bot.update_bot_personality(personality)
                elif command.startswith('UPDATE_AUDIO_DEVICE:'):
                    audio_device = command.replace('UPDATE_AUDIO_DEVICE:', '').strip()
                    bot.update_audio_device(audio_device)
                elif command.startswith('UPDATE_VOLUME:'):
                    volume = command.replace('UPDATE_VOLUME:', '').strip()
                    bot.update_volume(volume)
                elif command.startswith('UPDATE_IA_COMMAND:'):
                    ia_command = command.replace('UPDATE_IA_COMMAND:', '').strip()
                    bot.update_ia_command(ia_command)
                elif command == 'STOP':
                    break
            
            # Pequeña pausa para no saturar la CPU
            await asyncio.sleep(0.1)
        except Exception as e:
            print(f"[CMD] Error procesando comando: {e}", flush=True)


async def run_bot(channel_name: str, token: str, audio_device: Optional[int] = None, voice_id: str = "21m00Tcm4TlvDq8ikWAM", volume: int = 70, gemini_key: str = "", elevenlabs_key: str = "", bot_personality: str = "", ia_command: str = "!IA"):
    """
    Ejecuta el bot con el canal especificado
    
    Args:
        channel_name (str): Nombre del canal
        token (str): Token OAuth (REQUERIDO)
        audio_device (int): ID del dispositivo de audio (opcional)
        voice_id (str): ID de la voz de ElevenLabs (opcional)
        gemini_key (str): API Key de Google Gemini (opcional)
        elevenlabs_key (str): API Key de ElevenLabs (opcional)
        bot_personality (str): Personalidad del bot para respuestas de IA (opcional)
    
    Raises:
        ValueError: Si el token es invalido
    """
    bot = TwitchChatBotAdvanced(channel_name, token, gemini_key, elevenlabs_key, bot_personality, volume)
    
    if audio_device is not None:
        bot.set_audio_device(audio_device)
    
    # Configurar voz
    bot.elevenlabs_voice_id = voice_id
    
    # Configurar comando de IA personalizado
    bot.ia_command = ia_command
    
    # Crear cola de comandos y thread para stdin
    command_queue = queue.Queue()
    stdin_thread = threading.Thread(target=stdin_listener, args=(bot, command_queue), daemon=True)
    stdin_thread.start()
    
    try:
        # Crear tareas concurrentes
        bot_task = asyncio.create_task(bot.start())
        command_task = asyncio.create_task(process_commands(bot, command_queue))
        
        # Esperar a que termine alguna de las tareas
        await asyncio.gather(bot_task, command_task, return_exceptions=True)
    except KeyboardInterrupt:
        print("\n\nDeteniendo bot...")
        stats = bot.get_statistics()
        print(f"Estadisticas finales:")
        print(f"   Mensajes: {stats['total_messages']}")
        print(f"   Comandos: {stats['total_commands']}")
    except Exception as e:
        print(f"Error: {e}")


def main():
    """Funcion principal"""
    # Verificar si es comando especial
    if len(sys.argv) > 1 and sys.argv[1] == '--list-audio-devices':
        devices = []
        if sd is not None:
            try:
                all_devices = sd.query_devices()
                total_devices = len(all_devices)
                print(f"[AUDIO] Analizando {total_devices} dispositivos de audio...", flush=True)
                
                for i, device in enumerate(all_devices):
                    # Solo incluir dispositivos válidos con salida de audio
                    if device['max_output_channels'] > 0:
                        device_info = {
                            'id': i,
                            'name': device['name'],
                            'channels': device['max_output_channels']
                        }
                        devices.append(device_info)
                        print(f"[AUDIO] [{i}] {device['name']} ({device['max_output_channels']} canales)", flush=True)
                
                print(f"[AUDIO] Dispositivos válidos: {len(devices)} de {total_devices} totales", flush=True)
            except Exception as e:
                print(f"[AUDIO] Error al listar dispositivos: {e}", flush=True)
                devices = []
        else:
            print("[AUDIO] sounddevice no esta disponible", flush=True)
        
        import json
        print(json.dumps(devices), flush=True)
        return
    
    # Verificar si se solicita listar voces de ElevenLabs
    if len(sys.argv) > 1 and sys.argv[1] == '--list-voices':
        # Buscar si hay una API key de ElevenLabs en los argumentos
        elevenlabs_key_for_list = ""
        i = 2
        while i < len(sys.argv):
            if sys.argv[i] == '--elevenlabs-key' and i + 1 < len(sys.argv):
                elevenlabs_key_for_list = sys.argv[i + 1].strip()
                break
            i += 1
        
        # Crear bot temporal con token válido y API key para listar voces
        bot_temp = TwitchChatBotAdvanced("temp", "oauth:temp123456789012345", "", elevenlabs_key_for_list)
        voices = bot_temp.get_available_voices()
        
        import json
        print(json.dumps(voices), flush=True)
        return
    
    # Verificar argumentos
    voice_id = "21m00Tcm4TlvDq8ikWAM"  # Voz por defecto
    audio_device = None
    gemini_key = ""
    elevenlabs_key = ""
    bot_personality = ""
    
    if len(sys.argv) > 1:
        channel = sys.argv[1].strip()
        token = sys.argv[2].strip() if len(sys.argv) > 2 else None
        
        # Procesar argumentos opcionales
        i = 3
        volume = 70  # Volumen por defecto: 70%
        ia_command = '!IA'  # Comando por defecto: !IA
        while i < len(sys.argv):
            arg = sys.argv[i]
            if arg == '--voice' and i + 1 < len(sys.argv):
                voice_id = sys.argv[i + 1].strip()
                i += 2
            elif arg == '--volume' and i + 1 < len(sys.argv):
                try:
                    volume = int(sys.argv[i + 1].strip())
                    # Limitar el volumen entre 0 y 100
                    volume = max(0, min(100, volume))
                except ValueError:
                    pass
                i += 2
            elif arg == '--gemini-key' and i + 1 < len(sys.argv):
                gemini_key = sys.argv[i + 1].strip()
                i += 2
            elif arg == '--elevenlabs-key' and i + 1 < len(sys.argv):
                elevenlabs_key = sys.argv[i + 1].strip()
                i += 2
            elif arg == '--bot-personality' and i + 1 < len(sys.argv):
                bot_personality = sys.argv[i + 1].strip()
                i += 2
            elif arg == '--ia-command' and i + 1 < len(sys.argv):
                ia_command = sys.argv[i + 1].strip()
                i += 2
            elif arg.isdigit():
                audio_device = int(arg)
                i += 1
            else:
                i += 1
    else:
        print("=" * 60)
        print("Bot Avanzado de Twitch - TwitchIO")
        print("=" * 60)
        print()
        channel = input("Ingresa el nombre del canal de Twitch: ").strip()
        print()
        print("Token OAuth es REQUERIDO")
        print("Obten uno en: https://twitchtokengenerator.com/")
        print()
        token = input("Token OAuth (oauth:xxxxx): ").strip()
    
    # Validar canal
    if not channel:
        print("Debes ingresar un nombre de canal valido")
        return
    
    # Validar token
    if not token:
        print("Token OAuth es REQUERIDO para usar el bot")
        print("Obten uno en: https://twitchtokengenerator.com/")
        return
    
    if not token.startswith('oauth:'):
        print("El token debe empezar con 'oauth:'")
        print("Formato correcto: oauth:xxxxxxxxxxxxx")
        return
    
    print(f"\nIniciando bot para el canal: {channel}")
    print()
    
    # Ejecutar bot
    try:
        asyncio.run(run_bot(channel, token, audio_device, voice_id, volume, gemini_key, elevenlabs_key, bot_personality, ia_command))
    except ValueError as e:
        print(f"\nError de validacion: {e}")
    except KeyboardInterrupt:
        print("\nBot detenido por el usuario")
    except Exception as e:
        print(f"Error fatal: {e}")


if __name__ == "__main__":
    main()
