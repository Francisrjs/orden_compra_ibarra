import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Factura,
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
export class OrdenCompraService extends StateService<OrdenCompra> {
  itemsOC = signal<PedidoItem[]>([]);
  ordenCompraItems = signal<OrdenCompraItem[]>([]);
  ordenesCompra = signal<OrdenCompra[]>([]);
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  public ordenCompra = signal<OrdenCompra | null>(null);
  ordenCompraItemsSignal = computed(
    () => this.ordenCompra()?.orden_compra_items ?? []
  );

  facturas = computed(() => this.ordenCompra()?.facturas ?? []);

  presupuestos = computed(() => this.ordenCompra()?.presupuesto ?? []);
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
        ...ordenCompraData,
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
      const itemsData = currentItems.map((item) => ({
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
  async getOrdenDeCompra(item: PedidoItem) {
    if (this.ordenesCompra().length === 0) this.getAllItemsEnvio();
    return this.ordenCompraItems().filter((p) => p.pedido_item_id == item.id);
  }
  async getAllItemsEnvio() {
    try {
      const { data, error } = await this._supabaseClient.from(
        'orden_compra_items_envio'
      ).select(`
    *,
    orden_compra_id(
    id,numero_oc  
    )
  `);
      if (!error && data) {
        // ✅ Actualizar la signal con los datos reales de la DB
        this.ordenCompraItems.set(data);
        console.log('Envio: ', data);
      }

      return { data, error };
    } catch (err) {
      console.error('Error agregando items a orden de compra:', err);
      return { data: null, error: err };
    }
  }

  async getAllOC() {
    try {
      const { data, error } = await this._supabaseClient.from('orden_compra')
        .select(`
    *,
    
      proveedor_id (id,nombre)   
  `);
      if (!error && data) {
        // ✅ Actualizar la signal con los datos reales de la DB
        this.ordenesCompra.set(data);
        console.log('Ordenes: ', data);
      }

      return { data, error };
    } catch (err) {
      console.error('Error agregando items a orden de compra:', err);
      return { data: null, error: err };
    }
  }
  async getOCById(
    oc_id: number
  ): Promise<{ data: OrdenCompra | null; error: any }> {
    try {
      const { data, error } = await this._supabaseClient
        .from('orden_compra')
        .select(
          `
  *,
  orden_compra_items (
    id,
    orden_compra_id,
    precio_unitario,
    cantidad,
    subtotal,
    recibido,
    factura_id(id,numero_factura),
    pedido_item_id (
      id,
      productos (
        id,
        nombre,
        categoria:categoria_id(id, nombre, icon_text)
      ),
      estado,
      unidad_medida_id(id,nombre),
      pedido: pedidos(id,numero_pedido)
      
      
    )
  ),
    proveedor_id (id,nombre,cuit,email),
    jefe_compra_id,
    facturas (id,fecha,numero_factura,importe,fecha_pago, remitos(id,numero_remito,fecha)),
    presupuesto_item(
        id,
      productos (
        id,
        nombre,
        categoria:categoria_id(id, nombre, icon_text)
      ),
      unidad_medida_id(id,nombre)
      )
`
        )
        .eq('id', oc_id)
        .single();

      if (!error && data) {
        // ✅ Actualizar la signal de la orden individual
        this.ordenCompra.set(data);

        // ✅ Actualizar también en la lista de órdenes si existe
        this.ordenesCompra.update((ordenes) => {
          const index = ordenes.findIndex((o) => o.id === oc_id);
          if (index !== -1) {
            const newOrdenes = [...ordenes];
            newOrdenes[index] = data;
            return newOrdenes;
          }
          return ordenes;
        });

        console.log('Orden de compra cargada:', data);
      }

      return { data, error };
    } catch (err) {
      console.error('Error obteniendo orden de compra:', err);
      return { data: null, error: err };
    }
  }
  clearOrderData() {
    this.itemsOC.set([]);
    this.ordenCompraItems.set([]);
  }

  /**
   * Limpia la signal de orden individual
   */
  clearOrdenCompra() {
    this.ordenCompra.set(null);
  }

  // ✅ Método para obtener el total con formato
  getTotalFormateado(): string {
    const total = this.sumProductsOC();
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(total);
  }

  // ✅ Método para validar si se puede crear la OC
  canCreateOrder(): boolean {
    return this.itemsOC().length > 0;
  }
  async itemRecibido(
    item: OrdenCompraItem
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await this._supabaseClient
        .from('orden_compra_items')
        .update({ recibido: true })
        .eq('id', item.id)
        .select()
        .single();

      if (!error && data) {
        // ✅ Actualizar la signal de la orden individual
        this.ordenCompra.update((ordenActual) => {
          if (!ordenActual) return ordenActual;

          // Crear un nuevo array completo para forzar la detección de cambios
          const nuevosItems =
            ordenActual.orden_compra_items?.map((i) =>
              i.id === item.id ? { ...i, recibido: true } : { ...i }
            ) ?? [];

          return {
            ...ordenActual,
            orden_compra_items: nuevosItems,
          };
        });
      }

      return { data, error };
    } catch (err) {
      console.error('Error marcando item como recibido:', err);
      return { data: null, error: err };
    }
  }
  async editPriceItem(
    item: OrdenCompraItem,
    newPrice: number
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await this._supabaseClient
        .from('orden_compra_items')
        .update({ subtotal: newPrice })
        .eq('id', item.id)
        .select()
        .single();

      if (!error && data) {
        // ✅ Actualizar la signal de la orden individual
        this.ordenCompra.update((ordenActual) => {
          if (!ordenActual) return ordenActual;

          // Crear un nuevo array completo para forzar la detección de cambios
          const nuevosItems =
            ordenActual.orden_compra_items?.map((i) =>
              i.id === item.id ? { ...i, subtotal: newPrice } : { ...i }
            ) ?? [];

          return {
            ...ordenActual,
            orden_compra_items: nuevosItems,
          };
        });
      }

      return { data, error };
    } catch (err) {
      console.error('Error marcando item como recibido:', err);
      return { data: null, error: err };
    }
  }
  async actualizarFechaPagoFactura(itemId: number, newDate: string | Date) {
    try {
      // Formatear a YYYY-MM-DD para evitar problemas de zona horaria con columnas tipo DATE
      let fechaFormatted: string;
      if (newDate instanceof Date) {
        const y = newDate.getFullYear();
        const m = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(newDate.getDate()).padStart(2, '0');
        fechaFormatted = `${y}-${m}-${d}`;
      } else {
        fechaFormatted = newDate;
      }

      const { data, error } = await this._supabaseClient
        .from('facturas')
        .update({ fecha_pago: fechaFormatted })
        .eq('id', itemId)
        .select()
        .single();

      if (!error && data) {
        // Para el estado local (TypeScript), conservar un objeto Date
        const valueDate = new Date(fechaFormatted);
        this.ordenCompra.update((ordenActual) => {
          if (!ordenActual) return ordenActual;

          const nuevasFacturas =
            ordenActual.facturas?.map((factura) =>
              factura.id === itemId
                ? {
                    ...factura,
                    fecha_pago: valueDate,
                  }
                : { ...factura }
            ) ?? [];

          return {
            ...ordenActual,
            facturas: nuevasFacturas,
          };
        });
      }

      return { data, error };
    } catch (err) {
      console.error('Error actualizando fecha de pago de factura:', err);
      return { data: null, error: err };
    }
  }

  async relacionarItemConFactura(itemId: number, factura: Factura) {
    try {
      const { data, error } = await this._supabaseClient
        .from('orden_compra_items')
        .update({ factura_id: factura.id })
        .eq('id', itemId)
        .select()
        .single();

      if (!error && data) {
        // ✅ Actualizar la signal de la orden individual
        this.ordenCompra.update((ordenActual) => {
          if (!ordenActual) return ordenActual;

          // Crear un nuevo array completo para forzar la detección de cambios
          const nuevosItems =
            ordenActual.orden_compra_items?.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    factura_id: factura as Factura, // Cast para evitar error de tipos
                  }
                : { ...i }
            ) ?? [];

          return {
            ...ordenActual,
            orden_compra_items: nuevosItems,
          };
        });
      }

      return { data, error };
    } catch (err) {
      console.error('Error relacionando item con factura:', err);
      return { data: null, error: err };
    }
  }
}
