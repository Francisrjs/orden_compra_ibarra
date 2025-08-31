import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';
import { InputBoxComponent } from 'src/app/shared/input/input-box/input-box.component';
import { ButtonFancyComponent } from 'src/app/shared/buttons/button-fancy/button-fancy.component';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonWithIconComponent,
    InputBoxComponent,
    ReactiveFormsModule,
    ButtonFancyComponent,
    ButtonElegantComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  @Input() formResult?: (result: {
    severity?: string;
    success: boolean;
    message: string;
  }) => void;
  private fb = inject(FormBuilder);
  loginForm!: FormGroup;
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      passwrod: ['', Validators.required],
    });
  }
  async onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      const msg = 'Revisá los campos obligatorios ❌';

      this.formResult?.({ success: false, message: msg });
      return;
    }
    const formValue = {
      ...this.loginForm.value,
      area: this.loginForm.value.area.name,
    };
  }
}
