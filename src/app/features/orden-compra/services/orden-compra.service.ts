import { Injectable, signal } from '@angular/core';
import {
  OrdenCompra,
  OrdenCompraItem,
  Pedido,
  PedidoItem,
} from 'src/app/core/models/database.type';

@Injectable({
  providedIn: 'root',
})
export class OrdenCompraService {
  itemsOC = signal<PedidoItem[] | null>(null);
  ordenCompraItems = signal<OrdenCompraItem[]>([]);
  ordenCompra = signal<OrdenCompra | null>(null);

  addItemOC(newItem: PedidoItem, new_precio_unitario: number) {
    {
      this.itemsOC.update((items) => (items ? [...items, newItem] : [newItem]));
      this.ordenCompraItems.update((items) => [
        ...items,
        {
          pedido_item_id: newItem.id,
          pedido_items: newItem,
          precio_unitario: new_precio_unitario,
        } as OrdenCompraItem,
      ]);
    }
  }
  deleteItemOC(item: PedidoItem) {
    // Elimina el PedidoItem de itemsOC
    this.itemsOC.update((items) =>
      items ? items.filter((i) => i.id !== item.id) : items
    );
    // Elimina el OrdenCompraItem correspondiente de ordenCompraItems
    this.ordenCompraItems.update((items) =>
      items.filter((ocItem) => ocItem.pedido_item_id !== item.id)
    );
  }
  sumProductsOC() {
    return this.ordenCompraItems().reduce(
      (acc, item) => acc + (item.precio_unitario || 0),
      0
    );
  }
}
