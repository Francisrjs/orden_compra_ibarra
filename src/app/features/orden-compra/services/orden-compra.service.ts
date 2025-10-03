import { inject, Injectable, signal } from '@angular/core';
import {
  OrdenCompra,
  OrdenCompraItem,
  Pedido,
  PedidoItem,
} from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class OrdenCompraService extends StateService<OrdenCompra>{
  itemsOC = signal<PedidoItem[] >([]);
  ordenCompraItems = signal<OrdenCompraItem[]>([]);
  ordenesCompra = signal<OrdenCompra[]>([]);
  private _supabaseClient = inject(SupabaseService).supabaseClient;

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
  async createOrdenCompra(ordenCompraData: Partial<OrdenCompra>) {
  const { data, error } = await this._supabaseClient
    .from('orden_compra')
    .insert({
     ... ordenCompraData,
     jefe_compra_id: '077cd8cc-72aa-4870-82f2-3ee619c24b12',
    })
    .select('*')
    .single();
   if (!error && data) {
      this.ordenesCompra.update((currentOrdenes) => [...currentOrdenes, data]);
      this.addItem(data);
    }
  return { data, error };
}
  async addItemToOrdenCompra(orden_compra_id: number) {
    try {
      const currentItems = this.ordenCompraItems();
      
      if (currentItems.length === 0) {
        return { data: null, error: { message: 'No hay items para agregar' } };
      }

      // ✅ Mapear correctamente los campos para la tabla orden_compra_items
    const itemsData = currentItems.map(item => ({
  orden_compra_id: orden_compra_id,
  pedido_item_id: item.pedido_item_id,
  precio_unitario: item.precio_unitario,
  cantidad: item.cantidad || 1,
  subtotal: (item.precio_unitario || 0) * (item.cantidad || 1),
}));

      const { data, error } = await this._supabaseClient
        .from('orden_compra_items')
        .insert(itemsData)
        .select('*');

      if (!error && data) {
        // ✅ Actualizar la signal con los datos reales de la DB
        this.ordenCompraItems.set(data);
      }

      return { data, error };
    } catch (err) {
      console.error('Error agregando items a orden de compra:', err);
      return { data: null, error: err };
    }
  }

  async getAllOC(){
    try{
 const {data, error} = await this._supabaseClient
  .from('orden_compra')
  .select(`
    *,
    orden_compra_items (
      id,
      orden_compra_id,
      precio_unitario,
      cantidad,
      subtotal,
      pedido_item_id (
        id,
        productos (
          id,
          nombre,
          categoria:categoria_id(id, nombre, icon_text)
        ),
        estado,
        pedido: pedidos(id,numero_pedido)
      )
    ),
      proveedor_id (id,nombre)   
  `);
     if (!error && data) {
        // ✅ Actualizar la signal con los datos reales de la DB
        this.ordenesCompra.set(data);
        console.log("Ordenes: ",data)
      }

      return { data, error };
    } catch (err) {
      console.error('Error agregando items a orden de compra:', err);
      return { data: null, error: err };
    } 
  }
  clearOrderData() {
    this.itemsOC.set([]);
    this.ordenCompraItems.set([]);
  }

  // ✅ Método para obtener el total con formato
  getTotalFormateado(): string {
    const total = this.sumProductsOC();
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(total);
  }

  // ✅ Método para validar si se puede crear la OC
  canCreateOrder(): boolean {
    return this.itemsOC().length > 0;
  }
}
