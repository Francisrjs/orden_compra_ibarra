import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ValidatorFn,
  Validators,
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

  // Callbacks que Angular inyecta
  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    // Si quieres aplicar validadores aquí, solo hazlo si NO los pones en el FormGroup
    // Si usas formControlName, los validadores deben ir en el FormGroup, no aquí
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
