import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-button-with-icon',
  templateUrl: './button-with-icon.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./button-with-icon.component.css'],
})
export class ButtonWithIconComponent {
  @Input() text: string = 'Click me';
  @Input() href?: string;
  @Input() iconClass?: string;
  @Input() iconOnly: boolean = false;

  // NUEVO: Input para controlar si el botón está activo
  @Input() active: boolean = false;
  @Input() hoverIconColorClass: string = 'text-warning';
  @Output() buttonClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.href) {
      this.buttonClick.emit();
    }
  }

  isHovered: boolean = false;

  // Maneja el evento cuando el mouse entra en el botón
  onMouseEnter(): void {
    this.isHovered = true;
  }

  // Maneja el evento cuando el mouse sale del botón
  onMouseLeave(): void {
    this.isHovered = false;
  }
  get iconNgClass() {
    return {
      ['bi bi-' + this.iconClass]: true, // icono base
      'text-warning': this.isHovered, // amarillo cuando hover
      'text-white': !this.isHovered, // blanco por defecto
    };
  }
}
