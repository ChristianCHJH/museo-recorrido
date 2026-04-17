import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'spa-toolbar-bloque',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './toolbar-bloque.component.html'
})
export class ToolbarBloqueComponent {
  @Input() esPrimero = false;
  @Input() esUltimo = false;

  @Output() moverArriba = new EventEmitter<void>();
  @Output() moverAbajo = new EventEmitter<void>();
  @Output() duplicar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();
}
