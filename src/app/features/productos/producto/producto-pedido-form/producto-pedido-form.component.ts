import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UnidadesMedidaService } from '../../service/unidades-medida-service';
import { UnidadMedida } from 'src/app/core/models/database.type';
import { InputNumberModule } from 'primeng/inputnumber';
interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-producto-pedido-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Para usar [formGroup], formControlName, etc.
    InputBoxComponent,
    InputModalSelectorComponent,
    ButtonElegantComponent,
    AutoCompleteModule,
    FormsModule,
    InputNumberModule
  ],
  templateUrl: './producto-pedido-form.component.html',
  styleUrls: ['./producto-pedido-form.component.css'],
})
export class ProductoPedidoFormComponent implements OnInit {
  private _productoService = inject(ProductoService);
  private _unididadMedidas = inject(UnidadesMedidaService);
  private fb = inject(FormBuilder);
  productoPedidoForm!: FormGroup;

  productoData: SelectorData[] = [];
  medidasData: UnidadMedida[] = [];
  filteredMedidasData: any[] = [];

  selectedMedida: any[] | undefined;

  async ngOnInit(): Promise<void> {
    this.loadProductos();
    this.loadMedidas();
    this.productoPedidoForm = this.fb.group({
      pedido_id: [''],
      producto_id: [''],
      unidad_medida_id: [''],
      descripcion: [''],
    });
  }

  async loadProductos() {
    const data = await this._productoService.getAllProductos();
    console.log(data);
    if (data) {
      // Transformamos el array 'data' para que coincida con la interfaz 'SelectorData'
      this.productoData = data.map((producto) => {
        return {
          id: producto.id, // Asumimos que la propiedad del ID se llama 'id'
          name: producto.nombre, // ¡Aquí está la clave! Mapeamos 'nombre' a 'name'
          descripcion: producto.descripcion
        };
      });
    }
    console.log(this.productoData);
  }
  async loadMedidas() {
    const data = await this._unididadMedidas.getAllMedidas();
    if (data) {
      this.medidasData = data;
    }
  }
  filterData(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredMedidasData = this.medidasData.filter((medida) => {
      // ¡CORREGIDO! Filtramos usando la propiedad 'nombre'.
      return medida.nombre.toLowerCase().startsWith(query);
    });
  }
  async onSubmit() {}
}
