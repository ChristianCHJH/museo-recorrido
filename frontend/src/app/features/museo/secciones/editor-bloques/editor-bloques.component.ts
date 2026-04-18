import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  DestroyRef,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

import { SeccionRecorrido } from '@features/museo/servicios/secciones-recorrido.servicio';
import { Bloque, TipoBloque } from './modelos/bloque.modelo';
import { BloquesServicio } from './servicios/bloques.servicio';
import { REGISTRO_BLOQUES } from './registro/registro-bloques';
import { PaletaBloquesComponent } from './componentes/paleta-bloques/paleta-bloques.component';
import { ListaBloquesComponent } from './componentes/lista-bloques/lista-bloques.component';
import { PreviewBloquesComponent } from './componentes/preview-bloques/preview-bloques.component';

@Component({
  selector: 'spa-editor-bloques',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    PaletaBloquesComponent,
    ListaBloquesComponent,
    PreviewBloquesComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './editor-bloques.component.html',
  styleUrl: './editor-bloques.component.css'
})
export class EditorBloquesComponent implements OnInit {
  @Input() seccion!: SeccionRecorrido;
  @Input() exposicionId!: string;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);
  private readonly bloquesServicio = inject(BloquesServicio);
  private readonly destroyRef = inject(DestroyRef);

  readonly bloques = signal<Bloque[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly hayChangesSinGuardar = signal(false);

  readonly contadorBloques = computed(() => this.bloques().length);

  ngOnInit(): void {
    this.cargarBloques();
  }

  // ── Carga ────────────────────────────────────────────────

  private cargarBloques(): void {
    if (!this.seccion?.id) return;
    this.cargando.set(true);
    this.bloquesServicio.obtenerPorSeccion(this.seccion.id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.bloques.set(lista),
        error: () => this.notificar('error', 'Error al cargar bloques', 'Intentalo nuevamente.')
      });
  }

  // ── Mutaciones locales ───────────────────────────────────

  alAgregarBloque(tipo: TipoBloque): void {
    const definicion = REGISTRO_BLOQUES[tipo];
    if (!definicion) return;

    const nuevo: Bloque = {
      id: crypto.randomUUID(),
      tipo,
      orden: this.bloques().length + 1,
      config: structuredClone(definicion.defaultConfig),
      estado: true
    };

    this.bloques.update(lista => [...lista, nuevo]);
    this.hayChangesSinGuardar.set(true);
  }

  alAgregarEnPosicion({ posicion, tipo }: { posicion: number; tipo: TipoBloque }): void {
    const definicion = REGISTRO_BLOQUES[tipo];
    if (!definicion) return;

    const nuevo: Bloque = {
      id: crypto.randomUUID(),
      tipo,
      orden: posicion + 1,
      config: structuredClone(definicion.defaultConfig),
      estado: true
    };

    this.bloques.update(lista => {
      const copia = [...lista];
      copia.splice(posicion, 0, nuevo);
      return this.recalcularOrden(copia);
    });
    this.hayChangesSinGuardar.set(true);
  }

  alCambiarConfig(bloqueId: string, nuevoConfig: any): void {
    this.bloques.update(lista =>
      lista.map(b => b.id === bloqueId ? { ...b, config: nuevoConfig } : b)
    );
    this.hayChangesSinGuardar.set(true);
  }

  alReordenar(nuevosBloques: Bloque[]): void {
    this.bloques.set(this.recalcularOrden(nuevosBloques));
    this.hayChangesSinGuardar.set(true);
  }

  alEliminar(bloqueId: string | undefined): void {
    if (!bloqueId) return;
    this.bloques.update(lista =>
      this.recalcularOrden(lista.filter(b => b.id !== bloqueId))
    );
    this.hayChangesSinGuardar.set(true);
  }

  alDuplicar(bloqueId: string | undefined): void {
    if (!bloqueId) return;
    const original = this.bloques().find(b => b.id === bloqueId);
    if (!original) return;

    const indice = this.bloques().findIndex(b => b.id === bloqueId);
    const clon: Bloque = {
      ...structuredClone(original),
      id: crypto.randomUUID(),
      orden: original.orden + 1
    };

    this.bloques.update(lista => {
      const copia = [...lista];
      copia.splice(indice + 1, 0, clon);
      return this.recalcularOrden(copia);
    });
    this.hayChangesSinGuardar.set(true);
  }

  // ── Guardar ──────────────────────────────────────────────

  guardar(): void {
    if (!this.hayChangesSinGuardar() || this.guardando()) return;

    this.guardando.set(true);
    this.bloquesServicio.guardarLote(this.seccion.id, this.bloques())
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (lista) => {
          this.bloques.set(lista);
          this.hayChangesSinGuardar.set(false);
          this.notificar('success', 'Bloques guardados', 'Los cambios fueron guardados correctamente.');
          this.guardado.emit();
        },
        error: () => this.notificar('error', 'Error al guardar', 'No se pudo guardar. Intentalo nuevamente.')
      });
  }

  cancelar(): void {
    if (this.hayChangesSinGuardar()) {
      this.servicioConfirmacion.confirm({
        message: 'Tienes cambios sin guardar. Si cancelas los perdereas.',
        header: 'Confirmar cancelacion',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Si, descartar',
        rejectLabel: 'Continuar editando',
        acceptButtonStyleClass: 'p-button-danger',
        defaultFocus: 'reject',
        accept: () => this.cancelado.emit()
      });
    } else {
      this.cancelado.emit();
    }
  }

  // ── Utilidades ───────────────────────────────────────────

  private recalcularOrden(lista: Bloque[]): Bloque[] {
    return lista.map((b, i) => ({ ...b, orden: i + 1 }));
  }

  private notificar(severidad: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string): void {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
