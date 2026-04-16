import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { SeccionRecorrido } from '@features/museo/servicios/secciones-recorrido.servicio';
import { ElementoMultimedia } from '@features/museo/servicios/multimedia.servicio';
import { environment } from '@env/environment';

@Component({
  selector: 'spa-seccion-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seccion-preview.component.html',
  styleUrl: './seccion-preview.component.css'
})
export class SeccionPreviewComponent {
  @Input() seccion!: SeccionRecorrido;
  @Input() multimedia: ElementoMultimedia[] = [];

  private readonly sanitizer = inject(DomSanitizer);
  readonly apiUrl = environment.apiUrl;

  imagenUrl(elem: ElementoMultimedia): string {
    if (elem.url.startsWith('http')) return elem.url;
    return `${this.apiUrl}${elem.url}`;
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
    return this.multimedia.filter((m) => m.estado);
  }
}
