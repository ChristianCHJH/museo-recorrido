import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';

import { ModuloCompartido } from '@shared/shared.module';
import { AutenticacionServicio, DatosInicioSesion } from '../autenticacion.servicio';

@Component({
  selector: 'spa-login',
  standalone: true,
  imports: [CommonModule, RouterLink, CheckboxModule, ModuloCompartido],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css'
})
export class InicioSesionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAutenticacion = inject(AutenticacionServicio);
  private readonly router = inject(Router);

  enviando = false;
  errorInicioSesion: string | null = null;

  readonly formularioInicioSesion = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
    contrasena: ['', [Validators.required, Validators.minLength(5)]],
    recordarme: false
  });

  get controles() {
    return this.formularioInicioSesion.controls;
  }

  get mensajeErrorCorreo(): string {
    const control = this.controles.correo;
    if (!control || control.valid) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Ingresa tu correo electronico.';
    }

    if (control.hasError('minlength')) {
      return 'El correo debe tener al menos 5 caracteres.';
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo electronico valido.';
    }

    return 'Correo no valido.';
  }

  get mensajeErrorContrasena(): string {
    const control = this.controles.contrasena;
    if (!control || control.valid) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Ingresa tu contrasena.';
    }

    if (control.hasError('minlength')) {
      return 'La contrasena debe tener al menos 5 caracteres.';
    }

    return 'Contrasena no valida.';
  }

  alEnviar() {
    if (this.formularioInicioSesion.invalid || this.enviando) {
      this.formularioInicioSesion.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.errorInicioSesion = null;
    const valores = this.formularioInicioSesion.getRawValue();
    const datos: DatosInicioSesion = {
      correo: valores.correo,
      contrasena: valores.contrasena,
      recordarme: valores.recordarme
    };

    this.servicioAutenticacion.iniciarSesion(datos).subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.enviando = false;
        this.errorInicioSesion = error?.error?.mensaje || 'No fue posible iniciar sesion.';
      }
    });
  }
}
