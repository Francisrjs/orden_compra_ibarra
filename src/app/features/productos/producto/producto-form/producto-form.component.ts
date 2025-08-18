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
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule,
    CommonModule, // Para usar directivas como *ngIf
    ReactiveFormsModule, // Para usar [formGroup], formControlName, etc.
    InputBoxComponent,
    InputModalSelectorComponent,
    ButtonElegantComponent,
  ],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css'],
})
export class ProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private _productoService = inject(ProductoService);
  private _categoriaService = inject(CategoriaService);
  categoriaData: SelectorData[] = [];
  productoForm!: FormGroup;

  async ngOnInit(): Promise<void> {
    this.loadCategorias();
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      categoria_id: [null, [Validators.required]],
    });
  }

  async loadCategorias() {
    const data = await this._categoriaService.getAllCategorias();
    console.log(data);
    if (data) {
      // Transformamos el array 'data' para que coincida con la interfaz 'SelectorData'
      this.categoriaData = data.map((categoria) => {
        return {
          id: categoria.id, // Asumimos que la propiedad del ID se llama 'id'
          name: categoria.nombre, // ¡Aquí está la clave! Mapeamos 'nombre' a 'name'
        };
      });
    }
    console.log(this.categoriaData);
  }

  async onSubmit() {
    this.productoForm.markAllAsTouched();
    console.log('click onSubmit disparado');
    if (this.productoForm.invalid) return;
    const formValue = {
      ...this.productoForm.value,
    };
    const { data, error } = await this._productoService.addPedido(formValue);
    if (error) {
      alert('Error al guardar el pedido: ' + error.message);
    } else {
      alert('¡Pedido guardado con éxito!');
      this.productoForm.reset();
    }
  }
}
