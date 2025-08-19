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
import {
  AutoCompleteModule,
  AutoCompleteOnSelectEvent,
} from 'primeng/autocomplete';
import { UnidadesMedidaService } from '../../service/unidades-medida-service';
import { PedidoItem, UnidadMedida } from 'src/app/core/models/database.type';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
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
    InputNumberModule,
    ToastModule,
  ],
  templateUrl: './producto-pedido-form.component.html',
  styleUrls: ['./producto-pedido-form.component.css'],
  providers: [MessageService],
})
export class ProductoPedidoFormComponent implements OnInit {
  private _messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  //Servicios
  private _productoService = inject(ProductoService);
  private _unididadMedidas = inject(UnidadesMedidaService);
  private _pedidoService = inject(PedidoService);

  productoPedidoForm!: FormGroup;
  pedidoId!: number;

  productoData: SelectorData[] = [];
  medidasData: UnidadMedida[] = [];
  filteredMedidasData: any[] = [];

  selectedMedida: any[] | undefined;

  async ngOnInit(): Promise<void> {
    // Obtenemos el ID del pedido desde los parámetros de la ruta
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id'); // Asume que tu ruta es 'pedidos/:id/agregar-producto'
      if (id) {
        this.pedidoId = +id; // El '+' convierte el string a número
      }
    });

    this.loadProductos();
    this.loadMedidas();

    this.productoPedidoForm = this.fb.group({
      // El 'pedido_id' ya no es un campo del formulario, lo tenemos de la ruta.

      producto_id: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      unidad_medida_id: [null, Validators.required],
      razon_pedido: ['', [Validators.maxLength(255)]], // Mapeado a 'razon_pedido' de la BBDD
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
          descripcion: producto.descripcion,
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
      return medida.nombre.toLowerCase().startsWith(query);
    });
  }
  async onSubmit() {
    this.productoPedidoForm.markAllAsTouched();

    if (this.productoPedidoForm.invalid || !this.pedidoId) {
      this._messageService.add({
        severity: 'error',
        summary: 'Formulario inválido',
        detail: !this.pedidoId
          ? 'No se pudo identificar el pedido.'
          : 'Revisá los campos obligatorios ❌',
      });
      return;
    }

    // --- ¡AQUÍ ESTÁ LA MAGIA! ---

    const formValues = {
      ...this.productoPedidoForm.value,
    };

    //Obtengo ID de unidad_medida_Id
    if (
      formValues.unidad_medida_id &&
      typeof formValues.unidad_medida_id === 'object'
    ) {
      formValues.unidad_medida_id = formValues.unidad_medida_id.id;
    }

    const payload: Partial<PedidoItem> = formValues;

    this._messageService.add({
      severity: 'info',
      summary: 'Guardando...',
      detail: 'Enviando producto al pedido.',
    });

    const { data, error } = await this._pedidoService.addPedidoProducto(
      this.pedidoId,
      payload
    );

    if (error) {
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el producto. ' + error.message,
      });
    } else {
      this._messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'El producto fue agregado correctamente ✅',
      });
      this.productoPedidoForm.reset();
    }
  }
}
