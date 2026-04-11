import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import {
  SeccionRecorrido,
  SeccionesRecorridoServicio
} from '@features/museo/servicios/secciones-recorrido.servicio';
import {
  ElementoMultimedia,
  MultimediaServicio
} from '@features/museo/servicios/multimedia.servicio';
import { SesionesVisitaServicio } from '@features/museo/servicios/sesiones-visita.servicio';

@Component({
  selector: 'spa-seccion-visitante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seccion-visitante.component.html',
  styleUrl: './seccion-visitante.component.css'
})
export class SeccionVisitanteComponent implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly seccionesServicio = inject(SeccionesRecorridoServicio);
  private readonly multimediaServicio = inject(MultimediaServicio);
  private readonly sesionesServicio = inject(SesionesVisitaServicio);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destruirRef = inject(DestroyRef);

  readonly seccion = signal<SeccionRecorrido | null>(null);
  readonly multimedia = signal<ElementoMultimedia[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly apiBase = 'http://localhost:3000';

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
    this.cargarMultimedia(seccionId);
  }

  imagenUrl(elem: ElementoMultimedia): string {
    if (elem.url.startsWith('http')) return elem.url;
    return `${this.apiBase}${elem.url}`;
  }

  embedUrl(elem: ElementoMultimedia): SafeResourceUrl {
    const url = elem.url;
    let embedUrl = url;

    const youtubeMatch = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    if (youtubeMatch) {
      embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    } else {
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  esImagenLocal(elem: ElementoMultimedia): boolean {
    return elem.tipo === 'imagen';
  }

  esVideoExterno(elem: ElementoMultimedia): boolean {
    return elem.tipo === 'video-externo';
  }

  esVideoLocal(elem: ElementoMultimedia): boolean {
    return elem.tipo === 'video';
  }

  elementosActivos(): ElementoMultimedia[] {
    return this.multimedia().filter((m) => m.estado);
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

  private cargarMultimedia(seccionId: string): void {
    this.multimediaServicio
      .obtenerPorSeccion(seccionId)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (lista) => this.multimedia.set(lista),
        error: () => {
          // No bloqueamos la carga por fallo de multimedia
        }
      });
  }
}
