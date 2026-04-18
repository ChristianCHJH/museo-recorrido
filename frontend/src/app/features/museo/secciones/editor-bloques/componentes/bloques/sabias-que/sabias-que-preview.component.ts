import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigSabiasQue } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-sabias-que-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sabias-que-preview.component.html',
  styles: [`
    .curiosos-bloque { background: #fffde7; border-left: 3px solid #f9a825; border-radius: 0 10px 10px 0; padding: 0.85rem 1rem; }
    .curiosos-header { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: #f57f17; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .curiosos-bloque p { margin: 0; font-size: 0.88rem; line-height: 1.7; color: var(--color-texto-oscuro, #2c1a0e); }
    .bloque-placeholder { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; color: var(--color-primario, #5d4037); opacity: 0.5; font-size: 0.85rem; margin: 0; }
  `]
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
