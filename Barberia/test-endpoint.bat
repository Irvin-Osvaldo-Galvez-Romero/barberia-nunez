@echo off
REM Script para probar el endpoint de generación de invitación

echo Probando endpoint POST /api/google/generar-invitacion...
echo.

curl -X POST http://localhost:3001/api/google/generar-invitacion ^
  -H "Content-Type: application/json" ^
  -d "{\"barberoId\":\"test-id\",\"barberoEmail\":\"test@example.com\"}" ^
  -v

echo.
echo.
echo Si ves un error 500, revisa los logs del backend.
echo Si ves un 200, el email debería haber sido enviado.
pause
