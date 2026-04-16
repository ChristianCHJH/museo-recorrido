import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import {
  SeccionRecorrido,
  CrearSeccionDto,
  SeccionesRecorridoServicio
} from '@features/museo/servicios/secciones-recorrido.servicio';
import {
  ElementoMultimedia,
  MultimediaServicio
} from '@features/museo/servicios/multimedia.servicio';
import { environment } from '@env/environment';
import { SeccionPreviewComponent } from '../seccion-preview/seccion-preview.component';

@Component({
  selector: 'spa-seccion-form-live',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    SeccionPreviewComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './seccion-form-live.component.html',
  styleUrl: './seccion-form-live.component.css'
})
export class SeccionFormLiveComponent implements OnInit {
  @Input() exposicionId!: string;
  @Input() seccion: SeccionRecorrido | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;
  @ViewChild('inputAudio') inputAudio!: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(SeccionesRecorridoServicio);
  private readonly multimediaServicio = inject(MultimediaServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);

  readonly apiUrl = environment.apiUrl;

  // Form state
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);

  // Multimedia state
  readonly multimedia = signal<ElementoMultimedia[]>([]);
  readonly cargandoMultimedia = signal(false);
  readonly subiendoArchivo = signal(false);
  readonly subiendoAudio = signal(false);
  readonly mostrarFormVideo = signal(false);
  readonly videoUrlInput = signal('');
  readonly videoTituloInput = signal('');

  // Preview en vivo
  readonly previewSeccion = signal<SeccionRecorrido>({
    id: '',
    exposicionId: '',
    nombre: 'Sin nombre',
    subtitulo: null,
    descripcionBreve: null,
    contenidoHistorico: null,
    datosCuriosos: null,
    personajesRelacionados: null,
    periodoHistorico: null,
    fraseDestacada: null,
    orden: 0,
    imagenPrincipalUrl: null,
    audioUrl: null,
    plantilla: 'estandar',
    estado: true,
    creadoEn: new Date().toISOString()
  });

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    subtitulo: [''],
    descripcionBreve: [''],
    contenidoHistorico: [''],
    datosCuriosos: [''],
    personajesRelacionados: [''],
    periodoHistorico: [''],
    fraseDestacada: [''],
    plantilla: ['estandar']
  });

  get controles() {
    return this.formulario.controls;
  }

  get modoEditar(): boolean {
    return this.seccion !== null;
  }

  ngOnInit(): void {
    if (this.seccion) {
      this.formulario.reset({
        nombre: this.seccion.nombre,
        subtitulo: this.seccion.subtitulo ?? '',
        descripcionBreve: this.seccion.descripcionBreve ?? '',
        contenidoHistorico: this.seccion.contenidoHistorico ?? '',
        datosCuriosos: this.seccion.datosCuriosos ?? '',
        personajesRelacionados: this.seccion.personajesRelacionados ?? '',
        periodoHistorico: this.seccion.periodoHistorico ?? '',
        fraseDestacada: this.seccion.fraseDestacada ?? '',
        plantilla: this.seccion.plantilla ?? 'estandar'
      });
      this.cargarMultimedia(this.seccion.id);
    }

    this.previewSeccion.set(this.construirPreview(this.formulario.getRawValue()));

    this.formulario.valueChanges
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe(values => {
        this.previewSeccion.set(this.construirPreview(values));
      });
  }

  // ── Formulario ──────────────────────────────────────────

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const v = this.formulario.getRawValue();
    const dto: CrearSeccionDto = {
      exposicionId: this.exposicionId,
      nombre: v.nombre.trim(),
      subtitulo: v.subtitulo?.trim() || undefined,
      descripcionBreve: v.descripcionBreve?.trim() || undefined,
      contenidoHistorico: v.contenidoHistorico?.trim() || undefined,
      datosCuriosos: v.datosCuriosos?.trim() || undefined,
      personajesRelacionados: v.personajesRelacionados?.trim() || undefined,
      periodoHistorico: v.periodoHistorico?.trim() || undefined,
      fraseDestacada: v.fraseDestacada?.trim() || undefined,
      plantilla: v.plantilla || 'estandar'
    };

    this.guardando.set(true);
    this.errorFormulario.set(null);

    const peticion$ = this.modoEditar
      ? this.servicio.actualizar(this.seccion!.id, dto)
      : this.servicio.crear(dto);

    peticion$
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => this.guardado.emit(),
        error: () => this.errorFormulario.set('No se pudo guardar. Intentalo nuevamente.')
      });
  }

  cancelar(): void {
    this.cancelado.emit();
  }

  // ── Imágenes ────────────────────────────────────────────

  seleccionarArchivo(): void {
    this.inputArchivo.nativeElement.click();
  }

  alSeleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo || !this.seccion) return;

    this.subiendoArchivo.set(true);
    this.multimediaServicio.subirImagen(this.seccion.id, archivo)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.subiendoArchivo.set(false)))
      .subscribe({
        next: () => {
          this.cargarMultimedia(this.seccion!.id);
          this.notificar('success', 'Imagen subida', 'La imagen fue agregada correctamente.');
          input.value = '';
        },
        error: () => this.notificar('error', 'Error al subir imagen', 'Verifica el archivo e intentalo nuevamente.')
      });
  }

  // ── Audio ───────────────────────────────────────────────

  seleccionarAudio(): void {
    this.inputAudio.nativeElement.click();
  }

  alSeleccionarAudio(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo || !this.seccion) return;

    this.subiendoAudio.set(true);
    this.servicio.subirAudio(this.seccion.id, archivo)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.subiendoAudio.set(false)))
      .subscribe({
        next: (sec) => {
          // Actualizar audioUrl en la seccion local para que el preview lo muestre
          this.seccion = sec;
          this.previewSeccion.update(p => ({ ...p, audioUrl: sec.audioUrl }));
          this.notificar('success', 'Audio subido', 'El audio fue asignado a la seccion.');
          input.value = '';
        },
        error: () => this.notificar('error', 'Error al subir audio', 'Verifica el archivo e intentalo nuevamente.')
      });
  }

  // ── Video externo ────────────────────────────────────────

  agregarVideo(): void {
    const url = this.videoUrlInput().trim();
    if (!url || !this.seccion) return;

    this.multimediaServicio.agregarVideoExterno(this.seccion.id, url, this.videoTituloInput().trim() || undefined)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.cargarMultimedia(this.seccion!.id);
          this.videoUrlInput.set('');
          this.videoTituloInput.set('');
          this.mostrarFormVideo.set(false);
          this.notificar('success', 'Video agregado', 'El video fue agregado correctamente.');
        },
        error: () => this.notificar('error', 'Error al agregar video', 'Verifica la URL e intentalo nuevamente.')
      });
  }

  // ── Acciones multimedia ──────────────────────────────────

  marcarPrincipal(elemento: ElementoMultimedia): void {
    this.multimediaServicio.marcarPrincipal(elemento.id)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => { this.cargarMultimedia(this.seccion!.id); },
        error: () => this.notificar('error', 'Error al marcar principal', '')
      });
  }

  toggleEstadoMultimedia(elemento: ElementoMultimedia): void {
    this.multimediaServicio.cambiarEstado(elemento.id, !elemento.estado)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => this.cargarMultimedia(this.seccion!.id),
        error: () => this.notificar('error', 'Error al actualizar estado', '')
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
        this.multimediaServicio.eliminar(elemento.id)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => { this.cargarMultimedia(this.seccion!.id); this.notificar('success', 'Elemento eliminado', ''); },
            error: () => this.notificar('error', 'Error al eliminar', '')
          });
      }
    });
  }

  esVideo(elemento: ElementoMultimedia): boolean {
    return elemento.tipo.startsWith('video');
  }

  imagenThumbUrl(elem: ElementoMultimedia): string {
    if (elem.url.startsWith('http')) return elem.url;
    return `${this.apiUrl}${elem.url}`;
  }

  // ── Privados ─────────────────────────────────────────────

  private cargarMultimedia(seccionId: string): void {
    this.cargandoMultimedia.set(true);
    this.multimediaServicio.obtenerPorSeccion(seccionId)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.cargandoMultimedia.set(false)))
      .subscribe({
        next: (lista) => this.multimedia.set(lista),
        error: () => {}
      });
  }

  private construirPreview(values: Partial<Record<string, unknown>>): SeccionRecorrido {
    return {
      id: this.seccion?.id ?? '',
      exposicionId: this.exposicionId,
      nombre: String(values['nombre'] ?? '').trim() || 'Sin nombre',
      subtitulo: String(values['subtitulo'] ?? '').trim() || null,
      descripcionBreve: String(values['descripcionBreve'] ?? '').trim() || null,
      contenidoHistorico: String(values['contenidoHistorico'] ?? '').trim() || null,
      datosCuriosos: String(values['datosCuriosos'] ?? '').trim() || null,
      personajesRelacionados: String(values['personajesRelacionados'] ?? '').trim() || null,
      periodoHistorico: String(values['periodoHistorico'] ?? '').trim() || null,
      fraseDestacada: String(values['fraseDestacada'] ?? '').trim() || null,
      orden: this.seccion?.orden ?? 0,
      imagenPrincipalUrl: this.seccion?.imagenPrincipalUrl ?? null,
      audioUrl: this.seccion?.audioUrl ?? null,
      plantilla: String(values['plantilla'] ?? 'estandar') || 'estandar',
      estado: this.seccion?.estado ?? true,
      creadoEn: this.seccion?.creadoEn ?? new Date().toISOString()
    };
  }

  private notificar(severidad: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string): void {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
