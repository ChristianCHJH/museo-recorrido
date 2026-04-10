import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
} from '@angular/core';
import { PermisosUsuarioServicio } from '@core/services/permisos-usuario.servicio';

@Directive({
  selector: '[appPermiso]',
  standalone: true,
})
export class PermisoDirectiva {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permisosServicio = inject(PermisosUsuarioServicio);

  private permisosRequeridos: string[] = [];
  private mostrado = false;

  @Input()
  set appPermiso(permisos: string | string[]) {
    this.permisosRequeridos = Array.isArray(permisos) ? permisos : [permisos];
    this.actualizar();
  }

  private actualizar() {
    const tiene = this.permisosServicio.tieneAlgunPermiso(this.permisosRequeridos);
    if (tiene && !this.mostrado) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.mostrado = true;
    } else if (!tiene && this.mostrado) {
      this.viewContainer.clear();
      this.mostrado = false;
    }
  }
}
