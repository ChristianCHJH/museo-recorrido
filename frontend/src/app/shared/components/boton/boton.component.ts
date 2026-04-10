import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'spa-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  templateUrl: './boton.component.html',
  styleUrl: './boton.component.css'
})
export class BotonComponent {
  @Input() etiqueta = 'Aceptar';
  @Input() tipo: 'button' | 'submit' = 'button';
  @Input() deshabilitado = false;
  @Input() cargando = false;
  @Input() bloque = false;
}
