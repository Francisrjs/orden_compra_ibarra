import { inject, Injectable, signal } from '@angular/core';
import { Proveedor } from '../../../core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class ProveedorService extends StateService<Proveedor> {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  public proveedores = signal<Proveedor[]>([]);
  async getAllProveedores(): Promise<Proveedor[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);
      const { data, error } = await this._supabaseClient
        .from('proveedores') // <-- Vista
        .select(
          `
        *
      `
        )
        .order('id', { ascending: false });

      if (error) {
        console.error('Error cargando Proveedores:', error);
        this.setError(true);
        return null;
      }

      if (data) {
        this.setItems(data as Proveedor[]); // Hacemos un cast porque la vista tiene campos extra
        this.proveedores.set(data as Proveedor[]);
      }

      return data as Proveedor[] | null;
    } catch (err) {
      console.error(err);
      this.setError(true);
      return null;
    } finally {
      this.setLoading(false);
    }
  }
}
