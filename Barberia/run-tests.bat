@echo off
REM Script para ejecutar todas las pruebas de stress y seguridad
REM Uso: run-tests.bat

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo   🧪 EJECUTOR DE PRUEBAS - SISTEMA DE BARBERÍA
echo ═══════════════════════════════════════════════════════════════════════════
echo.

REM Verificar que el backend está corriendo
echo Verificando servidor en puerto 3001...
netstat -ano | findstr ":3001" >nul 2>&1
if errorlevel 1 (
    echo ❌ El servidor no está disponible en http://localhost:3001
    echo.
    echo Para iniciar el servidor:
    echo   1. Abre otra terminal
    echo   2. cd backend
    echo   3. npm run dev
    echo.
    pause
    exit /b 1
)

echo ✅ Servidor disponible
echo.

:menu
echo ¿Qué pruebas deseas ejecutar?
echo.
echo 1. Pruebas de STRESS (Carga, rendimiento, memory)
echo 2. Pruebas de SEGURIDAD (Inyecciones, XSS, Auth)
echo 3. Ambas (STRESS + SEGURIDAD)
echo 4. Salir
echo.
set /p choice="Selecciona opción (1-4): "

if "%choice%"=="1" goto stress
if "%choice%"=="2" goto security
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end

echo.
echo ❌ Opción no válida
echo.
goto menu

:stress
echo.
echo 🔥 Ejecutando PRUEBAS DE STRESS...
echo.
echo Recomendación: node --expose-gc tests/stress-tests.js (para memory leak detection)
echo.
node --expose-gc tests/stress-tests.js
pause
goto menu

:security
echo.
echo 🔐 Ejecutando PRUEBAS DE SEGURIDAD...
echo.
node tests/security-tests.js
pause
goto menu

:both
echo.
echo 🔥 Ejecutando PRUEBAS DE STRESS...
echo.
node --expose-gc tests/stress-tests.js
echo.
echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo Presiona Enter para continuar con PRUEBAS DE SEGURIDAD...
echo ═══════════════════════════════════════════════════════════════════════════
echo.
pause
echo.
echo 🔐 Ejecutando PRUEBAS DE SEGURIDAD...
echo.
node tests/security-tests.js
pause
goto menu

:end
echo.
echo 👋 Hasta luego!
echo.
pause
