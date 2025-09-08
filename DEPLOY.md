# 🚀 Guía de Despliegue - GEMS CRM

## ✅ Despliegue Automático (GitHub Actions)

El despliegue se ejecuta automáticamente cuando haces push a `main`:

- **Workflow**: `.github/workflows/deploy.yml`
- **Método**: Deploy directo a rama `gh-pages`
- **URL**: https://sebastianpg12.github.io/GEMS-CRM/

## ✅ Despliegue Manual

### Opción 1: Script PowerShell
```powershell
.\deploy.ps1
```

### Opción 2: npm command
```bash
npm run deploy
```

## 🔧 Configuración

### Variables de Entorno (Solo en Workflow)
Las variables se configuran directamente en el workflow:
- `VITE_API_BASE_URL_PROD`: https://gems-crm-backend.onrender.com/api
- `VITE_APP_NAME`: GEMS CRM
- `VITE_DEBUG_MODE`: false

### Detección Automática
- **Desarrollo**: localhost → `http://localhost:4000/api`
- **Producción**: GitHub Pages → `https://gems-crm-backend.onrender.com/api`

## 🌐 URLs

- **Frontend**: https://sebastianpg12.github.io/GEMS-CRM/
- **Backend**: https://gems-crm-backend.onrender.com/api

## 🛠️ Troubleshooting

### Build falla localmente
1. Verificar Node.js: `node --version` (requiere >=20.19.0)
2. Limpiar cache: `npm cache clean --force`  
3. Reinstalar: `npm ci`
4. Build: `npm run build`

### Despliegue manual falla
- Verificar que git está configurado
- Verificar conexión a internet
- Ejecutar: `git pull origin main` antes del deploy

---
**Configuración simplificada - Sin archivos .env en repo**
