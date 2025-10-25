import {
  Component,
  Input,
  Type,
  OnInit,
  inject,
  effect,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  Factura,
  OrdenCompra,
  OrdenCompraItem,
  PedidoItem,
  Remito,
} from 'src/app/core/models/database.type';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TableGenericNGComponent } from 'src/app/shared/tables/table-generic-ng/table-generic-ng.component';
import { getBadgeClassByOC } from 'src/app/shared/funtions/pedidosFuntions';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { RemitoService } from '../../facturas/services/remito.service';
import { FacturaService } from '../../facturas/services/factura.service';
import { OrdenCompraService } from '../services/orden-compra.service';
import { PopUpNgComponent } from 'src/app/shared/modal/pop-up-ng/pop-up-ng.component';
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';
import { ActivatedRoute } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import { ProductoPedidoFormComponent } from '../../productos/producto/producto-pedido-form/producto-pedido-form.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductoFormComponent } from '../../productos/producto/producto-form/producto-form.component';
import { RemitoFormDialogComponent } from 'src/app/shared/modal/remito-form-dialog/remito-form-dialog.component';
import { FacturaFormDialogComponent } from 'src/app/shared/modal/factura-form-dialog/factura-form-dialog.component';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-orden-compra-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableGenericNGComponent,
    DividerModule,
    ButtonElegantComponent,
    ButtonModule,
    RemitoFormDialogComponent,
    FacturaFormDialogComponent,
    AccordionModule,
    TooltipModule,
    PopUpNgComponent,
    TabViewModule,
    SidebarComponent,
    ToastModule
  ],
  templateUrl: './orden-compra-detail.component.html',
  styleUrls: ['./orden-compra-detail.component.css'],
  providers:[MessageService,CurrencyPipe,MessageService]
})
export class OrdenCompraDetailComponent implements OnInit {
  // Sidebar
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined;

  // Modales
  facturaToEdit?: Factura;
  showAddFactura: boolean = false;
  showAddRemito: boolean = false;

  // Servicios
  public route = inject(ActivatedRoute);
  public _remitoService = inject(RemitoService);
  public _facturaService = inject(FacturaService);
  private _messageService = inject(MessageService);
  private currencyPipe = inject(CurrencyPipe);
  public _ordenCompraService = inject(OrdenCompraService);
  private cdr = inject(ChangeDetectorRef);

  // Propiedades del modal pop-up
  showModal: boolean = false;
  titleModal: string = '';
  descriptionModal: string = '';
  typeModal: 'number' | 'date' | 'dropdown' | 'none' = 'none';
  type: 'default' | 'danger' | 'warning' | 'done' = 'default';
  prefix: '$' | '' = '';
  numberPlaceHolder: string = '';
  currentAction: string = '';
  currentItem: any = null;
  iconClass = 'bi bi-check2-circle';
  
  // Propiedades dropdown
  dropdownOptions: any[] = [];
  dropdownPlaceholder: string = 'Seleccione una opción';
  dropdownOptionLabel: string = 'label';
  dropdownOptionValue: string = 'value';

  constructor() {
    // ✅ Effect para forzar detección cuando cambia la orden
    effect(() => {
      this._ordenCompraService.ordenCompra();
      this._ordenCompraService.facturas();
      this._ordenCompraService.presupuestos();
      this._ordenCompraService.remitos();
      this._ordenCompraService.ordenCompraItemsSignal();
      this.cdr.markForCheck();
    });
  }

  // ✅ Getter para acceso más fácil en el template
  get dataOrden() {
    return this._ordenCompraService.ordenCompra();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      console.warn('No se recibió id en la ruta');
      return;
    }

    const id = Number(idParam);
    this._ordenCompraService.getOCById(id);
    
    if (Number.isNaN(id)) {
      console.warn('id de ruta no es numérico:', idParam);
      return;
    }
  }
addOrdenCompraItem() {
  console.log('Abriendo producto ..');
  this.sidebarTitle = 'Agregar Item a la OC:';
  this.componentToLoad = ProductoPedidoFormComponent;
  this.sidebarInputs = {
    OCform: true,
    
    onSaveSuccess: () => this.handleCloseSidebar(),
    
    // ✅ Usar el @Input function en lugar del @Output
    itemCreatedForOCAbierta: (event: { item: PedidoItem; precio: number }) => 
      this.handleItemCreatedForOC(event),
    
    formResult: (result: {
      severity?: string;
      success: boolean;
      message: string;
    }) => this.handleFormResult(result),
       onNavigateToCreateProduct: () => this.openProductoForm(),
  };

  this.sidebarVisible = true;
}

openProductoForm(): void {
    this.sidebarTitle = 'Crear Nuevo Producto';
    this.componentToLoad = ProductoFormComponent; // <-- Cambias el componente aquí
    this.sidebarInputs = {
      // Opcional: Cuando este formulario se guarde, puedes volver al anterior o cerrar todo
      onSaveSuccess: () => {
        console.log('Producto nuevo creado! Volviendo...');
        // Vuelve a abrir el formulario para agregar el producto recién creado al pedido
        this.openPedidoProducto();
      },
         onNavigateToCreateProduct: () => this.openProductoForm(),
      formResult: (result: { success: boolean; message: string }) =>
        this.handleFormResult(result),
    };
    // No es necesario cambiar 'sidebarVisible', porque el sidebar ya está abierto.
  }
    openPedidoProducto(): void {
      console.log('abriendo');
      this.sidebarTitle = 'Agregar nuevo producto a tu Pedido';
      this.componentToLoad = ProductoPedidoFormComponent;
      this.sidebarInputs = {
        onNavigateToCreateProduct: () => this.openProductoForm(),
        onSaveSuccess: () => this.handleCloseSidebar(),
        formResult: (result: {
          severity?: string;
          success: boolean;
          message: string;
        }) => this.handleFormResult(result),
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

  // ==================== MÉTODOS DE FORMATEO ====================

  getTotalCurrency = (value: number): string => {
    return this.currencyPipe.transform(value, '$', 'symbol', '1.2-2') || '$0.00';
  };

  getImporteCurrency = (value: number): string => {
    return this.currencyPipe.transform(value, '$', 'symbol', '1.2-2') || '$0.00';
  };

  getRecibido(value: boolean): string {
    return value ? 'SI' : 'NO';
  }
  getFactura(value: string): string {
    return value ? value : 'Sin Factura';
  }
 formatDate(value: Date | string | null | undefined): string {
  if (!value) return '-';

  // Si es string en formato YYYY-MM-DD, convertir directamente a DD/MM/YYYY
  if (typeof value === 'string') {
    const [year, month, day] = value.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }

  // Si es un objeto Date
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '-';
    
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  return '-';
}
  getBadgeClass(estado: string) {
    return getBadgeClassByOC(estado);
  }

  todosLosItemsRecibidos(): boolean {
    if (
      !this.dataOrden?.orden_compra_items ||
      this.dataOrden.orden_compra_items.length === 0
    ) {
      return false; // Si no hay items, no se puede cerrar
    }
    return this.dataOrden.orden_compra_items.every(
      (item) => item.recibido === true
    );
  }

  // ✅ Nueva función para verificar si la orden está finalizada
  isOrdenFinalizada(): boolean {
    return this.dataOrden?.estado === 'FINALIZADA';
  }

  finalizarOrdenCompra(): void {
    if (!this.dataOrden) return;
    this._ordenCompraService.finalizarOC(this.dataOrden.id);
  }

  // ==================== FACTURA ====================

  async editarFactura(factura: Factura) {
  this.facturaToEdit = factura;
  this.showAddFactura = true;
}

  handleFacturaSaved(result: { success: boolean; message: string }) {
    this.handleFormResult(result);
    
    if (result.success) {
      this.showAddFactura = false;
      this.facturaToEdit = undefined;
      
      if (this.dataOrden) {
        this._ordenCompraService.getOCById(this.dataOrden.id);
      } else {
        this._messageService.add({
    severity: 'danger',
    summary: 'Item eliminado',
    detail: 'No hay información de la orden'
  });
    }
    
  }
}

  handleRemitoSaved(remito: Remito): void {
    this._remitoService.addItemRemito(remito);
    
    this._messageService.add({
      severity: 'success',
      summary: 'Remito agregado',
      detail: `Remito ${remito.numero_remito} agregado correctamente`
    });
  }

  // ==================== FORMATEO DE FECHAS ====================
  formatDateString(value: Date | string | null | undefined): string {
    if (!value) return '-';

    // Si es un objeto Date, ajustar por desfase de zona horaria
    if (value instanceof Date) {
      // Crear nueva fecha sumando 1 día para compensar el desfase UTC
      const adjustedDate = new Date(value);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      const day = String(adjustedDate.getDate()).padStart(2, '0');
      const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
      const year = adjustedDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Si es string 'YYYY-MM-DD', convertir a 'DD/MM/YYYY'
    if (typeof value === 'string') {
      const [y, m, d] = value.split('-');
      if (!y || !m || !d) return value;
      return `${d}/${m}/${y}`;
    }

    return '-';
  }

  // ==================== MODAL POP-UP ====================

  async handleAccept(value?: any) {
    console.log('Acción aceptada:', this.currentAction, 'Valor:', value);

    switch (this.currentAction) {
      case 'itemRecibido':
        await this.confirmarItemRecibido(this.currentItem);
        break;
      case 'editPriceItem':
        await this.editarPrecioItem(this.currentItem, value);
        break;
      case 'relacionarFactura':
        await this.relacionarFactura(this.currentItem, value);
        break;
      case 'actualizarFechaPago':
        await this.actualizarFechaPago(this.currentItem, value);
        break;
      case 'editPriceItemNewFactura':
        this.editarPrecioItem(this.currentItem, value, true);
        break;
      default:
        console.log('Acción no manejada');
    }

    this.closeModal();
  }

  handleCancel() {
    console.log('Acción cancelada');
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.currentAction = '';
    this.currentItem = null;
  }

  // ==================== ACCIONES DE ITEMS TEMPORALES ====================

  eliminarItemTemporal(item: OrdenCompraItem) {
    this._ordenCompraService.deleteItemOC(item, true);
    
    this._messageService.add({
      severity: 'danger',
      summary: 'Item eliminado',
      detail: 'El item fue eliminado de la lista'
    });
  }

  handleItemCreatedForOC(event: { item: PedidoItem; precio: number }) {
    const { item, precio } = event;

    // Agregar a la signal usando el servicio
    this._ordenCompraService.addItemOC(item, precio, true);

    console.log(
      'Item agregado a la OC:',
      this._ordenCompraService.ordenCompraItems()
    );

    this._messageService.add({
      severity: 'success',
      summary: 'Item agregado',
      detail: `${
        item.producto?.nombre || 'Producto'
      } agregado con precio ${this.currencyPipe.transform(
        precio,
        '$',
        'symbol',
        '1.0-0'
      )}`,
    });

    // Cerrar el sidebar
    this.handleCloseSidebar();
  }

  // ==================== ACCIONES DE ITEMS ====================

  openItemRecibidoModal(item: any) {
    this.currentAction = 'itemRecibido';
    this.currentItem = item;
    this.titleModal = 'Confirmar recepción';
    this.descriptionModal = `¿Confirma que recibió el producto "${item.pedido_item_id?.productos?.nombre}"?`;
    this.typeModal = 'none';
    this.prefix = '';
    this.iconClass = 'bi bi-check2-circle';
    this.type = 'done';
    this.showModal = true;
  }
  openEditOrdenCompraItem(item: any) {
    this.currentAction = 'editPriceItem';
    this.currentItem = item;
    this.type = 'warning';
    this.prefix = '$';
    this.titleModal = `Cambiando el SUBTOTAL del item  `;
    this.descriptionModal = `Usted va a cambiar el subtotal del item  "${item.pedido_item_id?.productos?.nombre}, ${item.cantidad}  ${item.pedido_item_id?.unidad_medida_id.nombre}"`;
    this.typeModal = 'number';
    this.showModal = true;
  }
    openEditPriceItemFacturaSignal(item: any) {
    this.currentAction = 'editPriceItemNewFactura';
    this.currentItem = item;
    this.type = 'warning';
    this.prefix = '$';
    this.titleModal = `Cambiando el SUBTOTAL del item del SIGNAL  `;
    this.descriptionModal = `Usted va a cambiar el subtotal del item  "${item.pedido_item_id?.productos?.nombre}, ${item.cantidad}  ${item.pedido_item_id?.unidad_medida_id.nombre}"`;
    this.typeModal = 'number';
    this.showModal = true;
  }
  openRelacionarFacturaModal(item: any) {
    this.currentAction = 'relacionarFactura';
    this.currentItem = item;
    this.type = 'default';
    this.prefix = '';
    this.titleModal = `Relacionar item ${item.pedido_item_id?.productos?.nombre}"`;
    this.descriptionModal = '';
    this.typeModal = 'dropdown';
    this.dropdownOptions =
      this.dataOrden?.facturas?.map((factura) => ({
        label: `${factura.numero_factura} - $${factura.importe.toFixed(
          2
        )} - ${this.formatDate(factura.fecha)}`,
        value: factura,
      })) || [];

    this.dropdownPlaceholder = 'Seleccione una factura';
    this.dropdownOptionLabel = 'label';
    this.dropdownOptionValue = 'value';

    this.showModal = true;
  }
  /**
   * Confirma que el item fue recibido
   */
  async confirmarItemRecibido(item: any) {
    try {
      console.log('Marcando item como recibido:', item);

      const { data, error } = await this._ordenCompraService.itemRecibido(item);

      if (error) {
        console.error('Error al marcar item como recibido:', error);
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al marcar el item como recibido'
        });
        return;
      }

      // Si todo salió bien
      this._messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Item marcado como recibido correctamente'
      });

      // ✅ No es necesario recargar, la signal se actualiza automáticamente en el servicio
    } catch (error) {
      console.error('Error inesperado al marcar item como recibido:', error);
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error inesperado al marcar el item como recibido'
      });
    }
  }
  async editarPrecioItem(item: any, nuevoPrecio: number, newFactura?: boolean) {
    try {
      if (!nuevoPrecio || nuevoPrecio <= 0) {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe ingresar un precio válido mayor a 0'
        });
        return;
      }

      console.log(
        'Editando precio del item:',
        item,
        'Nuevo precio:',
        nuevoPrecio
      );
      
      if (!newFactura) {
        const { data, error } = await this._ordenCompraService.editPriceItem(
          item,
          nuevoPrecio
        );

        if (error) {
          console.error('Error al editar precio del item:', error);
          this._messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el precio del item'
          });
          return;
        }
      } else {
        this._ordenCompraService.editPriceItemSignal(item, nuevoPrecio);
      }
      
      // Si todo salió bien
      this._messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Precio del item actualizado correctamente'
      });

      // ✅ No es necesario recargar, la signal se actualiza automáticamente en el servicio
    } catch (error) {
      console.error('Error inesperado al editar precio:', error);
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error inesperado al actualizar el precio'
      });
    }
  }
  async relacionarFactura(item: any, factura: Factura) {
    try {
      if (!factura) {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe seleccionar una factura'
        });
        return;
      }

      console.log(
        'Relacionando item con factura:',
        item,
        'Factura ID:',
        factura
      );

      // Llamar al servicio para relacionar
      const { data, error } =
        await this._ordenCompraService.relacionarItemConFactura(
          item.id,
          factura
        );

      if (error) {
        console.error('Error al relacionar item con factura:', error);
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al relacionar el item con la factura'
        });
        return;
      }

      // Si todo salió bien
      this._messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Item relacionado con la factura correctamente'
      });
    } catch (error) {
      console.error('Error inesperado al relacionar item con factura:', error);
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error inesperado al relacionar el item'
      });
    }
  }

  /**
   * Abre el modal para agregar/editar una factura
   */
  openModalFactura() {
    if (!this.dataOrden) {
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay información de la orden de compra'
      });
      return;
    }
    
    this.facturaToEdit = undefined; // Limpiar factura a editar
    this.showAddFactura = true;
    console.log('Abriendo modal factura, showAddFactura:', this.showAddFactura);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }
  openActualizarFechaPago(factura: any) {
    this.currentAction = 'actualizarFechaPago';
    this.currentItem = factura;
    this.type = 'default';
    this.prefix = '';
    this.titleModal = 'Actualizar Fecha de Pago';
    this.descriptionModal = `Actualizar la fecha de pago de la factura "${factura.numero_factura}"`;
    this.typeModal = 'date';
    this.showModal = true;
  }

  /**
   * Actualiza la fecha de pago de una factura
   */
  async actualizarFechaPago(factura: any, nuevaFecha: string) {
    try {
      if (!nuevaFecha) {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe seleccionar una fecha válida'
        });
        return;
      }

      console.log(
        'Actualizando fecha de pago de la factura:',
        factura,
        'Nueva fecha:',
        nuevaFecha
      );

      const { data, error } =
        await this._ordenCompraService.actualizarFechaPagoFactura(
          factura.id,
          nuevaFecha
        );

      if (error) {
        console.error('Error al actualizar fecha de pago:', error);
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar la fecha de pago'
        });
        return;
      }

      // Si todo salió bien
      this._messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Fecha de pago actualizada correctamente'
      });

      // ✅ No es necesario recargar, la signal se actualiza automáticamente en el servicio
    } catch (error) {
      console.error('Error inesperado al actualizar fecha de pago:', error);
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error inesperado al actualizar la fecha de pago'
      });
    }
  }
  getImporteTotalOC(): number {
  return this.dataOrden?.orden_compra_items?.reduce(
    (total, item) => total + (item.subtotal || 0), 
    0
  ) ?? 0;
}
}
