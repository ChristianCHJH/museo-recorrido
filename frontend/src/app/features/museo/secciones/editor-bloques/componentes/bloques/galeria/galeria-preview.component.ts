import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigGaleria } from '../../../modelos/bloque.modelo';
import { environment } from '@env/environment';

@Component({
  selector: 'spa-galeria-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galeria-preview.component.html',
  styles: [`
    .galeria-lista { display: flex; flex-direction: column; gap: 1rem; }
    .galeria-carrusel { flex-direction: row; overflow-x: auto; gap: 0.75rem; padding-bottom: 0.5rem; }
    .galeria-carrusel .media-item { min-width: 200px; flex-shrink: 0; }
    .seccion-subtitulo { font-family: var(--fuente-titulos, serif); color: var(--color-primario, #5d4037); font-size: 1rem; margin: 0 0 0.75rem; padding-bottom: 0.4rem; border-bottom: 2px solid var(--color-secundario, #c8a96e); }
    .media-item { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(93,64,55,0.1); }
    .media-imagen { width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; }
    .media-caption { padding: 0.6rem 0.85rem; display: flex; flex-direction: column; gap: 0.2rem; }
    .caption-titulo { font-weight: 600; font-size: 0.82rem; color: var(--color-texto-oscuro, #2c1a0e); }
    .caption-desc { font-size: 0.75rem; color: var(--color-primario, #5d4037); opacity: 0.8; }
    .bloque-placeholder { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; color: var(--color-primario, #5d4037); opacity: 0.5; font-size: 0.85rem; margin: 0; }
  `]
})
export class GaleriaPreviewComponent {
  @Input() config: ConfigGaleria = { disposicion: 'grid', imagenes: [] };

  get tieneImagenes(): boolean {
    return !!(this.config?.imagenes?.length);
  }

  urlCompleta(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
  }
}
