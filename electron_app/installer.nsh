; Script de instalación personalizado para Bot Twitch IA Assistant

; Ejecutar después de instalar
!macro customInstall
  DetailPrint "Iniciando instalacion de dependencias de Python..."
  
  ; Ejecutar el script de instalación silenciosa (sin mostrar consola)
  nsExec::Exec '"$INSTDIR\install-deps-silent.bat"'
  
  ; Verificar si la instalación fue exitosa
  Pop $0
  IntCmp $0 0 skip_error
    DetailPrint "Advertencia: Algunas dependencias pueden no haberse instalado correctamente."
    DetailPrint "Puedes ejecutar manualmente install-python-deps.bat si es necesario."
    Goto skip_success
  
  skip_error:
    DetailPrint "Dependencias instaladas correctamente."
  
  skip_success:
!macroend

; Crear archivo de inicio en el escritorio
!macro customUninstall
  ; Eliminar dependencias de Python si el usuario lo desea
  MessageBox MB_YESNO|MB_ICONQUESTION "¿Deseas eliminar las dependencias de Python?$\n$\nEsto ejecutará el script de desinstalación." IDYES skip
  ExecWait '"$INSTDIR\python\python.exe" -m pip uninstall -y -r "$INSTDIR\requirements.txt"'
  ExecWait 'python -m pip uninstall -y -r "$INSTDIR\requirements.txt"'
  ExecWait 'python3 -m pip uninstall -y -r "$INSTDIR\requirements.txt"'
  skip:
!macroend


