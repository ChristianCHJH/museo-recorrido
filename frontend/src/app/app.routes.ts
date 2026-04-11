import { Routes } from '@angular/router';
import { guardiaAutenticacion } from '@core/guards/autenticacion.guardia';
import { guardiaVisita } from '@core/guards/visita.guardia';

export const rutas: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/autenticacion/inicio-sesion/inicio-sesion.component').then((m) => m.InicioSesionComponent)
  },
  {
    path: 'dashboard',
    canActivate: [guardiaAutenticacion],
    loadComponent: () =>
      import('@features/panel/panel.component').then((m) => m.PanelComponent)
  },
  {
    path: 'dashboard/:vista',
    canActivate: [guardiaAutenticacion],
    loadComponent: () =>
      import('@features/panel/panel.component').then((m) => m.PanelComponent)
  },
  {
    path: 'r/:codigoQr',
    loadComponent: () =>
      import('@features/visitante/entrada-qr/entrada-qr.component').then((m) => m.EntradaQrComponent)
  },
  {
    path: 'visita/:seccionId',
    canActivate: [guardiaVisita],
    loadComponent: () =>
      import('@features/visitante/seccion-visitante/seccion-visitante.component').then((m) => m.SeccionVisitanteComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
