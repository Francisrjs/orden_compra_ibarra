import { computed, inject, Injectable, signal } from '@angular/core';
import { Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
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

    if (!error && data) this.addItem(data);
    return { data, error };
  }

  async getPedidoById(
    pedidoid: number
  ): Promise<{ data: Pedido | null; error: any }> {
    const { data, error } = await this._supabaseClient
      .from('pedidos')
      .select('*')
      .eq('id', pedidoid)
      .single();

    if (!error && data) this.addItem(data);
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
    }

    // Nota: Aquí no actualizamos el estado general de pedidos,
    // ya que esto es un detalle de un pedido específico.
    return { data, error };
  }
}
