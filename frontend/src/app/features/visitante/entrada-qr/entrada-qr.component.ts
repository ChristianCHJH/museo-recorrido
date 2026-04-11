import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SesionesVisitaServicio } from '@features/museo/servicios/sesiones-visita.servicio';

@Component({
  selector: 'spa-entrada-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entrada-qr.component.html',
  styleUrl: './entrada-qr.component.css'
})
export class EntradaQrComponent implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicio = inject(SesionesVisitaServicio);
  private readonly destruirRef = inject(DestroyRef);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const codigoQr = this.ruta.snapshot.paramMap.get('codigoQr');
    if (!codigoQr) {
      this.error.set('Codigo QR no encontrado.');
      this.cargando.set(false);
      return;
    }
    this.iniciarSesion(codigoQr);
  }

  private iniciarSesion(codigoQr: string): void {
    this.cargando.set(true);
    this.error.set(null);

    this.servicio
      .iniciarSesion(codigoQr)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (respuesta) => {
          this.servicio.guardarToken(respuesta.token);
          this.cargando.set(false);
          this.router.navigate(['/visita', respuesta.seccionId]);
        },
        error: (err) => {
          this.cargando.set(false);
          const estado = err?.status;
          if (estado === 404) {
            this.error.set('Este codigo QR no existe o no es valido.');
          } else if (estado === 403) {
            this.error.set('Este codigo QR esta desactivado.');
          } else {
            this.error.set('No pudimos iniciar tu recorrido. Intentalo nuevamente.');
          }
        }
      });
  }
}
