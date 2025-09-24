import { Component, effect, inject, Input, OnInit, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableNgItemPedidoComponent } from 'src/app/shared/tables/table-ng-item-pedido/table-ng-item-pedido.component';
import { OrdenCompraItem, PedidoItem } from 'src/app/core/models/database.type';
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
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
import { ButtonFancyComponent } from 'src/app/shared/buttons/button-fancy/button-fancy.component';
import { InputBoxComponent } from 'src/app/shared/input/input-box/input-box.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
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
    ButtonWithIconComponent,
    ButtonElegantComponent,
    ButtonFancyComponent,
    InputBoxComponent,
    TableItemsPedidosCardComponent,
    InputModalSelectorComponent,
    ReactiveFormsModule,
    SidebarComponent,
  ],
  templateUrl: './orden-compra-form.component.html',
  styleUrls: ['./orden-compra-form.component.css'],
  providers: [
    PrimeNGConfig,
    MessageService,
    ConfirmationService,
    SidebarComponent,
  ],
})
export class OrdenCompraFormComponent implements OnInit {
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined; // Para los inputs del componente dinámico
  @Input() onSaveSuccess?: () => void;
  pedidoItems: LocalPedidoItem[] = [];

  private _ordenCompraService = inject(OrdenCompraService);
  private _proveedorService = inject(ProveedorService);
  proovedores = this._proveedorService.proveedores;
  proveedoresData: SelectorData[] = [];
  public itemsOC: PedidoItem[] | null = this._ordenCompraService.itemsOC();
  showPriceDialog = false;
  precioAsignado: number | null = null;
  private pendingItem: PedidoItem | null = null;

  private _pedidoService = inject(PedidoService);
  private _messageService = inject(MessageService);
  public totalOC = 0;
  pedido = this._pedidoService.pedido;

  constructor() {
    const current = this.pedido();
    if (current?.pedido_items?.length) {
      // Inicializa con lo que ya viniera en el pedido (map para incluir precio_asignado si quisiera)
      this.pedidoItems = [...(current.pedido_items || [])] as LocalPedidoItem[];
    }
    effect(() => {
      this.itemsOC = this._ordenCompraService.itemsOC() ?? [];
      this.totalOC = this._ordenCompraService.sumProductsOC();
    });
    effect(() => {
      const lista = this.proovedores();
      this.proveedoresData = lista.map((proveedor) => ({
        id: proveedor.id,
        name: proveedor.nombre,
      }));
      console.log('proveedores cargados: ', lista);
    });
  }
  ngOnInit(): void {
    if (this.proovedores().length === 0) {
      this._proveedorService.getAllProveedores();
    }

    // Usamos effect para reaccionar cuando cambia la lista de proveedores
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
      } agregado con precio ${itemWithPrice.precio_asignado}`,
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
  presupuestoItem(idItemProduct: OrdenCompraItem) {
    console.log('Abriendo producto ..', idItemProduct);
    this.sidebarTitle = 'Presupuesto:';
    this.componentToLoad = PresupuestoFormComponent;
    this.sidebarInputs = {
      producto_id: idItemProduct.pedido_items?.id,
      cantidad: idItemProduct.pedido_items?.cantidad,
      unidad_medida_id: idItemProduct.pedido_items?.unidad_medida_id,
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
}
