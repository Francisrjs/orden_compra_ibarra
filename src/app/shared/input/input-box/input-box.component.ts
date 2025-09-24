import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, Optional } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ControlContainer,
  // NgControl,
} from '@angular/forms';

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
export class InputBoxComponent implements ControlValueAccessor, OnInit {
  constructor(@Optional() private controlContainer?: ControlContainer) {}
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() min?: number; // para validación mínima
  @Input() id: string = '';
  @Input() isTextarea: boolean = false;
  @Input() disabled = false;
  @Input() readOnly = false;
  @Input() value: any = '';
  @Input() icon: string = '';

  isDisabled = false;
  control: FormControl | null = null;

  displayValue: string = '';

  // Callbacks que Angular inyecta
  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    // Intentar obtener el control desde el ControlContainer usando el id
    if (this.controlContainer && (this.controlContainer.control as any)?.get) {
      const parent = this.controlContainer.control;
      const name = this.id;
      if (parent && name) {
        this.control = parent.get(name) as FormControl;
      }
    }
    this.updateDisplayValue();
  }

  writeValue(obj: any): void {
    this.value = obj ?? '';
    this.updateDisplayValue();
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

  onInput(event: Event) {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    let v = target?.value ?? '';
    if (this.type === 'currency') {
      // Solo permitir dígitos positivos (no negativos, no signos, no letras)
      v = v.replace(/[^\d]/g, '');
      // Evitar ceros a la izquierda innecesarios
      v = v.replace(/^0+(?!$)/, '');
      let num = Number(v);
      if (!isNaN(num)) {
        // Validar mínimo si corresponde
        if (this.min !== undefined && num < this.min) {
          this.value = num;
          this.displayValue = this.formatCurrency(num);
          this.onChange(num);
          if (this.control) {
            this.control.setErrors({
              ...(this.control.errors || {}),
              min: true,
            });
          }
        } else {
          this.value = num;
          this.displayValue = this.formatCurrency(num);
          this.onChange(num);
          if (
            this.control &&
            this.control.errors &&
            this.control.errors['min']
          ) {
            const { min, ...rest } = this.control.errors;
            this.control.setErrors(Object.keys(rest).length ? rest : null);
          }
        }
      } else {
        this.value = '';
        this.displayValue = '';
        this.onChange('');
      }
    } else {
      this.value = v;
      this.displayValue = v;
      this.onChange(v);
    }
  }

  onBlur() {
    this.onTouched();
    if (this.type === 'currency') {
      this.updateDisplayValue();
    }
  }

  updateDisplayValue() {
    if (this.type === 'currency' && this.value !== '' && this.value != null) {
      this.displayValue = this.formatCurrency(this.value);
    } else {
      this.displayValue = this.value ?? '';
    }
  }

  formatCurrency(value: any): string {
    // Formatea como 100.000
    const num = Number(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('es-CL');
  }
}
