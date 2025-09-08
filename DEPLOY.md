# 🚀 Guía de Despliegue - GEMS CRM

## Problema con GitHub Pages

Si ves el error: *"Branch 'main' is not allowed to deploy to github-pages due to environment protection rules"*, hay varias soluciones:

## ✅ Solución 1: Configurar GitHub Pages correctamente

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. En "Source", selecciona **"Deploy from a branch"**
4. Selecciona la rama **"gh-pages"** 
5. Carpeta: **"/ (root)"**

## ✅ Solución 2: Despliegue Manual (Recomendado)

### PowerShell (Windows)
```powershell
.\deploy.ps1
```

### Bash (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

### npm script
```bash
npm run deploy
```

## ✅ Solución 3: GitHub Actions Alternativo

Tenemos 2 workflows configurados:

### 1. `deploy.yml` - GitHub Pages Actions
- Usa la nueva API de GitHub Pages
- Requiere configuración específica en Settings

### 2. `deploy-gh-pages.yml` - Rama gh-pages
- Usa el método tradicional con rama gh-pages
- Más compatible con configuraciones existentes

## 🔧 Configuración Automática

### Variables de Entorno (Producción)
```env
VITE_API_BASE_URL_PROD=https://gems-crm-backend.onrender.com/api
VITE_APP_NAME=GEMS CRM
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
```

### Detección Automática de Ambiente
- **Desarrollo**: `localhost` → API local (`http://localhost:4000/api`)
- **Producción**: Cualquier dominio → API de producción

## 🌐 URLs del Proyecto

- **Frontend**: https://sebastianpg12.github.io/GEMS-CRM/
- **Backend**: https://gems-crm-backend.onrender.com/api

## 🛠️ Troubleshooting

### Error: "environment protection rules"
**Solución**: Cambiar source en GitHub Pages Settings a "Deploy from a branch" → "gh-pages"

### Error: Node.js version
**Solución**: Usamos Node.js 22 en workflow, versiones compatibles: >=20.19.0

### Error: crypto.hash is not a function
**Solución**: Downgraded Vite a v5.4.10 para compatibilidad

### Error: Build fails
1. Verificar versión de Node.js: `node --version`
2. Limpiar cache: `npm cache clean --force`
3. Reinstalar: `npm ci`
4. Build local: `npm run build`

## 📈 Estados del Despliegue

- 🟢 **Desarrollo**: `npm run dev` → http://localhost:5173/
- 🟡 **Build Local**: `npm run build` → carpeta `dist/`  
- 🚀 **Producción**: GitHub Actions o Manual → GitHub Pages

---
**Última actualización**: 2025-01-08
