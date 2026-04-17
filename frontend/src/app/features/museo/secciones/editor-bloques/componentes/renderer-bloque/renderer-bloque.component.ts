import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Bloque } from '../../modelos/bloque.modelo';
import { REGISTRO_BLOQUES } from '../../registro/registro-bloques';

@Component({
  selector: 'spa-renderer-bloque',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!tipoRegistrado" class="tipo-desconocido">
      <i class="pi pi-exclamation-triangle"></i>
      <span>Tipo de bloque desconocido: {{ bloque?.tipo }}</span>
    </div>
    <ng-container #contenedor />
  `
})
export class RendererBloqueComponent implements OnChanges, OnDestroy {
  @Input() bloque!: Bloque;
  @Input() modoEdicion = true;
  @Output() configChange = new EventEmitter<any>();

  @ViewChild('contenedor', { read: ViewContainerRef, static: true })
  private readonly contenedor!: ViewContainerRef;

  private componenteRef: ComponentRef<any> | null = null;
  private suscripcion: Subscription | null = null;
  private pendingConfig: any = null;

  get tipoRegistrado(): boolean {
    return !!(this.bloque?.tipo && REGISTRO_BLOQUES[this.bloque.tipo]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bloque'] || changes['modoEdicion']) {
      this.renderizar();
    }
  }

  ngOnDestroy(): void {
    this.limpiar();
  }

  private renderizar(): void {
    if (!this.bloque?.tipo || !REGISTRO_BLOQUES[this.bloque.tipo]) {
      this.limpiar();
      return;
    }

    const definicion = REGISTRO_BLOQUES[this.bloque.tipo];
    const clase = this.modoEdicion ? definicion.componenteEditor : definicion.componentePreview;

    // Solo re-crear si cambio el tipo de componente
    if (this.componenteRef?.componentType !== clase) {
      this.limpiar();
      this.contenedor.clear();
      this.componenteRef = this.contenedor.createComponent(clase);
    }

    // Pasar el input config (omitir si es el mismo objeto que acabamos de emitir)
    if (this.componenteRef) {
      if (this.bloque.config !== this.pendingConfig) {
        this.componenteRef.setInput('config', this.bloque.config);
      }
      this.pendingConfig = null;

      // Suscribirse al output configChange solo en modo edicion
      if (this.modoEdicion && !this.suscripcion) {
        const instancia = this.componenteRef.instance;
        if (instancia.configChange) {
          this.suscripcion = instancia.configChange.subscribe((nuevoConfig: any) => {
            this.pendingConfig = nuevoConfig;
            this.configChange.emit(nuevoConfig);
          });
        }
      }
    }
  }

  private limpiar(): void {
    this.suscripcion?.unsubscribe();
    this.suscripcion = null;
    this.componenteRef?.destroy();
    this.componenteRef = null;
  }
}
