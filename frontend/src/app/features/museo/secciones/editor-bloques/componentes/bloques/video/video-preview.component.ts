import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigVideo } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-video-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-preview.component.html'
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
