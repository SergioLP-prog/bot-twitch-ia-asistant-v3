"""
Bot avanzado de Twitch con interfaz Electron
Versión mejorada con TwitchIO y compatibilidad con GUI
"""

import sys
import io
import asyncio
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

# Configurar la salida estándar para UTF-8 (soluciona problemas en Windows)
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    from twitchio.ext import commands
    from twitchio import Channel, User
except ImportError:
    print("❌ Error: TwitchIO no está instalado")
    print("Instala con: pip install twitchio")
    sys.exit(1)


class TwitchChatBotAdvanced(commands.Bot):
    """
    Bot avanzado de Twitch con capacidades mejoradas
    Compatible con interfaz Electron
    """
    
    def __init__(self, channel_name: str, token: str):
        """
        Inicializa el bot avanzado
        
        Args:
            channel_name (str): Nombre del canal a monitorear
            token (str): Token OAuth de Twitch (REQUERIDO)
        
        Raises:
            ValueError: Si el token no es proporcionado o es inválido
        """
        # Validar token
        if not token:
            raise ValueError("❌ Token OAuth es REQUERIDO. Obtén uno en: https://twitchtokengenerator.com/")
        
        if not token.startswith('oauth:'):
            raise ValueError("❌ El token debe empezar con 'oauth:'. Formato: oauth:xxxxxxxxxxxxx")
        
        if len(token) < 15:
            raise ValueError("❌ Token inválido. Debe tener al menos 15 caracteres")
        
        super().__init__(
            token=token,
            prefix='!',
            initial_channels=[channel_name]
        )
        
        self.channel_name = channel_name
        self.message_count = 0
        self.command_count = 0
        self.user_messages: Dict[str, int] = {}
        self.unique_users = set()
        
        # Configuración de filtros
        self.blocked_users: List[str] = []
        self.highlighted_users: List[str] = []
        self.filter_mode: Optional[str] = None  # 'allowed_only', 'highlight', None
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Callback para interfaz Electron
        self.electron_callback = None
        
    def set_electron_callback(self, callback):
        """Establece callback para comunicación con Electron"""
        self.electron_callback = callback
        
    async def event_ready(self):
        """Se ejecuta cuando el bot se conecta exitosamente"""
        print("╔═══════════════════════════════════════════════════════════╗", flush=True)
        print("║       🤖 Bot Avanzado de Twitch - Conectado               ║", flush=True)
        print(f"║  ✓ Canal: {self.channel_name.ljust(30)} ║", flush=True)
        print("╚═══════════════════════════════════════════════════════════╝", flush=True)
        print(f"🕐 Hora de inicio: {datetime.now().strftime('%H:%M:%S')}", flush=True)
        print("📊 Modo: Lectura avanzada con filtros y estadísticas", flush=True)
        print("⚠️ IMPORTANTE: El canal debe estar EN VIVO para recibir mensajes", flush=True)
        print("=" * 60, flush=True)
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
        username = message.author.name
        self.unique_users.add(username)
        
        # Rastrear mensajes por usuario
        if username not in self.user_messages:
            self.user_messages[username] = 0
        self.user_messages[username] += 1
        
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
                'username': username,
                'message': message.content,
                'badges': self._get_badges(message),
                'color': getattr(message.author, 'color', None),
                'timestamp': datetime.now().strftime('%H:%M:%S'),
                'is_command': message.content.startswith('!'),
                'is_mod': message.author.is_mod,
                'is_subscriber': message.author.is_subscriber
            })
        
        # Procesar comandos
        if message.content.startswith('!'):
            await self.handle_commands(message)
    
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
            highlight = "⭐ "
        
        # Obtener color del usuario
        color = getattr(message.author, 'color', None)
        color_str = f"(#{color}) " if color else ""
        
        # Indicar si es comando
        command_indicator = "🤖 " if content.startswith('!') else ""
        
        return f"{command_indicator}{highlight}{badge_str}{color_str}{username}: {content}"
    
    def add_blocked_user(self, username: str):
        """Agrega un usuario a la lista de bloqueados"""
        if username not in self.blocked_users:
            self.blocked_users.append(username)
            print(f"🚫 Usuario bloqueado: {username}")
    
    def remove_blocked_user(self, username: str):
        """Remueve un usuario de la lista de bloqueados"""
        if username in self.blocked_users:
            self.blocked_users.remove(username)
            print(f"✅ Usuario desbloqueado: {username}")
    
    def add_highlighted_user(self, username: str):
        """Agrega un usuario a la lista de resaltados"""
        if username not in self.highlighted_users:
            self.highlighted_users.append(username)
            print(f"⭐ Usuario resaltado: {username}")
    
    def remove_highlighted_user(self, username: str):
        """Remueve un usuario de la lista de resaltados"""
        if username in self.highlighted_users:
            self.highlighted_users.remove(username)
            print(f"✅ Usuario sin resaltar: {username}")
    
    def set_filter_mode(self, mode: Optional[str]):
        """Establece el modo de filtro"""
        self.filter_mode = mode
        modes = {
            None: "Sin filtros",
            'allowed_only': "Solo usuarios permitidos",
            'highlight': "Resaltar usuarios especiales"
        }
        print(f"🔧 Modo de filtro: {modes.get(mode, 'Desconocido')}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtiene estadísticas del chat"""
        # Top usuarios más activos
        top_users = sorted(
            self.user_messages.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        return {
            'total_messages': self.message_count,
            'total_commands': self.command_count,
            'unique_users': len(self.unique_users),
            'top_users': top_users,
            'blocked_users_count': len(self.blocked_users),
            'highlighted_users_count': len(self.highlighted_users),
            'filter_mode': self.filter_mode
        }
    
    def print_statistics(self):
        """Imprime estadísticas del chat"""
        stats = self.get_statistics()
        
        print("\n" + "=" * 60)
        print("📊 ESTADÍSTICAS DEL CHAT")
        print("=" * 60)
        print(f"📨 Total de mensajes: {stats['total_messages']}")
        print(f"🤖 Total de comandos: {stats['total_commands']}")
        print(f"👥 Usuarios únicos: {stats['unique_users']}")
        print(f"🚫 Usuarios bloqueados: {stats['blocked_users_count']}")
        print(f"⭐ Usuarios resaltados: {stats['highlighted_users_count']}")
        print(f"🔧 Modo de filtro: {stats['filter_mode'] or 'Sin filtros'}")
        
        if stats['top_users']:
            print("\n🏆 TOP 10 USUARIOS MÁS ACTIVOS:")
            print("-" * 40)
            for i, (user, count) in enumerate(stats['top_users'], 1):
                print(f"{i:2d}. {user:<20} ({count} mensajes)")
        
        print("=" * 60)
    
    # Comandos del bot
    @commands.command(name='stats')
    async def stats_command(self, ctx):
        """Comando para mostrar estadísticas"""
        stats = self.get_statistics()
        await ctx.send(f"📊 Mensajes: {stats['total_messages']} | Usuarios: {stats['unique_users']} | Comandos: {stats['total_commands']}")
    
    @commands.command(name='block')
    async def block_command(self, ctx, username: str = None):
        """Comando para bloquear un usuario"""
        if not username:
            await ctx.send("❌ Uso: !block <usuario>")
            return
        
        self.add_blocked_user(username)
        await ctx.send(f"🚫 Usuario {username} bloqueado")
    
    @commands.command(name='unblock')
    async def unblock_command(self, ctx, username: str = None):
        """Comando para desbloquear un usuario"""
        if not username:
            await ctx.send("❌ Uso: !unblock <usuario>")
            return
        
        self.remove_blocked_user(username)
        await ctx.send(f"✅ Usuario {username} desbloqueado")
    
    @commands.command(name='highlight')
    async def highlight_command(self, ctx, username: str = None):
        """Comando para resaltar un usuario"""
        if not username:
            await ctx.send("❌ Uso: !highlight <usuario>")
            return
        
        self.add_highlighted_user(username)
        await ctx.send(f"⭐ Usuario {username} resaltado")


async def run_bot(channel_name: str, token: str):
    """
    Ejecuta el bot con el canal especificado
    
    Args:
        channel_name (str): Nombre del canal
        token (str): Token OAuth (REQUERIDO)
    
    Raises:
        ValueError: Si el token es inválido
    """
    bot = TwitchChatBotAdvanced(channel_name, token)
    
    try:
        await bot.start()
    except KeyboardInterrupt:
        print("\n\n⏹ Deteniendo bot...")
        stats = bot.get_statistics()
        print(f"📊 Estadísticas finales:")
        print(f"   Mensajes: {stats['total_messages']}")
        print(f"   Usuarios: {stats['unique_users']}")
        print(f"   Comandos: {stats['total_commands']}")
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    """Función principal"""
    # Verificar argumentos
    if len(sys.argv) > 1:
        channel = sys.argv[1].strip()
        token = sys.argv[2].strip() if len(sys.argv) > 2 else None
    else:
        print("╔═══════════════════════════════════════════════════════════╗")
        print("║       🤖 Bot Avanzado de Twitch - TwitchIO              ║")
        print("╚═══════════════════════════════════════════════════════════╝")
        print()
        channel = input("Ingresa el nombre del canal de Twitch: ").strip()
        print()
        print("⚠️ Token OAuth es REQUERIDO")
        print("📖 Obtén uno en: https://twitchtokengenerator.com/")
        print()
        token = input("Token OAuth (oauth:xxxxx): ").strip()
    
    # Validar canal
    if not channel:
        print("❌ Debes ingresar un nombre de canal válido")
        return
    
    # Validar token
    if not token:
        print("❌ Token OAuth es REQUERIDO para usar el bot")
        print("📖 Obtén uno en: https://twitchtokengenerator.com/")
        return
    
    if not token.startswith('oauth:'):
        print("❌ El token debe empezar con 'oauth:'")
        print("📝 Formato correcto: oauth:xxxxxxxxxxxxx")
        return
    
    print(f"\n🚀 Iniciando bot para el canal: {channel}")
    print("💡 Tip: Usa Ctrl+C para detener el bot")
    print()
    
    # Ejecutar bot
    try:
        asyncio.run(run_bot(channel, token))
    except ValueError as e:
        print(f"\n❌ Error de validación: {e}")
    except KeyboardInterrupt:
        print("\n👋 Bot detenido por el usuario")
    except Exception as e:
        print(f"❌ Error fatal: {e}")


if __name__ == "__main__":
    main()
