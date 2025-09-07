import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, Optional } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ValidatorFn,
  Validators,
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
  @Input() id: string = '';
  @Input() isTextarea: boolean = false;
  @Input() disabled = false;
  @Input() readOnly = false;
  @Input() value: any = '';
  @Input() icon: string = '';

  isDisabled = false;
  control: FormControl | null = null;

  // (No se necesita exponer formControlName; usaremos la directiva si está presente)

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
  }

  writeValue(obj: any): void {
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

  onInput(event: Event) {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    const v = target?.value ?? '';
    this.value = v;
    this.onChange(v);
  }

  onBlur() {
    this.onTouched();
  }
}
