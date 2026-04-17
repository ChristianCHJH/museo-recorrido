import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Bloque, TipoBloque } from '../../modelos/bloque.modelo';
import { REGISTRO_BLOQUES, DefinicionBloque } from '../../registro/registro-bloques';
import { ToolbarBloqueComponent } from '../toolbar-bloque/toolbar-bloque.component';
import { RendererBloqueComponent } from '../renderer-bloque/renderer-bloque.component';

@Component({
  selector: 'spa-lista-bloques',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TooltipModule,
    OverlayPanelModule,
    ToolbarBloqueComponent,
    RendererBloqueComponent
  ],
  templateUrl: './lista-bloques.component.html'
})
export class ListaBloquesComponent {
  @Input() bloques: Bloque[] = [];
  @Output() bloquesChange = new EventEmitter<Bloque[]>();
  @Output() eliminarBloque = new EventEmitter<string>();
  @Output() duplicarBloque = new EventEmitter<string>();
  @Output() agregarEnPosicion = new EventEmitter<{ posicion: number; tipo: TipoBloque }>();

  readonly tiposDisponibles: DefinicionBloque[] = Object.values(REGISTRO_BLOQUES);

  // Posición pendiente mientras el OverlayPanel está abierto
  private posicionPendiente = 0;

  abrirMiniPaleta(evento: MouseEvent, posicion: number, op: any): void {
    this.posicionPendiente = posicion;
    op.toggle(evento);
  }

  alElegirTipo(tipo: TipoBloque, op: any): void {
    op.hide();
    this.agregarEnPosicion.emit({ posicion: this.posicionPendiente, tipo });
  }

  labelTipo(tipo: string): string {
    return REGISTRO_BLOQUES[tipo]?.label ?? tipo;
  }

  iconoTipo(tipo: string): string {
    return REGISTRO_BLOQUES[tipo]?.icono ?? 'pi pi-question';
  }

  alSoltar(evento: CdkDragDrop<Bloque[]>): void {
    if (evento.previousIndex === evento.currentIndex) return;
    const lista = [...this.bloques];
    moveItemInArray(lista, evento.previousIndex, evento.currentIndex);
    this.bloquesChange.emit(lista);
  }

  alCambiarConfig(bloqueId: string | undefined, nuevoConfig: any): void {
    if (!bloqueId) return;
    const lista = this.bloques.map(b =>
      b.id === bloqueId ? { ...b, config: nuevoConfig } : b
    );
    this.bloquesChange.emit(lista);
  }

  moverArriba(index: number): void {
    if (index === 0) return;
    const lista = [...this.bloques];
    [lista[index - 1], lista[index]] = [lista[index], lista[index - 1]];
    this.bloquesChange.emit(lista);
  }

  trackById(_index: number, bloque: Bloque): string {
    return bloque.id ?? String(_index);
  }

  moverAbajo(index: number): void {
    if (index === this.bloques.length - 1) return;
    const lista = [...this.bloques];
    [lista[index + 1], lista[index]] = [lista[index], lista[index + 1]];
    this.bloquesChange.emit(lista);
  }
}
