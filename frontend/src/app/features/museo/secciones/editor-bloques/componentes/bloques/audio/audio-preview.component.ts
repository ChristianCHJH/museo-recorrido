import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigAudio } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-audio-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-preview.component.html'
})
export class AudioPreviewComponent {
  @Input() config: ConfigAudio = { url: '' };

  get tieneUrl(): boolean {
    return !!(this.config?.url?.trim());
  }

  get etiqueta(): string {
    return this.config?.etiqueta?.es?.trim() || 'Audio narrado';
  }
}
