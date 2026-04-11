import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  Exposicion,
  CrearExposicionDto,
  ExposicionesServicio
} from '@features/museo/servicios/exposiciones.servicio';

@Component({
  selector: 'spa-exposiciones-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './exposiciones-lista.component.html',
  styleUrl: './exposiciones-lista.component.css'
})
export class ExposicionesListaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(ExposicionesServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);

  readonly exposiciones = signal<Exposicion[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly formularioVisible = signal(false);
  readonly modoFormulario = signal<'crear' | 'editar'>('crear');
  readonly exposicionSeleccionada = signal<Exposicion | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);

  @Output() verSecciones = new EventEmitter<Exposicion>();

  readonly formulario = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.modoFormulario.set('crear');
    this.exposicionSeleccionada.set(null);
    this.errorFormulario.set(null);
    this.formulario.reset({ titulo: '', descripcion: '' });
    this.formularioVisible.set(true);
  }

  abrirEditar(expo: Exposicion): void {
    this.modoFormulario.set('editar');
    this.exposicionSeleccionada.set(expo);
    this.errorFormulario.set(null);
    this.formulario.reset({ titulo: expo.titulo, descripcion: expo.descripcion ?? '' });
    this.formularioVisible.set(true);
  }

  cerrarFormulario(): void {
    if (this.guardando()) return;
    this.formularioVisible.set(false);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const dto: CrearExposicionDto = {
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion?.trim() || undefined
    };

    this.guardando.set(true);
    this.errorFormulario.set(null);

    const esCrear = this.modoFormulario() === 'crear';
    const peticion$ = esCrear
      ? this.servicio.crear(dto)
      : this.servicio.actualizar(this.exposicionSeleccionada()!.id, dto);

    peticion$
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (expo) => {
          this.guardando.set(false);
          this.formularioVisible.set(false);
          this.cargar();
          this.notificar(
            'success',
            esCrear ? 'Exposicion creada' : 'Exposicion actualizada',
            `"${expo.titulo}" fue ${esCrear ? 'creada' : 'actualizada'} correctamente.`
          );
        },
        error: () => {
          this.guardando.set(false);
          this.errorFormulario.set('No se pudo guardar. Intentalo nuevamente.');
          this.notificar('error', 'Error al guardar', 'Intentalo nuevamente en unos segundos.');
        }
      });
  }

  confirmarCambioEstado(expo: Exposicion): void {
    const activando = !expo.estado;
    this.servicioConfirmacion.confirm({
      message: activando
        ? `Deseas activar "${expo.titulo}"?`
        : `Deseas desactivar "${expo.titulo}"?`,
      header: activando ? 'Confirmar activacion' : 'Confirmar desactivacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: activando ? 'Si, activar' : 'Si, desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: activando ? 'p-button-success' : 'p-button-warning',
      rejectButtonStyleClass: 'p-button-text',
      defaultFocus: 'reject',
      accept: () => this.cambiarEstado(expo, activando)
    });
  }

  confirmarEliminar(expo: Exposicion): void {
    this.servicioConfirmacion.confirm({
      message: `Deseas eliminar la exposicion "${expo.titulo}"? Esta accion no se puede deshacer.`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      defaultFocus: 'reject',
      accept: () => this.eliminar(expo)
    });
  }

  emitirVerSecciones(expo: Exposicion): void {
    this.verSecciones.emit(expo);
  }

  recargar(): void {
    this.cargar();
  }

  get controles() {
    return this.formulario.controls;
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio
      .obtenerTodas()
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (lista) => this.exposiciones.set(lista),
        error: () => this.error.set('No se pudieron cargar las exposiciones. Intentalo nuevamente.')
      });
  }

  private cambiarEstado(expo: Exposicion, estado: boolean): void {
    this.servicio
      .cambiarEstado(expo.id, estado)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.cargar();
          this.notificar(
            'success',
            estado ? 'Exposicion activada' : 'Exposicion desactivada',
            `"${expo.titulo}" fue ${estado ? 'activada' : 'desactivada'}.`
          );
        },
        error: () => this.notificar('error', 'Error al actualizar estado', 'Intentalo nuevamente.')
      });
  }

  private eliminar(expo: Exposicion): void {
    this.servicio
      .eliminar(expo.id)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.cargar();
          this.notificar('success', 'Exposicion eliminada', `"${expo.titulo}" fue eliminada.`);
        },
        error: () => this.notificar('error', 'Error al eliminar', 'Intentalo nuevamente.')
      });
  }

  private notificar(
    severidad: 'success' | 'info' | 'warn' | 'error',
    resumen: string,
    detalle: string
  ): void {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
