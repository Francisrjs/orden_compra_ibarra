import { inject, Injectable, signal } from '@angular/core';
import { Factura } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { RemitoService } from './remito.service';
import { OrdenCompraService } from '../../orden-compra/services/orden-compra.service';

@Injectable({
  providedIn: 'root'
})
export class FacturaService extends StateService<Factura> {
  facturas = signal<Factura[]>([]);
  factura = signal<Factura | null>(null);
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private _remitoService = inject(RemitoService);
  private _ordenCompraService= inject(OrdenCompraService)
  /**
   * Carga una factura por ID con sus remitos
   */
  async getFacturaById(factura_id: number) {
    try {
      const { data, error } = await this._supabaseClient
        .from('facturas')
        .select('*, remitos(*)')
        .eq('id', factura_id)
        .single();

      if (!error && data) {
        this.factura.set(data);
        // Cargar los remitos en el servicio de remitos
        if (data.remitos) {
          this._remitoService.remitos.set(data.remitos);
          console.log(this.factura())
        }
      }

      return { data, error };
    } catch (err) {
      console.error('Error obteniendo factura:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Crea una nueva factura con sus remitos
   */
  async createFactura(facturaData: {
    orden_compra_id: number;
    numero_factura: string;
    fecha: string | Date;
    importe: number;
  }) {
    try {
      // 1. Crear la factura
      const { data: facturaCreada, error: facturaError } = await this._supabaseClient
        .from('facturas')
        .insert({
          orden_compra_id: facturaData.orden_compra_id,
          numero_factura: facturaData.numero_factura,
          fecha: facturaData.fecha instanceof Date ? facturaData.fecha.toISOString() : facturaData.fecha,
          importe: facturaData.importe
        })
        .select('*')
        .single();

      if (facturaError || !facturaCreada) {
        return {
          success: false,
          data: null,
          error: facturaError,
          message: 'Error al crear la factura: ' + facturaError?.message
        };
      }

      // 2. Guardar los remitos asociados
      let remitosResult = null;
      if (this._remitoService.remitos().length > 0) {
        remitosResult = await this._remitoService.saveRemitosChanges(facturaCreada.id);

        if (!remitosResult.success) {
          return {
            success: false,
            data: facturaCreada,
            error: remitosResult.error,
            message: 'Factura creada pero error al guardar remitos'
          };
        }
      }

      // 3. Actualizar signals
      this.factura.set(facturaCreada);
      this.facturas.update(facturas => [...facturas, facturaCreada]);
          this._ordenCompraService.ordenCompra.update(orden => {
      if (!orden) return orden;
      
      return {
        ...orden,
        facturas: [...(orden.facturas || []), facturaCreada]
      };
    });
      return {
        success: true,
        data: facturaCreada,
        error: null,
        message: 'Factura y remitos guardados correctamente'
      };

    } catch (err) {
      console.error('Error en createFactura:', err);
      return {
        success: false,
        data: null,
        error: err,
        message: 'Error inesperado al crear la factura'
      };
    }
  }

  /**
   * Actualiza una factura existente y sus remitos
   */
  async updateFactura(
    factura_id: number,
    facturaData: {
      numero_factura: string;
      fecha: string | Date;
      importe: number;
    }
  ) {
    try {
      // 1. Actualizar la factura
      const { data: facturaActualizada, error: facturaError } = await this._supabaseClient
        .from('facturas')
        .update({
          numero_factura: facturaData.numero_factura,
          fecha: facturaData.fecha instanceof Date ? facturaData.fecha.toISOString() : facturaData.fecha,
          importe: facturaData.importe
        })
        .eq('id', factura_id)
        .select('*')
        .single();

      if (facturaError || !facturaActualizada) {
        return {
          success: false,
          data: null,
          error: facturaError,
          message: 'Error al actualizar la factura: ' + facturaError?.message
        };
      }

      // 2. Guardar cambios en remitos (crear nuevos, eliminar marcados)
      const remitosResult = await this._remitoService.saveRemitosChanges(factura_id);

      if (!remitosResult.success) {
        console.log(remitosResult.data)
        return {
          success: false,
          data: facturaActualizada,
          error: remitosResult.error,
          message: 'Factura actualizada pero hubo errores con los remitos'
        };
        

      }

      // 3. Actualizar signals
      this.factura.set(facturaActualizada);
      this.facturas.update(facturas =>
        facturas.map(f => f.id === factura_id ? facturaActualizada : f)
      );
      this._ordenCompraService.ordenCompra.update(orden => {
      if (!orden) return orden;
      
      return {
        ...orden,
        facturas: orden.facturas?.map(f => 
          f.id === factura_id ? facturaActualizada : f
        ) || []
      };
    })
      return {
        success: true,
        data: facturaActualizada,
        error: null,
        message: 'Factura y remitos actualizados correctamente'
      };

    } catch (err) {
      console.error('Error en updateFactura:', err);
      return {
        success: false,
        data: null,
        error: err,
        message: 'Error inesperado al actualizar la factura'
      };
    }
  }

  /**
   * Elimina una factura y todos sus remitos asociados
   */
  async deleteFactura(factura_id: number) {
    try {
      // Supabase eliminará los remitos automáticamente si hay CASCADE configurado
      const { error } = await this._supabaseClient
        .from('facturas')
        .delete()
        .eq('id', factura_id);

      if (error) {
        return {
          success: false,
          error,
          message: 'Error al eliminar la factura: ' + error.message
        };
      }

      // Actualizar signals
      this.facturas.update(facturas => facturas.filter(f => f.id !== factura_id));
      if (this.factura()?.id === factura_id) {
        this.factura.set(null);
      }

      return {
        success: true,
        error: null,
        message: 'Factura eliminada correctamente'
      };

    } catch (err) {
      console.error('Error en deleteFactura:', err);
      return {
        success: false,
        error: err,
        message: 'Error inesperado al eliminar la factura'
      };
    }
  }

  /**
   * Carga una factura para edición
   */
  async loadFacturaForEdit(factura_id: number) {
    const result = await this.getFacturaById(factura_id);
    return result;
  }

  /**
   * Limpia las signals
   */
  clearFactura() {
    this.factura.set(null);
    this._remitoService.clearRemitos();
  }
  
}