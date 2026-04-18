import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigAudio } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-audio-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-preview.component.html',
  styles: [`
    .audio-block { background: white; border-radius: 10px; padding: 0.75rem; box-shadow: 0 1px 6px rgba(93,64,55,0.1); }
    .audio-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; color: var(--color-primario, #5d4037); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .bloque-placeholder { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; color: var(--color-primario, #5d4037); opacity: 0.5; font-size: 0.85rem; margin: 0; }
  `]
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
