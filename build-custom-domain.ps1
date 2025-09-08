#!/usr/bin/env pwsh

# Script para buildear el proyecto para dominio personalizado
# Este build NO incluye el prefijo /GEMS-CRM/ en las rutas

Write-Host "🚀 Construyendo para dominio personalizado: crmgemsinterno.gemsinnovations.com" -ForegroundColor Green

# Limpiar dist anterior
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force
    Write-Host "✅ Carpeta dist limpiada" -ForegroundColor Yellow
}

# Buildear sin prefijo de GitHub Pages
Write-Host "📦 Ejecutando build para dominio personalizado..." -ForegroundColor Cyan
npm run build-custom

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completado exitosamente!" -ForegroundColor Green
    Write-Host "📁 Archivos listos en ./dist/" -ForegroundColor Blue
    Write-Host "" -ForegroundColor White
    Write-Host "🌐 Para subir a tu servidor:" -ForegroundColor Yellow
    Write-Host "   1. Copia todo el contenido de ./dist/" -ForegroundColor White
    Write-Host "   2. Sube los archivos a tu dominio crmgemsinterno.gemsinnovations.com" -ForegroundColor White
    Write-Host "   3. Asegúrate que el servidor esté configurado como SPA" -ForegroundColor White
} else {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}
