/**
 * Utilidades para mapear respuestas de API con campos dinámicos
 */

type ApiObject = Record<string, unknown>;

/**
 * Obtiene el primer valor de texto no vacío de un objeto usando múltiples claves posibles
 */
export function obtenerTexto(obj: ApiObject | null | undefined, claves: string[]): string | null {
  if (!obj) {
    return null;
  }
  for (const clave of claves) {
    const valor = obj?.[clave];
    if (valor !== undefined && valor !== null && valor !== '') {
      return String(valor);
    }
  }
  return null;
}

/**
 * Obtiene el primer valor booleano de un objeto usando múltiples claves posibles
 */
export function obtenerBooleano(
  obj: ApiObject | null | undefined,
  claves: string[]
): boolean | null {
  if (!obj) {
    return null;
  }
  for (const clave of claves) {
    const valor = obj?.[clave];
    if (typeof valor === 'boolean') {
      return valor;
    }
    if (valor === 1 || valor === '1') {
      return true;
    }
    if (valor === 0 || valor === '0') {
      return false;
    }
  }
  return null;
}
