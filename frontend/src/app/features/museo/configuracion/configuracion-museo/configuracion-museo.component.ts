import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import {
  ConfiguracionMuseo,
  ConfiguracionMuseoServicio
} from '@features/museo/servicios/configuracion-museo.servicio';

@Component({
  selector: 'spa-configuracion-museo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './configuracion-museo.component.html',
  styleUrl: './configuracion-museo.component.css'
})
export class ConfiguracionMuseoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(ConfiguracionMuseoServicio);
  private readonly destruirRef = inject(DestroyRef);
  private readonly servicioMensajes = inject(MessageService);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
    colorPrimario: ['#5D4037'],
    colorSecundario: ['#C5B358'],
    duracionSesionVisitaMinutos: [15, [Validators.required, Validators.min(1), Validators.max(480)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    this.guardando.set(true);

    this.servicio
      .actualizar({
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion?.trim() || undefined,
        colorPrimario: valores.colorPrimario || undefined,
        colorSecundario: valores.colorSecundario || undefined,
        duracionSesionVisitaMinutos: valores.duracionSesionVisitaMinutos
      })
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificar('success', 'Configuracion guardada', 'Los datos del museo fueron actualizados.');
        },
        error: () => {
          this.notificar('error', 'Error al guardar', 'No se pudo guardar la configuracion. Intentalo nuevamente.');
        }
      });
  }

  get controles() {
    return this.formulario.controls;
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio
      .obtener()
      .pipe(takeUntilDestroyed(this.destruirRef), finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (config) => this.poblarFormulario(config),
        error: () => this.error.set('No se pudo cargar la configuracion del museo.')
      });
  }

  private poblarFormulario(config: ConfiguracionMuseo): void {
    this.formulario.patchValue({
      nombre: config.nombre ?? '',
      descripcion: config.descripcion ?? '',
      colorPrimario: config.colorPrimario ?? '#5D4037',
      colorSecundario: config.colorSecundario ?? '#C5B358',
      duracionSesionVisitaMinutos: config.duracionSesionVisitaMinutos ?? 15
    });
  }

  private notificar(severidad: 'success' | 'error', resumen: string, detalle: string): void {
    this.servicioMensajes.add({ severity: severidad, summary: resumen, detail: detalle, life: 3500 });
  }
}
