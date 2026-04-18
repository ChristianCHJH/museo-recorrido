import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeccionRecorrido } from '@features/museo/servicios/secciones-recorrido.servicio';
import { Bloque } from '../editor-bloques/modelos/bloque.modelo';
import { RendererBloqueComponent } from '../editor-bloques/componentes/renderer-bloque/renderer-bloque.component';

@Component({
  selector: 'spa-seccion-preview',
  standalone: true,
  imports: [CommonModule, RendererBloqueComponent],
  templateUrl: './seccion-preview.component.html',
  styleUrl: './seccion-preview.component.css'
})
export class SeccionPreviewComponent {
  @Input() seccion!: SeccionRecorrido;
  @Input() bloques: Bloque[] = [];
}
