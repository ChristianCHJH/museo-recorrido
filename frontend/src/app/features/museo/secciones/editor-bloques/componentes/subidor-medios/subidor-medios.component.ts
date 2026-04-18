import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BibliotecaMediaServicio, ElementoMedia } from '@features/museo/servicios/biblioteca-media.servicio';

@Component({
  selector: 'spa-subidor-medios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './subidor-medios.component.html'
})
export class SubidorMediosComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() subido = new EventEmitter<ElementoMedia>();
  @Output() errorSubida = new EventEmitter<void>();
  @Output() cerrado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly servicioMedia = inject(BibliotecaMediaServicio);

  readonly subiendo = signal(false);
  readonly archivoSeleccionado = signal<File | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    nombre: [''],
    descripcion: ['']
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.reiniciar();
    }
  }

  alSeleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.archivoSeleccionado.set(archivo);
  }

  subir(): void {
    const archivo = this.archivoSeleccionado();
    if (!archivo || this.subiendo()) return;

    const { nombre, descripcion } = this.formulario.getRawValue();
    this.subiendo.set(true);

    this.servicioMedia.subir(archivo, { nombre: nombre || undefined, descripcion: descripcion || undefined })
      .subscribe({
        next: (elemento) => {
          this.subiendo.set(false);
          this.subido.emit(elemento);
          this.cerrar();
        },
        error: () => {
          this.subiendo.set(false);
          this.errorSubida.emit();
        }
      });
  }

  cerrar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cerrado.emit();
  }

  private reiniciar(): void {
    this.archivoSeleccionado.set(null);
    this.formulario.reset();
  }

  get nombreArchivo(): string {
    return this.archivoSeleccionado()?.name ?? '';
  }
}
