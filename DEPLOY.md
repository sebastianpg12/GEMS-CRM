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

## 🌐 Despliegue en Dominio Personalizado

### Para tu dominio: `crmgemsinterno.gemsinnovations.com`

#### Método 1: Script Automatizado
```powershell
.\build-custom-domain.ps1
```

#### Método 2: Manual
```bash
npm run build-custom
```

**Importante**: El build para dominio personalizado **NO** incluye el prefijo `/GEMS-CRM/` en las rutas.

### Configuración del Servidor

1. **Subir archivos**: Copia todo el contenido de `./dist/` a tu servidor
2. **Configurar como SPA**: El servidor debe redirigir todas las rutas a `index.html`

#### Ejemplo Nginx:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Ejemplo Apache (.htaccess):
```apache
RewriteEngine On
RewriteRule ^(?!.*\.).*$ /index.html [L]
```

## 🔧 Configuración

### Variables de Entorno (Solo en Workflow)
Las variables se configuran directamente en el workflow:
- `VITE_API_BASE_URL_PROD`: https://gems-crm-backend.onrender.com/api
- `VITE_APP_NAME`: GEMS CRM
- `VITE_DEBUG_MODE`: false

### Detección Automática de API
- **Desarrollo**: localhost → `http://localhost:4000/api`
- **Producción**: Cualquier dominio → `https://gems-crm-backend.onrender.com/api`

## 🌐 URLs

- **GitHub Pages**: https://sebastianpg12.github.io/GEMS-CRM/
- **Dominio Personalizado**: https://crmgemsinterno.gemsinnovations.com/
- **Backend**: https://gems-crm-backend.onrender.com/api

## 🛠️ Troubleshooting

### Error: Assets 404 en dominio personalizado
**Causa**: Las rutas incluyen `/GEMS-CRM/` cuando no deberían
**Solución**: Usar `npm run build-custom` en lugar de `npm run build`

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
