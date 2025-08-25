import { inject, Injectable, signal } from '@angular/core';
import { Producto, UnidadMedida } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CategoriaService } from './categoria-service.service';

@Injectable({
  providedIn: 'root',
})
export class ProductoService extends StateService<Producto> {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private _categoriaService = inject(CategoriaService);
  productos = signal<Producto[]>([]);

  async addProducto(
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

    if (!error && data) {
      this.addItem(data);
      this.productos.update((newProducto) => [...newProducto, data]);
    }
    return { data, error };
  }
  async getAllProductos(): Promise<Producto[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);
      const { data, error } = await this._supabaseClient
        .from('productos')
        .select(`*`)
        .returns<Producto[]>();
      if (error) {
        console.error(error);
        this.setError(true);
        return null;
      }

      if (data) {
        this.setItems(data);
        this.productos.set(data);
        if (this._categoriaService.categorias().length === 0) {
          console.log('La señal de categorías está vacía. Cargando datos...');
          await this._categoriaService.getAllCategorias();
        }
      }
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
