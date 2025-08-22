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
  async getAllPedidos(): Promise<Pedido[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);

      const { data, error } = await this._supabaseClient
        .from('pedidos')
        .select(
          `
          *
        `
        )
        .returns<Pedido[]>();

      if (error) {
        console.error(error);
        this.setError(true);
        return null;
      }

      if (data) this.setItems(data);
      this.pedidos.set(data);
      this._categoriaService.getAllCategorias();
      return data;
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
      .select()
      .single();

    if (!error && data) {
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
          unidad_medida:unidad_medida_id (id, nombre),
          producto:productos ( id, nombre, descripcion,categoria:categoria_id (id, nombre,icon_text))
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
    console.log(this._categoriaService.categorias());
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
}
