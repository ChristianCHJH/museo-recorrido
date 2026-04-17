import { Component, Input } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Bloque } from '../../modelos/bloque.modelo';
import { REGISTRO_BLOQUES } from '../../registro/registro-bloques';

@Component({
  selector: 'spa-preview-bloques',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  templateUrl: './preview-bloques.component.html'
})
export class PreviewBloquesComponent {
  @Input() bloques: Bloque[] = [];
  @Input() nombreSeccion?: string;

  componentePreviewDe(tipo: string): any {
    return REGISTRO_BLOQUES[tipo]?.componentePreview ?? null;
  }

  inputsDe(bloque: Bloque): Record<string, any> {
    return { config: bloque.config };
  }

  esTipoRegistrado(tipo: string): boolean {
    return !!(REGISTRO_BLOQUES[tipo]);
  }

  get bloquesOrdenados(): Bloque[] {
    return [...this.bloques].sort((a, b) => a.orden - b.orden);
  }
}
