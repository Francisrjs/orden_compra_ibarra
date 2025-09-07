import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProveedorService } from '../services/proveedor.service';
import { Proveedor } from 'src/app/core/models/database.type';
import { InputBoxComponent } from 'src/app/shared/input/input-box/input-box.component';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';

@Component({
  selector: 'app-proveedores-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputBoxComponent,
    ButtonElegantComponent,
  ],
  templateUrl: './proveedores-form.component.html',
  styleUrls: ['./proveedores-form.component.css'],
})
export class ProveedoresFormComponent implements OnInit {
  @Input() onSaveSuccess?: () => void;

  @Input() proveedor?: Proveedor;
  @Input() editMode: boolean = false;
  @Input() formResult?: (result: {
    severity?: string;
    success: boolean;
    message: string;
  }) => void;
  private _proveedoresService = inject(ProveedorService);
  proveedores = this._proveedoresService.proveedores;
  proveedoresForm!: FormGroup;
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.proveedoresForm = this.fb.group({
      id: [this.proveedor?.id ?? null],
      nombre: ['', Validators.required],
      cuit: [
        null,
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(12),
        ],
      ],
      domicilio: ['', Validators.maxLength(50)],
      contacto: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      telefono: ['', [Validators.minLength(10), Validators.maxLength(15)]],
    });
    if (this.proveedor) {
      this.patchFormValues();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proveedorId'] && this.proveedoresForm && this.proveedor) {
      this.patchFormValues();
    }
  }
  private patchFormValues(): void {
    if (this.proveedor) {
      this.proveedoresForm.patchValue({
        id: this.proveedor.id,
        nombre: this.proveedor.nombre,
        cuit: this.proveedor.cuit,
        domicilio: this.proveedor.domicilio,
        contacto: this.proveedor.contacto,
        email: this.proveedor.email,
        telefono: this.proveedor.telefono,
      });
    }
  }
  async onSubmit() {
    this.proveedoresForm.markAllAsTouched();
    console.log('Estado del formulario:', this.proveedoresForm.status);
    Object.keys(this.proveedoresForm.controls).forEach((key) => {
      const control = this.proveedoresForm.get(key);
      if (control && control.invalid) {
        console.log(`Control '${key}' errores:`, control.errors);
      }
    });
    if (this.proveedoresForm.invalid) {
      this.formResult?.({
        severity: 'error',
        success: false,
        message: 'Por favor, revise los errores en el formulario.',
      });
      return;
    }
    const formValue = { ...this.proveedoresForm.value };
    if (formValue.id == null) {
      delete formValue.id;
    }
    if (this.editMode && this.proveedor?.id) {
      // Crear nuevo proveedor
      this.formResult?.({
        severity: 'info',
        success: true,
        message: 'Editando, por favor espera...',
      });
      try {
        const data = await this._proveedoresService.updateProveedor(formValue);
        if (!data) {
          this.formResult?.({
            severity: 'error',
            success: false,
            message: 'Error al editar el proveedor. Intente nuevamente.',
          });
          return;
        }
        this.formResult?.({
          severity: 'success',
          success: true,
          message: 'Proveedor editado exitosamente.',
        });
        this.proveedoresForm.reset();
        this.onSaveSuccess?.();
      } catch (error) {
        this.formResult?.({
          severity: 'error',
          success: false,
          message: 'Error al editar el proveedor. Intente nuevamente.',
        });
      }
    } else {
      // Crear nuevo proveedor
      this.formResult?.({
        severity: 'info',
        success: true,
        message: 'Guardando, por favor espera...',
      });
      try {
        const data = await this._proveedoresService.createProveedor(formValue);
        if (!data) {
          this.formResult?.({
            severity: 'error',
            success: false,
            message: 'Error al crear el proveedor. Intente nuevamente.',
          });
          return;
        }
        this.formResult?.({
          severity: 'success',
          success: true,
          message: 'Proveedor creado exitosamente.',
        });
        this.proveedoresForm.reset();
        this.onSaveSuccess?.();
      } catch (error) {
        this.formResult?.({
          severity: 'error',
          success: false,
          message: 'Error al crear el proveedor. Intente nuevamente.',
        });
      }
    }
  }
}
