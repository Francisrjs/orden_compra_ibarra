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
  @Input() options: { text: string; value: any; iconClass?: string }[] = []; // <-- AHORA PUEDE SER ANY

  value: string | boolean | number | null = null;
  disabled = false;

  private onChange = (value: any) => {}; // <-- PERMITE CUALQUIER TIPO
  private onTouched = () => {};

  selectOption(value: any) {
    // <-- AHORA PUEDE SER BOOLEAN, STRING, ETC.
    if (this.disabled) return;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: any): void {
    // <-- TAMBIÉN CUALQUIER TIPO
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    // <-- CUALQUIER TIPO
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
