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
        console.log(this.proveedores());
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
  async createProveedor(proveedor: Proveedor): Promise<Proveedor | null> {
    try {
      this.setLoading(true);
      this.setError(false);
      const { data, error } = await this._supabaseClient
        .from('proveedores')
        .insert(proveedor)
        .select()
        .single();
      if (error) {
        console.error('Error creando Proveedor:', error);
        this.setError(true);
        return null;
      }
      this.setItems([data as Proveedor]);
      this.proveedores.update((currentProveedores) => [
        ...currentProveedores,
        data,
      ]);
      return data as Proveedor;
    } catch (err) {
      console.error(err);
      this.setError(true);
      return null;
    } finally {
      this.setLoading(false);
    }
  }
  async updateProveedor(proveedorUpdate: Proveedor): Promise<Proveedor | null> {
    try {
      this.setLoading(true);
      this.setError(false);
      const { data, error } = await this._supabaseClient
        .from('proveedores')
        .update(proveedorUpdate)
        .eq('id', proveedorUpdate.id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando Proveedor:', error);
        this.setError(true);
        return null;
      }
      this.setItems([data as Proveedor]);
      this.proveedores.update((currentProveedores) =>
        currentProveedores.map((p) => (p.id === proveedorUpdate.id ? data : p))
      );
      return data as Proveedor;
    } catch (err) {
      console.error(err);
      this.setError(true);
      return null;
    } finally {
      this.setLoading(false);
    }
  }
}
