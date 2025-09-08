# Script simple para reemplazar múltiples líneas específicas
$filePath = "src/components/modules/ActivitiesView.vue"

Write-Host "Iniciando reemplazo múltiple..."

# Leer todo el contenido
$content = Get-Content $filePath -Raw

# Reemplazos múltiples
$content = $content -replace '\{\{\s*getAssignedToName\(activity\.assignedToUser\)\s*\}\}', '{{ getSmartAssignedName(activity) }}'

Write-Host "Guardando archivo..."
Set-Content $filePath -Value $content -NoNewline

Write-Host "¡Reemplazo completado!"

# Verificar
$newContent = Get-Content $filePath -Raw
$matches = ([regex]'getSmartAssignedName\(activity\)').Matches($newContent)
Write-Host "Nuevas llamadas encontradas: $($matches.Count)"
