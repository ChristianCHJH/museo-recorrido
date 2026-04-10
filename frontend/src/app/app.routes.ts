import { Routes } from '@angular/router';
import { guardiaAutenticacion } from '@core/guards/autenticacion.guardia';

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
    path: '**',
    redirectTo: ''
  }
];
