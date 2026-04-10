import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { RolesServicio, Rol } from '@core/services/roles.servicio';
import { ModuloCompartido } from '@shared/shared.module';

@Component({
  selector: 'spa-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    ModuloCompartido
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles-lista.component.html',
  styleUrl: './roles-lista.component.css'
})
export class RolesListaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicioRoles = inject(RolesServicio);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);
  private readonly destruirRef = inject(DestroyRef);

  @Output() verPermisos = new EventEmitter<Rol>();

  readonly roles = signal<Rol[]>([]);
  readonly rolSeleccionado = signal<Rol | null>(null);
  readonly filtro = signal('');
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly formularioVisible = signal(false);
  readonly guardando = signal(false);
  readonly modoFormulario = signal<'crear' | 'editar'>('crear');

  readonly rolesFiltrados = computed(() => {
    const termino = this.filtro().trim().toLowerCase();
    if (!termino) {
      return this.roles();
    }

    return this.roles().filter((rol) => {
      const base = `${rol.rol} ${rol.descripcion ?? ''}`.toLowerCase();
      return base.includes(termino);
    });
  });

  readonly formularioRol = this.fb.nonNullable.group({
    rol: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.cargarRoles();
  }

  get controlesFormulario() {
    return this.formularioRol.controls;
  }

  actualizarFiltro(valor: string) {
    this.filtro.set(valor);
  }

  abrirCrearRol() {
    this.modoFormulario.set('crear');
    this.rolSeleccionado.set(null);
    this.formularioRol.reset({ rol: '', descripcion: '' });
    this.formularioVisible.set(true);
    this.formularioRol.markAsPristine();
  }

  abrirEditarRol(rol: Rol) {
    this.modoFormulario.set('editar');
    this.rolSeleccionado.set(rol);
    this.formularioRol.reset({
      rol: rol.rol,
      descripcion: rol.descripcion ?? ''
    });
    this.formularioVisible.set(true);
    this.formularioRol.markAsPristine();
  }

  cerrarFormulario() {
    if (this.guardando()) {
      return;
    }
    this.formularioVisible.set(false);
  }

  guardarRol() {
    if (this.formularioRol.invalid) {
      this.formularioRol.markAllAsTouched();
      return;
    }

    const valores = this.formularioRol.getRawValue();
    this.guardando.set(true);

    const payload = {
      rol: valores.rol.trim(),
      descripcion: valores.descripcion?.trim() || undefined,
      estado: true,
      usuarioCreacion: 1,
      usuarioActualizacion: 1
    };

    const modo = this.modoFormulario();
    const seleccionado = this.rolSeleccionado();

    if (modo === 'editar' && !seleccionado) {
      return;
    }

    const peticion$ =
      modo === 'crear'
        ? this.servicioRoles.crearRol(payload)
        : this.servicioRoles.actualizarRol(Number(seleccionado!.id), {
            rol: payload.rol,
            descripcion: payload.descripcion,
            usuarioActualizacion: payload.usuarioActualizacion
          });

    peticion$
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (rolGuardado) => {
          this.guardando.set(false);
          this.formularioVisible.set(false);
          this.formularioRol.reset({ rol: '', descripcion: '' });
          this.cargarRoles();
          this.servicioMensajes.add({
            severity: 'success',
            summary: modo === 'crear' ? 'Rol creado' : 'Rol actualizado',
            detail:
              modo === 'crear'
                ? `Se creo el rol ${rolGuardado.rol}.`
                : `Se actualizo el rol ${rolGuardado.rol}.`,
            life: 3000
          });
        },
        error: () => {
          this.guardando.set(false);
          this.servicioMensajes.add({
            severity: 'error',
            summary: 'No pudimos guardar',
            detail: 'Intentalo nuevamente.'
          });
        }
      });
  }

  confirmarCambioEstado(rol: Rol, estado: boolean) {
    const activando = estado === true;
    this.servicioConfirmacion.confirm({
      message: activando
        ? `Deseas activar el rol <strong>${rol.rol}</strong>?`
        : `Deseas desactivar el rol <strong>${rol.rol}</strong>?`,
      header: activando ? 'Confirmar activacion' : 'Confirmar desactivacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: activando ? 'Si, activar' : 'Si, desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: activando ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      defaultFocus: 'reject',
      accept: () => {
        this.servicioRoles
          .actualizarEstadoRol(rol.id, estado)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: (actualizado) => {
              this.servicioMensajes.add({
                severity: 'success',
                summary: activando ? 'Rol activado' : 'Rol desactivado',
                detail: `${actualizado.rol} fue ${activando ? 'activado' : 'desactivado'}.`
              });
              this.cargarRoles();
            },
            error: () => {
              this.servicioMensajes.add({
                severity: 'error',
                summary: 'No se pudo actualizar',
                detail: 'Intentalo nuevamente.'
              });
            }
          });
      }
    });
  }

  formatearFecha(valor?: string | null): string {
    if (!valor) {
      return '-';
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium'
    }).format(fecha);
  }

  recargar() {
    this.cargarRoles();
  }

  private cargarRoles() {
    this.cargando.set(true);
    this.error.set(null);

    this.servicioRoles
      .obtenerRoles()
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (roles) => {
          this.roles.set(roles);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No pudimos cargar los roles. Intentalo nuevamente.');
        }
      });
  }
}
