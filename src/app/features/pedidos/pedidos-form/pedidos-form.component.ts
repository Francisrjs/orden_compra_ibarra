// src/app/features/pedidos/pedidos-form/pedidos-form.component.ts

import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
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
  ],
})
// ¡YA NO HAY @NgModule AQUÍ!
export class PedidosFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private _pedidoService = inject(PedidoService);

  pedidoForm!: FormGroup;

  ngOnInit(): void {
    this.pedidoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      urgente: [false, Validators.required],
      descripcion: [''],
      plazo_entrega: ['', [Validators.required, futureDateValidator]],
    });
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
}
