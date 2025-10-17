# 📦 Guía Completa: Subir Proyecto a GitHub

## 🎯 Requisitos Previos

- ✅ Cuenta de GitHub → [Crear cuenta](https://github.com/signup)
- ✅ Git instalado → [Descargar Git](https://git-scm.com/downloads)

### Verificar si Git está instalado:
```bash
git --version
```

Si no está instalado, descárgalo de: https://git-scm.com/downloads

---

## 📋 Paso a Paso

### **Paso 1: Crear Repositorio en GitHub**

1. Ve a: https://github.com
2. Inicia sesión con tu cuenta
3. Haz clic en el botón **"+"** (arriba a la derecha)
4. Selecciona **"New repository"**
5. Configura tu repositorio:
   ```
   Repository name:  bot-twitch-electron
   Description:      Bot profesional de Twitch con interfaz Electron
   Visibility:       ✅ Public (o Private si prefieres)
   
   ❌ NO marques:
   - Add a README file
   - Add .gitignore
   - Choose a license
   
   (Ya tenemos estos archivos)
   ```
6. Haz clic en **"Create repository"**

---

### **Paso 2: Preparar el Proyecto Localmente**

#### **2.1. Abrir Terminal en el Proyecto**

**Windows (PowerShell):**
```powershell
cd C:\Users\USUARIO\Desktop\bot_ia_v3
```

**O desde VS Code:**
- Presiona `Ctrl + Ñ` (o `Ctrl + ~`)
- Se abrirá la terminal integrada

---

#### **2.2. Configurar Git (Primera vez)**

Si es la primera vez que usas Git:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

**Ejemplo:**
```bash
git config --global user.name "Juan Pérez"
git config --global user.email "juan@gmail.com"
```

---

#### **2.3. Inicializar Repositorio Git**

```bash
git init
```

**Salida esperada:**
```
Initialized empty Git repository in C:/Users/USUARIO/Desktop/bot_ia_v3/.git/
```

---

#### **2.4. Agregar Todos los Archivos**

```bash
git add .
```

Este comando agrega todos los archivos (el `.gitignore` excluirá los innecesarios automáticamente).

---

#### **2.5. Hacer el Primer Commit**

```bash
git commit -m "Initial commit: Bot de Twitch con interfaz Electron"
```

**Salida esperada:**
```
[main (root-commit) abc1234] Initial commit: Bot de Twitch con interfaz Electron
 XX files changed, XXX insertions(+)
 create mode 100644 README.md
 create mode 100644 twitch_chat_advanced_electron.py
 ...
```

---

### **Paso 3: Conectar con GitHub**

#### **3.1. Copiar URL del Repositorio**

Después de crear el repositorio en GitHub, verás una URL como:
```
https://github.com/TU_USUARIO/bot-twitch-electron.git
```

#### **3.2. Agregar Repositorio Remoto**

```bash
git remote add origin https://github.com/TU_USUARIO/bot-twitch-electron.git
```

**Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.**

**Ejemplo:**
```bash
git remote add origin https://github.com/juanperez/bot-twitch-electron.git
```

---

#### **3.3. Verificar Conexión**

```bash
git remote -v
```

**Salida esperada:**
```
origin  https://github.com/TU_USUARIO/bot-twitch-electron.git (fetch)
origin  https://github.com/TU_USUARIO/bot-twitch-electron.git (push)
```

---

### **Paso 4: Subir Código a GitHub**

#### **4.1. Cambiar Rama a 'main' (si es necesario)**

```bash
git branch -M main
```

#### **4.2. Subir Código**

```bash
git push -u origin main
```

**Esto puede pedirte autenticación:**

**Opción A - Token de Acceso Personal (Recomendado):**

1. Ve a: https://github.com/settings/tokens
2. Clic en **"Generate new token"** → **"Classic"**
3. Dale un nombre: "Bot Twitch Upload"
4. Marca: `repo` (acceso completo a repositorios)
5. Clic en **"Generate token"**
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Cuando Git pida password, pega el **token** (no tu contraseña)

**Opción B - GitHub CLI:**
```bash
# Instalar GitHub CLI
# Windows: https://cli.github.com/

gh auth login
```

---

**Salida esperada al hacer push:**
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Delta compression using up to X threads
Compressing objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), XXX KiB | XXX MiB/s, done.
Total XX (delta X), reused 0 (delta 0)
To https://github.com/TU_USUARIO/bot-twitch-electron.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

### **Paso 5: Verificar en GitHub**

1. Ve a tu repositorio: `https://github.com/TU_USUARIO/bot-twitch-electron`
2. Deberías ver todos tus archivos
3. El `README.md` se mostrará en la página principal

---

## 🔒 IMPORTANTE: Seguridad del Token OAuth

### ⚠️ ANTES de subir, verifica:

```bash
# Buscar tokens en el código
git grep -n "oauth:" -- "*.py" "*.js"
```

Si aparece algún token real, **NO SUBAS** el código hasta eliminarlo.

### ✅ Ya está protegido:

El `.gitignore` excluye:
- `config.json` (si guardas tokens ahí)
- `node_modules/`
- Archivos de configuración local

---

## 📝 Comandos Git Útiles para el Futuro

### Ver Estado del Repositorio
```bash
git status
```

### Agregar Cambios
```bash
# Agregar archivo específico
git add archivo.py

# Agregar todos los cambios
git add .
```

### Hacer Commit
```bash
git commit -m "Descripción de los cambios"
```

### Subir Cambios
```bash
git push
```

### Ver Historial
```bash
git log --oneline
```

### Crear Nueva Rama
```bash
git checkout -b nueva-caracteristica
```

### Volver a Rama Principal
```bash
git checkout main
```

---

## 🎨 Mejorar el README en GitHub

### Agregar Badges (Opcional)

Agrega esto al inicio de tu `README.md`:

```markdown
![Python](https://img.shields.io/badge/python-3.7+-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-16+-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TwitchIO](https://img.shields.io/badge/TwitchIO-2.9+-purple.svg)
```

### Agregar Screenshots (Opcional)

1. Toma capturas de pantalla de tu aplicación
2. Crea carpeta: `docs/screenshots/`
3. Sube las imágenes
4. Agrégalas al README:

```markdown
## 📸 Capturas de Pantalla

![Interfaz Principal](./docs/screenshots/main.png)
```

---

## 🔄 Workflow de Desarrollo

### Para Hacer Cambios Futuros:

```bash
# 1. Hacer cambios en el código
# 2. Ver qué cambió
git status

# 3. Agregar cambios
git add .

# 4. Hacer commit
git commit -m "Descripción clara de los cambios"

# 5. Subir a GitHub
git push
```

---

## 🚨 Solución de Problemas

### Error: "Permission denied (publickey)"

**Solución:** Usa HTTPS en lugar de SSH:
```bash
git remote set-url origin https://github.com/TU_USUARIO/bot-twitch-electron.git
```

---

### Error: "failed to push some refs"

**Causa:** El repositorio remoto tiene cambios que no tienes localmente.

**Solución:**
```bash
git pull origin main --rebase
git push origin main
```

---

### Error: "Support for password authentication was removed"

**Solución:** Usa un Personal Access Token en lugar de tu contraseña.

1. Ve a: https://github.com/settings/tokens
2. Genera un token
3. Úsalo como contraseña cuando Git lo pida

---

### Olvidaste Agregar .gitignore Antes del Primer Commit

**Solución:**
```bash
# Eliminar node_modules del tracking
git rm -r --cached electron_app/node_modules
git commit -m "Remove node_modules from tracking"
git push
```

---

## ✅ Checklist Final

Antes de subir, verifica:

- [ ] `.gitignore` está presente
- [ ] No hay tokens OAuth en el código
- [ ] `README.md` está completo y actualizado
- [ ] No hay archivos sensibles (contraseñas, configs)
- [ ] El proyecto funciona correctamente
- [ ] Archivos innecesarios excluidos (node_modules, etc.)

---

## 📚 Recursos Adicionales

- **Git Docs**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **GitHub CLI**: https://cli.github.com/

---

## 🎯 Resumen de Comandos

```bash
# Inicializar
git init
git add .
git commit -m "Initial commit"

# Conectar con GitHub
git remote add origin https://github.com/TU_USUARIO/REPO.git
git branch -M main

# Subir
git push -u origin main

# Para cambios futuros
git add .
git commit -m "Descripción"
git push
```

---

**¡Listo! Tu proyecto estará en GitHub y disponible para todo el mundo!** 🚀✨

---

## 💡 Siguiente Nivel: GitHub Actions (Opcional)

Para CI/CD automático, puedes crear `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: pip install -r requirements.txt
```

Pero esto es opcional para después. 🎓

