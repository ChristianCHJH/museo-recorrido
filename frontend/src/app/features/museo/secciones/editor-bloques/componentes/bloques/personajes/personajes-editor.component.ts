import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ConfigPersonajes, ConfigPersonajeItem } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-personajes-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule
  ],
  templateUrl: './personajes-editor.component.html'
})
export class PersonajesEditorComponent implements OnInit, OnChanges {
  @Input() config: ConfigPersonajes = { personajes: [] };
  @Output() configChange = new EventEmitter<ConfigPersonajes>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly formulario = this.fb.nonNullable.group({
    tituloEs: [''],
    personajes: this.fb.array<FormGroup>([])
  });

  get personajesArray(): FormArray {
    return this.formulario.get('personajes') as FormArray;
  }

  ngOnInit(): void {
    this.sincronizarDesdeConfig();

    this.formulario.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitirCambio());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.sincronizarDesdeConfig();
    }
  }

  private crearFilaPersonaje(p?: ConfigPersonajeItem): FormGroup {
    return this.fb.nonNullable.group({
      nombre: [p?.nombre ?? ''],
      rolEs: [p?.rol?.es ?? ''],
      descripcionEs: [p?.descripcion?.es ?? ''],
      imagenUrl: [p?.imagenUrl ?? '']
    });
  }

  private sincronizarDesdeConfig(): void {
    this.formulario.get('tituloEs')!.setValue(
      this.config?.titulo?.es ?? '',
      { emitEvent: false }
    );

    const array = this.personajesArray;
    // Rebuild the array without triggering intermediate emissions
    while (array.length > 0) {
      array.removeAt(0, { emitEvent: false });
    }
    (this.config?.personajes ?? []).forEach(p => {
      array.push(this.crearFilaPersonaje(p), { emitEvent: false });
    });
  }

  agregarPersonaje(): void {
    this.personajesArray.push(this.crearFilaPersonaje());
  }

  eliminarPersonaje(index: number): void {
    this.personajesArray.removeAt(index);
  }

  private emitirCambio(): void {
    const v = this.formulario.getRawValue();
    const nueva: ConfigPersonajes = {
      personajes: v.personajes.map((p: any) => {
        const item: ConfigPersonajeItem = { nombre: p.nombre };
        if (p.rolEs?.trim()) item.rol = { es: p.rolEs };
        if (p.descripcionEs?.trim()) item.descripcion = { es: p.descripcionEs };
        if (p.imagenUrl?.trim()) item.imagenUrl = p.imagenUrl;
        return item;
      })
    };
    if (v.tituloEs.trim()) {
      nueva.titulo = { es: v.tituloEs };
    }
    this.configChange.emit(nueva);
  }
}
