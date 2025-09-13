import { Injectable, signal } from '@angular/core';
import { OrdenCompra, OrdenCompraItem, Pedido, PedidoItem } from 'src/app/core/models/database.type';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {
  itemsOC= signal<PedidoItem[] | null>(null);
  ordenCompraItems= signal<OrdenCompraItem[]>([]);
  ordenCompra= signal<OrdenCompra | null>(null)
  
  addItemOC(newItem: PedidoItem,new_precio_unitario:number){ {
    this.itemsOC.update(items => items ? [...items, newItem] : [newItem]);
    this.ordenCompraItems.update(items => [...items, { pedido_item_id: newItem.id, pedido_items: newItem,precio_unitario: new_precio_unitario } as OrdenCompraItem]);
  }

}
}