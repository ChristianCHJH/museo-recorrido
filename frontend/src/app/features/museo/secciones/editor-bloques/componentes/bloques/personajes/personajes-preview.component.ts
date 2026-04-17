import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigPersonajes } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-personajes-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personajes-preview.component.html',
  styles: [`
    .personaje-img {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
  `]
})
export class PersonajesPreviewComponent {
  @Input() config: ConfigPersonajes = { personajes: [] };

  get tienePersonajes(): boolean {
    return !!(this.config?.personajes?.length);
  }
}
