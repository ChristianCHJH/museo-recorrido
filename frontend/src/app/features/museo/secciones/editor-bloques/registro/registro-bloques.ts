import { Type } from '@angular/core';
import { TipoBloque } from '../modelos/bloque.modelo';
import { TextoEditorComponent } from '../componentes/bloques/texto/texto-editor.component';
import { TextoPreviewComponent } from '../componentes/bloques/texto/texto-preview.component';
import { FraseDestacadaEditorComponent } from '../componentes/bloques/frase-destacada/frase-destacada-editor.component';
import { FraseDestacadaPreviewComponent } from '../componentes/bloques/frase-destacada/frase-destacada-preview.component';

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
  // Fase 4: sabias-que, personajes, galeria, audio, imagen-destacada, video
};
