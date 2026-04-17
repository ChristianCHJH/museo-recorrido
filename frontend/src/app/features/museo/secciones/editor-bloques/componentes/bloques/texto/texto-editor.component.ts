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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ConfigTexto } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-texto-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule
  ],
  templateUrl: './texto-editor.component.html'
})
export class TextoEditorComponent implements OnInit, OnChanges {
  @Input() config: ConfigTexto = { contenido: { es: '' } };
  @Output() configChange = new EventEmitter<ConfigTexto>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly opcionesNivel = [
    { label: 'Titulo H2', value: 'h2' },
    { label: 'Titulo H3', value: 'h3' }
  ];

  readonly formulario = this.fb.nonNullable.group({
    tituloEs: [''],
    contenidoEs: [''],
    nivelTitulo: ['h2']
  });

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

  private sincronizarDesdeConfig(): void {
    this.formulario.setValue({
      tituloEs: this.config?.titulo?.es ?? '',
      contenidoEs: this.config?.contenido?.es ?? '',
      nivelTitulo: this.config?.nivelTitulo ?? 'h2'
    }, { emitEvent: false });
  }

  private emitirCambio(): void {
    const v = this.formulario.getRawValue();
    const nueva: ConfigTexto = {
      contenido: { es: v.contenidoEs }
    };
    if (v.tituloEs.trim()) {
      nueva.titulo = { es: v.tituloEs };
      nueva.nivelTitulo = v.nivelTitulo as 'h2' | 'h3';
    }
    this.configChange.emit(nueva);
  }
}
