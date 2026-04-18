import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  SeccionRecorrido,
  SeccionesRecorridoServicio
} from '@features/museo/servicios/secciones-recorrido.servicio';
import { CodigosQrServicio } from '@features/museo/servicios/codigos-qr.servicio';
import { SeccionPreviewComponent } from '../seccion-preview/seccion-preview.component';
// SeccionFormLiveComponent desconectado en Fase 3 — disponible para Fase 4 si se necesita
// import { SeccionFormLiveComponent } from '../seccion-form-live/seccion-form-live.component';

@Component({
  selector: 'spa-secciones-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    SeccionPreviewComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './secciones-editor.component.html',
  styleUrl: './secciones-editor.component.css'
})
export class SeccionesEditorComponent implements OnInit {
  @Input() exposicionId!: string;
  @Output() volver = new EventEmitter<void>();

  private readonly servicio = inject(SeccionesRecorridoServicio);
  private readonly servicioQr = inject(CodigosQrServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly secciones = signal<SeccionRecorrido[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  // Formulario de creación rápida
  readonly modoCrear = signal(false);
  readonly creando = signal(false);
  readonly formularioCrear = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    subtitulo: [''],
    descripcionBreve: [''],
    periodoHistorico: ['']
  });

  // Preview
  readonly previewVisible = signal(false);
  readonly seccionPreview = signal<SeccionRecorrido | null>(null);
  readonly bloquesPreview = signal<any[]>([]);
  readonly cargandoPreview = signal(false);

  // Vista QR
  readonly qrVistaVisible = signal(false);
  readonly qrVista = signal<any>(null);
  readonly apiBase = 'http://localhost:3000';

  // Reordenar
  readonly modoReordenar = signal(false);
  readonly apiUrl = environment.apiUrl;
  readonly listaReorden = signal<SeccionRecorrido[]>([]);
  readonly guardandoOrden = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.formularioCrear.reset();
    this.modoCrear.set(true);
  }

  confirmarCrear(): void {
    if (this.formularioCrear.invalid) {
      this.formularioCrear.markAllAsTouched();
      return;
    }
    const v = this.formularioCrear.getRawValue();
    this.creando.set(true);
    this.servicio.crear({
      exposicionId: this.exposicionId,
      nombre: v.nombre.trim(),
      subtitulo: v.subtitulo.trim() || undefined,
      descripcionBreve: v.descripcionBreve.trim() || undefined,
      periodoHistorico: v.periodoHistorico.trim() || undefined
    }).pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.creando.set(false)))
      .subscribe({
        next: (nueva) => {
          this.router.navigate(['/dashboard', 'exposiciones', this.exposicionId, 'secciones', nueva.id, 'editor']);
        },
        error: () => this.notificar('error', 'Error al crear', 'No se pudo crear la sección.')
      });
  }

  cancelarCrear(): void {
    this.modoCrear.set(false);
    this.formularioCrear.reset();
  }

  abrirEditar(seccion: SeccionRecorrido): void {
    this.router.navigate(['/dashboard', 'exposiciones', this.exposicionId, 'secciones', seccion.id, 'editor']);
  }

  confirmarCambioEstado(seccion: SeccionRecorrido): void {
    const activando = !seccion.estado;
    this.servicioConfirmacion.confirm({
      message: activando ? `Deseas activar "${seccion.nombre}"?` : `Deseas desactivar "${seccion.nombre}"?`,
      header: activando ? 'Activar seccion' : 'Desactivar seccion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: activando ? 'Si, activar' : 'Si, desactivar',
      rejectLabel: 'Cancelar',
      defaultFocus: 'reject',
      accept: () => {
        this.servicio.cambiarEstado(seccion.id, activando)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => { this.cargar(); this.notificar('success', activando ? 'Seccion activada' : 'Seccion desactivada', ''); },
            error: () => this.notificar('error', 'Error al actualizar estado', 'Intentalo nuevamente.')
          });
      }
    });
  }

  confirmarEliminar(seccion: SeccionRecorrido): void {
    this.servicioConfirmacion.confirm({
      message: `Deseas eliminar la seccion "${seccion.nombre}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      defaultFocus: 'reject',
      accept: () => {
        this.servicio.eliminar(seccion.id)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => {
              this.cargar();
              this.notificar('success', 'Seccion eliminada', `"${seccion.nombre}" fue eliminada.`);
            },
            error: () => this.notificar('error', 'Error al eliminar', 'Intentalo nuevamente.')
          });
      }
    });
  }

  // Reordenar
  activarReordenar(): void {
    this.listaReorden.set([...this.secciones()].sort((a, b) => a.orden - b.orden));
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
    const items = this.listaReorden().map((s, i) => ({ id: s.id, orden: i + 1 }));
    this.guardandoOrden.set(true);
    this.servicio.reordenar({ items })
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.guardandoOrden.set(false)))
      .subscribe({
        next: () => { this.modoReordenar.set(false); this.cargar(); this.notificar('success', 'Orden guardado', 'El orden fue actualizado.'); },
        error: () => this.notificar('error', 'Error al guardar orden', 'Intentalo nuevamente.')
      });
  }

  // Preview
  abrirPreview(seccion: SeccionRecorrido): void {
    this.seccionPreview.set(seccion);
    this.bloquesPreview.set([]);
    this.previewVisible.set(true);
    this.cargandoPreview.set(true);
    this.servicio.obtenerPorId(seccion.id)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.cargandoPreview.set(false)))
      .subscribe({
        next: (seccionConBloques) => {
          this.bloquesPreview.set(seccionConBloques.bloques || []);
        },
        error: () => {}
      });
  }

  cerrarPreview(): void {
    this.previewVisible.set(false);
    this.seccionPreview.set(null);
    this.bloquesPreview.set([]);
  }

  abrirVistaQr(qr: any): void {
    this.qrVista.set(qr);
    this.qrVistaVisible.set(true);
  }

  cerrarVistaQr(): void {
    this.qrVistaVisible.set(false);
    this.qrVista.set(null);
  }

  descargarQrUrl(qrId: string): string {
    return this.servicioQr.descargarUrl(qrId);
  }

  imagenQrUrl(qr: any): string | null {
    if (!qr || !qr.imagenQrUrl) return null;
    return `${this.apiBase}${qr.imagenQrUrl}`;
  }

  recargar(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.obtenerPorExposicion(this.exposicionId)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.secciones.set(lista),
        error: () => this.error.set('No se pudieron cargar las secciones. Intentalo nuevamente.')
      });
  }


  private notificar(severidad: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string): void {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
