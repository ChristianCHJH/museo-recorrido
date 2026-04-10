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
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Rol } from '@core/services/roles.servicio';
import {
  RolPermiso,
  SeccionPermisoRol,
  PermisoAsignableRol,
  RolesPermisosServicio,
  VincularPermisosRolPayload
} from '@core/services/roles-permisos.servicio';
import { AutenticacionServicio } from '@features/autenticacion/autenticacion.servicio';
import { ModuloCompartido } from '@shared/shared.module';

@Component({
  selector: 'spa-rol-access',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, ToastModule, ModuloCompartido],
  providers: [MessageService],
  templateUrl: './rol-acceso.component.html',
  styleUrl: './rol-acceso.component.css'
})
export class RolAccesoComponent implements OnChanges {
  private readonly servicioRolesPermisos = inject(RolesPermisosServicio);
  private readonly servicioAutenticacion = inject(AutenticacionServicio);
  private readonly servicioMensajes = inject(MessageService);
  private readonly destruirRef = inject(DestroyRef);

  @Input() rol: Rol | null = null;
  @Output() volver = new EventEmitter<void>();

  readonly permisosDirectos = signal<RolPermiso[]>([]);
  readonly permisosCargando = signal(false);
  readonly permisosError = signal<string | null>(null);
  readonly permisosQuitando = signal<Set<string | number>>(new Set());

  readonly seccionesPermisos = signal<SeccionPermisoRol[]>([]);
  readonly seccionesPermisosCargando = signal(false);
  readonly seccionesPermisosError = signal<string | null>(null);
  readonly permisosPendientes = signal<Set<string | number>>(new Set());
  readonly permisosGuardando = signal(false);
  readonly hayPermisosPendientes = computed(() => this.permisosPendientes().size > 0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rol']) {
      const rol = this.rol;
      if (rol?.id) {
        this.cargarPermisosRol(rol.id);
        this.cargarSeccionesPermisosRol(rol.id);
      } else {
        this.permisosDirectos.set([]);
        this.permisosError.set(null);
        this.seccionesPermisos.set([]);
        this.seccionesPermisosError.set(null);
        this.permisosPendientes.set(new Set());
      }
    }
  }

  private cargarPermisosRol(rolId: string | number) {
    this.permisosCargando.set(true);
    this.permisosError.set(null);

    this.servicioRolesPermisos
      .obtenerPermisosPorRol(rolId)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: (permisos) => {
          this.permisosDirectos.set(permisos);
          this.permisosCargando.set(false);
        },
        error: () => {
          this.permisosError.set('No pudimos cargar los permisos del rol.');
          this.permisosCargando.set(false);
        }
      });
  }

  private cargarSeccionesPermisosRol(rolId: string | number) {
    this.seccionesPermisosCargando.set(true);
    this.seccionesPermisosError.set(null);
    this.permisosPendientes.set(new Set());

    this.servicioRolesPermisos
      .obtenerSeccionesPermisosPorRol(rolId)
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

  guardarPermisos() {
    const rolId = this.rol?.id;
    if (!rolId || this.permisosGuardando()) {
      return;
    }

    const pendientes = Array.from(this.permisosPendientes());
    if (!pendientes.length) {
      return;
    }

    this.permisosGuardando.set(true);
    this.seccionesPermisosError.set(null);

    const payload: VincularPermisosRolPayload = {
      rolId: Number(rolId),
      permisoIds: pendientes.map((id) => Number(id)),
      usuarioCreacion: this.servicioAutenticacion.obtenerIdUsuarioAutenticado()
    };

    this.servicioRolesPermisos
      .vincularPermisosRol(payload)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.permisosGuardando.set(false);
          this.permisosPendientes.set(new Set());
          this.cargarPermisosRol(rolId);
          this.cargarSeccionesPermisosRol(rolId);
          this.servicioMensajes.add({
            severity: 'success',
            summary: 'Permisos asignados',
            detail: 'Los permisos fueron asignados correctamente.',
            life: 3000
          });
        },
        error: () => {
          this.permisosGuardando.set(false);
          this.servicioMensajes.add({
            severity: 'error',
            summary: 'Error al asignar',
            detail: 'No pudimos guardar los permisos. Intentalo otra vez.'
          });
        }
      });
  }

  alternarPermisoPendiente(permiso: PermisoAsignableRol, seleccionado: boolean) {
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

  permisoSeleccionado(permiso: PermisoAsignableRol) {
    return permiso.asignado || this.permisosPendientes().has(permiso.id);
  }

  quitarPermiso(permiso: RolPermiso) {
    if (!permiso?.id) {
      return;
    }
    this.actualizarQuitando(permiso.id, true);
    this.servicioRolesPermisos
      .eliminarPermisoRol(permiso.id)
      .pipe(takeUntilDestroyed(this.destruirRef))
      .subscribe({
        next: () => {
          this.permisosDirectos.set(
            this.permisosDirectos().filter((item) => item.id !== permiso.id)
          );
          this.actualizarQuitando(permiso.id, false);
          this.cargarSeccionesPermisosRol(this.rol!.id);
          this.servicioMensajes.add({
            severity: 'success',
            summary: 'Permiso eliminado',
            detail: `El permiso "${permiso.nombre}" fue eliminado del rol.`,
            life: 3000
          });
        },
        error: () => {
          this.actualizarQuitando(permiso.id, false);
          this.servicioMensajes.add({
            severity: 'error',
            summary: 'Error al eliminar',
            detail: 'No pudimos quitar el permiso. Intentalo otra vez.'
          });
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
}
