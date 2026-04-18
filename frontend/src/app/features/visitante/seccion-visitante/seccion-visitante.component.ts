import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import {
  SeccionRecorrido,
  SeccionesRecorridoServicio
} from '@features/museo/servicios/secciones-recorrido.servicio';
import { SesionesVisitaServicio } from '@features/museo/servicios/sesiones-visita.servicio';
import { BloquesServicio } from '@features/museo/secciones/editor-bloques/servicios/bloques.servicio';
import { Bloque } from '@features/museo/secciones/editor-bloques/modelos/bloque.modelo';
import { PreviewBloquesComponent } from '@features/museo/secciones/editor-bloques/componentes/preview-bloques/preview-bloques.component';

@Component({
  selector: 'spa-seccion-visitante',
  standalone: true,
  imports: [CommonModule, PreviewBloquesComponent],
  templateUrl: './seccion-visitante.component.html',
  styleUrl: './seccion-visitante.component.css'
})
export class SeccionVisitanteComponent implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly seccionesServicio = inject(SeccionesRecorridoServicio);
  private readonly bloquesServicio = inject(BloquesServicio);
  private readonly sesionesServicio = inject(SesionesVisitaServicio);
  private readonly destruirRef = inject(DestroyRef);

  readonly seccion = signal<SeccionRecorrido | null>(null);
  readonly bloques = signal<Bloque[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const seccionId = this.ruta.snapshot.paramMap.get('seccionId');
    if (!seccionId) {
      this.error.set('Seccion no encontrada.');
      this.cargando.set(false);
      return;
    }

    const token = this.sesionesServicio.obtenerToken();
    if (!token) {
      this.error.set('No tienes una sesion activa.');
      this.cargando.set(false);
      return;
    }

    this.cargarSeccion(seccionId, token);
    this.cargarBloques(seccionId);
  }

  private cargarSeccion(seccionId: string, token: string): void {
    this.cargando.set(true);
    this.seccionesServicio
      .obtenerPublica(seccionId, token)
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (sec) => this.seccion.set(sec),
        error: () => this.error.set('No pudimos cargar esta seccion. Verifica tu acceso.')
      });
  }

  private cargarBloques(seccionId: string): void {
    const token = this.sesionesServicio.obtenerToken();
    if (!token) {
      return;
    }

    this.bloquesServicio
      .obtenerPorSeccionPublico(seccionId, token)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (lista) => this.bloques.set(lista),
        error: () => {
          // No bloqueamos la carga por fallo de bloques
        }
      });
  }
}
