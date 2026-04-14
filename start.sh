#!/bin/bash

# Script para levantar el proyecto Museo QR con Docker Compose

echo ""
echo "========================================"
echo "  MUSEO QR - Docker Compose"
echo "========================================"
echo ""

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado"
    exit 1
fi

echo "[✓] Docker encontrado"

# Verificar docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: docker-compose no está instalado"
    exit 1
fi

echo "[✓] docker-compose encontrado"

# Verificar PostgreSQL
echo ""
echo "Verificando PostgreSQL en localhost:5432..."
sleep 2

# Compilar e iniciar servicios
echo ""
echo "[•] Compilando backend y frontend..."
echo "[•] Esto puede tomar 3-5 minutos en la primera ejecución"
echo ""

docker-compose up --build

# Si falla, mostrar error
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Fallo al iniciar Docker Compose"
    exit 1
fi
