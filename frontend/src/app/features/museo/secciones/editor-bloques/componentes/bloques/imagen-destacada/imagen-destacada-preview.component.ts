import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigImagenDestacada } from '../../../modelos/bloque.modelo';
import { environment } from '@env/environment';

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
    .media-item { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(93,64,55,0.1); }
    .media-caption { padding: 0.6rem 0.85rem; display: flex; flex-direction: column; gap: 0.2rem; }
    .caption-titulo { font-weight: 600; font-size: 0.82rem; color: var(--color-texto-oscuro, #2c1a0e); }
    .caption-desc { font-size: 0.75rem; color: var(--color-primario, #5d4037); opacity: 0.8; }
    .bloque-placeholder { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; color: var(--color-primario, #5d4037); opacity: 0.5; font-size: 0.85rem; margin: 0; }
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

  urlCompleta(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
  }
}
