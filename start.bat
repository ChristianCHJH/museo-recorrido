@echo off
REM Script para levantar el proyecto Museo QR con Docker Compose

echo.
echo ========================================
echo   MUSEO QR - Docker Compose
echo ========================================
echo.

REM Verificar que Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no está instalado o no está en PATH
    pause
    exit /b 1
)

echo [✓] Docker encontrado

REM Verificar que PostgreSQL está corriendo
echo.
echo Verificando PostgreSQL en localhost:5432...
timeout /t 2 /nobreak >nul

REM Compilar e iniciar servicios
echo.
echo [•] Compilando backend y frontend...
echo [•] Esto puede tomar 3-5 minutos en la primera ejecución
echo.

docker-compose up --build

REM Si falla, mostrar error
if errorlevel 1 (
    echo.
    echo ERROR: Fallo al iniciar Docker Compose
    pause
    exit /b 1
)
