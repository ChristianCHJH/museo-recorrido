import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ElementoListaUsuario } from '@core/services/usuarios.servicio';
import {
  PermisoAsignableUsuario,
  SeccionPermisoUsuario,
  UsuarioPermiso,
  UsuariosPermisosServicio,
  VincularPermisosUsuarioPayload
} from '@core/services/usuarios-permisos.servicio';
import {
  UsuariosRolesServicio,
  UsuarioRolMapeado,
  VincularRolUsuarioPayload
} from '@core/services/usuarios-roles.servicio';
import { AutenticacionServicio } from '@features/autenticacion/autenticacion.servicio';
import { ModuloCompartido } from '@shared/shared.module';

type PestanaAcceso = 'permisos' | 'roles';

interface RolDisponible {
  etiqueta: string;
  valor: number;
}

@Component({
  selector: 'spa-user-access',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ToastModule, ModuloCompartido],
  providers: [MessageService],
  templateUrl: './usuario-acceso.component.html',
  styleUrl: './usuario-acceso.component.css'
})
export class UsuarioAccesoComponent implements OnChanges {
  private readonly servicioUsuariosPermisos = inject(UsuariosPermisosServicio);
  private readonly servicioUsuariosRoles = inject(UsuariosRolesServicio);
  private readonly servicioAutenticacion = inject(AutenticacionServicio);
  private readonly servicioMensajes = inject(MessageService);
  private readonly destruirRef = inject(DestroyRef);

  @Input() usuario: ElementoListaUsuario | null = null;
  @Output() volver = new EventEmitter<void>();

  readonly pestanaActiva = signal<PestanaAcceso>('permisos');

  readonly permisosDirectos = signal<UsuarioPermiso[]>([]);
  readonly permisosCargando = signal(false);
  readonly permisosError = signal<string | null>(null);
  readonly permisosQuitando = signal<Set<string | number>>(new Set());

  readonly seccionesPermisos = signal<SeccionPermisoUsuario[]>([]);
  readonly seccionesPermisosCargando = signal(false);
  readonly seccionesPermisosError = signal<string | null>(null);
  readonly permisosPendientes = signal<Set<string | number>>(new Set());
  readonly permisosGuardando = signal(false);
  readonly hayPermisosPendientes = computed(() => this.permisosPendientes().size > 0);

  readonly rolesAsignados = signal<UsuarioRolMapeado[]>([]);
  readonly rolesCargando = signal(false);
  readonly rolesError = signal<string | null>(null);
  readonly rolesQuitando = signal<Set<string | number>>(new Set());

  readonly rolesDisponibles = signal<RolDisponible[]>([]);
  readonly rolesDisponiblesCargando = signal(false);

  rolSeleccionado: number | null = null;
  asignandoRol = signal(false);

  establecerPestana(pestana: PestanaAcceso) {
    this.pestanaActiva.set(pestana);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario']) {
      const usuario = this.usuario;
      if (usuario?.id) {
        this.cargarPermisosUsuario(usuario.id);
        this.cargarSeccionesPermisosUsuario(usuario.id);
        this.cargarRolesUsuario(usuario.id);
        this.cargarRolesDisponibles(usuario.id);
      } else {
        this.permisosDirectos.set([]);
        this.permisosError.set(null);
        this.seccionesPermisos.set([]);
        this.seccionesPermisosError.set(null);
        this.permisosPendientes.set(new Set());
        this.rolesAsignados.set([]);
        this.rolesError.set(null);
        this.rolesDisponibles.set([]);
      }
    }
  }

  private cargarRolesDisponibles(usuarioId: string | number) {
    this.rolesDisponiblesCargando.set(true);

    this.servicioUsuariosRoles
      .obtenerRolesNoAsignados(usuarioId)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (roles) => {
          this.rolesDisponibles.set(
            roles.map((rol) => ({ etiqueta: rol.rol, valor: rol.id }))
          );
          this.rolesDisponiblesCargando.set(false);
        },
        error: () => {
          this.rolesDisponibles.set([]);
          this.rolesDisponiblesCargando.set(false);
        }
      });
  }

  private cargarRolesUsuario(usuarioId: string | number) {
    this.rolesCargando.set(true);
    this.rolesError.set(null);

    this.servicioUsuariosRoles
      .obtenerRolesPorUsuario(usuarioId)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (roles) => {
          this.rolesAsignados.set(roles);
          this.rolesCargando.set(false);
        },
        error: () => {
          this.rolesError.set('No pudimos cargar los roles del usuario.');
          this.rolesCargando.set(false);
        }
      });
  }

  private cargarPermisosUsuario(usuarioId: string | number) {
    this.permisosCargando.set(true);
    this.permisosError.set(null);

    this.servicioUsuariosPermisos
      .obtenerPermisosPorUsuario(usuarioId)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (permisos) => {
          this.permisosDirectos.set(permisos);
          this.permisosCargando.set(false);
        },
        error: () => {
          this.permisosError.set('No pudimos cargar los permisos del usuario.');
          this.permisosCargando.set(false);
        }
      });
  }

  private cargarSeccionesPermisosUsuario(usuarioId: string | number) {
    this.seccionesPermisosCargando.set(true);
    this.seccionesPermisosError.set(null);
    this.permisosPendientes.set(new Set());

    this.servicioUsuariosPermisos
      .obtenerSeccionesPermisosPorUsuario(usuarioId)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (secciones) => {
          this.seccionesPermisos.set(secciones);
          this.seccionesPermisosCargando.set(false);
        },
        error: () => {
          this.seccionesPermisosError.set('No pudimos cargar los permisos disponibles.');
          this.seccionesPermisosCargando.set(false);
        }
      });
  }

  guardarCambios() {
    if (this.pestanaActiva() !== 'permisos') {
      return;
    }
    this.guardarPermisos();
  }

  guardarPermisos() {
    const usuarioId = this.usuario?.id;
    if (!usuarioId || this.permisosGuardando()) {
      return;
    }

    const pendientes = Array.from(this.permisosPendientes());
    if (!pendientes.length) {
      return;
    }

    this.permisosGuardando.set(true);
    this.seccionesPermisosError.set(null);

    const payload: VincularPermisosUsuarioPayload = {
      usuarioId: Number(usuarioId),
      permisosIds: pendientes.map((id) => Number(id)),
      usuarioCreacion: this.servicioAutenticacion.obtenerIdUsuarioAutenticado()
    };

    this.servicioUsuariosPermisos
      .vincularPermisosUsuario(payload)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.permisosGuardando.set(false);
          this.permisosPendientes.set(new Set());
          this.cargarPermisosUsuario(usuarioId);
          this.cargarSeccionesPermisosUsuario(usuarioId);
        },
        error: () => {
          this.permisosGuardando.set(false);
          this.seccionesPermisosError.set(
            'No pudimos guardar los permisos seleccionados. Intentalo otra vez.'
          );
        }
      });
  }

  alternarPermisoPendiente(permiso: PermisoAsignableUsuario, seleccionado: boolean) {
    if (!permiso || permiso.asignado || this.permisosGuardando()) {
      return;
    }
    const actuales = new Set(this.permisosPendientes());
    if (seleccionado) {
      actuales.add(permiso.id);
    } else {
      actuales.delete(permiso.id);
    }
    this.permisosPendientes.set(actuales);
  }

  permisoSeleccionado(permiso: PermisoAsignableUsuario) {
    return permiso.asignado || this.permisosPendientes().has(permiso.id);
  }

  quitarPermiso(permiso: UsuarioPermiso) {
    if (!permiso?.id) {
      return;
    }
    this.actualizarQuitando(permiso.id, true);
    this.servicioUsuariosPermisos
      .eliminarPermisoUsuario(permiso.id)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.permisosDirectos.set(
            this.permisosDirectos().filter((item) => item.id !== permiso.id)
          );
          this.actualizarQuitando(permiso.id, false);
          this.cargarSeccionesPermisosUsuario(this.usuario!.id);
        },
        error: () => {
          this.permisosError.set('No pudimos quitar el permiso.');
          this.actualizarQuitando(permiso.id, false);
        }
      });
  }

  private actualizarQuitando(id: string | number, quitando: boolean) {
    const actuales = new Set(this.permisosQuitando());
    if (quitando) {
      actuales.add(id);
    } else {
      actuales.delete(id);
    }
    this.permisosQuitando.set(actuales);
  }

  asignarRol() {
    const usuarioId = this.usuario?.id;
    const rolId = this.rolSeleccionado;
    if (!usuarioId || !rolId || this.asignandoRol()) {
      return;
    }

    this.asignandoRol.set(true);

    const payload: VincularRolUsuarioPayload = {
      usuarioId: Number(usuarioId),
      rolId,
      usuarioCreacion: this.servicioAutenticacion.obtenerIdUsuarioAutenticado()
    };

    this.servicioUsuariosRoles
      .vincularRolUsuario(payload)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.asignandoRol.set(false);
          this.rolSeleccionado = null;
          this.cargarRolesUsuario(usuarioId);
          this.cargarRolesDisponibles(usuarioId);
          this.servicioMensajes.add({
            severity: 'success',
            summary: 'Rol asignado',
            detail: 'El rol fue asignado correctamente.',
            life: 3000
          });
        },
        error: () => {
          this.asignandoRol.set(false);
          this.servicioMensajes.add({
            severity: 'error',
            summary: 'Error al asignar',
            detail: 'No pudimos asignar el rol. Intentalo otra vez.'
          });
        }
      });
  }

  quitarRol(rol: UsuarioRolMapeado) {
    const usuarioId = this.usuario?.id;
    if (!rol?.id || !usuarioId) {
      return;
    }
    this.actualizarQuitandoRol(rol.id, true);
    this.servicioUsuariosRoles
      .eliminarRolUsuario(rol.id)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.rolesAsignados.set(
            this.rolesAsignados().filter((item) => item.id !== rol.id)
          );
          this.actualizarQuitandoRol(rol.id, false);
          this.cargarRolesDisponibles(usuarioId);
          this.servicioMensajes.add({
            severity: 'success',
            summary: 'Rol eliminado',
            detail: `El rol "${rol.nombre}" fue eliminado del usuario.`,
            life: 3000
          });
        },
        error: () => {
          this.actualizarQuitandoRol(rol.id, false);
          this.servicioMensajes.add({
            severity: 'error',
            summary: 'Error al eliminar',
            detail: 'No pudimos quitar el rol. Intentalo otra vez.'
          });
        }
      });
  }

  private actualizarQuitandoRol(id: string | number, quitando: boolean) {
    const actuales = new Set(this.rolesQuitando());
    if (quitando) {
      actuales.add(id);
    } else {
      actuales.delete(id);
    }
    this.rolesQuitando.set(actuales);
  }
}
