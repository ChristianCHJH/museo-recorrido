import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';

import { EntradaComponent } from './components/entrada/entrada.component';
import { BotonComponent } from './components/boton/boton.component';
import { PermisoDirectiva } from './directives/permiso.directiva';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    RippleModule,
    EntradaComponent,
    BotonComponent,
    PermisoDirectiva,
  ],
  exports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    RippleModule,
    EntradaComponent,
    BotonComponent,
    PermisoDirectiva,
  ]
})
export class ModuloCompartido {}
