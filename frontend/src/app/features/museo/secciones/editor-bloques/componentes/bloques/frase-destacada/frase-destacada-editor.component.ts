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
import { ConfigFraseDestacada } from '../../../modelos/bloque.modelo';

@Component({
  selector: 'spa-frase-destacada-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule
  ],
  templateUrl: './frase-destacada-editor.component.html'
})
export class FraseDestacadaEditorComponent implements OnInit, OnChanges {
  @Input() config: ConfigFraseDestacada = { texto: { es: '' } };
  @Output() configChange = new EventEmitter<ConfigFraseDestacada>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly formulario = this.fb.nonNullable.group({
    textoEs: [''],
    autorEs: ['']
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
      autorEs: this.config?.autor?.es ?? ''
    }, { emitEvent: false });
  }

  private emitirCambio(): void {
    const v = this.formulario.getRawValue();
    const nueva: ConfigFraseDestacada = {
      texto: { es: v.textoEs }
    };
    if (v.autorEs.trim()) {
      nueva.autor = { es: v.autorEs };
    }
    this.configChange.emit(nueva);
  }
}
