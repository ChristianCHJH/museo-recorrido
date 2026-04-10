import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

let idUnico = 0;

@Component({
  selector: 'spa-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './entrada.component.html',
  styleUrl: './entrada.component.css'
})
export class EntradaComponent {
  @Input() etiqueta = '';
  @Input() placeholder = '';
  @Input() tipo: 'text' | 'email' | 'password' = 'text';
  @Input() control!: FormControl;
  @Input() mensajeError = '';
  @Input() mostrarToggleContrasena = false;

  idEntrada = `spa-input-${idUnico++}`;
  contrasenaVisible = false;

  get tipoEntradaActual() {
    if (!this.mostrarToggleContrasena) {
      return this.tipo;
    }

    return this.contrasenaVisible ? 'text' : 'password';
  }

  get mostrarError() {
    return this.control?.invalid && (this.control?.dirty || this.control?.touched);
  }

  alternarVisibilidadContrasena() {
    this.contrasenaVisible = !this.contrasenaVisible;
  }
}
