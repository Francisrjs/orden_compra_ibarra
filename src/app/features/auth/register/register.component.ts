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
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ButtonWithIconComponent,
    InputBoxComponent,
    ReactiveFormsModule,
    ButtonFancyComponent,
    ButtonElegantComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private _authService= inject(AuthService);
  @Input() formResult?: (result: {
    severity?: string;
    success: boolean;
    message: string;
  }) => void;
  
  registerForm!: FormGroup;
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  async onSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      const msg = 'Revisá los campos obligatorios ❌';

      this.formResult?.({ success: false, message: msg });
      return;
    }
    const formValue= this.registerForm.value;
    try {
      const authResponse= await this._authService.signIn(
        formValue.email ?? '',
        formValue.password ?? ''
      )
      if (authResponse) {
        this.formResult?.({ success: true, message: 'Login exitoso ✅' });
      } else {
        this.formResult?.({ success: false, message: 'Credenciales inválidas ❌' });
      }
    } catch (error) {
      this.formResult?.({ success: false, message: `error al iniciar seción '${error}'` });
    }

  }
}
