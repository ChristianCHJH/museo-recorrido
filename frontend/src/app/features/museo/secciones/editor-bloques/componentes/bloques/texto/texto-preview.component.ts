import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigTexto } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-texto-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './texto-preview.component.html',
  styles: [`
    .bloque-texto { display: flex; flex-direction: column; gap: 0.5rem; }
    .bloque-titulo { font-family: var(--fuente-titulos, serif); color: var(--color-primario, #5d4037); font-size: 1.1rem; margin: 0; line-height: 1.35; }
    .bloque-titulo-h3 { font-size: 0.95rem; }
    .bloque-parrafo { font-size: 0.9rem; line-height: 1.75; color: var(--color-texto-oscuro, #2c1a0e); margin: 0; white-space: pre-line; }
    .bloque-placeholder { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; color: var(--color-primario, #5d4037); opacity: 0.5; font-size: 0.85rem; margin: 0; }
  `]
})
export class TextoPreviewComponent {
  @Input() config: ConfigTexto = { contenido: { es: '' } };

  get tieneTitulo(): boolean {
    return !!(this.config?.titulo?.es?.trim());
  }

  get tieneContenido(): boolean {
    return !!(this.config?.contenido?.es?.trim());
  }

  get nivel(): string {
    return this.config?.nivelTitulo ?? 'h2';
  }
}
