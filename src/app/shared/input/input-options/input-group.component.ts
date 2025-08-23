import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ButtonWithIconComponent } from '../../buttons/button-with-icon/button-with-icon.component';
// ⬇️ ¡IMPORTANTE! Importa NG_VALUE_ACCESSOR
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-options',
  templateUrl: './input-group.component.html',
  styleUrls: ['./input-group.component.css'],
  standalone: true,
  imports: [CommonModule, ButtonWithIconComponent],
  // ⬇️ ¡AQUÍ ESTÁ LA MAGIA! Agrega este array de providers
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputOptionsComponent),
      multi: true,
    },
  ],
})
export class InputOptionsComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: { text: string; value: string; iconClass?: string }[] = [];

  value: string | null = null;
  disabled = false; // Añadido para manejar el estado disabled

  // El resto de tu código se mantiene igual
  private onChange = (value: string | null) => {};
  private onTouched = () => {};

  selectOption(value: string) {
    if (this.disabled) return; // No hacer nada si está deshabilitado
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Manejar el estado deshabilitado
    this.disabled = isDisabled;
  }
}
