import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigVideo } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-video-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-preview.component.html',
  styles: [`
    .extra-bloque { display: flex; flex-direction: column; gap: 0.75rem; }
    .seccion-subtitulo { font-family: var(--fuente-titulos, serif); color: var(--color-primario, #5d4037); font-size: 1rem; margin: 0; padding-bottom: 0.4rem; border-bottom: 2px solid var(--color-secundario, #c8a96e); }
    .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 10px; }
    .media-iframe, .media-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .media-caption { padding: 0.4rem 0; display: flex; flex-direction: column; gap: 0.2rem; }
    .caption-desc { font-size: 0.75rem; color: var(--color-primario, #5d4037); opacity: 0.8; }
    .bloque-placeholder { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; color: var(--color-primario, #5d4037); opacity: 0.5; font-size: 0.85rem; margin: 0; }
  `]
})
export class VideoPreviewComponent {
  @Input() config: ConfigVideo = { origen: 'youtube', url: '' };

  private readonly sanitizer = inject(DomSanitizer);

  get tieneUrl(): boolean {
    return !!(this.config?.url?.trim());
  }

  get esLocal(): boolean {
    return this.config?.origen === 'local';
  }

  get embedUrl(): SafeResourceUrl {
    const url = this.config?.url ?? '';
    const origen = this.config?.origen;

    if (origen === 'youtube') {
      const id = this.extraerIdYoutube(url);
      const embedStr = id
        ? `https://www.youtube.com/embed/${id}`
        : url;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedStr);
    }

    if (origen === 'vimeo') {
      const id = this.extraerIdVimeo(url);
      const embedStr = id
        ? `https://player.vimeo.com/video/${id}`
        : url;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedStr);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private extraerIdYoutube(url: string): string | null {
    // Handles: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }

  private extraerIdVimeo(url: string): string | null {
    // Handles: vimeo.com/ID, player.vimeo.com/video/ID
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  }
}
