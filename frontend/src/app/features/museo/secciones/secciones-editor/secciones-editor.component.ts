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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import {
  ElementoMultimedia,
  MultimediaServicio
} from '@features/museo/servicios/multimedia.servicio';
import { SeccionPreviewComponent } from '../seccion-preview/seccion-preview.component';
// SeccionFormLiveComponent desconectado en Fase 3 — disponible para Fase 4 si se necesita
// import { SeccionFormLiveComponent } from '../seccion-form-live/seccion-form-live.component';
import { EditorBloquesComponent } from '../editor-bloques/editor-bloques.component';

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
    SeccionPreviewComponent,
    EditorBloquesComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './secciones-editor.component.html',
  styleUrl: './secciones-editor.component.css'
})
export class SeccionesEditorComponent implements OnInit {
  @Input() exposicionId!: string;
  @Output() volver = new EventEmitter<void>();

  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;
  @ViewChild('inputAudio') inputAudio!: ElementRef<HTMLInputElement>;

  private readonly servicio = inject(SeccionesRecorridoServicio);
  private readonly multimediaServicio = inject(MultimediaServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  readonly secciones = signal<SeccionRecorrido[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly panelMultimediaVisible = signal(false);
  readonly seccionMultimedia = signal<SeccionRecorrido | null>(null);
  readonly multimedia = signal<ElementoMultimedia[]>([]);
  readonly cargandoMultimedia = signal(false);
  readonly videoUrlInput = signal('');
  readonly videoTituloInput = signal('');
  readonly mostrarFormVideo = signal(false);
  readonly subiendoArchivo = signal(false);
  readonly subiendoAudio = signal(false);

  // Live editor
  readonly modoLiveEditor = signal(false);
  readonly seccionParaEditar = signal<SeccionRecorrido | null>(null);

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
  readonly multimediaPreview = signal<ElementoMultimedia[]>([]);
  readonly cargandoPreview = signal(false);

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
          this.modoCrear.set(false);
          this.seccionParaEditar.set(nueva);
          this.modoLiveEditor.set(true);
        },
        error: () => this.notificar('error', 'Error al crear', 'No se pudo crear la sección.')
      });
  }

  cancelarCrear(): void {
    this.modoCrear.set(false);
    this.formularioCrear.reset();
  }

  abrirEditar(seccion: SeccionRecorrido): void {
    this.seccionParaEditar.set(seccion);
    this.modoLiveEditor.set(true);
  }

  alGuardarLive(): void {
    this.modoLiveEditor.set(false);
    this.seccionParaEditar.set(null);
    this.cargar();
    this.notificar('success', 'Seccion guardada', 'Los cambios fueron guardados correctamente.');
  }

  alCancelarLive(): void {
    this.modoLiveEditor.set(false);
    this.seccionParaEditar.set(null);
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
              if (this.seccionMultimedia()?.id === seccion.id) this.cerrarPanelMultimedia();
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
    this.multimediaPreview.set([]);
    this.previewVisible.set(true);
    this.cargandoPreview.set(true);
    this.multimediaServicio.obtenerPorSeccion(seccion.id)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.cargandoPreview.set(false)))
      .subscribe({
        next: (lista) => this.multimediaPreview.set(lista),
        error: () => {}
      });
  }

  cerrarPreview(): void {
    this.previewVisible.set(false);
    this.seccionPreview.set(null);
    this.multimediaPreview.set([]);
  }

  // Multimedia
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

  seleccionarAudio(): void {
    this.inputAudio.nativeElement.click();
  }

  alSeleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    const seccion = this.seccionMultimedia();
    if (!seccion) return;

    this.subiendoArchivo.set(true);
    this.multimediaServicio.subirImagen(seccion.id, archivo)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.subiendoArchivo.set(false)))
      .subscribe({
        next: () => {
          this.cargarMultimedia(seccion.id);
          this.notificar('success', 'Imagen subida', 'La imagen fue agregada correctamente.');
          input.value = '';
        },
        error: () => this.notificar('error', 'Error al subir imagen', 'Verifica el archivo e intentalo nuevamente.')
      });
  }

  alSeleccionarAudio(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    const seccion = this.seccionMultimedia();
    if (!seccion) return;

    this.subiendoAudio.set(true);
    this.servicio.subirAudio(seccion.id, archivo)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.subiendoAudio.set(false)))
      .subscribe({
        next: (sec) => {
          const secciones = this.secciones().map(s => s.id === sec.id ? sec : s);
          this.secciones.set(secciones);
          this.seccionMultimedia.set(sec);
          this.notificar('success', 'Audio subido', 'El audio fue asignado a la seccion.');
          input.value = '';
        },
        error: () => this.notificar('error', 'Error al subir audio', 'Verifica el archivo e intentalo nuevamente.')
      });
  }

  agregarVideo(): void {
    const url = this.videoUrlInput().trim();
    if (!url) return;
    const seccion = this.seccionMultimedia();
    if (!seccion) return;

    this.multimediaServicio.agregarVideoExterno(seccion.id, url, this.videoTituloInput().trim() || undefined)
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
    this.multimediaServicio.cambiarEstado(elemento.id, !elemento.estado)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => this.cargarMultimedia(this.seccionMultimedia()!.id),
        error: () => this.notificar('error', 'Error al actualizar estado', '')
      });
  }

  marcarPrincipal(elemento: ElementoMultimedia): void {
    this.multimediaServicio.marcarPrincipal(elemento.id)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => { this.cargarMultimedia(this.seccionMultimedia()!.id); this.notificar('success', 'Principal actualizado', ''); },
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
        this.multimediaServicio.eliminar(elemento.id)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => { this.cargarMultimedia(this.seccionMultimedia()!.id); this.notificar('success', 'Elemento eliminado', ''); },
            error: () => this.notificar('error', 'Error al eliminar', '')
          });
      }
    });
  }

  esVideo(elemento: ElementoMultimedia): boolean {
    return elemento.tipo.startsWith('video');
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

  private cargarMultimedia(seccionId: string): void {
    this.cargandoMultimedia.set(true);
    this.multimediaServicio.obtenerPorSeccion(seccionId)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.cargandoMultimedia.set(false)))
      .subscribe({
        next: (lista) => this.multimedia.set(lista),
        error: () => this.notificar('error', 'Error al cargar multimedia', '')
      });
  }

  private notificar(severidad: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string): void {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
