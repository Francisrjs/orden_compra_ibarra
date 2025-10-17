import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
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
  providers: [MessageService],
})
export class ProductoPedidoFormComponent implements OnInit, OnChanges {
  @Input() onSaveSuccess?: () => void;
  @Input() idProduct?: number = 0;
  @Input() cantidad?: number = 1;
  @Input() idMedida?: UnidadMedida | null = null;
  @Input() razonPedido?: string = '';
  @Input() idPedidoItem?: number | undefined;
  @Input() OCform?: boolean = false;

  @Input() onNavigateToCreateProduct: () => void = () => {};
  @Input() formResult?: (result: {
    severity?: string;
    success: boolean;
    message: string;
  }) => void;

  @Input() link_Referencia?: string = '';

  @Input() modeUser?: boolean = true;
  @Input() pedidoItemOC?: PedidoItem;

  // Output para comunicar con el componente padre (orden-compra-form)
  @Output() itemCreatedForOC = new EventEmitter<{
    item: PedidoItem;
    precio: number;
  }>();

  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  //Servicios
  private _productoService = inject(ProductoService);
  private _unididadMedidas = inject(UnidadesMedidaService);
  private _pedidoService = inject(PedidoService);
  private _messageService = inject(MessageService);

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
    if (changes['pedidoItemOC'] && this.productoPedidoForm) {
      this.patchFormValues();
    }
  }

  async ngOnInit(): Promise<void> {
    // ✅ Configurar validaciones dinámicamente según el modo
    const formConfig: any = {
      producto_id: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      unidad_medida_id: [null, Validators.required],
      cantidad_aceptada: [null],
      unidad_medida_id_aceptada: [null],
    };

    // Campos opcionales que dependen del modo
    if (this.modeUser || this.OCform) {
      formConfig.razon_pedido = [null, [Validators.maxLength(30)]];
      formConfig.link_referencia = [null, [Validators.maxLength(300)]];
    }

    // Campo total solo para modo OC
    if (this.OCform) {
      formConfig.total = [null, [Validators.required, Validators.min(0.01)]];
    }

    // Solo agregar pedido_id como requerido si NO estamos en modo OC
    if (!this.OCform) {
      formConfig.pedido_id = [this.pedidoId ?? null, Validators.required];
    } else {
      formConfig.pedido_id = [null]; // Sin validación para modo OC
    }

    this.productoPedidoForm = this.fb.group(formConfig);
    if (!this.pedidoItemOC) {
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        if (id) this.pedidoId = +id;

        if (this.idProduct && this.cantidad && this.idMedida) {
          this.productoPedidoForm.patchValue({
            producto_id: this.idProduct,
            cantidad: this.cantidad,
            unidad_medida_id: this.idMedida,
          });
        }
      });
    }

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
    if (this.pedidoItemOC) {
      this.idPedidoItem = this.pedidoItemOC.id;
      this.pedidoId = this.pedidoItemOC.pedido_id;

      this.productoPedidoForm.patchValue({
        pedido_id: this.pedidoId,
        producto_id: this.pedidoItemOC.producto?.id ?? null,
        razon_pedido: (this.pedidoItemOC as any).razon_pedido ?? '',
        cantidad: this.pedidoItemOC.cantidad ?? null,
        unidad_medida_id: this.pedidoItemOC?.unidad_medida?.id ?? null,
        link_referencia: (this.pedidoItemOC as any).link_referencia ?? '',
      });
      return;
    }

    console.log(
      'Formulario después de patchValue:',
      this.productoPedidoForm.value
    );
    // Si no hay pedidoItemOC
    this.productoPedidoForm.patchValue({
      pedido_id: this.pedidoId ?? null, // 👈 también lo seteo acá
      producto_id: this.idProduct ?? null,
      cantidad: this.cantidad ?? null,
      unidad_medida_id: this.idMedida ?? null,
      razon_pedido: this.razonPedido ?? '',
      link_referencia: this.link_Referencia ?? '',
    });
    console.log(
      'Formulario después de patchValue:',
      this.productoPedidoForm.value
    );
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

  // ✅ Método para manejar la selección de unidad de medida
  onUnidadMedidaSelect(event: any) {
    console.log('Unidad de medida seleccionada:', event);
    // El evento ya actualiza el formControl automáticamente
    // Este método es principalmente para debug o lógica adicional si necesario
  }
  async onSubmit() {
    console.log(
      this.productoPedidoForm.value,
      this.productoPedidoForm.valid,
      this.productoPedidoForm.errors
    );
    this.productoPedidoForm.markAllAsTouched();

    // En modo normal (no OC), validar el formulario tradicional
    if (!this.OCform && this.productoPedidoForm.invalid) {
      const msg = !this.pedidoId
        ? 'No se pudo identificar el pedido.'
        : 'Revisá los campos obligatorios ❌';

      this.formResult?.({ success: false, message: msg });
      return;
    }

    // ✅ CASO ESPECIAL: Si estamos en modo OC, crear PedidoItem temporal y enviarlo al padre
    if (this.OCform) {
      this.handleOCFormSubmit();
      return;
    }

    const formValues: any = { ...this.productoPedidoForm.value };

    if (
      formValues.unidad_medida_id &&
      typeof formValues.unidad_medida_id === 'object'
    ) {
      formValues.unidad_medida_id = formValues.unidad_medida_id.id;
    }
    if (
      formValues.unidad_medida_id_aceptada &&
      typeof formValues.unidad_medida_id_aceptada === 'object'
    ) {
      formValues.unidad_medida_id_aceptada =
        formValues.unidad_medida_id_aceptada.id;
    }

    this.formResult?.({
      severity: 'info',
      success: true,
      message: 'Guardando, por favor espera...',
    });

    let result;
    // PRIORITARIO: si viene pedidoItemOC -> aceptar parcial
    if (this.pedidoItemOC) {
      if (typeof this.pedidoItemOC.id !== 'number') {
        this.formResult?.({
          success: false,
          message: 'No se pudo identificar el item a aceptar.',
        });
        return;
      }
      console.log('Aceptando parcialmente el pedido item (pedidoItemOC)');
      result = await this._pedidoService.aceptarParcialPedidoItem(
        this.pedidoItemOC.id,
        formValues.cantidad_aceptada,
        formValues.unidad_medida_id_aceptada
      );
    } else if (typeof this.idPedidoItem === 'number') {
      // edición de un item existente (update)
      result = await this._pedidoService.updatePedidoProducto(
        this.idPedidoItem,
        formValues
      );
    } else {
      // creación de nuevo item
      if (!this.pedidoId) {
        this.formResult?.({
          success: false,
          message: 'No se pudo identificar el pedido para crear el item.',
        });
        return;
      }
      result = await this._pedidoService.addPedidoProducto(
        this.pedidoId,
        formValues
      );
    }

    const { data, error } = result as {
      data: Partial<PedidoItem> | null;
      error: any;
    };

    if (error) {
      this.formResult?.({
        success: false,
        message:
          'No se pudo guardar el producto. ' +
          (error.message ?? JSON.stringify(error)),
      });
    } else {
      this.formResult?.({
        success: true,
        message:
          this.pedidoItemOC || typeof this.idPedidoItem === 'number'
            ? 'El producto fue actualizado correctamente ✅'
            : 'El producto fue agregado correctamente ✅',
      });

      if (this.onSaveSuccess) {
        this.onSaveSuccess();
      }
      this.productoPedidoForm.reset();
    }
  }

  // ✅ Método para manejar el submit cuando está en modo OC
  private handleOCFormSubmit() {
    let formValues = { ...this.productoPedidoForm.value };

    // ✅ PRIMERO: Procesar unidad de medida si es objeto (antes de validaciones)
    if (
      formValues.unidad_medida_id &&
      typeof formValues.unidad_medida_id === 'object'
    ) {
      formValues.unidad_medida_id = formValues.unidad_medida_id.id;
    }

    // Usar el total del formulario
    const totalValue = formValues.total;

    // ---- INICIO DE LA MODIFICACIÓN ----
    // 1. Obtenemos el ID del producto, sin importar si el valor del formulario
    //    es el objeto completo o solo el número del ID.
    const productoId =
      formValues.producto_id && typeof formValues.producto_id === 'object'
        ? (formValues.producto_id as Producto).id
        : formValues.producto_id;

    // 2. Con el ID asegurado, buscamos el objeto completo en la señal de productos.
    const productoSeleccionado = this.productos().find(
      (p) => p.id === productoId
    );
    // ---- FIN DE LA MODIFICACIÓN ----

    // 3. Validamos que tengamos el producto encontrado y los demás datos.
    if (
      !productoSeleccionado || // Usamos la variable que contiene el objeto completo
      !formValues.cantidad ||
      !formValues.unidad_medida_id ||
      !totalValue
    ) {
      this._messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail:
          'Complete todos los campos obligatorios (Producto, Cantidad, Unidad de Medida y Total)',
      });
      return;
    }

    // Validar que el total sea mayor a 0
    if (totalValue <= 0) {
      this._messageService.add({
        severity: 'warn',
        summary: 'Precio inválido',
        detail: 'El precio debe ser mayor a 0',
      });
      return;
    }

    // Buscamos la unidad de medida completa
    const unidadMedidaSeleccionada = this.medidasData().find(
      (um) => um.id === formValues.unidad_medida_id
    );

    // Si llegamos aquí, es porque tenemos el productoSeleccionado completo.
    // Crear un PedidoItem temporal para enviar al componente padre
    const pedidoItemTemporal: PedidoItem = {
      id: Date.now(), // ID temporal único
      pedido_id: 0, // No necesario para OC
      producto_id: productoSeleccionado.id, // Asignamos el ID
      productos: productoSeleccionado, // Y aquí asignamos el OBJETO COMPLETO
      cantidad: formValues.cantidad,
      unidad_medida_id: formValues.unidad_medida_id,
      unidad_medida: unidadMedidaSeleccionada,
      estado: 'Pendiente',
      razon_pedido: formValues.razon_pedido || '',
      link_referencia: formValues.link_referencia || '',
      cantidad_aceptada: undefined,
      unidad_medida_id_aceptada: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      producto: productoSeleccionado,
    } as PedidoItem;

    // Emitir el evento al componente padre con el item y el precio
    this.itemCreatedForOC.emit({
      item: pedidoItemTemporal,
      precio: totalValue,
    });

    // Mostrar mensaje de éxito
    this._messageService.add({
      severity: 'success',
      summary: 'Item agregado',
      detail: `${productoSeleccionado.nombre} agregado correctamente ✅`,
    });

    // Resetear el formulario
    this.productoPedidoForm.reset();
  }

  // ✅ Método para validar si el formulario es inválido según el modo
  isFormInvalid(): boolean {
    if (this.OCform) {
      // En modo OC, usar las validaciones del FormGroup que ya incluyen el campo total
      const formInvalid = this.productoPedidoForm.invalid;

      // Debug solo cuando hay errores
      if (formInvalid) {
        const formValues = this.productoPedidoForm.value;
        console.log('Validación OCform - Formulario inválido:', {
          formErrors: this.productoPedidoForm.errors,
          controlsInvalid: Object.keys(this.productoPedidoForm.controls)
            .filter((key) => this.productoPedidoForm.get(key)?.invalid)
            .map((key) => ({
              control: key,
              errors: this.productoPedidoForm.get(key)?.errors,
              value: this.productoPedidoForm.get(key)?.value,
            })),
          formValues,
        });
      }

      return formInvalid;
    } else {
      // Modo normal, solo validar formulario
      return this.productoPedidoForm.invalid;
    }
  }
}
