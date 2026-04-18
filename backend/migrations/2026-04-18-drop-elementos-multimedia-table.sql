-- Migration: Drop elementos_multimedia table
-- Description: Remover la tabla de elementos multimedia ya que la funcionalidad ha sido reemplazada por el sistema de bloques
-- Date: 2026-04-18

DROP TABLE IF EXISTS elementos_multimedia CASCADE;
