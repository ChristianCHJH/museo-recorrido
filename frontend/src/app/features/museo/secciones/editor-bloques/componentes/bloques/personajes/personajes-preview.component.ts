import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigPersonajes } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-personajes-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personajes-preview.component.html',
  styles: [`
    .extra-bloque { display: flex; flex-direction: column; gap: 0.75rem; }
    .seccion-subtitulo { font-family: var(--fuente-titulos, serif); color: var(--color-primario, #5d4037); font-size: 1rem; margin: 0; padding-bottom: 0.4rem; border-bottom: 2px solid var(--color-secundario, #c8a96e); }
    .personaje-img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .bloque-placeholder { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; color: var(--color-primario, #5d4037); opacity: 0.5; font-size: 0.85rem; margin: 0; }
  `]
})
export class PersonajesPreviewComponent {
  @Input() config: ConfigPersonajes = { personajes: [] };

  get tienePersonajes(): boolean {
    return !!(this.config?.personajes?.length);
  }
}
