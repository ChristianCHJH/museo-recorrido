import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoBloque } from '../../modelos/bloque.modelo';
import { REGISTRO_BLOQUES, DefinicionBloque } from '../../registro/registro-bloques';

@Component({
  selector: 'spa-paleta-bloques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paleta-bloques.component.html'
})
export class PaletaBloquesComponent {
  @Output() agregarBloque = new EventEmitter<TipoBloque>();

  readonly tiposDisponibles: DefinicionBloque[] = Object.values(REGISTRO_BLOQUES);
}
