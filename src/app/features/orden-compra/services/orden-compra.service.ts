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
import { PedidoService } from '../../pedidos/services/pedido.service';

@Injectable({
  providedIn: 'root',
})
export class OrdenCompraService extends StateService<OrdenCompra> {
  itemsOC = signal<PedidoItem[]>([]);
  ordenCompraItems = signal<OrdenCompraItem[]>([]);
  ordenesCompra = signal<OrdenCompra[]>([]);
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private _pedidoService = inject(PedidoService);
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
      const { data: ordenData, error: ordenError } = await this._supabaseClient
        .from('orden_compra_items')
        .update({ recibido: true })
        .eq('id', item.id)
        .select()
        .single();

      if (ordenError) {
        return { data: null, error: ordenError };
      }

      const { data: pedidoData, error: pedidoError } =
        await this._supabaseClient
          .from('pedido_items')
          .update({ estado: 'Cerrado' })
          .eq('id', item.pedido_item_id)
          .select()
          .single();

      if (pedidoError) {
        console.warn('Error actualizando estado del pedido item:', pedidoError);
        // No retornamos error aquí porque el item ya se marcó como recibido
      }

      if (ordenData) {
        this.ordenCompra.update((ordenActual) => {
          if (!ordenActual) return ordenActual;

          // Crear un nuevo array completo para forzar la detección de cambios
          const nuevosItems =
            ordenActual.orden_compra_items?.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    recibido: true,
                    // También actualizar el estado del pedido_item anidado si existe
                    pedido_item_id:
                      i.pedido_item_id && typeof i.pedido_item_id === 'object'
                        ? { ...(i.pedido_item_id as any), estado: 'Cerrado' }
                        : i.pedido_item_id,
                  }
                : { ...i }
            ) ?? [];

          return {
            ...ordenActual,
            orden_compra_items: nuevosItems,
          };
        });
      }

      return { data: ordenData, error: null };
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
  async finalizarOC(orden_compra_id: number) {
    try {
      const { data, error } = await this._supabaseClient
        .from('orden_compra')
        .update({ estado: 'FINALIZADA' })
        .eq('id', orden_compra_id)
        .select()
        .single();

      if (!error && data) {
        this.ordenCompra.update((ordenActual) => {
          if (!ordenActual) return ordenActual;

          return {
            ...ordenActual,
            estado: 'FINALIZADA',
          };
        });
        this.ordenesCompra.update((ordenes) => {
          const index = ordenes.findIndex((o) => o.id === orden_compra_id);
          if (index !== -1) {
            const newOrdenes = [...ordenes];
            newOrdenes[index] = { ...newOrdenes[index], estado: 'FINALIZADA' };
            return newOrdenes;
          }
          return ordenes;
        });
      }

      return { data, error };
    } catch (err) {
      console.error('Error cerrando orden de compra:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Crea una OC tipo "abierta": primero crea un pedido temporal,
   * luego los pedido_items y finalmente los orden_compra_items
   */
  async createOrdenCompraAbierta(ordenCompraData: Partial<OrdenCompra>) {
    try {
      // Verificar que tenemos items para procesar
      const currentItems = this.itemsOC();
      if (currentItems.length === 0) {
        return {
          data: null,
          error: { message: 'No hay items para agregar a la OC abierta' },
        };
      }

      // 1. Crear pedido temporal usando el servicio existente (con campos correctos)
      const pedidoData = {
        titulo: 'Pedido temporal para OC Abierta',
        descripcion: `Pedido temporal para OC Abierta - ${new Date().toLocaleDateString(
          'es-AR'
        )}`,
        estado: 'En Proceso de Entrega' as const,
        plazo_entrega: new Date().toISOString().split('T')[0], // ✅ CAMPO CORRECTO
        urgente: false,
        area: 'LOGISTICA' as const,
      };

      console.log('🔄 Creando pedido temporal con datos:', pedidoData);

      const { data: pedidoTemporal, error: pedidoError } =
        await this._pedidoService.addPedido(pedidoData);

      if (pedidoError || !pedidoTemporal) {
        console.error('❌ Error creando pedido temporal:', pedidoError);
        return { data: null, error: pedidoError };
      }

      console.log('✅ Pedido temporal creado:', pedidoTemporal);

      // 2. Crear los pedido_items directamente (el método del PedidoService fuerza estado 'Pendiente')
      const pedidoItemsCreados: PedidoItem[] = [];

      for (const item of currentItems) {
        const itemData = {
          pedido_id: pedidoTemporal.id,
          producto_id: item.producto?.id || item.producto_id,
          cantidad: item.cantidad || 1,
          unidad_medida_id: item.unidad_medida_id || item.unidad_medida?.id,
          razon_pedido:
            item.razon_pedido || 'Item para orden de compra abierta',
          estado: 'Aprobado', // ✅ Crear directamente como aprobado
        };

        console.log('🔄 Creando pedido item directamente:', itemData);

        const { data: nuevoItem, error: itemError } = await this._supabaseClient
          .from('pedido_items')
          .insert(itemData)
          .select('*')
          .single();

        if (itemError || !nuevoItem) {
          console.error('❌ Error creando pedido item:', itemError);
          // Si falla, eliminar el pedido temporal (los items se eliminan en cascada)
          await this._supabaseClient
            .from('pedidos')
            .delete()
            .eq('id', pedidoTemporal.id);
          return { data: null, error: itemError };
        }

        console.log('✅ Pedido item creado:', nuevoItem);
        pedidoItemsCreados.push(nuevoItem as PedidoItem);
      }

      // 3. Crear la orden de compra
      const ocData = {
        ...ordenCompraData,
        jefe_compra_id: '077cd8cc-72aa-4870-82f2-3ee619c24b12',
      };

      console.log('🔄 Creando orden de compra:', ocData);

      const { data: newOrdenCompra, error: ocError } =
        await this._supabaseClient
          .from('orden_compra')
          .insert(ocData)
          .select('*')
          .single();

      if (ocError || !newOrdenCompra) {
        console.error('❌ Error creando orden de compra:', ocError);
        // Si falla, eliminar el pedido temporal y sus items
        await this._supabaseClient
          .from('pedidos')
          .delete()
          .eq('id', pedidoTemporal.id);
        return { data: null, error: ocError };
      }

      console.log('✅ Orden de compra creada:', newOrdenCompra);

      // 4. Crear los orden_compra_items usando los pedido_items recién creados
      const ordenCompraItems = this.ordenCompraItems();
      const ocItemsData = pedidoItemsCreados.map((pedidoItem, index) => {
        const ocItem = ordenCompraItems[index];
        return {
          orden_compra_id: newOrdenCompra.id,
          pedido_item_id: pedidoItem.id,
          precio_unitario: ocItem?.precio_unitario || 0,
          cantidad: pedidoItem.cantidad || 1,
          subtotal: (ocItem?.precio_unitario || 0) * (pedidoItem.cantidad || 1),
          recibido: false, // ✅ Por defecto no recibido
        };
      });

      console.log('🔄 Creando orden_compra_items:', ocItemsData);

      const { data: ocItemsCreados, error: ocItemsError } =
        await this._supabaseClient
          .from('orden_compra_items')
          .insert(ocItemsData)
          .select('*');

      if (ocItemsError) {
        console.error('❌ Error creando orden_compra_items:', ocItemsError);
        // Si falla, eliminar todo lo creado
        await this._supabaseClient
          .from('orden_compra')
          .delete()
          .eq('id', newOrdenCompra.id);
        await this._supabaseClient
          .from('pedidos')
          .delete()
          .eq('id', pedidoTemporal.id);
        return { data: null, error: ocItemsError };
      }

      console.log('✅ Orden_compra_items creados:', ocItemsCreados);

      // 5. Actualizar señales locales
      if (newOrdenCompra) {
        this.ordenesCompra.update((currentOrdenes) => [
          ...currentOrdenes,
          newOrdenCompra,
        ]);
        this.addItem(newOrdenCompra);
      }

      if (ocItemsCreados) {
        this.ordenCompraItems.set(ocItemsCreados);
      }

      // 6. Limpiar las señales temporales
      this.clearOrderData();

      console.log('🎉 OC Abierta creada exitosamente!');
      return { data: newOrdenCompra, error: null };
    } catch (err) {
      console.error('💥 Error general creando orden de compra abierta:', err);
      return { data: null, error: err };
    }
  }
}
