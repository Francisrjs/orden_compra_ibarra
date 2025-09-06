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

@Component({
  selector: 'app-proveedores-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputBoxComponent],
  templateUrl: './proveedores-form.component.html',
  styleUrls: ['./proveedores-form.component.css'],
})
export class ProveedoresFormComponent implements OnInit {
  @Input() onSaveSuccess?: () => void;
  @Input() proveedorId?: number;
  @Input() proveedor?: Proveedor;
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
      id: [this.proveedorId ?? null],
      nombre: ['', Validators.required],
      cuit: [
        null,
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(12),
        ],
      ],
      domicilio: ['', Validators.required],
      contacto: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
        ],
      ],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proveedorId'] && this.proveedoresForm) {
      // this.loadProveedorData();
    }
  }
  onSubmit() {}
}
