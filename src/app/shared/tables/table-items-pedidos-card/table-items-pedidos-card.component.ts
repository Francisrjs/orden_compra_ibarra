import {
  Component,
  effect,
  inject,
  Input,
  OnInit,
  Output,
  Type,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { PedidoService } from 'src/app/features/pedidos/services/pedido.service';
import { SidebarService } from '../../sidebar/sidebar/services/sidebar.service';
import { OrdenCompraItem, Pedido, PedidoItem, Producto } from 'src/app/core/models/database.type';
import { ProductoPedidoFormComponent } from 'src/app/features/productos/producto/producto-pedido-form/producto-pedido-form.component';
import { ProductoFormComponent } from 'src/app/features/productos/producto/producto-form/producto-form.component';
import {
  getBadgeClassByEstadoPedido,
  getBadgeClassByPedidoItem,
} from '../../funtions/pedidosFuntions';
import { ButtonWithIconComponent } from '../../buttons/button-with-icon/button-with-icon.component';
import { SidebarComponent } from '../../sidebar/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-items-pedidos-card',
  standalone: true,
  imports: [
    CommonModule,
    ButtonWithIconComponent,
    ButtonWithIconComponent,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './table-items-pedidos-card.component.html',
  styleUrls: ['./table-items-pedidos-card.component.css'],
})
export class TableItemsPedidosCardComponent implements OnChanges {
    sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined; // Para los inputs del componente dinámico
  @Input() onSaveSuccess?: () => void;
  @Output() openCreateItem = new EventEmitter<void>();
  @Output() openEditItem = new EventEmitter<PedidoItem>();
  @Output() openPresupuestoItem= new EventEmitter<OrdenCompraItem>()
  @Output() deleteItem = new EventEmitter<PedidoItem>();
  @Output() finalizarPedido = new EventEmitter<void>();
  @Input() messageWhenNull: boolean = true
  @Output() messageNull = new EventEmitter<void>()
  @Input() pedido: Pedido | null = null;
  @Input() itemsOC: OrdenCompraItem[] | null= null;
  private listaCompletaItems: Array<PedidoItem | OrdenCompraItem> = [];
public pedidoItems: Array<PedidoItem | OrdenCompraItem> = [];
  public searchTerm: string = ''; // El texto del input de búsqueda
  
 
  ngOnChanges(changes: SimpleChanges): void {
    // Verifica si la propiedad 'pedido' ha cambiado
    if (changes['pedido'] && this.pedido) {
      // Asigna los items del pedido a la variable local
      this.pedidoItems = this.pedido.pedido_items ?? [];
      this.listaCompletaItems = this.pedido.pedido_items ?? [];
      this.filterItems(); // Llama al filtro para mostrar la lista inicial
    }
    if(this.itemsOC){
      this.pedidoItems= this.itemsOC ?? [];
      this.listaCompletaItems= this.itemsOC ?? [];
    }
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
  openPedidoProducto(): void {
    console.log(this.pedido);
    this.openCreateItem.emit();
  }
  openPresupuestoItemForm(item: OrdenCompraItem)  {
    this.openPresupuestoItem.emit(item)
  }
  deleteItemPedido(item: PedidoItem) {
    this.deleteItem.emit(item);
  }

  editProductItem(ItemProduct: PedidoItem) {
    this.openEditItem.emit(ItemProduct);
  }
  finalizar(): void {
    this.finalizarPedido.emit();
  }

 filterItems(): void {
  if (!this.searchTerm || this.searchTerm.trim() === '') {
    this.pedidoItems = [...this.listaCompletaItems];
  } else {
    const terminoBusqueda = this.searchTerm.toLowerCase();
    this.pedidoItems = this.listaCompletaItems.filter((item) => {
      // Si es OrdenCompraItem
      if ('pedido_items' in item && item.pedido_items) {
        return (
          item.pedido_items.producto?.nombre
            ?.toLowerCase()
            .includes(terminoBusqueda)
        );
      }
      // Si es PedidoItem
      return (
        (item as PedidoItem).producto?.nombre
          ?.toLowerCase()
          .includes(terminoBusqueda)
      );
    });
  }
}
  showMessageWhenIsNull(){
    this.messageNull.emit();
  }

  //helpers
  getProducto(item: PedidoItem | OrdenCompraItem) {
  if ('pedido_items' in item && item.pedido_items) {
    return item.pedido_items.producto;
  }
  return (item as PedidoItem).producto;
}

getCategoriaIcon(item: PedidoItem | OrdenCompraItem) {
  return this.getProducto(item)?.categoria?.icon_text ?? '';
}

getNombreProducto(item: PedidoItem | OrdenCompraItem) {
  return this.getProducto(item)?.nombre ?? '';
}

  getEstado(item: PedidoItem | OrdenCompraItem) {
    if ('pedido_items' in item && item.pedido_items) {
      return item.pedido_items.estado;
    }
    return (item as PedidoItem).estado;
  }

  getCantidad(item: PedidoItem | OrdenCompraItem) {
    if ('pedido_items' in item && item.pedido_items) {
      return item.pedido_items.cantidad;
    }
    return (item as PedidoItem).cantidad;
  }

  getUnidadMedida(item: PedidoItem | OrdenCompraItem) {
    if ('pedido_items' in item && item.pedido_items) {
      return item.pedido_items.unidad_medida?.nombre;
    }
    return (item as PedidoItem).unidad_medida?.nombre;
  }

  getDescripcion(item: PedidoItem | OrdenCompraItem) {
    if ('pedido_items' in item && item.pedido_items) {
      return item.pedido_items.producto?.descripcion ?? '';
    }
    return (item as PedidoItem).producto?.descripcion ?? '';
  }

  getLinkReferencia(item: PedidoItem | OrdenCompraItem) {
    if ('pedido_items' in item && item.pedido_items) {
      return item.pedido_items.link_referencia;
    }
    return (item as PedidoItem).link_referencia;
  }

  getRazonPedido(item: PedidoItem | OrdenCompraItem) {
    if ('pedido_items' in item && item.pedido_items) {
      return item.pedido_items.razon_pedido;
    }
    return (item as PedidoItem).razon_pedido;
  }
getPedidoItem(item: PedidoItem | OrdenCompraItem): PedidoItem {
  return 'pedido_items' in item && item.pedido_items ? item.pedido_items : (item as PedidoItem);
}
  
  getPrice(item: PedidoItem | OrdenCompraItem) {
    if ('precio_unitario' in item && typeof item.precio_unitario !== 'undefined') {
      return item.precio_unitario;
    }
    // Si el PedidoItem tiene un campo de precio (por ejemplo, precio_asignado)
    if ('precio_asignado' in item && typeof (item as any).precio_asignado !== 'undefined') {
      return (item as any).precio_asignado;
    }
    return null;
  }

}
