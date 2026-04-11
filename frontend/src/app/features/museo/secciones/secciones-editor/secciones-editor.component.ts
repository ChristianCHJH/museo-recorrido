import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ElementRef,
  ViewChild,
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
  SeccionRecorrido,
  CrearSeccionDto,
  SeccionesRecorridoServicio
} from '@features/museo/servicios/secciones-recorrido.servicio';
import {
  ElementoMultimedia,
  MultimediaServicio
} from '@features/museo/servicios/multimedia.servicio';

@Component({
  selector: 'spa-secciones-editor',
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
  templateUrl: './secciones-editor.component.html',
  styleUrl: './secciones-editor.component.css'
})
export class SeccionesEditorComponent implements OnInit {
  @Input() exposicionId!: string;
  @Output() volver = new EventEmitter<void>();

  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(SeccionesRecorridoServicio);
  private readonly multimediaServicio = inject(MultimediaServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);

  readonly secciones = signal<SeccionRecorrido[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly formularioVisible = signal(false);
  readonly modoFormulario = signal<'crear' | 'editar'>('crear');
  readonly seccionSeleccionada = signal<SeccionRecorrido | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);

  readonly panelMultimediaVisible = signal(false);
  readonly seccionMultimedia = signal<SeccionRecorrido | null>(null);
  readonly multimedia = signal<ElementoMultimedia[]>([]);
  readonly cargandoMultimedia = signal(false);
  readonly videoUrlInput = signal('');
  readonly videoTituloInput = signal('');
  readonly mostrarFormVideo = signal(false);
  readonly subiendoArchivo = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.modoFormulario.set('crear');
    this.seccionSeleccionada.set(null);
    this.errorFormulario.set(null);
    this.formulario.reset({ titulo: '', descripcion: '' });
    this.formularioVisible.set(true);
  }

  abrirEditar(seccion: SeccionRecorrido): void {
    this.modoFormulario.set('editar');
    this.seccionSeleccionada.set(seccion);
    this.errorFormulario.set(null);
    this.formulario.reset({ titulo: seccion.titulo, descripcion: seccion.descripcion ?? '' });
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
    const dto: CrearSeccionDto = {
      exposicionId: this.exposicionId,
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion?.trim() || undefined
    };

    this.guardando.set(true);
    this.errorFormulario.set(null);

    const esCrear = this.modoFormulario() === 'crear';
    const peticion$ = esCrear
      ? this.servicio.crear(dto)
      : this.servicio.actualizar(this.seccionSeleccionada()!.id, {
          titulo: dto.titulo,
          descripcion: dto.descripcion
        });

    peticion$.pipe(takeUntilDestroyed(this.destruirRef)).subscribe({
      next: (sec) => {
        this.guardando.set(false);
        this.formularioVisible.set(false);
        this.cargar();
        this.notificar(
          'success',
          esCrear ? 'Seccion creada' : 'Seccion actualizada',
          `"${sec.titulo}" fue ${esCrear ? 'creada' : 'actualizada'}.`
        );
      },
      error: () => {
        this.guardando.set(false);
        this.errorFormulario.set('No se pudo guardar. Intentalo nuevamente.');
      }
    });
  }

  confirmarCambioEstado(seccion: SeccionRecorrido): void {
    const activando = !seccion.estado;
    this.servicioConfirmacion.confirm({
      message: activando
        ? `Deseas activar "${seccion.titulo}"?`
        : `Deseas desactivar "${seccion.titulo}"?`,
      header: activando ? 'Activar seccion' : 'Desactivar seccion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: activando ? 'Si, activar' : 'Si, desactivar',
      rejectLabel: 'Cancelar',
      defaultFocus: 'reject',
      accept: () => {
        this.servicio
          .cambiarEstado(seccion.id, activando)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => {
              this.cargar();
              this.notificar('success', activando ? 'Seccion activada' : 'Seccion desactivada', '');
            },
            error: () => this.notificar('error', 'Error al actualizar estado', 'Intentalo nuevamente.')
          });
      }
    });
  }

  confirmarEliminar(seccion: SeccionRecorrido): void {
    this.servicioConfirmacion.confirm({
      message: `Deseas eliminar la seccion "${seccion.titulo}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      defaultFocus: 'reject',
      accept: () => {
        this.servicio
          .eliminar(seccion.id)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => {
              this.cargar();
              if (this.seccionMultimedia()?.id === seccion.id) {
                this.cerrarPanelMultimedia();
              }
              this.notificar('success', 'Seccion eliminada', `"${seccion.titulo}" fue eliminada.`);
            },
            error: () => this.notificar('error', 'Error al eliminar', 'Intentalo nuevamente.')
          });
      }
    });
  }

  abrirMultimedia(seccion: SeccionRecorrido): void {
    this.seccionMultimedia.set(seccion);
    this.panelMultimediaVisible.set(true);
    this.cargarMultimedia(seccion.id);
  }

  cerrarPanelMultimedia(): void {
    this.panelMultimediaVisible.set(false);
    this.seccionMultimedia.set(null);
    this.multimedia.set([]);
    this.mostrarFormVideo.set(false);
  }

  seleccionarArchivo(): void {
    this.inputArchivo.nativeElement.click();
  }

  alSeleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    const seccion = this.seccionMultimedia();
    if (!seccion) return;

    this.subiendoArchivo.set(true);
    this.multimediaServicio
      .subirImagen(seccion.id, archivo)
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.subiendoArchivo.set(false))
      )
      .subscribe({
        next: () => {
          this.cargarMultimedia(seccion.id);
          this.notificar('success', 'Imagen subida', 'La imagen fue agregada correctamente.');
          input.value = '';
        },
        error: () => this.notificar('error', 'Error al subir imagen', 'Verifica el archivo e intentalo nuevamente.')
      });
  }

  agregarVideo(): void {
    const url = this.videoUrlInput().trim();
    if (!url) return;
    const seccion = this.seccionMultimedia();
    if (!seccion) return;

    this.multimediaServicio
      .agregarVideoExterno(seccion.id, url, this.videoTituloInput().trim() || undefined)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.cargarMultimedia(seccion.id);
          this.videoUrlInput.set('');
          this.videoTituloInput.set('');
          this.mostrarFormVideo.set(false);
          this.notificar('success', 'Video agregado', 'El video fue agregado correctamente.');
        },
        error: () => this.notificar('error', 'Error al agregar video', 'Verifica la URL e intentalo nuevamente.')
      });
  }

  toggleEstadoMultimedia(elemento: ElementoMultimedia): void {
    this.multimediaServicio
      .cambiarEstado(elemento.id, !elemento.estado)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => this.cargarMultimedia(this.seccionMultimedia()!.id),
        error: () => this.notificar('error', 'Error al actualizar estado', '')
      });
  }

  marcarPrincipal(elemento: ElementoMultimedia): void {
    this.multimediaServicio
      .marcarPrincipal(elemento.id)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.cargarMultimedia(this.seccionMultimedia()!.id);
          this.notificar('success', 'Principal actualizado', '');
        },
        error: () => this.notificar('error', 'Error al marcar principal', '')
      });
  }

  confirmarEliminarMultimedia(elemento: ElementoMultimedia): void {
    this.servicioConfirmacion.confirm({
      message: 'Deseas eliminar este elemento multimedia?',
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      defaultFocus: 'reject',
      accept: () => {
        this.multimediaServicio
          .eliminar(elemento.id)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => {
              this.cargarMultimedia(this.seccionMultimedia()!.id);
              this.notificar('success', 'Elemento eliminado', '');
            },
            error: () => this.notificar('error', 'Error al eliminar', '')
          });
      }
    });
  }

  esVideo(elemento: ElementoMultimedia): boolean {
    return elemento.tipo === 'video' || elemento.tipo === 'video-externo';
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
      .obtenerPorExposicion(this.exposicionId)
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (lista) => this.secciones.set(lista),
        error: () => this.error.set('No se pudieron cargar las secciones. Intentalo nuevamente.')
      });
  }

  private cargarMultimedia(seccionId: string): void {
    this.cargandoMultimedia.set(true);
    this.multimediaServicio
      .obtenerPorSeccion(seccionId)
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargandoMultimedia.set(false))
      )
      .subscribe({
        next: (lista) => this.multimedia.set(lista),
        error: () => this.notificar('error', 'Error al cargar multimedia', '')
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
