import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-box',
  templateUrl: './input-box.component.html',
  styleUrls: ['./input-box.component.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputBoxComponent),
      multi: true,
    },
  ],
})
export class InputBoxComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() id: string = '';
  @Input() isTextarea: boolean = false;

  value: any = '';
  isDisabled = false;

  // Callbacks que Angular inyecta
  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor ------------------------------------------------
  writeValue(obj: any): void {
    // Angular llama esto para inicializar/actualizar el valor desde el FormControl padre
    this.value = obj ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // Manejo de eventos desde la plantilla ---------------------------------
  // Recibimos el Event (no el value directo) y casteamos de forma segura.
  onInput(event: Event) {
    // event.target puede ser HTMLInputElement | HTMLTextAreaElement | EventTarget | null
    // casteamos a las interfaces DOM correctas para acceder a `value` sin que el template arroje errores
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    const v = target?.value ?? ''; // operador ?. evita error si target es null
    this.value = v;
    this.onChange(v); // notificamos al form
  }

  onBlur() {
    this.onTouched();
  }
}
