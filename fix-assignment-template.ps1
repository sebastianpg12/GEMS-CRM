# Script para reemplazar las llamadas de template problemáticas
$filePath = "src/components/modules/ActivitiesView.vue"
$originalText = "getAssignedToName(activity.assignedToUser)"
$newText = "getSmartAssignedName(activity)"

Write-Host "Leyendo archivo..."
$content = Get-Content $filePath -Raw

Write-Host "Buscando ocurrencias de: $originalText"
$matches = [regex]::Matches($content, [regex]::Escape($originalText))
Write-Host "Encontradas $($matches.Count) ocurrencias"

if ($matches.Count -gt 0) {
    Write-Host "Reemplazando..."
    $content = $content -replace [regex]::Escape($originalText), $newText
    
    Write-Host "Guardando archivo..."
    Set-Content $filePath -Value $content -NoNewline
    
    Write-Host "¡Reemplazo completado!"
} else {
    Write-Host "No se encontraron ocurrencias para reemplazar"
}

Write-Host "Verificando resultado..."
$verifyContent = Get-Content $filePath -Raw
$newMatches = [regex]::Matches($verifyContent, [regex]::Escape($newText))
Write-Host "Ahora hay $($newMatches.Count) ocurrencias de: $newText"
