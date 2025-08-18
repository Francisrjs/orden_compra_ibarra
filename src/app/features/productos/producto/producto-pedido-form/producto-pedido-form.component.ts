import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputBoxComponent } from 'src/app/shared/input/input-box/input-box.component';
import { InputOptionsComponent } from 'src/app/shared/input/input-options/input-group.component';
import { InputDateComponent } from 'src/app/shared/input/input-date/input-date.component';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
import { PedidoService } from 'src/app/features/pedidos/services/pedido.service';
import {
  InputModalSelectorComponent,
  SelectorData,
} from 'src/app/shared/input/input-modal-selector/input-modal-selector.component';
import { ProductoService } from '../../service/producto-service.service';
import { CategoriaService } from '../../service/categoria-service.service';
@Component({
  selector: 'app-producto-pedido-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Para usar [formGroup], formControlName, etc.
    InputBoxComponent,
    InputModalSelectorComponent,
    ButtonElegantComponent,
  ],
  templateUrl: './producto-pedido-form.component.html',
  styleUrls: ['./producto-pedido-form.component.css'],
})
export class ProductoPedidoFormComponent {}
