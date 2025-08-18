import { computed, inject, Injectable, signal } from '@angular/core';
import { Categoria } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService extends StateService<Categoria> {
  private _supabaseClient = inject(SupabaseService).supabaseClient;

  async getAllCategorias(): Promise<Categoria[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);

      const { data, error } = await this._supabaseClient
        .from('categorias')
        .select('*')
        .returns<Categoria[]>();

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
