@echo off
REM Inicia Cloudflare Tunnel y captura la URL
cloudflared tunnel --url http://localhost:5173 2>&1 | tee cloudflare-tunnel.log
pause
