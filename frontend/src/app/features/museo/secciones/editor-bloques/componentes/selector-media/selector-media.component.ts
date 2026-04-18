import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BibliotecaMediaServicio, ElementoMedia } from '@features/museo/servicios/biblioteca-media.servicio';
import { SubidorMediosComponent } from '../subidor-medios/subidor-medios.component';
import { environment } from '@env/environment';

@Component({
  selector: 'spa-selector-media',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    SkeletonModule,
    TooltipModule,
    ToastModule,
    SubidorMediosComponent
  ],
  providers: [MessageService],
  templateUrl: './selector-media.component.html',
  styleUrl: './selector-media.component.css'
})
export class SelectorMediaComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() tipoFiltrado?: 'imagen' | 'audio' | 'video';
  @Input() modo: 'uno' | 'multiple' = 'uno';

  @Output() seleccionado = new EventEmitter<ElementoMedia>();
  @Output() seleccionados = new EventEmitter<ElementoMedia[]>();
  @Output() cerrado = new EventEmitter<void>();

  private readonly servicioMedia = inject(BibliotecaMediaServicio);
  private readonly mensajes = inject(MessageService);

  private readonly destroy$ = new Subject<void>();
  private sesion$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  readonly items = signal<ElementoMedia[]>([]);
  readonly cargando = signal(false);
  readonly pagina = signal(1);
  readonly total = signal(0);
  readonly limite = 12;
  readonly seleccionadosLocales = signal<ElementoMedia[]>([]);
  readonly subidorVisible = signal(false);

  readonly controlBusqueda = new FormControl('');
  readonly controlTipo = new FormControl<string>('');

  readonly opcionesTipo = [
    { label: 'Todos', value: '' },
    { label: 'Imágenes', value: 'imagen' },
    { label: 'Audio', value: 'audio' },
    { label: 'Video', value: 'video' }
  ];

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.limite)));
  readonly hayAnterior = computed(() => this.pagina() > 1);
  readonly haySiguiente = computed(() => this.pagina() < this.totalPaginas());
  readonly contadorSeleccionados = computed(() => this.seleccionadosLocales().length);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.inicializar();
    }
  }

  ngOnDestroy(): void {
    this.sesion$.next();
    this.sesion$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializar(): void {
    this.sesion$.next();
    this.sesion$ = new Subject<void>();

    this.seleccionadosLocales.set([]);
    this.pagina.set(1);

    if (this.tipoFiltrado) {
      this.controlTipo.setValue(this.tipoFiltrado, { emitEvent: false });
      this.controlTipo.disable();
    } else {
      this.controlTipo.setValue('', { emitEvent: false });
      this.controlTipo.enable();
    }
    this.controlBusqueda.setValue('', { emitEvent: false });

    this.busqueda$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.sesion$))
      .subscribe(() => {
        this.pagina.set(1);
        this.cargarMedia();
      });

    this.controlTipo.valueChanges
      .pipe(takeUntil(this.sesion$))
      .subscribe(() => {
        this.pagina.set(1);
        this.cargarMedia();
      });

    this.cargarMedia();
  }

  alBuscar(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.busqueda$.next(valor);
  }

  cargarMedia(): void {
    this.cargando.set(true);
    const tipo = this.tipoFiltrado ?? (this.controlTipo.value || undefined);
    const busqueda = this.controlBusqueda.value?.trim() || undefined;

    this.servicioMedia
      .listar({ tipo, busqueda, pagina: this.pagina(), limite: this.limite })
      .pipe(
        takeUntil(this.sesion$),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          this.items.set(resultado?.items ?? []);
          this.total.set(resultado?.total ?? 0);
        },
        error: (err) => console.error('[SelectorMedia] error:', err)
      });
  }

  alClickTarjeta(item: ElementoMedia): void {
    if (this.modo === 'uno') {
      this.seleccionado.emit(item);
      this.cerrar();
      return;
    }

    const actuales = this.seleccionadosLocales();
    const yaSeleccionado = actuales.some(s => s.id === item.id);
    if (yaSeleccionado) {
      this.seleccionadosLocales.set(actuales.filter(s => s.id !== item.id));
    } else {
      this.seleccionadosLocales.set([...actuales, item]);
    }
  }

  estaSeleccionado(item: ElementoMedia): boolean {
    return this.seleccionadosLocales().some(s => s.id === item.id);
  }

  confirmarMultiple(): void {
    this.seleccionados.emit(this.seleccionadosLocales());
    this.cerrar();
  }

  irAPagina(delta: number): void {
    const nueva = this.pagina() + delta;
    if (nueva < 1 || nueva > this.totalPaginas()) return;
    this.pagina.set(nueva);
    this.cargarMedia();
  }

  alErrorSubida(): void {
    this.mensajes.add({
      severity: 'error',
      summary: 'Error al subir',
      detail: 'No se pudo subir el archivo. Intenta nuevamente.',
      life: 4000
    });
  }

  alSubirNuevo(elemento: ElementoMedia): void {
    this.mensajes.add({
      severity: 'success',
      summary: 'Archivo subido',
      detail: `"${elemento.nombre ?? elemento.titulo ?? 'Archivo'}" se subió correctamente.`,
      life: 3500
    });
    this.pagina.set(1);
    this.cargarMedia();
  }

  cerrar(): void {
    this.sesion$.next();
    this.visibleChange.emit(false);
    this.cerrado.emit();
  }

  urlCompleta(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
  }

  iconoTipoMedia(tipo: string): string {
    if (tipo === 'audio') return 'pi pi-volume-up';
    if (tipo === 'video') return 'pi pi-video';
    return 'pi pi-image';
  }

  claseThumbnailIcon(tipo: string): string {
    if (tipo === 'audio') return 'tarjeta-media-thumb-icon tarjeta-media-thumb-icon--audio';
    if (tipo.startsWith('video')) return 'tarjeta-media-thumb-icon tarjeta-media-thumb-icon--video';
    return 'tarjeta-media-thumb-icon tarjeta-media-thumb-icon--otro';
  }

  nombreVisible(item: ElementoMedia): string {
    return item.nombre ?? item.titulo ?? 'Sin nombre';
  }
}
