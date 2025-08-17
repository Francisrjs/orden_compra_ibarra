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

  @Output() buttonClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.href) {
      this.buttonClick.emit();
    }
  }
}
