import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonWithIconComponent } from '../../buttons/button-with-icon/button-with-icon.component';

@Component({
  selector: 'app-input-options',
  templateUrl: './input-group.component.html',
  styleUrls: ['./input-group.component.css'],
  standalone: true,
  imports: [CommonModule, ButtonWithIconComponent],
})
export class InputOptionsComponent {
  @Input() label: string = ''; // Texto de la pregunta, ej: "¿Es urgente?"
  @Input() options: { text: string; value: string; iconClass?: string }[] = [];
  @Input() selected?: string; // valor seleccionado

  @Output() selectedChange = new EventEmitter<string>(); // emite cuando cambia selección

  selectOption(value: string) {
    this.selected = value;
    this.selectedChange.emit(value);
  }
}
