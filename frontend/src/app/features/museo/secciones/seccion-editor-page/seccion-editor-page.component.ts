import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { SeccionRecorrido, SeccionesRecorridoServicio } from '@features/museo/servicios/secciones-recorrido.servicio';
import { EditorBloquesComponent } from '../editor-bloques/editor-bloques.component';

@Component({
  selector: 'spa-seccion-editor-page',
  standalone: true,
  imports: [CommonModule, EditorBloquesComponent],
  templateUrl: './seccion-editor-page.component.html',
  styleUrl: './seccion-editor-page.component.css'
})
export class SeccionEditorPageComponent implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicio = inject(SeccionesRecorridoServicio);
  private readonly destruirRef = inject(DestroyRef);

  readonly seccion = signal<SeccionRecorrido | null>(null);
  readonly cargando = signal(true);
  readonly exposicionId = signal<string>('');

  ngOnInit(): void {
    this.ruta.params
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe((params) => {
        const exposicionId = params['exposicionId'];
        const seccionId = params['seccionId'];

        if (!exposicionId || !seccionId) {
          this.router.navigate(['/dashboard', 'exposiciones']);
          return;
        }

        this.exposicionId.set(exposicionId);
        this.cargarSeccion(seccionId);
      });
  }

  private cargarSeccion(seccionId: string): void {
    this.cargando.set(true);
    this.servicio.obtenerPorId(seccionId)
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (seccion) => this.seccion.set(seccion),
        error: () => this.router.navigate(['/dashboard', 'exposiciones'])
      });
  }

  alGuardar(): void {
    this.router.navigate(['/dashboard', 'secciones']);
  }

  alCancelar(): void {
    this.router.navigate(['/dashboard', 'secciones']);
  }
}
