$process = Start-Process cloudflared -ArgumentList "tunnel", "--url", "http://localhost:5173" -NoNewWindow -PassThru -RedirectStandardOutput cloudflare-output.txt -RedirectStandardError cloudflare-error.txt

Write-Host "Cloudflare Tunnel iniciado. ID: $($process.Id)"
Write-Host "Esperando URL..."
Start-Sleep -Seconds 3

# Busca la URL en los logs
$output = Get-Content cloudflare-output.txt -ErrorAction SilentlyContinue
$error = Get-Content cloudflare-error.txt -ErrorAction SilentlyContinue

Write-Host "=== SALIDA ==="
$output | Where-Object {$_ -match "trycloudflare|https://"}
Write-Host "=== ERROR ==="
$error | Where-Object {$_ -match "trycloudflare|https://"}

# Guarda todo para revisar después
Write-Host "Logs guardados en: cloudflare-output.txt"
