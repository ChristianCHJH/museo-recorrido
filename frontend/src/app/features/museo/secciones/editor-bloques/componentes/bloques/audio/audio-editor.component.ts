import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ConfigAudio } from '../../../modelos/bloque.modelo';
import { SelectorMediaComponent } from '../../selector-media/selector-media.component';
import { ElementoMedia } from '@features/museo/servicios/biblioteca-media.servicio';

@Component({
  selector: 'spa-audio-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    SelectorMediaComponent
  ],
  templateUrl: './audio-editor.component.html'
})
export class AudioEditorComponent implements OnInit, OnChanges {
  @Input() config: ConfigAudio = { url: '' };
  @Output() configChange = new EventEmitter<ConfigAudio>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectorVisible = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    url: [''],
    etiquetaEs: [''],
    duracion: [null as number | null]
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
      url: this.config?.url ?? '',
      etiquetaEs: this.config?.etiqueta?.es ?? '',
      duracion: this.config?.duracion ?? null
    }, { emitEvent: false });
  }

  alSeleccionarDesdeLibreria(elemento: ElementoMedia): void {
    this.formulario.patchValue({ url: elemento.url }, { emitEvent: false });
    this.emitirCambio();
  }

  private emitirCambio(): void {
    const v = this.formulario.getRawValue();
    const nueva: ConfigAudio = {
      url: v.url
    };
    if (v.etiquetaEs.trim()) {
      nueva.etiqueta = { es: v.etiquetaEs };
    }
    if (v.duracion !== null && v.duracion !== undefined) {
      nueva.duracion = v.duracion;
    }
    this.configChange.emit(nueva);
  }
}
