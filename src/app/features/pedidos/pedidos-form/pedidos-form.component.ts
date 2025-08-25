// src/app/features/pedidos/pedidos-form/pedidos-form.component.ts

import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PedidoService } from '../services/pedido.service';
import { futureDateValidator } from 'src/app/shared/funtions/validator';
import { CommonModule } from '@angular/common';
import { InputBoxComponent } from 'src/app/shared/input/input-box/input-box.component';
import { InputDateComponent } from 'src/app/shared/input/input-date/input-date.component';
import { InputOptionsComponent } from 'src/app/shared/input/input-options/input-group.component';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CascadeSelect, CascadeSelectModule } from 'primeng/cascadeselect';
import { Areas } from 'src/app/core/models/database.type';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { getIconByArea } from 'src/app/shared/funtions/pedidosFuntions';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-pedidos-form',
  templateUrl: './pedidos-form.component.html',
  styleUrls: ['./pedidos-form.component.css'],
  standalone: true,
  imports: [
    CommonModule, // Para usar directivas como *ngIf
    ReactiveFormsModule, // Para usar [formGroup], formControlName, etc.
    InputBoxComponent,
    InputOptionsComponent,
    InputDateComponent,
    ButtonElegantComponent,
    ToastModule,
    DropdownModule,
  ],
  providers: [],
})
export class PedidosFormComponent implements OnInit {
  @Input() formResult: any;
  areasData: any[] = [];
  private fb = inject(FormBuilder);
  private _pedidoService = inject(PedidoService);
  pedidoForm!: FormGroup;
  value: string | undefined;
  ngOnInit(): void {
    this.pedidoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      urgente: [false, Validators.required],
      area: ['', Validators.required],
      descripcion: [''],
      plazo_entrega: ['', [Validators.required, futureDateValidator]],
    });

    this.areasData = [
      { name: 'ADMINISTRACION' },
      { name: 'LOGISTICA' },
      { name: 'OBRAS' },
      { name: 'PREDIO' },
      { name: 'SISTEMAS' },
      { name: 'TALLER' },
    ];
  }

  async onSubmit() {
    this.pedidoForm.markAllAsTouched();
    if (this.pedidoForm.invalid) {
      return;
    }
    const formValue = {
      ...this.pedidoForm.value,
      urgente:
        this.pedidoForm.value.urgente === 'true' ||
        this.pedidoForm.value.urgente === true,
      area: this.pedidoForm.value.area.name,
    };
    delete formValue.urgente;
    const { data, error } = await this._pedidoService.addPedido(formValue);
    if (error) {
      alert('Error al guardar el pedido: ' + error.message);
    } else {
      alert('¡Pedido guardado con éxito!');
      this.pedidoForm.reset();
    }
  }
  getIcon(area: Areas) {
    return getIconByArea(area);
  }
}
