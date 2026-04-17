import { Component, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TipoBloque } from '../../modelos/bloque.modelo';
import { REGISTRO_BLOQUES, DefinicionBloque } from '../../registro/registro-bloques';

@Component({
  selector: 'spa-paleta-bloques',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './paleta-bloques.component.html'
})
export class PaletaBloquesComponent {
  @Output() agregarBloque = new EventEmitter<TipoBloque>();

  private readonly todos: DefinicionBloque[] = Object.values(REGISTRO_BLOQUES);

  readonly textoBusqueda = signal('');

  readonly tiposDisponibles = computed(() => {
    const q = this.textoBusqueda().toLowerCase().trim();
    if (!q) return this.todos;
    return this.todos.filter(d =>
      d.label.toLowerCase().includes(q) || d.descripcion.toLowerCase().includes(q)
    );
  });

  alBuscar(valor: string): void {
    this.textoBusqueda.set(valor);
  }
}
