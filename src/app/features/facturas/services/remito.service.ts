import { inject, Injectable, signal } from '@angular/core';
import { Remito } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RemitoService extends StateService<Remito> {
  remitos = signal<Remito[]>([]);
  remitosEliminados=signal<number[]>([])
  private _supabaseClient = inject(SupabaseService).supabaseClient;

  addItemRemito(item: Remito) {
    this.remitos.update(remitos => [...remitos, item]);
  }
  deleteItemRemito(item: Remito) {
    if (item.id && item.id > 0 &&  item.creado){
      this.remitosEliminados.update(ids=> [...ids,item.id!])
    } 
    
    this.remitos.update((items) =>
        items ? items.filter((i) => i.id !== item.id) : items
      );
      
    }
    async loadRemitosByFactura(factura_id: number) {
    try {
      const { data, error } = await this._supabaseClient
        .from('remitos')
        .select('*')
        .eq('factura_id', factura_id);

      if (!error && data) {
        this.remitos.set(data);
        this.remitosEliminados.set([]); // Limpiamos los eliminados
      }

      return { data, error };
    } catch (err) {
      console.error('Error cargando remitos:', err);
      return { data: null, error: err };
    }
  }
  /**
   * Guarda los cambios de remitos (crear nuevos, eliminar marcados)
   * @param factura_id ID de la factura
   */
  async saveRemitosChanges(factura_id: number) {
    try {
      const resultados = {
        remitosCreados: null as any,
        remitosEliminados: null as any,
        errores: [] as any[]
      };

      // 1. Eliminar los remitos marcados
      const idsAEliminar = this.remitosEliminados();
      if (idsAEliminar.length > 0) {
        const { data: deletedData, error: deleteError } = await this._supabaseClient
          .from('remitos')
          .delete()
          .in('id', idsAEliminar)
          .select();

        if (deleteError) {
          resultados.errores.push({ tipo: 'eliminacion', error: deleteError });
        } else {
          resultados.remitosEliminados = deletedData;
        }
      }

      // 2. Crear los remitos nuevos (los que tienen ID temporal)
      const remitosNuevos = this.remitos().filter(
        (r) => r.id && r.id.toString().startsWith('temp-')
      );

      if (remitosNuevos.length > 0) {
        const remitosData = remitosNuevos.map((item) => ({
          factura_id: factura_id,
          numero_remito: item.numero_remito,
          fecha: item.fecha instanceof Date 
            ? item.fecha.toISOString().split('T')[0] // Formato YYYY-MM-DD
            : item.fecha
        }));

        const { data: insertedData, error: insertError } = await this._supabaseClient
          .from('remitos')
          .insert(remitosData)
          .select('*');

        if (insertError) {
          resultados.errores.push({ tipo: 'creacion', error: insertError });
        } else {
          resultados.remitosCreados = insertedData;
        }
      }

      // 3. Recargar todos los remitos de la factura para sincronizar
      if (resultados.errores.length === 0) {
        await this.loadRemitosByFactura(factura_id);
      }

      return {
        success: resultados.errores.length === 0,
        data: resultados,
        error: resultados.errores.length > 0 ? resultados.errores : null
      };
    } catch (err) {
      console.error('Error guardando cambios de remitos:', err);
      return { success: false, data: null, error: err };
    }
  }
  clearRemitos() {
    this.remitos.set([]);
    this.remitosEliminados.set([]);
  }
}
