import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { PermisosServicio, Permiso } from '@core/services/permisos.servicio';
import { SeccionesPermisoServicio } from '@core/services/secciones-permiso.servicio';
import { ModuloCompartido } from '@shared/shared.module';

interface OpcionSeccion {
  etiqueta: string;
  valor: number;
}

@Component({
  selector: 'spa-permisos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule,
    TooltipModule,
    ModuloCompartido
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './permisos-lista.component.html',
  styleUrl: './permisos-lista.component.css'
})
export class PermisosListaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicioPermisos = inject(PermisosServicio);
  private readonly servicioSecciones = inject(SeccionesPermisoServicio);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);
  private readonly destruirRef = inject(DestroyRef);

  readonly permisos = signal<Permiso[]>([]);
  readonly permisoSeleccionado = signal<Permiso | null>(null);
  readonly filtro = signal('');
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly formularioVisible = signal(false);
  readonly guardando = signal(false);
  readonly secciones = signal<OpcionSeccion[]>([]);
  readonly modoFormulario = signal<'crear' | 'editar'>('crear');

  readonly permisosFiltrados = computed(() => {
    const termino = this.filtro().trim().toLowerCase();
    if (!termino) {
      return this.permisos();
    }

    return this.permisos().filter((permiso) => {
      const base = `${permiso.permiso} ${permiso.descripcion ?? ''} ${permiso.seccionNombre ?? ''}`.toLowerCase();
      return base.includes(termino);
    });
  });

  readonly formularioPermiso = this.fb.nonNullable.group({
    permiso: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    seccionId: new FormControl<number | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.cargarPermisos();
    this.cargarSecciones();
  }

  get controlesFormulario() {
    return this.formularioPermiso.controls;
  }

  actualizarFiltro(valor: string) {
    this.filtro.set(valor);
  }

  abrirCrearPermiso() {
    this.modoFormulario.set('crear');
    this.permisoSeleccionado.set(null);
    this.formularioPermiso.reset({ permiso: '', descripcion: '', seccionId: null });
    this.formularioVisible.set(true);
    this.formularioPermiso.markAsPristine();
  }

  abrirEditarPermiso(permiso: Permiso) {
    this.modoFormulario.set('editar');
    this.permisoSeleccionado.set(permiso);
    this.formularioPermiso.reset({
      permiso: permiso.permiso,
      descripcion: permiso.descripcion ?? '',
      seccionId: Number(permiso.seccionId)
    });
    this.formularioVisible.set(true);
    this.formularioPermiso.markAsPristine();
  }

  cerrarFormulario() {
    if (this.guardando()) {
      return;
    }
    this.formularioVisible.set(false);
  }

  guardarPermiso() {
    if (this.formularioPermiso.invalid) {
      this.formularioPermiso.markAllAsTouched();
      return;
    }

    const valores = this.formularioPermiso.getRawValue();
    this.guardando.set(true);

    const payload = {
      permiso: valores.permiso.trim(),
      descripcion: valores.descripcion?.trim() || undefined,
      seccionId: Number(valores.seccionId),
      estado: true,
      usuarioCreacion: 1,
      usuarioActualizacion: 1
    };

    const modo = this.modoFormulario();
    const seleccionado = this.permisoSeleccionado();

    if (modo === 'editar' && !seleccionado) {
      return;
    }

    const peticion$ =
      modo === 'crear'
        ? this.servicioPermisos.crearPermiso(payload)
        : this.servicioPermisos.actualizarPermiso(Number(seleccionado!.id), {
            permiso: payload.permiso,
            descripcion: payload.descripcion,
            seccionId: payload.seccionId,
            usuarioActualizacion: payload.usuarioActualizacion
          });

    peticion$
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (permisoCreado) => {
          this.guardando.set(false);
          this.formularioVisible.set(false);
          this.formularioPermiso.reset({ permiso: '', descripcion: '', seccionId: null });
          this.cargarPermisos();
          this.servicioMensajes.add({
            severity: 'success',
            summary: modo === 'crear' ? 'Permiso creado' : 'Permiso actualizado',
            detail:
              modo === 'crear'
                ? `Se creo el permiso ${permisoCreado.permiso}.`
                : `Se actualizo el permiso ${permisoCreado.permiso}.`,
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

  confirmarCambioEstado(permiso: Permiso, estado: boolean) {
    const activando = estado === true;
    this.servicioConfirmacion.confirm({
      message: activando
        ? `Deseas activar el permiso <strong>${permiso.permiso}</strong>?`
        : `Deseas desactivar el permiso <strong>${permiso.permiso}</strong>?`,
      header: activando ? 'Confirmar activacion' : 'Confirmar desactivacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: activando ? 'Si, activar' : 'Si, desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: activando ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      defaultFocus: 'reject',
      accept: () => {
        this.servicioPermisos
          .actualizarEstadoPermiso(permiso.id, estado)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: (actualizado) => {
              this.servicioMensajes.add({
                severity: 'success',
                summary: activando ? 'Permiso activado' : 'Permiso desactivado',
                detail: `${actualizado.permiso} fue ${activando ? 'activado' : 'desactivado'}.`
              });
              this.cargarPermisos();
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

  recargar() {
    this.cargarPermisos();
  }

  private cargarPermisos() {
    this.cargando.set(true);
    this.error.set(null);

    this.servicioPermisos
      .obtenerPermisos()
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (permisos) => {
          this.permisos.set(permisos);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No pudimos cargar los permisos. Intentalo nuevamente.');
        }
      });
  }

  private cargarSecciones() {
    this.servicioSecciones
      .obtenerSecciones()
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (secciones) => {
          this.secciones.set(
            secciones.map((seccion) => ({
              valor: Number(seccion.id),
              etiqueta: seccion.nombre ?? `Seccion ${seccion.id}`
            }))
          );
        },
        error: () => {
          this.secciones.set([]);
        }
      });
  }
}
