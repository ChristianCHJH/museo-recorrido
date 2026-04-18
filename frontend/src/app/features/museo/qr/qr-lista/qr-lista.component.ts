import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  CodigoQr,
  CrearQrDto,
  SeccionDisponible,
  CodigosQrServicio
} from '@features/museo/servicios/codigos-qr.servicio';

@Component({
  selector: 'spa-qr-lista',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './qr-lista.component.html',
  styleUrl: './qr-lista.component.css'
})
export class QrListaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(CodigosQrServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);

  readonly codigos = signal<CodigoQr[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly formularioVisible = signal(false);
  readonly modoFormulario = signal<'crear' | 'editar'>('crear');
  readonly qrSeleccionado = signal<CodigoQr | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);
  readonly seccionesDisponibles = signal<SeccionDisponible[]>([]);
  readonly cargandoSecciones = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    nombreDescriptivo: ['', [Validators.required, Validators.minLength(2)]],
    seccionId: ['']
  });

  readonly apiBase = 'http://localhost:3000';

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.modoFormulario.set('crear');
    this.qrSeleccionado.set(null);
    this.errorFormulario.set(null);
    this.formulario.reset({ nombreDescriptivo: '', seccionId: '' });
    this.formularioVisible.set(true);
    this.cargarSeccionesDisponibles();
  }

  abrirEditar(qr: CodigoQr): void {
    this.modoFormulario.set('editar');
    this.qrSeleccionado.set(qr);
    this.errorFormulario.set(null);
    this.formulario.reset({
      nombreDescriptivo: qr.nombreDescriptivo,
      seccionId: qr.seccionId ?? ''
    });
    this.formularioVisible.set(true);
    this.cargarSeccionesDisponibles(qr.id);
  }

  cerrarFormulario(): void {
    if (this.guardando()) return;
    this.formularioVisible.set(false);
  }

  desvincularSeccion(): void {
    this.formulario.patchValue({ seccionId: '' });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const dto: CrearQrDto = {
      nombreDescriptivo: valores.nombreDescriptivo.trim(),
      seccionId: valores.seccionId?.trim() || null
    };

    this.guardando.set(true);
    this.errorFormulario.set(null);

    const esCrear = this.modoFormulario() === 'crear';
    const peticion$ = esCrear
      ? this.servicio.crear(dto)
      : this.servicio.actualizar(this.qrSeleccionado()!.id, dto);

    peticion$.pipe(takeUntilDestroyed(this.destruirRef)).subscribe({
      next: (qr) => {
        this.guardando.set(false);
        this.formularioVisible.set(false);
        this.cargar();
        this.notificar(
          'success',
          esCrear ? 'QR creado' : 'QR actualizado',
          `"${qr.nombreDescriptivo}" fue ${esCrear ? 'creado' : 'actualizado'} correctamente.`
        );
      },
      error: () => {
        this.guardando.set(false);
        this.errorFormulario.set('No se pudo guardar. Intentalo nuevamente.');
      }
    });
  }

  confirmarCambioEstado(qr: CodigoQr): void {
    const activando = !qr.activo;
    this.servicioConfirmacion.confirm({
      message: activando
        ? `Deseas activar el QR "${qr.nombreDescriptivo}"?`
        : `Deseas desactivar el QR "${qr.nombreDescriptivo}"?`,
      header: activando ? 'Activar QR' : 'Desactivar QR',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: activando ? 'Si, activar' : 'Si, desactivar',
      rejectLabel: 'Cancelar',
      defaultFocus: 'reject',
      accept: () => {
        this.servicio
          .cambiarEstado(qr.id, activando)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => {
              this.cargar();
              this.notificar('success', activando ? 'QR activado' : 'QR desactivado', '');
            },
            error: () => this.notificar('error', 'Error al actualizar estado', 'Intentalo nuevamente.')
          });
      }
    });
  }

  confirmarEliminar(qr: CodigoQr): void {
    this.servicioConfirmacion.confirm({
      message: `Deseas eliminar el QR "${qr.nombreDescriptivo}"? Esta accion no se puede deshacer.`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      defaultFocus: 'reject',
      accept: () => {
        this.servicio
          .eliminar(qr.id)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => {
              this.cargar();
              this.notificar('success', 'QR eliminado', `"${qr.nombreDescriptivo}" fue eliminado.`);
            },
            error: () => this.notificar('error', 'Error al eliminar', 'Intentalo nuevamente.')
          });
      }
    });
  }

  descargar(qr: CodigoQr): void {
    this.servicio
      .descargarQr(qr.id)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${qr.nombreDescriptivo}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: () => this.notificar('error', 'Error al descargar', 'No se pudo descargar el QR.')
      });
  }

  imagenQrUrl(qr: CodigoQr): string | null {
    if (!qr.imagenQrUrl) return null;
    return `${this.apiBase}${qr.imagenQrUrl}`;
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
      .obtenerTodos()
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (lista) => this.codigos.set(lista),
        error: () => this.error.set('No se pudieron cargar los codigos QR. Intentalo nuevamente.')
      });
  }

  private cargarSeccionesDisponibles(excluirQrId?: string): void {
    this.cargandoSecciones.set(true);
    this.servicio
      .obtenerSeccionesDisponibles(excluirQrId)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (secciones) => {
          this.seccionesDisponibles.set(secciones);
          this.cargandoSecciones.set(false);
        },
        error: () => {
          this.seccionesDisponibles.set([]);
          this.cargandoSecciones.set(false);
        }
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
