import { inject, Injectable, signal } from '@angular/core';
import { Presupuesto } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CategoriaService } from '../productos/service/categoria-service.service';
import { UnidadesMedidaService } from '../productos/service/unidades-medida-service';
import { ProductoService } from '../productos/service/producto-service.service';
import { CurrencyPipe } from '@angular/common';
import { Console } from 'console';

@Injectable({
  providedIn: 'root',
})
export class PresupuestoService extends StateService<Presupuesto> {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private _categoriaService = inject(CategoriaService);
  private _unidadMedidaService = inject(UnidadesMedidaService);
  private _productoService = inject(ProductoService);
  presupuestos = signal<Presupuesto[]>([]);
  presupuestoAsignados= signal<Presupuesto[]>([]);
  async getAllPresupuestos(): Promise<Presupuesto[] | null> {
    try {
      this.setLoading(true);
      this.setError(false);

      const { data, error } = await this._supabaseClient
        .from('presupuesto_item') // <-- Vista
        .select(
          `
          *,
          productos (
            id,
           nombre
          ),
          unidades_medida (
          id,
          nombre
          ),
          proveedores (
          id,
          nombre
          )
        `
        )
        .order('id', { ascending: false }); // <-- Opcional: ordena los pedidos del más nuevo al más viejo

      if (error) {
        console.error('Error cargando pedidos:', error);
        this.setError(true);
        return null;
      }

      if (data) {
        this.setItems(data as Presupuesto[]); // Hacemos un cast porque la vista tiene campos extra
        this.presupuestos.set(data as Presupuesto[]);

        // La lógica de cargar categorías si están vacías sigue siendo correcta
        if (this._categoriaService.categorias().length === 0) {
          console.log('Cargando datos maestros...');
          await this._categoriaService.getAllCategorias();
          await this._unidadMedidaService.getAllMedidas();
        }
      }

      return data as Presupuesto[] | null;
    } catch (err) {
      console.error(err);
      this.setError(true);
      return null;
    } finally {
      this.setLoading(false);
    }
  }
  async addPresupuesto(
    presupuestosData: Partial<Presupuesto>
  ): Promise<{ data: Presupuesto | null; error: any }> {
    const { data, error } = await this._supabaseClient
      .from('presupuesto_item')
      .insert({
        ...presupuestosData,
        responsable_id: '077cd8cc-72aa-4870-82f2-3ee619c24b12',
      })
      .select('*')
      .single();

    if (!error && data) {
      this.presupuestos.update((currentPresupuesto) => [
        ...currentPresupuesto,
        data,
      ]);
      this.addPresupuestoAsignado(data);
      this.addItem(data);
    }
    return { data, error };
  }
addPresupuestoAsignado(presupuestoItem: Presupuesto) {
  this.presupuestoAsignados.update((currentPresupuestos) => {
    const exists = currentPresupuestos.some(p => p.id === presupuestoItem.id);
    if (!exists) {
      return [...currentPresupuestos, presupuestoItem];
    }
    return currentPresupuestos;
  });
  console.log(this.presupuestoAsignados());
}
async asignarPresupuestoOC(orden_compra_id:number){
  try {
    const presupuestosParaAsignar=this.presupuestoAsignados()
    if (presupuestosParaAsignar.length===0){
            return { data: null, error: { message: 'No hay presupuestos para asignar' } };
    }
    const presupuestosIds= presupuestosParaAsignar.map(p=>p.id);
    const { data, error } = await this._supabaseClient
      .from('presupuesto_item')
      .update({ orden_compra_id: orden_compra_id })
      .in('id', presupuestosIds)
      .select('*');

      if (!error && data) {
      // Actualizar la signal de presupuestos con los datos actualizados
      this.presupuestos.update((currentPresupuestos) => {
        return currentPresupuestos.map(presupuesto => {
          const updated = data.find(d => d.id === presupuesto.id);
          return updated ? updated : presupuesto;
        });
      });

      // Limpiar los presupuestos asignados ya que fueron procesados
      this.clearPresupuestosAsignados();
    }

    return { data, error };
  } catch (error) {
    console.error('Error asignando presupuestos a OC:', error);
    return { data: null, error: error };
  }
}
clearPresupuestosAsignados() {
  this.presupuestoAsignados.set([]);
}
}
