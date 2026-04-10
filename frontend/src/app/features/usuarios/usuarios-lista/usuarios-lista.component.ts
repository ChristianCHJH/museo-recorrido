import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  DatosCrearUsuario,
  ElementoListaUsuario,
  UsuariosServicio
} from '@core/services/usuarios.servicio';
import { ModuloCompartido } from '@shared/shared.module';

@Component({
  selector: 'spa-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ModuloCompartido
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios-lista.component.html',
  styleUrl: './usuarios-lista.component.css'
})
export class UsuariosListaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicioUsuarios = inject(UsuariosServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);

  readonly usuarios = signal<ElementoListaUsuario[]>([]);
  readonly filtro = signal('');
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly formularioVisible = signal(false);
  readonly modoFormulario = signal<'crear' | 'editar' | 'contrasena'>('crear');
  readonly errorFormulario = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly usuarioSeleccionado = signal<ElementoListaUsuario | null>(null);
  @Output() verAccesos = new EventEmitter<ElementoListaUsuario>();

  readonly totalUsuarios = computed(() => this.usuarios().length);
  readonly usuariosFiltrados = computed(() => {
    const termino = this.filtro().trim().toLowerCase();
    const lista = this.usuarios();

    if (!termino) {
      return lista;
    }

    return lista.filter((usuario) => {
      const base = `${usuario.nombreUsuario} ${usuario.correo} ${usuario.estado}`.toLowerCase();
      return base.includes(termino);
    });
  });

  readonly formularioUsuario = this.fb.nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  actualizarFiltro(valor: string) {
    this.filtro.set(valor);
  }

  recargar() {
    this.cargarUsuarios();
  }

  abrirCrearUsuario() {
    this.modoFormulario.set('crear');
    this.usuarioSeleccionado.set(null);
    this.errorFormulario.set(null);
    this.formularioUsuario.reset({
      nombreUsuario: '',
      correo: '',
      contrasena: ''
    });
    this.configurarValidacionContrasena(true, false);
    this.formularioVisible.set(true);
  }

  abrirEditarUsuario(usuario: ElementoListaUsuario) {
    this.modoFormulario.set('editar');
    this.usuarioSeleccionado.set(usuario);
    this.errorFormulario.set(null);
    this.formularioUsuario.reset({
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
      contrasena: ''
    });
    this.configurarValidacionContrasena(false, true);
    this.formularioVisible.set(true);
  }

  abrirRestablecerContrasena(usuario: ElementoListaUsuario) {
    this.modoFormulario.set('contrasena');
    this.usuarioSeleccionado.set(usuario);
    this.errorFormulario.set(null);
    this.formularioUsuario.reset({
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
      contrasena: ''
    });
    this.configurarValidacionContrasena(true, true);
    this.formularioVisible.set(true);
  }

  abrirAccesos(usuario: ElementoListaUsuario) {
    this.verAccesos.emit(usuario);
  }

  cerrarFormulario() {
    if (this.guardando()) {
      return;
    }
    this.formularioVisible.set(false);
  }

  guardarUsuario() {
    if (this.formularioUsuario.invalid) {
      this.formularioUsuario.markAllAsTouched();
      return;
    }

    const valores = this.formularioUsuario.getRawValue();
    const datos: DatosCrearUsuario = {
      nombreUsuario: valores.nombreUsuario.trim(),
      correo: valores.correo.trim(),
      contrasena: valores.contrasena?.trim() ?? '',
      usuarioCreacion: 1
    };

    const modo = this.modoFormulario();
    const usuarioSeleccionado = this.usuarioSeleccionado();
    const esCrear = modo === 'crear';

    if (!esCrear && !usuarioSeleccionado) {
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set(null);

    const peticion$ = esCrear
      ? this.servicioUsuarios.crearUsuario(datos)
      : modo === 'contrasena'
        ? this.servicioUsuarios.actualizarUsuario(Number(usuarioSeleccionado!.id), {
            contrasena: datos.contrasena?.trim() ?? ''
          })
        : this.servicioUsuarios.actualizarUsuario(Number(usuarioSeleccionado!.id), {
            nombreUsuario: datos.nombreUsuario,
            correo: datos.correo
          });

    peticion$.pipe(takeUntilDestroyed(this.destruirRef)).subscribe({
      next: (usuario) => {
        this.guardando.set(false);
        this.formularioVisible.set(false);
        this.formularioUsuario.reset();
        this.cargarUsuarios();
        const resumen =
          modo === 'crear'
            ? 'Usuario creado'
            : modo === 'contrasena'
              ? 'Contrasena actualizada'
              : 'Usuario actualizado';
        const detalle =
          modo === 'crear'
            ? `Se creo al usuario ${usuario.nombreUsuario}.`
            : modo === 'contrasena'
              ? `La contrasena de ${usuario.nombreUsuario} fue restablecida.`
              : `Se actualizo al usuario ${usuario.nombreUsuario}.`;
        this.mostrarNotificacion('success', resumen, detalle);
      },
      error: () => {
        this.guardando.set(false);
        this.errorFormulario.set('No pudimos guardar el usuario. Intentalo otra vez.');
        this.mostrarNotificacion('error', 'Error al guardar', 'Intentalo nuevamente en unos segundos.');
      }
    });
  }

  confirmarCambioEstado(usuario: ElementoListaUsuario, estado: boolean) {
    const activando = estado === true;
    this.servicioConfirmacion.confirm({
      message: activando
        ? `Deseas activar al usuario ${usuario.nombreUsuario}?`
        : `Deseas desactivar al usuario ${usuario.nombreUsuario}?`,
      header: activando ? 'Confirmar activacion' : 'Confirmar desactivacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: activando ? 'Si, activar' : 'Si, desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: activando ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      defaultFocus: 'reject',
      accept: () => this.actualizarEstadoUsuario(usuario, estado)
    });
  }

  private actualizarEstadoUsuario(usuario: ElementoListaUsuario, estado: boolean) {
    this.servicioUsuarios
      .actualizarEstadoUsuario(Number(usuario.id), estado)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (respuesta) => {
          const activo = estado === true;
          this.mostrarNotificacion(
            'success',
            activo ? 'Usuario activado' : 'Usuario desactivado',
            `${respuesta?.nombreUsuario ?? usuario.nombreUsuario} fue ${activo ? 'activado' : 'desactivado'}.`
          );
          this.cargarUsuarios();
        },
        error: () => {
          this.mostrarNotificacion('error', 'No se pudo actualizar', 'Intentalo nuevamente.');
        }
      });
  }

  get controlesFormulario() {
    return this.formularioUsuario.controls;
  }

  private cargarUsuarios() {
    this.cargando.set(true);
    this.error.set(null);

    this.servicioUsuarios
      .obtenerUsuarios()
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (usuarios) => this.usuarios.set(usuarios),
        error: () => this.error.set('No pudimos cargar los usuarios. Intentalo nuevamente.')
      });
  }

  private configurarValidacionContrasena(requerido: boolean, limpiar: boolean) {
    const control = this.formularioUsuario.controls.contrasena;
    if (requerido) {
      control.enable();
      control.setValidators([Validators.required, Validators.minLength(6)]);
      if (limpiar) {
        control.reset('');
      }
    } else {
      control.setValidators([Validators.minLength(6)]);
      if (limpiar) {
        control.reset('');
      }
      control.disable();
    }
    control.updateValueAndValidity();
  }

  private mostrarNotificacion(
    severidad: 'success' | 'info' | 'warn' | 'error',
    resumen: string,
    detalle: string
  ) {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
