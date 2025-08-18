import { inject, Injectable } from '@angular/core';
import { Producto } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ProductoService extends StateService<Producto> {
  private _supabaseClient = inject(SupabaseService).supabaseClient;

  async addPedido(
    productoData: Partial<Producto>
  ): Promise<{ data: Producto | null; error: any }> {
    const { data, error } = await this._supabaseClient
      .from('productos')
      .insert({
        ...productoData,
        responsable_id: '077cd8cc-72aa-4870-82f2-3ee619c24b12',
      })
      .select()
      .single();

    if (!error && data) this.addItem(data);
    return { data, error };
  }
}
