import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BarraLateralComponent } from '@shared/components/barra-lateral/barra-lateral.component';
import { UsuariosListaComponent } from '@features/usuarios/usuarios-lista/usuarios-lista.component';
import { SeccionesPermisoListaComponent } from '@features/secciones/secciones-permiso-lista/secciones-permiso-lista.component';
import { PermisosListaComponent } from '@features/permisos/permisos-lista/permisos-lista.component';
import { RolesListaComponent } from '@features/roles/roles-lista/roles-lista.component';
import { RolAccesoComponent } from '@features/roles/rol-acceso/rol-acceso.component';
import { UsuarioAccesoComponent } from '@features/usuarios/usuario-acceso/usuario-acceso.component';
import { ExposicionesListaComponent } from '@features/museo/exposiciones/exposiciones-lista/exposiciones-lista.component';
import { SeccionesEditorComponent } from '@features/museo/secciones/secciones-editor/secciones-editor.component';
import { QrListaComponent } from '@features/museo/qr/qr-lista/qr-lista.component';
import { VisitasPanelComponent } from '@features/museo/visitas/visitas-panel/visitas-panel.component';
import { ElementoListaUsuario } from '@core/services/usuarios.servicio';
import { Rol } from '@core/services/roles.servicio';
import { Exposicion } from '@features/museo/servicios/exposiciones.servicio';

@Component({
  selector: 'spa-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BarraLateralComponent,
    UsuariosListaComponent,
    SeccionesPermisoListaComponent,
    PermisosListaComponent,
    RolesListaComponent,
    RolAccesoComponent,
    UsuarioAccesoComponent,
    ExposicionesListaComponent,
    SeccionesEditorComponent,
    QrListaComponent,
    VisitasPanelComponent
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly destruirRef = inject(DestroyRef);

  anchoBarraLateral = 264;
  private readonly claveAlmacenamientoUsuario = 'spa.dashboard.usuarioSeleccionado';
  private readonly claveAlmacenamientoRol = 'spa.dashboard.rolSeleccionado';
  private readonly claveAlmacenamientoExposicion = 'spa.dashboard.exposicionSeleccionada';
  vistaActiva: string = 'users';
  usuarioSeleccionado: ElementoListaUsuario | null = null;
  rolSeleccionado: Rol | null = null;
  readonly exposicionSeleccionada = signal<Exposicion | null>(null);

  ngOnInit(): void {
    this.ruta.paramMap
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe((params) => {
        const vista = params.get('vista');
        if (!vista) {
          this.router.navigate(['/dashboard', 'users'], { replaceUrl: true });
          return;
        }
        this.vistaActiva = vista;
        if (this.vistaActiva === 'user-access' && !this.usuarioSeleccionado) {
          const usuarioGuardado = this.leerUsuarioAlmacenado();
          if (usuarioGuardado) {
            this.usuarioSeleccionado = usuarioGuardado;
          } else {
            this.router.navigate(['/dashboard', 'users'], { replaceUrl: true });
          }
        }
        if (this.vistaActiva === 'rol-access' && !this.rolSeleccionado) {
          const rolGuardado = this.leerRolAlmacenado();
          if (rolGuardado) {
            this.rolSeleccionado = rolGuardado;
          } else {
            this.router.navigate(['/dashboard', 'roles'], { replaceUrl: true });
          }
        }
        if (this.vistaActiva === 'secciones' && !this.exposicionSeleccionada()) {
          const expoGuardada = this.leerExposicionAlmacenada();
          if (expoGuardada) {
            this.exposicionSeleccionada.set(expoGuardada);
          } else {
            this.router.navigate(['/dashboard', 'exposiciones'], { replaceUrl: true });
          }
        }
      });
  }

  alCambiarAnchoBarraLateral(ancho: number) {
    this.anchoBarraLateral = ancho;
  }

  alSeleccionarElementoBarraLateral(clave: string) {
    this.router.navigate(['/dashboard', clave]);
  }

  alVerAccesos(usuario: ElementoListaUsuario) {
    this.usuarioSeleccionado = usuario;
    this.persistirUsuario(usuario);
    this.router.navigate(['/dashboard', 'user-access']);
  }

  alVolverUsuarios() {
    this.limpiarUsuarioAlmacenado();
    this.router.navigate(['/dashboard', 'users']);
  }

  alVerSecciones(expo: Exposicion) {
    this.exposicionSeleccionada.set(expo);
    this.persistirExposicion(expo);
    this.router.navigate(['/dashboard', 'secciones']);
  }

  alVolverExposiciones() {
    this.limpiarExposicionAlmacenada();
    this.exposicionSeleccionada.set(null);
    this.router.navigate(['/dashboard', 'exposiciones']);
  }

  claveActivaBarraLateral(): string {
    if (this.vistaActiva === 'user-access') {
      return 'users';
    }
    if (this.vistaActiva === 'rol-access') {
      return 'roles';
    }
    if (this.vistaActiva === 'secciones') {
      return 'exposiciones';
    }
    return this.vistaActiva;
  }

  alVerPermisosRol(rol: Rol) {
    this.rolSeleccionado = rol;
    this.persistirRol(rol);
    this.router.navigate(['/dashboard', 'rol-access']);
  }

  alVolverRoles() {
    this.limpiarRolAlmacenado();
    this.router.navigate(['/dashboard', 'roles']);
  }

  private persistirUsuario(usuario: ElementoListaUsuario) {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(this.claveAlmacenamientoUsuario, JSON.stringify(usuario));
    } catch {
      // ignorar
    }
  }

  private leerUsuarioAlmacenado(): ElementoListaUsuario | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const crudo = window.localStorage.getItem(this.claveAlmacenamientoUsuario);
      if (!crudo) {
        return null;
      }
      return JSON.parse(crudo) as ElementoListaUsuario;
    } catch {
      return null;
    }
  }

  private limpiarUsuarioAlmacenado() {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(this.claveAlmacenamientoUsuario);
    } catch {
      // ignorar
    }
  }

  private persistirRol(rol: Rol) {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(this.claveAlmacenamientoRol, JSON.stringify(rol));
    } catch {
      // ignorar
    }
  }

  private leerRolAlmacenado(): Rol | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const crudo = window.localStorage.getItem(this.claveAlmacenamientoRol);
      if (!crudo) {
        return null;
      }
      return JSON.parse(crudo) as Rol;
    } catch {
      return null;
    }
  }

  private limpiarRolAlmacenado() {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(this.claveAlmacenamientoRol);
    } catch {
      // ignorar
    }
  }

  private persistirExposicion(expo: Exposicion) {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(this.claveAlmacenamientoExposicion, JSON.stringify(expo));
    } catch {
      // ignorar
    }
  }

  private leerExposicionAlmacenada(): Exposicion | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const crudo = window.localStorage.getItem(this.claveAlmacenamientoExposicion);
      if (!crudo) {
        return null;
      }
      return JSON.parse(crudo) as Exposicion;
    } catch {
      return null;
    }
  }

  private limpiarExposicionAlmacenada() {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(this.claveAlmacenamientoExposicion);
    } catch {
      // ignorar
    }
  }
}
