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
import { ConfigSabiasQue } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-sabias-que-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule
  ],
  templateUrl: './sabias-que-editor.component.html'
})
export class SabiasQueEditorComponent implements OnInit, OnChanges {
  @Input() config: ConfigSabiasQue = { texto: { es: '' } };
  @Output() configChange = new EventEmitter<ConfigSabiasQue>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly formulario = this.fb.nonNullable.group({
    textoEs: [''],
    etiquetaEs: ['']
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
      textoEs: this.config?.texto?.es ?? '',
      etiquetaEs: this.config?.etiqueta?.es ?? ''
    }, { emitEvent: false });
  }

  private emitirCambio(): void {
    const v = this.formulario.getRawValue();
    const nueva: ConfigSabiasQue = {
      texto: { es: v.textoEs }
    };
    if (v.etiquetaEs.trim()) {
      nueva.etiqueta = { es: v.etiquetaEs };
    }
    this.configChange.emit(nueva);
  }
}
