import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  WritableSignal,
} from '@angular/core';
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
import {
  PedidoItem,
  Producto,
  UnidadMedida,
} from 'src/app/core/models/database.type';
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
  providers: [],
})
export class ProductoPedidoFormComponent implements OnInit, OnChanges {
  @Input() onSaveSuccess?: () => void;
  @Input() idProduct?: number = 0;
  @Input() cantidad?: number = 1;
  @Input() idMedida?: UnidadMedida | null = null;
  @Input() razonPedido?: string = '';
  @Input() idPedidoItem?: number | undefined;
  @Input() onNavigateToCreateProduct: () => void = () => {};
  @Input() formResult?: (result: {
    severity?: string;
    success: boolean;
    message: string;
  }) => void;

  @Input() modeUser?: boolean = true;
  @Input() pedidoItemOC?: PedidoItem;
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  //Servicios
  private _productoService = inject(ProductoService);
  private _unididadMedidas = inject(UnidadesMedidaService);
  private _pedidoService = inject(PedidoService);
  constructor() {}
  productoPedidoForm!: FormGroup;
  pedidoId!: number;
  productoData: SelectorData[] = [];
  filteredMedidasData: any[] = [];
  //señales
  productos: WritableSignal<Producto[]> = this._productoService.productos;
  medidasData: WritableSignal<UnidadMedida[]> =
    this._unididadMedidas.Unidadmedidas;

  selectedMedida: any[] | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    // Si nos viene un pedidoItem desde el padre, parcheamos el form (si ya existe)
    if (changes['pedidoItemOC'] && this.pedidoItemOC) {
      // guardamos id del item para editar luego
      this.idPedidoItem = this.pedidoItemOC.id;
      if (this.productoPedidoForm) {
        this.productoPedidoForm.patchValue({
          producto_id:
            this.pedidoItemOC.producto?.id ??
            (this.pedidoItemOC as any).producto_id ??
            null,
          cantidad: this.pedidoItemOC.cantidad ?? null,
          // Puede venir objeto unidad_medida o id; en onSubmit ya normalizas
          unidad_medida_id:
            this.pedidoItemOC.unidad_medida ??
            (this.pedidoItemOC as any).unidad_medida_id ??
            null,
          razon_pedido: (this.pedidoItemOC as any).razon_pedido ?? '',
          unidad_medidad_id_aceptada: this.pedidoItemOC.unidad_medida ?? null,
          cantidad_aceptada: this.pedidoItemOC.cantidad ?? null,
        });
      }
    }

    // Mantén también la lógica existente para idProduct si la usas
    if (changes['idProduct'] && this.idProduct && this.productoPedidoForm) {
      if (this.modeUser) {
        this.productoPedidoForm.patchValue({
          producto_id: this.idProduct,
          cantidad: this.cantidad,
          unidad_medida_id: this.idMedida,
          razon_pedido: this.razonPedido,
        });
      } else {
        // si no es modeUser, puedes continuar con tu lógica específica
        this.productoPedidoForm.patchValue({
          producto_id:
            this.pedidoItemOC?.producto_id ??
            this.productoPedidoForm.value.producto_id,
        });
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.productoPedidoForm = this.fb.group({
      producto_id: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      unidad_medida_id: [null, Validators.required],
      razon_pedido: [null, [Validators.maxLength(10)]],
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.pedidoId = +id;

      if (this.idProduct && this.cantidad && this.idMedida) {
        this.productoPedidoForm.patchValue({
          producto_id: this.idProduct,
          cantidad_aceptada: this.cantidad,
          unidad_medida_id_aceptada: this.idMedida,
        });
      }
    });

    await this.loadMedidas();
    await this.loadProductos();
    this.patchFormValues();
  }

  async loadMedidas() {
    if (this.medidasData().length === 0) {
      const data = await this._unididadMedidas.getAllMedidas();
      // FIX: Asegurarse de no pasar null a la señal
      this.medidasData.set(data || []);
    }
  }

  async loadProductos() {
    if (this.productos().length === 0) {
      const data = await this._productoService.getAllProductos();
      // FIX: Asegurarse de no pasar null a la señal
      this.productos.set(data || []);
    }

    // FIX: Acceder al valor de la señal con ()
    const productosActuales = this.productos();
    if (productosActuales) {
      this.productoData = productosActuales.map((producto) => ({
        id: producto.id,
        name: producto.nombre,
        descripcion: producto.descripcion,
      }));
    }
  }
  private patchFormValues(): void {
    // Se ejecuta desde ngOnInit: parchea con lo que ya está llegando por inputs
    if (this.pedidoItemOC) {
      this.idPedidoItem = this.pedidoItemOC.id;
      this.productoPedidoForm.patchValue({
        producto_id:
          this.pedidoItemOC.producto?.id ??
          (this.pedidoItemOC as any).producto_id ??
          null,
        cantidad_aceptada: this.pedidoItemOC.cantidad ?? null,
        unidad_medida_id_aceptada:
          this.pedidoItemOC.unidad_medida.id ??
          (this.pedidoItemOC as any).unidad_medida_id ??
          null,
        razon_pedido: (this.pedidoItemOC as any).razon_pedido ?? '',
      });
      return;
    }

    // Si no hay pedidoItemOC, parchea con entradas individuales (idProduct, cantidad, etc.)
    this.productoPedidoForm.patchValue({
      producto_id: this.idProduct ?? null,
      cantidad: this.cantidad ?? null,
      unidad_medida_id: this.idMedida ?? null,
      razon_pedido: this.razonPedido ?? '',
    });
  }
  filterData(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    // FIX: Acceder al valor de la señal con () y tipar el parámetro 'medida'
    this.filteredMedidasData = this.medidasData().filter(
      (medida: UnidadMedida) => {
        return medida.nombre.toLowerCase().includes(query);
      }
    );
  }
  async onSubmit() {
    this.productoPedidoForm.markAllAsTouched();

    if (this.productoPedidoForm.invalid || !this.pedidoId) {
      const msg = !this.pedidoId
        ? 'No se pudo identificar el pedido.'
        : 'Revisá los campos obligatorios ❌';

      this.formResult?.({ success: false, message: msg });
      return;
    }

    const formValues = { ...this.productoPedidoForm.value };

    if (
      formValues.unidad_medida_id &&
      typeof formValues.unidad_medida_id === 'object'
    ) {
      formValues.unidad_medida_id = formValues.unidad_medida_id.id;
    }

    this.formResult?.({
      severity: 'info',
      success: true,
      message: 'Guardando, por favor espera...',
    });
    let result;
    if (this.idProduct) {
      // Modo edición
      if (typeof this.idPedidoItem === 'number') {
        result = await this._pedidoService.updatePedidoProducto(
          this.idPedidoItem,
          formValues
        );
      } else {
        this.formResult?.({
          success: false,
          message: 'No se pudo identificar el item a editar.',
        });
        return;
      }
    } else {
      // Modo creación
      result = await this._pedidoService.addPedidoProducto(
        this.pedidoId,
        formValues
      );
    }

    const { data, error } = result;
    const payload: Partial<PedidoItem> = formValues;

    if (error) {
      this.formResult?.({
        success: false,
        message: 'No se pudo guardar el producto. ' + error.message,
      });
    } else {
      this.formResult?.({
        success: true,
        message: 'El producto fue agregado correctamente ✅',
      });

      if (this.onSaveSuccess) {
        this.onSaveSuccess(); // Esto cierra el sidebar
      }
      this.productoPedidoForm.reset();
    }
  }
}
