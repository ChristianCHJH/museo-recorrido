import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal,
  computed
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
  readonly modoReordenar = signal(false);
  readonly guardandoOrden = signal(false);
  readonly listaReorden = signal<Exposicion[]>([]);

  @Output() verSecciones = new EventEmitter<Exposicion>();

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
    tipo: ['permanente']
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.modoFormulario.set('crear');
    this.exposicionSeleccionada.set(null);
    this.errorFormulario.set(null);
    this.formulario.reset({ nombre: '', descripcion: '', tipo: 'permanente' });
    this.formularioVisible.set(true);
  }

  abrirEditar(expo: Exposicion): void {
    this.modoFormulario.set('editar');
    this.exposicionSeleccionada.set(expo);
    this.errorFormulario.set(null);
    this.formulario.reset({ nombre: expo.nombre, descripcion: expo.descripcion ?? '', tipo: expo.tipo ?? 'permanente' });
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
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion?.trim() || undefined,
      tipo: valores.tipo || 'permanente'
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
            `"${expo.nombre}" fue ${esCrear ? 'creada' : 'actualizada'} correctamente.`
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
        ? `Deseas activar "${expo.nombre}"?`
        : `Deseas desactivar "${expo.nombre}"?`,
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
      message: `Deseas eliminar la exposicion "${expo.nombre}"? Esta accion no se puede deshacer.`,
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

  // Reordenar
  activarReordenar(): void {
    this.listaReorden.set([...this.exposiciones()].sort((a, b) => a.orden - b.orden));
    this.modoReordenar.set(true);
  }

  cancelarReordenar(): void {
    this.modoReordenar.set(false);
  }

  moverArriba(index: number): void {
    if (index === 0) return;
    const lista = [...this.listaReorden()];
    [lista[index - 1], lista[index]] = [lista[index], lista[index - 1]];
    this.listaReorden.set(lista);
  }

  moverAbajo(index: number): void {
    const lista = this.listaReorden();
    if (index === lista.length - 1) return;
    const copia = [...lista];
    [copia[index + 1], copia[index]] = [copia[index], copia[index + 1]];
    this.listaReorden.set(copia);
  }

  guardarOrden(): void {
    const items = this.listaReorden().map((e, i) => ({ id: e.id, orden: i + 1 }));
    this.guardandoOrden.set(true);
    this.servicio
      .reordenar({ items })
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.guardandoOrden.set(false)))
      .subscribe({
        next: () => {
          this.modoReordenar.set(false);
          this.cargar();
          this.notificar('success', 'Orden guardado', 'El orden de las exposiciones fue actualizado.');
        },
        error: () => this.notificar('error', 'Error al guardar orden', 'Intentalo nuevamente.')
      });
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
            `"${expo.nombre}" fue ${estado ? 'activada' : 'desactivada'}.`
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
          this.notificar('success', 'Exposicion eliminada', `"${expo.nombre}" fue eliminada.`);
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
