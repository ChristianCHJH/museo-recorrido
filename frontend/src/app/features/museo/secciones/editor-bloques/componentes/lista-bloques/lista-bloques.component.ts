import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TooltipModule } from 'primeng/tooltip';
import { Bloque } from '../../modelos/bloque.modelo';
import { REGISTRO_BLOQUES } from '../../registro/registro-bloques';
import { ToolbarBloqueComponent } from '../toolbar-bloque/toolbar-bloque.component';
import { RendererBloqueComponent } from '../renderer-bloque/renderer-bloque.component';

@Component({
  selector: 'spa-lista-bloques',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TooltipModule,
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
  @Output() agregarEnPosicion = new EventEmitter<number>();

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

  moverAbajo(index: number): void {
    if (index === this.bloques.length - 1) return;
    const lista = [...this.bloques];
    [lista[index + 1], lista[index]] = [lista[index], lista[index + 1]];
    this.bloquesChange.emit(lista);
  }
}
