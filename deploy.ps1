# Script de despliegue para GitHub Pages (PowerShell)

Write-Host "🚀 Iniciando despliegue en GitHub Pages..." -ForegroundColor Yellow

# Variables
$REPO_URL = "https://github.com/sebastianpg12/GEMS-CRM.git"
$BRANCH_DEPLOY = "gh-pages"
$BUILD_DIR = "dist"

try {
    # Limpiar directorio de build anterior
    Write-Host "🧹 Limpiando build anterior..." -ForegroundColor Cyan
    if (Test-Path $BUILD_DIR) {
        Remove-Item -Recurse -Force $BUILD_DIR
    }

    # Instalar dependencias
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "Error instalando dependencias" }

    # Build para producción
    Write-Host "🏗️ Construyendo aplicación para producción..." -ForegroundColor Cyan
    $env:NODE_ENV = "production"
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Error en el build" }

    # Verificar que el build fue exitoso
    if (!(Test-Path $BUILD_DIR)) {
        throw "Error: El directorio de build no existe"
    }

    # Navegar al directorio de build
    Push-Location $BUILD_DIR

    # Inicializar repositorio Git en el directorio de build
    Write-Host "📤 Desplegando a GitHub Pages..." -ForegroundColor Cyan
    git init
    git add -A
    git commit -m "🚀 Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    # Configurar el remote y push a gh-pages
    git branch -M $BRANCH_DEPLOY
    git remote add origin $REPO_URL
    git push -f origin $BRANCH_DEPLOY

    # Volver al directorio raíz
    Pop-Location

    Write-Host "✅ Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "🌐 URL: https://sebastianpg12.github.io/GEMS-CRM/" -ForegroundColor Green

} catch {
    Write-Host "❌ Error durante el despliegue: $_" -ForegroundColor Red
    if (Get-Location | Select-Object -ExpandProperty Path | Select-String $BUILD_DIR) {
        Pop-Location
    }
    exit 1
}
