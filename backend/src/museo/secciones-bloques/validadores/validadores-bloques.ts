import { BadRequestException } from '@nestjs/common';
import { TipoBloque } from '../dto/tipos-bloque';

type ValidadorConfig = (config: any) => void;

const validarTextoMultiIdioma = (valor: any, nombreCampo: string): void => {
  if (!valor || typeof valor.es !== 'string' || valor.es.trim() === '') {
    throw new BadRequestException(`El campo "${nombreCampo}.es" es requerido y no puede estar vacío`);
  }
};

export const validadoresPorTipo: Map<TipoBloque, ValidadorConfig> = new Map([
  [
    TipoBloque.TEXTO,
    (config: any) => {
      validarTextoMultiIdioma(config?.contenido, 'contenido');
    },
  ],
  [
    TipoBloque.FRASE_DESTACADA,
    (config: any) => {
      validarTextoMultiIdioma(config?.texto, 'texto');
    },
  ],
  [
    TipoBloque.SABIAS_QUE,
    (config: any) => {
      validarTextoMultiIdioma(config?.texto, 'texto');
    },
  ],
  [
    TipoBloque.PERSONAJES,
    (config: any) => {
      if (!Array.isArray(config?.personajes)) {
        throw new BadRequestException('El campo "personajes" debe ser un array');
      }
    },
  ],
  [
    TipoBloque.GALERIA,
    (config: any) => {
      if (!Array.isArray(config?.imagenes)) {
        throw new BadRequestException('El campo "imagenes" debe ser un array');
      }
      if (!['grid', 'carrusel'].includes(config?.disposicion)) {
        throw new BadRequestException('El campo "disposicion" debe ser "grid" o "carrusel"');
      }
    },
  ],
  [
    TipoBloque.AUDIO,
    (config: any) => {
      if (typeof config?.url !== 'string' || config.url.trim() === '') {
        throw new BadRequestException('El campo "url" es requerido para el bloque de audio');
      }
    },
  ],
  [
    TipoBloque.IMAGEN_DESTACADA,
    (config: any) => {
      if (typeof config?.url !== 'string' || config.url.trim() === '') {
        throw new BadRequestException('El campo "url" es requerido para el bloque de imagen destacada');
      }
    },
  ],
  [
    TipoBloque.VIDEO,
    (config: any) => {
      if (!['youtube', 'vimeo', 'local'].includes(config?.origen)) {
        throw new BadRequestException('El campo "origen" debe ser "youtube", "vimeo" o "local"');
      }
      if (typeof config?.url !== 'string' || config.url.trim() === '') {
        throw new BadRequestException('El campo "url" es requerido para el bloque de video');
      }
    },
  ],
]);

export function validarConfigBloque(tipo: TipoBloque, config: any): void {
  const validador = validadoresPorTipo.get(tipo);
  if (!validador) {
    throw new BadRequestException(`Tipo de bloque desconocido: ${tipo}`);
  }
  validador(config);
}
