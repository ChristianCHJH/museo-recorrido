import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigFraseDestacada } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-frase-destacada-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frase-destacada-preview.component.html',
  styles: [`
    .bloque-frase { display: flex; flex-direction: column; gap: 0.5rem; }
    .frase-destacada { background: var(--color-primario, #5d4037); border-radius: 12px; padding: 1rem 1.25rem; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .frase-destacada .pi { color: var(--color-secundario, #c8a96e); font-size: 1rem; }
    .frase-destacada p { margin: 0; color: #fff; font-family: var(--fuente-titulos, serif); font-size: 0.95rem; line-height: 1.6; font-style: italic; }
    .frase-autor { font-size: 0.82rem; color: var(--color-primario, #5d4037); margin: 0; opacity: 0.8; }
    .bloque-placeholder { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; color: var(--color-primario, #5d4037); opacity: 0.5; font-size: 0.85rem; margin: 0; }
  `]
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
