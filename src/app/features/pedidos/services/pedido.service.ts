import { computed, inject, Injectable, signal } from '@angular/core';
import { Pedido } from 'src/app/core/models/database.type';
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
}
