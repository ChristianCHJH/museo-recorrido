import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigImagenDestacada } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-imagen-destacada-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imagen-destacada-preview.component.html',
  styles: [`
    .imagen-destacada { width: 100%; object-fit: cover; display: block; }
    .altura-sm { height: 150px; }
    .altura-md { height: 250px; }
    .altura-lg { height: 380px; }
  `]
})
export class ImagenDestacadaPreviewComponent {
  @Input() config: ConfigImagenDestacada = { url: '', altura: 'md' };

  get tieneUrl(): boolean {
    return !!(this.config?.url?.trim());
  }

  get tieneCaption(): boolean {
    return !!(this.config?.titulo?.es?.trim() || this.config?.caption?.es?.trim());
  }

  get alturaClase(): string {
    return 'altura-' + (this.config?.altura ?? 'md');
  }
}
