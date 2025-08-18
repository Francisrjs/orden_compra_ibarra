import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Producto, UnidadMedida } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class UnidadesMedidaService extends StateService<UnidadMedida> {
  _supabaseClient = inject(SupabaseService).supabaseClient;
  async getAllMedidas(): Promise<UnidadMedida[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);

      const { data, error } = await this._supabaseClient
        .from('unidades_medida')
        .select(
          `
            *
          `
        )
        .returns<UnidadMedida[]>();

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
}
