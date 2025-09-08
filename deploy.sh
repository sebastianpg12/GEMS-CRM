#!/bin/bash
# Script para despliegue manual en GitHub Pages

echo "🚀 Iniciando despliegue en GitHub Pages..."

# Variables
REPO_URL="https://github.com/sebastianpg12/GEMS-CRM.git"
BRANCH_DEPLOY="gh-pages"
BUILD_DIR="dist"

# Limpiar directorio de build anterior
echo "🧹 Limpiando build anterior..."
rm -rf $BUILD_DIR

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Build para producción
echo "🏗️ Construyendo aplicación para producción..."
NODE_ENV=production npm run build

# Verificar que el build fue exitoso
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Error: El directorio de build no existe"
  exit 1
fi

# Navegar al directorio de build
cd $BUILD_DIR

# Inicializar repositorio Git en el directorio de build
git init
git add -A
git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Configurar el remote y push a gh-pages
git branch -M $BRANCH_DEPLOY
git remote add origin $REPO_URL
git push -f origin $BRANCH_DEPLOY

# Volver al directorio raíz
cd ..

echo "✅ Despliegue completado exitosamente!"
echo "🌐 URL: https://sebastianpg12.github.io/GEMS-CRM/"
