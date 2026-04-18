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
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ConfigGaleria, ConfigGaleriaItem } from '../../../modelos/bloque.modelo';
import { SelectorMediaComponent } from '../../selector-media/selector-media.component';
import { ElementoMedia } from '@features/museo/servicios/biblioteca-media.servicio';

@Component({
  selector: 'spa-galeria-editor',
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
  templateUrl: './galeria-editor.component.html'
})
export class GaleriaEditorComponent implements OnInit, OnChanges {
  @Input() config: ConfigGaleria = { disposicion: 'grid', imagenes: [] };
  @Output() configChange = new EventEmitter<ConfigGaleria>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectorVisible = signal(false);

  readonly opcionesDisposicion = [
    { label: 'Cuadrícula', value: 'grid' },
    { label: 'Carrusel', value: 'carrusel' }
  ];

  readonly formulario = this.fb.nonNullable.group({
    tituloEs: [''],
    disposicion: ['grid'],
    imagenes: this.fb.array<FormGroup>([])
  });

  get imagenesArray(): FormArray {
    return this.formulario.get('imagenes') as FormArray;
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

  private crearFilaImagen(img?: ConfigGaleriaItem): FormGroup {
    return this.fb.nonNullable.group({
      url: [img?.url ?? ''],
      tituloEs: [img?.titulo?.es ?? ''],
      captionEs: [img?.caption?.es ?? ''],
      elementoMultimediaId: [img?.elementoMultimediaId ?? '']
    });
  }

  private sincronizarDesdeConfig(): void {
    this.formulario.get('tituloEs')!.setValue(
      this.config?.titulo?.es ?? '',
      { emitEvent: false }
    );
    this.formulario.get('disposicion')!.setValue(
      this.config?.disposicion ?? 'grid',
      { emitEvent: false }
    );

    const array = this.imagenesArray;
    while (array.length > 0) {
      array.removeAt(0, { emitEvent: false });
    }
    (this.config?.imagenes ?? []).forEach(img => {
      array.push(this.crearFilaImagen(img), { emitEvent: false });
    });
  }

  agregarImagen(): void {
    this.imagenesArray.push(this.crearFilaImagen());
  }

  alSeleccionarDesdeLibreria(elementos: ElementoMedia[]): void {
    elementos.forEach(el => {
      this.imagenesArray.push(this.crearFilaImagen({
        url: el.url,
        elementoMultimediaId: el.id
      }));
    });
  }

  eliminarImagen(index: number): void {
    this.imagenesArray.removeAt(index);
  }

  private emitirCambio(): void {
    const v = this.formulario.getRawValue();
    const nueva: ConfigGaleria = {
      disposicion: v.disposicion as 'grid' | 'carrusel',
      imagenes: v.imagenes.map((img: any) => {
        const item: ConfigGaleriaItem = { url: img.url };
        if (img.tituloEs?.trim()) item.titulo = { es: img.tituloEs };
        if (img.captionEs?.trim()) item.caption = { es: img.captionEs };
        if (img.elementoMultimediaId?.trim()) item.elementoMultimediaId = img.elementoMultimediaId;
        return item;
      })
    };
    if (v.tituloEs.trim()) {
      nueva.titulo = { es: v.tituloEs };
    }
    this.configChange.emit(nueva);
  }
}
