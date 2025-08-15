import { computed, inject, Injectable, signal } from '@angular/core';
import { Pedido } from 'src/app/core/models/database.type';
import { SupabaseService } from 'src/app/core/services/supabase.service';
interface SolicitudState {
  solicitudes: Pedido[];
  loading: boolean;
  error: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private _state = signal<SolicitudState>({
    solicitudes: [],
    loading: false,
    error: false,
  });
  solicitudes = computed(() => this._state().solicitudes);
  loading = computed(() => this._state().loading);
  error = computed(() => this._state().error);
  async getAllPedidos(): Promise<Pedido[] | null> {
    try {
      this._state.update((s) => ({ ...s, loading: true, error: false }));

      const { data, error } = await this._supabaseClient
        .from('pedidos')
        .select(
          `
          *
        `
        )
        .returns<Pedido[]>();

      if (error) {
        console.error('Supabase error:', error);
        this._state.update((s) => ({ ...s, error: true }));
        return null;
      }

      if (data) {
        // actualizo la propiedad correcta
        this._state.update((s) => ({ ...s, solicitudes: data }));
      }

      return data ?? null;
    } catch (err) {
      console.error('getAllPedidos catch:', err);
      this._state.update((s) => ({ ...s, error: true }));
      return null;
    } finally {
      this._state.update((s) => ({ ...s, loading: false }));
    }
  }
}
