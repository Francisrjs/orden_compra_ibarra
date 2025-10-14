import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-elegant.component.html',
  styleUrls: ['./button-elegant.component.css'],
})
export class ButtonElegantComponent {
  /**
   * @Input(): Define el texto que se mostrará en el botón.
   * Por defecto será 'Click me'.
   */
  @Input() text: string = 'Click me';

  /**
   * @Input(): Clase de icono de Bootstrap para mostrar en el botón.
   * Ejemplo: 'bi-plus', 'bi-trash', 'bi-pencil', etc.
   */
  @Input() icon?: string;

  /**
   * @Input(): Si se provee una URL, el componente se renderizará como una etiqueta <a>.
   * Es opcional (?).
   */
  @Input() href?: string;

  /**
   * @Input(): Permite definir el tipo de botón para aplicar diferentes estilos.
   * Por ahora solo 'primary', pero podrías añadir 'secondary', 'danger', etc.
   */
  @Input() styleType: 'primary' | 'success' | 'danger' | 'warning' |'info' = 'primary';

  /**
   * @Output(): Emite un evento cuando se hace clic en el botón (solo si no es un link).
   */
  @Output() buttonClick = new EventEmitter<void>();

  @Input() disabled?: boolean = false;
  /**
   * Maneja el evento click del botón y emite el Output.
   */
  onClick(): void {
    // Solo emitimos el evento si no es un link
    if (!this.href) {
      this.buttonClick.emit();
    }
  }
}
