@echo off
REM Detener servicios Docker Compose

echo.
echo Deteniendo servicios...
docker-compose down

echo.
echo [✓] Servicios detenidos
echo.
pause
