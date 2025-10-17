import { Component, effect, inject, Input, OnInit, Type } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableNgItemPedidoComponent } from 'src/app/shared/tables/table-ng-item-pedido/table-ng-item-pedido.component';
import {
  OrdenCompraItem,
  PedidoItem,
  Presupuesto,
  Producto,
  Proveedor,
  UnidadMedida,
} from 'src/app/core/models/database.type';
import { PedidoService } from '../../pedidos/services/pedido.service';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import {
  getBadgeClassByEstadoPedido,
  getBadgeClassByPedidoItem,
} from 'src/app/shared/funtions/pedidosFuntions';
import { ButtonModule } from 'primeng/button';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { TableItemsPedidosCardComponent } from 'src/app/shared/tables/table-items-pedidos-card/table-items-pedidos-card.component';
import { OrdenCompraService } from '../services/orden-compra.service';
import { ProveedorService } from '../../proveedores/services/proveedor.service';
import {
  InputModalSelectorComponent,
  SelectorData,
} from 'src/app/shared/input/input-modal-selector/input-modal-selector.component';
import { PresupuestoFormComponent } from '../../presupuesto/presupuesto-form/presupuesto-form.component';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import { TableGenericNGComponent } from 'src/app/shared/tables/table-generic-ng/table-generic-ng.component';
import { ButtonFancyComponent } from 'src/app/shared/buttons/button-fancy/button-fancy.component';
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';
import { PresupuestoService } from '../../presupuesto/presupuesto.service';
import { TableGenericFilterComponent } from 'src/app/shared/tables/table-generic-filter/table-generic-filter.component';
import { InputBoxComponent } from 'src/app/shared/input/input-box/input-box.component';
import { PopUpNgComponent } from 'src/app/shared/modal/pop-up-ng/pop-up-ng.component';

export interface LocalPedidoItem extends PedidoItem {
  precio_asignado?: number;
}
@Component({
  selector: 'app-orden-compra-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputNumberModule,
    ToastModule,
    ButtonModule,
    ConfirmDialogModule,
    TableNgItemPedidoComponent,
    ButtonElegantComponent,
    InputBoxComponent,
    TableItemsPedidosCardComponent,
    InputModalSelectorComponent,
    ReactiveFormsModule,
    SidebarComponent,
    AccordionModule,
    TableGenericNGComponent,
    ButtonWithIconComponent,
    PopUpNgComponent,
  ],
  templateUrl: './orden-compra-form.component.html',
  styleUrls: ['./orden-compra-form.component.css'],
  providers: [
    PrimeNGConfig,
    MessageService,
    ConfirmationService,
    SidebarComponent,
    TableGenericNGComponent,
    CurrencyPipe,
  ],
})
export class OrdenCompraFormComponent implements OnInit {
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined; // Para los inputs del componente dinámico
  @Input() onSaveSuccess?: () => void;

  private _pedidoService = inject(PedidoService);
  private _messageService = inject(MessageService);
  private _ordenCompraService = inject(OrdenCompraService);
  private _proveedorService = inject(ProveedorService);
  public _presupuestoService = inject(PresupuestoService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  // Tipo de OC seleccionado desde el modal
  tipoOC: 'solicitud' | 'abierta' = 'solicitud';

  pedidoItems: LocalPedidoItem[] = [];
  private currencyPipe = inject(CurrencyPipe);
  presupuesto: Presupuesto[] | null = this._presupuestoService.presupuestos();
  proovedores = this._proveedorService.proveedores;
  proveedoresData: SelectorData[] = [];
  public itemsOC: OrdenCompraItem[] | null =
    this._ordenCompraService.ordenCompraItems();
  showPriceDialog = false;
  precioAsignado: number | null = null;
  private pendingItem: PedidoItem | null = null;
  public totalOC = 0;
  pedido = this._pedidoService.pedido;
  ordenCompraForm!: FormGroup;
  title_pop_up: string = 'title';
  description_pop_up: string = 'descripcion';
  show_pop_up: boolean = false;
  popup_type: 'default' | 'danger' | 'warning' = 'default';
  onAcceptPopUp: (() => void) | null = null;
  constructor() {
    const current = this.pedido();
    if (current?.pedido_items?.length) {
      // Inicializa con lo que ya viniera en el pedido (map para incluir precio_asignado si quisiera)
      this.pedidoItems = [...(current.pedido_items || [])] as LocalPedidoItem[];
    }
    effect(() => {
      this.itemsOC = this._ordenCompraService.ordenCompraItems() ?? [];
      this.totalOC = this._ordenCompraService.sumProductsOC();
    });
    effect(() => {
      const lista = this.proovedores();
      this.proveedoresData = lista.map((proveedor) => ({
        id: proveedor.id,
        name: proveedor.nombre,
      }));
    });
    effect(() => {
      this.presupuesto = this._presupuestoService.presupuestos() ?? [];
      console.log('Actualizado: ', this.presupuesto);
    });
  }
  onEnterPrecio() {
    if (this.isPrecioValid()) {
      this.confirmAddWithPrice();
    }
  }

  ngOnInit(): void {
    // Leer el tipo de OC desde los parámetros de la URL
    this.route.queryParams.subscribe((params) => {
      if (params['tipo']) {
        this.tipoOC = params['tipo'] === 'solicitud' ? 'solicitud' : 'abierta';
        console.log('Tipo de OC seleccionado:', this.tipoOC);
      }
    });

    this._presupuestoService.presupuestoAsignados.set([]);
    this._ordenCompraService.ordenCompraItems.set([]);

    if (this.proovedores().length === 0) {
      this._proveedorService.getAllProveedores();
    }

    this._presupuestoService.getAllPresupuestosSinAsignar().then(() => {
      this.presupuesto = this._presupuestoService.presupuestos();
      console.log('Presupuestos Cargados: ', this.presupuesto);
    });
    this.ordenCompraForm = this.fb.group({
      proveedor_id: [null, Validators.required],
      condicion_entrega: ['', Validators.required],
      condicion_pago: ['', Validators.required],
    });
  }

  handleItemAdd(item: PedidoItem) {
    // Guardamos el item pendiente y abrimos diálogo para el precio
    this.pendingItem = item;
    this.precioAsignado = null; // reset
    this.showPriceDialog = true;
  }

  isPrecioValid(): boolean {
    return typeof this.precioAsignado === 'number' && this.precioAsignado > 0;
  }

  cancelAdd() {
    this.pendingItem = null;
    this.precioAsignado = null;
    this.showPriceDialog = false;
  }

  // Getter para obtener el nombre del tipo de OC
  get tipoOCNombre(): string {
    return this.tipoOC === 'solicitud'
      ? 'Orden tipo Solicitud'
      : 'Orden tipo Abierta';
  }

  // Getter para obtener la descripción del tipo de OC
  get tipoOCDescripcion(): string {
    if (this.tipoOC === 'solicitud') {
      return 'Selecciona todos tus items aprobados sin presupuesto fijo';
    } else {
      return 'Crea los pedidos con un precio con presupuesto fijo';
    }
  }

  atrasarPresupuestoPopUp(item: Presupuesto) {
    console.log('click');
    this.title_pop_up = 'Atrasar';
    this.description_pop_up =
      'El presupuesto no va a aparecer en la tabla pero se va a almacenar, ¿Estas seguro?';
    this.popup_type = 'warning';
    this.onAcceptPopUp = () => {
      this.asignarAtrasadoPresupuesto(item);
      this.show_pop_up = false;
    };
    this.show_pop_up = true;
  }
  async asignarAtrasadoPresupuesto(item: Presupuesto) {
    this._messageService.add({
      severity: 'info',
      summary: 'Atrasando Presupuesto..',
      detail: 'El presupuesto desaparecera de asignados',
    });
    try {
      const { error: errorPresupuesto } =
        await this._presupuestoService.atrasarPresupuesto(item.id);

      if (errorPresupuesto) {
        this._messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail:
            'Error al crear orden de compra: ' +
            (errorPresupuesto || 'Error desconocido'),
        });
        return;
      } else {
        this._messageService.add({
          severity: 'success',
          summary: 'Hecho',
          detail: 'Se atraso el presupuesto',
        });
      }
    } catch (error: any) {
      this._messageService.add({
        severity: 'danger',
        summary: 'Hecho',
        detail: 'Error al asignar presupuesto ' + error.message,
      });
    }
  }

  eliminarPresupuestoPopUp(item: Presupuesto) {
    console.log('click');
    this.title_pop_up = 'Eliminar';
    this.description_pop_up = 'Se va a eliminar el presupuesto, ¿Estas seguro?';
    this.popup_type = 'danger';
    this.onAcceptPopUp = () => {
      this.eliminarPresupuesto(item);
      this.show_pop_up = false;
    };
    this.show_pop_up = true;
  }
  async eliminarPresupuesto(item: Presupuesto) {
    this._messageService.add({
      severity: 'danger',
      summary: 'Eliminando..',
      detail: 'Eliminando presupuesto',
    });
    try {
      const { error: errorPresupuesto } =
        await this._presupuestoService.deletePresupuestoOC(item.id);

      if (errorPresupuesto) {
        this._messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail:
            'Error al Eliminar: ' + (errorPresupuesto || 'Error desconocido'),
        });
        return;
      } else {
        this._messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Se Elimino el presupuesto',
        });
      }
    } catch (error: any) {
      this._messageService.add({
        severity: 'danger',
        summary: 'Hecho',
        detail: 'Error al eliminar presupuesto ' + error.message,
      });
    }
  }
  confirmAddWithPrice() {
    if (!this.pendingItem) {
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay item seleccionado.',
      });
      this.cancelAdd();
      return;
    }

    if (!this.isPrecioValid()) {
      this._messageService.add({
        severity: 'warn',
        summary: 'Precio inválido',
        detail: 'Ingresá un precio mayor a 0.',
      });
      return;
    }

    // Evitar duplicados por id (opcional)
    const exists = this.pedidoItems.some((x) => x.id === this.pendingItem!.id);
    if (exists) {
      this._messageService.add({
        severity: 'warn',
        summary: 'Duplicado',
        detail: 'El item ya fue agregado.',
      });
      this.cancelAdd();
      return;
    }

    const itemWithPrice: LocalPedidoItem = {
      ...(this.pendingItem as PedidoItem),
      precio_asignado: this.precioAsignado as number,
    };

    // Agrega a la lista local
    this.pedidoItems = [...this.pedidoItems, itemWithPrice];

    // AGREGA TAMBIÉN AL SERVICIO
    this._ordenCompraService.addItemOC(
      itemWithPrice,
      itemWithPrice.precio_asignado!
    );
    console.log(
      'Se agrega al ITEMS OC: ',
      this._ordenCompraService.ordenCompraItems()
    );
    this._messageService.add({
      severity: 'success',
      summary: 'Item agregado',
      detail: `${
        itemWithPrice.producto?.nombre || 'Producto'
      } agregado con precio  ${this.currencyPipe.transform(
        itemWithPrice.precio_asignado,
        '$',
        'symbol',
        '1.0-0'
      )} `,
    });

    this.cancelAdd();
  }

  // El resto de tus métodos: editProductItem, deleteItemPedido, etc.
  editProductItem(item: PedidoItem) {
    /* ... */
  }
  deleteItemPedido(item: PedidoItem | undefined) {
    if (item === undefined) return;
    this._ordenCompraService.deleteItemOC(item);
    this._messageService.add({
      severity: 'info',
      summary: 'Item eliminado',
      detail: `Item #${item.producto?.nombre} eliminado.`,
    });
  }

  // trackBy
  trackByItemId(index: number, item: PedidoItem) {
    return item.id ?? index;
  }

  getBadgeClass(estado?: string, itsItem?: boolean): string {
    if (estado) {
      return itsItem
        ? getBadgeClassByPedidoItem(estado)
        : getBadgeClassByEstadoPedido(estado);
    } else {
      return '';
    }
  }
  showMessageWhenIsNull() {
    this._messageService.add({
      severity: 'info',
      summary: 'Seleccione un item',
      detail: `Seleccione un item pendiente en la OC.`,
    });
  }
  presupuestoItem(idItemProduct: PedidoItem) {
    console.log('Abriendo producto ..', idItemProduct);
    this.sidebarTitle = 'Presupuesto:';
    this.componentToLoad = PresupuestoFormComponent;
    this.sidebarInputs = {
      producto_id: idItemProduct?.producto?.id,
      cantidad: idItemProduct?.cantidad,
      unidad_medida_id: idItemProduct.unidad_medida?.id,
      onSaveSuccess: () => this.handleCloseSidebar(),
      formResult: (result: {
        severity?: string;
        success: boolean;
        message: string;
      }) => this.handleFormResult(result),
    };

    this.sidebarVisible = true;
  }

  presupuestoAddOC() {
    this.sidebarTitle = 'Agregar Presupuesto a la OC:';
    this.componentToLoad = TableGenericFilterComponent;
    this.sidebarInputs = {
      data: this._presupuestoService.presupuestos,
      filter: this._presupuestoService.presupuestoAsignados,
      addButton: true,
      addButtonClick: (item: Presupuesto) =>
        this._presupuestoService.addPresupuestoAsignado(item),
      trashButton: true,
      trashButtonClick: (item: Presupuesto) =>
        this.eliminarPresupuestoPopUp(item),
      timeButton: true,
      timeButtonClick: (item: Presupuesto) =>
        this.atrasarPresupuestoPopUp(item),
      columns: [
        {
          field: 'proveedores',
          header: 'Proveedor',
          pipe: this.getNombreProveedor,
        },
        {
          field: 'productos',
          header: 'Producto',
          pipe: this.getNombreProducto,
        },
        {
          field: 'unidades_medida',
          header: 'Medida',
          pipe: this.getUnidadMedidaNombre,
        },
        { field: 'cantidad', header: 'Cantidad' },
        { field: 'importe', header: 'Importe', pipe: this.getImporteCurrency },
      ],
    };

    this.sidebarVisible = true;
  }

  handleCloseSidebar() {
    console.log('Producto guardado, cerrando sidebar...');
    this.sidebarVisible = false;
  }
  handleFormResult(result: {
    severity?: string;
    success?: boolean;
    message: string;
  }): void {
    if (!result.severity) {
      this._messageService.add({
        severity: result.success ? 'success' : 'error',
        summary: result.success ? 'Éxito' : 'Error',
        detail: result.message,
      });
    } else {
      this._messageService.add({
        severity: result.severity,
        summary: 'Info',
        detail: result.message,
      });
    }
  }
  //Getters functions
  getNombreProveedor = (proveedor: Proveedor) => proveedor?.nombre;
  getNombreProducto = (producto: Producto) => producto?.nombre;
  getUnidadMedidaNombre = (unidad_medida: UnidadMedida) =>
    unidad_medida?.nombre;
  getImporteCurrency = (importe: number) =>
    this.currencyPipe.transform(importe, '$', 'symbol', '1.0-0');

  async onSubmit() {
    // Validaciones
    if (!this.itemsOC || this.itemsOC.length === 0) {
      this._messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe agregar al menos un item a la orden de compra',
      });
      return; // ✅ Solo return, sin valor
    }

    if (this.ordenCompraForm.invalid) {
      console.log(this.ordenCompraForm);
      this._messageService.add({
        severity: 'error', // ✅ Cambié de 'danger' a 'error'
        summary: 'Formulario Inválido',
        detail: 'Revise los primeros 3 camois',
      });
      return;
    }

    try {
      // 1. Crear la OC
      const ordenCompraData = {
        proveedor_id: this.ordenCompraForm.value.proveedor_id, // ✅ Corregido el campo
        condicion_entrega: this.ordenCompraForm.value.condicion_entrega,
        condicion_pago: this.ordenCompraForm.value.condicion_pago,
        total: this.totalOC,
      };

      const { data: newOrdenCompra, error: errorOC } =
        await this._ordenCompraService.createOrdenCompra(ordenCompraData);

      if (errorOC || !newOrdenCompra) {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'Error al crear orden de compra: ' +
            (errorOC?.message || 'Error desconocido'),
        });
        return;
      }

      // 2. Insertar los items en la OC
      const { error: errorItem } =
        await this._ordenCompraService.addItemToOrdenCompra(newOrdenCompra.id);

      if (errorItem) {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'Error al agregar items: ' +
            (errorItem &&
            typeof errorItem === 'object' &&
            'message' in errorItem
              ? (errorItem as any).message
              : JSON.stringify(errorItem)),
        });
        console.error('Error al agregar items:', errorItem);
        return;
      }

      // 3. Asignar presupuestos si los hay
      const presupuestosAsignados =
        this._presupuestoService.presupuestoAsignados();
      if (presupuestosAsignados.length > 0) {
        const { error: errorPresupuesto } =
          await this._presupuestoService.asignarPresupuestoOC(
            newOrdenCompra.id
          );

        if (errorPresupuesto) {
          this._messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail:
              'Error al agregar items: ' +
              (errorItem &&
              typeof errorItem === 'object' &&
              'message' in errorItem
                ? (errorItem as any).message
                : JSON.stringify(errorPresupuesto)),
          });
        }
      }

      // 4. Éxito total
      this._messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Orden de compra creada correctamente',
      });

      // 5. Limpiar datos
      this.resetForm();
    } catch (error: any) {
      console.error('Error creando orden de compra:', error);
      this._messageService.add({
        severity: 'error',
        summary: 'Error Inesperado',
        detail:
          'Error al procesar la orden: ' +
          (JSON.stringify(error) || 'Error desconocido'),
      });
      // ✅ Sin return aquí
    }
  }

  // ✅ Método auxiliar para limpiar el formulario
  private resetForm() {
    this.ordenCompraForm.reset();
    this._ordenCompraService.clearOrderData();
    this._presupuestoService.clearPresupuestosAsignados();
    this.pedidoItems = [];
    this.totalOC = 0;

    // Opcional: navegar a otra página o mostrar confirmación
    // this.router.navigate(['/ordenes-compra']);
  }
}
