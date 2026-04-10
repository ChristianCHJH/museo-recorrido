import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  SeccionPermiso,
  SeccionesPermisoServicio
} from '@core/services/secciones-permiso.servicio';
import { ModuloCompartido } from '@shared/shared.module';

@Component({
  selector: 'spa-sections-manager',
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
  templateUrl: './secciones-permiso-lista.component.html',
  styleUrl: './secciones-permiso-lista.component.css'
})
export class SeccionesPermisoListaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicioSecciones = inject(SeccionesPermisoServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);

  readonly secciones = signal<SeccionPermiso[]>([]);
  readonly filtro = signal('');
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly formularioVisible = signal(false);
  readonly modoFormulario = signal<'crear' | 'editar'>('crear');
  readonly errorFormulario = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly seccionSeleccionada = signal<SeccionPermiso | null>(null);

  readonly totalSecciones = computed(() => this.secciones().length);
  readonly seccionesFiltradas = computed(() => {
    const termino = this.filtro().trim().toLowerCase();
    const lista = this.secciones();

    if (!termino) {
      return lista;
    }

    return lista.filter((seccion) => {
      const base = `${seccion.nombre} ${seccion.descripcion ?? ''}`.toLowerCase();
      return base.includes(termino);
    });
  });

  readonly formularioSeccion = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    estado: true
  });

  ngOnInit(): void {
    this.cargarSecciones();
  }

  actualizarFiltro(valor: string) {
    this.filtro.set(valor);
  }

  recargar() {
    this.cargarSecciones();
  }

  abrirCrearSeccion() {
    this.modoFormulario.set('crear');
    this.seccionSeleccionada.set(null);
    this.errorFormulario.set(null);
    this.formularioSeccion.reset({
      nombre: '',
      descripcion: '',
      estado: true
    });
    this.formularioVisible.set(true);
  }

  abrirEditarSeccion(seccion: SeccionPermiso) {
    this.modoFormulario.set('editar');
    this.seccionSeleccionada.set(seccion);
    this.errorFormulario.set(null);
    this.formularioSeccion.reset({
      nombre: seccion.nombre,
      descripcion: seccion.descripcion ?? '',
      estado: seccion.estado
    });
    this.formularioVisible.set(true);
  }

  cerrarFormulario() {
    if (this.guardando()) {
      return;
    }
    this.formularioVisible.set(false);
  }

  guardarSeccion() {
    if (this.formularioSeccion.invalid) {
      this.formularioSeccion.markAllAsTouched();
      return;
    }

    const valores = this.formularioSeccion.getRawValue();
    const descripcion = valores.descripcion?.trim();
    const datosBase = {
      nombre: valores.nombre.trim(),
      descripcion: descripcion ? descripcion : undefined,
      estado: valores.estado
    };

    const esCrear = this.modoFormulario() === 'crear';
    const seleccionada = this.seccionSeleccionada();

    if (!esCrear && !seleccionada) {
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set(null);

    const peticion$ = esCrear
      ? this.servicioSecciones.crearSeccion({
          ...datosBase,
          usuarioCreacion: 1,
          usuarioActualizacion: 1
        })
      : this.servicioSecciones.actualizarSeccion(seleccionada!.id, {
          ...datosBase,
          usuarioActualizacion: 1
        });

    peticion$.pipe(takeUntilDestroyed(this.destruirRef)).subscribe({
      next: (seccion) => {
        this.guardando.set(false);
        this.formularioVisible.set(false);
        this.formularioSeccion.reset({
          nombre: '',
          descripcion: '',
          estado: true
        });
        this.cargarSecciones();
        const esCreacion = this.modoFormulario() === 'crear';
        this.mostrarNotificacion(
          'success',
          esCreacion ? 'Seccion creada' : 'Seccion actualizada',
          esCreacion
            ? `Se creo la seccion ${seccion.nombre}.`
            : `Se actualizo la seccion ${seccion.nombre}.`
        );
      },
      error: () => {
        this.guardando.set(false);
        this.errorFormulario.set('No pudimos guardar la seccion. Intentalo otra vez.');
        this.mostrarNotificacion('error', 'Error al guardar', 'Intentalo nuevamente.');
      }
    });
  }

  confirmarCambioEstado(seccion: SeccionPermiso, estado: boolean) {
    const activando = estado === true;
    this.servicioConfirmacion.confirm({
      message: activando
        ? `Deseas activar la seccion ${seccion.nombre}?`
        : `Deseas desactivar la seccion ${seccion.nombre}?`,
      header: activando ? 'Confirmar activacion' : 'Confirmar desactivacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: activando ? 'Si, activar' : 'Si, desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: activando ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      defaultFocus: 'reject',
      accept: () => this.actualizarEstadoSeccion(seccion, estado)
    });
  }

  formatearFecha(valor?: string | null) {
    if (!valor) {
      return '-';
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(fecha);
  }

  get controlesFormulario() {
    return this.formularioSeccion.controls;
  }

  private cargarSecciones() {
    this.cargando.set(true);
    this.error.set(null);

    this.servicioSecciones
      .obtenerSecciones()
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (secciones) => this.secciones.set(secciones),
        error: () =>
          this.error.set('No pudimos cargar las secciones. Intentalo nuevamente mas tarde.')
      });
  }

  private actualizarEstadoSeccion(seccion: SeccionPermiso, estado: boolean) {
    this.servicioSecciones
      .actualizarEstadoSeccion(seccion.id, estado)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (respuesta) => {
          const activo = estado === true;
          this.mostrarNotificacion(
            'success',
            activo ? 'Seccion activada' : 'Seccion desactivada',
            `${respuesta.nombre ?? seccion.nombre} fue ${activo ? 'activada' : 'desactivada'}.`
          );
          this.cargarSecciones();
        },
        error: () => {
          this.mostrarNotificacion('error', 'No se pudo actualizar', 'Intentalo nuevamente.');
        }
      });
  }

  private mostrarNotificacion(
    severidad: 'success' | 'info' | 'warn' | 'error',
    resumen: string,
    detalle: string
  ) {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
