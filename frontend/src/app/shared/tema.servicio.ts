import { Injectable } from '@angular/core';

interface ColoresTema {
  primario: string;
  secundario: string;
  terciario: string;
}

const COLORES_POR_DEFECTO: ColoresTema = {
  primario: '#5D4037',
  secundario: '#C5B358',
  terciario: '#827717',
};

@Injectable({ providedIn: 'root' })
export class TemaServicio {
  aplicarTema(colores: Partial<ColoresTema>): void {
    const tema = { ...COLORES_POR_DEFECTO, ...colores };
    const raiz = document.documentElement;
    raiz.style.setProperty('--color-primario', tema.primario);
    raiz.style.setProperty('--color-secundario', tema.secundario);
    raiz.style.setProperty('--color-terciario', tema.terciario);
  }

  cargarTemaDesdeConfiguracion(configuracion: { colorPrimario?: string; colorSecundario?: string; colorTerciario?: string }): void {
    this.aplicarTema({
      primario: configuracion.colorPrimario,
      secundario: configuracion.colorSecundario,
      terciario: configuracion.colorTerciario,
    });
  }

  restaurarPorDefecto(): void {
    this.aplicarTema(COLORES_POR_DEFECTO);
  }
}
