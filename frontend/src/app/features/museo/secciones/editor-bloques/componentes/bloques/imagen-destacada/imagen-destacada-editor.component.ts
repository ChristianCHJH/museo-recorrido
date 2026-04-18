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
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ConfigImagenDestacada } from '../../../modelos/bloque.modelo';
import { SelectorMediaComponent } from '../../selector-media/selector-media.component';
import { ElementoMedia } from '@features/museo/servicios/biblioteca-media.servicio';

@Component({
  selector: 'spa-imagen-destacada-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ButtonModule,
    SelectorMediaComponent
  ],
  templateUrl: './imagen-destacada-editor.component.html'
})
export class ImagenDestacadaEditorComponent implements OnInit, OnChanges {
  @Input() config: ConfigImagenDestacada = { url: '', altura: 'md' };
  @Output() configChange = new EventEmitter<ConfigImagenDestacada>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectorVisible = signal(false);

  readonly opcionesAltura = [
    { label: 'Pequeña', value: 'sm' },
    { label: 'Mediana', value: 'md' },
    { label: 'Grande', value: 'lg' }
  ];

  readonly formulario = this.fb.nonNullable.group({
    url: [''],
    tituloEs: [''],
    captionEs: [''],
    altura: ['md']
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
      tituloEs: this.config?.titulo?.es ?? '',
      captionEs: this.config?.caption?.es ?? '',
      altura: this.config?.altura ?? 'md'
    }, { emitEvent: false });
  }

  alSeleccionarDesdeLibreria(elemento: ElementoMedia): void {
    this.formulario.patchValue({ url: elemento.url }, { emitEvent: false });
    const v = this.formulario.getRawValue();
    const nueva: ConfigImagenDestacada = {
      url: elemento.url,
      altura: v.altura as 'sm' | 'md' | 'lg',
      elementoMultimediaId: elemento.id
    };
    if (v.tituloEs.trim()) nueva.titulo = { es: v.tituloEs };
    if (v.captionEs.trim()) nueva.caption = { es: v.captionEs };
    this.configChange.emit(nueva);
  }

  private emitirCambio(): void {
    const v = this.formulario.getRawValue();
    const nueva: ConfigImagenDestacada = {
      url: v.url,
      altura: v.altura as 'sm' | 'md' | 'lg'
    };
    if (v.tituloEs.trim()) {
      nueva.titulo = { es: v.tituloEs };
    }
    if (v.captionEs.trim()) {
      nueva.caption = { es: v.captionEs };
    }
    this.configChange.emit(nueva);
  }
}
