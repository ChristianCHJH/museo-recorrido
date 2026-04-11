import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpBaseService } from '@core/services/http-base.service';

export interface ConfiguracionMuseo {
  id: string;
  nombre: string;
  descripcion: string | null;
  logoUrl: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  tipografiaUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionMuseoServicio {
  private readonly http = inject(HttpBaseService);

  obtener(): Observable<ConfiguracionMuseo> {
    return this.http.get<ConfiguracionMuseo>('api/museo/configuracion');
  }

  actualizar(dto: Partial<ConfiguracionMuseo>): Observable<ConfiguracionMuseo> {
    return this.http.patch<ConfiguracionMuseo>('api/museo/configuracion', dto);
  }
}
