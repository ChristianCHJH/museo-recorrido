import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigTexto } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-texto-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './texto-preview.component.html'
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
