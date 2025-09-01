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
import { Toast, ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
    ToastModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers:[MessageService]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private _authService= inject(AuthService);
  private messageService = inject(MessageService);
  @Input() formResult?: (result: {
    severity?: string;
    success: boolean;
    message: string;
  }) => void;
  messageResult?: { severity?: string; success: boolean; message: string };
  
  loginForm!: FormGroup;
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  async onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      const msg = 'Revisá los campos obligatorios ❌';
      this.setMessage({ success: false, message: msg });
      return;
    }
    const formValue= this.loginForm.value;
    try {
      const authResponse= await this._authService.signIn(
        formValue.email ?? '',
        formValue.password ?? ''
      )
      if (!authResponse) {
        this.setMessage({ success: true, message: 'Login exitoso ✅' });
        console.log("Login exitoso")
      } else {
        this.setMessage({ success: false, message: 'Credenciales inválidas ❌' });
        console.log("Error al iniciar sesión");
      }
    } catch (error) {
      this.setMessage({ success: false, message: `error al iniciar seción '${error}'` });
      console.log("Error al iniciar sesión");
    }

  }
    setMessage(result: { severity?: string; success: boolean; message: string }) {
    this.messageResult = result;
    this.formResult?.(result);
     this.messageService.add({
      severity: result.success ? 'success' : 'error',
      summary: result.success ? 'Éxito' : 'Error',
      detail: result.message,
      life: 20000 // 20 segundos
    });
    setTimeout(() => {
      this.messageResult = undefined;
    }, 20000); // 20 segundos
  }
}
