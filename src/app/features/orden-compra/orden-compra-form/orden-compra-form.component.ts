import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableNgItemPedidoComponent } from 'src/app/shared/tables/table-ng-item-pedido/table-ng-item-pedido.component';
import { PedidoItem } from 'src/app/core/models/database.type';
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
import { InputModalSelectorComponent, SelectorData } from 'src/app/shared/input/input-modal-selector/input-modal-selector.component';
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
    ReactiveFormsModule
  ],
  templateUrl: './orden-compra-form.component.html',
  styleUrls: ['./orden-compra-form.component.css'],
  providers: [PrimeNGConfig, MessageService, ConfirmationService],
})
export class OrdenCompraFormComponent implements OnInit{
  
  pedidoItems: LocalPedidoItem[] = [];
 
  private _ordenCompraService=inject(OrdenCompraService);
  private _proveedorService=inject(ProveedorService)
  proovedores= this._proveedorService.proveedores
   proveedoresData: SelectorData[] = [];
  public itemsOC: PedidoItem[] | null= this._ordenCompraService.itemsOC();
  showPriceDialog = false;
  precioAsignado: number | null = null;
  private pendingItem: PedidoItem | null = null;
 
  private _pedidoService = inject(PedidoService);
  private _messageService = inject(MessageService);

  pedido = this._pedidoService.pedido;

  constructor() {
    const current = this.pedido();
    if (current?.pedido_items?.length) {
      // Inicializa con lo que ya viniera en el pedido (map para incluir precio_asignado si quisiera)
      this.pedidoItems = [...(current.pedido_items || [])] as LocalPedidoItem[];
    }
  }
  ngOnInit(): void {
       if (this.proovedores && this.proovedores.length === 0) {
        this._proveedorService.getAllProveedores();
    }
  
    if(this.proovedores()){
      this.proveedoresData= this.proovedores().map((proveedor) => ({
        id: proveedor.id,
        name: proveedor.nombre,
      }));
    }
  }

 
  /* -------------------
     Nuevo flujo: abrir dialog para precio
     ------------------- */
  // Este método será el receptor del evento addItem de la tabla
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

    // Creamos una copia local con precio asignado
    const itemWithPrice: LocalPedidoItem = {
      ...(this.pendingItem as PedidoItem),
      precio_asignado: this.precioAsignado as number,
    };

    // Agregamos a la lista local (manteniendo inmutabilidad)
    this.pedidoItems = [...this.pedidoItems, itemWithPrice];

    this._messageService.add({
      severity: 'success',
      summary: 'Item agregado',
      detail: `${
        itemWithPrice.producto?.nombre || 'Producto'
      } agregado con precio ${itemWithPrice.precio_asignado}`,
    });

    // reset y cerrar dialog
    this.cancelAdd();
  }

  // El resto de tus métodos: editProductItem, deleteItemPedido, etc.
  editProductItem(item: PedidoItem) {
    /* ... */
  }
  deleteItemPedido(itemId: number | undefined) {
    if (itemId === undefined) return;
    this.pedidoItems = this.pedidoItems.filter((it) => it.id !== itemId);
    this._messageService.add({
      severity: 'info',
      summary: 'Item eliminado',
      detail: `Item #${itemId} eliminado.`,
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
}
