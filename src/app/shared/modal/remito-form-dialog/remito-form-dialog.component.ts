import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Remito } from 'src/app/core/models/database.type';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { notFutureDateValidator } from '../../funtions/validator';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { InputDateComponent } from '../../input/input-date/input-date.component';

@Component({
  selector: 'app-remito-form-dialog',
  standalone: true,
  imports: [CommonModule,DialogModule,ReactiveFormsModule,InputNumberModule,ButtonModule,InputDateComponent],
  templateUrl: './remito-form-dialog.component.html',
  styleUrls: ['./remito-form-dialog.component.css']
})

export class RemitoFormDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() remitoData?: Remito; // Para edición
  @Input() isDisabled: boolean = false;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Remito>();

  remitoForm!: FormGroup;
  maxDate: string = new Date().toISOString().split('T')[0];
  
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
    
    if (this.remitoData) {
      this.loadRemitoData(this.remitoData);
    }
  }

  initForm(): void {
    this.remitoForm = this.fb.group({
      puntoVentaRemito: [null, [Validators.required, Validators.min(1)]],
      numeroRemito: [null, [Validators.required, Validators.min(1)]],
      fecha: [null, [Validators.required, notFutureDateValidator]],
    });
  }

  loadRemitoData(remito: Remito): void {
    const [puntoVenta, numero] = remito.numero_remito.split('-');
    
    this.remitoForm.patchValue({
      puntoVentaRemito: parseInt(puntoVenta),
      numeroRemito: parseInt(numero),
      fecha: remito.fecha,
    });
  }

  agregarRemito(): void {
    if (this.remitoForm.valid) {
      const puntoVenta = this.remitoForm.get('puntoVentaRemito')?.value;
      const numero = this.remitoForm.get('numeroRemito')?.value;
      const fechaValue = this.remitoForm.get('fecha')?.value;

      const numeroRemito = `${String(puntoVenta).padStart(4, '0')}-${String(numero).padStart(8, '0')}`;

      // Guardar fecha como string YYYY-MM-DD para evitar desfase de zona horaria
      let fecha: string | undefined;
      if (fechaValue) {
        if (typeof fechaValue === 'string') {
          fecha = fechaValue;
        } else {
          const d = new Date(fechaValue);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          fecha = `${year}-${month}-${day}`;
        }
      }

      // Crear remito temporal (fecha como string)
      const nuevoRemito: Remito = {
        id: this.remitoData?.id || (`temp-${Date.now()}` as any),
        numero_remito: numeroRemito,
        fecha: fecha as any,
        factura_id: this.remitoData?.factura_id || ({} as any),
      };

      this.onSave.emit(nuevoRemito);
      this.cancelAddRemito();
    }
  }

  cancelAddRemito(): void {
    this.remitoForm.reset();
    this.visibleChange.emit(false);
  }
}
