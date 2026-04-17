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

export interface TextoMultiIdioma {
  es: string;
  en?: string;
}

export interface ConfigTexto {
  titulo?: TextoMultiIdioma;
  contenido: TextoMultiIdioma;
  nivelTitulo?: 'h2' | 'h3';
}

export interface ConfigFraseDestacada {
  texto: TextoMultiIdioma;
  autor?: TextoMultiIdioma;
}

export interface ConfigSabiasQue {
  texto: TextoMultiIdioma;
  etiqueta?: TextoMultiIdioma;
}

export interface ConfigAudio {
  url: string;
  etiqueta?: TextoMultiIdioma;
  duracion?: number;
  elementoMultimediaId?: string;
}

export interface ConfigImagenDestacada {
  url: string;
  titulo?: TextoMultiIdioma;
  caption?: TextoMultiIdioma;
  altura?: 'sm' | 'md' | 'lg';
  elementoMultimediaId?: string;
}

export interface ConfigPersonajeItem {
  nombre: string;
  rol?: TextoMultiIdioma;
  descripcion?: TextoMultiIdioma;
  imagenUrl?: string;
  elementoMultimediaId?: string;
}

export interface ConfigPersonajes {
  titulo?: TextoMultiIdioma;
  personajes: ConfigPersonajeItem[];
}

export interface ConfigGaleriaItem {
  url: string;
  titulo?: TextoMultiIdioma;
  caption?: TextoMultiIdioma;
  elementoMultimediaId?: string;
}

export interface ConfigGaleria {
  titulo?: TextoMultiIdioma;
  disposicion: 'grid' | 'carrusel';
  imagenes: ConfigGaleriaItem[];
}

export interface ConfigVideo {
  origen: 'youtube' | 'vimeo' | 'local';
  url: string;
  titulo?: TextoMultiIdioma;
  caption?: TextoMultiIdioma;
  elementoMultimediaId?: string;
}

export interface Bloque {
  id?: string;
  tipo: TipoBloque;
  orden: number;
  config: Record<string, any>;
  estado?: boolean;
}

export interface GuardarBloquesPayload {
  bloques: Bloque[];
}

export interface ResultadoBloques {
  items: Bloque[];
}
