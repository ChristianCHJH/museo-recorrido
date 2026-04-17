import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigFraseDestacada } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-frase-destacada-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frase-destacada-preview.component.html'
})
export class FraseDestacadaPreviewComponent {
  @Input() config: ConfigFraseDestacada = { texto: { es: '' } };

  get tieneTexto(): boolean {
    return !!(this.config?.texto?.es?.trim());
  }

  get tieneAutor(): boolean {
    return !!(this.config?.autor?.es?.trim());
  }
}
