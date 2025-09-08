# Script de despliegue para GitHub Pages (PowerShell)
# Método alternativo usando gh-pages directamente

Write-Host "🚀 Iniciando despliegue en GitHub Pages..." -ForegroundColor Yellow

# Variables
$BRANCH_DEPLOY = "gh-pages"
$BUILD_DIR = "dist"

try {
    # Verificar que estamos en la rama main
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "main") {
        Write-Host "⚠️  Advertencia: No estás en la rama main. Rama actual: $currentBranch" -ForegroundColor Yellow
    }

    # Asegurar que tenemos los últimos cambios
    Write-Host "📥 Sincronizando con el repositorio remoto..." -ForegroundColor Cyan
    git fetch origin
    git pull origin main

    # Limpiar directorio de build anterior
    Write-Host "🧹 Limpiando build anterior..." -ForegroundColor Cyan
    if (Test-Path $BUILD_DIR) {
        Remove-Item -Recurse -Force $BUILD_DIR
    }

    # Verificar versión de Node.js
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan

    # Limpiar cache de npm
    Write-Host "🗑️ Limpiando cache de npm..." -ForegroundColor Cyan
    npm cache clean --force

    # Instalar dependencias
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "Error instalando dependencias" }

    # Build para producción
    Write-Host "🏗️ Construyendo aplicación para producción..." -ForegroundColor Cyan
    $env:NODE_ENV = "production"
    $env:VITE_API_BASE_URL_PROD = "https://gems-crm-backend.onrender.com/api"
    $env:VITE_APP_NAME = "GEMS CRM"
    $env:VITE_DEBUG_MODE = "false"
    
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Error en el build" }

    # Verificar que el build fue exitoso
    if (!(Test-Path $BUILD_DIR)) {
        throw "Error: El directorio de build no existe"
    }

    # Usar gh-pages para el despliegue
    Write-Host "📤 Desplegando con gh-pages..." -ForegroundColor Cyan
    npx gh-pages -d $BUILD_DIR -m "🚀 Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Despliegue completado exitosamente!" -ForegroundColor Green
        Write-Host "🌐 URL: https://sebastianpg12.github.io/GEMS-CRM/" -ForegroundColor Green
        Write-Host "⏱️  El sitio puede tardar unos minutos en actualizarse" -ForegroundColor Yellow
    } else {
        throw "Error durante el despliegue con gh-pages"
    }

} catch {
    Write-Host "❌ Error durante el despliegue: $_" -ForegroundColor Red
    exit 1
}
