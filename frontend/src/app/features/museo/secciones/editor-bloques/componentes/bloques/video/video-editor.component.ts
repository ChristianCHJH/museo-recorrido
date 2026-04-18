import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ConfigVideo } from '../../../modelos/bloque.modelo';
import { SelectorMediaComponent } from '../../selector-media/selector-media.component';
import { ElementoMedia } from '@features/museo/servicios/biblioteca-media.servicio';

@Component({
  selector: 'spa-video-editor',
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
  templateUrl: './video-editor.component.html'
})
export class VideoEditorComponent implements OnInit, OnChanges {
  @Input() config: ConfigVideo = { origen: 'youtube', url: '' };
  @Output() configChange = new EventEmitter<ConfigVideo>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectorVisible = signal(false);
  readonly origenActual = signal<string>('youtube');

  readonly esLocal = computed(() => this.origenActual() === 'local');

  readonly opcionesOrigen = [
    { label: 'YouTube', value: 'youtube' },
    { label: 'Vimeo', value: 'vimeo' },
    { label: 'Archivo local', value: 'local' }
  ];

  readonly formulario = this.fb.nonNullable.group({
    origen: ['youtube'],
    url: [''],
    tituloEs: [''],
    captionEs: ['']
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
      origen: this.config?.origen ?? 'youtube',
      url: this.config?.url ?? '',
      tituloEs: this.config?.titulo?.es ?? '',
      captionEs: this.config?.caption?.es ?? ''
    }, { emitEvent: false });
    this.origenActual.set(this.config?.origen ?? 'youtube');
  }

  alSeleccionarDesdeLibreria(elemento: ElementoMedia): void {
    this.formulario.patchValue({ url: elemento.url }, { emitEvent: false });
    const v = this.formulario.getRawValue();
    const nueva: ConfigVideo = {
      origen: 'local',
      url: elemento.url,
      elementoMultimediaId: elemento.id
    };
    if (v.tituloEs.trim()) nueva.titulo = { es: v.tituloEs };
    if (v.captionEs.trim()) nueva.caption = { es: v.captionEs };
    this.configChange.emit(nueva);
  }

  alCambiarOrigen(valor: string): void {
    this.origenActual.set(valor);
  }

  private emitirCambio(): void {
    const v = this.formulario.getRawValue();
    this.origenActual.set(v.origen);
    const nueva: ConfigVideo = {
      origen: v.origen as 'youtube' | 'vimeo' | 'local',
      url: v.url
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
