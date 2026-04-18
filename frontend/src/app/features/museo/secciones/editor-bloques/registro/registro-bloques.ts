import { Type } from '@angular/core';
import { TipoBloque } from '../modelos/bloque.modelo';
import { TextoEditorComponent } from '../componentes/bloques/texto/texto-editor.component';
import { TextoPreviewComponent } from '../componentes/bloques/texto/texto-preview.component';
import { FraseDestacadaEditorComponent } from '../componentes/bloques/frase-destacada/frase-destacada-editor.component';
import { FraseDestacadaPreviewComponent } from '../componentes/bloques/frase-destacada/frase-destacada-preview.component';
import { SabiasQueEditorComponent } from '../componentes/bloques/sabias-que/sabias-que-editor.component';
import { SabiasQuePreviewComponent } from '../componentes/bloques/sabias-que/sabias-que-preview.component';
import { AudioEditorComponent } from '../componentes/bloques/audio/audio-editor.component';
import { AudioPreviewComponent } from '../componentes/bloques/audio/audio-preview.component';
import { ImagenDestacadaEditorComponent } from '../componentes/bloques/imagen-destacada/imagen-destacada-editor.component';
import { ImagenDestacadaPreviewComponent } from '../componentes/bloques/imagen-destacada/imagen-destacada-preview.component';
import { PersonajesEditorComponent } from '../componentes/bloques/personajes/personajes-editor.component';
import { PersonajesPreviewComponent } from '../componentes/bloques/personajes/personajes-preview.component';
import { GaleriaEditorComponent } from '../componentes/bloques/galeria/galeria-editor.component';
import { GaleriaPreviewComponent } from '../componentes/bloques/galeria/galeria-preview.component';
import { VideoEditorComponent } from '../componentes/bloques/video/video-editor.component';
import { VideoPreviewComponent } from '../componentes/bloques/video/video-preview.component';

export interface DefinicionBloque {
  tipo: TipoBloque;
  label: string;
  icono: string;
  descripcion: string;
  defaultConfig: Record<string, any>;
  componenteEditor: Type<any>;
  componentePreview: Type<any>;
}

export const REGISTRO_BLOQUES: Record<string, DefinicionBloque> = {
  [TipoBloque.TEXTO]: {
    tipo: TipoBloque.TEXTO,
    label: 'Texto',
    icono: 'pi pi-align-left',
    descripcion: 'Parrafo con titulo opcional',
    defaultConfig: { contenido: { es: '' } },
    componenteEditor: TextoEditorComponent,
    componentePreview: TextoPreviewComponent,
  },
  [TipoBloque.FRASE_DESTACADA]: {
    tipo: TipoBloque.FRASE_DESTACADA,
    label: 'Frase destacada',
    icono: 'pi pi-comments',
    descripcion: 'Cita o frase con autor opcional',
    defaultConfig: { texto: { es: '' } },
    componenteEditor: FraseDestacadaEditorComponent,
    componentePreview: FraseDestacadaPreviewComponent,
  },
  [TipoBloque.SABIAS_QUE]: {
    tipo: TipoBloque.SABIAS_QUE,
    label: 'Sabías qué',
    icono: 'pi pi-lightbulb',
    descripcion: 'Dato curioso resaltado',
    defaultConfig: { texto: { es: '' } },
    componenteEditor: SabiasQueEditorComponent,
    componentePreview: SabiasQuePreviewComponent,
  },
  [TipoBloque.AUDIO]: {
    tipo: TipoBloque.AUDIO,
    label: 'Audio',
    icono: 'pi pi-volume-up',
    descripcion: 'Reproductor de audio narrado',
    defaultConfig: { url: '' },
    componenteEditor: AudioEditorComponent,
    componentePreview: AudioPreviewComponent,
  },
  [TipoBloque.IMAGEN_DESTACADA]: {
    tipo: TipoBloque.IMAGEN_DESTACADA,
    label: 'Imagen destacada',
    icono: 'pi pi-image',
    descripcion: 'Imagen única con título y caption',
    defaultConfig: { url: '', altura: 'md' },
    componenteEditor: ImagenDestacadaEditorComponent,
    componentePreview: ImagenDestacadaPreviewComponent,
  },
  [TipoBloque.PERSONAJES]: {
    tipo: TipoBloque.PERSONAJES,
    label: 'Personajes',
    icono: 'pi pi-users',
    descripcion: 'Lista de personajes históricos',
    defaultConfig: { personajes: [] },
    componenteEditor: PersonajesEditorComponent,
    componentePreview: PersonajesPreviewComponent,
  },
  [TipoBloque.GALERIA]: {
    tipo: TipoBloque.GALERIA,
    label: 'Galería',
    icono: 'pi pi-images',
    descripcion: 'Cuadrícula o carrusel de imágenes',
    defaultConfig: { disposicion: 'grid', imagenes: [] },
    componenteEditor: GaleriaEditorComponent,
    componentePreview: GaleriaPreviewComponent,
  },
  [TipoBloque.VIDEO]: {
    tipo: TipoBloque.VIDEO,
    label: 'Video',
    icono: 'pi pi-video',
    descripcion: 'Video de YouTube, Vimeo o archivo local',
    defaultConfig: { origen: 'youtube', url: '' },
    componenteEditor: VideoEditorComponent,
    componentePreview: VideoPreviewComponent,
  },
};
