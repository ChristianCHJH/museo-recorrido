import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigGaleria } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-galeria-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galeria-preview.component.html',
  styles: [`
    .galeria-carrusel {
      display: flex;
      flex-direction: row;
      overflow-x: auto;
      gap: 0.75rem;
      padding-bottom: 0.5rem;
    }
    .galeria-carrusel .media-item {
      min-width: 200px;
      flex-shrink: 0;
    }
  `]
})
export class GaleriaPreviewComponent {
  @Input() config: ConfigGaleria = { disposicion: 'grid', imagenes: [] };

  get tieneImagenes(): boolean {
    return !!(this.config?.imagenes?.length);
  }
}
