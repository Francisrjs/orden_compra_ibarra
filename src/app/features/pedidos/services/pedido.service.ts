import { computed, inject, Injectable, signal } from '@angular/core';
import { Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CategoriaService } from '../../productos/service/categoria-service.service';
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
    // Preparamos el objeto a insertar, asegurando que incluya el pedido_id
    // y un estado inicial por defecto.
    const dataToInsert = {
      ...itemData,
      pedido_id: pedidoId,
      estado: 'Pendiente', // Todo nuevo item entra en estado 'Pendiente' por defecto
    };

    const { data, error } = await this._supabaseClient
      .from('pedido_items') // La tabla correcta es 'pedido_items'
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error al agregar producto al pedido:', error);
      return { data, error };
    }

    this.pedido.update((currentPedido) => {
      //Si existe el pedido y la info
      if (currentPedido && data) {
        return {
          ...currentPedido,
          pedido_items: [...(currentPedido?.pedido_items ?? []), data],
        } as Pedido;
      }
      // Si no hay pedido actual
      return currentPedido;
    });
    return { data, error };
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
