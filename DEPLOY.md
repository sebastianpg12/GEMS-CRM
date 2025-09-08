# 🚀 Guía de Despliegue - GEMS CRM

## GitHub Pages (Automático)

El proyecto está configurado con **GitHub Actions** para despliegue automático:

### ✅ Configuración Automática
- **Trigger**: Push a `main` branch
- **URL**: https://sebastianpg12.github.io/GEMS-CRM/
- **Archivo**: `.github/workflows/deploy.yml`

### 🔧 Variables de Entorno (Producción)
```env
VITE_API_BASE_URL_PROD=https://gems-crm-backend.onrender.com/api
VITE_APP_NAME=GEMS CRM
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
```

## Despliegue Manual

### PowerShell (Windows)
```powershell
.\deploy.ps1
```

### Bash (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

## Verificación Post-Despliegue

1. **Frontend**: https://sebastianpg12.github.io/GEMS-CRM/
2. **Backend**: https://gems-crm-backend.onrender.com/api
3. **Configuración**: Verificar que las rutas funcionen sin `/GEMS-CRM/` en dev

## Troubleshooting

### Problema: Rutas no funcionan
- ✅ **Solución**: `vite.config.ts` tiene configuración automática de base URL
- Dev: `base: '/'` 
- Prod: `base: '/GEMS-CRM/'`

### Problema: API no conecta
- ✅ **Solución**: Configuración automática en `src/config/api.ts`
- Dev: `http://localhost:4000/api`
- Prod: `https://gems-crm-backend.onrender.com/api`

### Problema: GitHub Actions falla
- Verificar permisos de GitHub Pages en Settings
- Verificar que las variables de entorno estén configuradas
- Revisar logs en Actions tab

## Estados del Despliegue

- 🟢 **Desarrollo**: `npm run dev` → http://localhost:5173/
- 🟡 **Build Local**: `npm run build` → carpeta `dist/`  
- 🚀 **Producción**: GitHub Actions → GitHub Pages

---
**Última actualización**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
