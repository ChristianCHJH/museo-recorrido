import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';

type SeccionBarraLateral = { tipo: 'seccion'; clave: string; etiqueta: string };
type ElementoNavBarraLateral = { clave: string; etiqueta: string; icono: string; seccion?: string };
type ElementoBarraLateral = SeccionBarraLateral | ElementoNavBarraLateral;

function esSeccion(elemento: ElementoBarraLateral): elemento is SeccionBarraLateral {
  return (elemento as SeccionBarraLateral).tipo === 'seccion';
}

@Component({
  selector: 'spa-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RippleModule, AvatarModule],
  templateUrl: './barra-lateral.component.html',
  styleUrl: './barra-lateral.component.css'
})
export class BarraLateralComponent implements OnInit, AfterViewInit {
  private readonly anchoExpandido = 264;
  private readonly anchoColapsado = 88;
  private readonly claveAlmacenamiento = 'spa.sidebar.activeKey';
  private tieneClaveActivaExterna = false;

  colapsado = signal(false);
  abiertoMovil = signal(false);
  menuCuentaAbierto = signal(false);
  busqueda = signal('');
  claveActiva = signal(this.leerClaveAlmacenada());
  estadosSecciones = signal<Record<string, boolean>>({
    security: true
  });
  esMovil = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

  readonly elementos: ElementoBarraLateral[] = [
    { clave: 'dashboard', etiqueta: 'Dashboard', icono: 'pi-th-large' },
    { tipo: 'seccion', clave: 'security', etiqueta: 'Seguridad' },
    { clave: 'roles', etiqueta: 'Roles', icono: 'pi-briefcase', seccion: 'security' },
    { clave: 'users', etiqueta: 'Usuarios', icono: 'pi-users', seccion: 'security' },
    { clave: 'permissions', etiqueta: 'Permisos', icono: 'pi-key', seccion: 'security' },
    { clave: 'sections', etiqueta: 'Secciones', icono: 'pi-list', seccion: 'security' }
  ];

  @Output() cambioAncho = new EventEmitter<number>();
  @Output() seleccionElemento = new EventEmitter<string>();
  @Input() set valorClaveActiva(valor: string | null) {
    if (valor) {
      this.claveActiva.set(valor);
      this.tieneClaveActivaExterna = true;
    }
  }

  elementosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) {
      return this.elementos;
    }

    const resultado: ElementoBarraLateral[] = [];
    let pendiente: SeccionBarraLateral | null = null;

    for (const elemento of this.elementos) {
      if (esSeccion(elemento)) {
        if (elemento.etiqueta.toLowerCase().includes(termino)) {
          resultado.push(elemento);
          pendiente = null;
        } else {
          pendiente = elemento;
        }
        continue;
      }

      if (elemento.etiqueta.toLowerCase().includes(termino)) {
        if (pendiente) {
          resultado.push(pendiente);
          pendiente = null;
        }
        resultado.push(elemento);
      }
    }

    return resultado;
  });

  ngOnInit(): void {
    this.forzarAperturaPorModo(this.esMovil);
    if (!this.tieneClaveActivaExterna) {
      const almacenada = this.leerClaveAlmacenada();
      if (almacenada) {
        this.claveActiva.set(almacenada);
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.emitirAncho());
  }

  abrirMovil() {
    this.abiertoMovil.set(true);
  }

  cerrarMovil() {
    this.abiertoMovil.set(false);
  }

  alternarColapsarEmitir() {
    this.colapsado.set(!this.colapsado());
    this.emitirAncho();
  }

  alternarMenuCuenta() {
    this.menuCuentaAbierto.set(!this.menuCuentaAbierto());
  }

  seleccionarElemento(elemento: ElementoNavBarraLateral) {
    this.claveActiva.set(elemento.clave);
    this.persistirClave(elemento.clave);
    this.seleccionElemento.emit(elemento.clave);
  }

  esSeccionElemento(elemento: ElementoBarraLateral): elemento is SeccionBarraLateral {
    return esSeccion(elemento);
  }

  alternarSeccion(seccion: SeccionBarraLateral) {
    const actual = this.estadosSecciones();
    const siguiente = {
      ...actual,
      [seccion.clave]: !this.seccionAbierta(seccion.clave)
    };

    this.estadosSecciones.set(siguiente);
  }

  seccionAbierta(claveSeccion: string) {
    const actual = this.estadosSecciones();
    return actual[claveSeccion] ?? true;
  }

  mostrarElemento(elemento: ElementoNavBarraLateral) {
    if (!elemento.seccion) {
      return true;
    }

    if (this.tieneFiltroActivo()) {
      return true;
    }

    return this.seccionAbierta(elemento.seccion);
  }

  tieneFiltroActivo() {
    return this.busqueda().trim().length > 0;
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape() {
    if (this.abiertoMovil()) {
      this.cerrarMovil();
    }
    this.menuCuentaAbierto.set(false);
  }

  @HostListener('window:resize')
  alRedimensionar() {
    const esMovilActual = window.innerWidth < 1024;
    if (esMovilActual !== this.esMovil) {
      this.esMovil = esMovilActual;
      this.forzarAperturaPorModo(esMovilActual);
      this.emitirAncho();
    }
  }

  private forzarAperturaPorModo(esMovil: boolean) {
    this.colapsado.set(false);
    this.abiertoMovil.set(!esMovil);
  }

  private emitirAncho() {
    const ancho = this.esMovil ? 0 : (this.colapsado() ? this.anchoColapsado : this.anchoExpandido);
    this.cambioAncho.emit(ancho);
  }

  private persistirClave(clave: string) {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(this.claveAlmacenamiento, clave);
    } catch {
      // ignorar
    }
  }

  private leerClaveAlmacenada(): string {
    if (typeof window === 'undefined') {
      return 'users';
    }
    try {
      return window.localStorage.getItem(this.claveAlmacenamiento) || 'users';
    } catch {
      return 'users';
    }
  }
}
