export enum TipoBloque {
  TEXTO = 'texto',
  FRASE_DESTACADA = 'frase-destacada',
  SABIAS_QUE = 'sabias-que',
  PERSONAJES = 'personajes',
  GALERIA = 'galeria',
  AUDIO = 'audio',
  IMAGEN_DESTACADA = 'imagen-destacada',
  VIDEO = 'video',
}

// ─── Interfaces de configuración multi-idioma por tipo de bloque ───────────────

export interface TextoMultiIdioma {
  es: string;
  en?: string;
}

export interface TextoMultiIdiomaOpcional {
  es?: string;
  en?: string;
}

// texto
export interface ConfigTexto {
  titulo?: TextoMultiIdioma;
  contenido: TextoMultiIdioma;
  nivelTitulo?: 'h2' | 'h3';
}

// frase-destacada
export interface ConfigFraseDestacada {
  texto: TextoMultiIdioma;
  autor?: TextoMultiIdiomaOpcional;
}

// sabias-que
export interface ConfigSabiasQue {
  texto: TextoMultiIdioma;
  etiqueta?: TextoMultiIdiomaOpcional;
}

// personajes
export interface PersonajeItem {
  nombre: string;
  rol?: TextoMultiIdiomaOpcional;
  descripcion?: TextoMultiIdiomaOpcional;
  imagenUrl?: string;
  elementoMultimediaId?: string;
}

export interface ConfigPersonajes {
  titulo?: TextoMultiIdiomaOpcional;
  personajes: PersonajeItem[];
}

// galeria
export interface ImagenGaleriaItem {
  url: string;
  titulo?: TextoMultiIdiomaOpcional;
  caption?: TextoMultiIdiomaOpcional;
  elementoMultimediaId?: string;
}

export interface ConfigGaleria {
  titulo?: TextoMultiIdiomaOpcional;
  disposicion: 'grid' | 'carrusel';
  imagenes: ImagenGaleriaItem[];
}

// audio
export interface ConfigAudio {
  url: string;
  etiqueta?: TextoMultiIdiomaOpcional;
  duracion?: number;
  elementoMultimediaId?: string;
}

// imagen-destacada
export interface ConfigImagenDestacada {
  url: string;
  titulo?: TextoMultiIdiomaOpcional;
  caption?: TextoMultiIdiomaOpcional;
  altura?: 'sm' | 'md' | 'lg';
  elementoMultimediaId?: string;
}

// video
export interface ConfigVideo {
  origen: 'youtube' | 'vimeo' | 'local';
  url: string;
  titulo?: TextoMultiIdiomaOpcional;
  caption?: TextoMultiIdiomaOpcional;
  elementoMultimediaId?: string;
}
