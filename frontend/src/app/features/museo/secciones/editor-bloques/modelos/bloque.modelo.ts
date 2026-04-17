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
