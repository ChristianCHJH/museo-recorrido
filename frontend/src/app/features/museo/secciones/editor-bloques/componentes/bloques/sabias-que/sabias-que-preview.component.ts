import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigSabiasQue } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-sabias-que-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sabias-que-preview.component.html'
})
export class SabiasQuePreviewComponent {
  @Input() config: ConfigSabiasQue = { texto: { es: '' } };

  get tieneTexto(): boolean {
    return !!(this.config?.texto?.es?.trim());
  }

  get etiqueta(): string {
    return this.config?.etiqueta?.es?.trim() || '¿Sabías qué...?';
  }
}
