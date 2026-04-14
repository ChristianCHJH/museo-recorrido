import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { rutas } from './app.routes';
import { CoreModule } from '@core/core.module';
import { interceptorAutenticacion } from '@core/interceptors/autenticacion.interceptor';
import { interceptorRespuestaApi } from '@core/interceptors/respuesta-api.interceptor';

export const configuracionApp: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(rutas),
    importProvidersFrom(CoreModule),
    provideHttpClient(withInterceptors([interceptorRespuestaApi, interceptorAutenticacion])),
    provideAnimations()
  ]
};
