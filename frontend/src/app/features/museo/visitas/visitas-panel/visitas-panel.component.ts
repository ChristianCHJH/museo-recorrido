import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  SesionVisita,
  RegistroAcceso,
  SesionesVisitaServicio
} from '@features/museo/servicios/sesiones-visita.servicio';

type TabActiva = 'sesiones' | 'logs';

@Component({
  selector: 'spa-visitas-panel',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './visitas-panel.component.html',
  styleUrl: './visitas-panel.component.css'
})
export class VisitasPanelComponent implements OnInit {
  private readonly servicio = inject(SesionesVisitaServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);
  private readonly servicioConfirmacion = inject(ConfirmationService);

  readonly tabActiva = signal<TabActiva>('sesiones');

  readonly sesiones = signal<SesionVisita[]>([]);
  readonly cargandoSesiones = signal(true);
  readonly errorSesiones = signal<string | null>(null);

  readonly logs = signal<RegistroAcceso[]>([]);
  readonly cargandoLogs = signal(true);
  readonly errorLogs = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarSesiones();
    this.cargarLogs();
  }

  cambiarTab(tab: TabActiva): void {
    this.tabActiva.set(tab);
  }

  truncarToken(token: string): string {
    if (token.length <= 16) return token;
    return `${token.substring(0, 8)}...${token.substring(token.length - 8)}`;
  }

  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleString('es-CL', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch {
      return fecha;
    }
  }

  confirmarRevocar(sesion: SesionVisita): void {
    this.servicioConfirmacion.confirm({
      message: `Deseas revocar la sesion del token ${this.truncarToken(sesion.token)}?`,
      header: 'Revocar sesion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, revocar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      defaultFocus: 'reject',
      accept: () => {
        this.servicio
          .revocarSesion(sesion.id)
          .pipe(takeUntilDestroyed(this.destruirRef))
          .subscribe({
            next: () => {
              this.cargarSesiones();
              this.notificar('success', 'Sesion revocada', 'La sesion fue revocada correctamente.');
            },
            error: () => this.notificar('error', 'Error al revocar', 'Intentalo nuevamente.')
          });
      }
    });
  }

  recargarSesiones(): void {
    this.cargarSesiones();
  }

  recargarLogs(): void {
    this.cargarLogs();
  }

  resultadoClase(resultado: string): string {
    switch (resultado?.toLowerCase()) {
      case 'exitoso':
      case 'ok':
      case 'success':
        return 'resultado-exito';
      case 'error':
      case 'fallido':
        return 'resultado-error';
      case 'expirado':
      case 'expired':
        return 'resultado-advertencia';
      default:
        return 'resultado-neutral';
    }
  }

  private cargarSesiones(): void {
    this.cargandoSesiones.set(true);
    this.errorSesiones.set(null);
    this.servicio
      .obtenerSesionesActivas()
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargandoSesiones.set(false))
      )
      .subscribe({
        next: (lista) => this.sesiones.set(lista),
        error: () => this.errorSesiones.set('No se pudieron cargar las sesiones.')
      });
  }

  private cargarLogs(): void {
    this.cargandoLogs.set(true);
    this.errorLogs.set(null);
    this.servicio
      .obtenerLogs()
      .pipe(
        takeUntilDestroyed(this.destruirRef),
        finalize(() => this.cargandoLogs.set(false))
      )
      .subscribe({
        next: (lista) => this.logs.set(lista),
        error: () => this.errorLogs.set('No se pudieron cargar los logs.')
      });
  }

  private notificar(
    severidad: 'success' | 'info' | 'warn' | 'error',
    resumen: string,
    detalle: string
  ): void {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
