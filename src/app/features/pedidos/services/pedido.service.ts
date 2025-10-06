import { computed, inject, Injectable, signal } from '@angular/core';
import { Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CategoriaService } from '../../productos/service/categoria-service.service';
import { ProductoService } from '../../productos/service/producto-service.service';
import { UnidadesMedidaService } from '../../productos/service/unidades-medida-service';
interface SolicitudState {
  solicitudes: Pedido[];
  loading: boolean;
  error: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class PedidoService extends StateService<Pedido> {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private _categoriaService = inject(CategoriaService);
  private _unidadMedidaService = inject(UnidadesMedidaService);
  private _productoService = inject(ProductoService);
  pedidos = signal<Pedido[]>([]);
  pedido = signal<Pedido | null>(null); //Pedido usuario
  pedidosUrgentes= signal<Pedido[]>([]);
  async getAllPedidos(): Promise<Pedido[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);

      const { data, error } = await this._supabaseClient
        .from('pedidos_con_responsable') // <-- Vista
        .select(
          `
        *,
        pedido_items (
          id,
          cantidad,
           pedido_id,
          estado,
          unidad_medida:unidad_medida_id (id, nombre),
          producto:productos ( id, nombre, descripcion,categoria:categoria_id (id, nombre,icon_text)),
          razon_pedido,
          unidad_medida_aceptada: unidad_medida_id_aceptada(id,nombre),
          cantidad_aceptada,
          link_referencia
        )
      `
        )
        .order('id', { ascending: false }); // <-- Opcional: ordena los pedidos del más nuevo al más viejo

      if (error) {
        console.error('Error cargando pedidos:', error);
        this.setError(true);
        return null;
      }

      if (data) {
        this.setItems(data as Pedido[]); // Hacemos un cast porque la vista tiene campos extra
        this.pedidos.set(data as Pedido[]);

        // La lógica de cargar categorías si están vacías sigue siendo correcta
        if (this._categoriaService.categorias().length === 0) {
          console.log('Cargando datos maestros...');
          await this._categoriaService.getAllCategorias();
          await this._unidadMedidaService.getAllMedidas();
        }
      }

      return data as Pedido[] | null;
    } catch (err) {
      console.error(err);
      this.setError(true);
      return null;
    } finally {
      this.setLoading(false);
    }
  }
  async getAllPedidosPendientes(): Promise<Pedido[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);

      const { data, error } = await this._supabaseClient
        .from('pedidos_con_responsable') // <-- Vista
        .select(
          `
        *,
        pedido_items (
          id,
          cantidad,
           pedido_id,
          estado,
          unidad_medida:unidad_medida_id (id, nombre),
          producto:productos ( id, nombre, descripcion,categoria:categoria_id (id, nombre,icon_text)),
          razon_pedido,
               unidad_medida_aceptada: unidad_medida_id_aceptada(id,nombre),
          cantidad_aceptada,
          link_referencia
        )
      `
        )
        .in('estado', ['En Proceso de Aprobacion', 'En Proceso de Entrega'])
        .order('id', { ascending: false }); // <-- Opcional: ordena los pedidos del más nuevo al más viejo

      if (error) {
        console.error('Error cargando pedidos:', error);
        this.setError(true);
        return null;
      }

      if (data) {
        this.setItems(data as Pedido[]); // Hacemos un cast porque la vista tiene campos extra
        this.pedidos.set(data as Pedido[]);

        // La lógica de cargar categorías si están vacías sigue siendo correcta
        if (this._categoriaService.categorias().length === 0) {
          console.log('Cargando datos maestros...');
          await this._categoriaService.getAllCategorias();
          await this._unidadMedidaService.getAllMedidas();
        }
      }

      return data as Pedido[] | null;
    } catch (err) {
      console.error(err);
      this.setError(true);
      return null;
    } finally {
      this.setLoading(false);
    }
  }
   async getAllPedidosUrgentes(): Promise<Pedido[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);

      const { data, error } = await this._supabaseClient
        .from('pedidos_con_responsable') // <-- Vista
        .select(
          `
        *,
        pedido_items (
          id,
          cantidad,
           pedido_id,
          estado,
          unidad_medida:unidad_medida_id (id, nombre),
          producto:productos ( id, nombre, descripcion,categoria:categoria_id (id, nombre,icon_text)),
          razon_pedido,
               unidad_medida_aceptada: unidad_medida_id_aceptada(id,nombre),
          cantidad_aceptada,
          link_referencia
        )
      `
        )
        .in('estado', ['En Proceso de Aprobacion', 'En Proceso de Entrega'])
        .or('urgente.eq.true,tiempo_item.eq.DEMORADO,tiempo_item.eq.POR VENCER')
        .order('id', { ascending: false }); // <-- Opcional: ordena los pedidos del más nuevo al más viejo

      if (error) {
        console.error('Error cargando pedidos:', error);
        this.setError(true);
        return null;
      }

      if (data) {
        this.setItems(data as Pedido[]); // Hacemos un cast porque la vista tiene campos extra
        this.pedidosUrgentes.set(data as Pedido[]);

        // La lógica de cargar categorías si están vacías sigue siendo correcta
        if (this._categoriaService.categorias().length === 0) {
          console.log('Cargando datos maestros... ',this.pedidosUrgentes());
          await this._categoriaService.getAllCategorias();
          await this._unidadMedidaService.getAllMedidas();
        }
      }

      return data as Pedido[] | null;
    } catch (err) {
      console.error(err);
      this.setError(true);
      return null;
    } finally {
      this.setLoading(false);
    }
  }
  async addPedido(
    pedidoData: Partial<Pedido>
  ): Promise<{ data: Pedido | null; error: any }> {
    const { data, error } = await this._supabaseClient
      .from('pedidos')
      .insert({
        ...pedidoData,
        responsable_id: '077cd8cc-72aa-4870-82f2-3ee619c24b12',
      })
      .select('*')
      .single();

    if (!error && data) {
      this.pedidos.update((currentPedidos) => [...currentPedidos, data]);
      this.addItem(data);
    }
    return { data, error };
  }

  async getPedidoById(
    pedidoid: number
  ): Promise<{ data: Pedido | null; error: any }> {
    const { data, error } = await this._supabaseClient
      .from('pedidos')
      .select(
        `
        *,
        pedido_items (
          id,
          cantidad,
          estado,
          unidad_medida:unidad_medida_id (id, nombre),
          producto:productos ( id, nombre, descripcion,categoria:categoria_id (id, nombre,icon_text)),
          razon_pedido,
          unidad_medida_aceptada: unidad_medida_id(id,nombre),
          cantidad_aceptada,
          link_referencia
        )
      `
      )
      .eq('id', pedidoid)
      .single();

    if (!error && data) {
      this.addItem(data);
      this.pedido.set(data);
    }
    return { data, error };
  }

  async addPedidoProducto(
    pedidoId: number,
    itemData: Partial<PedidoItem>
  ): Promise<{ data: PedidoItem | null; error: any }> {
    const dataToInsert = {
      ...itemData,
      pedido_id: pedidoId,
      estado: 'Pendiente',
    };

    // 1. INSERTAMOS EL DATO "PLANO". AHORA PEDIMOS TODA LA FILA DE VUELTA
    const { data: newItem, error } = await this._supabaseClient
      .from('pedido_items')
      .insert(dataToInsert)
      .select() // Obtenemos la fila recién insertada con sus IDs
      .single();

    if (error || !newItem) {
      console.error('Error al agregar producto al pedido:', error);
      return { data: null, error };
    }

    // --- LÓGICA DE HIDRATACIÓN MEJORADA ---

    //Logica de verificación si las señales estan cargadas
    if (this._categoriaService.categorias().length === 0) {
      console.log('La señal de categorías está vacía. Cargando datos...');
      await this._categoriaService.getAllCategorias();
    }
    // 1. Buscamos el producto "plano" en nuestra señal de productos.
    const productoPlano = this._productoService
      .productos()
      .find((p) => p.id === newItem.producto_id);

    // Si no encontramos el producto, algo está muy mal. Devolvemos un error.
    if (!productoPlano) {
      const err = {
        message: `Producto con ID ${newItem.producto_id} no encontrado en el estado local.`,
      };
      console.error(err.message);
      return { data: null, error: err };
    }

    // 2. Buscamos la categoría correspondiente a ese producto.
    const categoriaCompleta = this._categoriaService
      .categorias()
      .find((c) => c.id === productoPlano.categoria_id);
    console.log(categoriaCompleta);

    // 3. CONSTRUIMOS EL OBJETO 'producto' COMPLETO, AÑADIÉNDOLE LA CATEGORÍA.
    const productoCompleto = {
      ...productoPlano,
      categoria: categoriaCompleta, // <-- ¡Añadimos la categoría aquí!
    };

    // 4. Buscamos la unidad de medida completa.
    const unidadMedidaCompleta = this._unidadMedidaService
      .Unidadmedidas()
      .find((u) => u.id === newItem.unidad_medida_id);

    // 5. CONSTRUIMOS EL OBJETO FINAL 'itemDetallado' usando las piezas que ya preparamos.
    const itemDetallado: PedidoItem = {
      ...newItem,
      pedido_id: pedidoId,
      producto: productoCompleto, // Usamos el producto ya hidratado
      unidad_medida: unidadMedidaCompleta,
    } as PedidoItem;

    // 6. ACTUALIZAMOS LA SEÑAL con el objeto completamente detallado.
    this.pedido.update((currentPedido) => {
      if (currentPedido) {
        const updatedItems = [
          ...(currentPedido.pedido_items || []),
          itemDetallado,
        ];
        return { ...currentPedido, pedido_items: updatedItems } as Pedido;
      }
      return currentPedido;
    });

    return { data: itemDetallado, error: null };
  }
  async deleteProductoPedido(
    idProductoPedido: number
  ): Promise<{ error: any }> {
    const { error } = await this._supabaseClient
      .from('pedido_items')
      .delete()
      .eq('id', idProductoPedido);
    this.pedido.update((currentPedido) => {
      // Si no hay un pedido actual o el array de items está vacío, no hacemos nada
      if (!currentPedido || !currentPedido.pedido_items) {
        return currentPedido;
      }

      // Filtra el array para excluir el ítem eliminado
      const updatedItems = currentPedido.pedido_items.filter(
        (item) => item.id !== idProductoPedido
      );

      // Retorna el nuevo objeto Pedido con el array de items actualizado
      return {
        ...currentPedido,
        pedido_items: updatedItems,
      } as Pedido;
    });

    return { error: null };
  }
  async updatePedidoProducto(
    idProductoPedido: number,
    itemData: Partial<PedidoItem>
  ): Promise<{ data: PedidoItem | null; error: any }> {
    // Actualizamos en Supabase
    const { data: updatedItemPlano, error } = await this._supabaseClient
      .from('pedido_items')
      .update(itemData)
      .eq('id', idProductoPedido)
      .select()
      .maybeSingle(); // <-- Usamos maybeSingle() para evitar error si no hay filas

    if (error || !updatedItemPlano) {
      console.error('Error al actualizar el producto del pedido:', error);
      return {
        data: null,
        error: error ?? { message: 'No se encontró el item para actualizar' },
      };
    }

    // Buscamos el producto asociado
    const productoPlano = this._productoService
      .productos()
      .find((p) => p.id === updatedItemPlano.producto_id);

    const categoriaCompleta = productoPlano
      ? this._categoriaService
          .categorias()
          .find((c) => c.id === productoPlano.categoria_id)
      : null;

    const productoCompleto = productoPlano
      ? { ...productoPlano, categoria: categoriaCompleta }
      : null;

    // Buscamos la unidad de medida
    const unidadMedidaCompleta = this._unidadMedidaService
      .Unidadmedidas()
      .find((u) => u.id === updatedItemPlano.unidad_medida_id);

    // Construimos el objeto detallado
    const itemDetallado: PedidoItem = {
      ...updatedItemPlano,
      pedido_id: idProductoPedido,
      producto: productoCompleto,
      unidad_medida: unidadMedidaCompleta,
    } as PedidoItem;

    // Actualizamos la señal
    this.pedido.update((currentPedido) => {
      if (!currentPedido || !currentPedido.pedido_items) return currentPedido;

      const updatedItems = currentPedido.pedido_items.map((item) =>
        item.id === idProductoPedido ? itemDetallado : item
      );

      return {
        ...currentPedido,
        pedido_items: updatedItems,
      } as Pedido;
    });

    return { data: itemDetallado, error: null };
  }
  async finalizarPedido(
    pedido_id: number
  ): Promise<{ data: string | null; error: any }> {
    const { data: nuevoNumero, error } = await this._supabaseClient.rpc(
      'finalizar_pedido_en_creacion',
      {
        pedido_id_a_finalizar: pedido_id,
      }
    );
    if (error) {
      console.error('Error al finalizar el pedido:', error);
    } else if (nuevoNumero) {
      this.pedido.update((currentPedido) => {
        if (currentPedido && currentPedido.id === pedido_id) {
          return {
            ...currentPedido,
            numero_pedido: nuevoNumero,
            estado: 'En Proceso de Aprobacion',
          };
        }
        return currentPedido;
      });
    }

    return { data: nuevoNumero, error };
  }

  private actualizarItemEnSenal(updatedItem: PedidoItem, isAccepted: boolean) {
    // 1. ACTUALIZAR LA SEÑAL DEL PEDIDO INDIVIDUAL ('pedido')
    this.pedido.update((currentPedido) => {
      if (!currentPedido || !currentPedido.pedido_items) {
        if (currentPedido && isAccepted) {
          currentPedido.estado = 'En Proceso de Entrega';
        }
        return currentPedido;
      }

      const updatedItems = currentPedido.pedido_items.map((item) => {
        if (item.id === updatedItem.id) {
          return { ...item, ...updatedItem };
        }
        return item;
      });

      // Si se aceptó un item, actualiza el estado del pedido
      const nuevoEstado = isAccepted
        ? 'En Proceso de Entrega'
        : currentPedido.estado;

      return {
        ...currentPedido,
        pedido_items: updatedItems,
        estado: nuevoEstado,
      };
    });

    // 2. ACTUALIZAR LA SEÑAL DE LA LISTA DE PEDIDOS ('pedidos')
    this.pedidos.update((currentPedidos) => {
      return currentPedidos.map((p) => {
        if (p.id === updatedItem.pedido_id) {
          const updatedItems = p.pedido_items?.map((item) =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          );
          // Si se aceptó un item, actualiza el estado del pedido
          const nuevoEstado = isAccepted ? 'En Proceso de Entrega' : p.estado;
          return { ...p, pedido_items: updatedItems, estado: nuevoEstado };
        }
        return p;
      });
    });
  }
  async aceptarPedidoItem(
    pedidoItemId: number
  ): Promise<{ data: PedidoItem | null; error: any }> {
    // 1. ELIMINA el tipado genérico <PedidoItem, ...> de aquí
    const { data, error } = await this._supabaseClient
      .rpc('aceptar_pedido_item', {
        p_pedido_item_id: pedidoItemId,
      })
      .single();

    if (!error && data) {
      // 2. AÑADE el tipado aquí. 'data' es 'any', así que lo casteamos.
      this.actualizarItemEnSenal(data as PedidoItem, true);
    }

    // 3. Devuelve el dato casteado también.
    return { data: data as PedidoItem | null, error };
  }

  async rechazarPedidoItem(
    pedidoItemId: number,
    justificacion: string
  ): Promise<{ data: PedidoItem | null; error: any }> {
    // 1. ELIMINA el tipado genérico
    const { data, error } = await this._supabaseClient
      .rpc('rechazar_pedido_item', {
        p_pedido_item_id: pedidoItemId,
        p_justificacion: justificacion,
      })
      .single();

    if (!error && data) {
      // 2. AÑADE el tipado aquí
      this.actualizarItemEnSenal(data as PedidoItem, false);
    }

    // 3. Devuelve el dato casteado
    return { data: data as PedidoItem | null, error };
  }

  async aceptarParcialPedidoItem(
    pedidoItemId: number,
    cantidadAceptada: number,
    unidadMedidaIdAceptada: number
  ): Promise<{ data: PedidoItem | null; error: any }> {
    const { data, error } = await this._supabaseClient
      .rpc('aceptar_parcial_pedido_item', {
        // Pasamos todos los parámetros que la función SQL espera
        p_pedido_item_id: pedidoItemId,
        p_cantidad_aceptada: cantidadAceptada,
        p_unidad_medida_id_aceptada: unidadMedidaIdAceptada,
      })
      .single();

    if (!error && data) {
      // La función 'actualizarItemEnSenal' que ya tienes funcionará perfectamente aquí
      this.actualizarItemEnSenal(data as PedidoItem, true);
    }

    return { data: data as PedidoItem | null, error };
  }
}
